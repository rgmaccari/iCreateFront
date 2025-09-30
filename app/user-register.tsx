import UserForm from "@/components/user-update-form";
import { AuthService } from "@/services/api/auth.service";
import { UserService } from "@/services/user/user.service";
import { UserDto } from "@/services/user/user.update.dto";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserUpdateScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState(AuthService.getUser());

    const create = async (form: UserDto) => {
        try {
            const formData = new FormData();

            if (form.name) formData.append("name", form.name);
            if (form.nickname) formData.append("nickname", form.nickname);
            if (form.password) formData.append("password", form.password);

            if (form.avatar) {
                formData.append("avatar", {
                    uri: form.avatar.uri,
                    type: form.avatar.mimeType,
                    name: form.avatar.name
                } as any);
            };

            const user = await UserService.create(formData);
            setUserData(user);

            router.back();
        } catch (err) {
            console.error('erro aqui ', err);
        }
    }

    const update = async (form: UserDto) => {
        try {
            const formData = new FormData();

            if (form.name) formData.append("name", form.name);
            if (form.nickname) formData.append("nickname", form.nickname);
            if (form.password) formData.append("password", form.password);

            if (form.avatar) {
                formData.append("avatar", {
                    uri: form.avatar.uri,
                    type: form.avatar.mimeType,
                    name: form.avatar.name
                } as any);
            };

            const userCode = userData?.code;
            console.log('usercode', userCode)

            if (userCode) {
                const user = await UserService.update(userCode, formData);
                setUserData(user);
                router.back();
            }
        } catch (err) {
            console.error(err);
            throw new Error("Erro ao atualizar usuário");
        }
    };

    const handleSubmit = async (form: UserDto) => {
        if (userData) {
            update(form);
        } else {
            create(form);
        }
    }

    const deleteUser = async (userCode: number) => {
        const code = userData!.code;
        await UserService.delete(code);
        AuthService.logout()
        router.navigate('/login');
    }

    return (
        <SafeAreaView style={styles.container}>
            <UserForm onSubmit={handleSubmit} hasUser={!!userData} onDelete={() => deleteUser(userData!.code)}></UserForm>

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
