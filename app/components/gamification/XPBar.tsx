import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useGamificationStore } from "../../stores/gamificationStore";

export function XPBar() {
  const { level, xp, nextLevelXp, progressPercent } = useGamificationStore();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progressPercent, { damping: 12 });
  }, [progressPercent]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-end mb-2">
        <View className="flex-row items-center">
          <Text className="text-secondary-400 font-bold text-lg mr-2">
            Nivel {level}
          </Text>
          <View className="px-2 py-0.5 bg-secondary-500/20 rounded-md border border-secondary-500/50">
            <Text className="text-secondary-300 text-[10px] font-bold">
              CYBORG
            </Text>
          </View>
        </View>
        <Text className="text-slate-400 text-xs font-medium">
          {xp} / {nextLevelXp} XP
        </Text>
      </View>

      {/* Bar Background */}
      <View className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        {/* Animated Fill */}
        <Animated.View style={[animatedStyle]} className="h-full">
          <LinearGradient
            colors={["#A855F7", "#D8B4FE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-full shadow-neon-purple"
          />
        </Animated.View>
      </View>

      {/* Glow Effect under bar */}
      <View
        className="absolute bottom-0 left-0 h-4 bg-secondary-500/20 blur-md rounded-full -z-10"
        style={{ width: `${progressPercent}%` }}
      />
    </View>
  );
}
