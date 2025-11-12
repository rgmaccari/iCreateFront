import { showToast } from "@/constants/showToast";
import { Link } from "@/services/link/link";
import { LinkCreateDto } from "@/services/link/link.create.dto";
import { LinkService } from "@/services/link/link.service";
import { Project } from "@/services/project/project";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LinksProjectModalProps {
  project?: Project;
  userCode?: number;
  visible: boolean;
  onClose: () => void;
  onAddToBoard?: (link: Link) => void;
}

const LinksProjectModal = (props: LinksProjectModalProps) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [projectLinks, setProjectLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (props.visible && props.userCode) {
      setLoading(true);
      findAllLinks().catch((error: any) =>
        showToast("error", error.formattedMessage)
      );
    }
  }, [props.visible]);

  const findAllLinks = async () => {
    // Se não há projeto definido, carrega apenas todos os links
    if (!props.project?.code && props.userCode) {
      const allLinks = await LinkService.findAllLinks();
      setLinks(allLinks || []);
      setProjectLinks([]);
    }
    // Se há projeto definido, carrega links do projeto e todos os links
    else if (props.project?.code && props.userCode) {
      const allLinks = await LinkService.findAllLinks();
      setLinks(allLinks || []);

      const projectLinks = await LinkService.findAllByProjectCode(
        props.project.code
      );
      setProjectLinks(projectLinks || []);
    }
    setLoading(false);
  };

  const openLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() =>
      showToast("error", "Não foi possível abrir o link.")
    );
  };

  const renderLinkCard = (link: Link) => (
    <TouchableOpacity
      key={link.code}
      style={styles.linkCard}
      activeOpacity={0.9}
      onPress={() => openLink(link.url)}
      onLongPress={() => props.project && handleAddToBoard(link)}
    >
      {link.previewImageUrl ? (
        <Image
          source={{ uri: link.previewImageUrl }}
          style={styles.thumbnail}
        />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons name="link-outline" size={28} color="#888" />
        </View>
      )}

      <View style={styles.linkInfo}>
        <Text style={styles.linkTitle} numberOfLines={1}>
          {link.title || "Sem título"}
        </Text>
        <Text style={styles.linkUrl} numberOfLines={1}>
          {link.url || "Sem URL"}
        </Text>
        <Text style={styles.linkDate}>
          {link.createdAt
            ? new Date(link.createdAt).toLocaleDateString()
            : "Sem data"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => props.onAddToBoard?.(link)}
      >
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const handleAddToBoard = async (link: Link) => {
    console.log("oao");
    if (link.projectCode !== props.project?.code && props.project?.code) {
      console.log("oaossss");
      const dto = new LinkCreateDto();
      (dto.title = link.title?.slice(0, 20)),
        (dto.url = link.url),
        (dto.projectCode = props.project.code);

      await LinkService.create(dto);
      const [newLink] = await LinkService.findAllByProjectCode(
        props.project.code
      );
      props.onAddToBoard?.(newLink);
    } else {
      console.log("oaowr33r3r3");
      props.onAddToBoard?.(link);
    }
  };

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={props.onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="link" size={24} color="#81c091ff" />
          <Text style={styles.title}>Links</Text>
          <TouchableOpacity onPress={props.onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Seção do Projeto - APENAS se houver projeto */}
          {props.project?.code && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deste projeto</Text>
              {projectLinks.length > 0 ? (
                projectLinks.map(renderLinkCard)
              ) : (
                <Text style={styles.emptyText}>
                  Nenhum link associado a este projeto.
                </Text>
              )}
            </View>
          )}

          {/* Todas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {props.project?.code ? "Todos os links" : "Meus links"}
            </Text>
            {links.length > 0 ? (
              links.map(renderLinkCard)
            ) : (
              <Text style={styles.emptyText}>Nenhum link encontrado.</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#362946",
    marginBottom: 16,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9fb",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ececec",
    elevation: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#efefef",
    justifyContent: "center",
    alignItems: "center",
  },
  linkInfo: {
    flex: 1,
    marginLeft: 12,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  linkUrl: {
    fontSize: 13,
    color: "#007aff",
    marginTop: 2,
  },
  linkDate: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#007aff",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#777",
    fontStyle: "italic",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

export default LinksProjectModal;
