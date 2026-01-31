import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { safeHaptics } from "../../services/haptics";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  className = "",
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    safeHaptics.light();
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const baseClasses = "flex-row items-center justify-center rounded-2xl";

  const sizeClasses = {
    sm: "px-4 py-2",
    md: "px-6 py-3",
    lg: "px-8 py-4",
  };

  const variantClasses = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    outline: "border-2 border-primary-500 bg-transparent",
    ghost: "bg-transparent",
  };

  const textClasses = {
    primary: "text-white font-semibold",
    secondary: "text-white font-semibold",
    outline: "text-primary-500 font-semibold",
    ghost: "text-primary-500 font-medium",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={animatedStyle}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "secondary"
              ? "#fff"
              : "#6366F1"
          }
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={`${textClasses[variant]} ${textSizeClasses[size]}`}>
            {title}
          </Text>
        </View>
      )}
    </AnimatedTouchable>
  );
}
