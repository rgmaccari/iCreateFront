// app/feed/Template3.tsx
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Template3() {
    const featured = {
        title: "Destaque da semana",
        desc: "Veja um conteúdo especialmente escolhido para você.",
        image: "https://picsum.photos/400/305"
    };

    const others = [
        { id: 1, title: "Inspiração visual", image: "https://picsum.photos/400/306" },
        { id: 2, title: "Estudo e foco", image: "https://picsum.photos/400/307" },
    ];

    return (
        <SafeAreaView>
            <ScrollView style={styles.container}>
                <TouchableOpacity style={styles.featured}>
                    <Image source={{ uri: featured.image }} style={styles.featuredImage} />
                    <Text style={styles.featuredTitle}>{featured.title}</Text>
                    <Text style={styles.featuredDesc}>{featured.desc}</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Outras recomendações</Text>
                {others.map(item => (
                    <TouchableOpacity key={item.id} style={styles.listItem}>
                        <Image source={{ uri: item.image }} style={styles.thumb} />
                        <Text style={styles.itemTitle}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    featured: {
        backgroundColor: "#fff",
        borderRadius: 12,
        elevation: 4,
        marginBottom: 20,
        overflow: "hidden"
    },
    featuredImage: { width: "100%", height: 180 },
    featuredTitle: { fontSize: 18, fontWeight: "bold", marginTop: 8, marginHorizontal: 12, color: "#362946" },
    featuredDesc: { marginHorizontal: 12, marginBottom: 12, color: "#555" },
    sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10, color: "#362946" },
    listItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    thumb: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
    itemTitle: { fontSize: 15, fontWeight: "500", color: "#444" }
});
