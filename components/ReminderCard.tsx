import { Bell, CheckCircle2, XCircle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { MedicationReminder, ReminderStatus } from "@/types/medical";
import { ActionButton, Badge } from "./ui";

function statusTone(status: ReminderStatus) {
  if (status === "Taken") return "success";
  if (status === "Skipped") return "danger";
  return "warning";
}

export function ReminderCard({
  reminder,
  disabled,
  onTaken,
  onSkipped
}: {
  reminder: MedicationReminder;
  disabled: boolean;
  onTaken: () => void;
  onSkipped: () => void;
}) {
  return (
    <View style={[styles.card, disabled && styles.disabled]}>
      <View style={styles.topRow}>
        <View style={styles.icon}>
          <Bell size={19} color={colors.primaryDark} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{reminder.medicationName}</Text>
          <Text style={styles.meta}>
            {reminder.dosage} at {reminder.scheduledLabel} ({reminder.scheduledTime})
          </Text>
          <Text style={styles.meta}>
            {reminder.scheduledDate} - day {reminder.durationDay}
          </Text>
        </View>
        <Badge label={reminder.status} tone={statusTone(reminder.status)} />
      </View>

      {reminder.instructions ? <Text style={styles.instructions}>{reminder.instructions}</Text> : null}

      {reminder.status === "Pending" ? (
        <View style={styles.actions}>
          <ActionButton label="Taken" icon={CheckCircle2} tone="secondary" disabled={disabled} onPress={onTaken} />
          <ActionButton label="Skipped" icon={XCircle} tone="plain" disabled={disabled} onPress={onSkipped} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surfaceMuted
  },
  disabled: {
    opacity: 0.68
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  titleBlock: {
    flex: 1,
    minWidth: 180,
    gap: spacing.xs
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800"
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  instructions: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  }
});
