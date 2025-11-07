import { GeminiService } from "@/services/gemini/gemini.service";
import { Project } from "@/services/project/project";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";

interface IaToolsProps {
  visible: boolean;
  onClose: () => void;
  onSend?: (data: { audioUri?: string; imageUri?: string }) => void;
  project?: Project;
}

export default function IaToolsModal({ visible, onClose, onSend }: IaToolsProps) {
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const geminiService = new GeminiService();

  async function requestAudioPermissions() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Permita o acesso ao microfone.");
      return false;
    }
    return true;
  }

  async function startRecording() {
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) return;
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
    setIsRecording(true);
  }

  async function stopRecording() {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) setAudioUri(uri);
    setRecording(null);
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Permita o acesso à galeria.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets[0].uri) setImageUri(result.assets[0].uri);
  }

  function handleSend() {
    onSend?.({ audioUri: audioUri ?? undefined, imageUri: imageUri ?? undefined });
    setAudioUri(null);
    setImageUri(null);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Assistente I.A.</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.textInput}
            value={"Função em desenvolvimento..."}
            disabled
          />

          <View style={styles.attachmentSection}>
            {/* Áudio */}
            <TouchableOpacity
              style={[styles.attachmentButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Ionicons name="mic" size={22} color="#fff" />
              <Text style={styles.attachmentText}>
                {isRecording ? "Gravando..." : "Gravar Áudio"}
              </Text>
            </TouchableOpacity>

            {audioUri && (
              <View style={styles.attachmentPreview}>
                <Ionicons name="musical-notes" size={20} color="#4CAF50" />
                <Text style={styles.previewText}>Áudio anexado</Text>
              </View>
            )}

            {/* Imagem */}
            <TouchableOpacity style={styles.attachmentButton} onPress={pickImage}>
              <Ionicons name="image" size={22} color="#fff" />
              <Text style={styles.attachmentText}>Selecionar Imagem</Text>
            </TouchableOpacity>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            )}
          </View>

          {isLoading && <ActivityIndicator size="large" color="#007AFF" />}

          <TouchableOpacity
            style={[
              styles.sendButton,
              !audioUri && !imageUri && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!audioUri && !imageUri}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  body: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    height: 80,
    textAlignVertical: "top",
    fontSize: 15,
    marginBottom: 20,
  },
  attachmentSection: {
    gap: 16,
    marginBottom: 30,
  },
  attachmentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  recordingButton: {
    backgroundColor: "#E53935",
  },
  attachmentText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  attachmentPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 4,
  },
  previewText: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  imagePreview: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginTop: 6,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 6,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
