import { transcribeAudio } from "@/services/transcriptionService";

type ServerFormData = FormData & {
  get: (name: string) => FormDataEntryValue | null;
};

export async function POST(request: Request) {
  const formData = (await request.formData().catch(() => null)) as ServerFormData | null;
  const audioValue = formData?.get("audio");
  const audio =
    audioValue && typeof audioValue === "object" && "arrayBuffer" in audioValue
      ? (audioValue as File)
      : null;

  const result = await transcribeAudio(audio);
  return Response.json(result);
}
