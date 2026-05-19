import { useLocalSearchParams, useRouter } from "expo-router";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react-native";
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
          <SectionHeader
            eyebrow="Mock login"
            title={selectedUser?.name ?? "Sign in"}
            description="This prototype stores only the selected user ID and session time locally. It does not store the PIN."
          />

          <View style={styles.accountCard}>
            <View style={styles.userIcon}>
              <ShieldCheck size={22} color={colors.primaryDark} />
            </View>
            <View style={styles.userText}>
              <Text style={styles.userName}>{selectedUser?.title}</Text>
              <Text style={styles.userEmail}>{selectedUser?.role === "doctor" ? "Doctor account" : "Patient account"}</Text>
            </View>
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
    maxWidth: 980,
    alignSelf: "center"
  },
  card: {
    gap: spacing.lg
  },
  accountCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap",
    backgroundColor: colors.surfaceMuted
  },
  userIcon: {
    width: 42,
    height: 42,
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
    fontSize: 17,
    fontWeight: "900"
  },
  userEmail: {
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 19
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  }
});
