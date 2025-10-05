import ProjectCard from "@/components/project-card";
import { AuthService } from "@/services/api/auth.service";
import { ProjectPreview } from "@/services/project/project.preview";
import { ProjectService } from "@/services/project/project.service";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllProjectsScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(AuthService.getUser());
  const [projects, setProjects] = useState<ProjectPreview[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadUserAndProjects();
    }, [])
  );

  const loadUserAndProjects = async () => {
    await AuthService.loadUserFromStorage();
    setUserData(AuthService.getUser());

    if (AuthService.getUser()?.code) {
      const data = await ProjectService.findAllPreview();
      setProjects(data);
    }

  };

  const handleNewProject = () => {
    router.push('/main/project/project');
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Usuário não encontrado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Botso de teste */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={loadUserAndProjects}>
          <Text style={styles.buttonText}>Reload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNewProject}>
          <Text style={styles.buttonText}>Novo Projeto</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de projects */}
      <ProjectCard projects={projects} refresh={loadUserAndProjects} />
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
