import { Image, Linking, StyleSheet, Text, TouchableOpacity } from "react-native";

interface LinkCardProps {
    title: string;
    previewImageUrl: string;
    url: string;
}

export default function LinkCard({ title, previewImageUrl, url }: LinkCardProps) {
    const handlePress = () => {
        Linking.openURL(url).catch(err => console.error("Erro ao abrir link:", err));
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            <Image source={{ uri: previewImageUrl }} style={styles.image} />
            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "48%", //dois por linha se for grid, depois ver isso
        backgroundColor: "#EBE1F6",
        borderRadius: 10,
        marginBottom: 12,
        overflow: "hidden",
        alignItems: "center",
    },
    image: {
        width: "100%",
        aspectRatio: 1.5, //altura proporcional
        resizeMode: "cover",
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#362946",
        padding: 8,
        textAlign: "center",
    },
});
