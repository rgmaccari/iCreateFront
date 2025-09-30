import ImageModal, { ImageCreateDto } from "@/components/image-modal";
import { Image } from "@/services/image/image";
import { ImageService } from "@/services/image/image.service";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ImageScreen() {
    const params = useLocalSearchParams<{ projectCode?: string }>();
    const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;

    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const findAllByProjectCode = async () => {
        if (projectCode) {
            const result = await ImageService.findAllByProjectCode(projectCode);
            setImages(result || []);
        }
    };

    const create = async (forms: ImageCreateDto[]) => {
        try {
            const formData = new FormData();

            forms.forEach((form) => {
                if (form.data) {
                    formData.append("images", {
                        uri: form.data.uri,
                        type: form.data.mimeType,
                        name: form.filename || form.data.name || "image.jpg",
                    } as any);
                }

                if (form.filename) formData.append("filename", form.filename);
                if (form.isCover !== undefined) formData.append("isCover", String(form.isCover));
            });

            if (projectCode) formData.append("projectCode", String(projectCode));

            await ImageService.create(projectCode!, formData);

            await findAllByProjectCode();
        } catch (err) {
            console.error("Erro ao criar imagens:", err);
            throw err;
        }
    };

    useEffect(() => {
        findAllByProjectCode().finally(() => setLoading(false));
    }, [projectCode]);

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>Adicionar imagem</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scroll}>
                {images.map((img) => (
                    <Text key={img.code}>{img.filename}</Text>
                ))}
            </ScrollView>

            <ImageModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={create}
            />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
        padding: 10
    },
    scroll: {
        width: "100%",
        padding: 10
    },
    button: {
        backgroundColor: "#362946",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold"
    },
});
