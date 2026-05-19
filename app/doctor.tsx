import { useFocusEffect, useRouter } from "expo-router";
import { ArrowRight, ClipboardCheck, Clock3, Mic, UsersRound } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessDenied, LoadingGate } from "@/components/AccessDenied";
import { DoctorNavigation } from "@/components/DoctorNavigation";
import { DoctorTopBar } from "@/components/DoctorTopBar";
import { Badge, Card } from "@/components/ui";
import { colors, radii, shadow, spacing } from "@/constants/theme";
import { DEFAULT_PATIENT_ID } from "@/data/mockUsers";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { MedicalSummary, MedicationReminder, PatientDirectoryEntry } from "@/types/medical";
import { loadApprovedSummary, loadPatientDirectory, loadReminders } from "@/utils/storage";

export default function DoctorScreen() {
  const gate = useProtectedRoute(["doctor"]);

  if (gate.isLoading || !gate.user) {
    return <LoadingGate />;
  }

  if (!gate.hasAccess) {
    return <AccessDenied allowedRoles={gate.allowedRoles} />;
  }

  return <DoctorDashboard />;
}

function DoctorDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [patients, setPatients] = useState<PatientDirectoryEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      Promise.all([loadApprovedSummary(DEFAULT_PATIENT_ID), loadReminders(DEFAULT_PATIENT_ID), loadPatientDirectory()]).then(
        ([storedSummary, storedReminders, storedPatients]) => {
          if (isMounted) {
            setSummary(storedSummary);
            setReminders(storedReminders);
            setPatients(storedPatients);
          }
        }
      );

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const pendingReminders = reminders.filter((reminder) => reminder.status === "Pending").length;
  const approvedLabel = summary?.doctorApproved ? "Approved" : "No plan";

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={[styles.container, !isWide && styles.mobileContainer]}>
          <DoctorTopBar />

          {isWide ? <DoctorNavigation /> : null}

          <Card style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Mic size={30} color={colors.surface} />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Start a consultation note</Text>
              <Text style={styles.heroSubtitle}>Record, review, approve.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open recording"
              onPress={() => router.push("/doctor-record" as never)}
              style={styles.heroAction}
            >
              <ArrowRight size={24} color={colors.surface} />
            </Pressable>
          </Card>

          <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
            <MetricCard icon={UsersRound} label="Patients" value={`${patients.length}`} />
            <MetricCard icon={ClipboardCheck} label="Care plan" value={approvedLabel} tone={summary?.doctorApproved ? "success" : "neutral"} />
            <MetricCard icon={Clock3} label="Pending" value={`${pendingReminders}`} />
          </View>
        </ScrollView>

        {!isWide ? <DoctorNavigation /> : null}
      </View>
    </SafeAreaView>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "neutral"
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
  tone?: "success" | "neutral";
}) {
  return (
    <Card style={styles.metricCard}>
      <View style={styles.metricTop}>
        <View style={styles.metricIcon}>
          <Icon size={21} color={colors.primaryDark} />
        </View>
        {tone === "success" ? <Badge label="Live" tone="success" /> : null}
      </View>
      <Text style={styles.metricValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.metricLabel}>{label}</Text>
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
    maxWidth: 1120,
    alignSelf: "center"
  },
  mobileContainer: {
    paddingBottom: 112
  },
  heroCard: {
    minHeight: 220,
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
    gap: spacing.lg,
    justifyContent: "space-between",
    overflow: "hidden"
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  heroText: {
    gap: spacing.xs
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    maxWidth: 460
  },
  heroSubtitle: {
    color: colors.primarySoft,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700"
  },
  heroAction: {
    ...shadow.soft,
    width: 58,
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end"
  },
  statsGrid: {
    gap: spacing.lg
  },
  statsGridWide: {
    flexDirection: "row"
  },
  metricCard: {
    flex: 1,
    minHeight: 142,
    justifyContent: "space-between",
    gap: spacing.md
  },
  metricTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  metricValue: {
    color: colors.ink,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900"
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  }
});
