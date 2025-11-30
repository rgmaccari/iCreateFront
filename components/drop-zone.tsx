import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface DropZoneProps {
  type: 'archive' | 'trash';
  onDrop: (code: number) => void;
  isActive: boolean;
}

const DropZone = ({ type, onDrop, isActive }: DropZoneProps) => {
  const getConfig = () => {
    switch (type) {
      case 'archive':
        return {
          icon: 'archive' as const,
          color: '#64B5F6',
          bgColor: 'rgba(100, 181, 246, 0.15)',
        };
      case 'trash':
        return {
          icon: 'trash' as const,
          color: '#EF5350',
          bgColor: 'rgba(239, 83, 80, 0.15)', //Muito transparente
        };
    }
  };

  const config = getConfig();

  //Só renderiza se estiver ativo (durante arraste)
  if (!isActive) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <FontAwesome name={config.icon} size={20} color={config.color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default DropZone;
