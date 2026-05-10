import { transcribeAudio } from "@/services/transcriptionService";

export async function POST() {
  const result = await transcribeAudio(null);
  return Response.json(result);
}
