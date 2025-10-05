import { Stack } from 'expo-router';
export default function ProjectLayout() {
    return <Stack screenOptions={{ headerShown: true }}><Stack.Screen name="all-projects-screen" options={{ title: 'Projetos' }} /></Stack>;
}