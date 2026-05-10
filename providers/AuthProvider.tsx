import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getDemoPinHint, listUsers, loadCurrentUser, signInWithPin, signOut as clearSession } from "@/services/authService";
import { AppUser } from "@/types/auth";

type AuthContextValue = {
  user: AppUser | null;
  users: AppUser[];
  isLoading: boolean;
  signIn: (userId: string, pin: string) => Promise<{ ok: boolean; error: string }>;
  switchUser: (userId: string, pin: string) => Promise<{ ok: boolean; error: string }>;
  signOut: () => Promise<void>;
  getPinHint: (userId: string) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const users = useMemo(() => listUsers(), []);

  useEffect(() => {
    let isMounted = true;

    loadCurrentUser().then((storedUser) => {
      if (isMounted) {
        setUser(storedUser);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (userId: string, pin: string) => {
    const result = await signInWithPin(userId, pin);
    if (result.user) {
      setUser(result.user);
      return { ok: true, error: "" };
    }

    return { ok: false, error: result.error };
  }, []);

  const switchUser = useCallback(
    async (userId: string, pin: string) => {
      if (user?.id === userId) {
        return { ok: true, error: "" };
      }

      return signIn(userId, pin);
    },
    [signIn, user?.id]
  );

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      users,
      isLoading,
      signIn,
      switchUser,
      signOut,
      getPinHint: getDemoPinHint
    }),
    [isLoading, signIn, signOut, switchUser, user, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
