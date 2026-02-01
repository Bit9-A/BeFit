import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;

  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  checkOnboardingStatus: (userId: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isOnboarded: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnboarded: (isOnboarded) => set({ isOnboarded }),

  signIn: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ isLoading: false });
      return { error: error.message };
    }

    set({
      user: data.user,
      session: data.session,
    });

    // Check onboarding status from database
    if (data.user) {
      const isOnboarded = await get().checkOnboardingStatus(data.user.id);
      set({ isOnboarded });
    }

    set({ isLoading: false });
    return {};
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      set({ isLoading: false });
      return { error: error.message };
    }

    // New users always need onboarding
    set({
      user: data.user,
      session: data.session,
      isOnboarded: false,
      isLoading: false,
    });

    return {};
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isOnboarded: false });
  },

  checkOnboardingStatus: async (userId: string): Promise<boolean> => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarding_completed, height, gender, goal")
        .eq("id", userId)
        .maybeSingle(); // Use maybeSingle to avoid error when no row exists

      if (error) {
        console.error("[Auth] Error checking onboarding:", error.message);
        return false;
      }

      // No profile found - user needs onboarding
      if (!profile) {
        console.log("[Auth] No profile found, needs onboarding");
        return false;
      }

      // Use explicit field if available, otherwise check required fields
      if (typeof profile.onboarding_completed === "boolean") {
        return profile.onboarding_completed;
      }

      // Fallback: check if required fields exist
      return !!(profile.height && profile.gender && profile.goal);
    } catch (error) {
      console.error("[Auth] Error in checkOnboardingStatus:", error);
      return false;
    }
  },

  initialize: async () => {
    set({ isLoading: true });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        set({
          user: session.user,
          session,
        });

        // Check onboarding status from database
        const isOnboarded = await get().checkOnboardingStatus(session.user.id);
        set({ isOnboarded });

        // Update last_active_at in profile
        await supabase
          .from("profiles")
          .update({ last_active_at: new Date().toISOString() })
          .eq("id", session.user.id);
      }

      set({ isLoading: false });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({
          user: session?.user ?? null,
          session,
        });

        if (session?.user) {
          const isOnboarded = await get().checkOnboardingStatus(
            session.user.id,
          );
          set({ isOnboarded });
        } else {
          set({ isOnboarded: false });
        }
      });
    } catch (error) {
      console.error("[Auth] Initialization error:", error);
      // If session is invalid/expired, force sign out to clean state
      await get().signOut();
      set({ isLoading: false });
    }
  },
}));
