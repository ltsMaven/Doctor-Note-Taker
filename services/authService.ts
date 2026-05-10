import { DEMO_USERS, findDemoUser, publicUser } from "@/data/mockUsers";
import { AppUser, AuthSession } from "@/types/auth";

const SESSION_KEY = "doctor-note-taker.auth-session";
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

async function removeItem(key: string) {
  memoryStore.delete(key);
  if (hasLocalStorage()) {
    globalThis.localStorage.removeItem(key);
  }
}

function sessionUser(session: AuthSession | null): AppUser | null {
  if (!session) {
    return null;
  }

  const user = findDemoUser(session.userId);
  return user ? publicUser(user) : null;
}

export function listUsers(): AppUser[] {
  return DEMO_USERS.map(publicUser);
}

export function getDemoPinHint(userId: string) {
  return findDemoUser(userId)?.demoPin ?? "";
}

export async function loadCurrentUser() {
  const value = await getItem(SESSION_KEY);
  if (!value) {
    return null;
  }

  try {
    return sessionUser(JSON.parse(value) as AuthSession);
  } catch {
    await removeItem(SESSION_KEY);
    return null;
  }
}

export async function signInWithPin(userId: string, pin: string) {
  const user = findDemoUser(userId);

  if (!user || user.demoPin !== pin.trim()) {
    return {
      user: null,
      error: "The selected user and PIN do not match."
    };
  }

  const session: AuthSession = {
    userId: user.id,
    signedInAt: new Date().toISOString()
  };

  await setItem(SESSION_KEY, JSON.stringify(session));

  return {
    user: publicUser(user),
    error: ""
  };
}

export async function signOut() {
  await removeItem(SESSION_KEY);
}
