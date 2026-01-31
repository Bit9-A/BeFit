import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { BlurView } from "expo-blur";

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
};

function TabIcon({ name, color, focused }: TabIconProps) {
  return (
    <View
      className={`items-center justify-center ${focused ? "scale-110" : ""}`}
    >
      <Ionicons name={name} size={24} color={color} />
      {focused && (
        <View className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1" />
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
          backgroundColor: "#1E293B",
          borderTopColor: "#334155",
          borderTopWidth: 1,
          height: 85,
          paddingTop: 10,
          paddingBottom: 25,
        },
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#64748B",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="gym"
        options={{
          title: "Gym",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="barbell" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="kitchen"
        options={{
          title: "Cocina",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="restaurant" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="mind"
        options={{
          title: "Mente",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="leaf" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
