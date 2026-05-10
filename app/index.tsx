import { useRouter } from "expo-router";
import { Bell, ClipboardCheck, LogIn, Stethoscope, UserRound } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";
import { SessionBar } from "@/components/SessionBar";
import { ActionButton, Card, SectionHeader } from "@/components/ui";
import { SafetyDisclaimer } from "@/components/WarningBox";
import { useAuth } from "@/providers/AuthProvider";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const canOpenDoctor = user?.role === "doctor";
  const canOpenPatient = !!user;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Stethoscope size={28} color={colors.surface} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Doctor Note Taker</Text>
            <Text style={styles.subtitle}>
              Record a consultation explanation, turn it into reviewed patient instructions, and create medication reminders.
            </Text>
          </View>
        </View>

        <SafetyDisclaimer />
        {user ? <SessionBar /> : null}

        {!user ? (
          <Card style={styles.loginCard}>
            <SectionHeader
              eyebrow="Session required"
              title="Sign in to continue"
              description="Use the demo doctor or patient account. Switching users later requires the selected account's PIN."
            />
            <ActionButton label="Open Login" icon={LogIn} onPress={() => router.push("/login")} />
          </Card>
        ) : null}

        <View style={[styles.grid, isWide && styles.gridWide]}>
          <Card style={styles.routeCard}>
            <SectionHeader
              eyebrow="Doctor UI"
              title="Record and review"
              description="Capture the spoken explanation, generate a structured draft, edit it, then approve it before sharing."
            />
            <View style={styles.iconLine}>
              <ClipboardCheck size={22} color={colors.primaryDark} />
              <Text style={styles.iconText}>Approval is required before the patient can view a summary.</Text>
            </View>
            <ActionButton
              label={canOpenDoctor ? "Open Doctor UI" : "Doctor account required"}
              icon={Stethoscope}
              disabled={!canOpenDoctor}
              onPress={() => router.push("/doctor")}
            />
          </Card>

          <Card style={styles.routeCard}>
            <SectionHeader
              eyebrow="Patient UI"
              title="Instructions and reminders"
              description="Show plain-language instructions, medication tables, follow-up details, and reminder status."
            />
            <View style={styles.iconLine}>
              <Bell size={22} color={colors.primaryDark} />
              <Text style={styles.iconText}>Medication reminders are generated from reviewed medication times.</Text>
            </View>
            <ActionButton
              label={canOpenPatient ? "Open Patient UI" : "Sign in required"}
              icon={UserRound}
              tone="secondary"
              disabled={!canOpenPatient}
              onPress={() => router.push("/patient")}
            />
          </Card>
        </View>
      </ScrollView>
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
    maxWidth: 1120,
    alignSelf: "center"
  },
  header: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "center"
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  headerText: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 25
  },
  grid: {
    gap: spacing.lg
  },
  gridWide: {
    flexDirection: "row"
  },
  routeCard: {
    flex: 1,
    gap: spacing.lg
  },
  loginCard: {
    gap: spacing.lg
  },
  iconLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  iconText: {
    color: colors.muted,
    flex: 1,
    fontSize: 15,
    lineHeight: 22
  }
});
