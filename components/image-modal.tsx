import { ImageCreateDto } from '@/services/image/image.create.dto';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ImageModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ImageCreateDto[]) => void;
  projectCode: number | undefined;
}

const ImageModal = (props: ImageModalProps) => {
  const [selectedImages, setSelectedImages] = useState<ImageCreateDto[]>([]);
  const [isCoverIndex, setIsCoverIndex] = useState<number | null>(null);

  //Seletor de imagens
  const pickImages = async () => {
    //Limite de 3 imagens
    if (selectedImages.length >= 3) {
      Alert.alert('Limite atingido', 'Você pode selecionar no máximo 3 imagens.', [{ text: 'OK' }]);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para selecionar imagens.',
      );
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
      const remainingSlots = 3 - selectedImages.length;
      const assetsToAdd = result.assets.slice(0, remainingSlots);

      if (result.assets.length > remainingSlots) {
        Alert.alert(
          'Limite excedido',
          `Você tentou selecionar ${result.assets.length} imagens, mas só pode adicionar mais ${remainingSlots}.`,
          [{ text: 'OK' }],
        );
      }

      const newImages = assetsToAdd.map((asset, index) => ({
        uri: asset.uri,
        filename: asset.fileName || `image_${Date.now()}_${index}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
        isCover: isCoverIndex === null && selectedImages.length === 0 && index === 0 ? true : false,
      }));

      setSelectedImages((prev) => [...prev, ...newImages]);
      if (isCoverIndex === null && newImages.length > 0) {
        setIsCoverIndex(selectedImages.length);
      }
    }
  };

  //Remove a lista
  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    if (isCoverIndex === index) {
      setIsCoverIndex(null);
    } else if (isCoverIndex !== null && index < isCoverIndex) {
      setIsCoverIndex((prev) => (prev !== null ? prev - 1 : null));
    }
  };

  //Define como cover
  const toggleCover = (index: number) => {
    setIsCoverIndex(index);
    setSelectedImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isCover: i === index,
      })),
    );
  };

  //Salvar
  const handleSave = async () => {
    if (props.projectCode) {
      if (selectedImages.length > 0) {
        await props.onSave([...selectedImages]);
        setTimeout(() => {
          setSelectedImages([]);
          setIsCoverIndex(null);
        }, 300);
      }
    }
  };

  //Fechar
  const handleClose = () => {
    setSelectedImages([]);
    setIsCoverIndex(null);
    props.onClose();
  };

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="image" size={24} color="#70a1d6ff" />
          <Text style={styles.title}>Nova imagem ({selectedImages.length}/3)</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ScrollView style={styles.scrollView}>
            {/* Componente "Selecionar da Galeria" sempre visível */}
            <View style={styles.imageSection}>
              <TouchableOpacity
                style={[
                  styles.imagePickerButton,
                  selectedImages.length >= 3 && styles.imagePickerButtonDisabled,
                ]}
                onPress={pickImages}
                disabled={selectedImages.length >= 3}
              >
                <Ionicons
                  name="cloud-upload"
                  size={32}
                  color={selectedImages.length >= 3 ? '#cccccc' : '#70A0D6'}
                />
                <Text
                  style={[
                    styles.imagePickerText,
                    selectedImages.length >= 3 && styles.imagePickerTextDisabled,
                  ]}
                >
                  Selecionar da Galeria
                </Text>
                <Text
                  style={[
                    styles.imagePickerSubtext,
                    selectedImages.length >= 3 && styles.imagePickerTextDisabled,
                  ]}
                >
                  {/* CORREÇÃO: Mensagem informativa sobre o limite */}
                  {selectedImages.length >= 3
                    ? 'Limite de 3 imagens atingido'
                    : 'Toque para escolher uma ou várias imagens'}
                </Text>
                {/* CORREÇÃO: Indicador de limite */}
                {selectedImages.length > 0 && (
                  <Text style={styles.limitText}>
                    {selectedImages.length} de 3 imagens selecionadas
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Lista de imagens selecionadas */}
            {selectedImages.length > 0 && (
              <View style={styles.imagesPreview}>
                <Text style={styles.imagesTitle}>Imagens Selecionadas:</Text>
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
                          {image.isCover ? 'Capa' : 'Definir como capa'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close" size={16} color="#ff3b30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Botão de salvar */}
          <TouchableOpacity
            style={[styles.saveButton, selectedImages.length === 0 && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={selectedImages.length === 0}
          >
            <Text style={styles.saveButtonText}>
              Adicionar {selectedImages.length > 0 ? `${selectedImages.length} Imagens` : 'Imagem'}
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  pickImageButton: {
    alignItems: 'center',
    padding: 40,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
  },
  pickImageText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  pickImageSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  imagesPreview: {
    marginBottom: 20,
  },
  imagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
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
    color: '#333',
  },
  coverText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  removeButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#70a1d6ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageSection: {
    gap: 16,
  },
  imagePickerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 12,
    backgroundColor: '#f5f9ff',
    borderWidth: 2,
    borderColor: '#4870c0ff',
    borderStyle: 'dashed',
  },
  // CORREÇÃO: Estilos para botão desabilitado
  imagePickerButtonDisabled: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  // CORREÇÃO: Estilo para texto desabilitado
  imagePickerTextDisabled: {
    color: '#999999',
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  limitText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default ImageModal;
