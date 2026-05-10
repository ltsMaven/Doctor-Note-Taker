import { MOCK_MEDICAL_SUMMARY } from "@/data/mockMedicalSummary";
import { MedicalSummary } from "@/types/medical";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateSummaryFromTranscript(transcript: string): Promise<MedicalSummary> {
  await delay(1000);

  return {
    ...MOCK_MEDICAL_SUMMARY,
    sourceTranscript: transcript,
    doctorApproved: false,
    approvedAt: undefined,
    reviewNotes: [
      "AI-generated content must be reviewed and approved before the patient can view it.",
      "Medication instructions should be checked against the original prescription."
    ]
  };
}
