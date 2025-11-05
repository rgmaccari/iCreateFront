import { Image } from "@/services/image/image";
import React, { useState } from "react";
import {
  FlatList,
  Image as RNImage,
  ScrollView,
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
}

export default function ImageViewerPanel(props: ImageViewerProps) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const imageSources = props.images.map((img) => ({
    uri: img.url,
  }));

  const renderList = () => (
    <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 20 }}>
      {props.images.map((img, index) => (
        <TouchableOpacity
          key={img.code}
          onPress={() => openViewer(index)}
          onLongPress={() => props.onDelete(img.code)}
          style={styles.listItemRow}
        >
          <RNImage source={{ uri: img.url }} style={styles.thumbnail} />
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
      data={props.images}
      keyExtractor={(img) => img.code.toString()}
      numColumns={3}
      contentContainerStyle={{ paddingHorizontal: 5, paddingBottom: 20 }}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          onPress={() => openViewer(index)}
          onLongPress={() => props.onDelete(item.code)}
        >
          <RNImage source={{ uri: item.url }} style={styles.gridImage} />
        </TouchableOpacity>
      )}
    />
  );

  const renderCarousel = () => (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
    >
      {props.images.map((img, index) => (
        <TouchableOpacity
          key={img.code}
          onPress={() => openViewer(index)}
          onLongPress={() => props.onDelete(img.code)}
        >
          <RNImage source={{ uri: img.url }} style={styles.carouselImage} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

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
  gridContainer: {
    alignItems: "center",
  },
  gridImage: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
  },
  carouselContainer: {
    alignItems: "center",
  },
  carouselImage: {
    width: 300,
    height: 300,
    marginHorizontal: 10,
    borderRadius: 8,
  },
});
