import { LucideIcon } from "lucide-react-native";
import { ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle
} from "react-native";
import { colors, radii, shadow, spacing } from "@/constants/theme";

type ButtonTone = "primary" | "secondary" | "danger" | "plain";

type ActionButtonProps = PressableProps & {
  label: string;
  icon?: LucideIcon;
  tone?: ButtonTone;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, shadow.card, style]}>{children}</View>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  right,
  style
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pageHeader, shadow.soft, style]}>
      <View style={styles.pageAccent} />
      <View style={styles.pageText}>
        {eyebrow ? <Text style={styles.pageEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.pageTitle}>{title}</Text>
        {description ? <Text style={styles.pageDescription}>{description}</Text> : null}
      </View>
      {right ? <View style={styles.pageRight}>{right}</View> : null}
    </View>
  );
}

export function ActionButton({
  label,
  icon: Icon,
  tone = "primary",
  loading = false,
  disabled,
  style,
  ...props
}: ActionButtonProps) {
  const buttonStyle = [
    styles.button,
    tone === "primary" && styles.buttonPrimary,
    tone === "secondary" && styles.buttonSecondary,
    tone === "danger" && styles.buttonDanger,
    tone === "plain" && styles.buttonPlain,
    disabled && styles.buttonDisabled,
    style
  ];
  const textStyle = [
    styles.buttonText,
    tone === "secondary" && styles.secondaryText,
    tone === "plain" && styles.plainText,
    disabled && styles.disabledText
  ];
  const iconColor = tone === "secondary" || tone === "plain" ? colors.primaryDark : colors.surface;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [buttonStyle, pressed && !disabled && styles.buttonPressed]}
      {...props}
    >
      {loading ? <ActivityIndicator color={iconColor} /> : Icon ? <Icon size={19} color={iconColor} /> : null}
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

export function Badge({
  label,
  tone = "info",
  style
}: {
  label: string;
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.badge,
        tone === "info" && styles.badgeInfo,
        tone === "success" && styles.badgeSuccess,
        tone === "warning" && styles.badgeWarning,
        tone === "danger" && styles.badgeDanger,
        tone === "neutral" && styles.badgeNeutral,
        style
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          tone === "info" && styles.badgeTextInfo,
          tone === "success" && styles.badgeTextSuccess,
          tone === "warning" && styles.badgeTextWarning,
          tone === "danger" && styles.badgeTextDanger,
          tone === "neutral" && styles.badgeTextNeutral
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  right
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {right ? <View style={styles.sectionRight}>{right}</View> : null}
    </View>
  );
}

export function FieldLabel({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.fieldLabel, style]}>{children}</Text>;
}

export const inputStyles = StyleSheet.create({
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    color: colors.ink,
    backgroundColor: colors.surface,
    fontSize: 16,
    lineHeight: 22
  },
  multiline: {
    minHeight: 92,
    textAlignVertical: "top"
  }
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.xl
  },
  pageHeader: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.lg,
    overflow: "hidden"
  },
  pageAccent: {
    width: 6,
    alignSelf: "stretch",
    borderRadius: radii.pill,
    backgroundColor: colors.primary
  },
  pageText: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 220
  },
  pageRight: {
    alignItems: "flex-start"
  },
  pageEyebrow: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0
  },
  pageTitle: {
    color: colors.ink,
    fontSize: Platform.select({ web: 34, default: 29 }),
    lineHeight: Platform.select({ web: 40, default: 35 }),
    fontWeight: "900"
  },
  pageDescription: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 760
  },
  button: {
    minHeight: 52,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark
  },
  buttonSecondary: {
    backgroundColor: colors.primarySoft,
    borderColor: "#BFEAEC"
  },
  buttonDanger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger
  },
  buttonPlain: {
    backgroundColor: colors.surface,
    borderColor: colors.line
  },
  buttonDisabled: {
    backgroundColor: "#E5EAF0",
    borderColor: "#D3DCE6"
  },
  buttonPressed: {
    opacity: 0.88
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "900"
  },
  secondaryText: {
    color: colors.primaryDark
  },
  plainText: {
    color: colors.primaryDark
  },
  disabledText: {
    color: colors.subtle
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1
  },
  badgeInfo: {
    backgroundColor: colors.infoSoft,
    borderColor: "#BED4F7"
  },
  badgeSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: "#BBF7D0"
  },
  badgeWarning: {
    backgroundColor: colors.warningSoft,
    borderColor: "#FDE68A"
  },
  badgeDanger: {
    backgroundColor: colors.dangerSoft,
    borderColor: "#FECACA"
  },
  badgeNeutral: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.line
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  badgeTextInfo: {
    color: colors.info
  },
  badgeTextSuccess: {
    color: colors.success
  },
  badgeTextWarning: {
    color: colors.warning
  },
  badgeTextDanger: {
    color: colors.danger
  },
  badgeTextNeutral: {
    color: colors.muted
  },
  sectionHeader: {
    gap: spacing.md,
    marginBottom: spacing.md
  },
  sectionHeaderText: {
    gap: spacing.xs,
    flex: 1
  },
  sectionRight: {
    alignItems: "flex-start"
  },
  eyebrow: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900"
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  fieldLabel: {
    color: colors.primaryDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0
  }
});
