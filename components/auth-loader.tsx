import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthService } from "../services/api/auth.service";

export default function AuthLoader() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AuthService.getToken();
      if (token) {
        //Carrega o usuário do storage e seta em memória
        await AuthService.loadUserFromStorage();
        router.replace('/main/user'); //Vai direto para a tela de usuário
      } else {
        router.replace('/login');
      }
      setLoading(false);
    };
    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
