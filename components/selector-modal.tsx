// src/components/ComponentSelectorModal.js
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ComponentSelectorModal = ({ visible, onClose, onSelectComponent }: any) => {
  const components = [
    {
      type: 'link',
      title: 'Link',
      description: 'Adicionar um link da web',
      icon: 'link' as const, //Para o fontawesome reconhecer
      color: '#007AFF',
    },
    {
      type: 'image',
      title: 'Imagem',
      description: 'Adicionar uma imagem da galeria',
      icon: 'image' as const, //Para o fontawesome reconhecer
      color: '#34C759',
    },
    {
      type: 'sketch',
      title: 'Rascunho',
      description: 'Adicionar uma nota ou rascunho',
      icon: 'document-text' as const, //Para o fontawesome reconhecer
      color: '#FF9500',
    },
  ];

  //Calcula a altura dinâmica baseada no número de componentes -> ver depois...
  const modalHeight = 100 + (components.length * 90);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { height: modalHeight }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Adicionar Componente</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {components.map((component) => (
              <TouchableOpacity
                key={component.type}
                style={styles.componentItem}
                onPress={() => onSelectComponent(component.type)}
              >
                <View style={[styles.iconContainer, { backgroundColor: component.color }]}>
                  <Ionicons name={component.icon} size={24} color="#fff" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.componentTitle}>{component.title}</Text>
                  <Text style={styles.componentDescription}>
                    {component.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
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
    padding: 20,
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  componentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  componentDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default ComponentSelectorModal;