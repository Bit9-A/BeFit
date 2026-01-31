import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter that handles SSR
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Ignore errors
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
