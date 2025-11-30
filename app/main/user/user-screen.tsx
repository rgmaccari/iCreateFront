import ImagesProjectModal from "@/components/images-project-modal";
import LinksProjectModal from "@/components/links-project-modal";
import NotesChecklistsProjectModal from "@/components/notes-checklists-project-modal";
import { showToast } from "@/constants/showToast";
import { AuthService } from "@/services/api/auth.service";
import { PreferencesService } from "@/services/preferences/preferences.service";
import { UserActivityService } from "@/services/user_activity/user_activity.service";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserScreen() {
  const [userData, setUserData] = useState(AuthService.getUser());
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showChecklistsModal, setShowChecklistsModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const userCode = userData?.code;
  const [lastLoadTime, setLastLoadTime] = useState<string | null>(null);

  //Sem Dto ainda
  const [userStats, setUserStats] = useState({
    images: 0,
    links: 0,
    sketchs: 0,
    projects: 0,
  });

  const loadUserStats = useCallback(async () => {
    try {
      const stats = await UserActivityService.countDataByUser();
      setUserStats(stats);
    } catch (error: any) {
      showToast("error", "Erro ao carregar estatísticas");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("foco no user screen");

      const currentUser = AuthService.getUser();
      setUserData(currentUser);
      console.log("User no foco do UserScreen:", currentUser);

      if (!currentUser) {
        console.log("carrega do storage");
        loadUserFromStorage();
        return;
      }

      if (
        currentUser.alteratedAt &&
        (!lastLoadTime ||
          new Date(currentUser.alteratedAt) > new Date(lastLoadTime))
      ) {
        loadUserStats();
        loadUserInterests();
        setLastLoadTime(currentUser.alteratedAt);
      }
    }, [userData, lastLoadTime]) // Dependências: adicione lastLoadTime aqui
  );

  const loadUserInterests = useCallback(async () => {
    console.log("loadUserInterests");
    try {
      console.log("try");
      const preferences = await PreferencesService.find();
      console.log("preferences ", preferences);
      setInterests(preferences.interests || []);
      setNotificationsEnabled(preferences.notifications || true);
    } catch (error: any) {
      console.log("catch");
      setInterests([]);
    }
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const user = await AuthService.loadUserFromStorage();
      if (user !== undefined) {
        setUserData(AuthService.getUser());
        loadUserStats();
      }
    } catch (error: any) {
      showToast(
        "error",
        error.formattedMessage,
        "Não foi possível obter os dados do usuário"
      );
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao realizar logoff:", error);
      Alert.alert("Erro", "Não foi possível realizar o logoff.");
    }
  };

  const handleEditUser = () => {
    console.log("tem user?", userCode);
    router.push("/user-register-screen");
  };

  const handleOpenImagesModal = () => {
    setShowImagesModal(true);
  };

  const handleOpenLinksModal = () => {
    setShowLinksModal(true);
  };

  const handleOpenNotesModal = () => {
    setShowNotesModal(true);
  };

  const enableNotifications = async () => {
    const newStatus = !notificationsEnabled;
    setNotificationsEnabled(newStatus);

    try {
      await PreferencesService.enableNotifications(newStatus);
      showToast(
        "info",
        `Notificações ${newStatus ? "habilitadas" : "desabilitadas"}`
      );
    } catch (error: any) {
      showToast("error", "Erro ao alterar configurações");
      // Reverte em caso de erro
      setNotificationsEnabled(!newStatus);
    }
  };

  const popularInterests = [
    "Tecnologia",
    "Esportes",
    "Música",
    "Arte",
    "Leitura",
    "Culinária",
    "Viagens",
    "Fotografia",
    "Cinema",
    "Jogos",
    "Programação",
    "Design",
    "Natureza",
    "Moda",
    "Carros",
  ];

  const handleInterestInput = (text: string) => {
    setNewInterest(text);
    if (text.length > 1) {
      const filtered = popularInterests.filter((interest) =>
        interest.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  };

  const addInterest = async (interest: string) => {
    if (interest.trim() && !interests.includes(interest.trim())) {
      const updatedInterests = [...interests, interest.trim()];
      setInterests(updatedInterests);
      setNewInterest("");
      setSuggestions([]);

      try {
        await PreferencesService.update({ interests: updatedInterests });
      } catch (error: any) {
        showToast("error", error.formattedMessage);
      }
    }
  };

  const removeInterest = async (interestToRemove: string) => {
    const updatedInterests = interests.filter(
      (interest) => interest !== interestToRemove
    );
    setInterests(updatedInterests);

    try {
      await PreferencesService.update({ interests: updatedInterests });
    } catch (error: any) {
      showToast("error", "Erro ao remover interesse");
    }
  };

  // Função para construir a URI da imagem do avatar
  const getAvatarUri = () => {
    if (userData?.avatarBase64) {
      return userData.avatarBase64.startsWith("data:image")
        ? userData.avatarBase64
        : `data:image/jpeg;base64,${userData.avatarBase64}`;
    }
    return null;
  };

  const avatarUri = getAvatarUri();

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Não foi possível obter os dados do usuário!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={32} color="#666" />
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData?.name || "Usuário"}</Text>
            <Text style={styles.userNickname}>@{userData?.nickname || ""}</Text>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditUser}
          >
            <Ionicons name="create-outline" size={20} color="#666" />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleOpenImagesModal}
          >
            <View style={[styles.actionIcon]}>
              <Ionicons name="image" size={30} color="#2196F3" />
            </View>
            <Text style={styles.actionTitle}>Imagens</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleOpenLinksModal}
          >
            <View style={[styles.actionIcon]}>
              <Ionicons name="link" size={30} color="#81c091ff" />
            </View>
            <Text style={styles.actionTitle}>Links</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleOpenNotesModal}
          >
            <View style={[styles.actionIcon]}>
              <Ionicons name="document-text" size={30} color="#FF9800" />
            </View>
            <Text style={styles.actionTitle}>Anotações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={enableNotifications}
          >
            <View
              style={[
                styles.actionIcon,
                notificationsEnabled && styles.actionIconEnabled,
              ]}
            >
              <Ionicons
                name={
                  notificationsEnabled ? "notifications" : "notifications-off"
                }
                size={30}
                color={notificationsEnabled ? "#2b2d64" : "#666"}
              />
            </View>
            <Text style={styles.actionTitle}>
              {notificationsEnabled ? "Notificações" : "Notificações"}
            </Text>
            <Text style={styles.notificationStatus}>
              {notificationsEnabled ? "Ativado" : "Desativado"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arquivos</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.images}</Text>
              <Text style={styles.statLabel}>Imagens</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.links}</Text>
              <Text style={styles.statLabel}>Links</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.sketchs}</Text>
              <Text style={styles.statLabel}>Rascunhos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.projects}</Text>
              <Text style={styles.statLabel}>Projetos</Text>
            </View>
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meus Interesses</Text>

          <View style={styles.interestsInputContainer}>
            <TextInput
              style={styles.interestsInput}
              placeholder="Digite um interesse..."
              value={newInterest}
              onChangeText={handleInterestInput}
              onSubmitEditing={() => addInterest(newInterest)}
              mode="outlined"
              outlineColor="#E0E0E0"
              activeOutlineColor="#1976D2"
              left={<TextInput.Icon icon="magnify" />}
            />

            {suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => addInterest(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                    <Ionicons
                      name="add-circle-outline"
                      size={16}
                      color="#666"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.interestsContainer}>
            {interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
                <TouchableOpacity onPress={() => removeInterest(interest)}>
                  <Ionicons name="close-circle" size={16} color="#999" />
                </TouchableOpacity>
              </View>
            ))}
            {interests.length === 0 && (
              <Text style={styles.noInterestsText}>
                Nenhum interesse adicionado. Comece digitando acima!
              </Text>
            )}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#eb2121ff" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>

      <ImagesProjectModal
        project={undefined}
        userCode={userCode}
        visible={showImagesModal}
        onClose={() => setShowImagesModal(false)}
      />

      <LinksProjectModal
        project={undefined}
        userCode={userCode}
        visible={showLinksModal}
        onClose={() => setShowLinksModal(false)}
      />

      <NotesChecklistsProjectModal
        project={undefined}
        userCode={userCode}
        visible={showNotesModal}
        onClose={() => setShowNotesModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  defaultAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#CCCCCC",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  userNickname: {
    fontSize: 14,
    color: "#666",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  actionCard: {
    width: "47%",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  interestsInputContainer: {
    marginBottom: 16,
  },
  interestsInput: {
    backgroundColor: "#FFFFFF",
    fontSize: 14,
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  interestText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
  },
  noInterestsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    minWidth: 0,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    margin: 20,
    marginBottom: 0,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eb2121ff",
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: "#eb2121ff",
    fontWeight: "500",
  },
  actionIconEnabled: {},
  notificationStatus: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    fontWeight: "500",
  },
});
