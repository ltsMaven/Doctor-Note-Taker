import { useRouter } from "expo-router";
import { LogIn, ShieldCheck, Stethoscope } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafetyDisclaimer } from "@/components/WarningBox";
import { ActionButton, Badge, Card, FieldLabel, inputStyles, SectionHeader } from "@/components/ui";
import { colors, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { AppUser } from "@/types/auth";

function homeForUser(user: AppUser) {
  return user.role === "doctor" ? "/doctor" : "/patient";
}

export default function LoginScreen() {
  const router = useRouter();
  const { user, users, signIn, getPinHint, isLoading } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(homeForUser(user));
    }
  }, [isLoading, router, user]);

  const selectedUser = users.find((candidate) => candidate.id === selectedUserId);

  const handleLogin = async () => {
    setError("");
    setIsSubmitting(true);
    const result = await signIn(selectedUserId, pin);
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
        <View style={styles.header}>
          <View style={styles.logo}>
            <Stethoscope size={28} color={colors.surface} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Choose a demo account. Changing user requires that account's PIN.</Text>
          </View>
        </View>

        <SafetyDisclaimer />

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Mock login"
            title="Select user"
            description="This prototype stores only the selected user ID and session time locally. It does not store the PIN."
          />

          <View style={styles.userGrid}>
            {users.map((candidate) => {
              const selected = candidate.id === selectedUserId;

              return (
                <Pressable
                  key={candidate.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setSelectedUserId(candidate.id);
                    setPin("");
                    setError("");
                  }}
                  style={[styles.userCard, selected && styles.userCardSelected]}
                >
                  <View style={styles.userIcon}>
                    <ShieldCheck size={22} color={selected ? colors.primaryDark : colors.muted} />
                  </View>
                  <View style={styles.userText}>
                    <Text style={styles.userName}>{candidate.name}</Text>
                    <Text style={styles.userMeta}>{candidate.title}</Text>
                    <Text style={styles.userEmail}>{candidate.email}</Text>
                  </View>
                  <Badge label={candidate.role} tone={candidate.role === "doctor" ? "info" : "success"} />
                </Pressable>
              );
            })}
          </View>

          <View>
            <FieldLabel>PIN for {selectedUser?.name ?? "selected user"}</FieldLabel>
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

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <ActionButton
            label="Sign in"
            icon={LogIn}
            loading={isSubmitting}
            disabled={pin.trim().length === 0}
            onPress={handleLogin}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: radii.md,
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
  card: {
    gap: spacing.lg
  },
  userGrid: {
    gap: spacing.md
  },
  userCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap",
    backgroundColor: colors.surface
  },
  userCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
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
  userMeta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
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
