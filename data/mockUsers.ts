import { DemoUser } from "@/types/auth";

export const DEFAULT_PATIENT_ID = "patient-ava";

export const DEMO_USERS: DemoUser[] = [
  {
    id: "doctor-rivera",
    name: "Dr Maya Rivera",
    role: "doctor",
    title: "General practitioner",
    email: "doctor@example.com",
    demoPin: "1234"
  },
  {
    id: DEFAULT_PATIENT_ID,
    name: "Ava Thompson",
    role: "patient",
    title: "Patient",
    email: "patient@example.com",
    patientId: DEFAULT_PATIENT_ID,
    demoPin: "5678"
  }
];

export function findDemoUser(userId: string) {
  return DEMO_USERS.find((user) => user.id === userId) ?? null;
}

export function publicUser(user: DemoUser) {
  const { demoPin: _demoPin, ...safeUser } = user;
  return safeUser;
}
