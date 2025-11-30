import { showToast } from "@/constants/showToast";
import { Checklist } from "@/services/checklist/checklist";
import { ChecklistDto } from "@/services/checklist/checklist.dto";
import { ChecklistService } from "@/services/checklist/checklist.service";
import { Note } from "@/services/notes/note";
import { NoteCreateDto } from "@/services/notes/note.create.dto";
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

  const [activeTab, setActiveTab] = useState<"notes" | "checklists">("notes");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewItem, setPreviewItem] = useState<Note | Checklist | null>(null);

  useEffect(() => {
    if (props.visible && props.userCode) {
      setLoading(true);
      findAllData().catch((error: any) =>
        showToast("error", error.formattedMessage)
      );
    }
  }, [props.visible]);

  const findAllData = async () => {
    // Se não há projeto definido, carrega apenas todos os dados
    if (!props.project?.code && props.userCode) {
      const allNotes = await NoteService.findAllNotes();
      const allChecklists = await ChecklistService.findAllChecklists();

      setNotes(allNotes || []);
      setChecklists(allChecklists || []);
      setProjectNotes([]);
      setProjectChecklists([]);
    }
    // Se há projeto definido, carrega dados do projeto e todos os dados
    else if (props.project?.code && props.userCode) {
      const allNotes = await NoteService.findAllNotes();
      const allChecklists = await ChecklistService.findAllChecklists();

      setNotes(allNotes || []);
      setChecklists(allChecklists || []);

      const projNotes = await NoteService.findAllByProjectCode(
        props.project.code
      );
      const projChecklists = await ChecklistService.findAllByProjectCode(
        props.project.code
      );

      setProjectNotes(projNotes || []);
      setProjectChecklists(projChecklists || []);
    }
    setLoading(false);
  };

  const isNote = (item: Note | Checklist): item is Note => {
    return (item as Note).description !== undefined;
  };

  const handlePreview = (item: Note | Checklist) => {
    setPreviewItem(item);
    setPreviewVisible(true);
  };

  const renderNote = (note: Note) => (
    <TouchableOpacity
      key={note.code}
      style={styles.itemCard}
      activeOpacity={0.85}
      onPress={() => handlePreview(note)}
      onLongPress={() => props.project && handleAddToBoard(note)}
    >
      <View style={styles.itemHeader}>
        <View style={styles.noteIcon}>
          <Ionicons name="document-text-outline" size={20} color="#FFB300" />
        </View>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {note.title || "Sem título"}
        </Text>
      </View>
      <Text style={styles.itemDescription} numberOfLines={3}>
        {note.description || "Sem conteúdo"}
      </Text>
      {note.createdAt && (
        <Text style={styles.itemDate}>
          {new Date(note.createdAt).toLocaleDateString("pt-BR")}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderChecklist = (checklist: Checklist) => {
    const completed = checklist.itens.filter((i) => i.checked).length;
    const total = checklist.itens.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return (
      <TouchableOpacity
        key={checklist.code}
        style={styles.itemCard}
        activeOpacity={0.85}
        onPress={() => handlePreview(checklist)}
        onLongPress={() => props.project && handleAddToBoard(checklist)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.checklistIcon}>
            <Ionicons name="checkbox-outline" size={20} color="#FFB300" />
          </View>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {checklist.title || "Sem título"}
          </Text>
        </View>
        <View style={styles.checklistProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completed}/{total} concluídos
          </Text>
        </View>
        {checklist.updatedAt && (
          <Text style={styles.itemDate}>
            {new Date(checklist.updatedAt).toLocaleDateString("pt-BR")}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const handleAddToBoard = async (item: Note | Checklist) => {
    if (item.projectCode !== props.project?.code && props.project?.code) {
      if ("description" in item) {
        const dto: NoteCreateDto = {
          title: (item.title || "Sem título").slice(0, 50),
          description: item.description || "",
          projectCode: props.project.code,
        };
        await NoteService.create(dto);
        const [newNote] = await NoteService.findAllByProjectCode(
          props.project.code
        );
        props.onAddToBoard?.(newNote);
      } else {
        const checklist = item as Checklist;
        const dto: ChecklistDto = {
          title: (checklist.title || "Sem título").slice(0, 50),
          itens: checklist.itens,
          projectCode: props.project.code,
        };
        await ChecklistService.create(dto);
        const [newChecklist] = await ChecklistService.findAllByProjectCode(
          props.project.code
        );
        props.onAddToBoard?.(newChecklist);
      }
    } else {
      props.onAddToBoard?.(item);
    }
  };

  const renderProjectSection = () => {
    if (!props.project?.code) return null;

    const hasProjectNotes = projectNotes.length > 0;
    const hasProjectChecklists = projectChecklists.length > 0;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deste projeto</Text>
        {activeTab === "notes" ? (
          hasProjectNotes ? (
            projectNotes.map(renderNote)
          ) : (
            <Text style={styles.emptyText}>
              Nenhuma anotação associada a este projeto.
            </Text>
          )
        ) : hasProjectChecklists ? (
          projectChecklists.map(renderChecklist)
        ) : (
          <Text style={styles.emptyText}>
            Nenhum checklist associado a este projeto.
          </Text>
        )}
      </View>
    );
  };

  const renderAllSection = () => {
    const hasNotes = notes.length > 0;
    const hasChecklists = checklists.length > 0;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {props.project?.code ? "Todos" : "Minhas anotações e checklists"}
        </Text>
        {activeTab === "notes" ? (
          hasNotes ? (
            notes.map(renderNote)
          ) : (
            <Text style={styles.emptyText}>Nenhuma anotação encontrada.</Text>
          )
        ) : hasChecklists ? (
          checklists.map(renderChecklist)
        ) : (
          <Text style={styles.emptyText}>Nenhum checklist encontrado.</Text>
        )}
      </View>
    );
  };

  return (
    <>
      <Modal
        visible={props.visible}
        animationType="none"
        presentationStyle="pageSheet"
        onRequestClose={props.onClose}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="list-outline" size={24} color="#FFB300" />
            <Text style={styles.title}>Anotações e Checklists</Text>

            <TouchableOpacity
              onPress={props.onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={26} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Abas */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "notes" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("notes")}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "notes" && styles.tabButtonTextActive,
                ]}
              >
                Anotações
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "checklists" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("checklists")}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "checklists" && styles.tabButtonTextActive,
                ]}
              >
                Checklists
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {renderProjectSection()}
            {renderAllSection()}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal de visualização */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="none"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            <TouchableOpacity
              style={styles.previewCloseButton}
              onPress={() => setPreviewVisible(false)}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            {previewItem && <></>}

            {previewItem && isNote(previewItem) && (
              <>
                <Text style={styles.previewTitle}>
                  {previewItem.title || "Sem título"}
                </Text>
                <ScrollView style={styles.previewBody}>
                  <Text style={styles.previewDescription}>
                    {previewItem.description || "Sem conteúdo"}
                  </Text>
                </ScrollView>
              </>
            )}

            {previewItem && !isNote(previewItem) && (
              <>
                <Text style={styles.previewTitle}>{previewItem.title}</Text>
                <ScrollView style={styles.previewBody}>
                  {previewItem.itens.map((it, index) => (
                    <View key={index} style={styles.previewChecklistItem}>
                      <Ionicons
                        name={
                          it.checked
                            ? "checkmark-circle"
                            : "checkmark-circle-outline"
                        }
                        size={20}
                        color={it.checked ? "#10B981" : "#9CA3AF"}
                      />
                      <Text
                        style={[
                          styles.previewChecklistItemText,
                          it.checked && styles.previewChecklistItemTextChecked,
                        ]}
                      >
                        {it.text}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: "#FFF8E1",
    borderBottomWidth: 2,
    borderBottomColor: "#FFB300",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabButtonTextActive: {
    color: "#FFB300",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 14,
    paddingLeft: 4,
  },

  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
  },

  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  noteIcon: {
    width: 36,
    height: 36,
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  checklistIcon: {
    width: 36,
    height: 36,
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  itemDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 6,
  },
  checklistProgress: {
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  itemDate: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
  addButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFB300",
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonAdded: {
    backgroundColor: "#4CAF50",
  },
  emptyText: {
    color: "#9CA3AF",
    fontStyle: "italic",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  previewCard: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    position: "relative",
  },
  previewCloseButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    zIndex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    paddingRight: 40,
  },
  previewBody: {
    flex: 1,
  },
  previewDescription: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  previewChecklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  previewChecklistItemText: {
    fontSize: 15,
    color: "#374151",
  },
  previewChecklistItemTextChecked: {
    textDecorationLine: "line-through",
    color: "#6B7280",
  },
});

export default NotesChecklistsProjectModal;
