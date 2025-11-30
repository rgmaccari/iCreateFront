import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Template4() {
  const data = [
    {
      id: '1',
      title: 'Ferramentas de IA',
      desc: 'Descubra novos recursos para projetos criativos.',
      image: 'https://picsum.photos/400/308',
    },
    {
      id: '2',
      title: 'Rotina produtiva',
      desc: 'Dicas rápidas para seu dia render mais.',
      image: 'https://picsum.photos/400/309',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {data.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.slide, { width }]}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.9,
    height: 250,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#362946',
  },
  desc: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 4,
  },
});
