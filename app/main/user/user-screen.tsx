import UserCard from "@/components/user-card";
import UserInterestsCard from "@/components/user-interests-card";
import UserStats from "@/components/user-stats-card";

import { AuthService } from "@/services/api/auth.service";
import { router, useFocusEffect } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserScreen() {
  const [userData, setUserData] = useState(AuthService.getUser());
  const userCode = userData?.code;

  useFocusEffect(() => {
    loadUserFromStorage();
  });

  const loadUserFromStorage = async () => {
    try {
      const user = await AuthService.loadUserFromStorage();

      if (user !== undefined) {
        setUserData(AuthService.getUser());
      } else {
        console.log('voce nao deveria estar aqui')
      }

    } catch (error) {
      console.error("Erro ao localizar user:", error);
      Alert.alert("Erro", "Não foi possível encontrar o user ativo.");
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao realizar logoff:", error);
      Alert.alert("Erro", "Não foi possível realizar o logoff.");
    }
  };

  const handleEditUser = () => {
    router.push("/user-register-screen");
  };

  const handleOpenImageScreen = () => {
    router.push({
      pathname: '/images-screen',
      params: { userCode: userCode }
    });
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Não foi possível obter os dados do usuário!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <UserCard user={userData!} onLogout={handleLogout} />

      <TouchableOpacity style={styles.editButton} onPress={handleEditUser}>
        <Text style={styles.buttonText}>Editar perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.editButton} onPress={handleOpenImageScreen}>
        <Text style={styles.buttonText}>Imagens</Text>
      </TouchableOpacity>

      <UserInterestsCard />

      <UserStats />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  editButton: {
    backgroundColor: "#362946",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "stretch",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
