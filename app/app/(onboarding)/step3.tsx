import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Button } from "../../components/ui";
import { useAuthStore } from "../../stores/authStore";
import { useUserStore } from "../../stores/userStore";

type Goal = "muscle_gain" | "weight_loss" | "maintenance";

interface GoalOption {
  value: Goal;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
}

const goalOptions: GoalOption[] = [
  {
    value: "muscle_gain",
    label: "Ganar Músculo",
    description: "Aumentar masa muscular y fuerza",
    icon: "barbell",
    colors: ["#6366F1", "#8B5CF6"],
  },
  {
    value: "weight_loss",
    label: "Perder Peso",
    description: "Reducir grasa corporal de forma saludable",
    icon: "flame",
    colors: ["#F97316", "#EF4444"],
  },
  {
    value: "maintenance",
    label: "Mantenerme Sano",
    description: "Conservar mi peso y mejorar bienestar",
    icon: "heart",
    colors: ["#10B981", "#059669"],
  },
];

export default function OnboardingStep3() {
  const params = useLocalSearchParams<{
    height: string;
    weight: string;
    birthDate: string;
    gender: string;
    activityLevel: string;
  }>();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user, setOnboarded } = useAuthStore();
  const { completeOnboarding } = useUserStore();

  const handleComplete = async () => {
    if (!goal) {
      setError("Por favor selecciona un objetivo");
      return;
    }

    if (!user?.id) {
      setError("Error de autenticación");
      return;
    }

    setLoading(true);
    setError("");

    const result = await completeOnboarding(user.id, {
      height: parseFloat(params.height),
      weight: parseFloat(params.weight),
      birthDate: params.birthDate,
      gender: params.gender as "male" | "female" | "other",
      activityLevel: params.activityLevel as any,
      goal,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOnboarded(true);
    router.replace("/(tabs)");
  };

  return (
    <LinearGradient colors={["#0F172A", "#1E293B"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 pt-10"
        >
          {/* Progress Bar */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            className="flex-row items-center mb-8"
          >
            <View className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
              <View className="w-full h-full bg-primary-500 rounded-full" />
            </View>
            <Text className="text-slate-400 ml-3">3/3</Text>
          </Animated.View>

          {/* Header */}
          <Animated.View entering={FadeInUp.delay(150)}>
            <Text className="text-3xl font-bold text-white mb-2">
              Tu Objetivo
            </Text>
            <Text className="text-slate-400 text-base mb-8">
              ¿Qué quieres lograr con Be Fit?
            </Text>
          </Animated.View>

          {error ? (
            <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center">{error}</Text>
            </View>
          ) : null}

          {/* Goal Selection */}
          <Animated.View entering={FadeInDown.delay(250)}>
            {goalOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setGoal(option.value)}
                activeOpacity={0.8}
                className="mb-4"
              >
                <LinearGradient
                  colors={
                    goal === option.value
                      ? option.colors
                      : ["#1E293B", "#1E293B"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className={`
                    p-5 rounded-2xl border
                    ${goal === option.value ? "border-transparent" : "border-surface-light"}
                  `}
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                      style={{
                        backgroundColor:
                          goal === option.value
                            ? "rgba(255,255,255,0.2)"
                            : "#334155",
                      }}
                    >
                      <Ionicons
                        name={option.icon}
                        size={28}
                        color={
                          goal === option.value ? "#fff" : option.colors[0]
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-lg font-bold ${
                          goal === option.value
                            ? "text-white"
                            : "text-slate-200"
                        }`}
                      >
                        {option.label}
                      </Text>
                      <Text
                        className={`text-sm mt-1 ${
                          goal === option.value
                            ? "text-white/80"
                            : "text-slate-400"
                        }`}
                      >
                        {option.description}
                      </Text>
                    </View>
                    {goal === option.value && (
                      <Ionicons
                        name="checkmark-circle"
                        size={28}
                        color="#fff"
                      />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Navigation */}
          <Animated.View
            entering={FadeInDown.delay(400)}
            className="flex-row gap-4 mt-6"
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 flex-row items-center justify-center py-4 rounded-2xl border border-surface-light"
            >
              <Ionicons name="arrow-back" size={20} color="#94A3B8" />
              <Text className="text-slate-400 font-semibold ml-2">Atrás</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Button
                title="¡Comenzar!"
                onPress={handleComplete}
                loading={loading}
                size="md"
                variant="secondary"
              />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
