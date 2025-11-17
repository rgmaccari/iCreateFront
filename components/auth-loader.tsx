import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthService } from "../services/api/auth.service";
import WebSocketService from "../services/api/websocket.service";

export default function AuthLoader() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      //Verificar token
      const token = await AuthService.getToken();
      if (token) {
        const user = await AuthService.loadUserFromStorage();
        console.log('Usuário carregado:', user?.nickname);
        console.log('Chamando WebSocketService.connect()...');
        WebSocketService.connect();

        router.replace({
          pathname: '/main/project/all-projects-screen',
          params: { username: user?.nickname },
        });
      } else {
        console.log('Sem token, desconectando do WebSocket.');
        WebSocketService.disconnect();
        router.replace('/login');
      }
      setLoading(false);
    };
    checkToken();
  }, []);

  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator size="large" /></View>;
  return null;
}