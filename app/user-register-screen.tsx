import UserForm from "@/components/user-update-form";
import { showToast } from "@/constants/showToast";
import { AuthService } from "@/services/api/auth.service";
import { UserService } from "@/services/user/user.service";
import { UserDto } from "@/services/user/user.update.dto";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserRegisterScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState(AuthService.getUser());

    const create = async (formData: FormData) => {
        try {
            const user = await UserService.create(formData);
            setUserData(user);
            showToast("success", "Sucesso", "Usuário criado com sucesso!");
            router.replace("/main/project/all-projects-screen");
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
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={handleReturn} style={styles.backButton}>
                <Feather name="arrow-left" size={28} color="#555" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.welcomeText}>Seja bem vindo ao ICreate!</Text>  
                <UserForm
                  onSubmit={handleSubmit}
                  hasUser={!!userData}
                onDelete={userData ? () => deleteUser(userData.code) : undefined}/>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f0faff",
  },
  backButton: {
        position: "absolute",
        top: 60,
        left: 24,
        zIndex: 10,
  },
  scrollContainer: {
        flexGrow: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 120,
        paddingBottom: 50,
  },
    welcomeText: {
        fontSize: 26,
        fontWeight: "500",
        color: "#4A4688",
        marginBottom: 30,
        textAlign: "center",
    },
});