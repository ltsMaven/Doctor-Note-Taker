import { useRouter } from "expo-router";
import { ClipboardCheck, RefreshCw, Send, ShieldCheck } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessDenied, LoadingGate } from "@/components/AccessDenied";
import { DoctorNoteEditor } from "@/components/DoctorNoteEditor";
import { RecordButton } from "@/components/RecordButton";
import { RecordingStatus } from "@/components/RecordingStatus";
import { SessionBar } from "@/components/SessionBar";
import { TranscriptPreview } from "@/components/TranscriptPreview";
import { ActionButton, Badge, Card, PageHeader, SectionHeader } from "@/components/ui";
import { SafetyDisclaimer, WarningBox } from "@/components/WarningBox";
import { colors, spacing } from "@/constants/theme";
import { DEFAULT_PATIENT_ID } from "@/data/mockUsers";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useAuth } from "@/providers/AuthProvider";
import { requestStructuredSummary, sendAudioForTranscription } from "@/services/doctorAiClient";
import { generateMedicationReminders } from "@/services/reminderService";
import { MedicalSummary, TranscriptionResult } from "@/types/medical";
import { saveApprovedSummary, saveReminders } from "@/utils/storage";
import { canShareWithPatient, summaryReviewWarnings } from "@/utils/summaryValidation";

export default function DoctorScreen() {
  const gate = useProtectedRoute(["doctor"]);

  if (gate.isLoading || !gate.user) {
    return <LoadingGate />;
  }

  if (!gate.hasAccess) {
    return <AccessDenied allowedRoles={gate.allowedRoles} />;
  }

  return <DoctorContent />;
}

