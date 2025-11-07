import { showToast } from "@/constants/showToast";
import { Checklist } from "@/services/checklist/checklist";
import { ChecklistService } from "@/services/checklist/checklist.service";
import { Note } from "@/services/notes/note";
import { NoteService } from "@/services/notes/note.service";
import { Project } from "@/services/project/project";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotesChecklistsModalProps {
  project?: Project;
  userCode?: number;
  visible: boolean;
  onClose: () => void;
  onAddToBoard?: (data: Note | Checklist) => void;
}

const NotesChecklistsProjectModal = (props: NotesChecklistsModalProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [projectNotes, setProjectNotes] = useState<Note[]>([]);
  const [projectChecklists, setProjectChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (props.visible && props.userCode) {
      setLoading(true);
      findAllData().catch((error: any) =>
        showToast("error", error.formattedMessage)
      );
    }
  }, [props.visible]);

  const findAllData = async () => {
    if (props.project?.code && props.userCode) {
      const allNotes = await NoteService.findAllNotes();
      const allChecklists = await ChecklistService.findAllChecklists();

      setNotes(allNotes || []);
      setChecklists(allChecklists || []);

      const projNotes = await NoteService.findAllByProjectCode(props.project.code);
      const projChecklists = await ChecklistService.findAllByProjectCode(
        props.project.code
      );

      setProjectNotes(projNotes || []);
      setProjectChecklists(projChecklists || []);
      setLoading(false);
    }
  };

  const renderNote = (note: Note) => (
    <TouchableOpacity
      key={note.code}
      style={styles.noteCard}
      onPress={() => props.onAddToBoard?.(note)}
    >
      <Text style={styles.noteTitle}>{note.title || "Sem título"}</Text>
      <Text style={styles.noteDescription} numberOfLines={3}>
        {note.description || "Sem conteúdo"}
      </Text>
    </TouchableOpacity>
  );

  const renderChecklist = (checklist: Checklist) => (
    <TouchableOpacity
      key={checklist.code}
      style={styles.checklistCard}
      onPress={() => props.onAddToBoard?.(checklist)}
    >
      <Text style={styles.checklistTitle}>{checklist.title}</Text>
      <Text style={styles.checklistInfo}>
        {checklist.itens.filter((i) => i.checked).length}/{checklist.itens.length} concluídos
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={props.onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Anotações e Checklists</Text>
          <TouchableOpacity onPress={props.onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Seção do Projeto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Do projeto</Text>

            {projectNotes.length === 0 && projectChecklists.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum item associado a este projeto.</Text>
            ) : (
              <>
                {projectNotes.map(renderNote)}
                {projectChecklists.map(renderChecklist)}
              </>
            )}
          </View>

          {/* Todas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Todas</Text>

            {notes.length === 0 && checklists.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum item encontrado.</Text>
            ) : (
              <>
                {notes.map(renderNote)}
                {checklists.map(renderChecklist)}
              </>
            )}
          </View>
        </ScrollView>
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
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#362946",
    marginBottom: 10,
  },
  noteCard: {
    backgroundColor: "#f6f6f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ececec",
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2b2b2b",
  },
  noteDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  checklistCard: {
    backgroundColor: "#f0f7ff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d8e9ff",
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#245fa6",
  },
  checklistInfo: {
    fontSize: 13,
    color: "#4a4a4a",
    marginTop: 4,
  },
  emptyText: {
    color: "#777",
    fontStyle: "italic",
    fontSize: 14,
    marginTop: 6,
  },
});

export default NotesChecklistsProjectModal;
