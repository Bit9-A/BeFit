import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGamificationStore } from "../../stores/gamificationStore";

export function StreakBadge() {
  const { currentStreak } = useGamificationStore();

  if (currentStreak === 0) return null;

  return (
    <View className="flex-row items-center bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/30">
      <Ionicons name="flame" size={16} color="#F97316" />
      <Text className="text-orange-400 font-bold ml-1.5 text-xs">
        {currentStreak}
      </Text>
    </View>
  );
}
