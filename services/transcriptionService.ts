import { MOCK_TRANSCRIPT } from "@/data/mockMedicalSummary";
import { TranscriptionResult } from "@/types/medical";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function transcribeAudio(_audio: unknown): Promise<TranscriptionResult> {
  await delay(900);

  return {
    transcript: MOCK_TRANSCRIPT,
    confidence: "medium",
    warnings: [
      "Background noise was detected during part of the recording.",
      "Optional pain-relief details were unclear and should be confirmed by the doctor."
    ]
  };
}
