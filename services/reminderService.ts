import {
  Medication,
  MedicationReminder,
  NEEDS_DOCTOR_REVIEW,
  ReminderStatus
} from "@/types/medical";

const timeMap: Record<string, string> = {
  Morning: "08:00 AM",
  Afternoon: "01:00 PM",
  Evening: "06:00 PM",
  Night: "08:00 PM",
  Bedtime: "10:00 PM"
};

const normalise = (value: string) => value.trim().toLowerCase();

function isReviewValue(value: string) {
  return !value.trim() || normalise(value) === normalise(NEEDS_DOCTOR_REVIEW);
}

function inferTimes(medication: Medication) {
  if (medication.times.length > 0) {
    return medication.times;
  }

  const frequency = normalise(medication.frequency);

  if (frequency.includes("as needed") || frequency.includes("prn")) {
    return [];
  }

  if (frequency.includes("3") || frequency.includes("three")) {
    return ["Morning", "Afternoon", "Night"];
  }

  if (frequency.includes("2") || frequency.includes("twice")) {
    return ["Morning", "Night"];
  }

  if (frequency.includes("daily") || frequency.includes("once")) {
    return ["Morning"];
  }

  return [];
}

function parseDurationDays(duration: string) {
  const match = duration.match(/(\d+)\s*(day|days)/i);
  return match ? Number(match[1]) : 1;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateMedicationReminders(
  medications: Medication[],
  startDate = new Date()
): MedicationReminder[] {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  return medications.flatMap((medication) => {
    const hasRequiredFields = [medication.name, medication.dosage, medication.frequency, medication.duration].every(
      (value) => !isReviewValue(value)
    );

    if (!hasRequiredFields) {
      return [];
    }

    const times = inferTimes(medication);
    const days = parseDurationDays(medication.duration);

    return Array.from({ length: days }).flatMap((_, dayIndex) => {
      const date = addDays(start, dayIndex);

      return times.map((timeLabel) => ({
        id: `${slug(medication.name)}-${dayIndex + 1}-${slug(timeLabel)}`,
        medicationName: medication.name,
        dosage: medication.dosage,
        scheduledDate: dateKey(date),
        scheduledTime: timeMap[timeLabel] ?? timeLabel,
        scheduledLabel: timeLabel,
        durationDay: dayIndex + 1,
        instructions: medication.instructions,
        status: "Pending" as ReminderStatus
      }));
    });
  });
}
