import DraggableItem from "@/components/drag-item";
import { showToast } from "@/constants/showToast";
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
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Svg, { Circle, Defs, Pattern, Rect } from "react-native-svg"; //Pontilhados

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
  const [items, setItems] = useState<ProjectItem[]>([]); //Itens ja existentes
  const [lastLinks, setLastLinks] = useState<Link[]>([]); //Novos links
  const [lastImages, setLastImages] = useState<Image[]>([]); //Novas images
  const [lastNotes, setLastNotes] = useState<Note[]>([]); //Noas notas
  const [lastChecklists, setLastChecklists] = useState<Checklist[]>([]);

  //Controle de zoom
  const [scale, setScale] = useState(1);
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setScale(1);

  //useEffect que verifica a abertura da tela para inserir os itens:
  useEffect(() => {
    const findByCode = async () => {
      if (!props.project?.code) return;
      try {
        const components = await ItemService.getComponents(props.project.code);
        console.log("Itens carregados:", JSON.stringify(components, null, 2));
        setItems(components);
      } catch (error: any) {
        showToast("error", error.formattedMessage);
      }
    };
    findByCode();
  }, [props.project?.code]);

  //Notes UseEffect que valida a existência de um novo item, caso detecado, insere na lista...
  useEffect(() => {
    if (lastNotes.length === 0) {
      setLastNotes(props.notes);
      return;
    }

    const newNotes = props.notes.filter(
      (note) => !lastNotes.some((oldNote) => oldNote.code === note.code)
    );

    //handleAddNote para cada nova note
    newNotes.forEach((note) => {
      if (note.code) {
        handleAddNote(note);
      }
    });

    setLastNotes(props.notes); //Atualiza o estado da lista
  }, [props.notes]);

  useEffect(() => {
    if (lastLinks.length === 0) {
      setLastLinks(props.links);
      return;
    }

    const newLinks = props.links.filter(
      (link) => !lastLinks.some((oldLink) => oldLink.code === link.code)
    );

    //handleAddNote para cada nova note
    newLinks.forEach((link) => {
      if (link.code) {
        handleAddLink(link);
      }
    });

    setLastLinks(props.links); //Atualiza o estado da lista
  }, [props.links]);

  useEffect(() => {
    if (lastImages.length === 0) {
      setLastImages(props.images);
      return;
    }

    const newImages = props.images.filter(
      (image) => !lastImages.some((oldImage) => oldImage.code === image.code)
    );

    //handleAddNote para cada nova note
    newImages.forEach((image) => {
      if (image.code) {
        handleAddImage(image);
      }
    });

    setLastImages(props.images); //Atualiza o estado da lista
  }, [props.images]);

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
      if (checklist.code) {
        handleAddChecklist(checklist);
      }

      setLastChecklists(props.checklists);
    });
  }, [props.checklists]);

  //Transforma um novo objeto Note em um Item
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

      console.log(
        "[ProjectBoard] handleAddNote ",
        JSON.stringify(response, null)
      );

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

      console.log(
        "[ProjectBoard] handleAddChecklist ",
        JSON.stringify(response, null, 2)
      );

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

  //Transofrma um novo
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

      console.log(
        "[ProjectBoard] handleAddImage ",
        JSON.stringify(response, null)
      );

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

  //Atualizar posição do item: através dos eixos e o code do item, realizo a alteração pelo gesto
  const updateItemPosition = (code: number, x: number, y: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.code === code ? { ...item, x, y } : item
      )
    );
  };

  //Remove itens: através do code do item apenas, realizo o delet
  const deleteItem = async (
    itemCode: number,
    componentCode: number,
    task: string,
    type?: string
  ) => {
    try {
      if (task === "archive") {
        await ItemService.delete(itemCode); //Deletar o item primeiro
        // Deleta Item + Componente (via cascade no backend)
        props.onDelete?.(componentCode, task, type);
      } else {
        console.log("acessou else do item");
        // Apenas o Item (componente fica)
        await ItemService.delete(itemCode);
      }

      setItems((prev) => prev.filter((item) => item.code !== itemCode));
    } catch (error: any) {
      showToast("error", error.formattedMessage);
    }
  };

  //Padrão pontilhado otimizado (sem milhoes de elementos)
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
        >
          {items.map((item) => (
            <DraggableItem
              key={item.code}
              item={item}
              onPositionChange={updateItemPosition}
              onDelete={deleteItem}
            />
          ))}
        </ScrollView>
      </View>

      <View
        style={{
          position: "absolute",
          top: 25,
          right: 25,
          alignItems: "center",
          gap: 30, //Espaçamento entre grupos
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
          <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
            <Ionicons name="image" size={18} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
            <Ionicons name="link" size={18} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResetZoom} style={styles.zoomButton}>
            <Ionicons name="document-text" size={18} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
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
  zoomText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  canvas: {
    flex: 1,
    backgroundColor: "#e8e8e8ff", // fundo base
    overflow: "hidden",
  },
  canvasContent: {
    flexGrow: 1,
    minHeight: "100%",
    minWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProjectBoard;
