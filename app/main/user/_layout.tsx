import { Stack } from 'expo-router';
export default function SettingsLayout() {
    return <Stack screenOptions={{ headerShown: true }}><Stack.Screen name="user-screen" options={{ title: 'Usuário' }} /></Stack>;
}