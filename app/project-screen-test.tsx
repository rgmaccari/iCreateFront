// src/screens/ProjectScreen.js
import DraggableItem from '@/components/drag-item';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet
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

const ProjectScreenTest = () => {
  const [items, setItems] = useState<ProjectItem[]>([]);

  // const handleAddLink = (linkData: LinkData) => {
  //   const newItem: LinkItem = {
  //     id: Date.now().toString(),
  //     type: 'link',
  //     title: linkData.title,
  //     url: linkData.url,
  //     x: 50,
  //     y: 50,
  //     width: 200,
  //     height: 60,
  //   };
  //   setItems([...items, newItem]);
  //   setShowLinkModal(false);
  // };

  // const handleAddImage = (imageData: ImageData) => {
  //   const newItem: ImageItem = {
  //     id: Date.now().toString(),
  //     type: 'image',
  //     uri: imageData.uri,
  //     x: 50,
  //     y: 50,
  //     width: 200,
  //     height: 150,
  //   };
  //   setItems([...items, newItem]);
  //   setShowImageModal(false);
  // };

  // const handleAddSketch = (sketchData: SketchData) => {
  //   const newItem: SketchItem = {
  //     id: Date.now().toString(),
  //     type: 'sketch',
  //     text: sketchData.text,
  //     x: 50,
  //     y: 50,
  //     width: 250,
  //     height: 120,
  //   };
  //   setItems([...items, newItem]);
  //   setShowSketchModal(false);
  // };

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


    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#828991ff',
  },
  canvas: {
    flex: 1,
  },
  canvasContent: {
    minHeight: '100%',
  },
});

export default ProjectScreenTest;
