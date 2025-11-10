import { GeminiService } from "@/services/gemini/gemini.service";
import { Project } from "@/services/project/project";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";

type ToolMode = "audio" | "readImage" | "generateImage" | null;

interface IaToolsProps {
  visible: boolean;
  onClose: () => void;
  project?: Project;
}

const { width } = Dimensions.get("window");

export default function IaToolsModal({ visible, onClose }: IaToolsProps) {
  const [mode, setMode] = useState<ToolMode>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [fadeAnim] = useState(new Animated.Value(0));

  const geminiService = new GeminiService();

  // Animação de entrada
  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // === Áudio ===
  async function requestAudioPermissions() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Permita o acesso ao microfone para usar esta funcionalidade."
      );
      return false;
    }
    return true;
  }

  async function startRecording() {
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) return;

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
      setRecordingDuration(0);

      // Timer para duração da gravação
      const timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível iniciar a gravação.");
      console.error(error);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setIsRecording(false);
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (uri) setAudioUri(uri);
      setRecording(null);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível parar a gravação.");
      console.error(error);
    }
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  // === Imagem ===
  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos acessar sua galeria para selecionar imagens."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
      console.error(error);
    }
  }

  // === Ações ===
  async function handleExecute() {
    if (!mode) return;

    try {
      setIsLoading(true);
      let result;

      if (mode === "generateImage") {
        if (!prompt.trim()) {
          Alert.alert(
            "Prompt necessário",
            "Descreva com detalhes o que deseja gerar."
          );
          return;
        }
        result = await geminiService.transcribeImage(prompt);
      }

      if (mode === "readImage" && imageUri) {
        result = await geminiService.transcribeImage(imageUri);
      }

      if (mode === "audio" && audioUri) {
        result = await geminiService.transcribeAudio(audioUri);
      }

      Alert.alert("Sucesso", "Operação concluída com sucesso!", [
        { text: "OK", onPress: resetAll },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Erro",
        "Falha ao processar a operação. Verifique sua conexão e tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function resetAll() {
    setMode(null);
    setAudioUri(null);
    setImageUri(null);
    setPrompt("");
    setRecording(null);
    setIsRecording(false);
    setRecordingDuration(0);
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
  }

  function handleClose() {
    if (isRecording) {
      Alert.alert(
        "Gravação em andamento",
        "Deseja realmente sair? A gravação atual será perdida.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sair",
            onPress: () => {
              resetAll();
              onClose();
            },
          },
        ]
      );
    } else {
      resetAll();
      onClose();
    }
  }

  const canExecute =
    mode &&
    ((mode === "generateImage" && prompt.trim()) ||
      (mode === "readImage" && imageUri) ||
      (mode === "audio" && audioUri));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="sparkles" size={24} color="#007AFF" />
              <Text style={styles.title}>Assistente de I.A.</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Seletor de Modo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Escolha uma ferramenta</Text>
              <View style={styles.modeSelector}>
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    mode === "audio" && styles.modeCardActive,
                  ]}
                  onPress={() => setMode("audio")}
                >
                  <View
                    style={[
                      styles.modeIconContainer,
                      mode === "audio" && styles.modeIconActive,
                    ]}
                  >
                    <Ionicons
                      name="mic"
                      size={24}
                      color={mode === "audio" ? "#007AFF" : "#6B7280"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.modeCardText,
                      mode === "audio" && styles.modeCardTextActive,
                    ]}
                  >
                    Gravar Áudio
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    mode === "readImage" && styles.modeCardActive,
                  ]}
                  onPress={() => setMode("readImage")}
                >
                  <View
                    style={[
                      styles.modeIconContainer,
                      mode === "readImage" && styles.modeIconActive,
                    ]}
                  >
                    <Ionicons
                      name="image"
                      size={24}
                      color={mode === "readImage" ? "#007AFF" : "#6B7280"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.modeCardText,
                      mode === "readImage" && styles.modeCardTextActive,
                    ]}
                  >
                    Ler Imagem
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    mode === "generateImage" && styles.modeCardActive,
                  ]}
                  onPress={() => setMode("generateImage")}
                >
                  <View
                    style={[
                      styles.modeIconContainer,
                      mode === "generateImage" && styles.modeIconActive,
                    ]}
                  >
                    <Ionicons
                      name="color-palette"
                      size={24}
                      color={mode === "generateImage" ? "#007AFF" : "#6B7280"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.modeCardText,
                      mode === "generateImage" && styles.modeCardTextActive,
                    ]}
                  >
                    Gerar Imagem
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Seção dinâmica */}
            {mode && (
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>
                  {mode === "audio" && "Gravar Áudio"}
                  {mode === "readImage" && "Analisar Imagem"}
                  {mode === "generateImage" && "Criar Imagem"}
                </Text>

                {mode === "audio" && (
                  <View style={styles.audioSection}>
                    <View style={styles.audioControls}>
                      <TouchableOpacity
                        style={[
                          styles.recordButton,
                          isRecording && styles.recordButtonActive,
                        ]}
                        onPress={isRecording ? stopRecording : startRecording}
                      >
                        <Ionicons
                          name={isRecording ? "stop" : "mic"}
                          size={28}
                          color="#fff"
                        />
                        <Text style={styles.recordButtonText}>
                          {isRecording ? "Parar" : "Gravar"}
                        </Text>
                      </TouchableOpacity>

                      {isRecording && (
                        <View style={styles.recordingInfo}>
                          <View style={styles.recordingDot} />
                          <Text style={styles.recordingTimer}>
                            {formatTime(recordingDuration)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {audioUri && !isRecording && (
                      <View style={styles.audioPreview}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#10B981"
                        />
                        <Text style={styles.audioPreviewText}>
                          Áudio pronto para processamento
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {mode === "readImage" && (
                  <View style={styles.imageSection}>
                    <TouchableOpacity
                      style={styles.imagePickerButton}
                      onPress={pickImage}
                    >
                      <Ionicons name="cloud-upload" size={32} color="#007AFF" />
                      <Text style={styles.imagePickerText}>
                        Selecionar da Galeria
                      </Text>
                      <Text style={styles.imagePickerSubtext}>
                        Toque para escolher uma imagem
                      </Text>
                    </TouchableOpacity>

                    {imageUri && (
                      <View style={styles.imagePreviewContainer}>
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.imagePreview}
                        />
                        <TouchableOpacity
                          style={styles.imageRemoveButton}
                          onPress={() => setImageUri(null)}
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {mode === "generateImage" && (
                  <View style={styles.promptSection}>
                    <TextInput
                      label="Descreva a imagem que deseja criar..."
                      mode="outlined"
                      value={prompt}
                      onChangeText={setPrompt}
                      style={styles.textInput}
                      multiline
                      numberOfLines={4}
                      outlineColor="#E5E7EB"
                      activeOutlineColor="#007AFF"
                    />
                    <Text style={styles.promptHint}>
                      Seja específico e detalhado para melhores resultados
                    </Text>
                  </View>
                )}

                {/* Botão de Execução */}
                <TouchableOpacity
                  style={[
                    styles.executeButton,
                    (!canExecute || isLoading) && styles.executeButtonDisabled,
                  ]}
                  disabled={!canExecute || isLoading}
                  onPress={handleExecute}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="flash" size={20} color="#fff" />
                  )}
                  <Text style={styles.executeText}>
                    {isLoading ? "Processando..." : "Executar"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  contentSection: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  modeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modeCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "transparent",
  },
  modeCardActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#007AFF",
  },
  modeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  modeIconActive: {
    backgroundColor: "#DBEAFE",
  },
  modeCardText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  modeCardTextActive: {
    color: "#007AFF",
  },
  audioSection: {
    gap: 16,
  },
  audioControls: {
    alignItems: "center",
    gap: 12,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    minWidth: 140,
  },
  recordButtonActive: {
    backgroundColor: "#EF4444",
  },
  recordButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  recordingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  recordingTimer: {
    color: "#6B7280",
    fontWeight: "500",
  },
  audioPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  audioPreviewText: {
    color: "#065F46",
    fontWeight: "500",
  },
  imageSection: {
    gap: 16,
  },
  imagePickerButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  imageRemoveButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  promptSection: {
    gap: 8,
  },
  textInput: {
    backgroundColor: "#fff",
  },
  promptHint: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  executeButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  executeButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  executeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
