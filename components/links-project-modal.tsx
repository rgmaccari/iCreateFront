import { showToast } from "@/constants/showToast";
import { Link } from "@/services/link/link";
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
    if (props.project?.code && props.userCode) {
      const allLinks = await LinkService.findAllLinks();
      setLinks(allLinks || []);

      const projectLinks = await LinkService.findAllByProjectCode(props.project.code);
      setProjectLinks(projectLinks || []);

      setLoading(false);
    }
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
      onLongPress={() => props.onAddToBoard?.(link)}
    >
      {link.previewImageUrl ? (
        <Image source={{ uri: link.previewImageUrl }} style={styles.thumbnail} />
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

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={props.onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Links</Text>
          <TouchableOpacity onPress={props.onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Seção do Projeto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Do projeto</Text>
            {projectLinks.length > 0 ? (
              projectLinks.map(renderLinkCard)
            ) : (
              <Text style={styles.emptyText}>
                Nenhum link associado a este projeto.
              </Text>
            )}
          </View>

          {/* Todas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Todas</Text>
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
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
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
    marginBottom: 10,
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
    marginTop: 6,
  },
});

export default LinksProjectModal;
