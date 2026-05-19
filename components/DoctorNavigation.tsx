import { usePathname, useRouter } from "expo-router";
import { Home, Mic, UsersRound } from "lucide-react-native";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { colors, radii, shadow, spacing } from "@/constants/theme";

const items = [
  { href: "/doctor", label: "Home", icon: Home },
  { href: "/doctor-record", label: "Record", icon: Mic },
  { href: "/doctor-patients", label: "Patients", icon: UsersRound }
] as const;

export function DoctorNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;

  return (
    <View style={[isWide ? styles.navbar : styles.footbar, shadow.soft]}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Pressable
            key={item.href}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => router.push(item.href as never)}
            style={[styles.item, active && styles.itemActive, isWide && styles.itemWide]}
          >
            <Icon size={22} color={active ? colors.surface : colors.primaryDark} />
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    alignSelf: "center",
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E7EDF5"
  },
  footbar: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E7EDF5"
  },
  item: {
    flex: 1,
    minHeight: 54,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: spacing.sm
  },
  itemWide: {
    flex: 0,
    minWidth: 124,
    flexDirection: "row",
    gap: spacing.sm
  },
  itemActive: {
    backgroundColor: colors.primary
  },
  label: {
    color: colors.primaryDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  labelActive: {
    color: colors.surface
  }
});
