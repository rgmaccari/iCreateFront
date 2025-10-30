import { useImagePicker } from "@/hooks/use-image-picker";
import { UserDto } from "@/services/user/user.update.dto";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


interface UpdateUserFormProps {
    hasUser?: boolean;
    onSubmit: (data: UserDto) => void;
    onDelete?: () => void;
}

export default function UserForm(props: UpdateUserFormProps) {
    const { image, pickImage } = useImagePicker();

    const [form, setForm] = useState<UserDto>({
        name: "",
        nickname: "",
        password: "",
        avatar: null,
    });
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) props.onSubmit(form);
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
       {errors.nickname && < Text style={styles.errorText}>{errors.nickname}</Text>}

      
      <View
        style={[styles.inputContainer, errors.password && styles.inputError]}
      >
       
        <Feather name="lock" size={20} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Digite a senha"
          placeholderTextColor="#7A7A7A"
          secureTextEntry
          value={form.password}
          onChangeText={(text) => handleFieldChange("password", text)}
        />
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      
      {!props.hasUser && (
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

      
      <TouchableOpacity
        style={[
          styles.button,
          (!form.name?.trim() ||
            !form.nickname?.trim() ||
            (!props.hasUser && !form.password?.trim())) &&
            styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={
          !form.name?.trim() ||
          !form.nickname?.trim() ||
          (!props.hasUser && !form.password?.trim())
        }
      >
        
        <Text style={styles.buttonText}>CRIAR CONTA</Text>
      </TouchableOpacity>

      {props.hasUser && (
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
  
});