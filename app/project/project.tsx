import ImageViewerPanel from '@/components/image-viewer-panel';
import InputField from '@/components/input-field';
import LinkCard from '@/components/link-card';
import ProjectForm from '@/components/project-form';
import { GeminiService } from '@/services/gemini/gemini.service';
import { Image } from '@/services/image/image';
import { ImageService } from '@/services/image/image.service';
import { Link } from '@/services/link/link';
import { LinkCreateDto } from '@/services/link/link.create.dto';
import { LinkService } from '@/services/link/link.service';
import { Project } from '@/services/project/project';
import { ProjectInfoDto } from '@/services/project/project.create.dto';
import { ProjectService } from '@/services/project/project.service';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProjectScreen() {
  const params = useLocalSearchParams<{ projectCode?: string }>();
  const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [images, setImages] = useState<Image[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const geminiService = new GeminiService();

  useEffect(() => {
    const loadProject = async () => {
      if (projectCode) {
        try {
          const projectData = await ProjectService.findByCode(projectCode);
          setProject(projectData);
          setFormData(projectData);
          setTempTitle(projectData.title || '');
          const projectImages = await ImageService.findAllByProjectCode(projectCode);
          setImages(projectImages || []);
          const projectLinks = await LinkService.findAllByProjectCode(projectCode);
          setLinks(projectLinks || []);
        } catch (err) {
          console.error('Erro ao carregar projeto:', err);
          Alert.alert('Erro', 'Falha ao carregar o projeto.');
        }
      } else {
        setFormData({ title: '', sketch: '' });
        setTempTitle('');
      }
      setLoading(false);
    };
    loadProject();
  }, [projectCode]);

  const create = async (dto: ProjectInfoDto) => {
    try {
      const createdProject = await ProjectService.create(dto);
      setProject(createdProject);
      router.back();
    } catch (err) {
      console.error('Erro ao criar projeto:', err);
      Alert.alert('Erro', 'Falha ao criar o projeto.');
    }
  };

  const update = async (dto: ProjectInfoDto) => {
    if (!project) return;
    try {
      const updatedProject = await ProjectService.update(project.code!, dto);
      setProject(updatedProject);
      setTempTitle(updatedProject.title);
      router.back();
    } catch (err) {
      console.error('Erro ao atualizar projeto:', err);
      Alert.alert('Erro', 'Falha ao atualizar o projeto.');
    }
  };

  const deleteProject = async (code: number) => {
    Alert.alert('Excluir projeto', 'Deseja realmente excluir o projeto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await ProjectService.deleteByCode(code);
          router.back();
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    const dto: ProjectInfoDto = { title: formData.title!, sketch: formData.sketch! };
    if (project) {
      update(dto);
    } else {
      create(dto);
    }
  };

  const handleTitlePress = () => {
    setTempTitle(formData.title || '');
    setTitleModalVisible(true);
  };

  const handleTitleSave = () => {
    setFormData((prev) => ({ ...prev, title: tempTitle }));
    setTitleModalVisible(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'É necessário permitir o acesso à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets[0].uri && projectCode) {
      try {
        const formData = new FormData();
        formData.append('images', {
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType || 'image/jpeg',
          name: result.assets[0].fileName || 'image.jpg',
        } as any);
        formData.append('projectCode', String(projectCode));
        await ImageService.create(projectCode, formData);
        const projectImages = await ImageService.findAllByProjectCode(projectCode);
        setImages(projectImages || []);
        const response = await geminiService.transcribeImage(result.assets[0].uri);
        setTranscription(response.content || 'Transcrição recebida');
      } catch (err: any) {
        Alert.alert('Erro', err.response?.data?.message || 'Falha ao enviar a imagem.');
      }
    }
  };

  const deleteImage = async (code: number) => {
    if (!projectCode) return;
    await ImageService.deleteByCode(code);
    const projectImages = await ImageService.findAllByProjectCode(projectCode);
    setImages(projectImages || []);
  };

  const addLink = async (url: string) => {
    if (!projectCode || !url) return;
    try {
      const linkDto = new LinkCreateDto();
      linkDto.url = url;
      linkDto.title = '';
      await LinkService.create(projectCode, linkDto);
      const projectLinks = await LinkService.findAllByProjectCode(projectCode);
      setLinks(projectLinks || []);
    } catch (err) {
      console.error('Erro ao adicionar link:', err);
      Alert.alert('Erro', 'Falha ao adicionar o link.');
    }
  };

  const deleteLink = async (code: number) => {
    if (!projectCode) return;
    await LinkService.deleteByCode(code);
    const projectLinks = await LinkService.findAllByProjectCode(projectCode);
    setLinks(projectLinks || []);
  };

  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'É necessário permitir o acesso ao microfone.');
      return;
    }
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao iniciar a gravação.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) {
        const result = await geminiService.transcribeAudio(uri);
        setTranscription(result.content || 'Transcrição recebida');
      }
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Falha ao enviar o áudio.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#362946" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <FontAwesome name="arrow-left" size={24} color="#362946" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTitlePress}>
          <Text style={styles.title}>
            {formData.title || 'Novo Projeto'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={styles.iconButton}>
          <FontAwesome name="save" size={24} color="#362946" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <ProjectForm project={project} onChange={setFormData} />
          {project && (
            <Button
              title="Deletar"
              color="red"
              onPress={() => deleteProject(project.code)}
            />
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imagens</Text>
          <View style={styles.imageContainer}>
            <ImageViewerPanel images={images} viewMode="grid" onDelete={deleteImage} />
          </View>
          <Button title="Adicionar Imagem" onPress={pickImage} />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links</Text>
          <InputField
            type="default"
            placeholder="Digite seu link..."
            buttonLabel="Adicionar"
            onPress={addLink}
          />
          <View style={styles.linkContainer}>
            <LinkCard links={links} refresh={() => { }} onDelete={deleteLink} onEdit={() => { }} />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcrição IA</Text>
          <View style={styles.buttonContainer}>
            <Button
              title={isRecording ? 'Parar Gravação' : 'Gravar Áudio'}
              onPress={isRecording ? stopRecording : startRecording}
            />
            <Button title="Selecionar Imagem" onPress={pickImage} />
          </View>
          {transcription && <Text style={styles.transcription}>Transcrição: {transcription}</Text>}
        </View>
      </View>
      <Modal
        visible={titleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTitleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Título</Text>
            <TextInput
              style={styles.modalInput}
              value={tempTitle}
              onChangeText={setTempTitle}
              placeholder="Digite o título do projeto"
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setTitleModalVisible(false)} />
              <Button title="Salvar" onPress={handleTitleSave} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#EBE1F6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#362946',
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    padding: 8,
  },
  content: { flex: 1, padding: 16 },
  section: { marginVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#362946', marginBottom: 8 },
  imageContainer: { maxHeight: 200, overflow: 'hidden' },
  linkContainer: { maxHeight: 200, overflow: 'hidden' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  transcription: { fontSize: 16, marginTop: 8, color: '#362946' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#362946',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});