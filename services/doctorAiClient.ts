import { MedicalSummary, TranscriptionResult } from "@/types/medical";

function ensureOk(response: Response, fallbackMessage: string) {
  if (!response.ok) {
    throw new Error(fallbackMessage);
  }
}

export async function sendAudioForTranscription(audioBlob: Blob | null): Promise<TranscriptionResult> {
  const formData = new FormData();

  if (audioBlob) {
    const fileName = `consultation-${Date.now()}.webm`;
    formData.append("audio", audioBlob, fileName);
  } else {
    formData.append("mockRecorder", "true");
  }

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: formData
  });

  ensureOk(response, "The backend transcription request failed.");

  return response.json();
}

export async function requestStructuredSummary(transcript: string): Promise<MedicalSummary> {
  const response = await fetch("/api/generate-summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ transcript })
  });

  ensureOk(response, "The backend summary request failed.");

  return response.json();
}
