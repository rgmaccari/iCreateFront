// app/feed/Template1.tsx
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Template1() {
    const data = [
        { id: 1, title: "Ideia criativa", desc: "Aprenda algo novo sobre design minimalista.", image: "https://picsum.photos/400/300" },
        { id: 2, title: "Produtividade", desc: "Como organizar melhor seu fluxo de trabalho.", image: "https://picsum.photos/400/301" },
    ];

    return (
        <SafeAreaView>
            <ScrollView contentContainerStyle={styles.container}>
                {data.map(item => (
                    <TouchableOpacity key={item.id} style={styles.card}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.desc}>{item.desc}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
        flexDirection: "row",
        elevation: 3
    },
    image: { width: 100, height: 100 },
    textContainer: { flex: 1, padding: 10 },
    title: { fontWeight: "bold", fontSize: 16, color: "#362946" },
    desc: { fontSize: 13, color: "#555" },
});
