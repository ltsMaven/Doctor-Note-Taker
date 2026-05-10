import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { Medication, NEEDS_DOCTOR_REVIEW } from "@/types/medical";
import { medicationMissingFields } from "@/utils/summaryValidation";
import { Badge, Card, SectionHeader } from "./ui";

const columns = [
  { key: "name", label: "Medication name", width: 160 },
  { key: "dosage", label: "Dosage", width: 130 },
  { key: "frequency", label: "Frequency", width: 140 },
  { key: "times", label: "Time to take", width: 170 },
  { key: "duration", label: "Duration", width: 120 },
  { key: "instructions", label: "Special instructions", width: 260 }
] as const;

function displayValue(value: string | string[]) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : NEEDS_DOCTOR_REVIEW;
  }

  return value.trim() ? value : NEEDS_DOCTOR_REVIEW;
}

export function MedicationTable({ medications }: { medications: Medication[] }) {
  return (
    <Card>
      <SectionHeader
        eyebrow="Medication"
        title="Medication schedule"
        description="Follow this table exactly as reviewed by the doctor."
      />
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            {columns.map((column) => (
              <Text key={column.key} style={[styles.headerCell, { width: column.width }]}>
                {column.label}
              </Text>
            ))}
          </View>
          {medications.map((medication, index) => {
            const missing = medicationMissingFields(medication);

            return (
              <View key={`${medication.name}-${index}`} style={styles.dataBlock}>
                <View style={styles.row}>
                  {columns.map((column) => {
                    const value = displayValue(medication[column.key]);
                    const needsReview = value === NEEDS_DOCTOR_REVIEW;

                    return (
                      <Text
                        key={`${column.key}-${index}`}
                        style={[styles.cell, needsReview && styles.reviewCell, { width: column.width }]}
                      >
                        {value}
                      </Text>
                    );
                  })}
                </View>
                {missing.length > 0 ? (
                  <Badge label={`Needs doctor review: ${missing.join(", ")}`} tone="warning" style={styles.badge} />
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    overflow: "hidden"
  },
  row: {
    flexDirection: "row"
  },
  headerRow: {
    backgroundColor: colors.neutralSoft
  },
  headerCell: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    padding: spacing.md,
    borderRightWidth: 1,
    borderColor: colors.line
  },
  dataBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  cell: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    padding: spacing.md,
    borderRightWidth: 1,
    borderColor: colors.line
  },
  reviewCell: {
    color: colors.warning,
    fontWeight: "800"
  },
  badge: {
    margin: spacing.md
  }
});
