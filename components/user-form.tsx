import { useImagePicker } from "@/hooks/use-image-picker";
import { UserDto } from "@/services/user/user.update.dto";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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
        <View style={styles.container}>
            <View style={styles.formArea}>
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        {form.avatar ? (
                            <Image source={{ uri: form.avatar.uri }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.placeholder}>
                                <FontAwesome name="user" size={100} color={"#3d3968ff"} />
                                <View style={styles.textOverlay}>
                                    <Text style={styles.placeholderText}>Selecione sua foto</Text>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        placeholder="Nome"
                        maxLength={30}
                        value={form.name}
                        onChangeText={(text) => handleFieldChange("name", text)}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View>
                    <TextInput
                        style={[styles.input, errors.nickname && styles.inputError]}
                        placeholder="Apelido"
                        maxLength={20}
                        autoCapitalize="none"
                        value={form.nickname}
                        onChangeText={(text) => handleFieldChange("nickname", text)}
                    />
                    {errors.nickname && <Text style={styles.errorText}>{errors.nickname}</Text>}
                </View>

                <View>
                    <TextInput
                        style={[styles.input, errors.password && styles.inputError]}
                        placeholder="Senha"
                        secureTextEntry
                        maxLength={20}
                        autoCapitalize="none"
                        value={form.password}
                        onChangeText={(text) => handleFieldChange("password", text)}
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {!props.hasUser && (
                    <View>
                        <TextInput
                            style={[styles.input, errors.confirmPassword && styles.inputError]}
                            placeholder="Confirmar senha"
                            secureTextEntry
                            maxLength={20}
                            autoCapitalize="none"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword)
                                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                            }}
                        />
                        {errors.confirmPassword && (
                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        )}
                    </View>
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
                    {props.hasUser ? (
                        <Text style={styles.buttonText}>Salvar</Text>
                    ) : (
                        <Text style={styles.buttonText}>Cadastrar</Text>
                    )}
                </TouchableOpacity>
            </View>

            {props.hasUser && (
                <TouchableOpacity style={styles.deleteButton} onPress={props.onDelete}>
                    <FontAwesome name="trash" size={18} color="#a33" style={{ marginRight: 8 }} />
                    <Text style={styles.deleteText}>Excluir conta</Text>
                </TouchableOpacity>
            )}
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: "#f2f0faff",
    },
    formArea: {
        flexGrow: 1,
    },
    input: {
        width: "100%",
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E8DCCE",
        padding: 12,
        marginBottom: 8,
        borderRadius: 10,
        fontSize: 16,
        color: "#333",
    },
    inputError: {
        borderColor: "#ff3b30",
        borderWidth: 1
    },
    errorText: {
        color: "#ff3b30",
        fontSize: 12,
        marginBottom: 12,
        marginLeft: 4
    },
    imageContainer: {
        alignItems: "center",
        marginVertical: 16
    },
    profileImage: {
        width: 140,
        height: 140,
        borderRadius: 10
    },
    placeholder: {
        width: 140,
        height: 140,
        borderRadius: 10,
        backgroundColor: "#9191d8ff",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    textOverlay: {
        position: "absolute",
        bottom: 10,
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    placeholderText: {
        color: "white",
        fontSize: 12,
        fontWeight: "500",
        textAlign: "center",
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
        marginTop: 10,
    },
    buttonDisabled: { backgroundColor: "#ccc" },
    buttonText: {
        color: "#fdfdfdff",
        fontSize: 16,
        fontWeight: "600",
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e6d3d3ff",
        borderColor: "#ccc",
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 10,
        width: "90%",
        alignSelf: "center",
        marginBottom: 25,
    },
    deleteText: {
        color: "#a33",
        fontSize: 15,
        fontWeight: "500",
    },
});

