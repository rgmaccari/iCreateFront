import { Link } from "@/services/link/link";
import { LinkService } from "@/services/link/link.service";
import { FontAwesome } from "@expo/vector-icons";
import {
    Alert,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

async function handleDelete(linkCode: number, linkTitle: string, refresh: () => void) {
    Alert.alert(
        "Excluir Link",
        `Deseja realmente excluir "${linkTitle}"?`,
        [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                    try {
                        await LinkService.deleteByCode(linkCode);
                        refresh(); //Rcarrega lista após deletar
                    } catch (error) {
                        console.error("Erro ao excluir link:", error);
                    }
                },
            },
        ]
    );
}

interface LinkCardProps {
    links: Link[];
    refresh: () => void; //Função do pai só para recarregar lista
}

export default function LinkCard({ links, refresh }: LinkCardProps) {


    // const onClickLink = (linkCode: number) => {
    //     console.log("Clicou no link, id: ", linkCode);
    // }

    const onClickLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Erro ao abrir link:", err));
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
                    <TouchableOpacity
                        key={index}
                        style={styles.linkCard}
                        onPress={() => onClickLink(link.url!)}
                        onLongPress={() =>
                            handleDelete(link.code!, link.title, refresh)
                        }
                        delayLongPress={500}
                    >
                        {hasImage ? (
                            <Image source={{ uri: link.previewImageUrl }} style={styles.linkImage} />
                        ) : (
                            <View style={[styles.linkImage, styles.placeholder]}>
                                <FontAwesome name="file-image-o" size={40} color="#362946" />
                            </View>
                        )}
                        <Text style={styles.linkTitle}>{link.title}</Text>
                    </TouchableOpacity>
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
        padding: 10,
    },
    linkCard: {
        width: "48%",
        borderRadius: 10,
        backgroundColor: "#EBE1F6",
        padding: 10,
        marginBottom: 12,
        alignItems: "center",
    },
    linkImage: {
        width: 100,  // largura fixa só para testar
        height: 100, // altura fixa
        borderRadius: 10,
        resizeMode: "cover",
    },
    placeholder: {
        backgroundColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
    },
    linkTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#362946",
        textAlign: "center",
    },
    noLinkCard: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#EBE1F6",
        alignItems: "center",
    },
    noLinkText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#362946",
    },
});
