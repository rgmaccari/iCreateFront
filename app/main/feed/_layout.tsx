import { Stack } from 'expo-router';
export default function FeedLayout() {
    return <Stack screenOptions={{ headerShown: true }}><Stack.Screen name="index" options={{ title: 'Perfil' }} /><Stack.Screen name="profile" options={{ title: 'Perfil' }} /></Stack>;
}