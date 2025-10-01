import ImageModal, { ImageCreateDto } from "@/components/image-modal";
import ImageViewerPanel from "@/components/image-viewer-panel";
import { Image } from "@/services/image/image";
import { ImageService } from "@/services/image/image.service";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ImageScreen() {
    const params = useLocalSearchParams<{ projectCode?: string }>();
    const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;

    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [viewMode, setViewMode] = useState<"list" | "grid" | "carousel">("list");

    // const findAllByProjectCode = async () => {
    //     if (projectCode) {
    //         const result = await ImageService.findAllByProjectCode(projectCode);
    //         setImages(result || []);
    //     }
    // };

    const findAllByProjectCode = async () => {
        if (projectCode) {
            const result = await ImageService.findAllByProjectCode(projectCode);

            if (Array.isArray(result) && result.length > 0) {
            } else {
                console.log("[Front] Nenhum resultado ou formato inesperado:", result);
            }

            setImages(result || []);
        }
    };


    const create = async (forms: ImageCreateDto[]) => {
        try {
            const formData = new FormData();

            forms.forEach((form, index) => {
                if (form.data) {
                    console.log(`[Front] Adicionando imagem ${index}:`, form);

                    formData.append("images", {
                        uri: form.data.uri,
                        type: form.data.mimeType,
                        name: form.filename || form.data.name || "image.jpg",
                    } as any);
                }

                if (form.filename)
                    formData.append("filename", form.filename);

                if (form.isCover !== undefined)
                    formData.append("isCover", String(form.isCover));
            });

            console.log('[Front] Enviando FormData...');

            if (projectCode) formData.append("projectCode", String(projectCode));

            await ImageService.create(projectCode!, formData);

            await findAllByProjectCode();
        } catch (err) {
            console.error("Erro ao criar imagens:", err);
            throw err;
        }
    };

    // const openViewer = (index: number) => {
    //     setViewerIndex(index);
    //     setViewerVisible(true);
    // };

    useEffect(() => {
        findAllByProjectCode().finally(() => setLoading(false));
    }, [projectCode]);

    const imageSources = images.map((img, idx) => {
        return {
            uri: img.url,
        };
    });


    // const renderList = () => (
    //     <ScrollView contentContainerStyle={styles.scroll}>
    //         {images.map((img, index) => (
    //             <TouchableOpacity key={img.code} onPress={() => openViewer(index)} style={styles.listItemRow}>
    //                 <RNImage
    //                     source={{ uri: `data:${img.mimeType};base64,${img.dataBase64}` }}
    //                     style={styles.thumbnail}
    //                 />
    //                 <View style={{ flex: 1 }}>
    //                     <Text style={styles.filename}>{img.filename}</Text>
    //                     {img.isCover && <Text style={styles.coverBadge}>Capa</Text>}
    //                 </View>
    //             </TouchableOpacity>
    //         ))}
    //     </ScrollView>
    // );


    // const renderGrid = () => (
    //     <FlatList
    //         data={images}
    //         keyExtractor={(item) => item.code.toString()}
    //         numColumns={3}
    //         contentContainerStyle={styles.gridContainer}
    //         renderItem={({ item, index }) => (
    //             <TouchableOpacity onPress={() => openViewer(index)}>
    //                 <RNImage
    //                     source={{ uri: `data:${item.mimeType};base64,${item.dataBase64}` }}
    //                     style={styles.gridImage}
    //                 />
    //             </TouchableOpacity>
    //         )}
    //     />
    // );

    // const renderCarousel = () => (
    //     <ScrollView
    //         horizontal
    //         pagingEnabled
    //         showsHorizontalScrollIndicator={false}
    //         contentContainerStyle={styles.carouselContainer}
    //     >
    //         {images.map((img, index) => (
    //             <TouchableOpacity key={img.code} onPress={() => openViewer(index)}>
    //                 <RNImage
    //                     source={{ uri: `data:${img.mimeType};base64,${img.dataBase64}` }}
    //                     style={styles.carouselImage}
    //                 />
    //             </TouchableOpacity>
    //         ))}
    //     </ScrollView>
    // );

    // const renderView = () => {
    //     switch (viewMode) {
    //         case "grid":
    //             return renderGrid();
    //         case "carousel":
    //             return renderCarousel();
    //         case "list":
    //         default:
    //             return renderList();
    //     }
    // };

    return (
        <SafeAreaView style={styles.container}>
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
                images={images} viewMode={viewMode} />


            <ImageModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={create}
            />

            <ImageViewing
                images={imageSources}
                imageIndex={viewerIndex}
                visible={viewerVisible}
                onRequestClose={() => setViewerVisible(false)}
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
