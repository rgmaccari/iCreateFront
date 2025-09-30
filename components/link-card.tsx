import { Link } from "@/services/link/link";
import { FontAwesome } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LinkCardProps {
    links: Link[];
    refresh: () => void; // Função para recarregar lista
    onDelete: (code: number) => void; // Método enviado da tela
    onEdit: (link: Link) => void; // Método enviado da tela
}

export default function LinkCard({ links, refresh, onDelete, onEdit }: LinkCardProps) {
    const onClickLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Erro ao abrir link:", err));
    };

    const handleCopy = async (url: string) => {
        console.log("url copiada ", url)
        await Clipboard.setStringAsync(url);
        Alert.alert('Link copiado!');
    };

    if (!links || links.length === 0) {
        return (
            <View style={styles.noLinkCard}>
                <Text style={styles.noLinkText}>Seus links aparecerão aqui!</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {links.map((link, index) => {
                const hasImage = !!link.previewImageUrl;
                return (
                    <View key={index} style={styles.linkCard}>
                        <TouchableOpacity style={{ flex: 1, alignItems: "center" }} onPress={() => onClickLink(link.url!)} onLongPress={() => onDelete(link.code)}>
                            {hasImage ? (
                                <Image source={{ uri: link.previewImageUrl }} style={styles.linkImage} />
                            ) : (
                                <View style={[styles.linkImage, styles.placeholder]}>
                                    <FontAwesome name="file-image-o" size={40} color="#362946" />
                                </View>
                            )}
                            <Text style={styles.linkTitle}>{link.title}</Text>
                        </TouchableOpacity>

                        {/* Ícone editar */}
                        <View style={styles.options}>
                            <TouchableOpacity style={{ marginTop: 8 }} onPress={() => onEdit(link)}>
                                <FontAwesome name="pencil" size={20} color="#362946" />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginTop: 8 }} onPress={() => handleCopy(link.url!)}>
                                <FontAwesome name="copy" size={20} color="#362946" />
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 10
    },
    linkCard: {
        width: "48%",
        borderRadius: 10,
        backgroundColor: "#EBE1F6",
        padding: 10,
        marginBottom: 12,
        alignItems: "center"
    },
    linkImage: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 10,
        marginBottom: 8,
        resizeMode: "cover"
    },
    placeholder: {
        backgroundColor: "#ccc",
        justifyContent: "center",
        alignItems: "center"
    },
    linkTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#362946",
        textAlign: "center"
    },
    noLinkCard: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#EBE1F6",
        alignItems: "center"
    },
    noLinkText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#362946"
    },
    options: {
        alignItems: "flex-start"
    }
});
