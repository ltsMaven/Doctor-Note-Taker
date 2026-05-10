import { CalendarDays } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { FollowUp } from "@/types/medical";
import { Badge, Card, SectionHeader } from "./ui";

export function FollowUpCard({ followUp }: { followUp: FollowUp }) {
  return (
    <Card>
      <SectionHeader
        eyebrow="Follow-up"
        title={followUp.required ? "Follow-up needed" : "No routine follow-up listed"}
        right={<Badge label={followUp.required ? "Required" : "Not required"} tone={followUp.required ? "warning" : "neutral"} />}
      />
      <View style={styles.content}>
        <View style={styles.icon}>
          <CalendarDays size={24} color={colors.primaryDark} />
        </View>
        <View style={styles.textBlock}>
          {followUp.required && followUp.date ? <Text style={styles.date}>{followUp.date}</Text> : null}
          <Text style={styles.notes}>{followUp.notes || "Contact the clinic if your doctor advised further review."}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs
  },
  date: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800"
  },
  notes: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  }
});
