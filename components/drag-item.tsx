import { ItemService } from "@/services/item/item.service";
import { ProjectItem } from "@/services/item/project-item";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  onDelete: (code: number) => void;
}

const DraggableItem = (props: DraggableItemProps) => {
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const translateX = useSharedValue(props.item.x);
  const translateY = useSharedValue(props.item.y);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    translateX.value = props.item.x;
    translateY.value = props.item.y;
    startX.value = props.item.x;
    startY.value = props.item.y;
  }, [props.item.x, props.item.y]);
  // const panGesture = Gesture.Pan()
  //   .onStart(() => {
  //     //Nada necessário no start
  //   })
  //   .onUpdate((event) => {
  //     translateX.value = props.item.x + event.translationX;
  //     translateY.value = props.item.y + event.translationY;
  //   })

  //   .onEnd(() => {
  //     //Atualiza a posição base no item
  //     props.item.x = translateX.value;
  //     props.item.y = translateY.value;
  //     runOnJS(async () => {
  //       await ItemService.updatePosition(
  //         props.item.code,
  //         translateX.value,
  //         translateY.value
  //       );
  //       props.onPositionChange(
  //         props.item.code,
  //         translateX.value,
  //         translateY.value
  //       );
  //     })();
  //   }); //Aqui vou ter que colocar a chamada para atualizar a posição no estado do pai
  // const panGesture = Gesture.Pan()
  //   .onStart(() => {
  //     // Opcional: salvar posição inicial se precisar de "snap back"
  //   })
  //   .onUpdate((event) => {
  //     translateX.value = props.item.x + event.translationX;
  //     translateY.value = props.item.y + event.translationY;
  //   })
  //   .onEnd(() => {
  //     // NÃO MUTAR props.item!
  //     const newX = translateX.value;
  //     const newY = translateY.value;

  //     runOnJS(async () => {
  //       try {
  //         await ItemService.updatePosition(props.item.code, newX, newY);
  //         props.onPositionChange(props.item.code, newX, newY);
  //       } catch (error) {
  //         console.error("Falha ao atualizar posição:", error);
  //         // Opcional: reverter animação se falhar
  //       }
  //     })();
  //   });

  const updatePositionInJS = () => {
    ItemService.updatePosition(
      props.item.code,
      translateX.value,
      translateY.value
    )
      .then(() => {
        props.onPositionChange(
          props.item.code,
          translateX.value,
          translateY.value
        );
      })
      .catch((error) => {
        console.error("Falha ao salvar:", error);
      });
  };

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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const handleLongPress = () => {
    Alert.alert("Opções", "O que você deseja fazer?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        onPress: () => props.onDelete(props.item.code),
        style: "destructive",
      },
    ]);
  };

  const renderContent = () => {
    const itemType = props.item.type;

    if (props.item.type === "link") {
      return (
        <View
          style={[
            styles.linkContainer,
            { width: props.item.width, height: props.item.height },
          ]}
        >
          <Text style={styles.linkTitle} numberOfLines={1}>
            {props.item.title}
          </Text>
          <Text style={styles.linkUrl} numberOfLines={1}>
            {props.item.url}
          </Text>
        </View>
      );
    }

    if (props.item.type === "image") {
      return (
        <Image
          source={{ uri: props.item.source }}
          style={[
            styles.image,
            { width: props.item.width, height: props.item.height },
          ]}
          resizeMode="cover"
        />
      );
    }

    if (props.item.type === "note") {
      return (
        <View
          style={[
            styles.sketchContainer,
            { width: props.item.width, height: props.item.height },
          ]}
        >
          {/* Título */}
          {props.item.title && (
            <Text style={styles.sketchTitle} numberOfLines={1}>
              {props.item.title}
            </Text>
          )}
          {/* Descrição */}
          <Text style={styles.sketchText} numberOfLines={3}>
            {props.item.description}{" "}
            {/* ← MUDAR DE item.text PARA item.description */}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedView
        style={[styles.container, animatedStyle, isPressed && styles.pressed]}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
      >
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          {renderContent()}
        </TouchableOpacity>
      </AnimatedView>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pressed: {
    opacity: 0.7,
  },
  linkContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 14,
    color: "#666",
  },
  image: {
    borderRadius: 8,
  },
  sketchContainer: {
    backgroundColor: "#fff9c4",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffeb3b",
  },
  sketchTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sketchText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
});

export default DraggableItem;
