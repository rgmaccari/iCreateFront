import UserForm from "@/components/user-update-form";
import { AuthService } from "@/services/api/auth.service";
import { UserService } from "@/services/user/user.service";
import { UserDto } from "@/services/user/user.update.dto";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserRegisterScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState(AuthService.getUser());

    const create = async (formData: FormData) => {
        try {
            const user = await UserService.create(formData);
            setUserData(user);
            router.back();
        } catch (err) {
            console.error("Erro ao criar usuário:", err);
        }
    };

    const update = async (formData: FormData) => {
        try {
            if (!userData) return;
            const updatedUser = await UserService.update(userData.code!, formData);
            setUserData(updatedUser);
            router.back();
        } catch (err) {
            console.error("Erro ao atualizar usuário:", err);
        }
    };


    const handleSubmit = async (form: UserDto) => {
        const formData = new FormData();

        if (form.name) formData.append("name", form.name);
        if (form.nickname) formData.append("nickname", form.nickname);
        if (form.password) formData.append("password", form.password);

        if (form.avatar) {
            formData.append("avatar", {
                uri: form.avatar.uri,
                type: form.avatar.mimeType,
                name: form.avatar.name,
            } as any);
        }

        if (userData) {
            update(formData);
        } else {
            create(formData);
        }
    };


    const deleteUser = (userCode: number) => {
        Alert.alert(
            "Excluir o usuário",
            "Deseja realmente excluir o usuário?",
            [{ text: "Cancelar", style: "cancel" },
            {
                text: "Excluir", style: "destructive", onPress: async () => {
                    try {
                        const code = userData!.code;
                        await UserService.delete(code);
                        AuthService.logout()
                        router.navigate('/login');
                    } catch (err) {
                        console.error("Erro ao usuário projeto:", err);
                    }
                }
            }
            ]
        )



    }

    return (
        <SafeAreaView style={styles.container}>
            <UserForm onSubmit={handleSubmit} hasUser={!!userData} onDelete={userData ? () => deleteUser(userData.code) : undefined}></UserForm>

            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>

        </SafeAreaView>


    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    button: {
        marginTop: 20,
        backgroundColor: "#362946",
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
