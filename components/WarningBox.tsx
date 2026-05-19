import { AlertTriangle, Info } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";

export function WarningBox({
  title,
  warnings,
  tone = "warning"
}: {
  title: string;
  warnings: string[];
  tone?: "warning" | "danger" | "info";
}) {
  if (warnings.length === 0) {
    return null;
  }

  const Icon = tone === "info" ? Info : AlertTriangle;

  return (
    <View
      style={[
        styles.container,
        tone === "warning" && styles.warning,
        tone === "danger" && styles.danger,
        tone === "info" && styles.info
      ]}
    >
      <View style={styles.header}>
        <Icon
          size={20}
          color={tone === "danger" ? colors.danger : tone === "info" ? colors.info : colors.warning}
        />
        <Text
          style={[
            styles.title,
            tone === "danger" && styles.dangerText,
            tone === "info" && styles.infoText
          ]}
        >
          {title}
        </Text>
      </View>
      <View style={styles.list}>
        {warnings.map((warning) => (
          <Text key={warning} style={styles.item}>
            {warning}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function SafetyDisclaimer() {
  return (
    <WarningBox
      title="Clinical safety notice"
      tone="info"
      warnings={[
        "This summary is generated to support communication and must be reviewed by a qualified doctor before being used by a patient."
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: "#FDE68A"
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderColor: "#FECACA"
  },
  info: {
    backgroundColor: colors.infoSoft,
    borderColor: "#BFD7FF"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  title: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: "800",
    flex: 1
  },
  dangerText: {
    color: colors.danger
  },
  infoText: {
    color: colors.info
  },
  list: {
    gap: spacing.sm
  },
  item: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  }
});
