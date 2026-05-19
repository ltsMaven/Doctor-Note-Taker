import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AccessDenied, LoadingGate } from "@/components/AccessDenied";
import { DoctorNavigation } from "@/components/DoctorNavigation";
import { DoctorTopBar } from "@/components/DoctorTopBar";
import { Badge, Card, PageHeader } from "@/components/ui";
import { colors, radii, spacing } from "@/constants/theme";
import { DOCTOR_APPOINTMENTS, MAY_2026_CALENDAR_DAYS, WEEK_DAYS } from "@/data/mockAppointments";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function DoctorAppointmentsScreen() {
  const gate = useProtectedRoute(["doctor"]);

  if (gate.isLoading || !gate.user) {
    return <LoadingGate />;
  }

  if (!gate.hasAccess) {
    return <AccessDenied allowedRoles={gate.allowedRoles} />;
  }

  return <DoctorAppointmentsContent />;
}

function DoctorAppointmentsContent() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.shell}>
        <ScrollView contentContainerStyle={[styles.container, !isWide && styles.mobileContainer]}>
          <DoctorTopBar title="Appointments" />
          {isWide ? <DoctorNavigation /> : null}

          <PageHeader
            title="Appointments"
            description="Calendar view and today’s scheduled consultations."
            right={<Badge label={`${DOCTOR_APPOINTMENTS.length} today`} tone="info" />}
          />

          <View style={[styles.grid, isWide && styles.gridWide]}>
            <Card style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <View style={styles.calendarIcon}>
                  <CalendarDays size={24} color={colors.sky} />
                </View>
                <View style={styles.calendarTitleBlock}>
                  <Text style={styles.calendarTitle}>May 2026</Text>
                  <Text style={styles.calendarMeta}>Selected: May 19</Text>
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
                  {WEEK_DAYS.map((day) => (
                    <Text key={day} style={styles.weekDay}>
                      {day}
                    </Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {MAY_2026_CALENDAR_DAYS.map((day, index) => (
                    <View key={`${day.label}-${index}`} style={[styles.dayCell, day.selected && styles.dayCellSelected]}>
                      <Text style={[styles.dayText, day.outside && styles.dayTextOutside, day.selected && styles.dayTextSelected]}>
                        {day.label}
                      </Text>
                      {day.hasAppointments ? <View style={[styles.dayDot, day.selected && styles.dayDotSelected]} /> : null}
                    </View>
                  ))}
                </View>
              </View>
            </Card>

            <Card style={styles.appointmentsCard}>
              <Text style={styles.listTitle}>Today</Text>
              <View style={styles.appointmentList}>
                {DOCTOR_APPOINTMENTS.map((appointment) => (
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
    maxWidth: 1120,
    alignSelf: "center"
  },
  mobileContainer: {
    paddingBottom: 112
  },
  grid: {
    gap: spacing.lg
  },
  gridWide: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  calendarCard: {
    flex: 1,
    gap: spacing.lg
  },
  appointmentsCard: {
    flex: 1,
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
  listTitle: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900"
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
