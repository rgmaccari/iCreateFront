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

  useFocusEffect(() => {
    loadUserAndProjects();
  });

  const loadUserAndProjects = async () => {
    try {
      await AuthService.loadUserFromStorage();
      setUserData(AuthService.getUser());
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
    router.push("/user-register");
  };

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
