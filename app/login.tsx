import { useLocalSearchParams, useRouter } from "expo-router";
import { LogIn, ShieldCheck, Stethoscope, UserPlus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton, Card, FieldLabel, inputStyles, SectionHeader } from "@/components/ui";
import { colors, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { DOCTOR_CERTIFICATE_CODE } from "@/services/authService";
import { AppUser } from "@/types/auth";

function homeForUser(user: AppUser) {
  return user.role === "doctor" ? "/doctor" : "/patient";
}

export default function LoginScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { user, users, signIn, getPinHint, isLoading } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [certificateCode, setCertificateCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(homeForUser(user));
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    const requestedUserId = Array.isArray(userId) ? userId[0] : userId;
    if (requestedUserId && users.some((candidate) => candidate.id === requestedUserId)) {
      setSelectedUserId(requestedUserId);
      setEmail(users.find((candidate) => candidate.id === requestedUserId)?.email ?? "");
      setPin("");
      setCertificateCode("");
      setError("");
    }
  }, [userId, users]);

  const selectedUser = users.find((candidate) => candidate.id === selectedUserId);
  const isDoctor = selectedUser?.role === "doctor";

  useEffect(() => {
    if (!email && selectedUser) {
      setEmail(selectedUser.email);
    }
  }, [email, selectedUser]);

  const handleLogin = async () => {
    setError("");
    setIsSubmitting(true);
    const result = await signIn(selectedUserId, email, pin, certificateCode);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const nextUser = users.find((candidate) => candidate.id === selectedUserId);
    router.replace(nextUser ? homeForUser(nextUser) : "/");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <View style={styles.brandPanel}>
            <View style={styles.brandIcon}>
              <Stethoscope size={26} color={colors.surface} />
            </View>
            <View style={styles.brandText}>
              <Text style={styles.brandTitle}>Doctor AI Note Taker</Text>
              <Text style={styles.brandSubtitle}>Secure consultation note workspace</Text>
            </View>
            <View style={styles.brandChip}>
              <Text style={styles.brandChipText}>Demo</Text>
            </View>
          </View>

          <SectionHeader
            eyebrow="Secure prototype session"
            title={selectedUser?.name ?? "Sign in"}
            description="Local demo credentials only. Continue to record, review, and approve patient-ready instructions."
          />

          <View style={styles.accountCard}>
            <View style={styles.userIcon}>
              <ShieldCheck size={22} color={colors.primaryDark} />
            </View>
            <View style={styles.userText}>
              <Text style={styles.userName}>{selectedUser?.name}</Text>
              <Text style={styles.userEmail}>
                {selectedUser?.role === "doctor" ? "Doctor account" : "Patient account"} - {selectedUser?.title}
              </Text>
            </View>
            <View style={styles.accountChip}>
              <Text style={styles.accountChipText}>{selectedUser?.role === "doctor" ? "Clinician" : "Patient"}</Text>
            </View>
          </View>

          <View style={styles.infoNote}>
            <ShieldCheck size={16} color={colors.primaryDark} />
            <Text style={styles.infoNoteText}>
              This prototype stores only the selected user ID and session time locally. It does not store the PIN.
            </Text>
          </View>

          <View>
            <FieldLabel>Email</FieldLabel>
            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder={selectedUser?.email ?? "Email"}
              placeholderTextColor={colors.subtle}
              style={inputStyles.input}
            />
          </View>

          <View>
            <FieldLabel>PIN</FieldLabel>
            <TextInput
              value={pin}
              onChangeText={(value) => {
                setPin(value);
                setError("");
              }}
              secureTextEntry
              keyboardType="number-pad"
              placeholder={`Demo PIN: ${getPinHint(selectedUserId)}`}
              placeholderTextColor={colors.subtle}
              style={inputStyles.input}
            />
          </View>

          {isDoctor ? (
            <View>
              <FieldLabel>Certificate code</FieldLabel>
              <TextInput
                value={certificateCode}
                onChangeText={(value) => {
                  setCertificateCode(value);
                  setError("");
                }}
                autoCapitalize="characters"
                placeholder={`Demo certificate: ${DOCTOR_CERTIFICATE_CODE}`}
                placeholderTextColor={colors.subtle}
                style={inputStyles.input}
              />
            </View>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <ActionButton
            label="Sign in"
            icon={LogIn}
            loading={isSubmitting}
            disabled={email.trim().length === 0 || pin.trim().length === 0 || (isDoctor && certificateCode.trim().length === 0)}
            onPress={handleLogin}
          />
          {!isDoctor ? (
            <ActionButton
              label="Sign up as Patient"
              icon={UserPlus}
              tone="secondary"
              onPress={() => router.push("/patient-signup" as never)}
            />
          ) : null}
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
    maxWidth: 720,
    alignSelf: "center",
    justifyContent: "center",
    minHeight: "100%"
  },
  card: {
    gap: spacing.lg,
    overflow: "hidden"
  },
  brandPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "#BFEAEC",
    borderRadius: radii.xl,
    backgroundColor: colors.primaryDeep,
    padding: spacing.lg
  },
  brandIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  brandText: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  brandTitle: {
    color: colors.surface,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900"
  },
  brandSubtitle: {
    color: "#BFEAEC",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  brandChip: {
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: spacing.md,
    paddingVertical: 6
  },
  brandChipText: {
    color: colors.surface,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  accountCard: {
    borderWidth: 1,
    borderColor: "#BFEAEC",
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap",
    backgroundColor: colors.primarySoft
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  userText: {
    flex: 1,
    minWidth: 220,
    gap: 2
  },
  userName: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900"
  },
  userEmail: {
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  accountChip: {
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#BFEAEC"
  },
  accountChipText: {
    color: colors.primaryDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900"
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md
  },
  infoNoteText: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  }
});
