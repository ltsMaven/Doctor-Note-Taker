import { useRouter } from "expo-router";
import { CalendarDays, LogOut, ShieldCheck, Stethoscope } from "lucide-react-native";
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
          <View style={styles.statusChip}>
            <ShieldCheck size={13} color={colors.primaryDark} />
            <Text style={styles.statusText}>Ready for consultation</Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View appointments"
          onPress={() => router.push("/doctor-appointments" as never)}
          style={styles.iconButton}
        >
          <CalendarDays size={20} color={colors.primaryDark} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign out" onPress={handleSignOut} style={styles.iconButton}>
          <LogOut size={20} color={colors.primaryDark} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.lg,
    paddingTop: spacing.xs
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
    minWidth: 0
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center"
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    gap: 3
  },
  kicker: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  name: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900"
  },
  statusChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "#BFEAEC",
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  statusText: {
    color: colors.primaryDark,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900"
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  }
});
