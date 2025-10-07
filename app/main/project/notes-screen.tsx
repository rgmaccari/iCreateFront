import { Note } from "@/services/notes/note";
import { NoteCreateDto } from "@/services/notes/note.create.dto";
import { NoteService } from "@/services/notes/note.service";
import { NoteUpdateDto } from "@/services/notes/note.update.dto";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotesScreen() {
    const params = useLocalSearchParams<{ projectCode?: string }>();
    const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [sort, setSort] = useState<string>(""); //Para permitir edição do sort
    const [notes, setNotes] = useState<Note[]>([]);
    const [editingNoteCode, setEditingNoteCode] = useState<number | null>(null); //Para rastrear a nota sendo editada

    useEffect(() => {
        console.log("Efeito de montagem ou projectCode alterado");
        if (projectCode) {
            console.log("Carregando notas para o projeto com código:", projectCode);
            loadNotes();
        }
    }, [projectCode]);

    const loadNotes = async () => {
        if (!projectCode) return;
        try {
            const notesData = await NoteService.findAllByProjectCode(projectCode);
            setNotes(notesData);
        } catch (error) {
            console.error("Erro ao carregar notas:", error);
        }
    };

    const create = async () => {
        if (!projectCode) {
            console.error("Código do projeto não fornecido.");
            return;
        }

        try {
            if (editingNoteCode) {
                const noteUpdateDto = new NoteUpdateDto();
                noteUpdateDto.title = title || undefined;
                noteUpdateDto.description = description || undefined;
                noteUpdateDto.sort = sort ? parseInt(sort, 10) : undefined;

                await NoteService.update(editingNoteCode, noteUpdateDto);
                setEditingNoteCode(null); //Limpae o modo de edição
            } else {
                const noteCreateDto = new NoteCreateDto();
                noteCreateDto.title = title || undefined;
                noteCreateDto.description = description || undefined;

                await NoteService.create(projectCode, noteCreateDto);
            }

            setTitle("");
            setDescription("");
            setSort("");
            await loadNotes();
        } catch (error) {
            console.error("Erro ao salvar nota:", error);
        }
    };

    const update = async (code: number) => {
        try {
            const note = await NoteService.findByCode(code);
            setTitle(note.title || "");
            setDescription(note.description || "");
            setSort(note.sort?.toString() || "");
            setEditingNoteCode(code);
        } catch (error) {
            console.error("Erro ao carregar nota para edição:", error);
        }
    };

    const deleteByCode = async (code: number) => {
        try {
            await NoteService.deleteByCode(code);
            await loadNotes();
        } catch (error) {
            console.error("Erro ao excluir nota:", error);
        }
    };

    const handleCancelEdit = () => {
        setTitle("");
        setDescription("");
        setSort("");
        setEditingNoteCode(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.form}>
                <TextInput
                    placeholder="Título"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Descrição"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    style={[styles.input, styles.textarea]}
                />
                <TextInput
                    placeholder="Ordem (sort)"
                    value={sort}
                    onChangeText={setSort}
                    keyboardType="numeric"
                    style={styles.input}
                />
                <View style={styles.buttonContainer}>
                    <Button
                        title={editingNoteCode ? "Atualizar" : "Criar"}
                        onPress={create}
                    />
                    {editingNoteCode && (
                        <Button
                            title="Cancelar"
                            onPress={handleCancelEdit}
                            color="gray"
                        />
                    )}
                </View>
            </View>

            <FlatList
                data={notes}
                keyExtractor={(item) => item.code!.toString()}
                renderItem={({ item }) => (
                    <View style={styles.noteItem}>
                        <Text style={styles.noteTitle}>{item.title || "Sem título"}</Text>
                        <Text>{item.description || "Sem descrição"}</Text>
                        <Text>Ordem: {item.sort}</Text>
                        <View style={styles.noteActions}>
                            <TouchableOpacity onPress={() => update(item.code!)}>
                                <Text style={styles.actionText}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => deleteByCode(item.code!)}>
                                <Text style={[styles.actionText, styles.deleteText]}>Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text>Nenhuma nota encontrada.</Text>}
                style={styles.noteList}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    form: {
        gap: 12,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
    },
    textarea: {
        height: 100,
        textAlignVertical: "top",
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 8,
    },
    noteList: {
        flex: 1,
    },
    noteItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    noteActions: {
        flexDirection: "row",
        gap: 16,
        marginTop: 8,
    },
    actionText: {
        color: "#007AFF",
        fontSize: 14,
    },
    deleteText: {
        color: "#FF3B30",
    },
});