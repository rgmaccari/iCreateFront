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
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsScreenProps {
    projectCode?: number;
}

export default function SettingsScreen({ projectCode }: SettingsScreenProps) {
    const [project, setProject] = useState<Project | undefined>(undefined);
    const [formData, setFormData] = useState<Partial<Project>>({});
    const [images, setImages] = useState<Image[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [transcription, setTranscription] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [loading, setLoading] = useState(true);
    const geminiService = new GeminiService();

    useEffect(() => {
        const loadProject = async () => {
            if (projectCode) {
                try {
                    const projectData = await ProjectService.findByCode(projectCode);
                    setProject(projectData);
                    setFormData(projectData);
                    const projectImages = await ImageService.findAllByProjectCode(projectCode);
                    setImages(projectImages || []);
                    const projectLinks = await LinkService.findAllByProjectCode(projectCode);
                    setLinks(projectLinks || []);
                } catch (err) {
                    console.error('Erro ao carregar projeto:', err);
                    Alert.alert('Erro', 'Falha ao carregar o projeto.');
                }
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
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#362946" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Projeto</Text>
                    <ProjectForm project={project} onChange={setFormData} />
                    <View style={styles.buttonsContainer}>
                        <Button title={project ? 'Atualizar' : 'Criar'} onPress={handleSubmit} />
                        {project && (
                            <Button
                                title="Deletar"
                                color="red"
                                onPress={() => deleteProject(project.code)}
                            />
                        )}
                    </View>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1 },
    section: { marginVertical: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#362946', marginBottom: 8 },
    imageContainer: { maxHeight: 200, overflow: 'hidden' }, // Limita a altura do FlatList
    linkContainer: { maxHeight: 200, overflow: 'hidden' }, // Limita a altura do ScrollView
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
    buttonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
    transcription: { fontSize: 16, marginTop: 8, color: '#362946' },
});