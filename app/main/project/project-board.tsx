import DraggableItem from "@/components/drag-item";
import { showToast } from "@/constants/showToast";
import { Checklist } from "@/services/checklist/checklist";
import { Image } from "@/services/image/image";
import { BaseItemDto } from "@/services/item/base-item.dto";
import { ItemService } from "@/services/item/item.service";
import {
  ImageItem,
  LinkItem,
  NoteItem,
  ProjectItem,
} from "@/services/item/project-item";
import { Link } from "@/services/link/link";
import { Note } from "@/services/notes/note";
import { Project } from "@/services/project/project";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
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
        projectCode: props.project?.code!
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
        projectCode: response.projectCode
      };

      setItems((prev) => [...prev, noteItem]);
    } catch (error: any) {
      showToast("error", error.formattedMessage || "Erro desconhecido!");
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
        projectCode: props.project?.code!
      };

      const response = await ItemService.create(baseItemDto);

      console.log(
        "[ProjectBoard] handleAddLink ",
        JSON.stringify(response, null)
      );

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
        projectCode: response.projectCode
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
        projectCode: props.project?.code!
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
        projectCode: response.projectCode
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
  const deleteItem = async (code: number, task: string, type?: string) => {
    if (task === "archive") {
      props.onDelete?.(code, task, type);
      return;
    }

    if (task === "item") {
      await ItemService.delete(code);
      return;
    }

    setItems((currentItems) =>
      currentItems.filter((item) => item.code !== code)
    );
  };


  //Padrão pontilhado otimizado (sem milhoes de elementos)
  const renderDotsBackground = () => (
    <Svg width="100%" height="100%">
      <Defs>
        <Pattern id="dots" patternUnits="userSpaceOnUse" width="24" height="24">
          <Circle cx="1.5" cy="1.5" r="0.8" fill="#7b7bc0ff" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dots)" x={2} y={8} />
    </Svg>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.canvas}>
        {renderDotsBackground()} {/*Carrega os portinhos*/}
        <ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={[styles.canvasContent, { transform: [{ scale }] }]}
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

      {/* Controles de zoom */}
      <View style={styles.zoomControls}>
        <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
          <Text style={styles.zoomText}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
          <Text style={styles.zoomText}>－</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResetZoom} style={styles.zoomButton}>
          <Text style={styles.zoomText}>⟳</Text>
        </TouchableOpacity>
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
    position: "absolute",
    top: 25,
    right: 25,
    flexDirection: "row",
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
    width: "100%",
    height: "100%",
  },
  canvasContent: {
    flexGrow: 1,
    minHeight: "100%",
  },
});

export default ProjectBoard;
