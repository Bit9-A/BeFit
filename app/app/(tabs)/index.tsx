import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Card } from "../../components/ui";
import { useAuthStore } from "../../stores/authStore";
import { useUserStore } from "../../stores/userStore";
import { supabase } from "../../services/supabase";
import { XPBar } from "../../components/gamification/XPBar";
import { StreakBadge } from "../../components/gamification/StreakBadge";
import { DailyMissions } from "../../components/gamification/DailyMissions";
import { useGamificationStore } from "../../stores/gamificationStore";

import { triggerHaptic } from "../../services/haptics";

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}

function QuickAction({
  icon,
  label,
  color,
  bgColor,
  onPress,
}: QuickActionProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        triggerHaptic("medium");
        onPress();
      }}
      className="items-center flex-1"
      activeOpacity={0.7}
    >
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
        style={{ backgroundColor: bgColor }}
      >
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text className="text-slate-400 text-xs font-medium">{label}</Text>
    </TouchableOpacity>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
  return (
    <View className="bg-surface/80 rounded-2xl overflow-hidden p-4 flex-1 border border-surface-light">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-slate-400 text-sm">{title}</Text>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      {subtitle && (
        <Text className="text-slate-500 text-xs mt-1">{subtitle}</Text>
      )}
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, metrics, fetchProfile, calculateAndSaveMetrics } =
    useUserStore();
  const [refreshing, setRefreshing] = useState(false);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);

  const fetchLatestData = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
      await useGamificationStore.getState().fetchGamification(user.id);

      // Fetch latest weight
      const { data } = await supabase
        .from("measurements")
        .select("weight")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.weight) {
        setLatestWeight(data.weight);
      }

      // Calculate metrics if not already present
      if (!metrics?.bmi) {
        await calculateAndSaveMetrics(user.id);
      }
    }
  };

  useEffect(() => {
    fetchLatestData();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLatestData();
    if (user?.id) {
      await calculateAndSaveMetrics(user.id);
    }
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <LinearGradient colors={["#0F172A", "#1E293B"]} className="flex-1">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="flex-1 w-full max-w-md mx-auto">
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6366F1"
              />
            }
          >
            {/* Header */}
            <Animated.View
              entering={FadeInDown.delay(100)}
              className="flex-row items-center justify-between mt-4 mb-6"
            >
              <View>
                <Text className="text-slate-400 text-base">{greeting()}</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-white text-2xl font-bold mr-2">
                    {profile?.full_name?.split(" ")[0] || "Usuario"}
                  </Text>
                  <StreakBadge />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                className="w-11 h-11 bg-surface rounded-full items-center justify-center border border-surface-light"
              >
                <Text className="text-white text-lg font-bold">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Gamification Bar */}
            <Animated.View entering={FadeInDown.delay(120)}>
              <XPBar />
            </Animated.View>

            {/* Daily Missions Widget (Replaces Goal Card) */}
            <DailyMissions />

            {/* Metrics Grid */}
            <Animated.View
              entering={FadeInDown.delay(200)}
              className="flex-row gap-3 mb-6"
            >
              <MetricCard
                title="BMI"
                value={metrics?.bmi || "--"}
                subtitle={metrics?.status}
                icon="analytics"
                color="#6366F1"
              />
              <MetricCard
                title="Peso"
                value={latestWeight ? `${latestWeight} kg` : "--"}
                subtitle="Último registro"
                icon="scale"
                color="#8B5CF6"
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(250)}
              className="flex-row gap-3 mb-6"
            >
              <MetricCard
                title="TMB"
                value={metrics?.tmb ? `${metrics.tmb}` : "--"}
                subtitle="kcal/día"
                icon="flame"
                color="#F97316"
              />
              <MetricCard
                title="TDEE"
                value={metrics?.tdee ? `${metrics.tdee}` : "--"}
                subtitle="kcal necesarias"
                icon="nutrition"
                color="#10B981"
              />
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View entering={FadeInDown.delay(300)}>
              <Text className="text-white text-lg font-semibold mb-4">
                Acciones Rápidas
              </Text>
              <View className="bg-surface/60 rounded-3xl overflow-hidden p-5 flex-row border border-surface-light">
                <QuickAction
                  icon="barbell"
                  label="Entrenar"
                  color="#6366F1"
                  bgColor="rgba(99, 102, 241, 0.2)"
                  onPress={() => router.push("/gym")}
                />
                <QuickAction
                  icon="camera"
                  label="Escanear"
                  color="#10B981"
                  bgColor="rgba(16, 185, 129, 0.2)"
                  onPress={() => router.push("/kitchen")}
                />
                <QuickAction
                  icon="chatbubble"
                  label="Hablar"
                  color="#8B5CF6"
                  bgColor="rgba(139, 92, 246, 0.2)"
                  onPress={() => router.push("/mind")}
                />
                <QuickAction
                  icon="book"
                  label="Leer"
                  color="#F97316"
                  bgColor="rgba(249, 115, 22, 0.2)"
                  onPress={() => router.push("/mind")}
                />
              </View>
            </Animated.View>

            {/* Tips Card */}
            <Animated.View entering={FadeInDown.delay(350)} className="mt-6">
              <Card variant="default" className="border-accent-500/30">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-accent-500/20 rounded-2xl items-center justify-center mr-4">
                    <Ionicons name="bulb" size={24} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">
                      Tip del día
                    </Text>
                    <Text className="text-slate-400 text-sm mt-1">
                      Beber agua antes de cada comida ayuda a controlar el
                      apetito
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
