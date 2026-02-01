import { Tabs } from "expo-router";
import { TabBar } from "../../components/ui/TabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
        }}
      />
      <Tabs.Screen
        name="gym"
        options={{
          title: "Gym",
        }}
      />
      <Tabs.Screen
        name="kitchen"
        options={{
          title: "Cocina",
        }}
      />
      <Tabs.Screen
        name="mind"
        options={{
          title: "Mente",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
        }}
      />
    </Tabs>
  );
}
