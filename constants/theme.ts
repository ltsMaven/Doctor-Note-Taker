import { Platform, StyleSheet } from "react-native";

export const colors = {
  background: "#F7F9FC",
  backgroundAlt: "#EFF6F4",
  surface: "#FFFFFF",
  surfaceSoft: "#F1F7F6",
  surfaceMuted: "#F8FAFC",
  ink: "#172033",
  muted: "#53627A",
  subtle: "#8A97AA",
  line: "#DDE5EF",
  lineStrong: "#C7D2E1",
  primary: "#087E8B",
  primaryDark: "#07535D",
  primarySoft: "#DDF4F1",
  accent: "#5B5F97",
  accentSoft: "#EDEEFF",
  success: "#217A54",
  successSoft: "#E4F8ED",
  warning: "#9A650E",
  warningSoft: "#FFF4D6",
  danger: "#B42318",
  dangerSoft: "#FFE8E5",
  info: "#2563A8",
  infoSoft: "#E6F0FF",
  neutralSoft: "#EEF3F8"
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
        boxShadow: "0 14px 40px rgba(23, 32, 51, 0.08)"
      },
      default: {
        shadowColor: "#172033",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 2
      }
    })
  },
  soft: {
    ...Platform.select({
      web: {
        boxShadow: "0 8px 24px rgba(23, 32, 51, 0.06)"
      },
      default: {
        shadowColor: "#172033",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 1
      }
    })
  }
});
