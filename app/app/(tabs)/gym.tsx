import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Vibration,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { Button, Card } from "../../components/ui";
import { api } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { useUserStore } from "../../stores/userStore";
import { Exercise } from "../../types";

// Rest Timer Modal Component
function RestTimerModal({
  visible,
  restTime,
  onSkip,
  onComplete,
}: {
  visible: boolean;
  restTime: number;
  onSkip: () => void;
  onComplete: () => void;
}) {
  const [seconds, setSeconds] = useState(restTime);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setSeconds(restTime);
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
        true,
      );
    }
  }, [visible, restTime]);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          Vibration.vibrate([0, 200, 100, 200]);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining.toString().padStart(2, "0")}`;
  };

  const progress = (restTime - seconds) / restTime;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/80 items-center justify-center px-6">
        <LinearGradient
          colors={["#1E293B", "#0F172A"]}
          className="rounded-3xl p-8 w-full items-center"
        >
          <Text className="text-slate-400 text-lg mb-2">⏱️ DESCANSO</Text>

          <Animated.View
            style={pulseStyle}
            className="w-40 h-40 rounded-full border-4 border-accent-500 items-center justify-center mb-6"
          >
            <Text className="text-white text-5xl font-bold">
              {formatTime(seconds)}
            </Text>
          </Animated.View>

          {/* Progress Ring */}
          <View className="w-full h-2 bg-surface-light rounded-full mb-6 overflow-hidden">
            <View
              className="h-full bg-accent-500 rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>

          <View className="flex-row gap-4 w-full">
            <TouchableOpacity
              onPress={() => setSeconds((s) => Math.min(s + 30, 300))}
              className="flex-1 bg-surface-light py-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold">+30s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSkip}
              className="flex-1 bg-primary-500 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold">Saltar</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

// Exercise Timer Modal
function ExerciseTimerModal({
  visible,
  exercise,
  currentSet,
  totalSets,
  onComplete,
  onRest,
}: {
  visible: boolean;
  exercise: Exercise | null;
  currentSet: number;
  totalSets: number;
  onComplete: () => void;
  onRest: () => void;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (visible) {
      setElapsed(0);
      setIsRunning(false);
    }
  }, [visible, currentSet]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining.toString().padStart(2, "0")}`;
  };

  if (!exercise) return null;

  const isLastSet = currentSet >= totalSets;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/90">
        <LinearGradient colors={["#0F172A", "#1E293B"]} className="flex-1 p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mt-10 mb-8">
            <TouchableOpacity onPress={onComplete}>
              <Ionicons name="close" size={28} color="#94A3B8" />
            </TouchableOpacity>
            <View className="bg-primary-500/20 px-4 py-2 rounded-full">
              <Text className="text-primary-400 font-semibold">
                Serie {currentSet} de {totalSets}
              </Text>
            </View>
            <View className="w-7" />
          </View>

          {/* Exercise Info */}
          <View className="items-center flex-1 justify-center">
            <View className="w-24 h-24 bg-primary-500/20 rounded-3xl items-center justify-center mb-6">
              <Ionicons name="barbell" size={48} color="#6366F1" />
            </View>

            <Text className="text-white text-2xl font-bold text-center mb-2">
              {exercise.name}
            </Text>

            <Text className="text-accent-500 text-4xl font-bold mb-4">
              {exercise.reps} reps
            </Text>

            {/* Timer Display */}
            <View className="bg-surface rounded-2xl px-8 py-4 mb-8">
              <Text className="text-white text-5xl font-mono font-bold">
                {formatTime(elapsed)}
              </Text>
            </View>

            {/* Tips */}
            {exercise.tips && (
              <View className="bg-accent-500/10 rounded-xl p-4 mx-4 mb-8">
                <Text className="text-accent-400 text-center">
                  💡 {exercise.tips}
                </Text>
              </View>
            )}
          </View>

          {/* Controls */}
          <View className="gap-3 mb-8">
            {!isRunning ? (
              <TouchableOpacity
                onPress={() => setIsRunning(true)}
                className="bg-accent-500 py-4 rounded-2xl flex-row items-center justify-center"
              >
                <Ionicons name="play" size={24} color="#fff" />
                <Text className="text-white text-lg font-bold ml-2">
                  Iniciar Serie
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setIsRunning(false);
                  Vibration.vibrate(100);
                  if (isLastSet) {
                    onComplete();
                  } else {
                    onRest();
                  }
                }}
                className="bg-primary-500 py-4 rounded-2xl flex-row items-center justify-center"
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text className="text-white text-lg font-bold ml-2">
                  {isLastSet ? "Completar Ejercicio" : "Siguiente Serie"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onComplete}
              className="py-3 items-center"
            >
              <Text className="text-slate-400">Saltar ejercicio</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

