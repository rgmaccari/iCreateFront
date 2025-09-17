import ProjectCard from "@/src/components/project-card";
import UserCard from "@/src/components/user-card";
import { AuthService } from "@/src/services/api/auth.service";
import { ProjectPreview } from "@/src/services/project/project.preview";
import { ProjectService } from "@/src/services/project/project.service";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserScreen() {
  const router = useRouter();
  const userData = AuthService.getUser();
  const [projects, setProjects] = useState<ProjectPreview[]>([]);

  const loadProjects = async () => {
    console.log('acionado loadProjects')
    if (userData?.code) {
      console.log('tem user')
      const data = await ProjectService.findAllPreview(userData.code);
      setProjects(data);
    }
  };

  const handleNewProject = () => {
    Alert.alert("Novo projeto", "Botão de criar projeto clicado!");
  };

  useEffect(() => {
    loadProjects();
  }, [userData?.code]);

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Usuário não encontrado</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao realizar logoff:", error);
      Alert.alert("Erro", "Não foi possível realizar o logoff.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <UserCard user={userData} onLogout={handleLogout} />

      {/* Botso de teste */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={loadProjects}>
          <Text style={styles.buttonText}>Reload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNewProject}>
          <Text style={styles.buttonText}>Novo Projeto</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de projects */}
      <ProjectCard projects={projects} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
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
