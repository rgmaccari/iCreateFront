import { HapticTab } from '@/src/components/haptic-tab';
import { Colors } from '@/src/constants/theme';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function HomeScreen() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors['light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
            }}>
            <Tabs.Screen
                name="user"
                options={{
                    title: 'Usuário',
                    tabBarIcon: ({ color }) => <FontAwesome name="user-circle" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="for-you"
                options={{
                    title: 'Para você',
                    tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Configurações',
                    tabBarIcon: ({ color }) => <FontAwesome name="gear" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="about"
                options={{
                    title: 'Utilidades',
                    tabBarIcon: ({ color }) => <FontAwesome name="book" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}