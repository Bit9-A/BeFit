import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Button, Input } from "../../components/ui";

// Simple date picker with wheels
function DatePickerModal({
  visible,
  onClose,
  onSelect,
  initialDate,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  initialDate: { day: number; month: number; year: number };
}) {
  const [day, setDay] = useState(initialDate.day);
  const [month, setMonth] = useState(initialDate.month);
  const [year, setYear] = useState(initialDate.year);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 80 },
    (_, i) => currentYear - 80 + i + 1,
  ).reverse();

  const handleConfirm = () => {
    const formattedMonth = month.toString().padStart(2, "0");
    const formattedDay = day.toString().padStart(2, "0");
    onSelect(`${year}-${formattedMonth}-${formattedDay}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-surface rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-slate-400">Cancelar</Text>
            </TouchableOpacity>
            <Text className="text-white font-semibold text-lg">
              Fecha de Nacimiento
            </Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text className="text-primary-500 font-semibold">Listo</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-4 mb-6">
            {/* Day Selector */}
            <View className="flex-1">
              <Text className="text-slate-400 text-center mb-2">Día</Text>
              <ScrollView
                className="h-40 bg-surface-light rounded-xl"
                showsVerticalScrollIndicator={false}
              >
                {days.map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDay(d)}
                    className={`py-3 ${day === d ? "bg-primary-500/20" : ""}`}
                  >
                    <Text
                      className={`text-center text-lg ${
                        day === d
                          ? "text-primary-500 font-bold"
                          : "text-slate-300"
                      }`}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Month Selector */}
            <View className="flex-2">
              <Text className="text-slate-400 text-center mb-2">Mes</Text>
              <ScrollView
                className="h-40 bg-surface-light rounded-xl"
                showsVerticalScrollIndicator={false}
              >
                {months.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    onPress={() => setMonth(m.value)}
                    className={`py-3 px-4 ${month === m.value ? "bg-primary-500/20" : ""}`}
                  >
                    <Text
                      className={`text-center ${
                        month === m.value
                          ? "text-primary-500 font-bold"
                          : "text-slate-300"
                      }`}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Year Selector */}
            <View className="flex-1">
              <Text className="text-slate-400 text-center mb-2">Año</Text>
              <ScrollView
                className="h-40 bg-surface-light rounded-xl"
                showsVerticalScrollIndicator={false}
              >
                {years.map((y) => (
                  <TouchableOpacity
                    key={y}
                    onPress={() => setYear(y)}
                    className={`py-3 ${year === y ? "bg-primary-500/20" : ""}`}
                  >
                    <Text
                      className={`text-center text-lg ${
                        year === y
                          ? "text-primary-500 font-bold"
                          : "text-slate-300"
                      }`}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View className="bg-primary-500/10 rounded-xl p-4 border border-primary-500/30">
            <Text className="text-primary-400 text-center text-lg font-semibold">
              {day} de {months.find((m) => m.value === month)?.label} de {year}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function OnboardingStep1() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState("");

  const getInitialDate = () => {
    if (birthDate) {
      const parts = birthDate.split("-");
      return {
        year: parseInt(parts[0]) || 1990,
        month: parseInt(parts[1]) || 1,
        day: parseInt(parts[2]) || 1,
      };
    }
    return { day: 1, month: 1, year: 1990 };
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    return `${parts[2]} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
  };

  const handleNext = () => {
    if (!height || !weight || !birthDate) {
      setError("Por favor completa todos los campos");
      return;
    }

    router.push({
      pathname: "/(onboarding)/step2",
      params: { height, weight, birthDate },
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
              <View className="w-1/3 h-full bg-primary-500 rounded-full" />
            </View>
            <Text className="text-slate-400 ml-3">1/3</Text>
          </Animated.View>

          {/* Header */}
          <Animated.View entering={FadeInUp.delay(150)}>
            <Text className="text-3xl font-bold text-white mb-2">Sobre Ti</Text>
            <Text className="text-slate-400 text-base mb-8">
              Necesitamos algunos datos para calcular tus métricas de salud
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(250)}
            className="bg-surface/60 rounded-3xl p-6 border border-surface-light"
          >
            {error ? (
              <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
                <Text className="text-red-400 text-center">{error}</Text>
              </View>
            ) : null}

            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-accent-500/20 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="resize-outline" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Input
                  label="Altura (cm)"
                  placeholder="170"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-secondary-500/20 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="scale-outline" size={24} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Input
                  label="Peso (kg)"
                  placeholder="70"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-primary-500/20 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="calendar-outline" size={24} color="#6366F1" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-300 text-sm font-medium mb-2">
                  Fecha de Nacimiento
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="bg-surface border border-surface-light rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                >
                  <Text className={birthDate ? "text-white" : "text-slate-500"}>
                    {birthDate
                      ? formatDisplayDate(birthDate)
                      : "Toca para seleccionar"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Next Button */}
          <Animated.View entering={FadeInDown.delay(350)} className="mt-8">
            <Button
              title="Continuar"
              onPress={handleNext}
              size="lg"
              icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
            />
          </Animated.View>
        </ScrollView>

        {/* Date Picker Modal */}
        <DatePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelect={setBirthDate}
          initialDate={getInitialDate()}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
