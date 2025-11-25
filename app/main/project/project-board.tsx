import DraggableItem from "@/components/drag-item";
import ImagesProjectModal from "@/components/images-project-modal";
import LinksProjectModal from "@/components/links-project-modal";
import NotesChecklistsProjectModal from "@/components/notes-checklists-project-modal";
import { showToast } from "@/constants/showToast";
import { AuthService } from "@/services/api/auth.service";
import { Checklist } from "@/services/checklist/checklist";
import { Image } from "@/services/image/image";
import { BaseItemDto } from "@/services/item/base-item.dto";
import { ItemService } from "@/services/item/item.service";
import {
  ChecklistBoardItem,
  ImageItem,
  LinkItem,
  NoteItem,
  ProjectItem,
} from "@/services/item/project-item";
import { Link } from "@/services/link/link";
import { Note } from "@/services/notes/note";
import { Project } from "@/services/project/project";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Svg, { Circle, Defs, Pattern, Rect } from "react-native-svg";

interface ProjectBoardProps {
  project?: Project;
  onChange?: (data: Partial<Project>) => void;
  onAddLink?: (linkData: Link) => void;
  onAddImage?: (imageData: ImageData) => void;
  onAddNote?: (noteData: Note) => void;

  onDelete?: (code: number, task: string, type?: string) => void;

  images: Image[];
  links: Link[];
  notes: Note[];
  checklists: Checklist[];
}

