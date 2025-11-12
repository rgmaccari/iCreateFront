import { Image } from "@/services/image/image";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image as RNImage,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewing from "react-native-image-viewing";

type ViewMode = "list" | "grid" | "carousel";

interface ImageViewerProps {
  images: Image[];
  viewMode: ViewMode;
  onDelete: (code: number) => void;
  onAddToBoard?: (image: Image) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const CAROUSEL_IMAGE_WIDTH = 300;
const CAROUSEL_IMAGE_HEIGHT = 300;

export default function ImageViewerPanel(props: ImageViewerProps) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  //Ordenação de imgs
  const sortedImages = [...props.images].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  //Para scroll infinito
  const imageSources = sortedImages.map((img) => ({ uri: img.url }));

  const renderList = () => (
    <FlatList
      data={sortedImages}
      keyExtractor={(img) => img.code.toString()}
      contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          onPress={() => openViewer(index)}
          onLongPress={() => props.onDelete(item.code)}
          style={styles.listItemRow}
        >
          <RNImage source={{ uri: item.url }} style={styles.thumbnail} />
          <View style={{ flex: 1 }}>
            <Text style={styles.filename}>{item.filename}</Text>
            {item.isCover && <Text style={styles.coverBadge}>Capa</Text>}
          </View>
        </TouchableOpacity>
      )}
    />
  );

  const renderGrid = () => (
    <FlatList
      data={sortedImages}
      keyExtractor={(img) => img.code.toString()}
      numColumns={3}
      contentContainerStyle={styles.gridContent}
      renderItem={({ item, index }) => (
        <View style={styles.gridItem}>
          <TouchableOpacity
            onPress={() => openViewer(index)}
            onLongPress={() => props.onAddToBoard?.(item)}
            delayLongPress={300}
          >
            <RNImage source={{ uri: item.url }} style={styles.gridImage} />
          </TouchableOpacity>
        </View>
      )}
    />
  );

  const renderCarousel = () => {
    const [index, setIndex] = useState(0);
    const total = sortedImages.length;

    const next = () => setIndex((prev) => (prev + 1) % total);
    const prev = () => setIndex((prev) => (prev - 1 + total) % total);
    const current = sortedImages[index];

    return (
      <View style={styles.carouselContainer}>
        <View style={styles.imageRow}>
          <TouchableOpacity onPress={prev} style={styles.navButton}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={() => openViewer(index)}
            onLongPress={() => props.onAddToBoard?.(current)}
            delayLongPress={300}
          >
            <RNImage
              source={{ uri: current.url }}
              style={styles.carouselImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={next} style={styles.navButton}>
            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.counter}>
          {index + 1} / {total}
        </Text>
      </View>
    );
  };

  const renderView = () => {
    switch (props.viewMode) {
      case "grid":
        return renderGrid();
      case "carousel":
        return renderCarousel();
      case "list":
      default:
        return renderList();
    }
  };

  return (
    <>
      {renderView()}

      <ImageViewing
        images={imageSources}
        imageIndex={viewerIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: "100%",
    padding: 10,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  filename: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  coverBadge: {
    color: "green",
    fontSize: 12,
    fontWeight: "bold",
  },
  gridContent: {
    paddingHorizontal: 8,
    paddingBottom: 20,
    alignItems: "center",
  },
  gridItem: {
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
  },
  gridImage: {
    width: (screenWidth - 48) / 3,
    height: (screenWidth - 48) / 3,
    borderRadius: 8,
  },
  carouselItem: {
    width: screenWidth,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselTouchable: {
    justifyContent: "center",
    alignItems: "center",
  },

  centeredImage: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
  },
  controlButton: {
    padding: 10,
  },
  controlText: {
    fontSize: 24,
    color: "#333",
    fontWeight: "bold",
  },

  carouselContainer: {
    width: "100%",
    height: 340,
    justifyContent: "center",
    alignItems: "center",
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  navButton: {
    width: 50,
    height: CAROUSEL_IMAGE_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  navArrow: {
    fontSize: 36,
    color: "#555",
    fontWeight: "600",
  },
  imageWrapper: {
    width: CAROUSEL_IMAGE_WIDTH,
    height: CAROUSEL_IMAGE_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  counter: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});
