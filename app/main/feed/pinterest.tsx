// app/feed/Template2.tsx
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const width = Dimensions.get('window').width / 2 - 24;

export default function Template2() {
  const data = [
    { id: '1', title: 'Técnicas de foco', image: 'https://picsum.photos/400/302' },
    { id: '2', title: 'Trabalho criativo', image: 'https://picsum.photos/400/303' },
    { id: '3', title: 'Música e concentração', image: 'https://picsum.photos/400/304' },
  ];

  return (
    <SafeAreaView>
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 6,
    width,
    elevation: 3,
  },
  image: { width: '100%', height: 120 },
  title: { padding: 8, fontWeight: '600', color: '#362946' },
});