const ProjectBoard = (props: ProjectBoardProps) => {
  //Itens adicionados em tempo de execução
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [lastLinks, setLastLinks] = useState<Link[]>([]);
  const [lastImages, setLastImages] = useState<Image[]>([]);
  const [lastNotes, setLastNotes] = useState<Note[]>([]);
  const [lastChecklists, setLastChecklists] = useState<Checklist[]>([]);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);

  //Itens buscados do repositorio ja existente
  const [showProjectImages, setShowProjectImages] = useState(false);
  const [showProjectNotes, setShowProjectNotes] = useState(false);
  const [showProjectLinks, setShowProjectLinks] = useState(false);

  //Controle de zoom
  const [scale, setScale] = useState(1);
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleLongPressItem = (item: ProjectItem) => setSelectedItem(item);
  const clearSelection = () => setSelectedItem(null);

  const handleDeleteItem = () => {
    if (!selectedItem) return;
    deleteItem(
      selectedItem.code,
      selectedItem.componentCode,
      "item",
      selectedItem.type
    );
    clearSelection();
  };

  const handleDeleteArchive = () => {
    if (!selectedItem) return;
    deleteItem(
      selectedItem.code,
      selectedItem.componentCode,
      "archive",
      selectedItem.type
    );
    clearSelection();
  };

  //Get do zoom
  useEffect(() => {
    const loadZoom = async () => {
      if (!props.project?.code) return;
      const key = `project_zoom_${props.project.code}`;
      const savedZoom = await AuthService.safeGetItem(key);
      if (savedZoom) setScale(parseFloat(savedZoom));
    };
    loadZoom();
  }, [props.project?.code]);

  //Get do zoom
  useEffect(() => {
    if (!props.project?.code) return;
    const key = `project_zoom_${props.project.code}`;
    AsyncStorage.setItem(key, scale.toString());
  }, [scale, props.project?.code]);

  //useEffect que verifica a abertura da tela para inserir os itens
  useEffect(() => {
    const findByCode = async () => {
      if (!props.project?.code) return;
      try {
        const components = await ItemService.getComponents(props.project.code);
        setItems(components);
      } catch (error: any) {
        showToast("error", error.formattedMessage);
      }
    };
    findByCode();
  }, [props.project?.code]);

  //Notes UseEffect
  useEffect(() => {
    if (lastNotes.length === 0) {
      setLastNotes(props.notes);
      return;
    }
    const newNotes = props.notes.filter(
      (note) => !lastNotes.some((oldNote) => oldNote.code === note.code)
    );
    newNotes.forEach((note) => {
      if (note.code) handleAddNote(note);
    });
    setLastNotes(props.notes);
  }, [props.notes]);

  //Links UseEffect
  useEffect(() => {
    if (lastLinks.length === 0) {
      setLastLinks(props.links);
      return;
    }
    const newLinks = props.links.filter(
      (link) => !lastLinks.some((oldLink) => oldLink.code === link.code)
    );
    newLinks.forEach((link) => {
      if (link.code) handleAddLink(link);
    });
    setLastLinks(props.links);
  }, [props.links]);

  //Images UseEffect
  useEffect(() => {
    if (lastImages.length === 0) {
      setLastImages(props.images);
      return;
    }
    const newImages = props.images.filter(
      (image) => !lastImages.some((oldImage) => oldImage.code === image.code)
    );
    newImages.forEach((image) => {
      if (image.code) handleAddImage(image);
    });
    setLastImages(props.images);
  }, [props.images]);

  //Cheklists UseEffect
  useEffect(() => {
    if (lastChecklists.length === 0) {
      setLastChecklists(props.checklists);
      return;
    }
    const newChecklists = props.checklists.filter(
      (checklist) =>
        !lastChecklists.some(
          (oldChecklist) => oldChecklist.code === checklist.code
        )
    );
    newChecklists.forEach((checklist) => {
      if (checklist.code) handleAddChecklist(checklist);
    });
    setLastChecklists(props.checklists);
  }, [props.checklists]);

  const handleAddNote = async (noteData: Note) => {
    try {
      const baseItemDto: BaseItemDto = {
        type: "note",
        componentCode: noteData.code,
        x: 50,
        y: 50,
        width: 180,
        height: 100,
        projectCode: props.project?.code!,
      };
      const response = await ItemService.create(baseItemDto);
      const noteItem: NoteItem = {
        code: response.code,
        type: response.type as "note",
        componentCode: response.componentCode,
        x: response.x,
        y: response.y,
        width: response.width,
        height: response.height,
        title: response.title,
        description: response.description,
        sort: response.sort,
        updatedAt: response.updatedAt,
        projectCode: response.projectCode,
      };
      setItems((prev) => [...prev, noteItem]);
    } catch (error: any) {
      showToast("error", error.formattedMessage || "Erro desconhecido!");
    }
  };

  const handleAddChecklist = async (checklistData: Checklist) => {
    try {
      const baseItemDto: BaseItemDto = {
        type: "checklist",
        componentCode: checklistData.code,
        x: 50,
        y: 50,
        width: 180,
        height: 100,
        projectCode: props.project?.code!,
      };
      const response = await ItemService.create(baseItemDto);
      const checklistBoardItem: ChecklistBoardItem = {
        code: response.code,
        type: response.type as "checklist",
        componentCode: response.componentCode,
        x: response.x,
        y: response.y,
        width: response.width,
        height: response.height,
        title: response.title,
        items: response.items,
        updatedAt: response.updatedAt,
      };
      setItems((prev) => [...prev, checklistBoardItem]);
    } catch (error: any) {
      showToast("error", error.formattedMessage);
    }
  };

  const handleAddLink = async (linkData: Link) => {
    try {
      const baseItemDto: BaseItemDto = {
        type: "link",
        componentCode: linkData.code,
        x: 50,
        y: 50,
        width: 180,
        height: 100,
        projectCode: props.project?.code!,
      };
      const response = await ItemService.create(baseItemDto);
      const linkItem: LinkItem = {
        code: response.code,
        type: response.type as "link",
        componentCode: response.componentCode,
        x: response.x,
        y: response.y,
        width: response.width,
        height: response.height,
        title: response.title,
        url: response.url,
        previewImageUrl: response.previewImageUrl,
        createdAt: response.createdAt,
        projectCode: response.projectCode,
      };
      setItems((prev) => [...prev, linkItem]);
    } catch (error: any) {
      showToast("error", error.formattedMessage || "Erro desconhecido!");
    }
  };

  const handleAddImage = async (imageData: Image) => {
    try {
      const baseItemDto: BaseItemDto = {
        type: "image",
        componentCode: imageData.code,
        x: 50,
        y: 50,
        width: 180,
        height: 100,
        projectCode: props.project?.code!,
      };
      const response = await ItemService.create(baseItemDto);
      const imageItem: ImageItem = {
        code: response.code,
        type: response.type as "image",
        componentCode: response.componentCode,
        x: response.x,
        y: response.y,
        width: response.width,
        height: response.height,
        filename: response.filename,
        isCover: response.isCover,
        source: response.source,
        createdAt: response.createdAt,
        projectCode: response.projectCode,
      };
      setItems((prev) => [...prev, imageItem]);
    } catch (error: any) {
      showToast("error", error.formattedMessage || "Erro desconhecido!");
    }
  };

  const updateItemPosition = (code: number, x: number, y: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.code === code ? { ...item, x, y } : item
      )
    );
  };

  const deleteItem = async (
    itemCode: number,
    componentCode: number,
    task: string,
    type?: string
  ) => {
    try {
      if (task === "archive") {
        await ItemService.delete(itemCode);
        props.onDelete?.(componentCode, task, type);
      } else {
        await ItemService.delete(itemCode);
      }
      setItems((prev) => prev.filter((item) => item.code !== itemCode));
    } catch (error: any) {
      showToast("error", error.formattedMessage);
    }
  };

  const renderDotsBackground = () => (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="dots"
            patternUnits="userSpaceOnUse"
            width="24"
            height="24"
          >
            <Circle cx="1.5" cy="1.5" r="0.8" fill="#7b7bc0ff" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dots)" />
      </Svg>
    </View>
  );

  //Animações do modal
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;

  const openModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      clearSelection();
    });
  };

  useEffect(() => {
    if (selectedItem) {
      openModal();
    } else {
      modalOpacity.setValue(0);
      modalScale.setValue(0.8);
    }
  }, [selectedItem]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.canvas}>
        {renderDotsBackground()}
        <ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={[
            styles.canvasContent,
            { transform: [{ scale }] },
          ]}
          pointerEvents="box-none"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onTouchStart={clearSelection}
        >
          {items.map((item) => (
            <DraggableItem
              key={item.code}
              item={item}
              onPositionChange={updateItemPosition}
              onDelete={deleteItem}
              onLongPress={handleLongPressItem}
            />
          ))}
        </ScrollView>
      </View>

      {/*Modal com as 3 opções*/}
      <Modal transparent visible={!!selectedItem} onRequestClose={closeModal}>
        <Animated.View
          style={[styles.modalOverlay, { opacity: modalOpacity }]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ scale: modalScale }] },
            ]}
          >
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => {
                  handleDeleteArchive();
                  closeModal();
                }}
                style={styles.modalButton}
              >
                <View
                  style={[
                    styles.modalIconWrapper,
                    { backgroundColor: "#ff4d4d" },
                  ]}
                >
                  <Ionicons name="trash" size={26} color="#fff" />
                </View>
                <Text style={styles.modalLabel}>Excluir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleDeleteItem();
                  closeModal();
                }}
                style={styles.modalButton}
              >
                <View
                  style={[
                    styles.modalIconWrapper,
                    { backgroundColor: "#e2d40e" },
                  ]}
                >
                  <Ionicons name="archive-outline" size={26} color="#fff" />
                </View>
                <Text style={styles.modalLabel}>Arquivar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
                <View
                  style={[styles.modalIconWrapper, { backgroundColor: "#888" }]}
                >
                  <Ionicons name="close" size={26} color="#fff" />
                </View>
                <Text style={styles.modalLabel}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      <View
        style={{
          position: "absolute",
          top: 25,
          right: 25,
          alignItems: "center",
          gap: 30,
        }}
      >
        <View style={styles.zoomControls}>
          <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
            <Feather name="plus" size={18} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
            <Feather name="minus" size={18} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResetZoom} style={styles.zoomButton}>
            <Feather name="refresh-cw" size={18} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.archiveControls}>
          <TouchableOpacity
            onPress={() => setShowProjectImages(true)}
            style={styles.zoomButton}
          >
            <Ionicons name="image" size={18} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowProjectLinks(true)}
            style={styles.zoomButton}
          >
            <Ionicons name="link" size={18} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowProjectNotes(true)}
            style={styles.zoomButton}
          >
            <Ionicons name="document-text" size={18} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ImagesProjectModal
        project={props.project}
        userCode={props.project?.userCode}
        visible={showProjectImages}
        onClose={() => setShowProjectImages(false)}
        onAddToBoard={async (data: any) => {
          if (!props.project) return;
          await handleAddImage(data);
          setShowProjectImages(false);
        }}
      />

      <NotesChecklistsProjectModal
        project={props.project}
        userCode={props.project?.userCode}
        visible={showProjectNotes}
        onClose={() => setShowProjectNotes(false)}
        onAddToBoard={async (data: any) => {
          if (!props.project) return;

          if ("description" in data) {
            await handleAddNote(data);
          } else {
            await handleAddChecklist(data);
          }

          setShowProjectNotes(false);
        }}
      />

      <LinksProjectModal
        project={props.project}
        userCode={props.project?.userCode}
        visible={showProjectLinks}
        onClose={() => setShowProjectLinks(false)}
        onAddToBoard={async (data: any) => {
          if (!props.project) return;
          handleAddLink(data);
          setShowProjectLinks(false);
        }}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0,
    marginBottom: 0,
    backgroundColor: "#e8e8e8ff",
  },
  zoomControls: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  archiveControls: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  zoomButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffffcc",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  canvas: {
    flex: 1,
    backgroundColor: "#e8e8e8ff",
    overflow: "hidden",
  },
  canvasContent: {
    flexGrow: 1,
    minHeight: "100%",
    minWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "transparent", // remove o fundo branco
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 35,
  },
  modalButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modalIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  modalLabel: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
});

export default ProjectBoard;
