import { Link } from "@/services/link/link";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface EditLinkModalProps {
    visible: boolean;
    link: Link | null;
    formData: Partial<Link>;
    onChange: (data: Partial<Link>) => void;
    onClose: () => void;
    onSave: () => void;
}

export default function EditLinkModal({ visible, link, formData, onChange, onClose, onSave }: EditLinkModalProps) {
    if (!visible || !link) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Editar Link</Text>

                    <TextInput
                        style={styles.input}
                        value={formData.title}
                        onChangeText={(text) => onChange({ ...formData, title: text })}
                        placeholder="Título"
                    />

                    <TextInput
                        style={styles.input}
                        value={formData.url}
                        onChangeText={(text) => onChange({ ...formData, url: text })}
                        placeholder="URL"
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.button, styles.save]} onPress={onSave}>
                            <Text style={styles.buttonText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
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
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 10,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 5,
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
