import { create } from "zustand";
import { Profile, CalculatedMetrics, OnboardingData } from "../types";
import { supabase } from "../services/supabase";
import { api } from "../services/api";

interface UserState {
  profile: Profile | null;
  metrics: CalculatedMetrics | null;
  isLoading: boolean;

  // Actions
  setProfile: (profile: Profile | null) => void;
  setMetrics: (metrics: CalculatedMetrics | null) => void;

  // Profile methods
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (
    userId: string,
    data: Partial<Profile>,
  ) => Promise<{ error?: string }>;
  completeOnboarding: (
    userId: string,
    data: OnboardingData,
  ) => Promise<{ error?: string }>;
  calculateAndSaveMetrics: (userId: string) => Promise<{ error?: string }>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  metrics: null,
  isLoading: false,

  setProfile: (profile) => set({ profile }),
  setMetrics: (metrics) => set({ metrics }),

  fetchProfile: async (userId) => {
    set({ isLoading: true });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      set({ profile: data as Profile });
    }

    set({ isLoading: false });
  },

  updateProfile: async (userId, data) => {
    const { error } = await supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      return { error: error.message };
    }

    // Refresh profile
    await get().fetchProfile(userId);
    return {};
  },

  completeOnboarding: async (userId, data) => {
    set({ isLoading: true });

    // First, check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    // If profile doesn't exist, create it first
    if (!existingProfile) {
      const { error: createError } = await supabase.from("profiles").insert({
        id: userId,
        email: "", // Will be filled by trigger or update
        height: data.height,
        birth_date: data.birthDate,
        gender: data.gender,
        activity_level: data.activityLevel,
        goal: data.goal,
        onboarding_completed: true,
      });

      if (createError) {
        console.error("Error creating profile:", createError.message);
        // Try update instead
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            height: data.height,
            birth_date: data.birthDate,
            gender: data.gender,
            activity_level: data.activityLevel,
            goal: data.goal,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (updateError) {
          set({ isLoading: false });
          return { error: updateError.message };
        }
      }
    } else {
      // Profile exists, update it
      const { error } = await supabase
        .from("profiles")
        .update({
          height: data.height,
          birth_date: data.birthDate,
          gender: data.gender,
          activity_level: data.activityLevel,
          goal: data.goal,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }
    }

    // Now profile exists, save initial weight to measurements table
    if (data.weight) {
      const { error: weightError } = await supabase
        .from("measurements")
        .insert({
          user_id: userId,
          weight: data.weight,
          recorded_at: new Date().toISOString(),
        });

      if (weightError) {
        console.error("Error saving initial weight:", weightError.message);
        // Non-blocking - continue even if weight save fails
      }
    }

    // Calculate initial metrics
    if (
      data.weight &&
      data.height &&
      data.birthDate &&
      data.gender &&
      data.activityLevel
    ) {
      const birthDate = new Date(data.birthDate);
      const age = new Date().getFullYear() - birthDate.getFullYear();

      const response = await api.calculateMetrics({
        weight: data.weight,
        height: data.height,
        age,
        gender: data.gender,
        activityLevel: data.activityLevel,
        userId,
      });

      if (response.data) {
        set({ metrics: response.data });
      }
    }

    await get().fetchProfile(userId);
    set({ isLoading: false });
    return {};
  },

  calculateAndSaveMetrics: async (userId) => {
    const profile = get().profile;

    console.log("[Metrics] Calculating for profile:", {
      height: profile?.height,
      birth_date: profile?.birth_date,
      gender: profile?.gender,
      activity_level: profile?.activity_level,
    });

    if (
      !profile?.height ||
      !profile?.birth_date ||
      !profile?.gender ||
      !profile?.activity_level
    ) {
      console.log("[Metrics] Profile incomplete, skipping calculation");
      return { error: "Profile incomplete" };
    }

    // Get latest weight from measurements
    const { data: measurement, error: measurementError } = await supabase
      .from("measurements")
      .select("weight")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log(
      "[Metrics] Latest weight:",
      measurement?.weight,
      "Error:",
      measurementError?.message,
    );

    if (!measurement?.weight) {
      console.log("[Metrics] No weight found");
      return { error: "No weight recorded" };
    }

    const birthDate = new Date(profile.birth_date);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    console.log("[Metrics] Calling API with:", {
      weight: measurement.weight,
      height: profile.height,
      age,
      gender: profile.gender,
      activityLevel: profile.activity_level,
    });

    const response = await api.calculateMetrics({
      weight: measurement.weight,
      height: profile.height,
      age,
      gender: profile.gender,
      activityLevel: profile.activity_level,
      goal: profile.goal,
      userId,
    });

    if (response.error) {
      console.log("[Metrics] API error:", response.error);
      return { error: response.error };
    }

    if (response.data) {
      console.log("[Metrics] Setting metrics:", response.data);
      set({ metrics: response.data });
    }

    return {};
  },
}));
