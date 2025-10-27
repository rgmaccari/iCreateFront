import DraggableItem from '@/components/drag-item';
import DropZone from '@/components/drop-zone';
import { Checklist } from '@/services/checklist/checklist';
import { Image } from '@/services/image/image';
import { ImageItem } from '@/services/item/image-item';
import { LinkItem } from '@/services/item/link-item';
import { NoteItem } from '@/services/item/note-item';
import { Link } from '@/services/link/link';
import { Note } from '@/services/notes/note';
import { Project } from '@/services/project/project';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type ProjectItem = LinkItem | ImageItem | NoteItem;

interface ProjectBoardProps {
  project?: Project;
  onChange?: (data: Partial<Project>) => void;
  onAddLink?: (linkData: Link) => void;
  onAddImage?: (imageData: ImageData) => void;
  onAddNote?: (noteData: Note) => void;
  images: Image[];
  links: Link[];
  notes: Note[];
  checklists: Checklist[];
  onDelete: () => void;
}

const ProjectBoard = (props: ProjectBoardProps) => {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [lastLinks, setLastLinks] = useState<Link[]>([]);
  const [lastImages, setLastImages] = useState<Image[]>([]);
  const [lastNotes, setLastNotes] = useState<Note[]>([]);

  const [draggingItem, setDraggingItem] = useState<ProjectItem | null>(null); //Verifica o item arrastado


  //Notes UseEffect que valida a existência de um novo item, caso detecado, insere na lista...
  useEffect(() => {
    if (lastNotes.length === 0) {
      setLastNotes(props.notes);
      return;
    }

    const newNotes = props.notes.filter(note => !lastNotes.some(oldNote => oldNote.code === note.code));

    //handleAddNote para cada nova note
    newNotes.forEach(note => {
      if (note.code) {
        handleAddNote(note);
      }
    });

    setLastNotes(props.notes); //Atualiza o estado da lista
  }, [props.notes]);

  useEffect(() => {
    if (lastLinks.length === 0) {
      setLastLinks(props.links);
      return;
    }

    const newLinks = props.links.filter(link => !lastLinks.some(oldLink => oldLink.code === link.code));

    //handleAddNote para cada nova note
    newLinks.forEach(link => {
      if (link.code) {
        handleAddLink(link);
      }
    });

    setLastLinks(props.links); //Atualiza o estado da lista
  }, [props.links]);

  useEffect(() => {
    if (lastImages.length === 0) {
      setLastImages(props.images);
      return;
    }

    const newImages = props.images.filter(image => !lastImages.some(oldImage => oldImage.code === image.code));

    //handleAddNote para cada nova note
    newImages.forEach(image => {
      if (image.code) {
        handleAddImage(image);
      }
    });

    setLastImages(props.images); //Atualiza o estado da lista
  }, [props.images]);

  //Transforma um novo objeto Note em um Item
  const handleAddNote = (noteData: Note) => {
    if (!noteData.code) {
      console.warn('Tentativa de adicionar note sem code:', noteData);
      return;
    }

    const newItem: NoteItem = {
      code: noteData.code,
      title: noteData.title,
      description: noteData.description!,
      type: 'sketch',
      x: 50,
      y: 50,
      width: 250,
      height: 120,
    };
    setItems(prev => [...prev, newItem]);
  };

  //Transofrma um novo
  const handleAddLink = (linkData: Link) => {
    const newItem: LinkItem = {
      code: linkData.code!,
      url: linkData.url!,
      title: linkData.title!,
      type: 'link',
      x: 50,
      y: 50,
      width: 200,
      height: 60,
    };
    setItems([...items, newItem]);
  };

  const handleAddImage = (imageData: Image) => {
    const newItem: ImageItem = {
      code: imageData.code,
      source: imageData.url,
      type: 'image',
      x: 50,
      y: 50,
      width: 200,
      height: 150,
    };
    setItems([...items, newItem]);
  };

  //Atualizar posição do item: através dos eixos e o code do item, realizo a alteração pelo gesto
  const updateItemPosition = (code: number, x: number, y: number) => {
    setItems(currentItems => currentItems.map(item => item.code === code ? { ...item, x, y } : item));
  };

  //Remove itens: através do code do item apenas, realizo o delet
  const deleteItem = (code: number) => {
    props.onDelete()
    setItems(currentItems => currentItems.filter(item => item.code !== code));

  };

  const handleArchiveItem = (code: number) => {
    console.log(`Arquivando item ${code} do tipo ${items.find(i => i.code === code)?.type}`);
    // Por enquanto só remove da view
    setItems(currentItems => currentItems.filter(item => item.code !== code));
  };

  const handleDeleteItem = (code: number) => {
    const item = items.find(i => i.code === code);
    console.log(`Excluindo permanentemente item ${code} do tipo ${item?.type}`);

    // Aqui você chamaria o service correspondente:
    // if (item?.type === 'sketch') await NoteService.delete(code);
    // if (item?.type === 'link') await LinkService.delete(code);
    // if (item?.type === 'image') await ImageService.delete(code);

    setItems(currentItems => currentItems.filter(i => i.code !== code));
  };

  const handleDragStart = (item: ProjectItem) => {
    setDraggingItem(item);
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  return (
    //GestureHandlerRootView é o bgl que faz os gestos
    <GestureHandlerRootView style={styles.container}>

      {/* DROP ZONES FIXAS NA TELA */}
      <View style={styles.dropZonesContainer}>
        <DropZone
          type="archive"
          onDrop={handleArchiveItem}
          isActive={!!draggingItem}
        />
        <DropZone
          type="trash"
          onDrop={handleDeleteItem}
          isActive={!!draggingItem}
        />
      </View>

      {/*Apenas a view geral*/}
      <ScrollView
        style={styles.canvas}
        contentContainerStyle={styles.canvasContent}
      >
        {items.map((item) => (
          //Cada item (img, link, note, checklist) é um Draggable
          <DraggableItem
            key={item.code} //Codigo do item
            item={item} //O item em si que pelo "baseItem" pode ter 4 tipos e o DraggableItemProps aceita esses 4 tipos
            onPositionChange={updateItemPosition} //Onde ele está na tela (x, y)
            onDelete={deleteItem} //Remoção
            onDragStart={() => handleDragStart(item)} // ← ADICIONE ESTA LINHA
            onDragEnd={handleDragEnd}
          />
        ))}
      </ScrollView>

    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#506b86ff',
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
  dropZonesContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
    gap: 10,
  },
});

export default ProjectBoard;