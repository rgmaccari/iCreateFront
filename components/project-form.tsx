import { Project } from "@/services/project/project";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";


interface ProjectFormProps {
    project?: Project;
    onChange: (data: Partial<Project>) => void;
}

export default function ProjectForm({ project, onChange }: ProjectFormProps) {
    const [form, setForm] = useState<Partial<Project>>({
        title: project?.title || "",
        sketch: project?.sketch || "",
    });

    // sempre que o form mudar, avisamos a tela pai
    useEffect(() => {
        onChange(form);
    }, [form]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Título</Text>
            <TextInput
                style={styles.input}
                placeholder="Digite o título"
                value={form.title}
                onChangeText={(text) => setForm((prev) => ({ ...prev, title: text }))}
            />

            <Text style={styles.label}>Esboço</Text>
            <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Descreva seu esboço..."
                multiline
                numberOfLines={4}
                value={form.sketch}
                onChangeText={(text) => setForm((prev) => ({ ...prev, sketch: text }))}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#362946",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    multiline: {
        textAlignVertical: "top",
        height: 100,
    },
});
