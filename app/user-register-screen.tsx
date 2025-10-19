import PageHeader from "@/components/page-header";
import UserForm from "@/components/user-form";
import { showToast } from "@/constants/showToast";
import { AuthService } from "@/services/api/auth.service";
import { UserService } from "@/services/user/user.service";
import { UserDto } from "@/services/user/user.update.dto";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserRegisterScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState(AuthService.getUser());

    const create = async (formData: FormData) => {
        try {
            await UserService.create(formData); //Não atualiza userData aqui
            showToast("success", "Sucesso", "Usuário criado com sucesso!");
            router.replace("/main/user/user-screen"); //Navega sem atualizar userData localmente
        } catch (err) {
            console.error("Erro ao criar usuário:", err);
            showToast("error", "Erro", "Falha ao criar usuário.");
        }
    };

    const update = async (formData: FormData) => {
        try {
            if (!userData) return;
            const updatedUser = await UserService.update(userData.code!, formData);
            setUserData(updatedUser);
            showToast("success", "Sucesso", "Usuário atualizado com sucesso!");
            router.back();
        } catch (err) {
            console.error("Erro ao atualizar usuário:", err);
            showToast("error", "Erro", "Falha ao atualizar usuário.");
        }
    };

    const deleteUser = (userCode: number) => {
        Alert.alert(
            "Excluir o usuário",
            "Deseja realmente excluir o usuário?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const code = userData!.code;
                            await UserService.delete(code);
                            AuthService.logout();
                            showToast("success", "Sucesso", "Usuário excluído com sucesso!");
                            router.navigate('/login');
                        } catch (err) {
                            console.error("Erro ao excluir usuário:", err);
                            showToast("error", "Erro", "Falha ao excluir usuário.");
                        }
                    },
                },
            ]
        );
    };

    const handleSubmit = async (form: UserDto) => {
        if (!form.name?.trim() || !form.nickname?.trim() || (!userData && !form.password?.trim())) {
            Alert.alert("Erro", "Preencha todos os campos obrigatórios");
            return;
        }

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
            await update(formData);
        } else {
            await create(formData);
        }
    };

    const handleReturn = async () => {
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f0faff" }}>
            <PageHeader title="Cadastro" onBack={handleReturn} />
            <Text style={styles.welcomeText}>Seja bem vindo!</Text>
            <UserForm
                onSubmit={handleSubmit}
                hasUser={!!userData}
                onDelete={userData ? () => deleteUser(userData.code) : undefined}
            />
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f2f0faff",
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: "light",
        color: "#333",
        marginTop: 35,
        marginBottom: 15,
        textAlign: "center",
    },
});