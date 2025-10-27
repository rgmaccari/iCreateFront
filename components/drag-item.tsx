import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

interface DraggableItemProps {
  item: {
    code: number; //correto como obrigatório
    type: 'link' | 'image' | 'sketch' | 'checklist';
    x: number; //Eixo
    y: number; //Eixo
    width: number;
    height: number;
    title?: string; //Usado para links e notes 
    description?: string; //Usado para links e notes 
    url?: string; //Usado para links
    source?: string; //Usado para imagens
  };
  onPositionChange: (code: number, x: number, y: number) => void;
  onDelete: (code: number) => void;
  onDragStart: () => void; //Inicio do drag
  onDragEnd: () => void; //Fim do drag
}

const DraggableItem = (props: DraggableItemProps) => {
  const translateX = useSharedValue(props.item.x);
  const translateY = useSharedValue(props.item.y);
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false); //Esta senod movidow

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setIsDragging)(true);
      runOnJS(props.onDragStart)();
    })
    .onUpdate((event) => {
      translateX.value = props.item.x + event.translationX;
      translateY.value = props.item.y + event.translationY;
    })
    .onEnd(() => {
      //Atualiza a posição base no item
      runOnJS(setIsDragging)(false);
      runOnJS(props.onDragEnd)();

      // Verifica se está sobre uma drop zone (coordenadas aproximadas)
      const finalX = translateX.value;
      const finalY = translateY.value;
      const isOverArchive = finalX > 300 && finalY < 100;
      const isOverTrash = finalX > 300 && finalY > 120 && finalY < 220;

      if (isOverArchive) {
        console.log(`Item ${props.item.code} solto no arquivo`);
        // Chama função de arquivar
      } else if (isOverTrash) {
        console.log(`Item ${props.item.code} solto na lixeira`);
        // Chama função de excluir
      } else {
        // Atualiza posição normal
        props.item.x = finalX;
        props.item.y = finalY;
        runOnJS(props.onPositionChange)(props.item.code, finalX, finalY);
      }
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
    Alert.alert(
      'Opções',
      'O que você deseja fazer?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: () => props.onDelete(props.item.code), style: 'destructive' },
      ]
    );
  };

  const renderContent = () => {
    switch (props.item.type) {
      case 'link':
        return (
          <View style={[styles.linkContainer, { width: props.item.width, height: props.item.height }]}>
            <Text style={styles.linkTitle} numberOfLines={1}>{props.item.title}</Text>
            <Text style={styles.linkUrl} numberOfLines={1}>{props.item.url}</Text>
          </View>
        );

      case 'image':
        return (
          <Image
            source={{ uri: props.item.source }}
            style={[styles.image, { width: props.item.width, height: props.item.height }]}
            resizeMode="cover"
          />
        );

      case 'sketch':
        return (
          <View style={[styles.sketchContainer, { width: props.item.width, height: props.item.height }]}>
            {/* Título */}
            {props.item.title && (
              <Text style={styles.sketchTitle} numberOfLines={1}>
                {props.item.title}
              </Text>
            )}
            {/* Descrição */}
            <Text style={styles.sketchText} numberOfLines={3}>
              {props.item.description} {/* ← MUDAR DE item.text PARA item.description */}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedView
        style={[
          styles.container,
          animatedStyle,
          isPressed && styles.pressed,
        ]}
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
    position: 'absolute',
    shadowColor: '#000',
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
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 14,
    color: '#666',
  },
  image: {
    borderRadius: 8,
  },
  sketchContainer: {
    backgroundColor: '#fff9c4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeb3b',
  },
  sketchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sketchText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
});

export default DraggableItem;
