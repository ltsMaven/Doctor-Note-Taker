import { LucideIcon } from "lucide-react-native";
import { ReactNode } from "react";
import {
  ActivityIndicator,
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
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
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
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg
  },
  button: {
    minHeight: 46,
    borderRadius: radii.md,
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
    borderColor: colors.primary
  },
  buttonSecondary: {
    backgroundColor: colors.primarySoft,
    borderColor: "#B7E4E0"
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
    fontWeight: "700"
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
    borderColor: "#BFD7FF"
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
    backgroundColor: colors.neutralSoft,
    borderColor: colors.line
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700"
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
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800"
  },
  description: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: spacing.xs
  }
});
