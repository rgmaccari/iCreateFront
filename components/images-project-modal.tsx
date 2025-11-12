import ImageViewerPanel from "@/components/image-viewer-panel";
import { showToast } from "@/constants/showToast";
import { Image } from "@/services/image/image";
import { ImageService } from "@/services/image/image.service";
import { Project } from "@/services/project/project";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ImagesProjectModalProps {
  project?: Project;
  userCode?: number;
  visible: boolean;
  onClose: () => void;
  onAddToBoard?: (image: Image) => void;
}

const ImagesProjectModal = (props: ImagesProjectModalProps) => {
  const [images, setImages] = useState<Image[]>([]);
  const [projectImages, setProjectImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (props.visible && props.userCode) {
      setLoading(true);
      findAllImages().catch((error: any) =>
        showToast("error", error.formattedMessage)
      );
    }
  }, [props.visible]);

  const findAllImages = async () => {
    //Se não tm projeto definido, carrega apenas todas as imagens
    if (!props.project?.code && props.userCode) {
      const allImages = await ImageService.findAllImages();
      setImages(allImages || []);
      setProjectImages([]);
    }
    //Se tem projeto definido, carrega imagens do projeto e todas as imagens
    else if (props.project?.code && props.userCode) {
      const allImages = await ImageService.findAllImages();
      setImages(allImages || []);

      const projectImages = await ImageService.findAllByProjectCode(
        props.project.code
      );
      setProjectImages(projectImages || []);
    }
    setLoading(false);
  };

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={props.onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="image" size={24} color="#70a1d6ff" />
          <Text style={styles.title}>Imagens</Text>
          <TouchableOpacity onPress={props.onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Seção de Imagens do Projeto - APENAS se houver projeto */}
        {props.project?.code && (
          <View style={styles.fixedSection}>
            <Text style={styles.sectionTitle}>Do projeto</Text>
            {projectImages.length > 0 ? (
              <View style={styles.carouselWrapper}>
                <ImageViewerPanel
                  images={projectImages}
                  viewMode="carousel"
                  onDelete={() => console.log("aopa")}
                  onAddToBoard={props.onAddToBoard}
                />
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Nenhuma imagem associada a este projeto.
              </Text>
            )}
          </View>
        )}

        {/* Seção de Todas as Imagens */}
        <View style={styles.scrollSection}>
          <Text style={styles.sectionTitle}>
            {props.project?.code ? "Todas as imagens" : "Minhas imagens"}
          </Text>
          {images.length > 0 ? (
            <ImageViewerPanel
              images={images}
              viewMode="grid"
              onDelete={() => console.log("aopa")}
              onAddToBoard={props.onAddToBoard}
            />
          ) : (
            <Text style={styles.emptyText}>
              {props.project?.code
                ? "Nenhuma imagem encontrada."
                : "Nenhuma imagem encontrada."
              }
            </Text>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  fixedSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fafafa",
  },
  carouselWrapper: {
    width: "100%",
    alignItems: "center",
  },
  scrollSection: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#362946",
    marginBottom: 16,
  },
  emptyText: {
    color: "#777",
    fontStyle: "italic",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

export default ImagesProjectModal;