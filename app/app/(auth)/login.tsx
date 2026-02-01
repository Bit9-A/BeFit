import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Button, Input } from "../../components/ui";
import { useAuthStore } from "../../stores/authStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setError("");
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <LinearGradient
      colors={["#0F172A", "#1E1B4B", "#0F172A"]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            className="flex-1"
          >
            <View className="flex-1 flex-col lg:flex-row">
              {/* DESKTOP SIDE PANEL (Brand) */}
              <View className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
                <Animated.View
                  entering={FadeInUp.delay(200).springify()}
                  className="items-center"
                >
                  <Image
                    source={require("../../assets/images/icon.png")}
                    className="w-64 h-64 rounded-[48px] shadow-2xl mb-8"
                    resizeMode="contain"
                  />
                  <Text className="text-7xl font-bold text-white tracking-tight text-center shadow-neon-cyan">
                    Be Fit
                  </Text>
                  <Text className="text-slate-300 mt-4 text-center text-3xl font-medium max-w-lg">
                    Tu compañero de bienestar holístico e inteligente
                  </Text>
                </Animated.View>
              </View>

              {/* MAIN CONTENT (Form) */}
              <View className="flex-1 lg:w-1/2 items-center justify-center px-6 py-12">
                <View className="w-full max-w-md">
                  {/* MOBILE HEADER (Logo & Title) - Hidden on Large Screens */}
                  <Animated.View
                    entering={FadeInUp.delay(100).springify()}
                    className="items-center mb-8 lg:hidden"
                  >
                    <Image
                      source={require("../../assets/images/icon.png")}
                      className="w-32 h-32 mb-6 rounded-3xl shadow-xl"
                      style={{ borderRadius: 32 }}
                      resizeMode="contain"
                    />
                    <Text className="text-4xl font-bold text-white tracking-tight text-center">
                      Be Fit
                    </Text>
                    <Text className="text-slate-400 mt-2 text-center text-lg">
                      Tu compañero de bienestar holístico
                    </Text>
                  </Animated.View>

                  {/* Form Card */}
                  <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    className="bg-surface/50 rounded-3xl p-6 lg:p-10 border border-surface-light shadow-xl"
                  >
                    <Text className="text-2xl lg:text-3xl font-bold text-white mb-6 lg:mb-8 text-center">
                      Iniciar Sesión
                    </Text>

                    {error ? (
                      <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
                        <Text className="text-red-400 text-center">
                          {error}
                        </Text>
                      </View>
                    ) : null}

                    <Input
                      label="Correo Electrónico"
                      placeholder="tu@email.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      icon="mail"
                      accessibilityLabel="Campo de correo electrónico"
                      accessibilityHint="Introduce tu correo electrónico registrado"
                      className="mb-0"
                    />

                    <Input
                      label="Contraseña"
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      icon="lock-closed"
                      accessibilityLabel="Campo de contraseña"
                      accessibilityHint="Introduce tu contraseña"
                      className="mt-4"
                    />

                    <Button
                      title="Iniciar Sesión"
                      onPress={handleLogin}
                      loading={isLoading}
                      className="mt-2 shadow-lg bg-primary-500"
                      size="lg"
                      accessibilityLabel="Iniciar Sesión"
                      accessibilityHint="Presiona para entrar a la aplicación"
                    />

                    <View className="flex-row justify-center mt-8">
                      <Text className="text-slate-400">
                        ¿No tienes cuenta?{" "}
                      </Text>
                      <Link href="/(auth)/register" asChild>
                        <TouchableOpacity>
                          <Text className="text-primary-500 font-semibold">
                            Regístrate
                          </Text>
                        </TouchableOpacity>
                      </Link>
                    </View>
                  </Animated.View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
