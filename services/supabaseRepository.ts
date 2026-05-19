import { MedicalSummary, MedicationReminder, PatientDirectoryEntry, PatientIntakeProfile } from "@/types/medical";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

function assertClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function mapSummaryRow(row: any): MedicalSummary {
  return {
    patientId: row.patient_id,
    patientName: row.patient_name ?? undefined,
    patientSummary: row.patient_summary ?? "",
    tasks: row.tasks ?? [],
    medications: row.medications ?? [],
    followUp: row.follow_up ?? { required: false, date: "", notes: "" },
    warnings: row.warnings ?? [],
    doctorApproved: row.doctor_approved ?? false,
    approvedAt: row.approved_at ?? undefined,
    sourceTranscript: row.source_transcript ?? undefined,
    reviewNotes: row.review_notes ?? undefined
  };
}

function reminderToRow(reminder: MedicationReminder, patientId: string) {
  return {
    patient_id: patientId,
    reminder_id: reminder.id,
    medication_name: reminder.medicationName,
    dosage: reminder.dosage,
    scheduled_date: reminder.scheduledDate,
    scheduled_time: reminder.scheduledTime,
    scheduled_label: reminder.scheduledLabel,
    duration_day: reminder.durationDay,
    instructions: reminder.instructions,
    status: reminder.status
  };
}

function mapReminderRow(row: any): MedicationReminder {
  return {
    id: row.reminder_id,
    medicationName: row.medication_name,
    dosage: row.dosage,
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    scheduledLabel: row.scheduled_label,
    durationDay: row.duration_day,
    instructions: row.instructions,
    status: row.status
  };
}

export async function supabaseLoadPatientDirectory(): Promise<PatientDirectoryEntry[]> {
  const client = assertClient();
  const { data, error } = await client
    .from("patient_directory")
    .select("patient_id, display_name, added_at")
    .order("added_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    patientId: row.patient_id,
    displayName: row.display_name,
    addedAt: row.added_at
  }));
}

export async function supabaseUpsertPatientDirectoryEntry(entry: PatientDirectoryEntry) {
  const client = assertClient();
  const { error } = await client.from("patient_directory").upsert(
    {
      patient_id: entry.patientId,
      display_name: entry.displayName,
      added_at: entry.addedAt
    },
    { onConflict: "patient_id" }
  );

  if (error) throw error;

  return supabaseLoadPatientDirectory();
}

export async function supabaseSavePatientIntake(profile: PatientIntakeProfile) {
  const client = assertClient();
  await supabaseUpsertPatientDirectoryEntry({
    patientId: profile.patientId,
    displayName: profile.name,
    addedAt: profile.createdAt
  });

  const { error } = await client.from("patient_intake_profiles").upsert(
    {
      patient_id: profile.patientId,
      name: profile.name,
      age: profile.age,
      sex: profile.sex,
      date_of_birth: profile.dateOfBirth,
      symptoms: profile.symptoms,
      doctor_notes: profile.doctorNotes,
      created_at: profile.createdAt
    },
    { onConflict: "patient_id" }
  );

  if (error) throw error;
}

export async function supabaseLoadPatientIntake(patientId: string): Promise<PatientIntakeProfile | null> {
  const client = assertClient();
  const { data, error } = await client
    .from("patient_intake_profiles")
    .select("*")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    patientId: data.patient_id,
    name: data.name,
    age: data.age,
    sex: data.sex,
    dateOfBirth: data.date_of_birth,
    symptoms: data.symptoms ?? "",
    doctorNotes: data.doctor_notes ?? "",
    createdAt: data.created_at
  };
}

export async function supabaseSaveApprovedSummary(summary: MedicalSummary) {
  const client = assertClient();
  const patientId = summary.patientId ?? "";

  await supabaseUpsertPatientDirectoryEntry({
    patientId,
    displayName: summary.patientName || patientId || "Patient",
    addedAt: new Date().toISOString()
  });

  const { error } = await client.from("medical_summaries").upsert(
    {
      patient_id: patientId,
      patient_name: summary.patientName,
      patient_summary: summary.patientSummary,
      tasks: summary.tasks,
      medications: summary.medications,
      follow_up: summary.followUp,
      warnings: summary.warnings,
      doctor_approved: summary.doctorApproved ?? false,
      approved_at: summary.approvedAt ?? null,
      source_transcript: summary.sourceTranscript ?? null,
      review_notes: summary.reviewNotes ?? [],
      updated_at: new Date().toISOString()
    },
    { onConflict: "patient_id" }
  );

  if (error) throw error;
}

export async function supabaseLoadApprovedSummary(patientId: string): Promise<MedicalSummary | null> {
  const client = assertClient();
  const { data, error } = await client
    .from("medical_summaries")
    .select("*")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapSummaryRow(data) : null;
}

export async function supabaseSaveReminders(reminders: MedicationReminder[], patientId: string) {
  const client = assertClient();
  const { error: deleteError } = await client.from("medication_reminders").delete().eq("patient_id", patientId);
  if (deleteError) throw deleteError;

  if (reminders.length === 0) {
    return;
  }

  const { error } = await client.from("medication_reminders").insert(reminders.map((reminder) => reminderToRow(reminder, patientId)));
  if (error) throw error;
}

export async function supabaseLoadReminders(patientId: string): Promise<MedicationReminder[]> {
  const client = assertClient();
  const { data, error } = await client
    .from("medication_reminders")
    .select("*")
    .eq("patient_id", patientId)
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapReminderRow);
}

export async function supabaseSaveRemindersEnabled(enabled: boolean, patientId: string) {
  const client = assertClient();
  const { error } = await client
    .from("reminder_preferences")
    .upsert({ patient_id: patientId, enabled, updated_at: new Date().toISOString() }, { onConflict: "patient_id" });

  if (error) throw error;
}

export async function supabaseLoadRemindersEnabled(patientId: string) {
  const client = assertClient();
  const { data, error } = await client
    .from("reminder_preferences")
    .select("enabled")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) throw error;
  return data?.enabled ?? true;
}
