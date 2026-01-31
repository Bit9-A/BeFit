import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";
import { useGamificationStore, Mission } from "../../stores/gamificationStore";
import { useAuthStore } from "../../stores/authStore";

function MissionItem({ mission, index }: { mission: Mission; index: number }) {
  const { user } = useAuthStore();
  const completeMission = useGamificationStore(
    (state) => state.completeMission,
  );

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePress = async () => {
    if (mission.completed) return;

    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 12 }),
    );

    if (user?.id) {
      await completeMission(user.id, mission.id);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={animatedStyle}
      className="mb-3"
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={mission.completed}
      >
        <LinearGradient
          colors={
            mission.completed
              ? ["rgba(16, 185, 129, 0.2)", "rgba(16, 185, 129, 0.1)"]
              : ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]
          }
          className={`p-3 rounded-2xl flex-row items-center border ${
            mission.completed ? "border-emerald-500/50" : "border-white/10"
          }`}
        >
          {/* Icon */}
          <View
            className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
              mission.completed ? "bg-emerald-500" : "bg-slate-800"
            }`}
          >
            <Ionicons
              name={mission.icon as any}
              size={20}
              color={mission.completed ? "#fff" : "#94A3B8"}
            />
          </View>

          {/* Text */}
          <View className="flex-1">
            <Text
              className={`font-semibold ${
                mission.completed
                  ? "text-emerald-400 line-through"
                  : "text-white"
              }`}
            >
              {mission.title}
            </Text>
            <Text className="text-xs text-slate-500">
              +{mission.xpReward} XP
            </Text>
          </View>

          {/* Checkbox */}
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              mission.completed
                ? "bg-emerald-500 border-emerald-500"
                : "border-slate-600"
            }`}
          >
            {mission.completed && (
              <Animated.View entering={ZoomIn}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </Animated.View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function DailyMissions() {
  const missions = useGamificationStore((state) => state.missions);
  const completedCount = missions.filter((m) => m.completed).length;
  const progress = (completedCount / missions.length) * 100;

  return (
    <View className="mb-6">
      <Animated.View entering={FadeInDown} className="rounded-3xl p-0.5">
        <LinearGradient
          colors={["#22D3EE", "#8B5CF6"]} // Cyan to Purple
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-3xl p-[1px]"
        >
          <View className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-5">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white font-bold text-lg">
                  Misiones Diarias
                </Text>
                <Text className="text-slate-400 text-xs">
                  ¡Gana XP extra hoy!
                </Text>
              </View>

              {/* Progress Ring or Badge */}
              <View className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <Text className="text-cyan-400 font-bold text-xs">
                  {completedCount}/{missions.length}
                </Text>
              </View>
            </View>

            {/* Missions List */}
            <View>
              {missions.map((mission, index) => (
                <MissionItem key={mission.id} mission={mission} index={index} />
              ))}
            </View>

            {/* Progress Bar Bottom */}
            <View className="h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
              <View
                className="h-full bg-cyan-400"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}
