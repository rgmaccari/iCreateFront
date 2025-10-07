import ProjectContentCard from "@/components/project-content-card";
import ProjectForm from "@/components/project-form";
import { Project } from "@/services/project/project";
import { ProjectInfoDto } from "@/services/project/project.create.dto";
import { ProjectService } from "@/services/project/project.service";
import { FontAwesome } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProjectScreen() {
  const params = useLocalSearchParams<{ projectCode?: string }>();
  const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;
  const navigation = useNavigation();

  const [project, setProject] = useState<Project | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false); //Variável de controle

  useEffect(() => {
    const findByCode = async () => {
      if (projectCode) {
        console.log("Carregando projeto com código:", projectCode);
        try {
          const actualProject = await ProjectService.findByCode(projectCode);
          setProject(actualProject);
          setFormData(actualProject);
        } catch (err) {
          console.error("Erro ao carregar projeto:", err);
        }
      }
      setLoading(false);
    };
    findByCode();
  }, [projectCode]);

  //Capturar alterações no project
  useEffect(() => {
    if (project) {
      const isChanged = project.title !== formData.title || project.sketch !== formData.sketch;
      setIsDirty(isChanged);
    } else {
      setIsDirty(!!formData.title || !!formData.sketch);
    }
  }, [formData, project]);

  useFocusEffect(
    useCallback(() => {
      const onBeforeRemove = (e: any) => {
        if (!isDirty) { //Se não foi alterado
          return;
        }

        e.preventDefault(); //Bloqueia a nevagação

        Alert.alert(
          "Salvar projeto",
          "Deseja salvar as alterações antes de voltar?",
          [
            { text: "Não", onPress: () => { setIsDirty(false); navigation.dispatch(e.data.action); } }, //Setta como false e desbloqueia a navegalção
            { text: "Sim", onPress: () => { handleSubmit(); } },
            { text: "Cancelar", style: "cancel" },
          ]
        );
      };

      const unsubscribe = navigation.addListener('beforeRemove', onBeforeRemove);

      return unsubscribe;
    }, [navigation, isDirty])
  );

  const create = async (dto: ProjectInfoDto) => {
    try {
      const createdProject = await ProjectService.create(dto);
      setProject(createdProject);
      setIsDirty(false); //Reseta o flag após salvar
      setTimeout(() => router.back(), 300); //Atraso para fechamento do alerta
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
    }
  };

  const update = async (dto: ProjectInfoDto) => {
    try {
      if (!project) return;
      const updatedProject = await ProjectService.update(project.code!, dto);
      setProject(updatedProject);
      setIsDirty(false); //Reseta o flag após salvar
      setTimeout(() => router.back(), 300); //Atraso para fechamento do alerta
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
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir", style: "destructive", onPress: async () => {
            await ProjectService.deleteByCode(projectCode);
            router.back();
          }
        }
      ]
    );
  };

  //Se o cara clicou para sair
  const handleReturn = () => {
    if (isDirty) {
      Alert.alert(
        "Salvar alterações",
        "Deseja salvar as alterações antes de sair?",
        [
          { text: "Não", onPress: () => { setIsDirty(false); router.back(); }, style: "cancel" },
          { text: "Sim", onPress: handleSubmit },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleOpenLinks = () => {
    console.log(project?.code?.toString() || '')
    router.push({
      pathname: "/main/project/links-screen",
      params: { projectCode: project?.code?.toString() || '' },
    });
  };

  const handleOpenImages = () => {
    console.log(project?.code?.toString() || '')
    router.push({
      pathname: "/main/project/images-screen",
      params: { projectCode: project?.code?.toString() || '' },
    });
  };

  const handleOpenAiFeatures = () => {
    console.log(project?.code?.toString() || '')
    router.push('/main/project/ai-features');
  };

  const handleOpenNotes = () => {
    console.log(project?.code?.toString() || '')
    router.push({
      pathname: "/main/project/notes-screen",
      params: { projectCode: project?.code?.toString() || '' },
    });
  };

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

      <ScrollView>
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

        <ProjectContentCard
          title="Notas"
          onPress={handleOpenNotes}
          icon={<FontAwesome name="file-image-o" size={40} color="#362946" />}
        />
      </ScrollView>

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
            <Text style={styles.buttonText}>Deletar</Text>
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