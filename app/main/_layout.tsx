import { HapticTab } from "@/components/haptic-tab";
import { FontAwesome } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams } from "expo-router";

export default function MainLayout() {
  const { username } = useLocalSearchParams();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2b2d64",
        tabBarActiveBackgroundColor: "#d3d3eeff",
        tabBarInactiveTintColor: "#2b2d64",
        headerShown: false,
        tabBarButton: HapticTab,
        animation: "shift",
        tabBarStyle: {
          borderTopWidth: 0, // remove a linha superior (rodapé)
          elevation: 0, // remove sombra no Android
          shadowOpacity: 0, // remove sombra no iOS
          backgroundColor: "#fff", // opcional para manter fundo uniforme
        },
      }}
    >
      <Tabs.Screen
        name="user"
        options={{
          title: username ? `${username}` : "Perfil",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user-circle" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="project"
        options={{
          title: "Projetos",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="book" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          title: "Para você",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="lightbulb-o" size={24} color={color} />
          ),
        }}
      />

      {/*
<Tabs.Screen
  name="settings"
  options={{
    title: "Configurações",
    tabBarIcon: ({ color }) => (
      <FontAwesome name="gear" size={24} color={color} />
    ),
  }}
/>
*/}
    </Tabs>
  );
}
