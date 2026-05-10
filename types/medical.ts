export const NEEDS_DOCTOR_REVIEW = "Needs doctor review";

export type TaskInstruction = {
  task: string;
  details: string;
};

export type Medication = {
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  duration: string;
  instructions: string;
};

export type FollowUp = {
  required: boolean;
  date: string;
  notes: string;
};

export type MedicalSummary = {
  patientSummary: string;
  tasks: TaskInstruction[];
  medications: Medication[];
  followUp: FollowUp;
  warnings: string[];
  doctorApproved?: boolean;
  approvedAt?: string;
  sourceTranscript?: string;
  reviewNotes?: string[];
};

export type TranscriptionResult = {
  transcript: string;
  confidence: "high" | "medium" | "low";
  warnings: string[];
};

export type ReminderStatus = "Pending" | "Taken" | "Skipped";

export type MedicationReminder = {
  id: string;
  medicationName: string;
  dosage: string;
  scheduledDate: string;
  scheduledTime: string;
  scheduledLabel: string;
  durationDay: number;
  instructions: string;
  status: ReminderStatus;
};
