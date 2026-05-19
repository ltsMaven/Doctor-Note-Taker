import { useFocusEffect, useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, CalendarDays, ClipboardCheck, Clock3, Mic, UsersRound } from "lucide-react-native";
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

const appointments = [
  { id: "appt-1", time: "09:30", patient: "Ava Thompson", reason: "Sinus follow-up" },
  { id: "appt-2", time: "11:00", patient: "New patient", reason: "Initial consult" },
  { id: "appt-3", time: "14:15", patient: "Remote review", reason: "Medication check" }
];

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const calendarDays = [
  { label: "26", outside: true },
  { label: "27", outside: true },
  { label: "28", outside: true },
  { label: "29", outside: true },
  { label: "30", outside: true },
  { label: "1" },
  { label: "2" },
  { label: "3" },
  { label: "4" },
  { label: "5" },
  { label: "6" },
  { label: "7" },
  { label: "8" },
  { label: "9" },
  { label: "10" },
  { label: "11" },
  { label: "12" },
  { label: "13" },
  { label: "14" },
  { label: "15" },
  { label: "16" },
  { label: "17" },
  { label: "18", hasAppointments: true },
  { label: "19", selected: true, hasAppointments: true },
  { label: "20", hasAppointments: true },
  { label: "21" },
  { label: "22" },
  { label: "23" },
  { label: "24" },
  { label: "25" },
  { label: "26" },
  { label: "27" },
  { label: "28" },
  { label: "29" },
  { label: "30" },
  { label: "31" }
];

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

          <Card style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View style={styles.calendarIcon}>
                <CalendarDays size={24} color={colors.sky} />
              </View>
              <View style={styles.calendarTitleBlock}>
                <Text style={styles.calendarTitle}>Appointments</Text>
                <Text style={styles.calendarMeta}>{appointments.length} appointments</Text>
              </View>
            </View>
            <View style={styles.monthCard}>
              <View style={styles.monthHeader}>
                <Pressable accessibilityRole="button" accessibilityLabel="Previous month" style={styles.monthButton}>
                  <ArrowLeft size={17} color={colors.muted} />
                </Pressable>
                <Text style={styles.monthTitle}>May 2026</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Next month" style={styles.monthButton}>
                  <ArrowRight size={17} color={colors.muted} />
                </Pressable>
              </View>
              <View style={styles.weekRow}>
                {weekDays.map((day) => (
                  <Text key={day} style={styles.weekDay}>
                    {day}
                  </Text>
                ))}
              </View>
              <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => (
                  <View
                    key={`${day.label}-${index}`}
                    style={[styles.dayCell, day.selected && styles.dayCellSelected]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        day.outside && styles.dayTextOutside,
                        day.selected && styles.dayTextSelected
                      ]}
                    >
                      {day.label}
                    </Text>
                    {day.hasAppointments ? <View style={[styles.dayDot, day.selected && styles.dayDotSelected]} /> : null}
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.appointmentList}>
              {appointments.map((appointment) => (
                <View key={appointment.id} style={styles.appointmentRow}>
                  <Text style={styles.appointmentTime}>{appointment.time}</Text>
                  <View style={styles.appointmentText}>
                    <Text style={styles.appointmentPatient}>{appointment.patient}</Text>
                    <Text style={styles.appointmentReason}>{appointment.reason}</Text>
                  </View>
                </View>
              ))}
            </View>
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
  },
  calendarCard: {
    gap: spacing.lg
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  calendarIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.skySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  calendarTitleBlock: {
    flex: 1,
    minWidth: 0
  },
  calendarTitle: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900"
  },
  calendarMeta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  monthCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.surface
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  monthButton: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  monthTitle: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900"
  },
  weekRow: {
    flexDirection: "row"
  },
  weekDay: {
    flex: 1,
    color: colors.subtle,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
    textAlign: "center",
    paddingVertical: spacing.xs
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    gap: 2
  },
  dayCellSelected: {
    backgroundColor: colors.primary
  },
  dayText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  dayTextOutside: {
    color: colors.subtle
  },
  dayTextSelected: {
    color: colors.surface
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.sky
  },
  dayDotSelected: {
    backgroundColor: colors.surface
  },
  appointmentList: {
    gap: spacing.md
  },
  appointmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted
  },
  appointmentTime: {
    color: colors.sky,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
    width: 58
  },
  appointmentText: {
    flex: 1,
    minWidth: 0
  },
  appointmentPatient: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900"
  },
  appointmentReason: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  }
});
