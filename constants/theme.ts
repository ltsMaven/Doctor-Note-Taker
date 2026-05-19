import { Platform, StyleSheet } from "react-native";

export const colors = {
  background: "#F6F8FA",
  backgroundAlt: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceSoft: "#F2FBFA",
  surfaceMuted: "#F8FAFC",
  ink: "#111827",
  muted: "#475569",
  subtle: "#64748B",
  line: "#E2E8F0",
  lineStrong: "#CBD5E1",
  primary: "#0F8B8D",
  primaryDark: "#075E63",
  primaryDeep: "#064E52",
  primarySoft: "#E6F7F8",
  primaryLight: "#DDF7F4",
  accent: "#5B5F97",
  accentSoft: "#EDEEFF",
  coral: "#E76F51",
  coralSoft: "#FFEDE8",
  sky: "#2F80ED",
  skySoft: "#E8F2FF",
  success: "#217A54",
  successSoft: "#E4F8ED",
  warning: "#9A650E",
  warningSoft: "#FFF4D6",
  danger: "#DC2626",
  dangerDark: "#C62828",
  dangerSoft: "#FEE2E2",
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
  lg: 18,
  xl: 24,
  pill: 999
};

export const shadow = StyleSheet.create({
  card: {
    ...Platform.select({
      web: {
        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)"
      },
      default: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 2
      }
    })
  },
  soft: {
    ...Platform.select({
      web: {
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.07)"
      },
      default: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 1
      }
    })
  },
  floating: {
    ...Platform.select({
      web: {
        boxShadow: "0 18px 44px rgba(15, 23, 42, 0.14)"
      },
      default: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 4
      }
    })
  }
});
