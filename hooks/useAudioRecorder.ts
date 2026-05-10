import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";

export type RecordingStatus = "idle" | "requesting-permission" | "recording" | "stopped" | "error";
export type RecordingMode = "browser-media-recorder" | "mock-mobile";

type RecorderLike = {
  start: () => void;
  stop: () => void;
  state?: string;
  ondataavailable: ((event: { data: Blob }) => void) | null;
  onstop: (() => void) | null;
  onerror: (() => void) | null;
};

type MediaStreamLike = {
  getTracks: () => Array<{ stop: () => void }>;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function canUseBrowserMediaRecorder() {
  const mediaDevices = (globalThis.navigator as { mediaDevices?: { getUserMedia?: unknown } } | undefined)
    ?.mediaDevices;

  return (
    Platform.OS === "web" &&
    !!mediaDevices?.getUserMedia &&
    typeof (globalThis as unknown as { MediaRecorder?: unknown }).MediaRecorder !== "undefined"
  );
}

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [mode, setMode] = useState<RecordingMode>("mock-mobile");
  const [errorMessage, setErrorMessage] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const recorderRef = useRef<RecorderLike | null>(null);
  const streamRef = useRef<MediaStreamLike | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMessage("");
    setAudioBlob(null);
    setStatus("requesting-permission");

    if (!canUseBrowserMediaRecorder()) {
      setMode("mock-mobile");
      await delay(250);
      setStatus("recording");
      return;
    }

    try {
      const navigatorWithMedia = globalThis.navigator as unknown as {
        mediaDevices: {
          getUserMedia: (constraints: { audio: boolean }) => Promise<MediaStreamLike>;
        };
      };
      const MediaRecorderCtor = (globalThis as unknown as { MediaRecorder: new (stream: MediaStreamLike) => RecorderLike })
        .MediaRecorder;
      const stream = await navigatorWithMedia.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorderCtor(stream);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        setStatus("error");
        setErrorMessage("Recording failed. Please try again or use the mock flow.");
        stopTracks();
      };

      recorder.start();
      setMode("browser-media-recorder");
      setStatus("recording");
    } catch {
      setStatus("error");
      setErrorMessage("Microphone permission was denied or unavailable.");
      stopTracks();
    }
  }, [stopTracks]);

  const stopRecording = useCallback(async () => {
    setErrorMessage("");

    if (mode === "mock-mobile" || !recorderRef.current) {
      await delay(350);
      setStatus("stopped");
      return null;
    }

    const recorder = recorderRef.current;

    if (recorder.state === "inactive") {
      setStatus("stopped");
      return audioBlob;
    }

    return new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const blob = chunksRef.current.length > 0 ? new Blob(chunksRef.current, { type: "audio/webm" }) : null;
        setAudioBlob(blob);
        setStatus("stopped");
        stopTracks();
        resolve(blob);
      };

      recorder.stop();
    });
  }, [audioBlob, mode, stopTracks]);

  const resetRecording = useCallback(() => {
    recorderRef.current = null;
    chunksRef.current = [];
    stopTracks();
    setAudioBlob(null);
    setErrorMessage("");
    setStatus("idle");
  }, [stopTracks]);

  return {
    status,
    mode,
    errorMessage,
    audioBlob,
    isRecording: status === "recording",
    startRecording,
    stopRecording,
    resetRecording
  };
}
