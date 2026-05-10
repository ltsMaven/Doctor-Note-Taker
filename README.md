# Doctor Note Taker

A working Expo React Native prototype for iOS, Android, and web. The app helps doctors turn a spoken consultation explanation into reviewed, patient-friendly instructions with medication reminders.

This is not a production medical system. It uses local mock transcription and mock AI summarisation so it can run without API keys.

## Routes

- `/login` provides a mock PIN-based sign-in screen for demo users.
- `/doctor` records or mocks audio, transcribes it, generates structured notes, and requires doctor approval before sharing.
- `/patient` displays only doctor-approved summaries and medication reminders.
- `/api/transcribe` is a placeholder mock API route for transcription.
- `/api/generate-summary` is a placeholder mock API route for summary generation.

## Folder Structure

```text
app/
  _layout.tsx
  index.tsx
  login.tsx
  doctor.tsx
  patient.tsx
  api/
    transcribe+api.ts
    generate-summary+api.ts
components/
  AccessDenied.tsx
  DoctorNoteEditor.tsx
  FollowUpCard.tsx
  MedicationTable.tsx
  PatientInstructionChecklist.tsx
  RecordButton.tsx
  RecordingStatus.tsx
  ReminderCard.tsx
  ReminderList.tsx
  SessionBar.tsx
  TranscriptPreview.tsx
  WarningBox.tsx
  ui.tsx
constants/
  theme.ts
data/
  mockMedicalSummary.ts
  mockUsers.ts
hooks/
  useProtectedRoute.ts
  useAudioRecorder.ts
providers/
  AuthProvider.tsx
services/
  authService.ts
  reminderService.ts
  summaryService.ts
  transcriptionService.ts
types/
  auth.ts
  medical.ts
utils/
  storage.ts
  summaryValidation.ts
```

## Run

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run start
```

Then choose:

- Press `i` for iOS simulator.
- Press `a` for Android emulator.
- Press `w` for web.

You can also run:

```bash
npm run ios
npm run android
npm run web
```

## Prototype Flow

1. Open `/login`.
2. Sign in as the doctor with PIN `1234`.
3. Open `/doctor`.
4. Press `Record`.
5. Press `Stop`.
6. The app runs mock transcription and mock AI summary generation.
7. Edit the structured notes.
8. Enable the doctor approval switch.
9. Press `Send to Patient`.
10. Use the session switcher to sign in as the patient with PIN `5678`.
11. Open `/patient` to see the approved instructions and reminders.

## AI Pipeline Structure

The doctor flow is structured as:

```text
Doctor records audio
        |
Browser MediaRecorder API
        |
Send audio file to backend
        |
/api/transcribe
        |
OpenAI gpt-4o-mini-transcribe when OPENAI_API_KEY is configured
        |
Transcript text
        |
/api/generate-summary
        |
Cheap LLM generates structured JSON
        |
Doctor reviews and edits
        |
Patient sees summary, medication table, and reminders
```

The UI does not call transcription or summary mocks directly. The doctor page sends the recorded `Blob` to `/api/transcribe` as multipart `FormData`, then sends the transcript to `/api/generate-summary`.

Without `OPENAI_API_KEY`, both backend routes return mock data so the prototype still runs locally.

## OpenAI Setup

Create `.env` from `.env.example`:

```bash
OPENAI_API_KEY=your_server_side_key
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
OPENAI_SUMMARY_MODEL=gpt-4o-mini
```

The key is read only by backend API routes. Do not rename it to `EXPO_PUBLIC_OPENAI_API_KEY`.

## Demo Accounts

- Doctor: `doctor@example.com`, PIN `1234`
- Patient: `patient@example.com`, PIN `5678`

This is safe mock authentication for a prototype. It stores only the selected user ID and session timestamp locally. It does not store the PIN. It is not production authentication and should be replaced with a server-backed identity provider before handling real patient data.

## Safety Behavior

- Patients cannot open the doctor workflow unless they sign in as a doctor.
- Changing user requires the selected demo account PIN.
- Approved summaries and reminder settings are keyed by patient ID.
- The patient screen only reads summaries saved with `doctorApproved: true`.
- AI-generated content is always shown to the doctor before the patient sees it.
- The doctor approval switch is disabled if required medication fields are incomplete.
- Missing medication fields are shown as `Needs doctor review`.
- Transcript warnings are shown in the doctor review workflow.

## Replacement Points

- Replace `services/transcriptionService.ts` with Whisper or another speech-to-text service.
- Replace `services/summaryService.ts` with a real AI summary call that returns the structured JSON shape in `types/medical.ts`.
- Replace `utils/storage.ts` with a database-backed repository when authentication and persistent patient records are added.
- Replace the mock mobile recorder path in `hooks/useAudioRecorder.ts` with an Expo-compatible native audio recorder when real iOS and Android recording is required.