// Exercise Card Component
function ExerciseCard({
  exercise,
  index,
  onStart,
  isCompleted,
}: {
  exercise: Exercise;
  index: number;
  onStart: () => void;
  isCompleted: boolean;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 50)}>
      <TouchableOpacity
        onPress={onStart}
        activeOpacity={0.8}
        className={`
          flex-row items-center p-4 rounded-2xl border mb-3
          ${isCompleted ? "bg-accent-500/20 border-accent-500" : "bg-surface border-surface-light"}
        `}
      >
        <View
          className={`
            w-10 h-10 rounded-xl items-center justify-center mr-4
            ${isCompleted ? "bg-accent-500" : "bg-primary-500/20"}
          `}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={20} color="#fff" />
          ) : (
            <Ionicons name="play" size={18} color="#6366F1" />
          )}
        </View>

        <View className="flex-1">
          <Text
            className={`font-semibold text-base ${
              isCompleted ? "text-accent-400 line-through" : "text-white"
            }`}
          >
            {exercise.name}
          </Text>
          <Text className="text-slate-400 text-sm mt-0.5">
            {exercise.sets} series × {exercise.reps} reps
          </Text>
        </View>

        <View className="bg-surface-light/50 px-3 py-1.5 rounded-lg">
          <Text className="text-slate-400 text-xs">
            {isCompleted ? "✓" : "Iniciar"}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function GymScreen() {
  const { user } = useAuthStore();
  const { profile } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState<{
    routineName: string;
    exercises: Exercise[];
    explanation: string;
  } | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(
    new Set(),
  );

  // Timer states
  const [showExerciseTimer, setShowExerciseTimer] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restTime, setRestTime] = useState(90);

  const generateRoutine = async () => {
    setLoading(true);

    try {
      const userProfile = {
        height: profile?.height || 170,
        gender: profile?.gender || "male",
        activityLevel: profile?.activity_level || "moderate",
        goal: profile?.goal || "maintenance",
      };

      console.log("[Gym] Generating routine with profile:", userProfile);

      const response = await api.generateRoutine({
        userProfile,
        goal: profile?.goal || "maintenance",
        userId: user?.id,
      });

      console.log("[Gym] Response:", response);

      if (response.data) {
        setRoutine(response.data);
        setCompletedExercises(new Set());
      } else if (response.error) {
        console.error("[Gym] Error:", response.error);
      }
    } catch (error) {
      console.error("[Gym] Exception:", error);
    }

    setLoading(false);
  };

  const startExercise = (index: number) => {
    if (completedExercises.has(index)) return;
    setCurrentExerciseIndex(index);
    setCurrentSet(1);
    setShowExerciseTimer(true);
  };

  const handleSetComplete = () => {
    const exercise = routine?.exercises[currentExerciseIndex];
    const totalSets = parseInt(exercise?.sets || "3");

    if (currentSet >= totalSets) {
      // Exercise complete
      setShowExerciseTimer(false);
      setCompletedExercises((prev) => new Set([...prev, currentExerciseIndex]));
      Vibration.vibrate([0, 100, 50, 100]);
    } else {
      // Start rest timer
      setShowExerciseTimer(false);
      setShowRestTimer(true);
    }
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    setCurrentSet((prev) => prev + 1);
    setShowExerciseTimer(true);
  };

  const handleExerciseSkip = () => {
    setShowExerciseTimer(false);
    setCompletedExercises((prev) => new Set([...prev, currentExerciseIndex]));
  };

  const completedCount = completedExercises.size;
  const totalCount = routine?.exercises.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const currentExercise = routine?.exercises[currentExerciseIndex] || null;

  return (
    <LinearGradient colors={["#0F172A", "#1E293B"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100)} className="mt-4 mb-6">
            <Text className="text-3xl font-bold text-white">Smart Gym</Text>
            <Text className="text-slate-400 mt-2">
              Rutinas personalizadas con IA
            </Text>
          </Animated.View>

          {!routine ? (
            <>
              {/* Generate Card */}
              <Animated.View entering={FadeInDown.delay(200)}>
                <LinearGradient
                  colors={["#6366F1", "#4F46E5"]}
                  className="rounded-3xl p-6 mb-6"
                >
                  <View className="items-center">
                    <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-4">
                      <Ionicons name="barbell" size={40} color="#fff" />
                    </View>
                    <Text className="text-white text-xl font-bold text-center">
                      Genera tu Rutina del Día
                    </Text>
                    <Text className="text-white/70 text-center mt-2 mb-6">
                      La IA creará una rutina basada en tu perfil
                    </Text>
                    <Button
                      title={loading ? "Generando..." : "Generar Rutina"}
                      onPress={generateRoutine}
                      loading={loading}
                      variant="secondary"
                      className="bg-primary-500 border-primary-500 rounded-full"
                      size="lg"
                    />
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Tips */}
              <Animated.View entering={FadeInDown.delay(300)}>
                <Card>
                  <Text className="text-white font-semibold mb-3">
                    Consejos para hoy
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="water" size={18} color="#10B981" />
                    <Text className="text-slate-400 ml-2">
                      Hidrátate antes de entrenar
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="timer" size={18} color="#F97316" />
                    <Text className="text-slate-400 ml-2">
                      Descansa 60-90 segundos entre series
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="body" size={18} color="#8B5CF6" />
                    <Text className="text-slate-400 ml-2">
                      Mantén buena postura en cada ejercicio
                    </Text>
                  </View>
                </Card>
              </Animated.View>
            </>
          ) : (
            <>
              {/* Progress Bar */}
              <Animated.View
                entering={FadeIn}
                className="bg-surface rounded-2xl p-4 mb-4 border border-surface-light"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-semibold">
                    {routine.routineName}
                  </Text>
                  <Text className="text-primary-400 font-bold">
                    {completedCount}/{totalCount}
                  </Text>
                </View>
                <View className="h-3 bg-surface-light rounded-full overflow-hidden">
                  <View
                    className="h-full bg-accent-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
                {progress === 100 && (
                  <Text className="text-accent-400 text-center mt-3 font-semibold">
                    🎉 ¡Rutina Completada!
                  </Text>
                )}
              </Animated.View>

              {/* AI Explanation - Short */}
              <Animated.View
                entering={FadeInDown.delay(100)}
                className="bg-primary-500/10 rounded-xl p-3 mb-4 flex-row items-center"
              >
                <Ionicons name="sparkles" size={16} color="#6366F1" />
                <Text
                  className="text-slate-300 text-sm ml-2 flex-1"
                  numberOfLines={2}
                >
                  {routine.explanation.substring(0, 80)}...
                </Text>
              </Animated.View>

              {/* Rest Time Selector */}
              <View className="flex-row items-center justify-between mb-4 bg-surface rounded-xl p-3">
                <Text className="text-slate-400">Descanso entre series:</Text>
                <View className="flex-row gap-2">
                  {[60, 90, 120].map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => setRestTime(time)}
                      className={`px-3 py-1.5 rounded-lg ${
                        restTime === time
                          ? "bg-primary-500"
                          : "bg-surface-light"
                      }`}
                    >
                      <Text
                        className={
                          restTime === time ? "text-white" : "text-slate-400"
                        }
                      >
                        {time}s
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Exercise List */}
              <Text className="text-white font-semibold mb-3">Ejercicios</Text>
              {routine.exercises.map((exercise, index) => (
                <ExerciseCard
                  key={index}
                  exercise={exercise}
                  index={index}
                  onStart={() => startExercise(index)}
                  isCompleted={completedExercises.has(index)}
                />
              ))}

              {/* New Routine Button */}
              <TouchableOpacity
                onPress={() => {
                  setRoutine(null);
                  setCompletedExercises(new Set());
                }}
                className="flex-row items-center justify-center py-4 mt-4"
              >
                <Ionicons name="refresh" size={20} color="#6366F1" />
                <Text className="text-primary-500 font-semibold ml-2">
                  Nueva Rutina
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        {/* Exercise Timer Modal */}
        <ExerciseTimerModal
          visible={showExerciseTimer}
          exercise={currentExercise}
          currentSet={currentSet}
          totalSets={parseInt(currentExercise?.sets || "3")}
          onComplete={handleExerciseSkip}
          onRest={handleSetComplete}
        />

        {/* Rest Timer Modal */}
        <RestTimerModal
          visible={showRestTimer}
          restTime={restTime}
          onSkip={handleRestComplete}
          onComplete={handleRestComplete}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
