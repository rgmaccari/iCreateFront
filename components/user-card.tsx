import { FontAwesome } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { User } from "../services/user/user";

interface UserCardProps {
    user: User;
    onLogout: () => void;
}

// Converte buffer (número[]) em Base64
const bufferToBase64 = (buffer: number[] | string): string => {
    if (typeof buffer === "string") return buffer; // já é Base64
    let binary = "";
    const chunkSize = 0x8000; // evita estouro de stack em buffers grandes
    for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.slice(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return global.btoa(binary);
};

export default function UserCard({ user, onLogout }: UserCardProps) {
    let avatarUri: string | null = null;

    if (user.avatarBase64 && user.avatarMimeType) {
        const base64 = bufferToBase64(user.avatarBase64 as any);
        avatarUri = `data:${user.avatarMimeType};base64,${base64}`;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    {avatarUri ? (
                        <Image
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                            source={{ uri: avatarUri }}
                        />
                    ) : (
                        <FontAwesome name="user" size={32} color="#ffff" />
                    )}
                </View>

                <Text style={styles.greeting}>Olá, {user.nickname}!</Text>

                <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
                    <FontAwesome name="sign-out" size={24} color="#362946" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginVertical: 20,
        backgroundColor: "#EBE1F6",
        paddingHorizontal: 20,
        padding: 10,
        borderRadius: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 30,
        backgroundColor: "#362946",
        justifyContent: "center",
        alignItems: "center",
    },
    greeting: {
        flex: 1,
        fontSize: 20,
        fontWeight: "bold",
        color: "#362946",
        marginLeft: 15,
    },
    logoutButton: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: "#D9CEE8",
        justifyContent: "center",
        alignItems: "center",
    },
});
