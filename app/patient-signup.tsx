import { useRouter } from "expo-router";
import { Check, UserPlus } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton, Card, FieldLabel, inputStyles, PageHeader, SectionHeader } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { PatientIntakeProfile } from "@/types/medical";
import { savePatientIntake } from "@/utils/storage";

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makePatientId(name: string) {
  const base = slug(name) || "patient";
  return `patient-${base}-${Date.now().toString().slice(-5)}`;
}

export default function PatientSignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [error, setError] = useState("");
  const [createdPatientId, setCreatedPatientId] = useState("");

  const submit = async () => {
    setError("");

    if (!name.trim() || !age.trim() || !sex.trim() || !dateOfBirth.trim()) {
      setError("Name, age, sex, and date of birth are required.");
      return;
    }

    const profile: PatientIntakeProfile = {
      patientId: makePatientId(name),
      name: name.trim(),
      age: age.trim(),
      sex: sex.trim(),
      dateOfBirth: dateOfBirth.trim(),
      symptoms: symptoms.trim(),
      doctorNotes: doctorNotes.trim(),
      createdAt: new Date().toISOString()
    };

    await savePatientIntake(profile);
    setCreatedPatientId(profile.patientId);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          eyebrow="Patient sign up"
          title="Create patient profile"
          description="Share basic details and symptoms before your doctor reviews the care plan."
        />

        <Card style={styles.card}>
          <SectionHeader eyebrow="Intake" title="Patient details" />

          <View>
            <FieldLabel>Name</FieldLabel>
            <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.subtle} style={inputStyles.input} />
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <FieldLabel>Age</FieldLabel>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="32"
                placeholderTextColor={colors.subtle}
                style={inputStyles.input}
              />
            </View>
            <View style={styles.gridItem}>
              <FieldLabel>Sex</FieldLabel>
              <TextInput value={sex} onChangeText={setSex} placeholder="Female" placeholderTextColor={colors.subtle} style={inputStyles.input} />
            </View>
          </View>

          <View>
            <FieldLabel>Date of birth</FieldLabel>
            <TextInput
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.subtle}
              style={inputStyles.input}
            />
          </View>

          <View>
            <FieldLabel>Symptoms</FieldLabel>
            <TextInput
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
              placeholder="What symptoms are you experiencing?"
              placeholderTextColor={colors.subtle}
              style={[inputStyles.input, inputStyles.multiline]}
            />
          </View>

          <View>
            <FieldLabel>Extra notes for doctor</FieldLabel>
            <TextInput
              value={doctorNotes}
              onChangeText={setDoctorNotes}
              multiline
              placeholder="Allergies, current medication, concerns, or anything the doctor should know."
              placeholderTextColor={colors.subtle}
              style={[inputStyles.input, inputStyles.multiline]}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {createdPatientId ? (
            <View style={styles.successBox}>
              <Check size={22} color={colors.success} />
              <View style={styles.successText}>
                <Text style={styles.successTitle}>Profile created</Text>
                <Text style={styles.successMeta}>Unique ID: {createdPatientId}</Text>
              </View>
            </View>
          ) : null}

          <ActionButton label={createdPatientId ? "Create another profile" : "Sign up"} icon={UserPlus} onPress={createdPatientId ? () => {
            setName("");
            setAge("");
            setSex("");
            setDateOfBirth("");
            setSymptoms("");
            setDoctorNotes("");
            setCreatedPatientId("");
          } : submit} />

          {createdPatientId ? (
            <ActionButton label="Go to Patient Login" tone="secondary" onPress={() => router.push("/login?userId=patient-ava")} />
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
  grid: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  gridItem: {
    flex: 1,
    minWidth: 180
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800"
  },
  successBox: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BCE8CE",
    borderRadius: 8,
    backgroundColor: colors.successSoft,
    padding: spacing.md
  },
  successText: {
    flex: 1,
    minWidth: 0
  },
  successTitle: {
    color: colors.success,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900"
  },
  successMeta: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800"
  }
});
