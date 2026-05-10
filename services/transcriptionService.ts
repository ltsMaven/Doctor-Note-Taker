import { MOCK_TRANSCRIPT } from "@/data/mockMedicalSummary";
import { TranscriptionResult } from "@/types/medical";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe";

function mockTranscription(audioReceived: boolean, reason: string): TranscriptionResult {
  return {
    transcript: MOCK_TRANSCRIPT,
    confidence: "medium",
    source: "mock",
    model: "mock-transcription",
    audioReceived,
    warnings: [
      reason,
      "Background noise was detected during part of the recording.",
      "Optional pain-relief details were unclear and should be confirmed by the doctor."
    ]
  };
}

export async function transcribeAudio(audio: File | null): Promise<TranscriptionResult> {
  const audioReceived = !!audio;

  if (!process.env.OPENAI_API_KEY) {
    await delay(900);
    return mockTranscription(audioReceived, "No OPENAI_API_KEY is configured, so mock transcription was used.");
  }

  if (!audio) {
    await delay(900);
    return mockTranscription(audioReceived, "No audio file was received by the backend, so mock transcription was used.");
  }

  const formData = new FormData();
  formData.append("file", audio);
  formData.append("model", TRANSCRIBE_MODEL);

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OpenAI transcription failed: ${detail || response.statusText}`);
  }

  const result = (await response.json()) as { text?: string };
  const transcript = result.text?.trim();

  if (!transcript) {
    throw new Error("OpenAI transcription did not return transcript text.");
  }

  return {
    transcript,
    confidence: "medium",
    source: "openai",
    model: TRANSCRIBE_MODEL,
    audioReceived,
    warnings: []
  };
}

export async function mockTranscribeAudio(_audio: unknown): Promise<TranscriptionResult> {
  await delay(900);

  return mockTranscription(false, "Mock transcription was requested.");
}
