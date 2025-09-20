import { useImagePicker } from "@/hooks/use-image-picker";
import { UserDto } from "@/services/user/user.update.dto";
import React, { useEffect, useState } from "react";
import { Button, Image, StyleSheet, TextInput, View } from "react-native";

interface UpdateUserFormProps {
    onSubmit: (data: UserDto) => void;
}

export default function UserForm({ onSubmit }: UpdateUserFormProps) {
    const { image, pickImage } = useImagePicker();

    const [form, setForm] = useState<UserDto>({
        name: "",
        nickname: "",
        password: "",
        avatar: null,
    });

    useEffect(() => {
        if (image) {
            setForm(prev => ({
                ...prev,
                avatar: {
                    uri: image.uri,
                    name: image.name,
                    mimeType: image.mimeType
                }
            }))
        }
    }, [image])

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Apelido"
                value={form.nickname}
                onChangeText={(text) => setForm({ ...form, nickname: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
            />

            <Button title="Selecionar imagem" onPress={pickImage} />
            {form.avatar && (
                <Image source={{ uri: form.avatar.uri }} style={styles.preview} />
            )}

            <Button title="Salvar" onPress={() => onSubmit(form)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginVertical: 8,
        borderRadius: 5,
    },
    preview: {
        width: 100,
        height: 100,
        marginVertical: 10,
        borderRadius: 10,
    },
});


/**
 * 
 * 
 * router.push("/update-user")
➝ Empilha uma nova tela na navegação.
➝ O usuário pode voltar para a tela anterior com o botão "back".
➝ Ideal para "fluxos de formulário" ou edição de dados, onde você quer permitir voltar.

router.replace("/update-user")
➝ Substitui a tela atual pela nova.
➝ O botão "back" não volta para a tela antiga.
➝ Útil para login/logout, onboarding etc.

router.navigate("/update-user")
➝ Parecido com push, mas se a tela já existir na pilha, ele apenas foca nela (não cria outra instância).
➝ Bom para evitar múltiplas instâncias da mesma tela.
 */