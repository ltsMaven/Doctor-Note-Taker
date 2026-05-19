import { useRouter } from "expo-router";
import { LogOut, Stethoscope } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";

export function DoctorTopBar({ title = "Welcome back" }: { title?: string }) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <View style={styles.topRow}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Stethoscope size={24} color={colors.surface} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.kicker}>{title}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name}
          </Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Sign out" onPress={handleSignOut} style={styles.iconButton}>
        <LogOut size={20} color={colors.primaryDark} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.lg
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
    minWidth: 0
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  textBlock: {
    flex: 1,
    minWidth: 0
  },
  kicker: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  name: {
    color: colors.ink,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900"
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "#E7EDF5",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  }
});
