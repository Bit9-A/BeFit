import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../stores/authStore";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading, isOnboarded, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!user) {
      // Not authenticated, redirect to login
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else if (!isOnboarded) {
      // Authenticated but not onboarded
      if (!inOnboardingGroup) {
        router.replace("/(onboarding)/step1");
      }
    } else {
      // Authenticated and onboarded
      if (inAuthGroup || inOnboardingGroup) {
        router.replace("/(tabs)");
      }
    }
  }, [user, isLoading, isOnboarded, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0F172A" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
