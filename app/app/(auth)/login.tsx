import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
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
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
            className="px-6"
          >
            {/* Logo & Title */}
            <Animated.View
              entering={FadeInUp.delay(100).springify()}
              className="items-center mb-10"
            >
              <View className="w-20 h-20 bg-primary-500 rounded-3xl items-center justify-center mb-4 shadow-lg">
                <Ionicons name="fitness" size={40} color="#fff" />
              </View>
              <Text className="text-4xl font-bold text-white">Be Fit</Text>
              <Text className="text-slate-400 mt-2 text-center">
                Tu compañero de bienestar holístico
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              className="bg-surface/50 rounded-3xl p-6 border border-surface-light"
            >
              <Text className="text-2xl font-bold text-white mb-6">
                Iniciar Sesión
              </Text>

              {error ? (
                <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
                  <Text className="text-red-400 text-center">{error}</Text>
                </View>
              ) : null}

              <Input
                label="Correo Electrónico"
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                icon="mail"
              />

              <Input
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon="lock-closed"
              />

              <Button
                title="Iniciar Sesión"
                onPress={handleLogin}
                loading={isLoading}
                className="mt-2"
                size="lg"
              />

              <View className="flex-row justify-center mt-6">
                <Text className="text-slate-400">¿No tienes cuenta? </Text>
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity>
                    <Text className="text-primary-500 font-semibold">
                      Regístrate
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
