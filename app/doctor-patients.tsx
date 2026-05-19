import { useFocusEffect, useRouter } from "expo-router";
import { ArrowRight, ClipboardCheck, Clock3, Plus, UserRound } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessDenied, LoadingGate } from "@/components/AccessDenied";
import { DoctorNavigation } from "@/components/DoctorNavigation";
import { DoctorTopBar } from "@/components/DoctorTopBar";
import { ActionButton, Badge, Card, FieldLabel, inputStyles, PageHeader, SectionHeader } from "@/components/ui";
import { colors, radii, spacing } from "@/constants/theme";
import { DEFAULT_PATIENT_ID } from "@/data/mockUsers";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { MedicalSummary, MedicationReminder, PatientDirectoryEntry, PatientIntakeProfile } from "@/types/medical";
import { loadApprovedSummary, loadPatientDirectory, loadPatientIntake, loadReminders, upsertPatientDirectoryEntry } from "@/utils/storage";

type PatientRow = PatientDirectoryEntry & {
  summary: MedicalSummary | null;
  reminders: MedicationReminder[];
  intake: PatientIntakeProfile | null;
};

export default function DoctorPatientsScreen() {
  const gate = useProtectedRoute(["doctor"]);

  if (gate.isLoading || !gate.user) {
    return <LoadingGate />;
  }

  if (!gate.hasAccess) {
    return <AccessDenied allowedRoles={gate.allowedRoles} />;
  }

  return <DoctorPatientsContent />;
}

function DoctorPatientsContent() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [patientId, setPatientId] = useState("");
  const [error, setError] = useState("");

  const loadPatients = useCallback(async () => {
    const entries = await loadPatientDirectory();
    const rows = await Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        summary: await loadApprovedSummary(entry.patientId),
        reminders: await loadReminders(entry.patientId),
        intake: await loadPatientIntake(entry.patientId)
      }))
    );
    setPatients(rows);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, [loadPatients])
  );

  const addPatient = async () => {
    const nextId = patientId.trim();
    setError("");

    if (!nextId) {
      setError("Enter a patient unique ID.");
      return;
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(nextId)) {
      setError("Use only letters, numbers, dashes, or underscores.");
      return;
    }

    await upsertPatientDirectoryEntry({
      patientId: nextId,
      displayName: nextId === DEFAULT_PATIENT_ID ? "Ava Thompson" : `Patient ${nextId}`,
      addedAt: new Date().toISOString()
    });
    setPatientId("");
    await loadPatients();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={[styles.container, !isWide && styles.mobileContainer]}>
          <DoctorTopBar title="Patients" />

          <PageHeader title="Patients" right={<Badge label={`${patients.length} unique IDs`} tone="neutral" />} />
          {isWide ? <DoctorNavigation /> : null}

          <Card style={styles.newPatientCard}>
            <SectionHeader
              eyebrow="New Patient"
              title="Add by unique ID"
              description="Create a patient slot or open records later when a care plan is approved."
            />
            <View style={styles.addRow}>
              <View style={styles.inputWrap}>
                <FieldLabel>Patient unique ID</FieldLabel>
                <TextInput
                  value={patientId}
                  onChangeText={(value) => {
                    setPatientId(value);
                    setError("");
                  }}
                  autoCapitalize="none"
                  placeholder="patient-unique-id"
                  placeholderTextColor={colors.subtle}
                  style={inputStyles.input}
                />
              </View>
              <ActionButton label="Add" icon={Plus} onPress={addPatient} />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </Card>

          <View style={styles.patientList}>
            {patients.map((patient) => {
              const pendingReminders = patient.reminders.filter((reminder) => reminder.status === "Pending").length;
              const displayName = patient.summary?.patientName ?? patient.intake?.name ?? patient.displayName;

              return (
                <Card key={patient.patientId} style={styles.patientCard}>
                  <View style={styles.patientIcon}>
                    <UserRound size={26} color={colors.primaryDark} />
                  </View>
                  <View style={styles.patientText}>
                    <Text style={styles.patientName}>{displayName}</Text>
                    <Text style={styles.patientMeta}>Unique ID: {patient.patientId}</Text>
                    {patient.intake ? (
                      <Text style={styles.patientMeta}>
                        {patient.intake.age} years - {patient.intake.sex}
                      </Text>
                    ) : null}
                    <View style={styles.statRow}>
                      <View style={styles.stat}>
                        <ClipboardCheck size={16} color={colors.primaryDark} />
                        <Text style={styles.statText}>{patient.summary?.medications.length ?? 0} meds</Text>
                      </View>
                      <View style={styles.stat}>
                        <Clock3 size={16} color={colors.primaryDark} />
                        <Text style={styles.statText}>{pendingReminders} pending</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${displayName}`}
                    onPress={() => router.push(`/doctor-patient/${patient.patientId}` as never)}
                    style={styles.openButton}
                  >
                    <ArrowRight size={22} color={colors.surface} />
                  </Pressable>
                </Card>
              );
            })}
          </View>
        </ScrollView>

        {!isWide ? <DoctorNavigation /> : null}
      </View>
    </SafeAreaView>
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
    maxWidth: 980,
    alignSelf: "center"
  },
  mobileContainer: {
    paddingBottom: 112
  },
  newPatientCard: {
    gap: spacing.lg
  },
  addRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  inputWrap: {
    flex: 1,
    minWidth: 220
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800"
  },
  patientList: {
    gap: spacing.lg
  },
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg
  },
  patientIcon: {
    width: 58,
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  patientText: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs
  },
  patientName: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900"
  },
  patientMeta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  statText: {
    color: colors.primaryDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  openButton: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  }
});
