import { Mic, Square } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { spacing } from "@/constants/theme";
import { RecordingStatus } from "@/hooks/useAudioRecorder";
import { ActionButton } from "./ui";

export function RecordButton({
  status,
  isProcessing,
  onStart,
  onStop
}: {
  status: RecordingStatus;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  const isRecording = status === "recording";
  const isRequesting = status === "requesting-permission";

  return (
    <View style={styles.row}>
      <ActionButton
        label="Record"
        icon={Mic}
        onPress={onStart}
        disabled={isRecording || isRequesting || isProcessing}
        loading={isRequesting}
        style={styles.button}
      />
      <ActionButton
        label="Stop"
        icon={Square}
        tone="danger"
        onPress={onStop}
        disabled={!isRecording || isProcessing}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  button: {
    flexGrow: 1
  }
});
