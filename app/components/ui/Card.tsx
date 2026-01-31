import React from "react";
import { View, ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CardProps extends ViewProps {
  variant?: "default" | "glass" | "gradient";
  gradientColors?: string[];
  children: React.ReactNode;
  className?: string;
}

export function Card({
  variant = "default",
  gradientColors = ["#6366F1", "#8B5CF6"],
  children,
  className = "",
  ...props
}: CardProps) {
  if (variant === "gradient") {
    return (
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`rounded-3xl p-5 ${className}`}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  const variantClasses = {
    default: "bg-surface",
    glass: "bg-surface/80 backdrop-blur-lg",
  };

  return (
    <View
      className={`rounded-3xl p-5 border border-surface-light ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
