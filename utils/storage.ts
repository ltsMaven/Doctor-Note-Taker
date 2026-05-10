import { MedicalSummary, MedicationReminder } from "@/types/medical";
import { DEFAULT_PATIENT_ID } from "@/data/mockUsers";

const SUMMARY_KEY = "doctor-note-taker.approved-summary";
const REMINDERS_KEY = "doctor-note-taker.reminders";
const REMINDERS_ENABLED_KEY = "doctor-note-taker.reminders-enabled";

const memoryStore = new Map<string, string>();

function hasLocalStorage() {
  try {
    return typeof globalThis !== "undefined" && "localStorage" in globalThis && !!globalThis.localStorage;
  } catch {
    return false;
  }
}

async function setItem(key: string, value: string) {
  memoryStore.set(key, value);
  if (hasLocalStorage()) {
    globalThis.localStorage.setItem(key, value);
  }
}

async function getItem(key: string) {
  if (hasLocalStorage()) {
    const value = globalThis.localStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  }

  return memoryStore.get(key) ?? null;
}

export async function saveApprovedSummary(summary: MedicalSummary) {
  const patientId = summary.patientId ?? DEFAULT_PATIENT_ID;
  await setItem(`${SUMMARY_KEY}.${patientId}`, JSON.stringify(summary));
}

export async function loadApprovedSummary(patientId = DEFAULT_PATIENT_ID) {
  const value = await getItem(`${SUMMARY_KEY}.${patientId}`) ?? (patientId === DEFAULT_PATIENT_ID ? await getItem(SUMMARY_KEY) : null);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as MedicalSummary;
  } catch {
    return null;
  }
}

export async function saveReminders(reminders: MedicationReminder[], patientId = DEFAULT_PATIENT_ID) {
  await setItem(`${REMINDERS_KEY}.${patientId}`, JSON.stringify(reminders));
}

export async function loadReminders(patientId = DEFAULT_PATIENT_ID) {
  const value = await getItem(`${REMINDERS_KEY}.${patientId}`) ?? (patientId === DEFAULT_PATIENT_ID ? await getItem(REMINDERS_KEY) : null);
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as MedicationReminder[];
  } catch {
    return [];
  }
}

export async function saveRemindersEnabled(enabled: boolean, patientId = DEFAULT_PATIENT_ID) {
  await setItem(`${REMINDERS_ENABLED_KEY}.${patientId}`, JSON.stringify(enabled));
}

export async function loadRemindersEnabled(patientId = DEFAULT_PATIENT_ID) {
  const value =
    (await getItem(`${REMINDERS_ENABLED_KEY}.${patientId}`)) ??
    (patientId === DEFAULT_PATIENT_ID ? await getItem(REMINDERS_ENABLED_KEY) : null);
  return value === null ? true : value === "true";
}
