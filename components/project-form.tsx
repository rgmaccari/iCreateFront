import { Checklist } from "@/services/checklist/checklist";
import { Image } from "@/services/image/image";
import { Link } from "@/services/link/link";
import { Note } from "@/services/notes/note";
import { Project } from "@/services/project/project";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Image as RNImage,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CombinedItem = (Image | Link | Note) & {
  __type: "image" | "link" | "note";
};

interface ProjectFormProps {
  project?: Project;
  onChange: (data: Partial<Project>) => void;
  images: Image[];
  links: Link[];
  notes: Note[];
  checklists: Checklist[];
}

export default function ProjectForm(props: ProjectFormProps) {
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
  const renderItemModal = () => {
    if (!selectedItem) return null;

    if ("url" in selectedItem && "filename" in selectedItem) {
      //Imagens
      return (
        <View style={styles.modalContent}>
          <RNImage
            source={{ uri: selectedItem.url }}
            style={styles.fullImage}
            resizeMode="contain"
          />
          <Text style={styles.modalText}>
            {selectedItem.filename || "Imagem sem nome"}
          </Text>
          {selectedItem.isCover && <Text style={styles.coverBadge}>Capa</Text>}
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      );
    } else if ("url" in selectedItem && "title" in selectedItem) {
      //Links
      return (
        <View style={styles.modalContent}>
          {selectedItem.previewImageUrl && (
            <RNImage
              source={{ uri: selectedItem.previewImageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.modalTitle}>
            {selectedItem.title || "Sem título"}
          </Text>
          <Text style={styles.modalText}>{selectedItem.url}</Text>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      //Notas
      return (
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {(selectedItem as Note).title || "Sem título"}
          </Text>
          <Text style={styles.modalText}>
            {(selectedItem as Note).description || "Sem descrição"}
          </Text>
          {(selectedItem as Note).sort && (
            <Text style={styles.modalText}>
              Ordem: {(selectedItem as Note).sort}
            </Text>
          )}
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
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
              : "sticky-note";
          const isActive = activeFilters.includes(type);
          return (
            <TouchableOpacity
              key={type}
              onPress={() => toggleFilter(type)}
              style={[
                styles.filterButton,
                isActive && styles.filterButtonActive,
              ]}
            >
              <FontAwesome
                name={iconName}
                size={20}
                color={isActive ? "#fff" : "#362946"}
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
        transparent={false}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalFullScreen}>
          {renderItemModal()}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#362946",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
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
    borderWidth: 0.5,
    //borderColor: "#362946",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
    //backgroundColor: "#fff",
  },
  filterButtonActive: {
    backgroundColor: "#362946",
  },
  gridContainer: {
    justifyContent: "space-between",
  },
  gridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 1,
    position: "relative",
    backgroundColor: "#eee",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd",
  },
  iconFooter: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 6,
    padding: 2,
  },
  modalFullScreen: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    color: "#362946",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: "#362946",
    marginBottom: 8,
    textAlign: "center",
  },
  coverBadge: {
    fontSize: 14,
    color: "green",
    fontWeight: "bold",
    marginBottom: 8,
  },
  fullImage: {
    width: "100%",
    height: "70%",
    borderRadius: 8,
    marginBottom: 16,
  },
  modalCloseButton: {
    backgroundColor: "#362946",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
