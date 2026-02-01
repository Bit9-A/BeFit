import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LineChart } from "react-native-gifted-charts";
import { Button, Input, Card } from "../../components/ui";
import { useAuthStore } from "../../stores/authStore";
import { useUserStore } from "../../stores/userStore";
import { supabase } from "../../services/supabase";

interface ProfileItemProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onEdit?: () => void;
}

function ProfileItem({ label, value, icon, onEdit }: ProfileItemProps) {
  return (
    <View className="flex-row items-center py-4 border-b border-surface-light">
      <View className="w-10 h-10 bg-primary-500/20 rounded-xl items-center justify-center mr-4 overflow-hidden">
        <Ionicons name={icon} size={20} color="#6366F1" />
      </View>
      <View className="flex-1">
        <Text className="text-slate-400 text-xs">{label}</Text>
        <Text className="text-white font-medium mt-0.5">
          {value || "No definido"}
        </Text>
      </View>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} className="p-2">
          <Ionicons name="pencil" size={18} color="#6366F1" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { profile, fetchProfile } = useUserStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<string>("");
  const [editValue, setEditValue] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Weight history
  const [weights, setWeights] = useState<
    Array<{ weight: number; date: string }>
  >([]);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
      loadWeightHistory();
    }
  }, [user?.id]);

  const loadWeightHistory = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from("measurements")
      .select("weight, recorded_at")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .limit(10);

    if (data) {
      setWeights(
        data.map((d) => ({
          weight: d.weight,
          date: new Date(d.recorded_at).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
          }),
        })),
      );
    }
  };

  const handleEdit = (field: string, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue || "");
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!user?.id) return;
    setSaving(true);

    const updates: Record<string, any> = {};

    switch (editField) {
      case "height":
        updates.height = parseFloat(editValue);
        break;
      case "full_name":
        updates.full_name = editValue;
        break;
      case "goal":
        updates.goal = editValue;
        break;
      case "activity_level":
        updates.activity_level = editValue;
        break;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      Alert.alert("Error", "No se pudo guardar los cambios");
    } else {
      await fetchProfile(user.id);
      setShowEditModal(false);
    }

    setSaving(false);
  };

  const addWeight = async () => {
    if (!user?.id || !newWeight) return;
    setSaving(true);

    const { error } = await supabase.from("measurements").insert({
      user_id: user.id,
      weight: parseFloat(newWeight),
      recorded_at: new Date().toISOString(),
    });

    if (error) {
      Alert.alert("Error", "No se pudo registrar el peso");
    } else {
      setNewWeight("");
      setShowAddWeight(false);
      loadWeightHistory();
    }

    setSaving(false);
  };

  const getGoalLabel = (goal?: string) => {
    switch (goal) {
      case "muscle_gain":
        return "Ganar músculo";
      case "weight_loss":
        return "Perder peso";
      case "maintenance":
        return "Mantenimiento";
      default:
        return "No definido";
    }
  };

  const getActivityLabel = (level?: string) => {
    switch (level) {
      case "sedentary":
        return "Sedentario";
      case "light":
        return "Ligera";
      case "moderate":
        return "Moderada";
      case "active":
        return "Activa";
      case "very_active":
        return "Muy activa";
      default:
        return "No definida";
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "No definida";
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return `${age} años`;
  };

  return (
    <LinearGradient colors={["#09090b", "#18181b"]} className="flex-1">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="flex-1 w-full lg:max-w-7xl mx-auto">
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* Header (Mobile Only) */}
            <Animated.View
              entering={FadeInUp.delay(100)}
              className="mt-4 mb-6 lg:hidden"
            >
              <Text className="text-3xl font-bold text-white">Mi Perfil</Text>
              <Text className="text-slate-400 mt-2">
                Gestiona tu información personal
              </Text>
            </Animated.View>

            <View className="flex-col lg:flex-row lg:gap-10 lg:items-start lg:mt-8">
              {/* LEFT COLUMN (Sidebar) */}
              <View className="lg:w-1/3 lg:sticky lg:top-8 mb-6 lg:mb-0">
                {/* Profile Card */}
                <Animated.View entering={FadeInDown.delay(150)}>
                  <LinearGradient
                    colors={["#A855F7", "#7E22CE"]}
                    className="rounded-3xl p-6 lg:p-10 items-center overflow-hidden shadow-2xl"
                  >
                    <View className="w-24 h-24 lg:w-32 lg:h-32 bg-white/20 rounded-full items-center justify-center mb-4 overflow-hidden border-4 border-white/10">
                      <Text className="text-white text-4xl lg:text-5xl font-bold">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </Text>
                    </View>
                    <Text className="text-white text-2xl lg:text-3xl font-bold text-center">
                      {profile?.full_name || "Usuario"}
                    </Text>
                    <Text className="text-white/80 text-lg mt-1 mb-6">
                      {user?.email}
                    </Text>

                    {/* Desktop Actions (Logout) */}
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS === "web") {
                          if (
                            window.confirm(
                              "¿Estás seguro de que quieres salir?",
                            )
                          ) {
                            signOut();
                          }
                        } else {
                          Alert.alert(
                            "Cerrar Sesión",
                            "¿Estás seguro de que quieres salir?",
                            [
                              { text: "Cancelar", style: "cancel" },
                              {
                                text: "Salir",
                                style: "destructive",
                                onPress: signOut,
                              },
                            ],
                          );
                        }
                      }}
                      className="bg-white/20 w-full py-3 rounded-xl flex-row items-center justify-center overflow-hidden"
                    >
                      <Ionicons name="log-out-outline" size={20} color="#fff" />
                      <Text className="text-white font-semibold ml-2">
                        Cerrar Sesión
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </Animated.View>
              </View>

              {/* RIGHT COLUMN (Content) */}
              <View className="flex-1 lg:w-2/3">
                {/* Desktop Header */}
                <Animated.View
                  entering={FadeInUp.delay(100)}
                  className="hidden lg:flex mb-8"
                >
                  <Text className="text-4xl font-bold text-white">
                    Tu Perfil
                  </Text>
                  <Text className="text-slate-400 text-lg mt-2">
                    Visualiza y edita tus datos y progreso
                  </Text>
                </Animated.View>

                {/* Personal Info */}
                <Animated.View entering={FadeInDown.delay(200)}>
                  <Text className="text-white font-semibold text-lg mb-3">
                    Información Personal
                  </Text>
                  <Card className="mb-6">
                    <ProfileItem
                      label="Nombre"
                      value={profile?.full_name || ""}
                      icon="person"
                      onEdit={() =>
                        handleEdit("full_name", profile?.full_name || "")
                      }
                    />
                    <ProfileItem
                      label="Altura"
                      value={profile?.height ? `${profile.height} cm` : ""}
                      icon="resize-outline"
                      onEdit={() =>
                        handleEdit("height", profile?.height?.toString() || "")
                      }
                    />
                    <ProfileItem
                      label="Edad"
                      value={calculateAge(profile?.birth_date)}
                      icon="calendar"
                    />
                    <ProfileItem
                      label="Género"
                      value={
                        profile?.gender === "male"
                          ? "Masculino"
                          : profile?.gender === "female"
                            ? "Femenino"
                            : "Otro"
                      }
                      icon="male-female"
                    />
                  </Card>
                </Animated.View>

                {/* Fitness Info */}
                <Animated.View entering={FadeInDown.delay(250)}>
                  <Text className="text-white font-semibold text-lg mb-3">
                    Configuración Fitness
                  </Text>
                  <Card className="mb-6">
                    <ProfileItem
                      label="Objetivo"
                      value={getGoalLabel(profile?.goal)}
                      icon="trophy"
                      onEdit={() => handleEdit("goal", profile?.goal || "")}
                    />
                    <ProfileItem
                      label="Nivel de Actividad"
                      value={getActivityLabel(profile?.activity_level)}
                      icon="fitness"
                      onEdit={() =>
                        handleEdit(
                          "activity_level",
                          profile?.activity_level || "",
                        )
                      }
                    />
                  </Card>
                </Animated.View>

                {/* Weight Progress */}
                <Animated.View entering={FadeInDown.delay(300)}>
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white font-semibold text-lg">
                      Historial de Peso
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowAddWeight(true)}
                      className="bg-primary-500 px-3 py-1.5 rounded-lg flex-row items-center overflow-hidden"
                    >
                      <Ionicons name="add" size={16} color="#fff" />
                      <Text className="text-white text-sm ml-1">Añadir</Text>
                    </TouchableOpacity>
                  </View>
                  <Card>
                    {weights.length === 0 ? (
                      <Text className="text-slate-400 text-center py-4">
                        No hay registros de peso
                      </Text>
                    ) : (
                      <>
                        {/* Chart */}
                        {weights.length > 1 && (
                          <View className="mb-6 -ml-4">
                            <LineChart
                              data={weights
                                .slice()
                                .reverse()
                                .map((w) => ({
                                  value: w.weight,
                                  label: w.date,
                                }))}
                              color="#A855F7"
                              thickness={3}
                              dataPointsColor="#C084FC"
                              textColor="gray"
                              yAxisTextStyle={{ color: "gray" }}
                              xAxisLabelTextStyle={{
                                color: "gray",
                                fontSize: 10,
                              }}
                              hideRules
                              hideAxesAndRules
                              curved
                              adjustToWidth
                              width={300} // This might need to be responsive or fixed for grid
                              height={180}
                              initialSpacing={20}
                              spacing={60}
                              isAnimated
                            />
                          </View>
                        )}

                        {/* List */}
                        {weights.slice(0, 5).map((w, i) => (
                          <View
                            key={i}
                            className={`flex-row justify-between py-3 ${
                              i < Math.min(weights.length, 5) - 1
                                ? "border-b border-surface-light"
                                : ""
                            }`}
                          >
                            <Text className="text-slate-400">{w.date}</Text>
                            <Text className="text-white font-semibold">
                              {w.weight} kg
                            </Text>
                          </View>
                        ))}
                      </>
                    )}
                  </Card>
                </Animated.View>

                {/* Mobile Logout Button (Hidden on Desktop) */}
                <Animated.View
                  entering={FadeInDown.delay(350)}
                  className="mt-6 lg:hidden"
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS === "web") {
                        if (
                          window.confirm("¿Estás seguro de que quieres salir?")
                        ) {
                          signOut();
                        }
                      } else {
                        Alert.alert(
                          "Cerrar Sesión",
                          "¿Estás seguro de que quieres salir?",
                          [
                            { text: "Cancelar", style: "cancel" },
                            {
                              text: "Salir",
                              style: "destructive",
                              onPress: signOut,
                            },
                          ],
                        );
                      }
                    }}
                    className="bg-red-500/20 py-4 rounded-2xl flex-row items-center justify-center overflow-hidden"
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#EF4444"
                    />
                    <Text className="text-red-500 font-semibold ml-2">
                      Cerrar Sesión
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          </ScrollView>

          {/* Edit Modal */}
          <Modal visible={showEditModal} transparent animationType="fade">
            <View className="flex-1 bg-black/80 items-center justify-center px-6">
              <View className="bg-surface w-full max-w-sm rounded-3xl p-6 overflow-hidden">
                <Text className="text-white text-lg font-bold mb-4">
                  Editar{" "}
                  {editField === "full_name"
                    ? "Nombre"
                    : editField === "height"
                      ? "Altura"
                      : editField === "goal"
                        ? "Objetivo"
                        : "Actividad"}
                </Text>

                {editField === "goal" ? (
                  <View className="gap-2 mb-4">
                    {["muscle_gain", "weight_loss", "maintenance"].map(
                      (goal) => (
                        <TouchableOpacity
                          key={goal}
                          onPress={() => setEditValue(goal)}
                          className={`py-4 px-4 rounded-xl border overflow-hidden ${
                            editValue === goal
                              ? "bg-primary-500/20 border-primary-500"
                              : "bg-surface-light border-surface-light"
                          }`}
                        >
                          <Text
                            className={
                              editValue === goal
                                ? "text-white"
                                : "text-slate-400"
                            }
                          >
                            {getGoalLabel(goal)}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                ) : editField === "activity_level" ? (
                  <View className="gap-2 mb-4">
                    {[
                      "sedentary",
                      "light",
                      "moderate",
                      "active",
                      "very_active",
                    ].map((level) => (
                      <TouchableOpacity
                        key={level}
                        onPress={() => setEditValue(level)}
                        className={`py-3 px-4 rounded-xl border overflow-hidden ${
                          editValue === level
                            ? "bg-primary-500/20 border-primary-500"
                            : "bg-surface-light border-surface-light"
                        }`}
                      >
                        <Text
                          className={
                            editValue === level
                              ? "text-white"
                              : "text-slate-400"
                          }
                        >
                          {getActivityLabel(level)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Input
                    value={editValue}
                    onChangeText={setEditValue}
                    placeholder={
                      editField === "height" ? "Ej: 170" : "Ingresa valor"
                    }
                    keyboardType={
                      editField === "height" ? "numeric" : "default"
                    }
                  />
                )}

                <View className="flex-row gap-3 mt-4">
                  <TouchableOpacity
                    onPress={() => setShowEditModal(false)}
                    className="flex-1 py-3 bg-surface-light rounded-xl items-center overflow-hidden"
                  >
                    <Text className="text-slate-400 font-medium">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={saveEdit}
                    disabled={saving}
                    className="flex-1 py-3 bg-primary-500 rounded-xl items-center overflow-hidden"
                  >
                    <Text className="text-white font-medium">
                      {saving ? "Guardando..." : "Guardar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Add Weight Modal */}
          <Modal visible={showAddWeight} transparent animationType="fade">
            <View className="flex-1 bg-black/80 items-center justify-center px-6">
              <View className="bg-surface w-full max-w-sm rounded-3xl p-6 overflow-hidden">
                <Text className="text-white text-lg font-bold mb-4">
                  Registrar Peso
                </Text>
                <Input
                  value={newWeight}
                  onChangeText={setNewWeight}
                  placeholder="Ej: 75.5"
                  keyboardType="numeric"
                  icon="scale-outline"
                />
                <View className="flex-row gap-3 mt-4">
                  <TouchableOpacity
                    onPress={() => setShowAddWeight(false)}
                    className="flex-1 py-3 bg-surface-light rounded-xl items-center overflow-hidden"
                  >
                    <Text className="text-slate-400 font-medium">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={addWeight}
                    disabled={saving || !newWeight}
                    className="flex-1 py-3 bg-accent-500 rounded-xl items-center overflow-hidden"
                  >
                    <Text className="text-white font-medium">
                      {saving ? "Guardando..." : "Guardar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
