import { Project } from "@/services/project/project";
import { ProjectCreateDto } from "@/services/project/project.create.dto";
import { ProjectService } from "@/services/project/project.service";
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

  const handleReturn = () => {
    router.back();
  };

  const handleSave = async () => {
    try {
      const dto: ProjectCreateDto = {
        title: formData.title!,
        sketch: formData.sketch!,
      };

      if (project) {
        await ProjectService.update(project.code!, dto);
      } else {
        const createdProject = await ProjectService.create(dto);
        console.log("Projeto criado:", createdProject);
      }

      router.back();
    } catch (err) {
      console.error("Erro ao salvar projeto:", err);
    }
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
