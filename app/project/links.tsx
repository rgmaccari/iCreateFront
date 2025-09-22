import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LinkScreen() {
    const params = useLocalSearchParams<{ projectCode?: string }>();
    const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;

    const handleReturn = () => {
        router.back()
    }

    return (
        <View style={styles.container}>
            <Text>Links do projeto {projectCode}</Text>
            <TouchableOpacity style={styles.buttonsContainer} onPress={handleReturn}>
                <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#362946",
    },
    buttonsContainer: {
        backgroundColor: "#362946",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});