function DoctorContent() {
  const router = useRouter();
  const { users } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 960;
  const recorder = useAudioRecorder();
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [approved, setApproved] = useState(false);
  const [sent, setSent] = useState(false);
  const [processError, setProcessError] = useState("");

  const reviewWarnings = useMemo(() => summaryReviewWarnings(summary, transcription), [summary, transcription]);
  const shareCheck = useMemo(() => canShareWithPatient(summary), [summary]);
  const patientUser = useMemo(
    () => users.find((candidate) => candidate.role === "patient") ?? null,
    [users]
  );
  const targetPatientId = patientUser?.patientId ?? patientUser?.id ?? DEFAULT_PATIENT_ID;
  const targetPatientName = patientUser?.name ?? "Ava Thompson";

  const startRecording = async () => {
    setProcessError("");
    setSent(false);
    setApproved(false);
    setTranscription(null);
    setSummary(null);
    await recorder.startRecording();
  };

  const stopAndProcess = async () => {
    setProcessError("");
    setSent(false);
    setApproved(false);
    setIsProcessing(true);

    try {
      const audio = await recorder.stopRecording();
      const transcriptResult = await sendAudioForTranscription(audio);
      setTranscription(transcriptResult);
      const generatedSummary = await requestStructuredSummary(transcriptResult.transcript);
      setSummary(generatedSummary);
    } catch {
      setProcessError("The backend AI pipeline failed. Please try recording again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    recorder.resetRecording();
    setTranscription(null);
    setSummary(null);
    setApproved(false);
    setSent(false);
    setProcessError("");
  };

  const updateSummary = (next: MedicalSummary) => {
    setSummary(next);
    setApproved(false);
    setSent(false);
  };

  const sendToPatient = async () => {
    if (!summary || !approved || !shareCheck.ok) {
      return;
    }

    const approvedSummary: MedicalSummary = {
      ...summary,
      patientId: targetPatientId,
      patientName: targetPatientName,
      doctorApproved: true,
      approvedAt: new Date().toISOString(),
      reviewNotes: reviewWarnings
    };
    const reminders = generateMedicationReminders(approvedSummary.medications);

    await saveApprovedSummary(approvedSummary);
    await saveReminders(reminders, targetPatientId);
    setSummary(approvedSummary);
    setSent(true);
    router.push("/patient");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          eyebrow="Doctor workspace"
          title="Review before sharing"
          description="Record the consultation, refine the AI draft, and approve a clear set of patient instructions."
          right={
            <View style={styles.headerMeta}>
              <Badge label={sent ? "Sent to patient" : "Draft only"} tone={sent ? "success" : "neutral"} />
              <Text style={styles.recipient}>Recipient: {targetPatientName}</Text>
            </View>
          }
        />

        <SafetyDisclaimer />
        <SessionBar />

        <View style={[styles.grid, isWide && styles.gridWide]}>
          <Card style={styles.recordCard}>
            <SectionHeader
              eyebrow="Recording"
              title="Consultation audio"
              description="Capture the doctor explanation and convert it into a structured draft."
            />
            <RecordingStatus status={recorder.status} mode={recorder.mode} errorMessage={recorder.errorMessage} />
            <RecordButton
              status={recorder.status}
              isProcessing={isProcessing}
              onStart={startRecording}
              onStop={stopAndProcess}
            />
            <ActionButton label="Reset flow" icon={RefreshCw} tone="plain" onPress={reset} />
            {isProcessing ? (
              <View style={styles.processingBox}>
                <Text style={styles.processingTitle}>Processing transcript and summary</Text>
                <Text style={styles.processingText}>
                  Audio is being sent to the backend. The backend uses OpenAI when configured and falls back to mock data without API keys.
                </Text>
              </View>
            ) : null}
            <WarningBox title="Processing issue" warnings={processError ? [processError] : []} tone="danger" />
          </Card>

          <Card style={styles.approvalCard}>
            <SectionHeader
              eyebrow="Approval"
              title="Doctor gate"
              description="Patients only see notes after this review step is complete."
            />
            <View style={styles.approvalRow}>
              <View style={styles.approvalIcon}>
                <ShieldCheck size={24} color={colors.primaryDark} />
              </View>
              <View style={styles.approvalText}>
                <Text style={styles.approvalTitle}>I reviewed and approve this summary for the patient.</Text>
                <Text style={styles.approvalDescription}>
                  Approval is disabled until the generated content exists and required medication fields are complete.
                </Text>
              </View>
              <Switch
                value={approved}
                disabled={!summary || !shareCheck.ok}
                onValueChange={setApproved}
                trackColor={{ false: colors.line, true: colors.primarySoft }}
                thumbColor={approved ? colors.primary : colors.subtle}
              />
            </View>
            <WarningBox title="Fix before sending" warnings={shareCheck.ok ? [] : shareCheck.reasons} tone="warning" />
            <ActionButton
              label="Send to Patient"
              icon={Send}
              disabled={!summary || !approved || !shareCheck.ok}
              onPress={sendToPatient}
            />
            <ActionButton
              label="View Patient UI"
              icon={ClipboardCheck}
              tone="secondary"
              onPress={() => router.push("/patient")}
            />
          </Card>
        </View>

        <TranscriptPreview transcription={transcription} />

        {summary ? <DoctorNoteEditor summary={summary} reviewWarnings={reviewWarnings} onChange={updateSummary} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: spacing.xl,
    gap: spacing.xl,
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center"
  },
  headerMeta: {
    gap: spacing.sm,
    alignItems: "flex-start"
  },
  recipient: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  grid: {
    gap: spacing.lg
  },
  gridWide: {
    flexDirection: "row",
    alignItems: "stretch"
  },
  recordCard: {
    flex: 1,
    gap: spacing.lg
  },
  approvalCard: {
    flex: 1,
    gap: spacing.lg
  },
  processingBox: {
    backgroundColor: colors.infoSoft,
    borderColor: "#BFD7FF",
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.lg,
    gap: spacing.xs
  },
  processingTitle: {
    color: colors.info,
    fontSize: 16,
    fontWeight: "800"
  },
  processingText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20
  },
  approvalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  approvalIcon: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  approvalText: {
    flex: 1,
    gap: spacing.xs
  },
  approvalTitle: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800"
  },
  approvalDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  }
});
