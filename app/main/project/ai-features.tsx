import { GeminiService } from '@/services/gemini/gemini.service';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';

export default function AiFeatures() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const geminiService = new GeminiService();

  async function requestAudioPermissions() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'É necessário permitir o acesso ao microfone.');
      return false;
    }
    return true;
  }

  async function requestImagePermissions() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'É necessário permitir o acesso à galeria.');
      return false;
    }
    return true;
  }

  async function startRecording() {
    try {
      const hasPermission = await requestAudioPermissions();
      if (!hasPermission) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao iniciar a gravação.');
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setIsRecording(false);
    setIsLoading(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        const result = await geminiService.transcribeAudio(uri);
        setTranscription(result.content || 'Transcrição recebida');
      }
    } catch (err: any) {
      console.error('Erro ao enviar áudio:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Falha ao enviar o áudio.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function pickImage() {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setIsLoading(true);
      try {
        const response = await geminiService.transcribeImage(result.assets[0].uri);
        setTranscription(response.content || 'Transcrição da imagem recebida');
      } catch (err: any) {
        console.error('Erro ao enviar imagem:', err);
        const errorMessage =
          err.response?.data?.message || err.message || 'Falha ao enviar a imagem.';
        Alert.alert('Erro', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transcrição de Áudio e Imagem</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
        />
        <Button title="Selecionar Imagem" onPress={pickImage} disabled={isLoading || isRecording} />
      </View>

      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      {transcription && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionText}>Transcrição: {transcription}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  transcriptionContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  transcriptionText: {
    fontSize: 16,
  },
});
