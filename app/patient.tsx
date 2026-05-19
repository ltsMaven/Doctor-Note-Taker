import { useFocusEffect, useRouter } from "expo-router";
import { BellOff, Stethoscope, UserRound } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessDenied, LoadingGate } from "@/components/AccessDenied";
import { FollowUpCard } from "@/components/FollowUpCard";
import { MedicationTable } from "@/components/MedicationTable";
import { PatientInstructionChecklist } from "@/components/PatientInstructionChecklist";
import { ReminderList } from "@/components/ReminderList";
import { SessionBar } from "@/components/SessionBar";
import { ActionButton, Badge, Card, PageHeader, SectionHeader } from "@/components/ui";
import { WarningBox } from "@/components/WarningBox";
import { colors, radii, spacing } from "@/constants/theme";
import { DEFAULT_PATIENT_ID } from "@/data/mockUsers";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useAuth } from "@/providers/AuthProvider";
import { generateMedicationReminders } from "@/services/reminderService";
import { MedicalSummary, MedicationReminder, ReminderStatus } from "@/types/medical";
import {
  loadApprovedSummary,
  loadReminders,
  loadRemindersEnabled,
  saveReminders,
  saveRemindersEnabled
} from "@/utils/storage";

export default function PatientScreen() {
  const gate = useProtectedRoute(["doctor", "patient"]);

  if (gate.isLoading || !gate.user) {
    return <LoadingGate />;
  }

  if (!gate.hasAccess) {
    return <AccessDenied allowedRoles={gate.allowedRoles} />;
  }

  return <PatientContent />;
}

function PatientContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 960;
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const patientId = useMemo(() => {
    if (user?.role === "patient") {
      return user.patientId ?? user.id;
    }

    return DEFAULT_PATIENT_ID;
  }, [user]);

  const loadPatientData = useCallback(async () => {
    setLoading(true);
    const storedSummary = await loadApprovedSummary(patientId);
    const enabled = await loadRemindersEnabled(patientId);
    setRemindersEnabled(enabled);

    if (!storedSummary?.doctorApproved) {
      setSummary(null);
      setReminders([]);
      setLoading(false);
      return;
    }

    const storedReminders = await loadReminders(patientId);
    const nextReminders = storedReminders.length > 0 ? storedReminders : generateMedicationReminders(storedSummary.medications);

    setSummary(storedSummary);
    setReminders(nextReminders);
    await saveReminders(nextReminders, patientId);
    setLoading(false);
  }, [patientId]);

  useFocusEffect(
    useCallback(() => {
      loadPatientData();
    }, [loadPatientData])
  );

  const updateReminderStatus = async (id: string, status: ReminderStatus) => {
    const nextReminders = reminders.map((reminder) => (reminder.id === id ? { ...reminder, status } : reminder));
    setReminders(nextReminders);
    await saveReminders(nextReminders, patientId);
  };

  const toggleReminders = async (enabled: boolean) => {
    setRemindersEnabled(enabled);
    await saveRemindersEnabled(enabled, patientId);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading patient instructions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!summary) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.container}>
          <SessionBar />
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <UserRound size={30} color={colors.primaryDark} />
            </View>
            <SectionHeader
              eyebrow="Patient UI"
              title="No approved summary yet"
              description="This patient can only see instructions after the doctor reviews and sends the generated summary."
            />
            {user?.role === "doctor" ? (
              <ActionButton label="Go to Doctor UI" icon={Stethoscope} onPress={() => router.push("/doctor")} />
            ) : null}
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          eyebrow="Patient instructions"
          title="Your care plan"
          description={`Plain-language instructions reviewed by your doctor${summary.patientName ? ` for ${summary.patientName}` : ""}.`}
          right={<Badge label="Doctor approved" tone="success" />}
        />

        <SessionBar />

        <Card>
          <SectionHeader eyebrow="Summary" title="What this means" />
          <Text style={styles.summaryText}>{summary.patientSummary}</Text>
          {summary.approvedAt ? <Text style={styles.approvedAt}>Approved: {new Date(summary.approvedAt).toLocaleString()}</Text> : null}
        </Card>

        <MedicationTable medications={summary.medications} />

        <View style={[styles.grid, isWide && styles.gridWide]}>
          <PatientInstructionChecklist tasks={summary.tasks} />
          <FollowUpCard followUp={summary.followUp} />
        </View>

        <WarningBox title="Warnings and important notes" warnings={summary.warnings} tone="danger" />

        <Card>
          <SectionHeader
            eyebrow="Reminder settings"
            title="Medication reminders"
            description="You can turn reminders on or off. Status history stays visible."
          />
          <View style={styles.reminderToggle}>
            <View style={styles.toggleIcon}>
              <BellOff size={21} color={colors.primaryDark} />
            </View>
            <View style={styles.toggleTextBlock}>
              <Text style={styles.toggleTitle}>{remindersEnabled ? "Reminders enabled" : "Reminders disabled"}</Text>
              <Text style={styles.toggleText}>Generated from the reviewed medication table.</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={toggleReminders}
              trackColor={{ false: colors.line, true: colors.primarySoft }}
              thumbColor={remindersEnabled ? colors.primary : colors.subtle}
            />
          </View>
        </Card>

        <ReminderList reminders={reminders} enabled={remindersEnabled} onUpdateStatus={updateReminderStatus} />
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl
  },
  loadingText: {
    color: colors.muted,
    fontSize: 16
  },
  summaryText: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 28
  },
  approvedAt: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.md
  },
  grid: {
    gap: spacing.lg
  },
  gridWide: {
    flexDirection: "row",
    alignItems: "stretch"
  },
  reminderToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  toggleIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  toggleTextBlock: {
    flex: 1,
    gap: spacing.xs
  },
  toggleTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  toggleText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  emptyCard: {
    alignItems: "flex-start",
    gap: spacing.lg
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  }
});
