import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { BlurView } from "expo-blur";

import { triggerHaptic } from "../../services/haptics";

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
};

function TabIcon({ name, color, focused }: TabIconProps) {
  return (
    <View
      className={`items-center justify-center ${focused ? "scale-110" : ""}`}
      style={
        focused
          ? {
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 5,
            }
          : undefined
      }
    >
      <Ionicons name={name} size={24} color={color} />
      {focused && (
        <View
          className="w-1.5 h-1.5 rounded-full mt-1"
          style={{ backgroundColor: color }}
        />
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#09090b",
          borderTopColor: "rgba(255,255,255,0.1)",
          borderTopWidth: 0.5,
          height: 85,
          paddingTop: 10,
          paddingBottom: 25,
        },
        tabBarInactiveTintColor: "#71717a",
        tabBarLabelStyle: {
          fontFamily: "Inter-Medium",
          fontSize: 10,
        },
      }}
      screenListeners={{
        tabPress: () => {
          triggerHaptic("light");
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarActiveTintColor: "#38BDF8", // Sky Blue
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="gym"
        options={{
          title: "Gym",
          tabBarActiveTintColor: "#A3E635", // Neon Lime
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="barbell" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="kitchen"
        options={{
          title: "Cocina",
          tabBarActiveTintColor: "#22D3EE", // Neon Cyan
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="restaurant" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="mind"
        options={{
          title: "Mente",
          tabBarActiveTintColor: "#F472B6", // Neon Pink
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="leaf" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarActiveTintColor: "#A855F7", // Neon Purple
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
