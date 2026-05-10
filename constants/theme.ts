import { Platform, StyleSheet } from "react-native";

export const colors = {
  background: "#F5F8FA",
  surface: "#FFFFFF",
  surfaceSoft: "#EDF6F5",
  ink: "#102A43",
  muted: "#52606D",
  subtle: "#829AB1",
  line: "#D9E2EC",
  primary: "#176B87",
  primaryDark: "#0B4F6C",
  primarySoft: "#D7F2F0",
  success: "#2F855A",
  successSoft: "#DCFCE7",
  warning: "#B7791F",
  warningSoft: "#FEF3C7",
  danger: "#C53030",
  dangerSoft: "#FEE2E2",
  info: "#2B6CB0",
  infoSoft: "#DBEAFE",
  neutralSoft: "#E6F0F2"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

export const radii = {
  sm: 6,
  md: 8,
  pill: 999
};

export const shadow = StyleSheet.create({
  card: {
    ...Platform.select({
      web: {
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)"
      },
      default: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2
      }
    })
  }
});
