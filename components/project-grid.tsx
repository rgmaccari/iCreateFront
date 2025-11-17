import { Checklist } from "@/services/checklist/checklist";
import { Image } from "@/services/image/image";
import { Link } from "@/services/link/link";
import { LinkService } from "@/services/link/link.service";
import { Note } from "@/services/notes/note";
import { Project } from "@/services/project/project";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  Modal,
  Image as RNImage,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";

import { showToast } from "@/constants/showToast";
import { NoteService } from "@/services/notes/note.service";
import * as Clipboard from 'expo-clipboard';
import ImageViewing from "react-native-image-viewing";

type CombinedItem = (Image | Link | Note) & {
  __type: "image" | "link" | "note";
};

interface ProjectGridProps {
  project?: Project;
  onChange: (data: Partial<Project>) => void;
  images: Image[];
  links: Link[];
  notes: Note[];
  checklists: Checklist[];
  onUpdateNote?: () => void;
  onUpdateLinks?: () => void;
  onUpdateImages?: () => void;
}

export default function ProjectGrid(props: ProjectGridProps) {
  const [form, setForm] = useState<Partial<Project>>({
    title: props.project?.title || "",
    sketch: props.project?.sketch || "",
  }); //Title e Description do Project
  const [selectedItem, setSelectedItem] = useState<Image | Link | Note | null>(
    null
  ); //Item acessado
  const [modalVisible, setModalVisible] = useState(false); //Visibilidade do modal
  const [activeFilters, setActiveFilters] = useState<
    ("image" | "link" | "note")[]
  >([]); //Filtros ativos

  // No componente ProjectGrid, adicionar APENAS estes estados:
  const [editableTitle, setEditableTitle] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editableNoteTitle, setEditableNoteTitle] = useState("");
  const [editableNoteDescription, setEditableNoteDescription] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);

  //Notificar a tela pai (projectScreen) quando o form mudar
  useEffect(() => {
    props.onChange(form);
  }, [form, props.onChange]);

  //Abrir modal com o objeto em tela cheia
  const openItemModal = (item: Image | Link | Note) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Alternar filtros (permitindo múltiplos)
  const toggleFilter = (type: "image" | "link" | "note") => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Junta todos os itens em um único array ordenado por data
  const combinedItems = useMemo<CombinedItem[]>(() => {
    const all: CombinedItem[] = [
      ...props.images.map((i) => ({ ...i, __type: "image" as const })),
      ...props.links.map((l) => ({ ...l, __type: "link" as const })),
      ...props.notes.map((n) => ({ ...n, __type: "note" as const })),
    ];

    return all.sort((a, b) => {
      const da = (a as any).updatedAt || (a as any).createdAt || "";
      const db = (b as any).updatedAt || (b as any).createdAt || "";
      return new Date(db).getTime() - new Date(da).getTime();
    });
  }, [props.images, props.links, props.notes]);

  // Aplica os filtros ativos
  const filteredItems = useMemo(() => {
    if (activeFilters.length === 0) return combinedItems;
    return combinedItems.filter((item) => activeFilters.includes(item.__type));
  }, [activeFilters, combinedItems]);

  //Renderizar o item de grid (imagem, link ou nota)
  const renderGridItem = ({ item }: { item: any }) => {
    let imageUri: string | undefined;
    if (item.__type === "image") imageUri = item.url;
    if (item.__type === "link") imageUri = item.previewImageUrl || undefined;
    // notas não têm imagem

    const iconName =
      item.__type === "image"
        ? "image"
        : item.__type === "link"
          ? "link"
          : "sticky-note";

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => openItemModal(item)}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <RNImage source={{ uri: imageUri }} style={styles.gridImage} />
        ) : (
          <View style={styles.placeholder}>
            <FontAwesome name={iconName} size={30} color="#888" />
          </View>
        )}
        <View style={styles.iconFooter}>
          <FontAwesome name={iconName} size={16} color="#fff" />
        </View>
      </TouchableOpacity>
    );
  };

  //Renderizar o item modal tela cheia (imagem, link ou nota)
  // No ProjectGrid, substituir APENAS a função renderItemModal:
  const renderItemModal = () => {
    if (!selectedItem) return null;

    if ("url" in selectedItem && "filename" in selectedItem) {
      const imageSources = [{ uri: selectedItem.url }];

      return (
        <ImageViewing
          images={imageSources}
          imageIndex={0}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        />
      );
    } else if ("url" in selectedItem && "title" in selectedItem) {
      const handleSave = async () => {
        try {
          await LinkService.update(selectedItem.code!, {
            title: editableTitle,
            url: selectedItem.url
          });
          setIsEditingLink(false);
          //Atualizar o item selecionado com o novo título
          setSelectedItem({ ...selectedItem, title: editableTitle });


          showToast('success', 'Nota atualizada!');

          if (props.onUpdateLinks) {
            props.onUpdateLinks();
          }

          setModalVisible(false);
          setEditableTitle("");
        } catch (error: any) {
          showToast('error', error.formattedMessage)
        }
      };

      const handleCopyLink = async () => {
        try {
          await Clipboard.setStringAsync(selectedItem.url!);
          showToast('info', 'Link copiado!');
        } catch (error) {
          console.error("Erro ao copiar link:", error);
        }
      };

      const handleAccessLink = () => {
        Linking.openURL(selectedItem.url!).catch(err =>
          console.error('Erro ao abrir link:', err)
        );
      };

      return (
        <View style={styles.linkModalOverlay}>
          <View style={styles.linkModalCard}>
            {/* Header com botão fechar */}
            <View style={styles.linkModalHeader}>
              <TouchableOpacity
                style={styles.linkModalCloseButton}
                onPress={() => {
                  setModalVisible(false);
                  setIsEditingLink(false);
                  setEditableTitle("");
                }}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Preview da imagem */}
            {selectedItem.previewImageUrl && (
              <RNImage
                source={{ uri: selectedItem.previewImageUrl }}
                style={styles.linkPreviewImage}
                resizeMode="cover"
              />
            )}

            {/* Título editável */}
            <View style={styles.linkTitleContainer}>
              <TextInput
                style={styles.linkTitleInput}
                value={editableTitle || selectedItem.title || ""}
                onChangeText={setEditableTitle}
                placeholder="Título do link"
                onFocus={() => setIsEditingLink(true)}
                multiline
              />
            </View>

            {/* URL (não editável) */}
            <Text style={styles.linkUrl} numberOfLines={2}>
              {selectedItem.url}
            </Text>

            {/* Botões de ação */}
            <View style={styles.linkActions}>
              <TouchableOpacity
                style={styles.linkActionButton}
                onPress={handleCopyLink}
              >
                <Ionicons name="copy-outline" size={20} color="#6B7280" />
                <Text style={styles.linkActionText}>Copiar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkActionButton}
                onPress={handleAccessLink}
              >
                <Ionicons name="open-outline" size={20} color="#6B7280" />
                <Text style={styles.linkActionText}>Acessar</Text>
              </TouchableOpacity>

              {isEditingLink && (
                <TouchableOpacity
                  style={[styles.linkActionButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
                  <Text style={[styles.linkActionText, styles.saveButtonText]}>Salvar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    } else {
      const note = selectedItem as Note;

      const handleSaveNote = async () => {
        try {
          await NoteService.update(note.code!, {
            title: editableNoteTitle,
            description: editableNoteDescription,
            projectCode: note.projectCode,
            sort: note.sort || 0
          });
          setIsEditingNote(false);
          // Atualizar o item selecionado
          setSelectedItem({
            ...selectedItem,
            title: editableNoteTitle,
            description: editableNoteDescription
          } as Note);
          showToast('success', 'Nota atualizada!');

          if (props.onUpdateNote) {
            props.onUpdateNote();
          }
        } catch (error) {
          console.error("Erro ao atualizar nota:", error);
          showToast('error', 'Erro ao atualizar nota');
        }
      };

      return (
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            <TouchableOpacity
              style={styles.previewCloseButton}
              onPress={() => {
                setModalVisible(false);
                setIsEditingNote(false);
                setEditableNoteTitle("");
                setEditableNoteDescription("");
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            {/* Título editável */}
            <TextInput
              style={styles.noteTitleInput}
              value={editableNoteTitle || note.title || ""}
              onChangeText={setEditableNoteTitle}
              placeholder="Título da nota"
              onFocus={() => setIsEditingNote(true)}
              multiline
            />

            {/* Descrição editável */}
            <ScrollView style={styles.previewBody}>
              <TextInput
                style={styles.noteDescriptionInput}
                value={editableNoteDescription || note.description || ""}
                onChangeText={setEditableNoteDescription}
                placeholder="Conteúdo da nota..."
                multiline
                onFocus={() => setIsEditingNote(true)}
              />
            </ScrollView>

            {/* Botão salvar */}
            {isEditingNote && (
              <TouchableOpacity
                style={styles.noteSaveButton}
                onPress={handleSaveNote}
              >
                <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
                <Text style={styles.noteSaveButtonText}>Salvar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Campo de Descrição */}
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Descreva seu projeto..."
          multiline
          numberOfLines={4}
          value={form.sketch}
          onChangeText={(text) => setForm((prev) => ({ ...prev, sketch: text }))}
        />

        {/* Filtro por tipo */}
        <View style={styles.filterContainer}>
          {(["image", "link", "note"] as const).map((type) => {
            const iconName =
              type === "image"
                ? "image"
                : type === "link"
                  ? "link"
                  : "document-text";

            const isActive = activeFilters.includes(type);
            const color =
              type === "image"
                ? "#2196F3"
                : type === "link"
                  ? "#4CAF50"
                  : "#FFB300";

            return (
              <TouchableOpacity
                key={type}
                onPress={() => toggleFilter(type)}
                style={[
                  styles.filterButton,
                  isActive && {
                    backgroundColor: color + "22",
                    borderColor: color,
                  },
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={20}
                  color={isActive ? color : "#666"}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Grid unificado estilo Instagram */}
        <FlatList
          data={filteredItems}
          renderItem={renderGridItem}
          keyExtractor={(item, index) => `${item.__type}_${item.code || index}`}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          ListFooterComponent={<View style={{ height: 50 }} />}
        />

        {/* Modal tela cheia para exibir detalhes */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          {renderItemModal()}
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1A1A1A",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
    color: "#1A1A1A",
  },

  multiline: {
    textAlignVertical: "top",
    height: 100,
  },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },

  filterButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
  },

  filterButtonActive: {
    backgroundColor: "#F8F9FA",
    borderColor: "#C5C5C5",
  },

  gridContainer: {
    justifyContent: "space-between",
  },

  gridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 1,
    position: "relative",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  gridImage: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
  },

  iconFooter: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 6,
    padding: 2,
  },

  modalFullScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },

  modalText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
    textAlign: "center",
  },

  coverBadge: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
    marginBottom: 8,
  },

  fullImage: {
    width: "100%",
    height: "70%",
    borderRadius: 8,
    marginBottom: 16,
  },

  modalCloseButton: {
    backgroundColor: "#7B1FA2",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },

  modalCloseText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  previewCard: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    position: "relative",
  },
  previewCloseButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    zIndex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    paddingRight: 40,
  },
  previewBody: {
    maxHeight: 500,
  },
  previewDescription: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  // Adicionar APENAS estes estilos ao StyleSheet:
  linkModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  linkModalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  linkModalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  linkModalCloseButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  linkPreviewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  linkTitleContainer: {
    marginBottom: 12,
  },
  linkTitleInput: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
  },
  linkUrl: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  linkActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 10,
  },
  linkActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    gap: 6,
  },
  linkActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  saveButtonText: {
    color: "#FFFFFF",
  },
  noteTitleInput: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    paddingRight: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
  },
  noteDescriptionInput: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  noteSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FF9500",
    gap: 6,
    marginTop: 16,
  },
  noteSaveButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});

