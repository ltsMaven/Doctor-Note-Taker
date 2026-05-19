import { LogOut, ShieldCheck, UserRound } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/providers/AuthProvider";
import { ActionButton, Badge, Card, FieldLabel, inputStyles } from "./ui";

export function SessionBar() {
  const { user, users, switchUser, signOut, getPinHint } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState(user?.id ?? users[0]?.id ?? "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);

  if (!user) {
    return null;
  }

  const selectedUser = users.find((candidate) => candidate.id === selectedUserId);

  const handleSwitch = async () => {
    setError("");

    if (!selectedUserId || selectedUserId === user.id) {
      return;
    }

    setIsSwitching(true);
    const result = await switchUser(selectedUserId, pin);
    setIsSwitching(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPin("");
  };

  const handleSignOut = async () => {
    await signOut();
    setPin("");
    setError("");
  };

  return (
    <Card style={styles.card}>
      <View style={styles.currentRow}>
        <View style={styles.currentIcon}>
          <ShieldCheck size={21} color={colors.primaryDark} />
        </View>
        <View style={styles.currentText}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>
            {user.title} - {user.email}
          </Text>
        </View>
        <Badge label={user.role === "doctor" ? "Doctor" : "Patient"} tone={user.role === "doctor" ? "info" : "success"} />
      </View>

      <View style={styles.switchBox}>
        <View style={styles.userOptions}>
          {users.map((candidate) => {
            const selected = candidate.id === selectedUserId;
            return (
              <Pressable
                key={candidate.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  setSelectedUserId(candidate.id);
                  setError("");
                  setPin("");
                }}
                style={[styles.userOption, selected && styles.userOptionSelected]}
              >
                <UserRound size={18} color={selected ? colors.primaryDark : colors.muted} />
                <View style={styles.optionText}>
                  <Text style={[styles.optionName, selected && styles.optionNameSelected]}>{candidate.name}</Text>
                  <Text style={styles.optionMeta}>{candidate.role}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.pinRow}>
          <View style={styles.pinInputWrap}>
            <FieldLabel>PIN for {selectedUser?.name ?? "selected user"}</FieldLabel>
            <TextInput
              value={pin}
              onChangeText={(value) => {
                setPin(value);
                setError("");
              }}
              editable={selectedUserId !== user.id}
              secureTextEntry
              keyboardType="number-pad"
              placeholder={selectedUserId === user.id ? "Current user selected" : `Demo PIN: ${getPinHint(selectedUserId)}`}
              placeholderTextColor={colors.subtle}
              style={inputStyles.input}
            />
          </View>
          <View style={styles.actions}>
            <ActionButton
              label="Switch user"
              icon={UserRound}
              tone="secondary"
              loading={isSwitching}
              disabled={selectedUserId === user.id || pin.trim().length === 0}
              onPress={handleSwitch}
            />
            <ActionButton label="Sign out" icon={LogOut} tone="plain" onPress={handleSignOut} />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.note}>Demo authentication only. The PIN is checked locally and is not stored in the session.</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg
  },
  currentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  currentIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  currentText: {
    flex: 1,
    minWidth: 220,
    gap: 2
  },
  label: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  name: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  switchBox: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.lg,
    gap: spacing.md
  },
  userOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  userOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 50,
    backgroundColor: colors.surfaceMuted
  },
  userOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F2FBFA"
  },
  optionText: {
    gap: 1
  },
  optionName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  optionNameSelected: {
    color: colors.primaryDark
  },
  optionMeta: {
    color: colors.muted,
    fontSize: 12,
    textTransform: "capitalize"
  },
  pinRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-end",
    flexWrap: "wrap"
  },
  pinInputWrap: {
    flex: 1,
    minWidth: 220
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  note: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  }
});
