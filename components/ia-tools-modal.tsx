import { showToast } from "@/constants/showToast";
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

export default function IaToolsModal({ visible, onClose }: IaToolsProps) {
  const [mode, setMode] = useState<ToolMode>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  const [fadeAnim] = useState(new Animated.Value(0));

  const geminiService = new GeminiService();

  //Animação de entrada
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

  //Áudio
  async function requestAudioPermissions() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      showToast("error", "Permissão negada!");
      return false;
    }
    return true;
  }

  //Inicializa
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

      //Timer para duração da gravação
      const timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } catch (error) {
      showToast("error", "Não foi possível iniciar a gravação.");
      console.error(error);
    }
  }

  //Encerra
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
      showToast("error", "Não foi possível iniciar a gravação.");
      console.error(error);
    }
  }

  //Formata o tempo de duração do áudio
  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  //Pega imagem imagem
  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("info", "Permissão necessária!");
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
      showToast("error", "Não foi possível selecionar a imagem.");
      console.error(error);
    }
  }

  //Ações
  async function handleExecute() {
    if (!mode) return;

    try {
      setIsLoading(true);
      let result;

      if (mode === "generateImage") {
        if (!prompt.trim()) {
          showToast("info", "Descreva a imagem!");
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

      showToast("success", "Operação concluída com sucesso!");
    } catch (error: any) {
      console.error(error);
      showToast("error", error.formattedMessage);
    } finally {
      setIsLoading(false);
    }
  }

  //Limpa os campos
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

  //Encerrar
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
            <Ionicons name="sparkles" size={24} color="#d67370" />
            <Text style={styles.title}>Assistente de I.A.</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
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
                      color={mode === "audio" ? "#d67370" : "#6B7280"}
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
                      color={mode === "readImage" ? "#d67370" : "#6B7280"}
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
                      color={mode === "generateImage" ? "#d67370" : "#6B7280"}
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
                          {isRecording ? "Parar Gravação" : "Iniciar Gravação"}
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
                      <Ionicons name="cloud-upload" size={32} color="#d67370" />
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
                      activeOutlineColor="#d67370"
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
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
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
    backgroundColor: "#fffafa",
    borderWidth: 2,
    borderColor: "transparent",
  },
  modeCardActive: {
    backgroundColor: "#fbeae9",
    borderColor: "#d67370",
  },
  modeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  modeIconActive: {
    backgroundColor: "#f8d6d5",
  },
  modeCardText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  modeCardTextActive: {
    color: "#d67370",
  },
  audioSection: {
    gap: 16,
  },
  audioControls: {
    gap: 12,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d67370",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 12,
    gap: 12,
    width: "100%",
  },
  recordButtonActive: {
    backgroundColor: "#c55a57",
  },
  recordButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
  recordingInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#c55a57",
  },
  recordingTimer: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 14,
  },
  audioPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  audioPreviewText: {
    color: "#10B981",
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
    backgroundColor: "#fffafa",
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
    padding: 6,
  },
  promptSection: {
    gap: 8,
  },
  textInput: {
    backgroundColor: "#fffafa",
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
    backgroundColor: "#d67370",
    borderRadius: 12,
    paddingVertical: 18,
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
