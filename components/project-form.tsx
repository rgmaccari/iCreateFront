import { Image } from "@/services/image/image";
import { ImageService } from "@/services/image/image.service";
import { Link } from "@/services/link/link";
import { LinkService } from "@/services/link/link.service";
import { Note } from "@/services/notes/note";
import { NoteService } from "@/services/notes/note.service";
import { Project } from "@/services/project/project";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Modal, Image as RNImage, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProjectFormProps {
    project?: Project;
    onChange: (data: Partial<Project>) => void;
}

export default function ProjectForm({ project, onChange }: ProjectFormProps) {
    const [form, setForm] = useState<Partial<Project>>({
        title: project?.title || "",
        sketch: project?.sketch || "",
    }); //Title e Description do Project
    const [images, setImages] = useState<Image[]>([]); //Recebe as imagens
    const [links, setLinks] = useState<Link[]>([]); //Recebe os links
    const [notes, setNotes] = useState<Note[]>([]); //Recebe as notas
    const [selectedItem, setSelectedItem] = useState<Image | Link | Note | null>(null); //Item acessado
    const [expandedSection, setExpandedSection] = useState<string | null>(null); //Seção expandida
    const [modalVisible, setModalVisible] = useState(false); //Visibilidade do modal
    const [loading, setLoading] = useState(false); //Carregamento

    //Carregar todos os dados do Project (tudo bem pois são dados leves. Se a imagem estivesse no banco, seria inviável).
    useEffect(() => {
        const loadData = async () => {
            if (project?.code) {
                setLoading(true);
                try {
                    const [loadedImages, loadedLinks, loadedNotes] = await Promise.all([
                        ImageService.findAllByProjectCode(project.code),
                        LinkService.findAllByProjectCode(project.code),
                        NoteService.findAllByProjectCode(project.code),
                    ]);
                    setImages(loadedImages || []);
                    setLinks(loadedLinks || []);
                    setNotes(loadedNotes || []);
                } catch (err) {
                    console.error("Erro ao carregar dados:", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadData();
    }, [project?.code]);

    //Notificar a tela pai (projectScreen) quando o form mudar
    useEffect(() => {
        onChange(form);
    }, [form, onChange]);

    //Toggle para expandir/colapsar seções
    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    //Abrir modal com o objeto em tela cheia
    const openItemModal = (item: Image | Link | Note) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    //Renderizar item de imagem no carrossel
    const renderImageItem = ({ item }: { item: Image }) => (
        <TouchableOpacity style={styles.carouselItem} onPress={() => openItemModal(item)}>
            <RNImage source={{ uri: item.url }} style={styles.carouselImage} />
        </TouchableOpacity>
    );

    //Renderizar item de link no carrossel
    const renderLinkItem = ({ item }: { item: Link }) => (
        <TouchableOpacity style={styles.carouselItem} onPress={() => openItemModal(item)}>
            {item.previewImageUrl ? (
                <RNImage source={{ uri: item.previewImageUrl }} style={styles.carouselImage} />
            ) : (
                <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>Sem imagem</Text>
                </View>
            )}
            <Text style={styles.carouselText} numberOfLines={1}>{item.title || item.url || "Link"}</Text>
        </TouchableOpacity>
    );

    //Renderizar item de nota no carrossel
    const renderNoteItem = ({ item }: { item: Note }) => (
        <TouchableOpacity style={styles.carouselItem} onPress={() => openItemModal(item)}>
            <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Nota</Text>
            </View>
            <Text style={styles.carouselText} numberOfLines={1}>{item.title || "Nota"}</Text>
        </TouchableOpacity>
    );

    //Renderizar o item modal tela cheia (imagem, link ou nota)
    const renderItemModal = () => {
        if (!selectedItem) return null;

        if ("url" in selectedItem && "filename" in selectedItem) {
            //Imagens
            return (
                <View style={styles.modalContent}>
                    <RNImage source={{ uri: selectedItem.url }} style={styles.fullImage} resizeMode="contain" />
                    <Text style={styles.modalText}>{selectedItem.filename || "Imagem sem nome"}</Text>
                    {selectedItem.isCover && <Text style={styles.coverBadge}>Capa</Text>}
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.modalCloseText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            );
        } else if ("url" in selectedItem && "title" in selectedItem) {
            //Links
            return (
                <View style={styles.modalContent}>
                    {selectedItem.previewImageUrl && (
                        <RNImage
                            source={{ uri: selectedItem.previewImageUrl }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
                    <Text style={styles.modalTitle}>{selectedItem.title || "Sem título"}</Text>
                    <Text style={styles.modalText}>{selectedItem.url}</Text>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.modalCloseText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            //Notas
            return (
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{(selectedItem as Note).title || "Sem título"}</Text>
                    <Text style={styles.modalText}>{(selectedItem as Note).description || "Sem descrição"}</Text>
                    {(selectedItem as Note).sort && (
                        <Text style={styles.modalText}>Ordem: {(selectedItem as Note).sort}</Text>
                    )}
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.modalCloseText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* Campo de Descrição */}
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                    style={[styles.input, styles.multiline]}
                    placeholder="Descreva seu projeto..."
                    multiline
                    numberOfLines={4}
                    value={form.sketch}
                    onChangeText={(text) => setForm((prev) => ({ ...prev, sketch: text }))}
                />

                {/* Dropdown para Imagens */}
                <TouchableOpacity style={styles.dropdownHeader} onPress={() => toggleSection("images")}>
                    <Text style={styles.dropdownTitle}>Imagens</Text>
                    <FontAwesome
                        name={expandedSection === "images" ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#362946"
                    />
                </TouchableOpacity>
                {expandedSection === "images" && (
                    <View style={styles.carouselContainer}>
                        {loading ? (
                            <Text style={styles.loadingText}>Carregando imagens...</Text>
                        ) : images.length === 0 ? (
                            <Text style={styles.emptyText}>Nenhuma imagem encontrada.</Text>
                        ) : (
                            <FlatList
                                data={images}
                                renderItem={renderImageItem}
                                keyExtractor={(item) => item.code!.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.carousel}
                            />
                        )}
                    </View>
                )}

                {/* Dropdown para Links */}
                <TouchableOpacity style={styles.dropdownHeader} onPress={() => toggleSection("links")}>
                    <Text style={styles.dropdownTitle}>Links</Text>
                    <FontAwesome
                        name={expandedSection === "links" ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#362946"
                    />
                </TouchableOpacity>
                {expandedSection === "links" && (
                    <View style={styles.carouselContainer}>
                        {loading ? (
                            <Text style={styles.loadingText}>Carregando links...</Text>
                        ) : links.length === 0 ? (
                            <Text style={styles.emptyText}>Nenhum link encontrado.</Text>
                        ) : (
                            <FlatList
                                data={links}
                                renderItem={renderLinkItem}
                                keyExtractor={(item) => item.code!.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.carousel}
                            />
                        )}
                    </View>
                )}

                {/* Dropdown para Notas */}
                <TouchableOpacity style={styles.dropdownHeader} onPress={() => toggleSection("notes")}>
                    <Text style={styles.dropdownTitle}>Notas</Text>
                    <FontAwesome
                        name={expandedSection === "notes" ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#362946"
                    />
                </TouchableOpacity>
                {expandedSection === "notes" && (
                    <View style={styles.carouselContainer}>
                        {loading ? (
                            <Text style={styles.loadingText}>Carregando notas...</Text>
                        ) : notes.length === 0 ? (
                            <Text style={styles.emptyText}>Nenhuma nota encontrada.</Text>
                        ) : (
                            <FlatList
                                data={notes}
                                renderItem={renderNoteItem}
                                keyExtractor={(item) => item.code!.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.carousel}
                            />
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Modal tela cheia para exibir detalhes */}
            <Modal
                visible={modalVisible}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={styles.modalFullScreen}>
                    {renderItemModal()}
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#362946",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    multiline: {
        textAlignVertical: "top",
        height: 100,
    },
    dropdownHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    dropdownTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#362946",
    },
    carouselContainer: {
        marginBottom: 16,
    },
    carousel: {
        paddingVertical: 8,
    },
    carouselItem: {
        width: 120,
        marginRight: 8,
        alignItems: "center",
    },
    carouselImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: "#eee",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontSize: 12,
        color: "#666",
    },
    carouselText: {
        marginTop: 4,
        fontSize: 12,
        color: "#362946",
        textAlign: "center",
    },
    loadingText: {
        fontSize: 14,
        color: "#362946",
        textAlign: "center",
        padding: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#362946",
        textAlign: "center",
        padding: 8,
    },
    modalFullScreen: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    modalContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#362946",
        marginBottom: 8,
    },
    modalText: {
        fontSize: 16,
        color: "#362946",
        marginBottom: 8,
        textAlign: "center",
    },
    coverBadge: {
        fontSize: 14,
        color: "green",
        fontWeight: "bold",
        marginBottom: 8,
    },
    fullImage: {
        width: "100%",
        height: "70%",
        borderRadius: 8,
        marginBottom: 16,
    },
    modalCloseButton: {
        backgroundColor: "#362946",
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    modalCloseText: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },
});
