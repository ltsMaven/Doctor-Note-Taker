import { Plus, Trash2 } from "lucide-react-native";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { MedicalSummary, NEEDS_DOCTOR_REVIEW } from "@/types/medical";
import { medicationMissingFields } from "@/utils/summaryValidation";
import { ActionButton, Card, FieldLabel, inputStyles, SectionHeader } from "./ui";
import { WarningBox } from "./WarningBox";

type DoctorNoteEditorProps = {
  summary: MedicalSummary;
  reviewWarnings: string[];
  onChange: (summary: MedicalSummary) => void;
};

export function DoctorNoteEditor({ summary, reviewWarnings, onChange }: DoctorNoteEditorProps) {
  const update = (patch: Partial<MedicalSummary>) => onChange({ ...summary, ...patch, doctorApproved: false });

  const updateTask = (index: number, key: "task" | "details", value: string) => {
    const tasks = summary.tasks.map((task, taskIndex) => (taskIndex === index ? { ...task, [key]: value } : task));
    update({ tasks });
  };

  const updateMedication = (index: number, key: string, value: string) => {
    const medications = summary.medications.map((medication, medicationIndex) => {
      if (medicationIndex !== index) {
        return medication;
      }

      if (key === "times") {
        return {
          ...medication,
          times: value
            .split(",")
            .map((time) => time.trim())
            .filter(Boolean)
        };
      }

      return { ...medication, [key]: value };
    });

    update({ medications });
  };

  const updateWarning = (index: number, value: string) => {
    const warnings = summary.warnings.map((warning, warningIndex) => (warningIndex === index ? value : warning));
    update({ warnings });
  };

  return (
    <Card>
      <SectionHeader
        eyebrow="Doctor review"
        title="Edit and approve patient instructions"
        description="AI-generated text stays in draft until the doctor reviews every section and sends it to the patient."
      />

      <View style={styles.stack}>
        <WarningBox title="Review before sharing" warnings={reviewWarnings} />

        <View>
          <FieldLabel>Plain-language patient summary</FieldLabel>
          <TextInput
            value={summary.patientSummary}
            onChangeText={(patientSummary) => update({ patientSummary })}
            multiline
            style={[inputStyles.input, inputStyles.multiline]}
          />
        </View>

        <View style={styles.editorSection}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>What the patient needs to do</Text>
            <ActionButton
              label="Add task"
              icon={Plus}
              tone="plain"
              onPress={() => update({ tasks: [...summary.tasks, { task: "", details: "" }] })}
            />
          </View>
          <View style={styles.stack}>
            {summary.tasks.map((task, index) => (
              <View key={`${task.task}-${index}`} style={styles.group}>
                <View style={styles.inlineHeader}>
                  <Text style={styles.groupTitle}>Task {index + 1}</Text>
                  <ActionButton
                    label="Remove"
                    icon={Trash2}
                    tone="plain"
                    onPress={() => update({ tasks: summary.tasks.filter((_, taskIndex) => taskIndex !== index) })}
                  />
                </View>
                <FieldLabel>Task</FieldLabel>
                <TextInput
                  value={task.task}
                  onChangeText={(value) => updateTask(index, "task", value)}
                  placeholder="Drink more water"
                  placeholderTextColor={colors.subtle}
                  style={inputStyles.input}
                />
                <FieldLabel style={styles.fieldSpacing}>Details</FieldLabel>
                <TextInput
                  value={task.details}
                  onChangeText={(value) => updateTask(index, "details", value)}
                  placeholder="Aim for 2 litres per day unless otherwise advised"
                  placeholderTextColor={colors.subtle}
                  multiline
                  style={[inputStyles.input, inputStyles.multiline]}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.editorSection}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>Prescription and medication schedule</Text>
            <ActionButton
              label="Add medication"
              icon={Plus}
              tone="plain"
              onPress={() =>
                update({
                  medications: [
                    ...summary.medications,
                    {
                      name: "",
                      dosage: NEEDS_DOCTOR_REVIEW,
                      frequency: NEEDS_DOCTOR_REVIEW,
                      times: [],
                      duration: NEEDS_DOCTOR_REVIEW,
                      instructions: NEEDS_DOCTOR_REVIEW
                    }
                  ]
                })
              }
            />
          </View>

          <View style={styles.stack}>
            {summary.medications.map((medication, index) => {
              const missing = medicationMissingFields(medication);

              return (
                <View key={`${medication.name}-${index}`} style={styles.group}>
                  <View style={styles.inlineHeader}>
                    <View style={styles.groupTitleBlock}>
                      <Text style={styles.groupTitle}>Medication {index + 1}</Text>
                      {missing.length > 0 ? <Text style={styles.reviewText}>Needs doctor review: {missing.join(", ")}</Text> : null}
                    </View>
                    <ActionButton
                      label="Remove"
                      icon={Trash2}
                      tone="plain"
                      onPress={() =>
                        update({
                          medications: summary.medications.filter((_, medicationIndex) => medicationIndex !== index)
                        })
                      }
                    />
                  </View>

                  <View style={styles.grid}>
                    <View style={styles.gridItem}>
                      <FieldLabel>Medication name</FieldLabel>
                      <TextInput
                        value={medication.name}
                        onChangeText={(value) => updateMedication(index, "name", value)}
                        placeholder="Amoxicillin"
                        placeholderTextColor={colors.subtle}
                        style={inputStyles.input}
                      />
                    </View>
                    <View style={styles.gridItem}>
                      <FieldLabel>Dosage</FieldLabel>
                      <TextInput
                        value={medication.dosage}
                        onChangeText={(value) => updateMedication(index, "dosage", value)}
                        placeholder="500mg"
                        placeholderTextColor={colors.subtle}
                        style={inputStyles.input}
                      />
                    </View>
                    <View style={styles.gridItem}>
                      <FieldLabel>Frequency</FieldLabel>
                      <TextInput
                        value={medication.frequency}
                        onChangeText={(value) => updateMedication(index, "frequency", value)}
                        placeholder="Twice daily"
                        placeholderTextColor={colors.subtle}
                        style={inputStyles.input}
                      />
                    </View>
                    <View style={styles.gridItem}>
                      <FieldLabel>Time to take</FieldLabel>
                      <TextInput
                        value={medication.times.join(", ")}
                        onChangeText={(value) => updateMedication(index, "times", value)}
                        placeholder="Morning, Night"
                        placeholderTextColor={colors.subtle}
                        style={inputStyles.input}
                      />
                    </View>
                    <View style={styles.gridItem}>
                      <FieldLabel>Duration</FieldLabel>
                      <TextInput
                        value={medication.duration}
                        onChangeText={(value) => updateMedication(index, "duration", value)}
                        placeholder="7 days"
                        placeholderTextColor={colors.subtle}
                        style={inputStyles.input}
                      />
                    </View>
                  </View>

                  <FieldLabel style={styles.fieldSpacing}>Special instructions</FieldLabel>
                  <TextInput
                    value={medication.instructions}
                    onChangeText={(value) => updateMedication(index, "instructions", value)}
                    multiline
                    placeholder="Take after food"
                    placeholderTextColor={colors.subtle}
                    style={[inputStyles.input, inputStyles.multiline]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.editorSection}>
          <Text style={styles.sectionLabel}>Follow-up instructions</Text>
          <View style={styles.group}>
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Follow-up required</Text>
              <Switch
                value={summary.followUp.required}
                onValueChange={(required) => update({ followUp: { ...summary.followUp, required } })}
                trackColor={{ false: colors.line, true: colors.primarySoft }}
                thumbColor={summary.followUp.required ? colors.primary : colors.subtle}
              />
            </View>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <FieldLabel>Follow-up date</FieldLabel>
                <TextInput
                  value={summary.followUp.date}
                  onChangeText={(date) => update({ followUp: { ...summary.followUp, date } })}
                  placeholder="2026-05-20"
                  placeholderTextColor={colors.subtle}
                  style={inputStyles.input}
                />
              </View>
            </View>
            <FieldLabel style={styles.fieldSpacing}>Follow-up notes</FieldLabel>
            <TextInput
              value={summary.followUp.notes}
              onChangeText={(notes) => update({ followUp: { ...summary.followUp, notes } })}
              multiline
              style={[inputStyles.input, inputStyles.multiline]}
            />
          </View>
        </View>

        <View style={styles.editorSection}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>Warnings or important notes</Text>
            <ActionButton
              label="Add warning"
              icon={Plus}
              tone="plain"
              onPress={() => update({ warnings: [...summary.warnings, ""] })}
            />
          </View>
          <View style={styles.stack}>
            {summary.warnings.map((warning, index) => (
              <View key={`${warning}-${index}`} style={styles.warningRow}>
                <TextInput
                  value={warning}
                  onChangeText={(value) => updateWarning(index, value)}
                  multiline
                  style={[inputStyles.input, styles.warningInput]}
                />
                <ActionButton
                  label="Remove"
                  icon={Trash2}
                  tone="plain"
                  onPress={() => update({ warnings: summary.warnings.filter((_, warningIndex) => warningIndex !== index) })}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg
  },
  editorSection: {
    gap: spacing.md
  },
  sectionLabel: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    flex: 1
  },
  group: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: "#FBFDFE"
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  groupTitleBlock: {
    flex: 1,
    minWidth: 220
  },
  groupTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  reviewText: {
    color: colors.warning,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: 220
  },
  fieldSpacing: {
    marginTop: spacing.sm
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  switchText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700"
  },
  warningRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
    flexWrap: "wrap"
  },
  warningInput: {
    flex: 1,
    minWidth: 240
  }
});
