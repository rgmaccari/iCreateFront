import { Project } from "@/services/project/project";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ProjectForm from "../../components/project-form";


export default function ProjectScreen() {
  const params = useLocalSearchParams<{ project?: string }>();
  const project: Project | undefined = params.project
    ? JSON.parse(params.project)
    : undefined;

  const [formData, setFormData] = useState<Partial<Project>>({});

  const handleSave = () => {
    if (project) {
      console.log("Atualizando projeto:", { ...project, ...formData });
      // chamar service update
    } else {
      console.log("Criando projeto:", formData);
      // chamar service create
    }
    router.back();
  };

  const handleReturn = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ProjectForm project={project} onChange={setFormData} />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.buttonSecondary} onPress={handleReturn}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleSave}>
          <Text style={styles.buttonText}>
            {project ? "Atualizar Projeto" : "Criar Projeto"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: "#362946",
    padding: 14,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#aaa",
    padding: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
