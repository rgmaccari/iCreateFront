// src/components/image-modal.tsx (ou onde estiver seu ImageModal)
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Interface corrigida - deve ser um objeto, não um array
export interface ImageCreateDto {
  uri: string;
}

interface ImageModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ImageCreateDto) => void; // Mudado para objeto único, não array
}

const ImageModal = ({ visible, onClose, onSave }: ImageModalProps) => {
  const [selectedImage, setSelectedImage] = useState<ImageCreateDto | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar imagens.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage({ uri: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    if (selectedImage) {
      onSave(selectedImage); // Agora passa um objeto único
      setSelectedImage(null);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
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
          <Text style={styles.title}>Adicionar Imagem</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {selectedImage ? (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.image}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
              >
                <Text style={styles.changeImageText}>Trocar Imagem</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
              <Ionicons name="image" size={48} color="#ccc" />
              <Text style={styles.pickImageText}>Selecionar da Galeria</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              !selectedImage && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!selectedImage}
          >
            <Text style={styles.saveButtonText}>Adicionar Imagem</Text>
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
    justifyContent: 'center',
  },
  pickImageButton: {
    alignItems: 'center',
    padding: 40,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  pickImageText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  imagePreview: {
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  changeImageButton: {
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ImageModal;
