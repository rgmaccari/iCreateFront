// components/image-viewer-panel.tsx

import { Image } from "@/services/image/image";
import React from "react";
import {
    FlatList,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface Props {
    images: Image[];
    viewMode: "list" | "grid" | "carousel";
    onChangeViewMode: (mode: "list" | "grid" | "carousel") => void;
    onImagePress: (index: number) => void;
}

export const ImageViewerPanel: React.FC<Props> = ({ images, viewMode, onChangeViewMode, onImagePress }) => {
    const renderView = () => {
        switch (viewMode) {
            case "grid":
                return renderGrid();
            case "carousel":
                return renderCarousel();
            case "list":
            default:
                return renderList();
        }
    };

    const renderList = () => (
        <ScrollView contentContainerStyle={styles.scroll}>
            {images.map((img, index) => (
                <TouchableOpacity key={img.code} onPress={() => onImagePress(index)} style={styles.listItemRow}>
                    <RNImage
                        source={{ uri: `data:${img.mimeType};base64,${img.dataBase64}` }}
                        style={styles.thumbnail}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.filename}>{img.filename}</Text>
                        {img.isCover && <Text style={styles.coverBadge}>Capa</Text>}
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderGrid = () => (
        <FlatList
            data={images}
            keyExtractor={(item) => item.code.toString()}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => onImagePress(index)}>
                    <RNImage
                        source={{ uri: `data:${item.mimeType};base64,${item.dataBase64}` }}
                        style={styles.gridImage}
                    />
                </TouchableOpacity>
            )}
        />
    );

    const renderCarousel = () => (
        <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
        >
            {images.map((img, index) => (
                <TouchableOpacity key={img.code} onPress={() => onImagePress(index)}>
                    <RNImage
                        source={{ uri: `data:${img.mimeType};base64,${img.dataBase64}` }}
                        style={styles.carouselImage}
                    />
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.button, viewMode === "list" && styles.activeButton]}
                    onPress={() => onChangeViewMode("list")}
                >
                    <Text style={styles.buttonText}>Lista</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, viewMode === "grid" && styles.activeButton]}
                    onPress={() => onChangeViewMode("grid")}
                >
                    <Text style={styles.buttonText}>Grade</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, viewMode === "carousel" && styles.activeButton]}
                    onPress={() => onChangeViewMode("carousel")}
                >
                    <Text style={styles.buttonText}>Carrossel</Text>
                </TouchableOpacity>
            </View>

            {renderView()}
        </View>
    );
};

const styles = StyleSheet.create({
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
});
