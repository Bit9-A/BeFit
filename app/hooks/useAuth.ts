import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useUserStore } from "../stores/userStore";

export function useAuth() {
  const {
    user,
    session,
    isLoading,
    isOnboarded,
    signIn,
    signUp,
    signOut,
    initialize,
  } = useAuthStore();

  const { profile, fetchProfile } = useUserStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id]);

  return {
    user,
    session,
    profile,
    isLoading,
    isOnboarded,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
  };
}
