import { MedicalSummary, Medication, NEEDS_DOCTOR_REVIEW, TranscriptionResult } from "@/types/medical";

const needsReview = (value: string) =>
  !value.trim() || value.trim().toLowerCase() === NEEDS_DOCTOR_REVIEW.toLowerCase();

export function medicationMissingFields(medication: Medication) {
  const missing: string[] = [];

  if (needsReview(medication.name)) missing.push("Medication name");
  if (needsReview(medication.dosage)) missing.push("Dosage");
  if (needsReview(medication.frequency)) missing.push("Frequency");
  if (medication.times.length === 0 && !medication.frequency.toLowerCase().includes("as needed")) {
    missing.push("Time to take");
  }
  if (needsReview(medication.duration)) missing.push("Duration");
  if (needsReview(medication.instructions)) missing.push("Special instructions");

  return missing;
}

export function summaryReviewWarnings(
  summary: MedicalSummary | null,
  transcription: TranscriptionResult | null
) {
  const warnings: string[] = [];

  if (transcription?.confidence === "low" || transcription?.confidence === "medium") {
    warnings.push("Transcript confidence is not high. Confirm the summary against the consultation before approval.");
  }

  transcription?.warnings.forEach((warning) => warnings.push(warning));

  summary?.medications.forEach((medication) => {
    const missing = medicationMissingFields(medication);
    if (missing.length > 0) {
      warnings.push(`${medication.name || "A medication"} needs doctor review: ${missing.join(", ")}.`);
    }
  });

  return Array.from(new Set(warnings));
}

export function canShareWithPatient(summary: MedicalSummary | null) {
  if (!summary) {
    return { ok: false, reasons: ["Generate a summary before sending it to the patient."] };
  }

  const reasons: string[] = [];

  if (!summary.patientSummary.trim()) {
    reasons.push("Patient summary is missing.");
  }

  if (summary.medications.length === 0) {
    reasons.push("At least one medication or care instruction should be reviewed.");
  }

  summary.medications.forEach((medication) => {
    const missing = medicationMissingFields(medication);
    if (missing.length > 0) {
      reasons.push(`${medication.name || "Medication"} has incomplete fields: ${missing.join(", ")}.`);
    }
  });

  return { ok: reasons.length === 0, reasons };
}
