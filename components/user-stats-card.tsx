import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function UserStats() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Atividades recentes</Text>
            <Text style={styles.content}>Dados aparecerâo aqui</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 0,
        marginVertical: 15,
        padding: 15,
        backgroundColor: "#eaeaea",
        borderRadius: 10,
    },
    title: {
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 8,
    },
    content: {
        fontSize: 16,
        color: "#555",
    },
});
