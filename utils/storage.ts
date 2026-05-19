import { MedicalSummary, MedicationReminder, PatientDirectoryEntry, PatientIntakeProfile } from "@/types/medical";
import { DEFAULT_PATIENT_ID } from "@/data/mockUsers";
import { isSupabaseConfigured } from "@/services/supabaseClient";
import {
  supabaseLoadApprovedSummary,
  supabaseLoadPatientDirectory,
  supabaseLoadPatientIntake,
  supabaseLoadReminders,
  supabaseLoadRemindersEnabled,
  supabaseSaveApprovedSummary,
  supabaseSavePatientIntake,
  supabaseSaveReminders,
  supabaseSaveRemindersEnabled,
  supabaseUpsertPatientDirectoryEntry
} from "@/services/supabaseRepository";

const SUMMARY_KEY = "doctor-note-taker.approved-summary";
const REMINDERS_KEY = "doctor-note-taker.reminders";
const REMINDERS_ENABLED_KEY = "doctor-note-taker.reminders-enabled";
const PATIENT_DIRECTORY_KEY = "doctor-note-taker.patient-directory";
const PATIENT_INTAKE_KEY = "doctor-note-taker.patient-intake";

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
  const nextSummary = { ...summary, patientId };

  if (isSupabaseConfigured) {
    try {
      await supabaseSaveApprovedSummary(nextSummary);
    } catch {
      // Keep the prototype usable when Supabase is unavailable.
    }
  }

  await setItem(`${SUMMARY_KEY}.${patientId}`, JSON.stringify(nextSummary));
  await upsertPatientDirectoryEntry({
    patientId,
    displayName: nextSummary.patientName || patientId,
    addedAt: new Date().toISOString()
  });
}

export async function loadApprovedSummary(patientId = DEFAULT_PATIENT_ID) {
  if (isSupabaseConfigured) {
    try {
      const remoteSummary = await supabaseLoadApprovedSummary(patientId);
      if (remoteSummary) {
        await setItem(`${SUMMARY_KEY}.${patientId}`, JSON.stringify(remoteSummary));
        return remoteSummary;
      }
    } catch {
      // Fall back to local storage below.
    }
  }

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
  if (isSupabaseConfigured) {
    try {
      await supabaseSaveReminders(reminders, patientId);
    } catch {
      // Keep local persistence as fallback.
    }
  }

  await setItem(`${REMINDERS_KEY}.${patientId}`, JSON.stringify(reminders));
}

export async function loadReminders(patientId = DEFAULT_PATIENT_ID) {
  if (isSupabaseConfigured) {
    try {
      const remoteReminders = await supabaseLoadReminders(patientId);
      await setItem(`${REMINDERS_KEY}.${patientId}`, JSON.stringify(remoteReminders));
      return remoteReminders;
    } catch {
      // Fall back to local storage below.
    }
  }

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
  if (isSupabaseConfigured) {
    try {
      await supabaseSaveRemindersEnabled(enabled, patientId);
    } catch {
      // Keep local persistence as fallback.
    }
  }

  await setItem(`${REMINDERS_ENABLED_KEY}.${patientId}`, JSON.stringify(enabled));
}

export async function loadRemindersEnabled(patientId = DEFAULT_PATIENT_ID) {
  if (isSupabaseConfigured) {
    try {
      const enabled = await supabaseLoadRemindersEnabled(patientId);
      await setItem(`${REMINDERS_ENABLED_KEY}.${patientId}`, JSON.stringify(enabled));
      return enabled;
    } catch {
      // Fall back to local storage below.
    }
  }

  const value =
    (await getItem(`${REMINDERS_ENABLED_KEY}.${patientId}`)) ??
    (patientId === DEFAULT_PATIENT_ID ? await getItem(REMINDERS_ENABLED_KEY) : null);
  return value === null ? true : value === "true";
}

export async function loadPatientDirectory() {
  if (isSupabaseConfigured) {
    try {
      const remoteEntries = await supabaseLoadPatientDirectory();
      if (remoteEntries.length > 0) {
        await savePatientDirectory(remoteEntries);
        return remoteEntries;
      }
    } catch {
      // Fall back to local storage below.
    }
  }

  const value = await getItem(PATIENT_DIRECTORY_KEY);
  const fallback: PatientDirectoryEntry[] = [
    {
      patientId: DEFAULT_PATIENT_ID,
      displayName: "Ava Thompson",
      addedAt: "2026-05-19T00:00:00.000Z"
    }
  ];

  if (!value) {
    return fallback;
  }

  try {
    const entries = JSON.parse(value) as PatientDirectoryEntry[];
    const hasDefault = entries.some((entry) => entry.patientId === DEFAULT_PATIENT_ID);
    return hasDefault ? entries : [...fallback, ...entries];
  } catch {
    return fallback;
  }
}

export async function savePatientDirectory(entries: PatientDirectoryEntry[]) {
  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.patientId, entry])).values()
  );
  await setItem(PATIENT_DIRECTORY_KEY, JSON.stringify(uniqueEntries));
}

export async function upsertPatientDirectoryEntry(entry: PatientDirectoryEntry) {
  if (isSupabaseConfigured) {
    try {
      await supabaseUpsertPatientDirectoryEntry(entry);
    } catch {
      // Keep local persistence as fallback.
    }
  }

  const entries = await loadPatientDirectory();
  const nextEntries = entries.some((candidate) => candidate.patientId === entry.patientId)
    ? entries.map((candidate) =>
        candidate.patientId === entry.patientId
          ? { ...candidate, displayName: entry.displayName || candidate.displayName }
          : candidate
      )
    : [entry, ...entries];

  await savePatientDirectory(nextEntries);
  return nextEntries;
}

export async function savePatientIntake(profile: PatientIntakeProfile) {
  if (isSupabaseConfigured) {
    try {
      await supabaseSavePatientIntake(profile);
    } catch {
      // Keep local persistence as fallback.
    }
  }

  await setItem(`${PATIENT_INTAKE_KEY}.${profile.patientId}`, JSON.stringify(profile));
  await upsertPatientDirectoryEntry({
    patientId: profile.patientId,
    displayName: profile.name,
    addedAt: profile.createdAt
  });
}

export async function loadPatientIntake(patientId: string) {
  if (isSupabaseConfigured) {
    try {
      const remoteProfile = await supabaseLoadPatientIntake(patientId);
      if (remoteProfile) {
        await setItem(`${PATIENT_INTAKE_KEY}.${patientId}`, JSON.stringify(remoteProfile));
        return remoteProfile;
      }
    } catch {
      // Fall back to local storage below.
    }
  }

  const value = await getItem(`${PATIENT_INTAKE_KEY}.${patientId}`);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as PatientIntakeProfile;
  } catch {
    return null;
  }
}
