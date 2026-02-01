import React from "react";
import { View, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { triggerHaptic } from "../../services/haptics";

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1, {
      damping: 10,
      stiffness: 100,
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <Ionicons name={name} size={24} color={color} />
      {focused && (
        <Animated.View
          entering={FadeIn}
          style={[
            styles.glowDot,
            { backgroundColor: color, shadowColor: color },
          ]}
        />
      )}
    </Animated.View>
  );
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { bottom: platformBottom(insets.bottom) }]}>
      {/* Glass Container */}
      <BlurView
        intensity={Platform.OS === "ios" ? 80 : 50}
        tint="dark"
        style={styles.blurContainer}
      >
        <View style={styles.innerContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }

              triggerHaptic("light");
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            // Determine Icon Name and Color based on route name
            let iconName: keyof typeof Ionicons.glyphMap = "home";
            let activeColor = "#38BDF8"; // Default Sky

            switch (route.name) {
              case "index":
                iconName = "home";
                activeColor = "#38BDF8"; // Sky
                break;
              case "gym":
                iconName = "barbell";
                activeColor = "#A3E635"; // Lime
                break;
              case "kitchen":
                iconName = "restaurant";
                activeColor = "#22D3EE"; // Cyan
                break;
              case "mind":
                iconName = "leaf";
                activeColor = "#F472B6"; // Pink
                break;
              case "profile":
                iconName = "person";
                activeColor = "#A855F7"; // Purple
                break;
            }

            const color = isFocused ? activeColor : "#71717a"; // Zinc 400

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
              >
                <TabIcon name={iconName} color={color} focused={isFocused} />
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const platformBottom = (insetBottom: number) => {
  return Platform.OS === "ios" ? insetBottom : 20;
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  blurContainer: {
    borderRadius: 35,
    overflow: "hidden",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15, // Reduced vertical padding since height is constrained by content
    backgroundColor: "rgba(9, 9, 11, 0.6)", // Semi-transparent dark background for better contrast
    height: 70,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  },
});
