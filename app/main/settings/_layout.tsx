import { Stack } from 'expo-router';
export default function SettingsLayout() {
    return <Stack screenOptions={{ headerShown: true }}><Stack.Screen name="settings-screen" options={{ title: 'Configurações' }} /></Stack>;
}