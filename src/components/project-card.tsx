import { FontAwesome } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { ProjectPreview } from "../services/project/project.preview";

interface ProjectCardProps {
    projects: ProjectPreview[];
}

export default function ProjectCard({ projects }: ProjectCardProps) {
    if (!projects || projects.length === 0) {
        return (
            <View style={styles.noProjectCard}>
                <Text style={styles.noProjectText}>Seus projetos aparecerão aqui!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {projects.map((project, index) => {
                const hasImage = project.imageBase64 && project.imageMimeType;
                const imageUri = hasImage
                    ? `data:${project.imageMimeType};base64,${project.imageBase64}`
                    : "";

                return (
                    <View key={index} style={styles.projectCard}>
                        {hasImage ? (
                            <Image source={{ uri: imageUri }} style={styles.projectImage} />
                        ) : (
                            <View style={[styles.projectImage, styles.placeholder]}>
                                <FontAwesome name="file-image-o" size={40} color="#362946" />
                            </View>
                        )}
                        <Text style={styles.projectTitle}>{project.title}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    projectCard: {
        borderRadius: 10,
        backgroundColor: "#EBE1F6",
        padding: 10,
        marginBottom: 12,
        alignSelf: "flex-start",
    },
    projectImage: {
        width: 150,
        height: 150,
        borderRadius: 10,
        marginBottom: 8,
        resizeMode: "cover",
    },
    placeholder: {
        backgroundColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
    },
    projectTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#362946",
        textAlign: "center",
    },
    noProjectCard: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 10,
        backgroundColor: "#EBE1F6",
        alignItems: "center",
    },
    noProjectText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#362946",
    },
});
