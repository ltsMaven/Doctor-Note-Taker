import { useRouter } from "expo-router";
import { Bell, CalendarCheck, LogIn, Pill, UserRound } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton, Card, PageHeader, SectionHeader } from "@/components/ui";
import { SafetyDisclaimer } from "@/components/WarningBox";
import { colors, spacing } from "@/constants/theme";

export default function PatientLandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          eyebrow="Patient view"
          title="View your care plan"
          description="See doctor-approved instructions, medication details, follow-up notes, and reminder status."
          right={
            <View style={styles.logo}>
              <UserRound size={28} color={colors.surface} />
            </View>
          }
        />

        <SafetyDisclaimer />

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Patient flow"
            title="What you can see"
            description="The patient account only displays information after the doctor has reviewed and sent it."
          />

          <View style={styles.featureList}>
            <View style={styles.featureRow}>
              <Pill size={21} color={colors.primaryDark} />
              <Text style={styles.featureText}>Read plain-language medication instructions.</Text>
            </View>
            <View style={styles.featureRow}>
              <CalendarCheck size={21} color={colors.primaryDark} />
              <Text style={styles.featureText}>Check follow-up details and care tasks.</Text>
            </View>
            <View style={styles.featureRow}>
              <Bell size={21} color={colors.primaryDark} />
              <Text style={styles.featureText}>Review generated medication reminders and mark their status.</Text>
            </View>
          </View>

          <ActionButton
            label="Sign in as Patient"
            icon={LogIn}
            tone="secondary"
            onPress={() => router.push("/login?userId=patient-ava")}
          />
        </Card>
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
    maxWidth: 980,
    alignSelf: "center"
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    gap: spacing.lg
  },
  featureList: {
    gap: spacing.md
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  featureText: {
    color: colors.muted,
    flex: 1,
    fontSize: 15,
    lineHeight: 22
  }
});
