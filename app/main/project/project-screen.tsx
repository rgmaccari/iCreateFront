import ProjectBoard from "@/app/main/project/project-board";
import AddButton from "@/components/add-button";
import IaToolsModal from "@/components/ia-tools-modal";
import ImageModal from "@/components/image-modal";
import LinkModal from "@/components/linking-modal";
import PageHeader from "@/components/page-header";
import ProjectGrid from "@/components/project-grid";
import ProjectViewTabs, {
  ProjectViewMode,
} from "@/components/project-view-tabs";
import ComponentSelectorModal from "@/components/selector-modal";
import SketchModal from "@/components/sketch-modal";
import { showToast } from "@/constants/showToast";
import { AuthService } from "@/services/api/auth.service";
import { Checklist } from "@/services/checklist/checklist";
import { ChecklistDto } from "@/services/checklist/checklist.dto";
import { ChecklistService } from "@/services/checklist/checklist.service";
import { Image } from "@/services/image/image";
import { ImageCreateDto } from "@/services/image/image.create.dto";
import { ImageService } from "@/services/image/image.service";
import { Link } from "@/services/link/link";
import { LinkCreateDto } from "@/services/link/link.create.dto";
import { LinkService } from "@/services/link/link.service";
import { Note } from "@/services/notes/note";
import { NoteCreateDto } from "@/services/notes/note.create.dto";
import { NoteService } from "@/services/notes/note.service";
import { Project } from "@/services/project/project";
import { ProjectInfoDto } from "@/services/project/project.create.dto";
import { ProjectService } from "@/services/project/project.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProjectScreen() {
  const params = useLocalSearchParams<{ projectCode?: string }>();
  const projectCode = params.projectCode
    ? parseInt(params.projectCode, 10)
    : undefined;
  const navigation = useNavigation();

  const [project, setProject] = useState<Project | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [currentView, setCurrentView] = useState<ProjectViewMode | null>(null);
  //  const [currentView, setCurrentView] = useState<ProjectViewMode>("form");

  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showSketchModal, setShowSketchModal] = useState(false);
  const [showIaModal, setShowIaModal] = useState(false);

  const [images, setImages] = useState<Image[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);

  //Carrega o projeto atual
  useEffect(() => {
    const findByCode = async () => {
      if (projectCode) {
        try {
          const actualProject = await ProjectService.findByCode(projectCode);
          setProject(actualProject);
          setFormData(actualProject);

          //Carrega os itens do projeto
          await loadProjectItems(projectCode);
        } catch (error: any) {
          showToast("error", error.formattedMessage);
        }
      }
      setLoading(false);
    };
    findByCode();
  }, [projectCode]);

  //Detecta mudanças no projeto
  useEffect(() => {
    if (project) {
      const isChanged =
        project.title !== formData.title || project.sketch !== formData.sketch;
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
            {
              text: "Não",
              onPress: () => {
                setIsDirty(false);
                navigation.dispatch(e.data.action);
              },
            },
            {
              text: "Sim",
              onPress: () => {
                handleSubmitProject();
              },
            },
            { text: "Cancelar", style: "cancel" },
          ]
        );
      };

      const unsubscribe = navigation.addListener(
        "beforeRemove",
        onBeforeRemove
      );
      return unsubscribe;
    }, [navigation, isDirty])
  );

  //Carrega a última ViewForm ativa
  useEffect(() => {
    const loadLastView = async () => {
      if (!projectCode) {
        setCurrentView("form"); //Fallback se não tem projeto...
        return;
      }

      const LAST_VIEW_KEY = `project_last_view_${projectCode}`;
      try {
        const savedView = await AuthService.safeGetItem(LAST_VIEW_KEY);
        if (savedView && ["form", "board", "document"].includes(savedView)) {
          setCurrentView(savedView as ProjectViewMode);
        } else {
          setCurrentView("form"); //Fallback se inválido
        }
      } catch (error) {
        setCurrentView("form"); //Para qualquer efeito...
      }
    };

    loadLastView();
  }, [projectCode]);

  useEffect(() => {
    if (!currentView || !projectCode) return;

    const saveLastView = async () => {
      const LAST_VIEW_KEY = `project_last_view_${projectCode}`;
      try {
        await AsyncStorage.setItem(LAST_VIEW_KEY, currentView);
      } catch (error) {
        console.error("Erro ao salvar última view:", error);
      }
    };

    saveLastView();
  }, [currentView, projectCode]);

  const loadProjectItems = async (code: number) => {
    try {
      const [loadedImages, loadedLinks, loadedNotes, loadedChecklists] =
        await Promise.all([
          ImageService.findAllByProjectCode(code),
          LinkService.findAllByProjectCode(code),
          NoteService.findAllByProjectCode(code),
          ChecklistService.findAllByProjectCode(code),
        ]);
      setImages(loadedImages || []);
      setLinks(loadedLinks || []);
      setNotes(loadedNotes || []);
      setChecklists(loadedChecklists || []);
    } catch (err) {
      console.error("Erro ao carregar itens do projeto:", err);
    }
  };

  //Criar projeto
  const createProject = async (dto: ProjectInfoDto) => {
    try {
      const createdProject = await ProjectService.create(dto);
      setProject(createdProject);
      setIsDirty(false);
      setTimeout(() => router.back(), 300);
    } catch (error: any) {
      showToast("error", error.formattedMessage);
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
      showToast("error", error.formattedMessage);
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
    if (!projectCode) {
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
        await new Promise((r) => setTimeout(r, 500));
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

    formData.append("isCover", String(forms.some((f) => f.isCover)));
    formData.append("projectCode", String(projectCode));

    try {
      await new Promise((r) => setTimeout(r, 200));
      await ImageService.create(projectCode, formData);

      reloadImages();
      setShowImageModal(false);
      showToast("success", "Imagens adicionadas com sucesso!");
    } catch (error: any) {
      showToast("error", error.formattedMessage);
    }
  };

  const reloadImages = async () => {
    if (projectCode) {
      const updatedImages = await ImageService.findAllByProjectCode(
        projectCode
      );
      setImages(updatedImages || []);
    }
  };

  //Criar links
  const createLink = async (form: LinkCreateDto) => {
    if (projectCode && form) {
      try {
        await LinkService.create(form);
        setShowLinkModal(false);

        reloadLinks();
        showToast("success", "Links adicionados com sucesso!");
      } catch (error: any) {
        showToast("error", error.formattedMessage);
      }
    }
  };

  const reloadLinks = async () => {
    if (projectCode) {
      const updatedLinks = await LinkService.findAllByProjectCode(projectCode);
      setLinks(updatedLinks || []);
    }
  };

  //Criar anotação
  const createNote = async (form: NoteCreateDto) => {
    if (projectCode && form) {
      try {
        await NoteService.create(form);
        setShowSketchModal(false);

        reloadNotes(); //Atualiza o estado de um "prop.images" no componente visual
        showToast("success", "Anotação registrada!");
      } catch (error: any) {
        showToast("error", error.formattedMessage);
      }
    }
  };

  const reloadNotes = async () => {
    if (projectCode) {
      const updatedNotes = await NoteService.findAllByProjectCode(projectCode);
      setNotes(updatedNotes || []);
    }
  };

  //Criar checklist
  const createChecklist = async (form: ChecklistDto) => {
    if (projectCode && form) {
      try {
        await ChecklistService.create(form);
        setShowSketchModal(false);

        const updatedChecklist = await ChecklistService.findAllByProjectCode(
          projectCode
        );
        setChecklists(updatedChecklist || []);
        showToast("success", "Checklist criada!");
      } catch (error: any) {
        showToast("error", error.formattedMessage);
      }
    }
  };

  const reloadChecklists = async () => {
    if (projectCode) {
      const updatedChecklists = await ChecklistService.findAllByProjectCode(
        projectCode
      );
      setChecklists(updatedChecklists || []);
    }
  };

  //Alteração dinâmica no título
  const handleTitleChange = (newTitle: string) => {
    setFormData((prev) => ({ ...prev, title: newTitle }));
  };

  //Manipular seleção de componente
  const handleOptions = (componentType: "link" | "image" | "sketch" | "ia") => {
    setShowComponentSelector(false);
    switch (componentType) {
      case "link":
        setShowLinkModal(true);
        break;
      case "image":
        setShowImageModal(true);
        break;
      case "sketch":
        setShowSketchModal(true);
        break;
      case "ia":
        setShowIaModal(true);
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
          {
            text: "Não",
            onPress: () => {
              setIsDirty(false);
              router.back();
            },
            style: "cancel",
          },
          { text: "Sim", onPress: handleSubmitProject },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleDelete = async (code: number, task: string, type?: string) => {
    if (task === "item") {
      showToast("success", "Item removido!");
    }

    if (task === "archive") {
      if (type === "image") {
        await ImageService.deleteByCode(code);
        setImages((prev) => prev.filter((img) => img.code !== code));
        showToast("success", "Imagem removida!");
      }

      if (type === "link") {
        await LinkService.deleteByCode(code);
        setLinks((prev) => prev.filter((link) => link.code !== code));
        showToast("success", "Link removido!");
      }

      if (type === "checklist") {
        await ChecklistService.deleteByCode(code);
        setChecklists((prev) =>
          prev.filter((checklist) => checklist.code !== code)
        );
        showToast("success", "Checklist removido!");
      }

      if (type === "note") {
        await NoteService.deleteByCode(code);
        setNotes((prev) => prev.filter((note) => note.code !== code));
        showToast("success", "Anotação removida!");
      }
      return;
    }
  };

  //Define a view ativa
  const renderCurrentView = () => {
    switch (currentView) {
      case "document":
        return (
          <View style={styles.viewContent}>
            <Text style={styles.viewTitle}>Visualização em Documento</Text>
            <Text style={styles.viewText}>
              Projeto: {formData.title || "Sem título"}
            </Text>
            <Text style={styles.viewText}>
              Aqui será implementada a visualização em documento
            </Text>
          </View>
        );
      case "board":
        return (
          <ProjectBoard
            project={project}
            onAddImage={() => console.log("aopa")}
            onAddLink={() => console.log("aopa")}
            onAddNote={() => console.log("aopa")}
            onDelete={(code, task, type) => handleDelete(code, task, type)}
            images={images}
            links={links}
            notes={notes}
            checklists={checklists}
          />
        );
      case "form":
        return (
          <ProjectGrid
            project={project}
            onChange={setFormData}
            images={images}
            links={links}
            notes={notes}
            checklists={checklists}
            onUpdateNote={reloadNotes}
            onUpdateLinks={reloadLinks}
            onUpdateImages={reloadImages}
            onUpdateChecklists={reloadChecklists}
            onDelete={(code, type) => handleDelete(code, "archive", type)}
          />
        );
      default:
        return (
          <ProjectGrid
            project={project}
            onChange={setFormData}
            images={images}
            links={links}
            notes={notes}
            checklists={checklists}
            onUpdateNote={reloadNotes}
            onUpdateLinks={reloadLinks}
            onUpdateImages={reloadImages}
            onUpdateChecklists={reloadChecklists}
            onDelete={(code, type) => handleDelete(code, "archive", type)}
          />
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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

      <ProjectViewTabs
        currentView={currentView!}
        onViewChange={setCurrentView}
      />

      <View style={styles.contentContainer}>{renderCurrentView()}</View>

      <AddButton onPress={() => setShowComponentSelector(true)} />

      <ComponentSelectorModal
        visible={showComponentSelector}
        onClose={() => setShowComponentSelector(false)}
        onSelectComponent={handleOptions}
      />

      <LinkModal
        visible={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSave={createLink}
        projectCode={projectCode}
      />

      <ImageModal
        projectCode={projectCode}
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSave={createImages}
      />

      <SketchModal
        projectCode={projectCode}
        visible={showSketchModal}
        onClose={() => setShowSketchModal(false)}
        onSaveNote={createNote}
        onSaveChecklist={createChecklist}
      />

      <IaToolsModal
        project={project}
        visible={showIaModal}
        onClose={() => setShowIaModal(false)}
        //onSaveNote={createNote}
        //onSaveChecklist={createChecklist}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  viewContent: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    margin: 16,
  },

  viewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 10,
  },

  viewText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
});
