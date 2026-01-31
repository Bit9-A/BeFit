import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
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
      <View className="w-10 h-10 bg-primary-500/20 rounded-xl items-center justify-center mr-4">
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
    <LinearGradient colors={["#0F172A", "#1E293B"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100)} className="mt-4 mb-6">
            <Text className="text-3xl font-bold text-white">Mi Perfil</Text>
            <Text className="text-slate-400 mt-2">
              Gestiona tu información personal
            </Text>
          </Animated.View>

          {/* Profile Card */}
          <Animated.View entering={FadeInDown.delay(150)}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              className="rounded-3xl p-6 mb-6 items-center"
            >
              <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-3">
                <Text className="text-white text-3xl font-bold">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
              <Text className="text-white text-xl font-bold">
                {profile?.full_name || "Usuario"}
              </Text>
              <Text className="text-white/70">{user?.email}</Text>
            </LinearGradient>
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
                onEdit={() => handleEdit("full_name", profile?.full_name || "")}
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
                  handleEdit("activity_level", profile?.activity_level || "")
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
                className="bg-primary-500 px-3 py-1.5 rounded-lg flex-row items-center"
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
                weights.map((w, i) => (
                  <View
                    key={i}
                    className={`flex-row justify-between py-3 ${
                      i < weights.length - 1
                        ? "border-b border-surface-light"
                        : ""
                    }`}
                  >
                    <Text className="text-slate-400">{w.date}</Text>
                    <Text className="text-white font-semibold">
                      {w.weight} kg
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View entering={FadeInDown.delay(350)} className="mt-6">
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "web") {
                  if (window.confirm("¿Estás seguro de que quieres salir?")) {
                    signOut();
                  }
                } else {
                  Alert.alert(
                    "Cerrar Sesión",
                    "¿Estás seguro de que quieres salir?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Salir", style: "destructive", onPress: signOut },
                    ],
                  );
                }
              }}
              className="bg-red-500/20 py-4 rounded-2xl flex-row items-center justify-center"
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text className="text-red-500 font-semibold ml-2">
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Edit Modal */}
        <Modal visible={showEditModal} transparent animationType="fade">
          <View className="flex-1 bg-black/80 items-center justify-center px-6">
            <View className="bg-surface w-full rounded-3xl p-6">
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
                  {["muscle_gain", "weight_loss", "maintenance"].map((goal) => (
                    <TouchableOpacity
                      key={goal}
                      onPress={() => setEditValue(goal)}
                      className={`py-4 px-4 rounded-xl border ${
                        editValue === goal
                          ? "bg-primary-500/20 border-primary-500"
                          : "bg-surface-light border-surface-light"
                      }`}
                    >
                      <Text
                        className={
                          editValue === goal ? "text-white" : "text-slate-400"
                        }
                      >
                        {getGoalLabel(goal)}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
                      className={`py-3 px-4 rounded-xl border ${
                        editValue === level
                          ? "bg-primary-500/20 border-primary-500"
                          : "bg-surface-light border-surface-light"
                      }`}
                    >
                      <Text
                        className={
                          editValue === level ? "text-white" : "text-slate-400"
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
                  keyboardType={editField === "height" ? "numeric" : "default"}
                />
              )}

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-surface-light rounded-xl items-center"
                >
                  <Text className="text-slate-400 font-medium">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveEdit}
                  disabled={saving}
                  className="flex-1 py-3 bg-primary-500 rounded-xl items-center"
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
            <View className="bg-surface w-full rounded-3xl p-6">
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
                  className="flex-1 py-3 bg-surface-light rounded-xl items-center"
                >
                  <Text className="text-slate-400 font-medium">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={addWeight}
                  disabled={saving || !newWeight}
                  className="flex-1 py-3 bg-accent-500 rounded-xl items-center"
                >
                  <Text className="text-white font-medium">
                    {saving ? "Guardando..." : "Guardar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
