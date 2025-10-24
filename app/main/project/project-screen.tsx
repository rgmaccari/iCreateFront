// app/main/project/project-screen.tsx
import ProjectScreenTest from "@/app/project-screen-test";
import AddButton from "@/components/add-button";
import ImageModal from "@/components/image-modal";
import PageHeader from "@/components/page-header";
import ProjectForm from "@/components/project-form";
import ProjectViewTabs, { ProjectViewMode } from "@/components/project-view-mode";
import ComponentSelectorModal from "@/components/selector-modal";
import { showToast } from "@/constants/showToast";
import { ImageCreateDto } from "@/services/image/image.create.dto";
import { ImageService } from "@/services/image/image.service";
import { Project } from "@/services/project/project";
import { ProjectInfoDto } from "@/services/project/project.create.dto";
import { ProjectService } from "@/services/project/project.service";
import * as FileSystem from "expo-file-system/legacy";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
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
  const [currentView, setCurrentView] = useState<ProjectViewMode>("form");
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentProjectCode, setCurrentProjectCode] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (projectCode) setCurrentProjectCode(projectCode);
  }, [projectCode, project]);

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
      } else {
        console.log("Nenhum projectCode fornecido");
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
            { text: "Sim", onPress: () => { handleSubmitProject(); } },
            { text: "Cancelar", style: "cancel" },
          ]
        );
      };

      const unsubscribe = navigation.addListener("beforeRemove", onBeforeRemove);
      return unsubscribe;
    }, [navigation, isDirty])
  );

  //Criar projeto
  const createProject = async (dto: ProjectInfoDto) => {
    try {
      const createdProject = await ProjectService.create(dto);
      setProject(createdProject);
      setIsDirty(false);
      setTimeout(() => router.back(), 300);
    } catch (error: any) {
      showToast('error', error.formattedMessage, 'Ocorreu um erro ao salvar seu projeto.');
    }
  };

  // Atualizar projeto
  const updateProject = async (dto: ProjectInfoDto) => {
    try {
      if (!project) return;
      const updatedProject = await ProjectService.update(project.code!, dto);
      setProject(updatedProject);
      setIsDirty(false);
      setTimeout(() => router.back(), 300);
    } catch (error: any) {
      showToast('error', error.formattedMessage, 'Ocorreu um erro ao salvar seu projeto.');
    }
  };

  //Salvar projeto
  const handleSubmitProject = async () => {
    const dto: ProjectInfoDto = {
      title: formData.title!,
      sketch: formData.sketch!,
    };

    if (project) {
      await updateProject(dto);
    } else {
      await createProject(dto);
    }
  };

  //Função para salvar imagens

  const createImages = async (forms: ImageCreateDto[]) => {
    const code = project?.code ?? currentProjectCode;
    if (!code) {
      Alert.alert("Erro", "Projeto não carregado.");
      return;
    }

    for (const form of forms) {
      if (!form.uri) {
        console.warn("Imagem sem URI:", form);
        continue;
      }

      const info = await FileSystem.getInfoAsync(form.uri as string);
      if (!info.exists) {
        console.warn("Arquivo ainda não acessível:", form.uri);
        await new Promise(r => setTimeout(r, 500));
      }
    }

    const formData = new FormData();
    forms.forEach((form, i) => {
      if (!form.uri) return;
      formData.append("images", {
        uri: form.uri.startsWith("file://") ? form.uri : `file://${form.uri}`,
        type: form.mimeType ?? "image/jpeg",
        name: form.filename ?? `image_${Date.now()}_${i}.jpg`,
      } as any);
    });

    formData.append("isCover", String(forms.some(f => f.isCover)));
    formData.append("projectCode", String(code));

    try {
      await new Promise(r => setTimeout(r, 200));
      await ImageService.create(code, formData);
      setShowImageModal(false);
    } catch (err) {
      console.error("[createImages] erro ao salvar imagem:", err);
      Alert.alert("Erro", "Falha ao enviar imagem. Tente novamente.");
    }
  };





  //Alteração dinâmica no título
  const handleTitleChange = (newTitle: string) => {
    setFormData((prev) => ({ ...prev, title: newTitle }));
  };

  //Manipular seleção de componente
  const handleOptions = (componentType: "link" | "image" | "sketch") => {
    console.log("[Front] Componente selecionado:", componentType);
    setShowComponentSelector(false);
    switch (componentType) {
      case "link":
        handleOpenLinks();
        break;
      case "image":
        console.log("[Front] Abrindo ImageModal");
        setShowImageModal(true);
        break;
      case "sketch":
        handleOpenNotes();
        break;
    }
  };

  //Retornar para a tela anterior
  const handleReturn = () => {
    if (isDirty) {
      Alert.alert(
        "Salvar alterações",
        "Deseja salvar as alterações antes de sair?",
        [
          { text: "Não", onPress: () => { setIsDirty(false); router.back(); }, style: "cancel" },
          { text: "Sim", onPress: handleSubmitProject },
        ]
      );
    } else {
      router.back();
    }
  };

  //Abrir tela de links
  const handleOpenLinks = () => {
    setIsModalVisible(false);
    console.log(project?.code?.toString() || "");
    router.push({
      pathname: "/main/project/links-screen",
      params: { projectCode: project?.code?.toString() || "" },
    });
  };

  //Abrir tela de notas
  const handleOpenNotes = () => {
    setIsModalVisible(false);
    console.log(project?.code?.toString() || "");
    router.push({
      pathname: "/main/project/notes-screen",
      params: { projectCode: project?.code?.toString() || "" },
    });
  };

  //Abrir tela de I.A.
  const handleOpenAiFeatures = () => {
    setIsModalVisible(false);
    console.log(project?.code?.toString() || "");
    router.push("/main/project/ai-features");
  };

  //Define a view ativa
  const renderCurrentView = () => {
    switch (currentView) {
      case "document":
        return (
          <View style={styles.viewContent}>
            <Text style={styles.viewTitle}>Visualização em Documento</Text>
            <Text style={styles.viewText}>Projeto: {formData.title || "Sem título"}</Text>
            <Text style={styles.viewText}>Aqui será implementada a visualização em documento</Text>
          </View>
        );
      case "board":
        return <ProjectScreenTest />;
      case "form":
        return <ProjectForm project={project} onChange={setFormData} />;
      default:
        return <ProjectForm project={project} onChange={setFormData} />;
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
    <SafeAreaView style={styles.container}>
      <PageHeader
        title={formData.title || ""}
        onBack={handleReturn}
        onSave={handleSubmitProject}
        onTitleChange={handleTitleChange}
        isEditingTitle={isEditingTitle}
        onEditTitlePress={() => setIsEditingTitle(true)}
        onEditTitleBlur={() => setIsEditingTitle(false)}
        showSaveButton={true}
      />
      <ProjectViewTabs currentView={currentView} onViewChange={setCurrentView} />
      <View style={styles.contentContainer}>{renderCurrentView()}</View>
      <AddButton onPress={() => setShowComponentSelector(true)} />
      <ComponentSelectorModal
        visible={showComponentSelector}
        onClose={() => setShowComponentSelector(false)}
        onSelectComponent={handleOptions}
      />
      <ImageModal
        projectCode={projectCode}
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSave={createImages}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f0faff",
  },
  contentContainer: {
    flex: 1,
  },
  viewContent: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  viewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#362946",
    marginBottom: 10,
  },
  viewText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
});