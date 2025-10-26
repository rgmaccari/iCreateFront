import ImageModal from "@/components/image-modal";
import ImageViewerPanel from "@/components/image-viewer-panel";
import PageHeader from "@/components/page-header";
import { Image } from "@/services/image/image";
import { ImageCreateDto } from "@/services/image/image.create.dto";
import { ImageService } from "@/services/image/image.service";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ImageScreen() {
    const params = useLocalSearchParams<{ userCode?: string }>();
    const userCode = params.userCode ? parseInt(params.userCode, 10) : undefined;

    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "grid" | "carousel">("list");

    useFocusEffect(
        React.useCallback(() => {
            if (!userCode) return;
            console.log("userCode recebido pelos params", userCode);
            setLoading(true);
            findAllImages().catch(err => console.error("Erro ao carregar imagens:", err))
        }, [userCode])
    );

    const findAllImages = async () => {
        if (userCode) {
            const result = await ImageService.findAllImages(userCode);
            console.log('result ', result)
            setImages(result || []);
        }
    };

    const create = async (forms: ImageCreateDto[]) => {
        try {
            const formData = new FormData();

            forms.forEach((form, index) => {
                formData.append("images", {
                    uri: form.uri,
                    type: form.mimeType || "image/jpeg",
                    name: form.filename || `image_${Date.now()}_${index}.jpg`,
                } as any);
                if (form.filename) formData.append("filename", form.filename);
                if (form.isCover !== undefined) formData.append("isCover", String(form.isCover));
            });

            const formDataEntries: any[] = [];
            formData.forEach((value, key) => formDataEntries.push([key, value]));

            await ImageService.create(userCode!, formData);
            await findAllImages();
        } catch (err) {
            console.error("Erro ao criar imagens:", err);
            throw err;
        }
    };

    const deleteByCode = async (code: number) => {
        Alert.alert(
            "Excluir link",
            "Deseja realmente excluir o link?",
            [{ text: "Cancelar", style: "cancel" },
            {
                text: "Excluir", style: "destructive", onPress: async () => {
                    await ImageService.deleteByCode(code);
                    findAllImages();
                }
            }
            ]
        )
    }

    const handleReturn = () => {
        router.back();
    }

    return (
        <SafeAreaView style={styles.container}>
            <PageHeader
                title={"Imagens"}
                onBack={handleReturn}

                showSaveButton={false}
            />


            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                    <Text style={styles.buttonText}>Adicionar imagem</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, viewMode === "list" && styles.activeButton]}
                    onPress={() => setViewMode("list")}
                >
                    <Text style={styles.buttonText}>Lista</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, viewMode === "grid" && styles.activeButton]}
                    onPress={() => setViewMode("grid")}
                >
                    <Text style={styles.buttonText}>Grade</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, viewMode === "carousel" && styles.activeButton]}
                    onPress={() => setViewMode("carousel")}
                >
                    <Text style={styles.buttonText}>Carrossel</Text>
                </TouchableOpacity>
            </View>

            {/*renderView()*/}
            { /* Substitua a chamada de renderView() */}
            <ImageViewerPanel
                images={images}
                viewMode={viewMode}
                onDelete={deleteByCode}
            />

            <ImageModal
                projectCode={userCode}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={create}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 10
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        flexWrap: "wrap",
    },
    button: {
        backgroundColor: "#362946",
        padding: 8,
        borderRadius: 8,
        marginHorizontal: 4,
        marginBottom: 4
    },
    activeButton: {
        backgroundColor: "#6947b9"
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold"
    },
    scroll: {
        width: "100%",
        padding: 10
    },
    listItem: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 8
    },
    filename: {
        fontWeight: "bold",
        marginBottom: 4
    },
    coverBadge: {
        color: "green",
        fontSize: 12,
        fontWeight: "bold"
    },
    gridContainer: {
        alignItems: "center"
    },
    gridImage: {
        width: 100,
        height: 100,
        margin: 5,
        borderRadius: 8
    },
    carouselContainer: {
        alignItems: "center"
    },
    carouselImage: {
        width: 300,
        height: 300,
        marginHorizontal: 10,
        borderRadius: 8
    },
    listItemRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 8
    },
    thumbnail: {
        width: 40,
        height: 40,
        borderRadius: 6,
        marginRight: 10
    },

});
