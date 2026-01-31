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
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Button, Input } from "../../components/ui";
import { useAuthStore } from "../../stores/authStore";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { signUp, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setError("");
    const result = await signUp(email, password, fullName);
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
            {/* Header */}
            <Animated.View
              entering={FadeInUp.delay(100).springify()}
              className="items-center mb-8"
            >
              <View className="w-16 h-16 bg-secondary-500 rounded-2xl items-center justify-center mb-3">
                <Ionicons name="person-add" size={32} color="#fff" />
              </View>
              <Text className="text-3xl font-bold text-white">
                Crear Cuenta
              </Text>
              <Text className="text-slate-400 mt-2 text-center">
                Únete a la comunidad Be Fit
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              className="bg-surface/50 rounded-3xl p-6 border border-surface-light"
            >
              {error ? (
                <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
                  <Text className="text-red-400 text-center">{error}</Text>
                </View>
              ) : null}

              <Input
                label="Nombre Completo"
                placeholder="Tu nombre"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                icon="person"
              />

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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon="lock-closed"
              />

              <Input
                label="Confirmar Contraseña"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                icon="lock-closed"
              />

              <Button
                title="Crear Cuenta"
                onPress={handleRegister}
                loading={isLoading}
                variant="secondary"
                className="mt-2"
                size="lg"
              />

              <View className="flex-row justify-center mt-6">
                <Text className="text-slate-400">¿Ya tienes cuenta? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-primary-500 font-semibold">
                      Inicia Sesión
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
