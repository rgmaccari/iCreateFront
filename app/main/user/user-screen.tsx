import UserCard from "@/components/user-card";
import { AuthService } from "@/services/api/auth.service";
import { router, useFocusEffect } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserScreen() {
  const [userData, setUserData] = useState(AuthService.getUser());

  useFocusEffect(() => {
    loadUserAndProjects()
  })

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
    router.push('/user-register');
  };

  if (!userData) {
    return (
      <SafeAreaView>
        <Text>Não foi possível obter os dados do usuário!</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView>
      <UserCard user={userData!} onLogout={handleLogout} />
      <TouchableOpacity style={styles.button} onPress={handleEditUser}>
        <Text style={styles.buttonText}>Editar usuário</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#362946",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});