import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { User } from "../../services/user/user";

export default function UserScreen() {
  const { user } = useLocalSearchParams();
  const userData: User = user ? JSON.parse(user as string) : null;

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Usuário não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalhes do Usuário</Text>
      <Text style={styles.text}>Código: {userData.code}</Text>
      <Text style={styles.text}>Nome: {userData.name}</Text>
      <Text style={styles.text}>Apelido: {userData.nickname}</Text>
      <Text style={styles.text}>Criado em: {userData.createdAt}</Text>
      <Text style={styles.text}>Alterado em: {userData.alteratedAt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
});