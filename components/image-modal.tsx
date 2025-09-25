
import { useImagePicker } from "@/hooks/use-image-picker";
import React, { useState } from "react";
import { Image as RNImage, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ImageModalProps {
    visible: boolean;
    initialData?: { filename?: string; dataBase64?: string };
    onClose: () => void;
    onSave: (data: { filename: string; dataBase64: string }) => void;
}

export default function ImageModal({ visible, initialData, onClose, onSave }: ImageModalProps) {
    const [filename, setFilename] = useState(initialData?.filename || "");
    const { image, pickImage } = useImagePicker(); // usar meu seu hook

    if (!visible) return null;

    return (
        <View style={styles.modal}>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Selecionar imagem</Text>
            </TouchableOpacity>

            {image?.uri && (
                <RNImage
                    source={{ uri: image.uri }}
                    style={styles.preview}
                />
            )}

            <TextInput
                style={styles.input}
                value={filename || image?.name}
                onChangeText={setFilename}
                placeholder="Nome da imagem"
            />

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
                    <Text style={styles.buttonText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.save]}
                    onPress={() => {
                        console.log("Botão clicado!");
                        onSave({
                            filename: filename || image?.name || "image.jpg",
                            dataBase64: image?.uri || ""
                        });
                    }}
                >
                    <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 20,
    },
    preview: {
        width: 200,
        height: 200,
        marginVertical: 10,
        borderRadius: 8,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 12,
        backgroundColor: "#fff",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        margin: 5,
    },
    cancel: {
        backgroundColor: "#999",
    },
    save: {
        backgroundColor: "#362946",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
