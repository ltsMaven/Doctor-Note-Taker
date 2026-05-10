import { CheckCircle2 } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { TaskInstruction } from "@/types/medical";
import { Card, SectionHeader } from "./ui";

export function PatientInstructionChecklist({ tasks }: { tasks: TaskInstruction[] }) {
  return (
    <Card>
      <SectionHeader eyebrow="Care plan" title="General instructions" />
      <View style={styles.list}>
        {tasks.map((task, index) => (
          <View key={`${task.task}-${index}`} style={styles.item}>
            <View style={styles.icon}>
              <CheckCircle2 size={19} color={colors.success} />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.task}>{task.task}</Text>
              <Text style={styles.details}>{task.details}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md
  },
  item: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs
  },
  task: {
    color: colors.ink,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800"
  },
  details: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  }
});
