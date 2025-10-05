import { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Interface para parâmetros da rota
type ProjectScreenRouteProp = RouteProp<{ params: { projectId: string } }, 'params'>;

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  links: string[];
  aiResults: string[];
}

export default function SettingsScreen({ route }: { route: ProjectScreenRouteProp }) {
  const [project, setProject] = useState<Project>({
    id: 'project-1',
    title: 'Projeto Criativo',
    description: 'Este é um projeto para explorar ideias inovadoras e organizar recursos visuais.',
    images: ['https://picsum.photos/200/200?random=1', 'https://picsum.photos/200/200?random=2'],
    links: ['https://example.com/recurso1', 'https://example.com/recurso2'],
    aiResults: ['Transcrição de imagem: Texto genérico da IA'],
  });

  const pickImage = () => {
    // Simula adição de imagem
    setProject({
      ...project,
      images: [...project.images, `https://picsum.photos/200/200?random=${Date.now()}`],
      aiResults: [...project.aiResults, 'Transcrição de imagem: Nova imagem adicionada'],
    });
  };

  const addLink = () => {
    Alert.prompt('Adicionar Link', 'Insira a URL:', (url) => {
      if (url) setProject({ ...project, links: [...project.links, url] });
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.title}
          value={project.title}
          onChangeText={(text) => setProject({ ...project, title: text })}
          placeholder="Título do projeto"
        />
        <Button title="Salvar" onPress={() => Alert.alert('Projeto salvo!')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descrição</Text>
        <TextInput
          style={styles.description}
          value={project.description}
          onChangeText={(text) => setProject({ ...project, description: text })}
          multiline
          placeholder="Descreva seu projeto..."
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Imagens</Text>
        <FlatList
          horizontal
          data={project.images}
          renderItem={({ item }) => <Image source={{ uri: item }} style={styles.image} />}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={<Button title="Adicionar Imagem" onPress={pickImage} />}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Links</Text>
        {project.links.map((link, index) => (
          <TouchableOpacity key={index} onPress={() => Alert.alert('Abrir link', link)}>
            <Text style={styles.link}>{link}</Text>
          </TouchableOpacity>
        ))}
        <Button title="Adicionar Link" onPress={addLink} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consulta à IA</Text>
        <Button title="Enviar Imagem para IA" onPress={pickImage} />
        {project.aiResults.map((result, index) => (
          <Text key={index} style={styles.transcription}>Transcrição: {result}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  section: { marginVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  description: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, minHeight: 100 },
  image: { width: 100, height: 100, marginRight: 8, borderRadius: 4 },
  link: { color: 'blue', marginVertical: 4 },
  transcription: { marginTop: 8, fontSize: 16 },
});

// import { RouteProp } from '@react-navigation/native';
// import React, { useState } from 'react';
// import {
//   Alert,
//   Button,
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// type ProjectScreenRouteProp = RouteProp<{ params: { projectId: string } }, 'params'>;

// interface Project {
//   id: string;
//   title: string;
//   description: string;
//   images: string[];
//   links: string[];
//   aiResults: string[];
// }

// export default function HybridTabScreen({ route }: { route: ProjectScreenRouteProp }) {
//   const [project, setProject] = useState<Project>({
//     id: 'project-1',
//     title: 'Projeto Criativo',
//     description: 'Este é um projeto para explorar ideias inovadoras e organizar recursos visuais.',
//     images: ['https://picsum.photos/200/200?random=1', 'https://picsum.photos/200/200?random=2'],
//     links: ['https://example.com/recurso1', 'https://example.com/recurso2'],
//     aiResults: ['Transcrição de imagem: Texto genérico da IA'],
//   });
//   const [activeTab, setActiveTab] = useState<'description' | 'images' | 'links' | 'ai'>('description');

//   const pickImage = () => {
//     setProject({
//       ...project,
//       images: [...project.images, `https://picsum.photos/200/200?random=${Date.now()}`],
//       aiResults: [...project.aiResults, 'Transcrição de imagem: Nova imagem adicionada'],
//     });
//   };

//   const addLink = () => {
//     Alert.prompt('Adicionar Link', 'Insira a URL:', (url) => {
//       if (url) setProject({ ...project, links: [...project.links, url] });
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TextInput
//           style={styles.title}
//           value={project.title}
//           onChangeText={(text) => setProject({ ...project, title: text })}
//           placeholder="Título do projeto"
//         />
//         <Button title="Salvar" onPress={() => Alert.alert('Projeto salvo!')} />
//       </View>

//       <View style={styles.tabBar}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'description' && styles.activeTab]}
//           onPress={() => setActiveTab('description')}
//         >
//           <Text>Descrição</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'images' && styles.activeTab]}
//           onPress={() => setActiveTab('images')}
//         >
//           <Text>Imagens</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'links' && styles.activeTab]}
//           onPress={() => setActiveTab('links')}
//         >
//           <Text>Links</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'ai' && styles.activeTab]}
//           onPress={() => setActiveTab('ai')}
//         >
//           <Text>IA</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.tabContent}>
//         {activeTab === 'description' && (
//           <TextInput
//             style={styles.description}
//             value={project.description}
//             onChangeText={(text) => setProject({ ...project, description: text })}
//             multiline
//             placeholder="Descreva seu projeto..."
//           />
//         )}

//         {activeTab === 'images' && (
//           <FlatList
//             data={project.images}
//             numColumns={2}
//             renderItem={({ item }) => <Image source={{ uri: item }} style={styles.image} />}
//             keyExtractor={(item, index) => index.toString()}
//             ListFooterComponent={<Button title="Adicionar Imagem" onPress={pickImage} />}
//           />
//         )}

//         {activeTab === 'links' && (
//           <View>
//             {project.links.map((link, index) => (
//               <TouchableOpacity key={index} onPress={() => Alert.alert('Abrir link', link)}>
//                 <Text style={styles.link}>{link}</Text>
//               </TouchableOpacity>
//             ))}
//             <Button title="Adicionar Link" onPress={addLink} />
//           </View>
//         )}

//         {activeTab === 'ai' && (
//           <View>
//             <Button title="Enviar Imagem para IA" onPress={pickImage} />
//             {project.aiResults.map((result, index) => (
//               <Text key={index} style={styles.transcription}>Transcrição: {result}</Text>
//             ))}
//           </View>
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//   title: { fontSize: 24, fontWeight: 'bold', flex: 1 },
//   tabBar: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
//   tab: { padding: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
//   activeTab: { borderBottomColor: '#000' },
//   tabContent: { flex: 1 },
//   description: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, minHeight: 100 },
//   image: { width: 150, height: 150, margin: 8, borderRadius: 4 },
//   link: { color: 'blue', marginVertical: 4 },
//   transcription: { marginTop: 8, fontSize: 16 },
// });

// import { RouteProp } from '@react-navigation/native';
// import React, { useState } from 'react';
// import {
//   Alert,
//   Button,
//   Image,
//   PanResponder,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// type ProjectScreenRouteProp = RouteProp<{ params: { projectId: string } }, 'params'>;

// interface ProjectItem {
//   id: string;
//   type: 'image' | 'link' | 'ai';
//   content: string;
//   x: number;
//   y: number;
// }

// interface Project {
//   id: string;
//   title: string;
//   description: string;
//   items: ProjectItem[];
// }

// export default function InteractiveBoardScreen({ route }: { route: ProjectScreenRouteProp }) {
//   const [project, setProject] = useState<Project>({
//     id: 'project-1',
//     title: 'Projeto Criativo',
//     description: 'Este é um projeto para explorar ideias inovadoras e organizar recursos visuais.',
//     items: [
//       { id: '1', type: 'image', content: 'https://picsum.photos/200/200?random=1', x: 50, y: 50 },
//       { id: '2', type: 'image', content: 'https://picsum.photos/200/200?random=2', x: 150, y: 50 },
//       { id: '3', type: 'link', content: 'https://example.com/recurso1', x: 50, y: 150 },
//       { id: '4', type: 'link', content: 'https://example.com/recurso2', x: 150, y: 150 },
//       { id: '5', type: 'ai', content: 'Transcrição de imagem: Texto genérico da IA', x: 50, y: 250 },
//     ],
//   });
//   const [draggingId, setDraggingId] = useState<string | null>(null);

//   const pickImage = () => {
//     const id = Date.now().toString();
//     setProject({
//       ...project,
//       items: [
//         ...project.items,
//         { id, type: 'image', content: `https://picsum.photos/200/200?random=${id}`, x: 50, y: 50 },
//         { id: (Date.now() + 1).toString(), type: 'ai', content: 'Transcrição de imagem: Nova imagem', x: 50, y: 150 },
//       ],
//     });
//   };

//   const addLink = () => {
//     Alert.prompt('Adicionar Link', 'Insira a URL:', (url) => {
//       if (url) {
//         const id = Date.now().toString();
//         setProject({
//           ...project,
//           items: [...project.items, { id, type: 'link', content: url, x: 50, y: 50 }],
//         });
//       }
//     });
//   };

//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onPanResponderGrant: (evt, gesture) => {
//       const touched = project.items.find(
//         (i) => gesture.x0 >= i.x && gesture.x0 <= i.x + 100 && gesture.y0 >= i.y && gesture.y0 <= i.y + 50
//       );
//       if (touched) setDraggingId(touched.id);
//     },
//     onPanResponderMove: (evt, gesture) => {
//       if (draggingId !== null) {
//         setProject((prev) => ({
//           ...prev,
//           items: prev.items.map((i) =>
//             i.id === draggingId ? { ...i, x: gesture.moveX - 50, y: gesture.moveY - 25 } : i
//           ),
//         }));
//       }
//     },
//     onPanResponderRelease: () => setDraggingId(null),
//   });

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TextInput
//           style={styles.title}
//           value={project.title}
//           onChangeText={(text) => setProject({ ...project, title: text })}
//           placeholder="Título do projeto"
//         />
//         <Button title="Salvar" onPress={() => Alert.alert('Projeto salvo!')} />
//       </View>

//       <View style={styles.main}>
//         <ScrollView style={styles.sidebar}>
//           <Text style={styles.sectionTitle}>Descrição</Text>
//           <TextInput
//             style={styles.description}
//             value={project.description}
//             onChangeText={(text) => setProject({ ...project, description: text })}
//             multiline
//             placeholder="Descreva seu projeto..."
//           />
//         </ScrollView>

//         <View style={styles.canvas} {...panResponder.panHandlers}>
//           {project.items.map((item) => (
//             <View key={item.id} style={[styles.item, { left: item.x, top: item.y }]}>
//               {item.type === 'image' && <Image source={{ uri: item.content }} style={styles.itemImage} />}
//               {item.type === 'link' && (
//                 <TouchableOpacity onPress={() => Alert.alert('Abrir link', item.content)}>
//                   <Text style={styles.itemLink}>{item.content}</Text>
//                 </TouchableOpacity>
//               )}
//               {item.type === 'ai' && <Text style={styles.itemText}>IA: {item.content}</Text>}
//             </View>
//           ))}
//         </View>
//       </View>

//       <View style={styles.toolbar}>
//         <Button title="Adicionar Imagem" onPress={pickImage} />
//         <Button title="Adicionar Link" onPress={addLink} />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//   title: { fontSize: 24, fontWeight: 'bold', flex: 1 },
//   main: { flex: 1, flexDirection: 'row' },
//   sidebar: { width: 150, paddingRight: 8 },
//   canvas: { flex: 1, backgroundColor: '#f0f0f0' },
//   description: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, minHeight: 100 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
//   item: { position: 'absolute', width: 100, height: 50, backgroundColor: '#add8e6', borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
//   itemImage: { width: 100, height: 50, borderRadius: 5 },
//   itemLink: { color: 'blue', fontSize: 12 },
//   itemText: { fontSize: 12 },
//   toolbar: { flexDirection: 'row', justifyContent: 'space-around', padding: 8 },
// });