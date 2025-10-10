// src/screens/ProjectScreen.js
import AddButton from '@/components/add-button';
import DraggableItem from '@/components/drag-item';
import ImageModal from '@/components/image-modal';
import LinkModal from '@/components/linking-modal';
import ComponentSelectorModal from '@/components/selector-modal';
import SketchModal from '@/components/sketch-modal';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Definindo os tipos TypeScript
interface BaseItem {
  id: string;
  type: 'link' | 'image' | 'sketch';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LinkItem extends BaseItem {
  type: 'link';
  title: string;
  url: string;
}

interface ImageItem extends BaseItem {
  type: 'image';
  uri: string;
}

interface SketchItem extends BaseItem {
  type: 'sketch';
  text: string;
}

type ProjectItem = LinkItem | ImageItem | SketchItem;

interface LinkData {
  title: string;
  url: string;
}

interface ImageData {
  uri: string;
}

interface SketchData {
  text: string;
}

const ProjectScreen = () => {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSketchModal, setShowSketchModal] = useState(false);

  const handleAddComponent = (componentType: 'link' | 'image' | 'sketch') => {
    setShowComponentSelector(false);
    
    switch (componentType) {
      case 'link':
        setShowLinkModal(true);
        break;
      case 'image':
        setShowImageModal(true);
        break;
      case 'sketch':
        setShowSketchModal(true);
        break;
    }
  };

  const handleAddLink = (linkData: LinkData) => {
    const newItem: LinkItem = {
      id: Date.now().toString(),
      type: 'link',
      title: linkData.title,
      url: linkData.url,
      x: 50,
      y: 50,
      width: 200,
      height: 60,
    };
    setItems([...items, newItem]);
    setShowLinkModal(false);
  };

  const handleAddImage = (imageData: ImageData) => {
    const newItem: ImageItem = {
      id: Date.now().toString(),
      type: 'image',
      uri: imageData.uri,
      x: 50,
      y: 50,
      width: 200,
      height: 150,
    };
    setItems([...items, newItem]);
    setShowImageModal(false);
  };

  const handleAddSketch = (sketchData: SketchData) => {
    const newItem: SketchItem = {
      id: Date.now().toString(),
      type: 'sketch',
      text: sketchData.text,
      x: 50,
      y: 50,
      width: 250,
      height: 120,
    };
    setItems([...items, newItem]);
    setShowSketchModal(false);
  };

  const updateItemPosition = (id: string, x: number, y: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, x, y } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meu Projeto</Text>
      </View>

      <ScrollView 
        style={styles.canvas}
        contentContainerStyle={styles.canvasContent}
      >
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            onPositionChange={updateItemPosition}
            onDelete={deleteItem}
          />
        ))}
      </ScrollView>

      <AddButton onPress={() => setShowComponentSelector(true)} />

      {/* Modais */}
      <ComponentSelectorModal
        visible={showComponentSelector}
        onClose={() => setShowComponentSelector(false)}
        onSelectComponent={handleAddComponent}
      />

      <LinkModal
        visible={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSave={handleAddLink}
      />

      <ImageModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSave={handleAddImage}
      />

      <SketchModal
        visible={showSketchModal}
        onClose={() => setShowSketchModal(false)}
        onSave={handleAddSketch}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  canvas: {
    flex: 1,
  },
  canvasContent: {
    minHeight: '100%',
  },
});

export default ProjectScreen;
