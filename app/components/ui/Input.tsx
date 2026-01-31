import React, { useState } from "react";
import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  icon,
  className = "",
  accessibilityLabel,
  accessibilityHint,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-slate-300 text-sm font-medium mb-2">{label}</Text>
      )}

      <View
        className={`
          flex-row items-center
          bg-surface border rounded-xl px-4
          ${isFocused ? "border-primary-500" : "border-surface-light"}
          ${error ? "border-red-500" : ""}
        `}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? "#6366F1" : "#94A3B8"}
            style={{ marginRight: 12 }}
          />
        )}

        <TextInput
          className="flex-1 py-3.5 text-white text-base"
          placeholder={placeholder}
          placeholderTextColor="#64748B"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint || placeholder}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
