import React, { useState } from "react";
import {
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function UserInterestsCard() {
    const [preferenceInput, setPreferenceInput] = useState("");
    const [preferences, setPreferences] = useState<string[]>([]);

    const addPreference = () => {
        const trimmed = preferenceInput.trim();
        if (trimmed.length === 0) return;

        setPreferences((prev) => [...prev, trimmed]);
        setPreferenceInput("");
        Keyboard.dismiss();
    };

    const removePreference = (index: number) => {
        setPreferences((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Interesses</Text>
            <TextInput
                style={styles.input}
                placeholder="Digite seus interesses aqui"
                value={preferenceInput}
                onChangeText={setPreferenceInput}
                onSubmitEditing={addPreference}
                returnKeyType="done"
            />

            <ScrollView
                style={styles.listContainer}
                contentContainerStyle={styles.listContent}
                horizontal={false}
                showsVerticalScrollIndicator={true}
            >
                <View style={styles.tagsWrapper}>
                    {preferences.length === 0 ? (
                        <Text style={styles.emptyText}>Exemplo: artes visuais</Text>
                    ) : (
                        preferences.map((pref, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.preferenceTag}
                                onPress={() => removePreference(index)}
                            >
                                <Text style={styles.preferenceText}>{pref}</Text>
                                <Text style={styles.deleteText}>×</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 0,
        marginVertical: 15,
    },
    title: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 6,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#999",
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        color: "#333",
        fontSize: 14,
    },
    listContainer: {
        marginTop: 12,
        maxHeight: 110,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
        backgroundColor: "#f9f9f9",
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    listContent: {
        //Nada aqui, só para contentContainerStyle
    },
    tagsWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8, //Funcionando em em React Native 0.71+ para espaçamento entre tags
    },
    preferenceTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eee",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginVertical: 4,
        marginRight: 8,
    },
    preferenceText: {
        fontSize: 14,
        color: "#333",
        marginRight: 6,
    },
    deleteText: {
        color: "#e74c3c",
        fontWeight: "bold",
        fontSize: 16,
        lineHeight: 16,
    },
    emptyText: {
        fontStyle: "italic",
        color: "#999",
        padding: 12,
        textAlign: "center",
        fontSize: 14,
    },
});
