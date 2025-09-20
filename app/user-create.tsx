import UserForm from "@/components/user-update-form";
import { UserService } from "@/services/user/user.service";
import { UserDto } from "@/services/user/user.update.dto";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserCreateScreen() {
    const router = useRouter();

    const handleSubmit = async (form: UserDto) => {
        try {
            const formData = new FormData();

            if (form.name) formData.append("name", form.name);
            if (form.nickname) formData.append("nickname", form.nickname);
            if (form.password) formData.append("password", form.password);

            if (form.avatar) {
                formData.append("avatar", {
                    uri: form.avatar.uri,
                    mimeType: form.avatar.mimeType,
                    name: form.avatar.name
                } as any);
            };

            console.log('Enviando dados do formulário:', formData);

            const User = await UserService.create(formData);
            console.log('Usuário criado:', User);
            router.back();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <UserForm
                onSubmit={handleSubmit}></UserForm>

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
