import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/auth";

export function useProtectedRoute(allowedRoles: UserRole[]) {
  const auth = useAuth();
  const router = useRouter();
  const hasAccess = !!auth.user && allowedRoles.includes(auth.user.role);

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.replace("/login");
    }
  }, [auth.isLoading, auth.user, router]);

  return {
    ...auth,
    hasAccess,
    allowedRoles
  };
}
