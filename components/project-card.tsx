import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProjectPreview } from '../services/project/project.preview';
import { ProjectService } from '../services/project/project.service';

async function handleDelete(projectCode: number, projectTitle: string, refresh: () => void) {
  Alert.alert('Excluir Projeto', `Deseja realmente excluir "${projectTitle}"?`, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Excluir',
      style: 'destructive',
      onPress: async () => {
        try {
          await ProjectService.deleteByCode(projectCode);
          refresh(); //Rcarrega lista após deletar
        } catch (error) {
          console.error('Erro ao excluir projeto:', error);
        }
      },
    },
  ]);
}

interface ProjectCardProps {
  projects: ProjectPreview[];
  refresh: () => void; //Função do pai só para recarregar lista
}

export default function ProjectCard({ projects, refresh }: ProjectCardProps) {
  const onClickProject = (projectCode: number) => {
    router.push({
      pathname: '/main/project/project-screen',
      params: { projectCode: projectCode.toString() },
    });
  };

  if (!projects || projects.length === 0) {
    return (
      <View style={styles.noProjectCard}>
        <Text style={styles.noProjectText}>Seus projetos aparecerão aqui!</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {projects.map((project, index) => {
        const hasImage = project.imageUrl && project.imageMimeType;
        const imageUri = hasImage ? project.imageUrl : '';

        return (
          <TouchableOpacity
            key={index}
            style={styles.projectCard}
            onPress={() => onClickProject(project.projectCode!)}
            onLongPress={() => handleDelete(project.projectCode!, project.title, refresh)}
            delayLongPress={500}
          >
            {hasImage ? (
              <Image source={{ uri: imageUri }} style={styles.projectImage} />
            ) : (
              <View style={[styles.projectImage, styles.placeholder]}>
                <FontAwesome name="file-image-o" size={40} color="#5b427aff" />
              </View>
            )}
            <Text style={styles.projectTitle}>{project.title}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  projectCard: {
    width: '48%',
    borderRadius: 10,
    backgroundColor: '#b8b8ebff',
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2b2d64',
  },
  projectImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#362946',
    textAlign: 'center',
  },
  noProjectCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#9191d8ff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2b2d64',
  },
  noProjectText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fdfdfdff',
  },
});
