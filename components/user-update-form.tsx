import { useImagePicker } from "@/hooks/use-image-picker";
import { User } from "@/services/user/user";
import { UserDto } from "@/services/user/user.update.dto";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface UpdateUserFormProps {
  hasUser?: boolean;
  onSubmit: (data: UserDto) => void;
  onDelete?: () => void;
  initialData?: User | null;
}

const securityQuestions = [
  { id: 1, question: "Qual o nome do seu primeiro animal de estimação?" },
  { id: 2, question: "Qual a sua cidade natal?" },
  { id: 3, question: "Qual o nome da sua mãe?" },
];

export default function UserForm(props: UpdateUserFormProps) {
  const { image, pickImage } = useImagePicker();

  const [form, setForm] = useState<UserDto>({
    name: "",
    nickname: "",
    password: "",
    securityAnswers: "",
    avatar: null,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [answers, setAnswers] = useState<{ [key: number]: string }>({
    1: "",
    2: "",
    3: "",
  });

  const [isSecurityVisible, setIsSecurityVisible] = useState(false);

  useEffect(() => {

    if (props.hasUser && props.initialData) {
      setForm(prev => ({
        ...prev,
        name: props.initialData?.name || "",
        nickname: props.initialData?.nickname || "",
        password: "",
        avatar: (props.initialData?.avatarBase64 && props.initialData?.avatarMimeType) ? {
          uri: `data:${props.initialData.avatarMimeType};base64,${props.initialData.avatarBase64}`,
          name: 'avatar.jpg',
          mimeType: props.initialData.avatarMimeType
        } : null
      }));
    }
  }, [props.hasUser, props.initialData]);


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

  const handleAnswerChange = (id: number, text: string) => {
    setAnswers(prev => ({ ...prev, [id]: text }));
    if (errors[`answer${id}`]) {
      setErrors((prev) => ({ ...prev, [`answer${id}`]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.name?.trim()) newErrors.name = "Nome é obrigatório";
    if (!form.nickname?.trim()) newErrors.nickname = "Apelido é obrigatório";

    if (!props.hasUser) {
      if (!form.password?.trim()) newErrors.password = "Senha é obrigatória";
      if (form.password && form.password.length < 6)
        newErrors.password = "Senha deve ter pelo menos 6 caracteres";
      if (form.password !== confirmPassword)
        newErrors.confirmPassword = "As senhas não coincidem";
      if (!answers[1]?.trim()) newErrors.answer1 = "Resposta 1 é obrigatória";
      if (!answers[2]?.trim()) newErrors.answer2 = "Resposta 2 é obrigatória";
      if (!answers[3]?.trim()) newErrors.answer3 = "Resposta 3 é obrigatória";

    } else if (props.hasUser && form.password) {
      if (form.password.length < 6)
        newErrors.password = "Nova senha deve ter pelo menos 6 caracteres";
      if (form.password !== confirmPassword)
        newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = () => {
    if (!props.hasUser && (!answers[1] || !answers[2] || !answers[3])) {
      if (!isSecurityVisible) {
        Alert.alert(
          "Perguntas Pendentes",
          "Por favor, responda as perguntas de segurança para criar sua conta."
        );
        setIsSecurityVisible(true);
        validateForm();
        return;
      }
    }

    if (validateForm()) {
      let finalSecurityAnswers = "";
      if (!props.hasUser) {
        finalSecurityAnswers = JSON.stringify(answers);
      }

      props.onSubmit({
        ...form,
        securityAnswers: finalSecurityAnswers,
      });
    } else {
      Alert.alert("Campos Incompletos", "Por favor, verifique todos os campos obrigatórios.");
    }
  };

  const handleFieldChange = (field: keyof UserDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <View style={styles.formContainer}>

      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImage}>
          {form.avatar ? (
            <Image
              source={{ uri: form.avatar.uri }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="camera" size={50} color="#888" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.imagePlaceholderText}>SELECIONE A IMAGEM</Text>
      </View>

      <View style={[styles.inputContainer, errors.name && styles.inputError]}>
        <Feather name="user" size={20} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Digite o seu nome"
          placeholderTextColor="#7A7A7A"
          value={form.name}
          onChangeText={(text) => handleFieldChange("name", text)}
        />
      </View>
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <View
        style={[styles.inputContainer, errors.nickname && styles.inputError]}
      >
        <Feather name="user" size={20} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Digite o seu Apelido"
          placeholderTextColor="#7A7A7A"
          value={form.nickname}
          onChangeText={(text) => handleFieldChange("nickname", text)}
        />
      </View>
      {errors.nickname && <Text style={styles.errorText}>{errors.nickname}</Text>}

      <View
        style={[styles.inputContainer, errors.password && styles.inputError]}
      >
        <Feather name="lock" size={20} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={props.hasUser ? "Nova Senha (opcional)" : "Digite a senha"}
          placeholderTextColor="#7A7A7A"
          secureTextEntry
          value={form.password}
          onChangeText={(text) => handleFieldChange("password", text)}
        />
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {(!props.hasUser || (props.hasUser && form.password.length > 0)) && (
        <>
          <View
            style={[
              styles.inputContainer,
              errors.confirmPassword && styles.inputError,
            ]}
          >
            <Feather name="lock" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              placeholderTextColor="#7A7A7A"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
            />
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </>
      )}

      {!props.hasUser && (
        <>
          <TouchableOpacity
            style={styles.sectionTitleContainer}
            onPress={() => setIsSecurityVisible(!isSecurityVisible)}
          >
            <Text style={styles.sectionTitle}>Perguntas de Segurança</Text>
            <Feather
              name={isSecurityVisible ? "chevron-up" : "chevron-down"}
              size={20}
              color="#4A4688"
            />
          </TouchableOpacity>
          {isSecurityVisible && (
            <View style={styles.securityQuestionsContainer}>
              {securityQuestions.map((q) => (
                <View key={q.id} style={styles.questionContainer}>
                  <Text style={styles.questionText}>{q.question}</Text>
                  <View style={[styles.inputContainer, errors[`answer${q.id}`] && styles.inputError]}>
                    <Feather name="shield" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Sua resposta"
                      placeholderTextColor="#7A7A7A"
                      value={answers[q.id]}
                      onChangeText={(text) => handleAnswerChange(q.id, text)}
                    />
                  </View>
                  {errors[`answer${q.id}`] && <Text style={styles.errorText}>{errors[`answer${q.id}`]}</Text>}
                </View>
              ))}
            </View>
          )}
        </>
      )}


      <TouchableOpacity
        style={[
          styles.button,
          (!form.name?.trim() ||
            !form.nickname?.trim() ||
            (!props.hasUser && !form.password?.trim())) &&
          styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>{props.hasUser ? "ATUALIZAR" : "CRIAR CONTA"}</Text>
      </TouchableOpacity>


      {props.hasUser && props.onDelete && (
        <Button title="Deletar Usuário" onPress={props.onDelete} color="red" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 10,
    marginBottom: 20,
    color: "#4A4688",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8DCCE",
    borderRadius: 10,
    marginBottom: 16,
  },
  inputIcon: {
    paddingLeft: 15,
    paddingRight: 10,
    color: "#505063",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 15,
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderColor: "#ff3b30",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
    width: "100%",
  },
  button: {
    backgroundColor: "#9191d8ff",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fdfdfdff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
    borderTopWidth: 1,
    borderColor: '#E8DCCE',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4688',
  },
  securityQuestionsContainer: {
    width: '100%',
  },
  questionContainer: {
    width: '100%',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  }
});