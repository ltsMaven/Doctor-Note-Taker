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
  const workflowSteps = ["Record", "Review", "Approve", "Send"];

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={[styles.container, !isWide && styles.mobileContainer]}>
          <DoctorTopBar />

          {isWide ? <DoctorNavigation /> : null}

          <Card style={styles.heroCard}>
            <View style={styles.heroOrbLarge} />
            <View style={styles.heroOrbSmall} />
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Mic size={30} color={colors.surface} />
              </View>
              <Badge label="Secure consultation note" tone="neutral" style={styles.heroBadge} />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Start a consultation note</Text>
              <Text style={styles.heroSubtitle}>Record the visit, review the AI summary, and approve patient-ready instructions.</Text>
            </View>
            <View style={styles.workflowRow}>
              {workflowSteps.map((step, index) => (
                <View key={step} style={styles.workflowItemWrap}>
                  <View style={styles.workflowItem}>
                    <Text style={styles.workflowText}>{step}</Text>
                  </View>
                  {index < workflowSteps.length - 1 ? <View style={styles.workflowConnector} /> : null}
                </View>
              ))}
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
            <MetricCard icon={UsersRound} label="Patients" value={`${patients.length}`} detail="active profiles" />
            <MetricCard
              icon={ClipboardCheck}
              label="Care plans"
              value={approvedLabel}
              detail={summary?.doctorApproved ? "Patient-ready summary" : "No approved plan yet"}
              tone={summary?.doctorApproved ? "success" : "neutral"}
            />
            <MetricCard icon={Clock3} label="Pending reminders" value={`${pendingReminders}`} detail="awaiting patient action" />
          </View>

          <Card style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View>
                <Text style={styles.overviewEyebrow}>Today's overview</Text>
                <Text style={styles.overviewTitle}>{summary?.doctorApproved ? "Patient-ready summary available" : "No consultation notes yet"}</Text>
              </View>
              <Badge label={summary?.doctorApproved ? "Care plan live" : "Care plan pending"} tone={summary?.doctorApproved ? "success" : "neutral"} />
            </View>
            <Text style={styles.overviewText}>
              {summary?.doctorApproved
                ? "The latest approved plan is ready for patient review with medication reminders attached."
                : "Start a recording to generate the first patient summary, then review and approve it before sharing."}
            </Text>
          </Card>
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
  detail,
  tone = "neutral"
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
  detail: string;
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
      <Text style={styles.metricDetail}>{detail}</Text>
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
    minHeight: 260,
    backgroundColor: colors.primaryDeep,
    borderColor: colors.primaryDark,
    gap: spacing.lg,
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative"
  },
  heroOrbLarge: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -70,
    top: -80,
    backgroundColor: "rgba(255,255,255,0.09)"
  },
  heroOrbSmall: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    right: 46,
    bottom: 48,
    backgroundColor: "rgba(15,139,141,0.28)"
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  heroBadge: {
    backgroundColor: colors.surface,
    borderColor: "rgba(255,255,255,0.18)"
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
    color: "#DDF7F4",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700"
  },
  workflowRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  workflowItemWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  workflowItem: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: spacing.md,
    paddingVertical: 7
  },
  workflowText: {
    color: colors.surface,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  workflowConnector: {
    width: 12,
    height: 2,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.36)"
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
    minHeight: 154,
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
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
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
    fontWeight: "900"
  },
  metricDetail: {
    color: colors.subtle,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700"
  },
  overviewCard: {
    gap: spacing.md
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  overviewEyebrow: {
    color: colors.primaryDark,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  overviewTitle: {
    color: colors.ink,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900"
  },
  overviewText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 720
  }
});
