import { FileText } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/constants/theme";
import { TranscriptionResult } from "@/types/medical";
import { Badge, Card, SectionHeader } from "./ui";
import { WarningBox } from "./WarningBox";

export function TranscriptPreview({ transcription }: { transcription: TranscriptionResult | null }) {
  if (!transcription) {
    return null;
  }

  return (
    <Card>
      <SectionHeader
        eyebrow="Transcript"
        title="Captured consultation explanation"
        description="The doctor should compare this transcript with the generated notes before approval."
        right={<Badge label={`Confidence: ${transcription.confidence}`} tone={transcription.confidence === "high" ? "success" : "warning"} />}
      />
      <View style={styles.preview}>
        <View style={styles.iconWrap}>
          <FileText size={20} color={colors.primaryDark} />
        </View>
        <Text style={styles.transcript}>{transcription.transcript}</Text>
      </View>
      <WarningBox title="Transcript review needed" warnings={transcription.warnings} />
    </Card>
  );
}

const styles = StyleSheet.create({
  preview: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  transcript: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 23
  }
});
