import { useRouter } from "expo-router";
import { Check, Mic, Pause, Play, Send, ShieldCheck } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessDenied, LoadingGate } from "@/components/AccessDenied";
import { DoctorNavigation } from "@/components/DoctorNavigation";
import { DoctorNoteEditor } from "@/components/DoctorNoteEditor";
import { DoctorTopBar } from "@/components/DoctorTopBar";
import { TranscriptPreview } from "@/components/TranscriptPreview";
import { ActionButton, Badge, Card, PageHeader, SectionHeader } from "@/components/ui";
import { WarningBox } from "@/components/WarningBox";
import { colors, radii, shadow, spacing } from "@/constants/theme";
import { DEFAULT_PATIENT_ID } from "@/data/mockUsers";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useAuth } from "@/providers/AuthProvider";
import { requestStructuredSummary, sendAudioForTranscription } from "@/services/doctorAiClient";
import { generateMedicationReminders } from "@/services/reminderService";
import { MedicalSummary, TranscriptionResult } from "@/types/medical";
import { saveApprovedSummary, saveReminders } from "@/utils/storage";
import { canShareWithPatient, summaryReviewWarnings } from "@/utils/summaryValidation";

const waveformBars = [28, 44, 34, 62, 38, 72, 46, 58, 30, 66, 42, 52, 36, 60, 32, 48];

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [approved, setApproved] = useState(false);
  const [processError, setProcessError] = useState("");

  const reviewWarnings = useMemo(() => summaryReviewWarnings(summary, transcription), [summary, transcription]);
  const shareCheck = useMemo(() => canShareWithPatient(summary), [summary]);
  const patientUser = useMemo(() => users.find((candidate) => candidate.role === "patient") ?? null, [users]);
  const targetPatientId = patientUser?.patientId ?? patientUser?.id ?? DEFAULT_PATIENT_ID;
  const targetPatientName = patientUser?.name ?? "Ava Thompson";
  const isRecordingActive = recorder.status === "recording" || recorder.status === "paused" || recorder.status === "requesting-permission";
  const canShowReview = !!summary && !isRecordingActive && !isProcessing;

  useEffect(() => {
    if (recorder.status !== "recording") {
      return undefined;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [recorder.status]);

  const startRecording = async () => {
    setProcessError("");
    setApproved(false);
    setTranscription(null);
    setSummary(null);
    setElapsedSeconds(0);
    await recorder.startRecording();
  };

  const doneRecording = async () => {
    setProcessError("");
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

  const updateSummary = (next: MedicalSummary) => {
    setSummary(next);
    setApproved(false);
  };

  const finalizeSummary = async () => {
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
    router.push(`/doctor-patient/${targetPatientId}` as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={[styles.container, !isWide && styles.mobileContainer]}>
          <DoctorTopBar title="Recording" />
          {isWide ? <DoctorNavigation /> : null}

          {!isRecordingActive && !isProcessing && !summary ? (
            <View style={styles.startPanel}>
              <Text style={styles.startTitle}>Record consultation</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start recording"
                disabled={recorder.status === "requesting-permission"}
                onPress={startRecording}
                style={({ pressed }) => [styles.ovalRecordButton, pressed && styles.recordButtonPressed]}
              >
                <Mic size={24} color={colors.surface} />
                <Text style={styles.ovalRecordText}>Start recording</Text>
              </Pressable>
              <WarningBox title="Recording issue" warnings={recorder.errorMessage || processError ? [recorder.errorMessage || processError] : []} tone="danger" />
            </View>
          ) : null}

          {isRecordingActive ? (
            <View style={styles.memoPanel}>
              <Text style={styles.timer}>{formatDuration(elapsedSeconds)}</Text>
              <Text style={styles.recordingState}>
                {recorder.status === "requesting-permission" ? "Preparing microphone" : recorder.status === "paused" ? "Paused" : "Recording"}
              </Text>
              <View style={styles.waveform}>
                {waveformBars.map((height, index) => (
                  <View
                    key={`${height}-${index}`}
                    style={[
                      styles.waveBar,
                      { height },
                      recorder.status === "paused" && styles.waveBarPaused
                    ]}
                  />
                ))}
              </View>
              <View style={styles.memoControls}>
                {recorder.status === "paused" ? (
                  <Pressable accessibilityRole="button" onPress={recorder.resumeRecording} style={styles.roundControl}>
                    <Play size={24} color={colors.primaryDark} />
                    <Text style={styles.roundControlText}>Continue</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    disabled={recorder.status === "requesting-permission"}
                    onPress={recorder.pauseRecording}
                    style={[styles.roundControl, recorder.status === "requesting-permission" && styles.controlDisabled]}
                  >
                    <Pause size={24} color={colors.primaryDark} />
                    <Text style={styles.roundControlText}>Pause</Text>
                  </Pressable>
                )}

                <Pressable
                  accessibilityRole="button"
                  disabled={recorder.status === "requesting-permission"}
                  onPress={doneRecording}
                  style={[styles.doneControl, recorder.status === "requesting-permission" && styles.controlDisabled]}
                >
                  <Check size={26} color={colors.surface} />
                  <Text style={styles.doneControlText}>Done</Text>
                </Pressable>
              </View>
              {recorder.errorMessage ? <Text style={styles.errorText}>{recorder.errorMessage}</Text> : null}
            </View>
          ) : null}

          {isProcessing ? (
            <View style={styles.processingPanel}>
              <View style={styles.processingPulse}>
                <Mic size={26} color={colors.surface} />
              </View>
              <Text style={styles.processingTitle}>Generating clinical note</Text>
              <Text style={styles.processingText}>The recording is being transcribed and summarized for doctor review.</Text>
            </View>
          ) : null}

          {canShowReview ? (
            <>
              <PageHeader
                eyebrow="Doctor review"
                title="Check and finalize"
                description="Review the AI-generated result, edit anything needed, then finalize for this patient."
                right={<Badge label={`Recipient: ${targetPatientName}`} tone="neutral" />}
              />

              <TranscriptPreview transcription={transcription} />

              <Card style={styles.finalizeCard}>
                <SectionHeader
                  eyebrow="Finalize"
                  title="Doctor confirmation"
                  description="Finalizing saves the approved plan and opens the patient details page."
                />
                <View style={styles.approvalRow}>
                  <View style={styles.approvalIcon}>
                    <ShieldCheck size={24} color={colors.primaryDark} />
                  </View>
                  <View style={styles.approvalText}>
                    <Text style={styles.approvalTitle}>I reviewed and approve this summary.</Text>
                    <Text style={styles.approvalDescription}>Required medication fields must be complete before finalizing.</Text>
                  </View>
                  <Switch
                    value={approved}
                    disabled={!summary || !shareCheck.ok}
                    onValueChange={setApproved}
                    trackColor={{ false: colors.line, true: colors.primarySoft }}
                    thumbColor={approved ? colors.primary : colors.subtle}
                  />
                </View>
                <WarningBox title="Fix before finalizing" warnings={shareCheck.ok ? [] : shareCheck.reasons} tone="warning" />
                <ActionButton
                  label="Finalize"
                  icon={Send}
                  disabled={!summary || !approved || !shareCheck.ok}
                  onPress={finalizeSummary}
                />
              </Card>

              <DoctorNoteEditor summary={summary} reviewWarnings={reviewWarnings} onChange={updateSummary} />
            </>
          ) : null}
        </ScrollView>

        {!isWide ? <DoctorNavigation /> : null}
      </View>
    </SafeAreaView>
  );
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  shell: {
    flex: 1
  },
  container: {
    padding: spacing.xl,
    gap: spacing.xl,
    width: "100%",
    maxWidth: 980,
    alignSelf: "center"
  },
  mobileContainer: {
    paddingBottom: 112
  },
  startPanel: {
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl
  },
  ovalRecordButton: {
    ...shadow.soft,
    minWidth: 260,
    minHeight: 74,
    borderRadius: radii.pill,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.xl
  },
  recordButtonPressed: {
    transform: [{ scale: 0.96 }]
  },
  startTitle: {
    color: colors.ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    textAlign: "center"
  },
  ovalRecordText: {
    color: colors.surface,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900"
  },
  memoPanel: {
    minHeight: 480,
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xl
  },
  timer: {
    color: colors.ink,
    fontSize: 54,
    lineHeight: 62,
    fontWeight: "900"
  },
  recordingState: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "800"
  },
  waveform: {
    minHeight: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    width: "100%"
  },
  waveBar: {
    width: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.primary
  },
  waveBarPaused: {
    backgroundColor: colors.lineStrong
  },
  memoControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    flexWrap: "wrap"
  },
  roundControl: {
    width: 92,
    height: 92,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  roundControlText: {
    color: colors.primaryDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  doneControl: {
    width: 108,
    height: 108,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  doneControlText: {
    color: colors.surface,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900"
  },
  controlDisabled: {
    opacity: 0.45
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  processingPanel: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg
  },
  processingPulse: {
    width: 74,
    height: 74,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  processingTitle: {
    color: colors.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    textAlign: "center"
  },
  processingText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    textAlign: "center",
    maxWidth: 420
  },
  finalizeCard: {
    gap: spacing.lg
  },
  approvalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  approvalIcon: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
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
