import { Image } from '@/services/image/image';
import { FontAwesome } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ImageCardProps {
  images: Image[];
  refresh: () => void;
  onEdit: (image: Image) => void;
  onDelete: (code: number) => void;
}

export default function ImageCard({ images, refresh, onEdit, onDelete }: ImageCardProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {images.map((image) => (
        <View key={image.code} style={styles.imageCard}>
          <Text>{image.filename}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={() => onEdit(image)}>
              <FontAwesome name="pencil" size={20} color="#362946" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onDelete(image.code)}>
              <FontAwesome name="trash" size={20} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  imageCard: {
    width: '48%',
    borderRadius: 10,
    backgroundColor: '#EBE1F6',
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    width: '100%',
  },
});
