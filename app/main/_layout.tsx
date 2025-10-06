import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs, useLocalSearchParams } from 'expo-router';

export default function MainLayout() {
    const { username } = useLocalSearchParams();
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: Colors['light'].tint, headerShown: false, tabBarButton: HapticTab }}>
            <Tabs.Screen
                name="user"
                options={{
                    title: username ? `${username}` : 'Perfil',
                    tabBarIcon: ({ color }) =>
                        <FontAwesome name="user-circle" size={24} color={color} />
                }} />

            <Tabs.Screen
                name="project"
                options={{
                    title: 'Projetos',
                    tabBarIcon: ({ color }) =>
                        <FontAwesome name="book" size={24} color={color} />
                }} />

            <Tabs.Screen
                name="feed"
                options={{
                    title: 'Para você',
                    tabBarIcon: ({ color }) =>
                        <FontAwesome name="lightbulb-o" size={24} color={color} />
                }} />

            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Configurações', tabBarIcon: ({ color }) =>
                        <FontAwesome name="gear" size={24} color={color} />
                }} />
        </Tabs>
    );
}
