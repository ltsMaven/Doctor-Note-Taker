import { generateSummaryFromTranscript } from "@/services/summaryService";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({ transcript: "" }));
  const result = await generateSummaryFromTranscript(String(body.transcript ?? ""));
  return Response.json(result);
}
