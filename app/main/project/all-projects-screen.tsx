import AddButton from "@/components/add-button";
import ProjectCard from "@/components/project-card";
import { AuthService } from "@/services/api/auth.service";
import { ProjectPreview } from "@/services/project/project.preview";
import { ProjectService } from "@/services/project/project.service";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Menu } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllProjectsScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(AuthService.getUser());
  const [projects, setProjects] = useState<ProjectPreview[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<"title" | "createdAt" | "updatedAt">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [menuVisible, setMenuVisible] = useState(false);

  //Atualizar a ordenação
  useFocusEffect(
    useCallback(() => {
      loadUserAndProjects();
    }, [sortOption, sortOrder])
  );

  const loadUserAndProjects = async () => {
    setRefreshing(true);

    console.log('user')

    await AuthService.loadUserFromStorage();
    setUserData(AuthService.getUser());

    if (AuthService.getUser()?.code) {

      let data = await ProjectService.findAllPreview();

      //Realiza a ordenação (criar método separado?)
      data = data.sort((a, b) => {
        const getValue = (p: ProjectPreview) => {
          switch (sortOption) {
            case "createdAt":
              return p.createdAt || "";
            case "updatedAt":
              return p.updateAt || "";
            default:
              return p.title?.toLowerCase() || "";
          }
        };
        const valA = getValue(a);
        const valB = getValue(b);
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
      setProjects(data);
    }
    setRefreshing(false);
  };

  const handleSortChange = (option: "title" | "createdAt" | "updatedAt") => {
    setSortOption(option);
    setMenuVisible(false);
  };

  const handleSortIconPress = () => {
    setMenuVisible(true);
  };

  const handleOrderIconPress = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc"); //Inverte a ordem
  };

  const handleNewProject = () => {
    router.push("/main/project/project-screen");
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Usuário não encontrado</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Seus Projetos</Text>
        <View style={styles.iconContainer}>
          {/**Definição do menu de opções de ordenação -> Ver se vai precisar de mais...*/}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={handleSortIconPress}>
                <MaterialIcons name="sort" size={22} color="#333" />
              </TouchableOpacity>
            }
          >
            {/**Item dentro do menu*/}
            <Menu.Item onPress={() => handleSortChange("title")} title="Título" />
            <Menu.Item onPress={() => handleSortChange("createdAt")} title="Data de criação" />
            <Menu.Item onPress={() => handleSortChange("updatedAt")} title="Última atualização" />
          </Menu>
          <TouchableOpacity onPress={handleOrderIconPress}>
            <MaterialIcons
              name={sortOrder === "asc" ? "arrow-upward" : "arrow-downward"}
              size={22}
              color="#333"
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadUserAndProjects}
          />
        }
      >
        <ProjectCard projects={projects} refresh={loadUserAndProjects} />
      </ScrollView>
      <AddButton onPress={handleNewProject} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: { fontSize: 20, fontWeight: "600", color: "#333" },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    zIndex: 10,
    gap: 12,
  },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#362946",
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
});