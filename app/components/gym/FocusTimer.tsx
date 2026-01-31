import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { triggerHaptic } from "../../services/haptics";
import { Exercise } from "../../types";

const { width } = Dimensions.get("window");

interface FocusTimerProps {
  visible: boolean;
  exercise: Exercise | null;
  currentSet: number;
  totalSets: number;
  onComplete: () => void;
  onRest: () => void;
  onClose: () => void;
}

export function FocusTimer({
  visible,
  exercise,
  currentSet,
  totalSets,
  onComplete,
  onRest,
  onClose,
}: FocusTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const pulse = useSharedValue(1);

  // Reset when opened
  useEffect(() => {
    if (visible) {
      setElapsed(0);
      setIsRunning(false); // Auto-start usually annoying, let user tap to focus?
      // Plan said "Just you and the weights", maybe auto-start on mount?
      // Let's require tap to start to be safe.
    }
  }, [visible, currentSet]);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      // Pulse animation while running
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
    } else {
      pulse.value = withSpring(1);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rs = secs % 60;
    return `${mins}:${rs.toString().padStart(2, "0")}`;
  };

  const timerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!exercise) return null;
  const isLastSet = currentSet >= totalSets;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      {/* Immersive Dark Background */}
      <View className="flex-1 bg-black">
        <LinearGradient
          colors={["#000000", "#111827"]} // Pitch black to dark gray
          className="flex-1 px-6 items-center justify-center"
        >
          {/* Top Info (Minimal) */}
          <View className="absolute top-16 w-full flex-row justify-between items-center">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
            >
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            <View className="bg-white/5 py-1 px-3 rounded-full border border-white/10">
              <Text className="text-slate-400 font-mono text-sm">
                SET {currentSet}/{totalSets}
              </Text>
            </View>
            <View className="w-10" />
          </View>

          {/* Main Focus Area */}
          <Animated.View
            entering={FadeInDown.springify()}
            className="items-center w-full"
          >
            {/* Exercise Name */}
            <Text className="text-white/60 text-lg font-medium mb-2 uppercase tracking-widest">
              {exercise.name}
            </Text>

            {/* Reps Target */}
            <Text className="text-white text-5xl font-bold mb-12">
              {exercise.reps}{" "}
              <Text className="text-2xl text-accent-500">REPS</Text>
            </Text>

            {/* Big Timer */}
            <TouchableOpacity
              onPress={() => {
                triggerHaptic("medium");
                setIsRunning(!isRunning);
              }}
              activeOpacity={0.9}
            >
              <Animated.View
                style={timerStyle}
                className={`
                            items-center justify-center
                            w-[300px] h-[300px] rounded-full
                            border-8 ${isRunning ? "border-accent-500 bg-accent-500/10" : "border-slate-800 bg-slate-900"}
                        `}
              >
                <Text
                  className={`font-mono text-8xl font-bold ${isRunning ? "text-white shadow-neon" : "text-slate-600"}`}
                >
                  {formatTime(elapsed)}
                </Text>
                <Text className="text-slate-400 mt-2 font-medium tracking-widest">
                  {isRunning ? "EN PROGRESO" : "TOCA PARA INICIAR"}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          {/* Bottom Actions */}
          <View className="absolute bottom-16 w-full px-6">
            {/* Main Action Button */}
            <TouchableOpacity
              onPress={() => {
                triggerHaptic("heavy"); // Big Hit!
                setIsRunning(false);
                if (isLastSet) onComplete();
                else onRest();
              }}
              className="w-full bg-white py-5 rounded-3xl items-center shadow-lg active:scale-95 transform transition"
            >
              <Text className="text-black text-xl font-bold tracking-wide">
                {isLastSet ? "🧠 FINALIZAR EJERCICIO" : "✅ COMPLETAR SERIE"}
              </Text>
            </TouchableOpacity>

            {/* Skip */}
            <TouchableOpacity
              onPress={onComplete}
              className="mt-6 items-center"
            >
              <Text className="text-slate-600 text-sm">Saltar ejercicio</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}
