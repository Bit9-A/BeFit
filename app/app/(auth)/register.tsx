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
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            className="flex-1"
          >
            <View className="flex-1 flex-col lg:flex-row">
              {/* DESKTOP SIDE PANEL (Brand) */}
              <View className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
                {/* Decorative Background Elements could go here */}
                <Animated.View
                  entering={FadeInUp.delay(200).springify()}
                  className="items-center z-10"
                >
                  <Image
                    source={require("../../assets/images/icon.png")}
                    className="w-56 h-56 rounded-[40px] shadow-2xl mb-8"
                    resizeMode="contain"
                  />
                  <Text className="text-6xl font-bold text-white tracking-tight text-center shadow-neon-purple">
                    Únete a Be Fit
                  </Text>
                  <Text className="text-slate-300 mt-4 text-center text-2xl font-medium max-w-md">
                    Empieza tu transformación hoy mismo. Mente, cuerpo y cocina
                    personalizados.
                  </Text>
                </Animated.View>
              </View>

              {/* MAIN CONTENT (Form) */}
              <View className="flex-1 lg:w-1/2 items-center justify-center px-6 py-12">
                <View className="w-full max-w-md">
                  {/* MOBILE HEADER - Hidden on Large Screens */}
                  <Animated.View
                    entering={FadeInUp.delay(100).springify()}
                    className="items-center mb-8 lg:hidden"
                  >
                    <Image
                      source={require("../../assets/images/icon.png")}
                      className="w-24 h-24 mb-4 rounded-3xl shadow-xl"
                      resizeMode="contain"
                      style={{ borderRadius: 24 }}
                    />
                    <Text className="text-3xl font-bold text-white tracking-tight text-center">
                      Crear Cuenta
                    </Text>
                    <Text className="text-slate-400 mt-2 text-center">
                      Únete a la comunidad Be Fit
                    </Text>
                  </Animated.View>

                  {/* Form Card */}
                  <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    className="bg-surface/50 rounded-3xl p-6 lg:p-10 border border-surface-light shadow-xl"
                  >
                    <Text className="text-2xl lg:text-3xl font-bold text-white mb-6 lg:mb-8 text-center">
                      Registro
                    </Text>

                    {error ? (
                      <View className="bg-red-500/20 border border-red-500 rounded-xl p-3 mb-4">
                        <Text className="text-red-400 text-center">
                          {error}
                        </Text>
                      </View>
                    ) : null}

                    <Input
                      label="Nombre Completo"
                      placeholder="Tu nombre"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                      icon="person"
                      accessibilityLabel="Campo de nombre completo"
                      accessibilityHint="Introduce tu nombre y apellido"
                    />

                    <Input
                      label="Correo Electrónico"
                      placeholder="tu@email.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      icon="mail"
                      accessibilityLabel="Campo de correo electrónico"
                      accessibilityHint="Introduce un correo válido"
                    />

                    <Input
                      label="Contraseña"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      icon="lock-closed"
                      accessibilityLabel="Campo de contraseña"
                      accessibilityHint="Crea una contraseña de al menos 6 caracteres"
                    />

                    <Input
                      label="Confirmar Contraseña"
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      icon="lock-closed"
                      accessibilityLabel="Campo de confirmación de contraseña"
                      accessibilityHint="Repite la contraseña anterior"
                    />

                    <Button
                      title="Crear Cuenta"
                      onPress={handleRegister}
                      loading={isLoading}
                      variant="secondary"
                      className="mt-6 shadow-lg"
                      size="lg"
                      accessibilityLabel="Crear Cuenta"
                      accessibilityHint="Presiona para registrarte en la aplicación"
                    />

                    <View className="flex-row justify-center mt-8">
                      <Text className="text-slate-400">
                        ¿Ya tienes cuenta?{" "}
                      </Text>
                      <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                          <Text className="text-primary-500 font-semibold">
                            Inicia Sesión
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
