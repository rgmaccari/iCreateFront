import LinkCard from "@/components/link-card";
import { Link } from "@/services/link/link";
import { LinkService } from "@/services/link/link.service";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LinkScreen() {
    const params = useLocalSearchParams<{ projectCode?: string }>();
    const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;

    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (projectCode) {
                console.log('acionado o useEffect')
                try {
                    console.log('acionado o try')
                    const actualLinks = await LinkService.findAllByProjectCode(projectCode);
                    console.log(actualLinks)
                    setLinks(actualLinks);
                } catch (err) {
                    console.error("Erro ao carregar links:", err);
                }
            }
            setLoading(false);
        };
        load();
    }, [projectCode]);

    const handleReturn = () => {
        router.back();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Carregando links...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinkCard refresh={() => console.log('opa')} links={links} />

            <Text>Links do projeto {projectCode}</Text>
            {links.map(link => (
                <Text key={link.code}>{link.title}</Text>
            ))}

            <TouchableOpacity style={styles.button} onPress={handleReturn}>
                <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
        </SafeAreaView>
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
    button: {
        backgroundColor: "#362946",
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});