import { useRouter } from "expo-router";
import { Bell, ClipboardCheck, Stethoscope, UserRound } from "lucide-react-native";
import { Animated, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef } from "react";
import { colors, spacing } from "@/constants/theme";
import { ActionButton, Card, PageHeader, SectionHeader } from "@/components/ui";
import { SafetyDisclaimer } from "@/components/WarningBox";
import { useAuth } from "@/providers/AuthProvider";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const canOpenDoctor = user?.role === "doctor";
  const canOpenPatient = !!user;
  const doctorScale = useRef(new Animated.Value(1)).current;
  const patientScale = useRef(new Animated.Value(1)).current;

  const chooseRole = (scale: Animated.Value, route: "/login?userId=doctor-rivera" | "/patient-landing") => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.08,
        friction: 4,
        tension: 140,
        useNativeDriver: true
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true
      })
    ]).start(() => router.push(route as never));
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.container}>
          <PageHeader
            title="Doctor Note Taker"
            right={
              <View style={styles.logo}>
                <Stethoscope size={28} color={colors.surface} />
              </View>
            }
          />

          <View style={[styles.roleGrid, isWide && styles.roleGridWide]}>
            <Animated.View style={[styles.roleCardWrap, { transform: [{ scale: doctorScale }] }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue as doctor"
                style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
                onPress={() => chooseRole(doctorScale, "/login?userId=doctor-rivera")}
              >
                <Stethoscope size={64} color={colors.primaryDark} />
              </Pressable>
            </Animated.View>

            <Animated.View style={[styles.roleCardWrap, { transform: [{ scale: patientScale }] }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue as patient"
                style={({ pressed }) => [styles.roleCard, pressed && styles.roleCardPressed]}
                onPress={() => chooseRole(patientScale, "/patient-landing")}
              >
                <UserRound size={64} color={colors.primaryDark} />
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          eyebrow="Clinical note companion"
          title="Doctor Note Taker"
          description="Record consultations, review patient instructions, and manage medication reminders from one clean workspace."
          right={
            <View style={styles.logo}>
              <Stethoscope size={28} color={colors.surface} />
            </View>
          }
        />

        <SafetyDisclaimer />

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
  logo: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  grid: {
    gap: spacing.lg
  },
  gridWide: {
    flexDirection: "row"
  },
  roleGrid: {
    gap: spacing.lg
  },
  roleGridWide: {
    flexDirection: "row",
    justifyContent: "center"
  },
  roleCardWrap: {
    flex: 1,
    maxWidth: 360,
    alignSelf: "center",
    width: "100%"
  },
  roleCard: {
    minHeight: 220,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E7EDF5",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    width: "100%"
  },
  roleCardPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSoft
  },
  routeCard: {
    flex: 1,
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
