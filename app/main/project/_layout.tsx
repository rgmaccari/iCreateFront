import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function ProjectLayout() {
  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="all-projects-screen" options={{ title: 'Projetos' }} />
        <Stack.Screen name="project" options={{ headerShown: false }} />
        <Stack.Screen name="links-screen" options={{ headerShown: false }} />
        <Stack.Screen name="ai-features" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
