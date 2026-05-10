export type UserRole = "doctor" | "patient";

export type AppUser = {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  patientId?: string;
};

export type DemoUser = AppUser & {
  demoPin: string;
};

export type AuthSession = {
  userId: string;
  signedInAt: string;
};
