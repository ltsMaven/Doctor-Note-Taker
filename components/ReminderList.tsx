import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { MedicationReminder, ReminderStatus } from "@/types/medical";
import { Badge, Card, SectionHeader } from "./ui";
import { ReminderCard } from "./ReminderCard";

function countByStatus(reminders: MedicationReminder[], status: ReminderStatus) {
  return reminders.filter((reminder) => reminder.status === status).length;
}

export function ReminderList({
  reminders,
  enabled,
  onUpdateStatus
}: {
  reminders: MedicationReminder[];
  enabled: boolean;
  onUpdateStatus: (id: string, status: ReminderStatus) => void;
}) {
  const visibleReminders = reminders.slice(0, 18);
  const hiddenCount = Math.max(0, reminders.length - visibleReminders.length);

  return (
    <Card>
      <SectionHeader
        eyebrow="Reminders"
        title="Upcoming medication reminders"
        description="Mark each reminder when the medication is taken or skipped."
      />
      <View style={styles.stats}>
        <Badge label={`${countByStatus(reminders, "Pending")} Pending`} tone="warning" />
        <Badge label={`${countByStatus(reminders, "Taken")} Taken`} tone="success" />
        <Badge label={`${countByStatus(reminders, "Skipped")} Skipped`} tone="danger" />
      </View>
      {!enabled ? <Text style={styles.disabledText}>Reminders are currently disabled.</Text> : null}
      <View style={styles.list}>
        {visibleReminders.length > 0 ? (
          visibleReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              disabled={!enabled}
              onTaken={() => onUpdateStatus(reminder.id, "Taken")}
              onSkipped={() => onUpdateStatus(reminder.id, "Skipped")}
            />
          ))
        ) : (
          <Text style={styles.empty}>No scheduled medication reminders were generated.</Text>
        )}
      </View>
      {hiddenCount > 0 ? <Text style={styles.hiddenText}>{hiddenCount} more reminders are scheduled after this list.</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  list: {
    gap: spacing.md
  },
  disabledText: {
    color: colors.warning,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
    fontWeight: "700"
  },
  empty: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  hiddenText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.md
  }
});
