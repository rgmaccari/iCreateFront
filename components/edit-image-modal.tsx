import { Image } from "@/services/image/image";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface EditImageModalProps {
    visible: boolean;
    image: Image | null;
    formData: Partial<Image>;
    onChange: (data: Partial<Image>) => void;
    onClose: () => void;
    onSave: () => void;
}

export default function EditImageModal({ visible, image, formData, onChange, onClose, onSave }: EditImageModalProps) {
    if (!visible || !image) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Editar Imagem</Text>

                <TextInput
                    style={styles.input}
                    value={formData.filename}
                    onChangeText={(text) => onChange({ ...formData, filename: text })}
                    placeholder="Nome do arquivo"
                />

                <TouchableOpacity style={[styles.button, styles.save]} onPress={onSave}>
                    <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
        width: "90%",
        borderRadius: 12,
        padding: 20,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#362946",
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 12,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
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
