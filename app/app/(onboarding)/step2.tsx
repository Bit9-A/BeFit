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

type Gender = "male" | "female" | "other";
type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

interface SelectOption {
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const genderOptions: SelectOption[] = [
  { value: "male", label: "Masculino", icon: "male", color: "#3B82F6" },
  { value: "female", label: "Femenino", icon: "female", color: "#EC4899" },
  { value: "other", label: "Otro", icon: "person", color: "#8B5CF6" },
];

const activityOptions: SelectOption[] = [
  { value: "sedentary", label: "Sedentario", icon: "bed", color: "#94A3B8" },
  { value: "light", label: "Ligero", icon: "walk", color: "#6EE7B7" },
  { value: "moderate", label: "Moderado", icon: "bicycle", color: "#FBBF24" },
  { value: "active", label: "Activo", icon: "fitness", color: "#F97316" },
  {
    value: "very_active",
    label: "Muy Activo",
    icon: "flame",
    color: "#EF4444",
  },
];

function SelectCard({
  option,
  selected,
  onPress,
}: {
  option: SelectOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`
        flex-row items-center p-4 rounded-2xl border mb-3
        ${selected ? "bg-primary-500/20 border-primary-500" : "bg-surface border-surface-light"}
      `}
      activeOpacity={0.7}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${option.color}20` }}
      >
        <Ionicons name={option.icon} size={22} color={option.color} />
      </View>
      <Text
        className={`flex-1 text-base ${selected ? "text-white font-semibold" : "text-slate-300"}`}
      >
        {option.label}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
      )}
    </TouchableOpacity>
  );
}

export default function OnboardingStep2() {
  const params = useLocalSearchParams<{
    height: string;
    weight: string;
    birthDate: string;
  }>();

  const [gender, setGender] = useState<Gender | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    null,
  );
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!gender || !activityLevel) {
      setError("Por favor selecciona todas las opciones");
      return;
    }

    router.push({
      pathname: "/(onboarding)/step3",
      params: { ...params, gender, activityLevel },
    });
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
              <View className="w-2/3 h-full bg-primary-500 rounded-full" />
            </View>
            <Text className="text-slate-400 ml-3">2/3</Text>
          </Animated.View>

          {/* Header */}
          <Animated.View entering={FadeInUp.delay(150)}>
            <Text className="text-3xl font-bold text-white mb-2">
              Tu Estilo de Vida
            </Text>
            <Text className="text-slate-400 text-base mb-8">
              Esto nos ayuda a personalizar tus recomendaciones
            </Text>
          </Animated.View>

          {error ? (
            <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center">{error}</Text>
            </View>
          ) : null}

          {/* Gender Selection */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text className="text-white font-semibold text-lg mb-3">
              Género
            </Text>
            {genderOptions.map((option) => (
              <SelectCard
                key={option.value}
                option={option}
                selected={gender === option.value}
                onPress={() => setGender(option.value as Gender)}
              />
            ))}
          </Animated.View>

          {/* Activity Level Selection */}
          <Animated.View entering={FadeInDown.delay(300)} className="mt-6">
            <Text className="text-white font-semibold text-lg mb-3">
              Nivel de Actividad
            </Text>
            {activityOptions.map((option) => (
              <SelectCard
                key={option.value}
                option={option}
                selected={activityLevel === option.value}
                onPress={() => setActivityLevel(option.value as ActivityLevel)}
              />
            ))}
          </Animated.View>

          {/* Navigation */}
          <Animated.View
            entering={FadeInDown.delay(400)}
            className="flex-row gap-4 mt-8"
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 flex-row items-center justify-center py-4 rounded-2xl border border-surface-light"
            >
              <Ionicons name="arrow-back" size={20} color="#94A3B8" />
              <Text className="text-slate-400 font-semibold ml-2">Atrás</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Button title="Continuar" onPress={handleNext} size="md" />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
