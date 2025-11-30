import { showToast } from "@/constants/showToast";
import { useImagePicker } from "@/hooks/use-image-picker";
import { AuthService } from "@/services/api/auth.service";
import { UserDto } from "@/services/user/user.update.dto";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface UpdateUserFormProps {
  hasUser?: boolean;
  onSubmit: (data: UserDto) => void;
  onDelete?: () => void;
}

//Perguntas de segurança
const SECURITY_QUESTIONS = [
  "Qual o nome do seu primeiro animal de estimação?",
  "Qual o nome da sua cidade natal?",
  "Qual o nome do seu melhor amigo de infância?",
];

export default function UserForm(props: UpdateUserFormProps) {
  const { image, pickImage } = useImagePicker();
  const navigation = useNavigation();

  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    [key: string]: string;
  }>({});

  const [form, setForm] = useState<UserDto>({
    name: "",
    nickname: "",
    password: "",
    avatar: null,
    securityQuestion: "",
    securityAnswer: "",
  });
  const [initialForm, setInitialForm] = useState<UserDto>(form);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState(false);

  // Estados para o dropdown de perguntas de segurança
  const [showQuestionsDropdown, setShowQuestionsDropdown] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");

  //Preencher os ddados existentes (if hasUser)
  useEffect(() => {
    if (props.hasUser) {
      const user = AuthService.getUser();
      if (user) {
        const mapped: UserDto = {
          name: user.name || "",
          nickname: user.nickname || "",
          password: "",
          avatar: user.avatarBase64
            ? {
                uri: user.avatarBase64.startsWith("data:image")
                  ? user.avatarBase64
                  : `data:image/jpeg;base64,${user.avatarBase64}`,
                name: "avatar.jpg",
                mimeType: "image/jpeg",
              }
            : null,
          // Não incluir securityQuestion e securityAnswer para usuário existente
        };
        setForm(mapped);
        setInitialForm(mapped);
        // Se quiser preencher a pergunta selecionada, faça separadamente
        // setSelectedQuestion(user.securityQuestion || "");
      }
    }
  }, [props.hasUser]);

  //Atualizar avatar ao selecionar
  useEffect(() => {
    if (image) {
      setForm((prev) => ({
        ...prev,
        avatar: {
          uri: image.uri,
          name: image.name,
          mimeType: image.mimeType,
        },
      }));
    }
  }, [image]);

  //Detecta alterações no form (como em ProjectScreen)
  useEffect(() => {
    const changed =
      form.name !== initialForm.name ||
      form.nickname !== initialForm.nickname ||
      form.avatar?.uri !== initialForm.avatar?.uri ||
      (!!form.password && form.password !== initialForm.password) ||
      !!passwordForm.newPassword ||
      form.securityQuestion !== initialForm.securityQuestion ||
      form.securityAnswer !== initialForm.securityAnswer;
    setIsDirty(changed);
  }, [form, passwordForm, initialForm]);

  //Bloqueia saída se houver alterações não salvas
  useFocusEffect(
    useCallback(() => {
      if (!props.hasUser) return; //Impedir o alerta no cadastro

      const onBeforeRemove = (e: any) => {
        if (!validateForm()) {
          showToast("info", "Atualização cancelada!");
          return;
        }

        if (!isDirty) return;
        e.preventDefault();
        Alert.alert(
          "Salvar alterações",
          "Deseja salvar as alterações antes de sair?",
          [
            {
              text: "Não",
              onPress: () => {
                setIsDirty(false);
                navigation.dispatch(e.data.action);
              },
            },
            { text: "Sim", onPress: handleSubmit },
            { text: "Cancelar", style: "cancel" },
          ]
        );
      };

      const unsubscribe = navigation.addListener(
        "beforeRemove",
        onBeforeRemove
      );
      return unsubscribe;
    }, [navigation, isDirty, form])
  );

  //Validar form principal
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name?.trim()) newErrors.name = "O nome é obrigatório.";
    if (!form.nickname?.trim()) newErrors.nickname = "O apelido é obrigatório.";
    if (form.name.trim().length < 3)
      newErrors.name = "O nome deve ter pelo menos 3 caracteres.";
    if (form.nickname.trim().length < 3)
      newErrors.nickname = "O apelido deve ter pelo menos 3 caracteres.";

    if (!props.hasUser) {
      if (!form.password?.trim()) newErrors.password = "A senha é obrigatória.";
      if (form.password && form.password.length < 6)
        newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
      if (form.password !== confirmPassword)
        newErrors.confirmPassword = "As senhas não coincidem.";

      // Validação das perguntas de segurança apenas para novo usuário
      if (!form.securityQuestion?.trim())
        newErrors.securityQuestion = "Pergunta de segurança é obrigatória!";
      if (!form.securityAnswer?.trim() || form.securityAnswer.length < 3)
        newErrors.securityAnswer = "Resposta de segurança inválida!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //Validar alteração de senha
  const validatePasswordForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!passwordForm.newPassword.trim())
      newErrors.newPassword = "Nova senha é obrigatória";
    if (passwordForm.newPassword.length < 6)
      newErrors.newPassword = "Senha deve ter pelo menos 6 caracteres";
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword)
      newErrors.confirmNewPassword = "As senhas não coincidem";
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      props.onSubmit({
        ...form,
        password: passwordForm.newPassword || form.password,
      });
      setIsDirty(false);
    }
  };

  const handlePasswordChange = () => {
    if (validatePasswordForm()) {
      setForm((prev) => ({ ...prev, password: passwordForm.newPassword }));
      setChangePasswordModal(false);
      setPasswordForm({ newPassword: "", confirmNewPassword: "" });
      setPasswordErrors({});
      setIsDirty(true);
    }
  };

  const handleFieldChange = (field: keyof UserDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePasswordFieldChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field])
      setPasswordErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Função para selecionar uma pergunta de segurança
  const handleSelectQuestion = (question: string) => {
    setSelectedQuestion(question);
    setForm((prev) => ({ ...prev, securityQuestion: question }));
    setShowQuestionsDropdown(false);
    if (errors.securityQuestion)
      setErrors((prev) => ({ ...prev, securityQuestion: "" }));
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formArea}>
              <View style={styles.imageContainer}>
                <TouchableOpacity onPress={pickImage}>
                  {form.avatar ? (
                    <Image
                      source={{ uri: form.avatar.uri }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.placeholder}>
                      <FontAwesome name="user" size={100} color={"#3d3968ff"} />
                      <View style={styles.textOverlay}>
                        <Text style={styles.placeholderText}>
                          Selecione sua foto
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Nome"
                value={form.name}
                onChangeText={(t) => handleFieldChange("name", t)}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              <TextInput
                style={[styles.input, errors.nickname && styles.inputError]}
                placeholder="Apelido"
                value={form.nickname}
                autoCapitalize="none"
                onChangeText={(t) => handleFieldChange("nickname", t)}
              />
              {errors.nickname && (
                <Text style={styles.errorText}>{errors.nickname}</Text>
              )}

              {!props.hasUser && (
                <>
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Senha"
                    secureTextEntry
                    autoCapitalize="none"
                    value={form.password}
                    onChangeText={(t) => handleFieldChange("password", t)}
                  />
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}

                  <TextInput
                    style={[
                      styles.input,
                      errors.confirmPassword && styles.inputError,
                    ]}
                    placeholder="Confirmar senha"
                    secureTextEntry
                    autoCapitalize="none"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  )}

                  {/* Dropdown de Perguntas de Segurança */}
                  <View style={styles.securitySection}>
                    <Text style={styles.sectionLabel}>
                      Pergunta de Segurança
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.dropdownButton,
                        errors.securityQuestion && styles.inputError,
                      ]}
                      onPress={() =>
                        setShowQuestionsDropdown(!showQuestionsDropdown)
                      }
                    >
                      <Text
                        style={
                          selectedQuestion
                            ? styles.dropdownText
                            : styles.dropdownPlaceholder
                        }
                      >
                        {selectedQuestion ||
                          "Selecione uma pergunta de segurança"}
                      </Text>
                      <FontAwesome
                        name={
                          showQuestionsDropdown ? "chevron-up" : "chevron-down"
                        }
                        size={16}
                        color="#666"
                      />
                    </TouchableOpacity>
                    {errors.securityQuestion && (
                      <Text style={styles.errorText}>
                        {errors.securityQuestion}
                      </Text>
                    )}

                    {/* Dropdown de perguntas */}
                    {showQuestionsDropdown && (
                      <View style={styles.dropdownList}>
                        {SECURITY_QUESTIONS.map((question, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => handleSelectQuestion(question)}
                          >
                            <Text style={styles.dropdownItemText}>
                              {question}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Campo de resposta */}
                    <TextInput
                      style={[
                        styles.input,
                        errors.securityAnswer && styles.inputError,
                      ]}
                      placeholder="Resposta de segurança"
                      value={form.securityAnswer}
                      onChangeText={(t) =>
                        handleFieldChange("securityAnswer", t)
                      }
                    />
                    {errors.securityAnswer && (
                      <Text style={styles.errorText}>
                        {errors.securityAnswer}
                      </Text>
                    )}
                  </View>
                </>
              )}

              {props.hasUser && (
                <TouchableOpacity
                  style={styles.changePasswordButton}
                  onPress={() => setChangePasswordModal(true)}
                >
                  <FontAwesome
                    name="lock"
                    size={16}
                    color="#9191d8ff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.changePasswordText}>Alterar Senha</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>
                  {props.hasUser ? "Salvar Alterações" : "Cadastrar"}
                </Text>
              </TouchableOpacity>
            </View>

            {props.hasUser && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={props.onDelete}
              >
                <FontAwesome
                  name="trash"
                  size={18}
                  color="#a33"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.deleteText}>Excluir conta</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modal Alterar Senha */}
      <Modal
        visible={changePasswordModal}
        animationType="slide"
        transparent
        onRequestClose={() => setChangePasswordModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setChangePasswordModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Alterar Senha</Text>

                <TextInput
                  style={[
                    styles.input,
                    passwordErrors.newPassword && styles.inputError,
                  ]}
                  placeholder="Nova senha"
                  secureTextEntry
                  value={passwordForm.newPassword}
                  onChangeText={(t) =>
                    handlePasswordFieldChange("newPassword", t)
                  }
                />
                {passwordErrors.newPassword && (
                  <Text style={styles.errorText}>
                    {passwordErrors.newPassword}
                  </Text>
                )}

                <TextInput
                  style={[
                    styles.input,
                    passwordErrors.confirmNewPassword && styles.inputError,
                  ]}
                  placeholder="Confirmar nova senha"
                  secureTextEntry
                  value={passwordForm.confirmNewPassword}
                  onChangeText={(t) =>
                    handlePasswordFieldChange("confirmNewPassword", t)
                  }
                />
                {passwordErrors.confirmNewPassword && (
                  <Text style={styles.errorText}>
                    {passwordErrors.confirmNewPassword}
                  </Text>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setChangePasswordModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handlePasswordChange}
                  >
                    <Text style={styles.confirmButtonText}>Alterar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: { flexGrow: 1, padding: 20 },
  formArea: { flexGrow: 1 },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E8DCCE",
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
  },
  inputError: { borderColor: "#ff3b30" },
  errorText: { color: "#ff3b30", fontSize: 12, marginBottom: 8 },
  imageContainer: { alignItems: "center", marginVertical: 16 },
  profileImage: { width: 140, height: 140, borderRadius: 10 },
  placeholder: {
    width: 140,
    height: 140,
    borderRadius: 10,
    backgroundColor: "#9191d8ff",
    justifyContent: "center",
    alignItems: "center",
  },
  textOverlay: {
    position: "absolute",
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  placeholderText: { color: "white", fontSize: 12, textAlign: "center" },
  button: {
    backgroundColor: "#9191d8ff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8DCCE",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  changePasswordText: { color: "#9191d8ff", fontSize: 15, fontWeight: "500" },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e6d3d3ff",
    borderColor: "#ccc",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  deleteText: { color: "#a33", fontSize: 15, fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelButtonText: { color: "#666", fontSize: 16, fontWeight: "500" },
  confirmButton: { backgroundColor: "#9191d8ff" },
  confirmButtonText: { color: "white", fontSize: 16, fontWeight: "500" },
  // Estilos para a seção de segurança
  securitySection: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E8DCCE",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: "#999",
    flex: 1,
  },
  dropdownList: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E8DCCE",
    borderRadius: 10,
    marginBottom: 8,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },
});
