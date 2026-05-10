import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { RecordingMode, RecordingStatus as Status } from "@/hooks/useAudioRecorder";
import { Badge } from "./ui";

const labels: Record<Status, string> = {
  idle: "Ready to record",
  "requesting-permission": "Requesting microphone access",
  recording: "Recording in progress",
  stopped: "Recording stopped",
  error: "Recording error"
};

export function RecordingStatus({
  status,
  mode,
  errorMessage
}: {
  status: Status;
  mode: RecordingMode;
  errorMessage: string;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.dot, status === "recording" && styles.dotLive, status === "error" && styles.dotError]} />
        <Text style={styles.status}>{labels[status]}</Text>
      </View>
      <Badge
        label={mode === "browser-media-recorder" ? "Browser MediaRecorder" : "Mock mobile recorder"}
        tone={mode === "browser-media-recorder" ? "success" : "neutral"}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.subtle
  },
  dotLive: {
    backgroundColor: colors.danger
  },
  dotError: {
    backgroundColor: colors.warning
  },
  status: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800"
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20
  }
});
