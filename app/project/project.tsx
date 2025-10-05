import ProjectContentCard from "@/components/project-content-card";
import { Project } from "@/services/project/project";
import { ProjectInfoDto } from "@/services/project/project.create.dto";
import { ProjectService } from "@/services/project/project.service";
import { FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProjectForm from "../../components/project-form";

export default function ProjectScreen() {
  const params = useLocalSearchParams<{ projectCode?: string }>();
  const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;

  const [project, setProject] = useState<Project | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [loading, setLoading] = useState(true);

  //Buscar o projeto do backend
  useEffect(() => {
    const findByCode = async () => {
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
    findByCode();
  }, [projectCode]);

  const create = async (dto: ProjectInfoDto) => {
    try {
      const createdProject = await ProjectService.create(dto);
      setProject(createdProject);
      router.back();
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
    }
  };

  const update = async (dto: ProjectInfoDto) => {
    try {
      if (!project) return;
      const updatedProject = await ProjectService.update(project.code!, dto);
      setProject(updatedProject);
      router.back();
    } catch (err) {
      console.error("Erro ao atualizar projeto:", err);
    }
  };

  const handleSubmit = async () => {
    const dto: ProjectInfoDto = {
      title: formData.title!,
      sketch: formData.sketch!,
    };

    if (project) {
      update(dto);
    } else {
      create(dto);
    }
  };

  const deleteProject = async (projectCode: number) => {
    Alert.alert(
      "Excluir projeto",
      "Deseja realmente excluir o projeto?",
      [{ text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive", onPress: async () => {
          await ProjectService.deleteByCode(projectCode);
          router.back();
        }
      }
      ]
    )
  }

  const handleReturn = () => {
    router.back();
  };

  const handleOpenLinks = () => {
    router.push({
      pathname: "/project/links",
      params: { projectCode: project?.code?.toString() || '' },
    });
  }

  const handleOpenImages = () => {
    router.push({
      pathname: "/project/images",
      params: { projectCode: project?.code?.toString() || '' }
    })
  }

  const handleOpenAiFeatures = () => {
    router.push('/project/ai-features')
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#362946" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProjectForm project={project} onChange={setFormData} />

      <ProjectContentCard
        title="Meus Links"
        onPress={handleOpenLinks}
        icon={<FontAwesome name="link" size={40} color="#362946" />}
      />

      <ProjectContentCard
        title="Minhas Imagens"
        onPress={handleOpenImages}
        icon={<FontAwesome name="file-image-o" size={40} color="#362946" />}
      />

      <ProjectContentCard
        title="I.A."
        onPress={handleOpenAiFeatures}
        icon={<FontAwesome name="file-image-o" size={40} color="#362946" />}
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.buttonSecondary} onPress={handleReturn}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
          <Text style={styles.buttonText}>
            {project ? "Atualizar Projeto" : "Criar Projeto"}
          </Text>
        </TouchableOpacity>

        {project && (
          <TouchableOpacity style={styles.buttonPrimary} onPress={() => deleteProject(project!.code)}>
            <Text style={styles.buttonText}>
              Deletar
            </Text>
          </TouchableOpacity>
        )}
      </View>


    </SafeAreaView>
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
