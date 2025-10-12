// src/components/image-modal.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface ImageCreateDto {
  uri: string;
  filename?: string;
  mimeType?: string;
  isCover?: boolean;
}

interface ImageModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ImageCreateDto[]) => void;
}

const ImageModal = ({ visible, onClose, onSave }: ImageModalProps) => {
  const [selectedImages, setSelectedImages] = useState<ImageCreateDto[]>([]);
  const [isCoverIndex, setIsCoverIndex] = useState<number | null>(null);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à sua galeria para selecionar imagens.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = result.assets.map((asset, index) => ({
        uri: asset.uri,
        filename: asset.fileName || `image_${Date.now()}_${index}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
        isCover: isCoverIndex === null && index === 0 ? true : false,
      }));

      setSelectedImages((prev) => [...prev, ...newImages]);
      if (isCoverIndex === null && newImages.length > 0) {
        setIsCoverIndex(selectedImages.length);
      }
    } else {
      console.log("[ImageModal] Seleção de imagens cancelada ou sem resultados");
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    if (isCoverIndex === index) {
      setIsCoverIndex(null);
    } else if (isCoverIndex !== null && index < isCoverIndex) {
      setIsCoverIndex((prev) => (prev !== null ? prev - 1 : null));
    }
  };

  const toggleCover = (index: number) => {
    setIsCoverIndex(index);
    setSelectedImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isCover: i === index,
      }))
    );
  };

  const handleSave = () => {
    if (selectedImages.length > 0) {
      onSave(selectedImages);
      setSelectedImages([]);
      setIsCoverIndex(null);
    } else {
      console.log("[ImageModal] Nenhuma imagem para salvar");
    }
  };

  const handleClose = () => {
    setSelectedImages([]);
    setIsCoverIndex(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Adicionar Imagens ({selectedImages.length})
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {selectedImages.length > 0 ? (
            <View style={styles.imagesPreview}>
              <ScrollView style={styles.imagesList}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imageItem}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.imageInfo}>
                      <Text style={styles.filename} numberOfLines={1}>
                        {image.filename || `Imagem ${index + 1}`}
                      </Text>
                      <TouchableOpacity onPress={() => toggleCover(index)}>
                        <Text style={styles.coverText}>
                          {image.isCover ? "Capa" : "Definir como capa"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={pickImages}
              >
                <Text style={styles.addMoreText}>Adicionar Mais Imagens</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.pickImageButton} onPress={pickImages}>
              <Ionicons name="images" size={48} color="#ccc" />
              <Text style={styles.pickImageText}>Selecionar da Galeria</Text>
              <Text style={styles.pickImageSubtext}>Múltiplas imagens permitidas</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              selectedImages.length === 0 && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={selectedImages.length === 0}
          >
            <Text style={styles.saveButtonText}>
              Adicionar {selectedImages.length > 0 ? `${selectedImages.length} Imagens` : "Imagem"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  pickImageButton: {
    alignItems: "center",
    padding: 40,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  pickImageText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  pickImageSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  imagesPreview: {
    flex: 1,
  },
  imagesList: {
    flex: 1,
  },
  imageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  imageInfo: {
    flex: 1,
  },
  filename: {
    fontSize: 14,
    color: "#333",
  },
  coverText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 4,
  },
  removeButton: {
    padding: 4,
  },
  addMoreButton: {
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  addMoreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ImageModal;