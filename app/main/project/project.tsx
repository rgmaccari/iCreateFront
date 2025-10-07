import ProjectContentCard from "@/components/project-content-card";
import ProjectForm from "@/components/project-form";
import { Project } from "@/services/project/project";
import { ProjectInfoDto } from "@/services/project/project.create.dto";
import { ProjectService } from "@/services/project/project.service";
import { FontAwesome } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProjectScreen() {
  const params = useLocalSearchParams<{ projectCode?: string }>();
  const projectCode = params.projectCode ? parseInt(params.projectCode, 10) : undefined;
  const navigation = useNavigation();

  const [project, setProject] = useState<Project | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    const findByCode = async () => {
      if (projectCode) {
        console.log("Carregando projeto com código:", projectCode);
        try {
          const actualProject = await ProjectService.findByCode(projectCode);
          setProject(actualProject);
          setFormData(actualProject);
        } catch (err) {
          console.error("Erro ao carregar projeto:", err);
        }
      }
      setLoading(false);
    };
    findByCode();
  }, [projectCode]);

  useEffect(() => {
    if (project) {
      const isChanged = project.title !== formData.title || project.sketch !== formData.sketch;
      setIsDirty(isChanged);
    } else {
      setIsDirty(!!formData.title || !!formData.sketch);
    }
  }, [formData, project]);

  useFocusEffect(
    useCallback(() => {
      const onBeforeRemove = (e: any) => {
        if (!isDirty) {
          return;
        }

        e.preventDefault();

        Alert.alert(
          "Salvar projeto",
          "Deseja salvar as alterações antes de voltar?",
          [
            { text: "Não", onPress: () => { setIsDirty(false); navigation.dispatch(e.data.action); } },
            { text: "Sim", onPress: () => { handleSubmit(); } },
            { text: "Cancelar", style: "cancel" },
          ]
        );
      };

      const unsubscribe = navigation.addListener("beforeRemove", onBeforeRemove);
      return unsubscribe;
    }, [navigation, isDirty])
  );

  const create = async (dto: ProjectInfoDto) => {
    try {
      const createdProject = await ProjectService.create(dto);
      setProject(createdProject);
      setIsDirty(false);
      setTimeout(() => router.back(), 300);
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
    }
  };

  const update = async (dto: ProjectInfoDto) => {
    try {
      if (!project) return;
      const updatedProject = await ProjectService.update(project.code!, dto);
      setProject(updatedProject);
      setIsDirty(false);
      setTimeout(() => router.back(), 300);
    } catch (err) {
      console.error("Erro ao atualizar projeto:", err);
    }
  };

  const handleSubmit = async () => {
    const dto: ProjectInfoDto = {
      title: formData.title!,
      sketch: formData.sketch!,
    };

    if (project) {
      await update(dto);
    } else {
      await create(dto);
    }
  };

  const handleReturn = () => {

    if (isDirty) {
      Alert.alert(
        "Salvar alterações",
        "Deseja salvar as alterações antes de sair?",
        [
          { text: "Não", onPress: () => { setIsDirty(false); router.back(); }, style: "cancel" },
          { text: "Sim", onPress: handleSubmit },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setFormData((prev) => ({ ...prev, title: newTitle }));
  };

  const handleOpenLinks = () => {
    console.log(project?.code?.toString() || '');
    router.push({
      pathname: "/main/project/links-screen",
      params: { projectCode: project?.code?.toString() || '' },
    });
  };

  const handleOpenImages = () => {
    console.log(project?.code?.toString() || '');
    router.push({
      pathname: "/main/project/images-screen",
      params: { projectCode: project?.code?.toString() || '' },
    });
  };

  const handleOpenAiFeatures = () => {
    console.log(project?.code?.toString() || '');
    router.push('/main/project/ai-features');
  };

  const handleOpenNotes = () => {
    console.log(project?.code?.toString() || '');
    router.push({
      pathname: "/main/project/notes-screen",
      params: { projectCode: project?.code?.toString() || '' },
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#362946" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleReturn} style={styles.headerButton}>
          <FontAwesome name="arrow-left" size={20} color="#666" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          {isEditingTitle ? (
            <TextInput
              mode="flat"
              value={formData.title || ""}
              onChangeText={handleTitleChange}
              onBlur={() => setIsEditingTitle(false)}
              onSubmitEditing={() => setIsEditingTitle(false)}
              autoFocus
              dense
              style={{
                backgroundColor: "transparent",
                height: 40,
                paddingHorizontal: 0,
                textAlign: "center",
                width: Math.max((formData.title?.length || 1) * 10, 100),
              }}
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
              <Text numberOfLines={1}>{formData.title || "Sem título"}</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={handleSubmit} style={styles.headerButton}>
          <FontAwesome name="save" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <ProjectForm project={project} onChange={setFormData} />

      <ScrollView>
        <ProjectContentCard
          title="Meus Links"
          onPress={handleOpenLinks}
          icon={<FontAwesome name="link" size={40} color="#362946" />}
        />
        <ProjectContentCard
          title="Minhas Imagens"
          onPress={handleOpenImages}
          icon={<FontAwesome name="file-image-o" size={40} color="#362946" />}
        />
        <ProjectContentCard
          title="I.A."
          onPress={handleOpenAiFeatures}
          icon={<FontAwesome name="file-image-o" size={40} color="#362946" />}
        />
        <ProjectContentCard
          title="Notas"
          onPress={handleOpenNotes}
          icon={<FontAwesome name="file-image-o" size={40} color="#362946" />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  headerButton: {
    padding: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#362946",
  },
  titleInput: {
    borderBottomWidth: 1,
    borderColor: "#CCC",
    fontSize: 18,
    minWidth: 150,
    color: "#362946",
  },
});