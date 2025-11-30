import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShortcutCardProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode; //passar o ícone do FontAwesome por hora
}

export default function ProjectContentCard({ title, onPress, icon }: ShortcutCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        {icon ? icon : <FontAwesome name="file-image-o" size={40} color="#362946" />}
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 10,
    backgroundColor: '#EBE1F6',
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#362946',
    textAlign: 'center',
  },
});
