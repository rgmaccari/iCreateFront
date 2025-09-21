import { Project } from "@/services/project/project";
import { ProjectInfoDto } from "@/services/project/project.create.dto";
import { ProjectService } from "@/services/project/project.service";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ProjectForm from "../../components/project-form";

export default function ProjectScreen() {
  const params = useLocalSearchParams<{ projectCode?: string }>();
  const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;

  const [project, setProject] = useState<Project | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [loading, setLoading] = useState(true);

  //Buscar o projeto do backend
  useEffect(() => {
    const load = async () => {
      if (projectCode) {
        try {
          const actualProject = await ProjectService.findByCode(projectCode);
          setProject(actualProject);
          setFormData(actualProject);//inicializa o form
        } catch (err) {
          console.error("Erro ao carregar projeto:", err);
        }
      }
      setLoading(false);
    };
    load();
  }, [projectCode]);

  const handleReturn = () => {
    router.back();
  };

  const handleSave = async () => {
    try {
      const dto: ProjectInfoDto = {
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#362946" />
      </View>
    );
  }

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
