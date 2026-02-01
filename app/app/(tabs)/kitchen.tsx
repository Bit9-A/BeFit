import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated";
import { Button, Card, Skeleton } from "../../components/ui";
import { api } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { useGamificationStore } from "../../stores/gamificationStore";
import { FridgeAnalysis } from "../../types";

export default function KitchenScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FridgeAnalysis | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu cámara");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const analyzeFridge = async () => {
    if (!imageUri) return;

    setLoading(true);
    const response = await api.analyzeFridge(imageUri, undefined, user?.id);

    if (response.data) {
      setAnalysis(response.data as FridgeAnalysis);
      // Award XP for analysis
      if (user?.id) {
        useGamificationStore.getState().addXP(user.id, 30, "fridge_analysis");
      }
    } else {
      Alert.alert("Error", response.error || "No se pudo analizar la imagen");
    }

    setLoading(false);
  };

  const resetAnalysis = () => {
    setImageUri(null);
    setAnalysis(null);
  };

  return (
    <LinearGradient colors={["#09090b", "#18181b"]} className="flex-1">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="flex-1 w-full max-w-md mx-auto">
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* Header */}
            <Animated.View entering={FadeInUp.delay(100)} className="mt-4 mb-6">
              <Text className="text-3xl font-bold text-white">
                Cocina Inteligente
              </Text>
              <Text className="text-slate-400 mt-2">
                Analiza tu nevera y obtén recetas personalizadas
              </Text>
            </Animated.View>

            {!imageUri && !analysis ? (
              <>
                {/* Camera Card */}
                <Animated.View entering={FadeInDown.delay(200)}>
                  <LinearGradient
                    colors={["#0891B2", "#22D3EE"]}
                    className="rounded-3xl p-6 mb-6 overflow-hidden"
                  >
                    <View className="items-center">
                      <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-4 overflow-hidden">
                        <Ionicons name="scan" size={40} color="#fff" />
                      </View>
                      <Text className="text-white text-xl font-bold text-center">
                        La Nevera Mágica
                      </Text>
                      <Text className="text-white/70 text-center mt-2 mb-6">
                        Toma una foto de tu nevera y la IA identificará los
                        ingredientes para crear una receta perfecta para ti
                      </Text>

                      <View className="flex-row gap-4">
                        <TouchableOpacity
                          onPress={takePhoto}
                          className="flex-1 bg-white/20 py-4 rounded-2xl flex-row items-center justify-center overflow-hidden"
                        >
                          <Ionicons name="camera" size={22} color="#fff" />
                          <Text className="text-white font-semibold ml-2">
                            Cámara
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={pickImage}
                          className="flex-1 bg-white/20 py-4 rounded-2xl flex-row items-center justify-center overflow-hidden"
                        >
                          <Ionicons name="images" size={22} color="#fff" />
                          <Text className="text-white font-semibold ml-2">
                            Galería
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>

                {/* How it works */}
                <Animated.View entering={FadeInDown.delay(300)}>
                  <Text className="text-white font-semibold text-lg mb-4">
                    ¿Cómo funciona?
                  </Text>
                  <Card>
                    <View className="flex-row items-center mb-4">
                      <View className="w-10 h-10 bg-accent-500/20 rounded-xl items-center justify-center mr-3 overflow-hidden">
                        <Text className="text-accent-500 font-bold">1</Text>
                      </View>
                      <Text className="text-slate-300 flex-1">
                        Toma una foto de tu nevera abierta
                      </Text>
                    </View>
                    <View className="flex-row items-center mb-4">
                      <View className="w-10 h-10 bg-primary-500/20 rounded-xl items-center justify-center mr-3 overflow-hidden">
                        <Text className="text-primary-500 font-bold">2</Text>
                      </View>
                      <Text className="text-slate-300 flex-1">
                        La IA detecta los ingredientes disponibles
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-secondary-500/20 rounded-xl items-center justify-center mr-3 overflow-hidden">
                        <Text className="text-secondary-500 font-bold">3</Text>
                      </View>
                      <Text className="text-slate-300 flex-1">
                        Recibe una receta saludable personalizada
                      </Text>
                    </View>
                  </Card>
                </Animated.View>
              </>
            ) : !analysis ? (
              <>
                {/* Image Preview */}
                <Animated.View entering={FadeIn}>
                  <View className="rounded-3xl overflow-hidden mb-6 border border-surface-light">
                    <Image
                      source={{ uri: imageUri! }}
                      className="w-full h-64"
                      resizeMode="cover"
                    />
                  </View>
                </Animated.View>

                {/* Actions */}
                <Animated.View entering={FadeInDown.delay(100)}>
                  <TouchableOpacity
                    onPress={analyzeFridge}
                    disabled={loading}
                    activeOpacity={0.9}
                    className="w-full mb-4"
                  >
                    <LinearGradient
                      colors={["#22D3EE", "#06B6D4"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="py-4 px-6 rounded-3xl flex-row items-center justify-center shadow-neon-cyan overflow-hidden"
                    >
                      {loading ? (
                        <View className="flex-row items-center gap-3">
                          <ActivityIndicator color="#fff" />
                          <Text className="text-white text-lg font-bold">
                            Analizando...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <View className="bg-white/20 p-2 rounded-xl mr-3 overflow-hidden">
                            <Ionicons name="sparkles" size={24} color="#fff" />
                          </View>
                          <View className="items-start">
                            <Text className="text-white text-lg font-bold">
                              Analizar Ingredientes
                            </Text>
                            <Text className="text-emerald-100 text-xs">
                              IA Vision
                            </Text>
                          </View>
                          <View className="flex-1" />
                          <Ionicons
                            name="scan-outline"
                            size={24}
                            color="#fff"
                          />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Loading Skeletons */}
                  {loading && (
                    <Animated.View
                      entering={FadeInDown}
                      className="w-full mt-2"
                    >
                      <Card className="mb-4">
                        <View className="flex-row gap-2 mb-4">
                          <Skeleton width={80} height={20} borderRadius={20} />
                          <Skeleton width={60} height={20} borderRadius={20} />
                          <Skeleton width={90} height={20} borderRadius={20} />
                        </View>
                        <Skeleton width="100%" height={200} borderRadius={16} />
                      </Card>
                      <Card>
                        <Skeleton width="60%" height={24} className="mb-4" />
                        <Skeleton width="100%" height={16} className="mb-2" />
                        <Skeleton width="100%" height={16} className="mb-2" />
                        <Skeleton width="80%" height={16} />
                      </Card>
                    </Animated.View>
                  )}

                  <TouchableOpacity
                    onPress={resetAnalysis}
                    className="flex-row items-center justify-center py-3"
                  >
                    <Ionicons name="refresh" size={20} color="#94A3B8" />
                    <Text className="text-slate-400 font-medium ml-2">
                      Tomar otra foto
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </>
            ) : (
              <>
                {/* Analysis Results */}
                <Animated.View entering={FadeInDown.delay(100)}>
                  {/* Ingredients */}
                  <Card className="mb-4">
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="nutrition" size={20} color="#10B981" />
                      <Text className="text-white font-semibold ml-2">
                        Ingredientes Detectados
                      </Text>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                      {analysis.ingredientes_detectados?.map((ing, i) => (
                        <View
                          key={i}
                          className="bg-accent-500/20 px-3 py-1.5 rounded-full overflow-hidden"
                        >
                          <Text className="text-accent-400 text-sm">{ing}</Text>
                        </View>
                      ))}
                    </View>
                  </Card>
                </Animated.View>

                {/* Recipe */}
                {analysis.receta && (
                  <Animated.View entering={FadeInDown.delay(200)}>
                    <LinearGradient
                      colors={["#6366F1", "#8B5CF6"]}
                      className="rounded-3xl p-5 mb-4 overflow-hidden"
                    >
                      <Text className="text-white text-xl font-bold mb-2">
                        {analysis.receta.nombre}
                      </Text>

                      {/* Macros */}
                      <View className="flex-row gap-3 mb-4">
                        <View className="flex-1 bg-white/20 rounded-xl p-3 items-center overflow-hidden">
                          <Text className="text-white/70 text-xs">
                            Calorías
                          </Text>
                          <Text className="text-white font-bold">
                            {analysis.receta.calorias}
                          </Text>
                        </View>
                        <View className="flex-1 bg-white/20 rounded-xl p-3 items-center overflow-hidden">
                          <Text className="text-white/70 text-xs">
                            Proteína
                          </Text>
                          <Text className="text-white font-bold">
                            {analysis.receta.macros?.proteina || "0g"}
                          </Text>
                        </View>
                        <View className="flex-1 bg-white/20 rounded-xl p-3 items-center overflow-hidden">
                          <Text className="text-white/70 text-xs">Carbos</Text>
                          <Text className="text-white font-bold">
                            {analysis.receta.macros?.carbohidratos || "0g"}
                          </Text>
                        </View>
                      </View>

                      {/* Instructions */}
                      <Text className="text-white font-semibold mb-2">
                        Instrucciones
                      </Text>
                      {analysis.receta.instrucciones?.map((step, i) => (
                        <View key={i} className="flex-row mb-2">
                          <Text className="text-white/70 mr-2">{i + 1}.</Text>
                          <Text className="text-white/90 flex-1">{step}</Text>
                        </View>
                      ))}
                    </LinearGradient>
                  </Animated.View>
                )}

                {/* XAI Explanation */}
                {analysis.explicacion_xai && (
                  <Animated.View entering={FadeInDown.delay(300)}>
                    <Card className="border-accent-500/30">
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="sparkles" size={18} color="#10B981" />
                        <Text className="text-accent-400 font-semibold ml-2">
                          ¿Por qué esta receta?
                        </Text>
                      </View>
                      <Text className="text-slate-300 text-sm">
                        {analysis.explicacion_xai}
                      </Text>
                    </Card>
                  </Animated.View>
                )}

                {/* Reset Button */}
                <TouchableOpacity
                  onPress={resetAnalysis}
                  className="flex-row items-center justify-center py-4 mt-4"
                >
                  <Ionicons name="camera" size={20} color="#6366F1" />
                  <Text className="text-primary-500 font-semibold ml-2">
                    Escanear otra nevera
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
