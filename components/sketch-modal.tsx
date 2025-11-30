import { showToast } from '@/constants/showToast';
import { ChecklistItem } from '@/services/checklist/checklist-item';
import { ChecklistDto } from '@/services/checklist/checklist.dto';
import { NoteCreateDto } from '@/services/notes/note.create.dto';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SketchModalProps {
  projectCode: number | undefined;
  visible: boolean;
  onClose: () => void;
  onSaveNote?: (data: NoteCreateDto) => void;
  onSaveChecklist?: (data: ChecklistDto) => void;
}

//Verificar se preciso abstrari esse bgl
type NoteType = 'text' | 'checklist';

const SketchModal = (props: SketchModalProps) => {
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [noteType, setNoteType] = useState<NoteType>('text');
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const lastItemRef = useRef<TextInput | null>(null);

  //Save da checklist
  const handleSaveNote = () => {
    if (props.projectCode && description.trim() && props.onSaveNote) {
      const note = new NoteCreateDto();
      note.title = title.trim();
      note.description = description.trim();
      note.projectCode = props.projectCode;

      props.onSaveNote(note);
      handleClose();
    }
  };

  //Save do checklist
  const handleSaveChecklist = () => {
    if (props.projectCode && checklistItems.length > 0 && props.onSaveChecklist) {
      const checklistDto: ChecklistDto = {
        projectCode: props.projectCode,
        title: title.trim() || 'Checklist',
        itens: checklistItems.map((item, index) => ({
          text: item.text.trim(),
          checked: item.checked,
          sort: index,
        })),
      };

      props.onSaveChecklist(checklistDto);
      handleClose();
    }
  };

  //Funçãodecide qual save usar
  const handleSave = () => {
    if (noteType === 'checklist' && props.onSaveChecklist) {
      handleSaveChecklist();
    } else if (noteType === 'text' && props.onSaveNote) {
      handleSaveNote();
    }
  };

  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    if (checklistItems.length >= 15) {
      showToast('info', 'Limite de 20 itens atingido.');
      return;
    }

    setChecklistItems((prev) => {
      const updated = [...prev, { text: newItemText.trim(), checked: false, sort: prev.length }];
      setNewItemText('');

      setTimeout(() => {
        lastItemRef.current?.focus();
      }, 50);

      return updated;
    });
  };

  //Altera dado no checklist
  const updateChecklistItem = (index: number, text: string) => {
    //Mapeia pelo indice, substitui o text
    setChecklistItems((prev) => prev.map((item, i) => (i === index ? { ...item, text } : item)));
  };

  //Remove item do checklist
  const removeChecklistItem = (index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  };

  //Marca como concluído
  const toggleChecklistItem = (index: number) => {
    setChecklistItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item)),
    );
  };

  //Ordenação do checklist
  const moveItem = (fromIndex: number, toIndex: number) => {
    const items = [...checklistItems];
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);
    setChecklistItems(items);
  };

  //Alterna entre os tipos de sketch
  const handleNoteTypeChange = (type: NoteType) => {
    if (type === noteType) return;

    if (type === 'checklist' && noteType === 'text') {
      //Converte texto para checklist items
      if (description.trim()) {
        const items = description
          .split('\n')
          .filter((line) => line.trim())
          .map((line, index) => ({
            text: line.trim(),
            checked: false,
            sort: index,
          }));
        setChecklistItems(items);
        setDescription('');
      }
    } else if (type === 'text' && noteType === 'checklist') {
      //Converte checklist items para texto
      const text = checklistItems.map((item) => item.text).join('\n');
      setDescription(text);
      setChecklistItems([]);
    }

    setNoteType(type);
  };

  //Reseta campos e fecha
  const handleClose = () => {
    setTitle('');
    setDescription('');
    setNoteType('text');
    setChecklistItems([]);
    setNewItemText('');
    props.onClose();
  };

  //Verifica o texto de acordo com o type.
  const getPlaceholder = () => {
    return noteType === 'checklist'
      ? 'Digite um novo item...'
      : 'Digite seu rascunho, nota ou ideia...';
  };

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Ionicons name="list" size={24} color="#FF9500" />
          <Text style={styles.title}>Nova anotação</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/*Input do Título*/}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.textInput, styles.titleInput]}
              value={title}
              onChangeText={setTitle}
              placeholder="Título do rascunho..."
              placeholderTextColor="#999"
              maxLength={100}
            />
          </View>

          {/*Seletor de Tipo*/}
          <View style={styles.typeSelectorContainer}>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeOption, noteType === 'text' && styles.typeOptionActive]}
                onPress={() => handleNoteTypeChange('text')}
              >
                <Ionicons
                  name="document-text"
                  size={20}
                  color={noteType === 'text' ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    noteType === 'text' && styles.typeOptionTextActive,
                  ]}
                >
                  Texto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeOption, noteType === 'checklist' && styles.typeOptionActive]}
                onPress={() => handleNoteTypeChange('checklist')}
              >
                <Ionicons
                  name="list"
                  size={20}
                  color={noteType === 'checklist' ? '#fff' : '#666'}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    noteType === 'checklist' && styles.typeOptionTextActive,
                  ]}
                >
                  Checklist
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/*Conteúdo baseado no tipo*/}
          {noteType === 'text' ? (
            //Área de Texto Principal
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Conteúdo</Text>
              <TextInput
                style={[styles.textInput, styles.descriptionInput]}
                value={description}
                maxLength={1000}
                onChangeText={setDescription}
                placeholder={getPlaceholder()}
                placeholderTextColor="#999"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>
          ) : (
            //Área de Checklist
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Itens da Checklist</Text>

              {/*Lista de Itens*/}
              <View style={styles.checklistContainer}>
                <ScrollView>
                  {checklistItems.map((item, index) => (
                    <View key={index} style={styles.checklistItem}>
                      <TouchableOpacity
                        style={[styles.checkbox, item.checked && styles.checkboxChecked]}
                        onPress={() => toggleChecklistItem(index)}
                      >
                        {item.checked && <Ionicons name="checkmark" size={12} color="#fff" />}
                      </TouchableOpacity>

                      <TextInput
                        ref={index === checklistItems.length - 1 ? lastItemRef : null}
                        style={[
                          styles.checklistInput,
                          item.checked && styles.checklistInputChecked,
                        ]}
                        value={item.text}
                        maxLength={30}
                        onChangeText={(text) => updateChecklistItem(index, text)}
                        placeholder="Digite o item..."
                        placeholderTextColor="#999"
                      />

                      {/*Botões de ordenação*/}
                      <View style={styles.itemActions}>
                        {index > 0 && (
                          <TouchableOpacity
                            style={styles.moveButton}
                            onPress={() => moveItem(index, index - 1)}
                          >
                            <Ionicons name="chevron-up" size={16} color="#666" />
                          </TouchableOpacity>
                        )}

                        {index < checklistItems.length - 1 && (
                          <TouchableOpacity
                            style={styles.moveButton}
                            onPress={() => moveItem(index, index + 1)}
                          >
                            <Ionicons name="chevron-down" size={16} color="#666" />
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={styles.removeItemButton}
                          onPress={() => removeChecklistItem(index)}
                        >
                          <Ionicons name="close" size={16} color="#ff3b30" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {/*Input para novo item*/}
                <View style={styles.newItemContainer}>
                  <TextInput
                    style={styles.newItemInput}
                    value={newItemText}
                    onChangeText={setNewItemText}
                    placeholder={getPlaceholder()}
                    placeholderTextColor="#999"
                    maxLength={30}
                    onSubmitEditing={addChecklistItem}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      (!newItemText.trim() || checklistItems.length >= 15) &&
                        styles.addButtonDisabled,
                    ]}
                    onPress={addChecklistItem}
                    disabled={!newItemText.trim() || checklistItems.length >= 15}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={newItemText.trim() && checklistItems.length < 15 ? '#fff' : '#ccc'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              ((noteType === 'text' && !description.trim()) ||
                (noteType === 'checklist' && checklistItems.length === 0)) &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={
              (noteType === 'text' && !description.trim()) ||
              (noteType === 'checklist' && checklistItems.length === 0)
            }
          >
            <Text style={styles.saveButtonText}>
              {noteType === 'checklist' ? 'Adicionar Checklist' : 'Adicionar Rascunho'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeSelectorContainer: {
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    gap: 8,
  },
  typeOptionActive: {
    backgroundColor: '#FF9500',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeOptionTextActive: {
    color: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  titleInput: {
    height: 50,
  },
  descriptionInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  checklistContainer: {
    maxHeight: 425,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  checklistInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  checklistInputChecked: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moveButton: {
    padding: 4,
  },
  removeItemButton: {
    padding: 4,
  },
  newItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#FF9500',
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
});

export default SketchModal;
