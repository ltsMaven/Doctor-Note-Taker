import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessDenied, LoadingGate } from "@/components/AccessDenied";
import { DoctorNavigation } from "@/components/DoctorNavigation";
import { DoctorTopBar } from "@/components/DoctorTopBar";
import { FollowUpCard } from "@/components/FollowUpCard";
import { MedicationTable } from "@/components/MedicationTable";
import { PatientInstructionChecklist } from "@/components/PatientInstructionChecklist";
import { Badge, Card, PageHeader, SectionHeader } from "@/components/ui";
import { WarningBox } from "@/components/WarningBox";
import { colors, spacing } from "@/constants/theme";
import { DEFAULT_PATIENT_ID } from "@/data/mockUsers";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { MedicalSummary, MedicationReminder, PatientIntakeProfile } from "@/types/medical";
import { loadApprovedSummary, loadPatientIntake, loadReminders } from "@/utils/storage";

export default function DoctorPatientDetailScreen() {
  const gate = useProtectedRoute(["doctor"]);

  if (gate.isLoading || !gate.user) {
    return <LoadingGate />;
  }

  if (!gate.hasAccess) {
    return <AccessDenied allowedRoles={gate.allowedRoles} />;
  }

  return <DoctorPatientDetailContent />;
}

function DoctorPatientDetailContent() {
  const { patientId } = useLocalSearchParams<{ patientId?: string }>();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const resolvedPatientId = Array.isArray(patientId) ? patientId[0] : patientId ?? DEFAULT_PATIENT_ID;
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [intake, setIntake] = useState<PatientIntakeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      setLoading(true);

      Promise.all([loadApprovedSummary(resolvedPatientId), loadReminders(resolvedPatientId), loadPatientIntake(resolvedPatientId)]).then(
        ([storedSummary, storedReminders, storedIntake]) => {
          if (isMounted) {
            setSummary(storedSummary);
            setReminders(storedReminders);
            setIntake(storedIntake);
            setLoading(false);
          }
        }
      );

      return () => {
        isMounted = false;
      };
    }, [resolvedPatientId])
  );

  const pendingCount = reminders.filter((reminder) => reminder.status === "Pending").length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={[styles.container, !isWide && styles.mobileContainer]}>
          <DoctorTopBar title="Patient details" />

          <PageHeader
            title={summary?.patientName ?? intake?.name ?? "Patient details"}
            description={summary?.doctorApproved ? "Doctor-approved medical information for this patient." : "No approved medical summary is available yet."}
            right={<Badge label={summary?.doctorApproved ? "Approved" : "Draft only"} tone={summary?.doctorApproved ? "success" : "neutral"} />}
          />
          {isWide ? <DoctorNavigation /> : null}

          {loading ? (
            <Card>
              <Text style={styles.emptyText}>Loading patient details...</Text>
            </Card>
          ) : (
            <>
              {intake ? (
                <Card>
                  <SectionHeader eyebrow="Patient intake" title="What the doctor should know" />
                  <View style={styles.intakeGrid}>
                    <View style={styles.intakeStat}>
                      <Text style={styles.intakeValue}>{intake.age}</Text>
                      <Text style={styles.intakeLabel}>Age</Text>
                    </View>
                    <View style={styles.intakeStat}>
                      <Text style={styles.intakeValue}>{intake.sex}</Text>
                      <Text style={styles.intakeLabel}>Sex</Text>
                    </View>
                    <View style={styles.intakeStat}>
                      <Text style={styles.intakeValue}>{intake.dateOfBirth}</Text>
                      <Text style={styles.intakeLabel}>DOB</Text>
                    </View>
                  </View>
                  {intake.symptoms ? (
                    <View style={styles.noteBlock}>
                      <Text style={styles.noteTitle}>Symptoms</Text>
                      <Text style={styles.summaryText}>{intake.symptoms}</Text>
                    </View>
                  ) : null}
                  {intake.doctorNotes ? (
                    <View style={styles.noteBlock}>
                      <Text style={styles.noteTitle}>Extra notes</Text>
                      <Text style={styles.summaryText}>{intake.doctorNotes}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.metaText}>Unique ID: {intake.patientId}</Text>
                </Card>
              ) : null}

              {summary ? (
                <>
              <Card>
                <SectionHeader eyebrow="Summary" title="Medical summary" />
                <Text style={styles.summaryText}>{summary.patientSummary}</Text>
                {summary.approvedAt ? <Text style={styles.metaText}>Approved: {new Date(summary.approvedAt).toLocaleString()}</Text> : null}
              </Card>

              <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
                <InfoCard label="Medications" value={`${summary.medications.length}`} />
                <InfoCard label="Care tasks" value={`${summary.tasks.length}`} />
                <InfoCard label="Pending reminders" value={`${pendingCount}`} />
              </View>

              <MedicationTable medications={summary.medications} />

              <View style={[styles.detailGrid, isWide && styles.detailGridWide]}>
                <PatientInstructionChecklist tasks={summary.tasks} />
                <FollowUpCard followUp={summary.followUp} />
              </View>

              <WarningBox title="Warnings and important notes" warnings={summary.warnings} tone="danger" />

              <Card>
                <SectionHeader eyebrow="Reminders" title="Medication reminder status" />
                <View style={styles.reminderList}>
                  {reminders.length > 0 ? (
                    reminders.slice(0, 12).map((reminder) => (
                      <View key={reminder.id} style={styles.reminderRow}>
                        <View>
                          <Text style={styles.reminderName}>{reminder.medicationName}</Text>
                          <Text style={styles.metaText}>
                            {reminder.scheduledDate} at {reminder.scheduledTime}
                          </Text>
                        </View>
                        <Badge
                          label={reminder.status}
                          tone={reminder.status === "Taken" ? "success" : reminder.status === "Skipped" ? "danger" : "warning"}
                        />
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No reminders generated for this patient.</Text>
                  )}
                </View>
              </Card>
                </>
              ) : (
                <Card>
                  <SectionHeader title="No approved summary" description="Record and send a reviewed plan before medical details appear here." />
                </Card>
              )}
            </>
          )}
        </ScrollView>

        {!isWide ? <DoctorNavigation /> : null}
      </View>
    </SafeAreaView>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.infoCard}>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </Card>
  );
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
    maxWidth: 1180,
    alignSelf: "center"
  },
  mobileContainer: {
    paddingBottom: 112
  },
  summaryText: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 26
  },
  intakeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.md
  },
  intakeStat: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs
  },
  intakeValue: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900"
  },
  intakeLabel: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  noteBlock: {
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  noteTitle: {
    color: colors.primaryDark,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900"
  },
  metaText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  statsGrid: {
    gap: spacing.lg
  },
  statsGridWide: {
    flexDirection: "row"
  },
  detailGrid: {
    gap: spacing.lg
  },
  detailGridWide: {
    flexDirection: "row",
    alignItems: "stretch"
  },
  infoCard: {
    flex: 1,
    gap: spacing.xs
  },
  infoValue: {
    color: colors.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900"
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  },
  reminderList: {
    gap: spacing.md
  },
  reminderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted
  },
  reminderName: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900"
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  }
});
