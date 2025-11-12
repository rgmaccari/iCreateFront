import { ItemService } from "@/services/item/item.service";
import { ProjectItem } from "@/services/item/project-item";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

interface DraggableItemProps {
  item: ProjectItem;
  onPositionChange: (code: number, x: number, y: number) => void;
  onDelete: (
    itemCode: number,
    componentCode: number,
    task: string,
    type?: string
  ) => void;
  onLongPress?: (item: ProjectItem) => void;
}

const DraggableItem = (props: DraggableItemProps) => {
  const startX = useSharedValue(props.item.x); //Posição inicial
  const startY = useSharedValue(props.item.y); //Posição inicial
  const translateX = useSharedValue(props.item.x); //Posição durante o arrasto
  const translateY = useSharedValue(props.item.y); //Posição durante o arrasto

  const width = useSharedValue(props.item.width || 180);
  const height = useSharedValue(props.item.height || 100);

  const [isPressed, setIsPressed] = useState(false); //Controla qual item está sendo movido

  //Acompanha alterações na posição do item...
  useEffect(() => {
    translateX.value = props.item.x;
    translateY.value = props.item.y;
  }, [props.item.x, props.item.y]);

  //Att posição
  const updatePositionInJS = () => {
    ItemService.updatePosition(
      props.item.code,
      translateX.value,
      translateY.value
    )
      .then(() =>
        props.onPositionChange(
          props.item.code,
          translateX.value,
          translateY.value
        )
      )
      .catch((err) => console.error("Falha ao salvar posição:", err));
  };

  //Att informação do tamanho
  const updateSizeInJS = () => {
    ItemService.updatePosition(
      props.item.code,
      translateX.value,
      translateY.value,
      width.value,
      height.value
    ).catch((error: any) =>
      console.error("Falha ao salvar tamanho:", error.formattedMessage)
    );
  };

  //O que ocorre ao realizar gestos (arrastar redimencionar)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(updatePositionInJS)();
    });

  //Redimensionar item
  const resizeGesture = Gesture.Pan()
    .onUpdate((e) => {
      "worklet";
      width.value = Math.min(Math.max(120, width.value + e.translationX), 400);
      height.value = Math.min(
        Math.max(100, height.value + e.translationY),
        300
      ); // mínimo agora 100
    })
    .onEnd(() => {
      runOnJS(updateSizeInJS)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    width: width.value,
    height: height.value,
  }));

  //Pressionar o item por um tempo...
  const handleLongPress = () => props.onLongPress?.(props.item);

  const renderContent = () => {
    if (props.item.type === "link") {
      return (
        <View style={[styles.linkContainer]}>
          {props.item.previewImageUrl && (
            <Image
              source={{ uri: props.item.previewImageUrl }}
              style={styles.linkImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.overlay}>
            <Text style={styles.linkTitle} numberOfLines={1}>
              {String(props.item.title || "")}
            </Text>
            <Text style={styles.linkUrl} numberOfLines={1}>
              {String(props.item.url || "")}
            </Text>
          </View>
        </View>
      );
    }

    if (props.item.type === "image") {
      return (
        <Image
          source={{ uri: props.item.source }}
          style={styles.image}
          resizeMode="cover"
        />
      );
    }

    if (props.item.type === "note") {
      return (
        <View style={styles.sketchContainer}>
          <View style={styles.noteContent}>
            {props.item.title && (
              <Text
                style={styles.sketchTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {String(props.item.title || "")}
              </Text>
            )}
            <Text
              style={styles.sketchText}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {String(props.item.description || "")}
            </Text>
          </View>

          {props.item.updatedAt && (
            <Text style={styles.sketchDate}>
              {new Date(props.item.updatedAt).toLocaleDateString("pt-BR")}
            </Text>
          )}
        </View>
      );
    }

    if (props.item.type === "checklist") {
      return (
        <View style={styles.checklistContainer}>
          {props.item.title && (
            <Text
              style={styles.checklistTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {String(props.item.title || "")}
            </Text>
          )}

          <View style={styles.checklistItems}>
            {props.item.items?.slice(0, 4).map((it, idx) => (
              <View key={idx} style={styles.checkItemRow}>
                <View
                  style={[
                    styles.checkbox,
                    it.checked
                      ? styles.checkboxChecked
                      : styles.checkboxUnchecked,
                  ]}
                />
                <Text
                  style={[
                    styles.checkItemText,
                    it.checked && styles.checkItemTextChecked,
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {it.text}
                </Text>
              </View>
            ))}

            {props.item.items && props.item.items.length > 4 && (
              <Text style={styles.checkItemMore}>
                +{props.item.items.length - 4} itens
              </Text>
            )}
          </View>

          {props.item.updatedAt && (
            <Text style={styles.checklistDate}>
              {new Date(props.item.updatedAt).toLocaleDateString("pt-BR")}
            </Text>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedView style={[styles.container, animatedStyle]}>
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={500}
          activeOpacity={0.8}
          style={{ flex: 1 }}
        >
          {renderContent()}
        </TouchableOpacity>

        {/*Handle de redimensionar*/}
        <GestureDetector gesture={resizeGesture}>
          <View style={styles.resizeHandle} />
        </GestureDetector>
      </AnimatedView>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  pressed: { opacity: 0.8 },
  resizeHandle: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 16,
    height: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  linkContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  linkImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  linkUrl: {
    fontSize: 12,
    color: "#eee",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  sketchTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sketchText: {
    fontSize: 12,
    color: "#555",
  },
  sketchContainer: {
    flex: 1,
    backgroundColor: "#fff9c4",
    paddingHorizontal: 10,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: "#ffeb3b",
    borderRadius: 8,
    position: "relative",
    justifyContent: "space-between",
  },
  noteContent: {
    flexShrink: 1,
    marginBottom: 16, // margem maior para isolar a data
    overflow: "hidden",
  },
  sketchDate: {
    position: "absolute",
    bottom: 4,
    left: 8,
    fontSize: 8,
    color: "#777",
  },
  checklistContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    position: "relative",
  },

  checklistTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },

  checklistItems: {
    gap: 4,
    marginBottom: 10,
  },

  checkItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    marginRight: 6,
  },

  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },

  checkboxUnchecked: {
    borderColor: "#999",
    backgroundColor: "transparent",
  },

  checkItemText: {
    fontSize: 12,
    color: "#444",
  },

  checkItemTextChecked: {
    textDecorationLine: "line-through",
    color: "#777",
  },

  checkItemMore: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },

  checklistDate: {
    position: "absolute",
    bottom: 4,
    left: 8,
    fontSize: 8,
    color: "#777",
  },
});

export default DraggableItem;
