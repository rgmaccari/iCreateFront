import EditLinkModal from "@/components/edit-link-modal";
import InputField from "@/components/input-field";
import LinkCard from "@/components/link-card";
import { Link } from "@/services/link/link";
import { LinkCreateDto } from "@/services/link/link.create.dto";
import { LinkService } from "@/services/link/link.service";
import { LinkUpdateDto } from "@/services/link/link.update.dto";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LinkScreen() {
    const params = useLocalSearchParams<{ projectCode?: string }>();
    const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;
    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<Link>>({});
    const [selectedLink, setSelectedLink] = useState<Link | null>(null);
    const [editVisible, setEditVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    //Retornar a tela.
    const handleReturn = () => {
        router.back();
    };

    const findAllByProjectCode = async (projectCode: any) => {
        if (projectCode) {
            const parsedProjectCode = parseInt(projectCode);
            const foundedLinks = await LinkService.findAllByProjectCode(parsedProjectCode);
            if (foundedLinks) {
                console.log(foundedLinks);
                setLinks(foundedLinks);
            } else {
                setLinks([]);
            }
        }
    };

    const create = async (value: any) => {
        if (projectCode && value) {
            try {
                const link = new LinkCreateDto();
                link.url = value;
                link.title = "";
                await LinkService.create(projectCode, link);
                findAllByProjectCode(projectCode); // Recarregar lista
            } catch (err) {
                console.error(err);
                throw new Error("Erro ao criar link");
            }
        }
    };

    const update = async () => {
        if (selectedLink) {
            try {
                const dto: LinkUpdateDto = {
                    title: formData.title!,
                    url: formData.url!,
                };
                await LinkService.update(selectedLink.code!, dto);
                console.log("Link atualizado:", dto);
                setEditVisible(false);
                findAllByProjectCode(projectCode);
            } catch (err) {
                console.error(err);
                throw new Error("Erro ao atualizar link");
            }
        }
    };

    const deleteByCode = async (code: number) => {
        Alert.alert(
            "Excluir link",
            "Deseja realmente excluir o link?",
            [{ text: "Cancelar", style: "cancel" },
            {
                text: "Excluir", style: "destructive", onPress: async () => {
                    await LinkService.deleteByCode(code);
                    findAllByProjectCode(projectCode);
                }
            }
            ]
        )
    }

    const getFilteredLinks = () => {
        if (!searchTerm.trim()) return links;

        return links.filter(link =>
            link.code?.toString().includes(searchTerm) ||
            link.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    useEffect(() => {
        const load = async () => {
            if (projectCode) {
                await findAllByProjectCode(projectCode);
            }
            setLoading(false);
        };
        load();
    }, [projectCode]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Carregando links...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <InputField type="default" placeholder="Digite seu link..." buttonLabel="Salvar" onPress={create} />
            <InputField
                type="default"
                placeholder="Pesquise um link..."
                buttonLabel="Filtrar"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />

            <LinkCard
                refresh={() => findAllByProjectCode(projectCode)}
                links={getFilteredLinks()}
                onDelete={deleteByCode}
                onEdit={(link) => {
                    setSelectedLink(link);
                    setFormData(link);
                    setEditVisible(true);
                }}
            />

            <TouchableOpacity style={styles.button} onPress={() => findAllByProjectCode(projectCode)}>
                <Text style={styles.buttonText}>Mostrar todos</Text>
            </TouchableOpacity>

            <Text>Links do projeto {projectCode}</Text>

            <TouchableOpacity style={styles.button} onPress={handleReturn}>
                <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>

            {/* Modal de edição: setVisible false faz com que ele nem carregue ou seja destruído */}
            {selectedLink && (
                <EditLinkModal
                    visible={editVisible}
                    link={selectedLink}
                    formData={formData}
                    onChange={setFormData}
                    onClose={() => setEditVisible(false)}
                    onSave={update}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5"
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#362946"
    },
    button: {
        backgroundColor: "#362946",
        padding: 10,
        borderRadius: 5
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold"
    },
});
