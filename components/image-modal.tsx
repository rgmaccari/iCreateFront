import { useImagePicker } from "@/hooks/use-image-picker";
import { ImageCreateDto } from "@/services/image/image.create.dto";
import React, { useState } from "react";
import { Image as RNImage, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ImageModalProps {
    visible: boolean;
    initialData?: { filename?: string; dataBase64?: string };
    onClose: () => void;
    onSave: (data: ImageCreateDto[]) => void; //Envia lista
}

/**Lib para conhecer:
 * react-native-fast-image: melhora o carregamento de imagens.
 */

export default function ImageModal({ visible, initialData, onClose, onSave }: ImageModalProps) {
    const [filename, setFilename] = useState(initialData?.filename || "");
    const { image, pickImage } = useImagePicker();
    const [isCover, setIsCover] = useState(false);

    if (!visible) return null;

    return (


        <View style={styles.modal}>
            <View style={styles.modalContent}>
                {/* Switch de capa */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                    <Text style={{ marginRight: 10 }}>Definir como capa</Text>
                    <Switch
                        value={isCover}
                        onValueChange={(value) => {
                            console.log("isCover:", value);
                            setIsCover(value);
                        }}
                    />
                </View>

                {/* Botão selecionar imagem */}
                <TouchableOpacity style={styles.selectButton} onPress={pickImage}>
                    <Text style={styles.buttonText}>Selecionar imagem</Text>
                </TouchableOpacity>

                {/* Preview */}
                {image?.uri && (
                    <RNImage source={{ uri: image.uri }} style={styles.preview} />
                )}

                {/* Input */}
                <TextInput
                    style={styles.input}
                    value={filename || image?.name}
                    onChangeText={setFilename}
                    placeholder="Nome da imagem"
                />

                {/* Botões voltar / salvar */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
                        <Text style={styles.buttonText}>Voltar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.save]}
                        onPress={() => {
                            if (!image) return;

                            onSave([{
                                filename: filename || image.name || "image.jpg",
                                isCover: isCover,
                                data: {
                                    uri: image.uri,
                                    mimeType: image.mimeType || "image/jpeg",
                                    name: image.name || "image.jpg",
                                },
                            }]);

                            onClose();
                        }}
                    >
                        <Text style={styles.buttonText}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>

    );

}

const styles = StyleSheet.create({
    modal: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: 20
    },
    modalContent: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    preview: {
        width: 200,
        height: 200,
        marginVertical: 10,
        borderRadius: 8
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 12,
        backgroundColor: "#fff"
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%"
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        margin: 5
    },
    cancel: {
        backgroundColor: "#999"
    },
    save: {
        backgroundColor: "#362946"
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold"
    },
    selectButton: {
        backgroundColor: "#362946",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
        marginBottom: 12,
    },
});
