import { Checklist } from "@/services/checklist/checklist";
import { Image } from "@/services/image/image";
import { Link } from "@/services/link/link";
import { LinkService } from "@/services/link/link.service";
import { Note } from "@/services/notes/note";
import { Project } from "@/services/project/project";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
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
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";

import { showToast } from "@/constants/showToast";
import { ChecklistDto } from "@/services/checklist/checklist.dto";
import { ChecklistService } from "@/services/checklist/checklist.service";
import { NoteService } from "@/services/notes/note.service";
import * as Clipboard from "expo-clipboard";
import ImageViewing from "react-native-image-viewing";

type CombinedItem = (Image | Link | Note | Checklist) & {
  __type: "image" | "link" | "note" | "checklist";
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
  onUpdateChecklists?: () => void;
  onDelete?: (
    code: number,
    type: "image" | "link" | "note" | "checklist"
  ) => void;
}

export default function ProjectGrid(props: ProjectGridProps) {
  const [form, setForm] = useState<Partial<Project>>({
    title: props.project?.title || "",
    sketch: props.project?.sketch || "",
  }); //Title e Description do Project
  const [selectedItem, setSelectedItem] = useState<
    Image | Link | Note | Checklist | null
  >(null); //Item acessado
  const [modalVisible, setModalVisible] = useState(false); //Visibilidade do modal
  const [activeFilters, setActiveFilters] = useState<
    ("image" | "link" | "note" | "checklist")[]
  >([]); //Filtros ativos

  // No componente ProjectGrid, adicionar APENAS estes estados:
  const [editableTitle, setEditableTitle] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editableNoteTitle, setEditableNoteTitle] = useState("");
  const [editableNoteDescription, setEditableNoteDescription] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Estados para edição do checklist
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(
    null
  );
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [isEditingChecklist, setIsEditingChecklist] = useState(false);
  const lastChecklistItemRef = useRef<TextInput | null>(null);

  //Notificar a tela pai (projectScreen) quando o form mudar
  useEffect(() => {
    props.onChange(form);
  }, [form, props.onChange]);

  //Abrir modal com o objeto em tela cheia
  const openItemModal = (item: Image | Link | Note | Checklist) => {
    setSelectedItem(item);
    setModalVisible(true);

    // Se for um checklist, inicializa os estados de edição
    if ("itens" in item) {
      setEditingChecklist(JSON.parse(JSON.stringify(item)));
      setEditableTitle(item.title || "");
      setIsEditingChecklist(false);
    }
  };

  // Alternar filtros (permitindo múltiplos)
  const toggleFilter = (type: "image" | "link" | "note" | "checklist") => {
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
      ...props.checklists.map((n) => ({ ...n, __type: "checklist" as const })),
    ];

    return all.sort((a, b) => {
      const da = (a as any).updatedAt || (a as any).createdAt || "";
      const db = (b as any).updatedAt || (b as any).createdAt || "";
      return new Date(db).getTime() - new Date(da).getTime();
    });
  }, [props.images, props.links, props.notes, props.checklists]);

  // Aplica os filtros ativos
  const filteredItems = useMemo(() => {
    if (activeFilters.length === 0) return combinedItems;
    return combinedItems.filter((item) => activeFilters.includes(item.__type));
  }, [activeFilters, combinedItems]);

  const getItemTypeName = (type: string) => {
    switch (type) {
      case "image":
        return "imagem";
      case "link":
        return "link";
      case "note":
        return "nota";
      case "checklist":
        return "checklist";
      default:
        return "item";
    }
  };

  //Funções para edição do checklist
  const updateChecklistItem = (index: number, text: string) => {
    if (!editingChecklist) return;

    setEditingChecklist((prev) => ({
      ...prev!,
      itens: prev!.itens.map((item, i) =>
        i === index ? { ...item, text } : item
      ),
    }));
    setIsEditingChecklist(true);
  };

  const toggleChecklistItem = (index: number) => {
    if (!editingChecklist) return;

    setEditingChecklist((prev) => ({
      ...prev!,
      itens: prev!.itens.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      ),
    }));
    setIsEditingChecklist(true);
  };

  const removeChecklistItem = (index: number) => {
    if (!editingChecklist) return;

    setEditingChecklist((prev) => ({
      ...prev!,
      itens: prev!.itens.filter((_, i) => i !== index),
    }));
    setIsEditingChecklist(true);
  };

  const moveChecklistItem = (fromIndex: number, toIndex: number) => {
    if (!editingChecklist) return;

    const items = [...editingChecklist.itens];
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);

    setEditingChecklist((prev) => ({
      ...prev!,
      itens: items,
    }));
    setIsEditingChecklist(true);
  };

  const addChecklistItem = () => {
    if (!editingChecklist || !newChecklistItem.trim()) return;

    // Adicionar a limitação de 5 itens
    if (editingChecklist.itens.length >= 15) {
      return;
    }

    setEditingChecklist((prev) => ({
      ...prev!,
      itens: [
        ...prev!.itens,
        {
          text: newChecklistItem.trim(),
          checked: false,
          sort: prev!.itens.length,
        },
      ],
    }));

    setNewChecklistItem("");
    setIsEditingChecklist(true);

    setTimeout(() => {
      lastChecklistItemRef.current?.focus();
    }, 50);
  };

  const handleSaveChecklist = async () => {
    if (!editingChecklist) return;

    try {
      const dto: ChecklistDto = {
        title: editableTitle.trim() || "Checklist",
        itens: editingChecklist.itens.map((item, index) => ({
          text: item.text.trim(),
          checked: item.checked,
          sort: index,
        })),
        projectCode: editingChecklist.projectCode,
      };

      await ChecklistService.update(editingChecklist.code, dto);
      showToast("success", "Checklist atualizado com sucesso!");
      setIsEditingChecklist(false);

      if (props.onUpdateChecklists) {
        props.onUpdateChecklists();
      }

      setModalVisible(false);
    } catch (error: any) {
      showToast("error", error.formattedMessage || "Erro ao salvar checklist");
    }
  };

  //Renderizar o item de grid (imagem, link, nota ou checklist)
  const renderGridItem = ({ item }: { item: any }) => {
    let imageUri: string | undefined;
    if (item.__type === "image") imageUri = item.url;
    if (item.__type === "link") imageUri = item.previewImageUrl || undefined;
    //checklists e notas não têm imagem

    const iconName =
      item.__type === "image"
        ? "image"
        : item.__type === "link"
        ? "link"
        : item.__type === "checklist"
        ? "check-square"
        : "sticky-note";

    const handleLongPress = () => {
      Alert.alert(
        "Excluir item",
        `Deseja excluir este(a) ${getItemTypeName(item.__type)}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: () => {
              if (props.onDelete && item.code) {
                props.onDelete(item.code, item.__type);
              }
            },
          },
        ]
      );
    };

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => openItemModal(item)}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        delayLongPress={500}
      >
        {imageUri ? (
          <RNImage source={{ uri: imageUri }} style={styles.gridImage} />
        ) : (
          <View
            style={[
              styles.placeholder,
              item.__type === "checklist" && styles.checklistPlaceholder,
            ]}
          >
            <FontAwesome name={iconName} size={30} color="#888" />
            {/* Mostrar progresso do checklist no grid */}
            {item.__type === "checklist" && (
              <View style={styles.checklistBadge}>
                <Text style={styles.checklistBadgeText}>
                  {item.itens?.filter((i: any) => i.checked).length || 0}/
                  {item.itens?.length || 0}
                </Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.iconFooter}>
          <FontAwesome name={iconName} size={16} color="#fff" />
        </View>
      </TouchableOpacity>
    );
  };

  // Nova função para renderizar modal do checklist editável
  const renderChecklistModal = (checklist: Checklist) => {
    const completed =
      editingChecklist?.itens?.filter((i) => i.checked).length || 0;
    const total = editingChecklist?.itens?.length || 0;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return (
      <View style={styles.previewOverlay}>
        <View style={styles.previewCard}>
          {/* Header com título à esquerda e botão fechar à direita */}
          <View style={[styles.modalHeader, { alignItems: "flex-start" }]}>
            <TextInput
              style={[
                styles.checklistTitleInput,
                { flex: 1 },
                !editableTitle && { color: "#9CA3AF" },
              ]}
              value={editableTitle || ""}
              onChangeText={(text) => {
                setEditableTitle(text);
                setIsEditingChecklist(true);
              }}
              placeholder="Informe um título"
              placeholderTextColor="#9CA3AF"
              onFocus={() => setIsEditingChecklist(true)}
              multiline
            />

            <TouchableOpacity
              style={styles.previewCloseButton}
              onPress={() => {
                if (isEditingChecklist) {
                  Alert.alert(
                    "Alterações não salvas",
                    "Deseja salvar as alterações?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Não salvar",
                        style: "destructive",
                        onPress: () => setModalVisible(false),
                      },
                      { text: "Salvar", onPress: handleSaveChecklist },
                    ]
                  );
                } else {
                  setModalVisible(false);
                }
              }}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Barra de progresso - atualizada em tempo real */}
          <View style={styles.checklistProgress}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completed}/{total} concluídos
            </Text>
          </View>

          {/* Lista de itens editável */}
          <ScrollView style={styles.checklistItemsContainer}>
            {editingChecklist?.itens?.map((item, index) => (
              <View key={index} style={styles.checklistItem}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    item.checked && styles.checkboxChecked,
                  ]}
                  onPress={() => toggleChecklistItem(index)}
                >
                  {item.checked && (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  )}
                </TouchableOpacity>

                <TextInput
                  ref={
                    index === editingChecklist.itens.length - 1
                      ? lastChecklistItemRef
                      : null
                  }
                  style={[
                    styles.checklistItemInput,
                    item.checked && styles.checklistItemInputChecked,
                  ]}
                  value={item.text}
                  onChangeText={(text) => updateChecklistItem(index, text)}
                  placeholder="Digite o item..."
                  placeholderTextColor="#999"
                  maxLength={30}
                />

                {/* Botões de ordenação e remoção */}
                <View style={styles.checklistItemActions}>
                  {index > 0 && (
                    <TouchableOpacity
                      style={styles.moveButton}
                      onPress={() => moveChecklistItem(index, index - 1)}
                    >
                      <Ionicons name="chevron-up" size={16} color="#666" />
                    </TouchableOpacity>
                  )}

                  {index < editingChecklist.itens.length - 1 && (
                    <TouchableOpacity
                      style={styles.moveButton}
                      onPress={() => moveChecklistItem(index, index + 1)}
                    >
                      <Ionicons name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.removeChecklistItemButton}
                    onPress={() => removeChecklistItem(index)}
                  >
                    <Ionicons name="close" size={16} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Input para novo item */}
          <View style={styles.newChecklistItemContainer}>
            <TextInput
              style={styles.newChecklistItemInput}
              value={newChecklistItem}
              onChangeText={setNewChecklistItem}
              placeholder="Digite um novo item..."
              placeholderTextColor="#999"
              onSubmitEditing={addChecklistItem}
              returnKeyType="done"
              maxLength={30}
            />
            <TouchableOpacity
              style={[
                styles.addChecklistItemButton,
                (!newChecklistItem.trim() ||
                  editingChecklist?.itens.length! >= 15) &&
                  styles.addChecklistItemButtonDisabled,
              ]}
              onPress={addChecklistItem}
              disabled={
                !newChecklistItem.trim() ||
                editingChecklist?.itens.length! >= 15
              }
            >
              <Ionicons
                name="add"
                size={20}
                color={
                  newChecklistItem.trim() &&
                  editingChecklist?.itens.length! < 15
                    ? "#fff"
                    : "#ccc"
                }
              />
            </TouchableOpacity>
          </View>

          {/* Botão salvar */}
          {isEditingChecklist && (
            <TouchableOpacity
              style={styles.saveChecklistButton}
              onPress={handleSaveChecklist}
            >
              <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveChecklistButtonText}>
                Salvar Alterações
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  //Renderizar o item modal tela cheia (imagem, link, nota ou checklist)
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
            url: selectedItem.url,
          });
          setIsEditingLink(false);
          //Atualizar o item selecionado com o novo título
          setSelectedItem({ ...selectedItem, title: editableTitle });

          showToast("success", "Nota atualizada!");

          if (props.onUpdateLinks) {
            props.onUpdateLinks();
          }

          setModalVisible(false);
          setEditableTitle("");
        } catch (error: any) {
          showToast("error", error.formattedMessage);
        }
      };

      const handleCopyLink = async () => {
        try {
          await Clipboard.setStringAsync(selectedItem.url!);
          showToast("info", "Link copiado!");
        } catch (error) {
          console.error("Erro ao copiar link:", error);
        }
      };

      const handleAccessLink = () => {
        Linking.openURL(selectedItem.url!).catch((err) =>
          console.error("Erro ao abrir link:", err)
        );
      };

      return (
        <View style={styles.linkModalOverlay}>
          <View style={styles.linkModalCard}>
            {/* Header com título à esquerda e botão fechar à direita */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Editar Link</Text>
              <TouchableOpacity
                style={styles.previewCloseButton}
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
                  <Ionicons
                    name="checkmark-outline"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={[styles.linkActionText, styles.saveButtonText]}>
                    Salvar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    } else if ("itens" in selectedItem) {
      //É um Checklist
      return renderChecklistModal(selectedItem as Checklist);
    } else {
      //É uma Note
      const note = selectedItem as Note;

      const handleSaveNote = async () => {
        try {
          await NoteService.update(note.code!, {
            title: editableNoteTitle,
            description: editableNoteDescription,
            projectCode: note.projectCode,
            sort: note.sort || 0,
          });
          setIsEditingNote(false);
          setModalVisible(false);
          // Atualizar o item selecionado
          showToast("success", "Nota atualizada!");

          if (props.onUpdateNote) {
            props.onUpdateNote();
          }
        } catch (error: any) {
          console.error("Erro ao atualizar nota:", error);
          showToast("error", error.formattedMessage);
        }
      };

      return (
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            {/* Header com título à esquerda e botão fechar à direita */}
            <View style={[styles.modalHeader, { alignItems: "flex-start" }]}>
              <TextInput
                style={[
                  styles.noteTitleInput,
                  { flex: 1 },
                  !(editableNoteTitle || note.title) && { color: "#9CA3AF" },
                ]}
                value={editableNoteTitle || note.title || ""}
                onChangeText={setEditableNoteTitle}
                placeholder="Informe um título"
                placeholderTextColor="#9CA3AF"
                maxLength={100}
                onFocus={() => setIsEditingNote(true)}
                multiline
              />

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
            </View>

            {/* Descrição editável */}
            <ScrollView style={styles.previewBody}>
              <TextInput
                style={styles.noteDescriptionInput}
                value={editableNoteDescription || note.description || ""}
                onChangeText={setEditableNoteDescription}
                placeholder="Conteúdo da nota..."
                multiline
                onFocus={() => setIsEditingNote(true)}
                maxLength={1000}
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
          maxLength={1000}
          numberOfLines={4}
          value={form.sketch}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, sketch: text }))
          }
        />

        {/* Filtro por tipo */}
        <View style={styles.filterContainer}>
          {(["image", "link", "note", "checklist"] as const).map((type) => {
            const iconName =
              type === "image"
                ? "image"
                : type === "link"
                ? "link"
                : type === "checklist"
                ? "checkbox"
                : "document-text";

            const isActive = activeFilters.includes(type);
            const color =
              type === "image"
                ? "#2196F3"
                : type === "link"
                ? "#4CAF50"
                : type === "checklist"
                ? "#9C27B0"
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

  checklistPlaceholder: {
    backgroundColor: "#F3E5F5",
  },

  checklistBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  checklistBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
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
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    position: "relative",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  previewCloseButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
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
  // Header consistente para todos os modais
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  // Estilos para checklist
  checklistTitleInput: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
    textAlign: "center",
  },
  checklistProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  checklistItemsContainer: {
    maxHeight: 400,
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FF9500",
    borderColor: "#FF9500",
  },
  checklistItemInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  checklistItemInputChecked: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  checklistItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  moveButton: {
    padding: 4,
  },
  removeChecklistItemButton: {
    padding: 4,
  },
  newChecklistItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  newChecklistItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  addChecklistItemButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FF9500",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addChecklistItemButtonDisabled: {
    backgroundColor: "#ddd",
  },
  saveChecklistButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#FF9500",
    gap: 8,
  },
  saveChecklistButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    color: "#9CA3AF",
    fontStyle: "italic",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  // Estilos para link modal
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
  // Estilos para note
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
    textAlignVertical: "top",
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
