import { useRouter } from "expo-router";
import { LockKeyhole, LogIn } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing } from "@/constants/theme";
import { UserRole } from "@/types/auth";
import { ActionButton, Card, SectionHeader } from "./ui";

export function LoadingGate() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Checking session...</Text>
      </View>
    </SafeAreaView>
  );
}

export function AccessDenied({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const router = useRouter();
  const allowedLabel = allowedRoles.join(" or ");

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.icon}>
            <LockKeyhole size={28} color={colors.primaryDark} />
          </View>
          <SectionHeader
            eyebrow="Access restricted"
            title="This account cannot open this page"
            description={`Please switch to a ${allowedLabel} account to continue.`}
          />
          <ActionButton label="Go to Login" icon={LogIn} onPress={() => router.replace("/login")} />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: spacing.xl,
    gap: spacing.xl,
    width: "100%",
    maxWidth: 980,
    alignSelf: "center"
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl
  },
  loadingText: {
    color: colors.muted,
    fontSize: 16
  },
  card: {
    gap: spacing.lg,
    alignItems: "flex-start"
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  }
});
