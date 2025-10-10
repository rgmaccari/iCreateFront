import ProjectForm from "@/components/project-form";
import { Project } from "@/services/project/project";
import { ProjectInfoDto } from "@/services/project/project.create.dto";
import { ProjectService } from "@/services/project/project.service";
import { FontAwesome } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProjectScreen() {
  const params = useLocalSearchParams<{ projectCode?: string }>();
  const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;
  const navigation = useNavigation();

  const [project, setProject] = useState<Project | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  //Carrega o projeto atual
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

  //Detecta mudanças no projeto
  useEffect(() => {
    if (project) {
      const isChanged = project.title !== formData.title || project.sketch !== formData.sketch;
      setIsDirty(isChanged);
    } else {
      setIsDirty(!!formData.title || !!formData.sketch);
    }
  }, [formData, project]);

  //Previne a saída da tela sem salvar alterações
  useFocusEffect(
    useCallback(() => {
      const onBeforeRemove = (e: any) => {
        if (!isDirty) {
          return;
        }

        e.preventDefault();

        Alert.alert(
          "Salvar projeto",
          "Deseja salvar as alterações antes de voltar?",
          [
            { text: "Não", onPress: () => { setIsDirty(false); navigation.dispatch(e.data.action); } },
            { text: "Sim", onPress: () => { handleSubmit(); } },
            { text: "Cancelar", style: "cancel" },
          ]
        );
      };

      const unsubscribe = navigation.addListener("beforeRemove", onBeforeRemove);
      return unsubscribe;
    }, [navigation, isDirty])
  );

  //Criar
  const create = async (dto: ProjectInfoDto) => {
    try {
      const createdProject = await ProjectService.create(dto);
      setProject(createdProject);
      setIsDirty(false);
      setTimeout(() => router.back(), 300);
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
    }
  };

  //Att
  const update = async (dto: ProjectInfoDto) => {
    try {
      if (!project) return;
      const updatedProject = await ProjectService.update(project.code!, dto);
      setProject(updatedProject);
      setIsDirty(false);
      setTimeout(() => router.back(), 300);
    } catch (err) {
      console.error("Erro ao atualizar projeto:", err);
    }
  };

  //Salvar: direciona para o create ou Update
  const handleSubmit = async () => {
    const dto: ProjectInfoDto = {
      title: formData.title!,
      sketch: formData.sketch!,
    };

    if (project) {
      await update(dto);
    } else {
      await create(dto);
    }
  };

  //Realiza o return para a tela anterior
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

  //Alteração dinâmica no título (barra superior)
  const handleTitleChange = (newTitle: string) => {
    setFormData((prev) => ({ ...prev, title: newTitle }));
  };

  //Abrir tela de links
  const handleOpenLinks = () => {
    setIsModalVisible(false);
    console.log(project?.code?.toString() || '');
    router.push({
      pathname: "/main/project/links-screen",
      params: { projectCode: project?.code?.toString() || '' },
    });
  };

  //Abrir tela de imagens
  const handleOpenImages = () => {
    setIsModalVisible(false);
    console.log(project?.code?.toString() || '');
    router.push({
      pathname: "/main/project/images-screen",
      params: { projectCode: project?.code?.toString() || '' },
    });
  };

  //Abrir tela de I.A.
  const handleOpenAiFeatures = () => {
    setIsModalVisible(false);
    console.log(project?.code?.toString() || '');
    router.push('/main/project/ai-features');
  };

  //Abrir anotações
  const handleOpenNotes = () => {
    setIsModalVisible(false);
    console.log(project?.code?.toString() || '');
    router.push({
      pathname: "/main/project/notes-screen",
      params: { projectCode: project?.code?.toString() || '' },
    });
  };

  //Abrir o modal com as opções
  const handleOptions = () => {
    setIsModalVisible(true);
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
      {/*Cabeçalho*/}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleReturn} style={styles.headerButton}>
          <FontAwesome name="arrow-left" size={20} color="#666" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          {isEditingTitle ? (
            <TextInput
              mode="flat"
              value={formData.title || ""}
              onChangeText={handleTitleChange}
              onBlur={() => setIsEditingTitle(false)}
              onSubmitEditing={() => setIsEditingTitle(false)}
              autoFocus
              dense
              style={{
                backgroundColor: "transparent",
                height: 40,
                paddingHorizontal: 0,
                textAlign: "center",
                width: Math.max((formData.title?.length || 1) * 10, 100),
              }}
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
              <Text numberOfLines={1} style={styles.titleText}>{formData.title || "Sem título"}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleSubmit} style={styles.headerButton}>
          <FontAwesome name="save" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/*ProjectForm -> Componentizar*/}    
      <ProjectForm project={project} onChange={setFormData} />

      {/*Botão que abre o Modal -> Componentizar*/}    
      <TouchableOpacity style={styles.optionsButton} onPress={handleOptions}>
        <FontAwesome name="file" size={24} color="#fff" />
      </TouchableOpacity>

      {/*Modal -> Componentizar*/}    
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        {/*Opções do Modal -> Talvez seja bom componentizar, mas não é tão necessário */}
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.modalOption} onPress={handleOpenLinks}>
                <Text style={styles.modalOptionText}>Links</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={handleOpenImages}>
                <Text style={styles.modalOptionText}>Imagens</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={handleOpenAiFeatures}>
                <Text style={styles.modalOptionText}>I.A.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={handleOpenNotes}>
                <Text style={styles.modalOptionText}>Notas</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  headerButton: {
    padding: 8,
  },
  titleText: {
    fontSize: 14,
    color: "#362946",
  },
  titleInput: {
    borderBottomWidth: 1,
    borderColor: "#CCC",
    fontSize: 18,
    minWidth: 150,
    color: "#362946",
  },
  optionsButton: {
    backgroundColor: "#362946",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    margin: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "transparent", // Sem fundo escurecido
  },
  modalContainer: {
    position: "absolute",
    bottom: 64, // Mais próximo do botão (48px do botão + 16px de margem)
    right: 16, // Alinhado com o botão
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    width: 150,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#362946",
  },
});
