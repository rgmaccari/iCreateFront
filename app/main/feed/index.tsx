import { showToast } from "@/constants/showToast";
import { FeedItem } from "@/services/feed/feed";
import { FeedService } from "@/services/feed/feed.service";
import { LinkCreateDto } from "@/services/link/link.create.dto";
import { LinkService } from "@/services/link/link.service";
import { ProjectPreview } from "@/services/project/project.preview";
import { ProjectService } from "@/services/project/project.service";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FeedScreen() {
    const [feedData, setFeedData] = useState<FeedItem[]>([]);
    const [featuredItem, setFeaturedItem] = useState<FeedItem | null>(null);
    const [otherItems, setOtherItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [projects, setProjects] = useState<ProjectPreview[]>([]);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectPreview | null>(null);

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        try {
            const data = await FeedService.getFeedForUser();
            setFeedData(data);

            //Sorteia um item para o topo
            if (data.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.length);
                const featured = data[randomIndex];
                const others = data.filter((_, index) => index !== randomIndex);

                setFeaturedItem(featured);
                setOtherItems(others);
            }
        } catch (error: any) {
            showToast('error', error.formattedMessage)
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async () => {
        try {
            const projectsData = await ProjectService.findAllPreview();
            setProjects(projectsData);
        } catch (error: any) {
            showToast("error", error.formattedMessage);
        }
    };

    const handleOpenLink = (url: string) => {
        Linking.openURL(url).catch(err =>
            console.error('Erro ao abrir link:', err)
        );
    };

    const handleAddToCollection = (item: FeedItem) => {
        setSelectedItem(item);
        setSelectedProject(null);
        loadProjects();
        setShowProjectModal(true);
    };

    const handleConfirmAddToProject = async () => {
        if (!selectedItem || !selectedProject) {
            showToast("error", "Selecione um projeto");
            return;
        }

        try {
            const linkData: LinkCreateDto = {
                title: selectedItem.title,
                url: selectedItem.url,
                projectCode: selectedProject.projectCode,
            };

            const savedLink = await LinkService.create(linkData);
            console.log("✅ Link salvo:", savedLink);

            showToast("info", "Item adicionado ao projeto!");
            setShowProjectModal(false);

        } catch (error: any) {
            showToast("error", error.formattedMessage || "Não foi possível salvar o item");
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#666" />
                <Text style={styles.loadingText}>Carregando recomendações...</Text>
            </SafeAreaView>
        );
    }

    if (feedData.length === 0) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.emptyText}>Nenhuma recomendação encontrada</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/*Item sorteado no topo*/}
                {featuredItem && (
                    <View style={styles.featured}>
                        <TouchableOpacity
                            style={styles.featuredContent}
                            onPress={() => handleOpenLink(featuredItem.url)}
                        >
                            <Image
                                source={{ uri: featuredItem.previewImage }}
                                style={styles.featuredImage}
                            />
                            <View style={styles.featuredTextContainer}>
                                <Text style={styles.featuredTitle}>{featuredItem.title}</Text>
                                {featuredItem.description && (
                                    <Text style={styles.featuredDesc}>{featuredItem.description}</Text>
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* BOTÃO DE ADICIONAR NO RODAPÉ */}
                        <View style={styles.featuredFooter}>
                            <TouchableOpacity
                                style={styles.featuredAddButton}
                                onPress={() => handleAddToCollection(featuredItem)}
                            >
                                <Ionicons name="add-circle-outline" size={20} color="#666" />
                                <Text style={styles.featuredAddText}>Adicionar à coleção</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/*Lista*/}
                <Text style={styles.sectionTitle}>Outras recomendações</Text>

                {otherItems.map((item, index) => (
                    <View key={index} style={styles.recommendationCard}>
                        <TouchableOpacity
                            style={styles.recommendationContent}
                            onPress={() => handleOpenLink(item.url)}
                        >
                            <Image
                                source={{ uri: item.previewImage }}
                                style={styles.recommendationImage}
                            />
                            <View style={styles.recommendationTextContainer}>
                                <Text style={styles.recommendationTitle} numberOfLines={2}>
                                    {item.title}
                                </Text>
                                {item.description && (
                                    <Text style={styles.recommendationDesc} numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleAddToCollection(item)}
                        >
                            <Ionicons name="add-circle-outline" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Modal de seleção de projetos */}
            <Modal
                visible={showProjectModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Adicionar ao projeto</Text>
                        <TouchableOpacity onPress={() => setShowProjectModal(false)}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.projectsList}>
                        {projects.map((project) => (
                            <TouchableOpacity
                                key={project.projectCode}
                                style={[
                                    styles.projectItem,
                                    selectedProject?.projectCode === project.projectCode && styles.projectItemSelected
                                ]}
                                onPress={() => setSelectedProject(project)}
                            >
                                <Image
                                    source={{ uri: project.imageUrl || "https://via.placeholder.com/60" }}
                                    style={styles.projectImage}
                                />
                                <View style={styles.projectInfo}>
                                    <Text style={styles.projectName}>{project.title}</Text>
                                    <Text style={styles.projectDate}>
                                        Criado em: {new Date(project.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                {selectedProject?.projectCode === project.projectCode && (
                                    <Ionicons name="checkmark-circle" size={20} color="#81c091ff" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                !selectedProject && styles.confirmButtonDisabled
                            ]}
                            onPress={handleConfirmAddToProject}
                            disabled={!selectedProject}
                        >
                            <Text style={styles.confirmButtonText}>
                                Adicionar ao projeto
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    container: {
        padding: 16
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 14
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 16
    },
    recommendationCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#F0F0F0",
        flexDirection: 'row',
        alignItems: 'center'
    },
    recommendationContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12
    },
    recommendationImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 12
    },
    recommendationTextContainer: {
        flex: 1
    },
    recommendationTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1A1A1A",
        marginBottom: 4
    },
    recommendationDesc: {
        fontSize: 12,
        color: "#666",
        lineHeight: 16
    },

    addButton: {
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#F0F0F0'
    },

    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A'
    },
    projectsList: {
        flex: 1,
        padding: 16
    },
    projectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginBottom: 8
    },
    projectItemSelected: {
        borderColor: '#81c091ff',
        backgroundColor: '#F5F9FF'
    },
    projectImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 12
    },
    projectInfo: {
        flex: 1
    },
    projectName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: 4
    },
    projectDate: {
        fontSize: 12,
        color: '#666'
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0'
    },
    confirmButton: {
        backgroundColor: '#81c091ff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center'
    },
    confirmButtonDisabled: {
        backgroundColor: '#E0E0E0'
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600'
    },
    featured: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginBottom: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E0E0E0"
    },
    featuredContent: {
        flex: 1,
    },
    featuredImage: {
        width: "100%",
        height: 180
    },
    featuredTextContainer: {
        padding: 12
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginBottom: 6
    },
    featuredDesc: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20
    },
    featuredFooter: {
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        padding: 12
    },
    featuredAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    featuredAddText: {
        fontSize: 14,
        color: "#666",
        fontWeight: '500'
    }
});