import { MedicalSummary, MedicationReminder } from "@/types/medical";

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
  await setItem(SUMMARY_KEY, JSON.stringify(summary));
}

export async function loadApprovedSummary() {
  const value = await getItem(SUMMARY_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as MedicalSummary;
  } catch {
    return null;
  }
}

export async function saveReminders(reminders: MedicationReminder[]) {
  await setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export async function loadReminders() {
  const value = await getItem(REMINDERS_KEY);
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as MedicationReminder[];
  } catch {
    return [];
  }
}

export async function saveRemindersEnabled(enabled: boolean) {
  await setItem(REMINDERS_ENABLED_KEY, JSON.stringify(enabled));
}

export async function loadRemindersEnabled() {
  const value = await getItem(REMINDERS_ENABLED_KEY);
  return value === null ? true : value === "true";
}
