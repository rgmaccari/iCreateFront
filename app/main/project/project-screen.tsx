
import ProjectScreenTest from "@/app/project-screen-test";
import AddButton from "@/components/add-button";
import PageHeader from "@/components/page-header";
import ProjectForm from "@/components/project-form";
import ProjectViewTabs, { ProjectViewMode } from "@/components/project-view-mode";
import ComponentSelectorModal from "@/components/selector-modal";
import { Project } from "@/services/project/project";
import { ProjectInfoDto } from "@/services/project/project.create.dto";
import { ProjectService } from "@/services/project/project.service";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProjectScreen() {
  const params = useLocalSearchParams<{ projectCode?: string }>();
  const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;
  const navigation = useNavigation(); //Bloqueia a navegacao até que se atenda ao pedido do Alert

  const [project, setProject] = useState<Project | undefined>(undefined); //Projeto ativo
  const [formData, setFormData] = useState<Partial<Project>>({}); //Dados do fomr
  const [loading, setLoading] = useState(true); //Carregamento
  const [isDirty, setIsDirty] = useState(false); //Detecar alterações
  const [isEditingTitle, setIsEditingTitle] = useState(false); //Habilita edição do título
  const [isModalVisible, setIsModalVisible] = useState(false); //Habilita modal com opções
  const [currentView, setCurrentView] = useState<ProjectViewMode>('form'); //Setta a View ativa (passar parametro para receber a última view acessada)
  const [showComponentSelector, setShowComponentSelector] = useState(false); //Escolher o componente

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
  const handleOptions = (componentType: 'link' | 'image' | 'sketch') => {
    setShowComponentSelector(false);

    switch (componentType) {
      case 'link':
        handleOpenLinks();
        break;
      case 'image':
        handleOpenImages();
        break;
      case 'sketch':
        handleOpenNotes();
        break;
    }
  };

  //Define a view Ativa
  const renderCurrentView = () => {
    switch (currentView) {
      case 'document':
        return (
          <View style={styles.viewContent}>
            <Text style={styles.viewTitle}>Visualização em Documento</Text>
            <Text style={styles.viewText}>Projeto: {formData.title || "Sem título"}</Text>
            <Text style={styles.viewText}>Aqui será implementada a visualização em documento</Text>
          </View>
        );

      case 'board':
        return (
          <ProjectScreenTest></ProjectScreenTest>
        );

      case 'form':
        return (
          <ProjectForm project={project} onChange={setFormData} />
        );

      default:
        return (
          <ProjectForm project={project} onChange={setFormData} />
        );
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
      {/*Cabeçalho*/}
      <PageHeader
        title={formData.title || ''}
        onBack={handleReturn}
        onSave={handleSubmit}
        onTitleChange={handleTitleChange}
        isEditingTitle={isEditingTitle}
        onEditTitlePress={() => setIsEditingTitle(true)}
        onEditTitleBlur={() => setIsEditingTitle(false)}
        showSaveButton={true}
      />

      {/*Tabs de visualização*/}
      <ProjectViewTabs
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/*Conteúdo interno que muda conforme a tab selecionada*/}
      <View style={styles.contentContainer}>
        {renderCurrentView()}
      </View>

      {/*Botão que abre o Modal*/}
      <AddButton onPress={() => setShowComponentSelector(true)}></AddButton>

      <ComponentSelectorModal
        visible={showComponentSelector}
        onClose={() => setShowComponentSelector(false)}
        onSelectComponent={handleOptions}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  contentContainer: {
    flex: 1,
  },
  viewContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#362946',
    marginBottom: 10,
  },
  viewText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
});
