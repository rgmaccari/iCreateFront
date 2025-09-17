import UserCard from "@/src/components/user-card";
import { AuthService } from "@/src/services/api/auth.service";
import { useRouter } from "expo-router";
import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";


export default function UserScreen() {
  const router = useRouter();
  const userData = AuthService.getUser();

  //Usar o trecho abaixo quando for passado o objeto por parâmetro.
  // const { user } = useLocalSearchParams();
  // const userData: User = user ? JSON.parse(user as string) : null;

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Usuário não encontrado</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao realizar logoff:", error);
      Alert.alert("Erro", "Não foi possível realizar o logoff.");
    }
  };

  return(
    
    <SafeAreaView style={styles.container}>
      <UserCard user={userData} onLogout={handleLogout}/>
    </SafeAreaView>
  )

  // return (
  //   <View style={styles.container}>
  //     <View style={styles.userInfo}>
  //       <Text style={styles.title}>Detalhes do Usuário</Text>
  //       <Text style={styles.text}>Código: {userData.code}</Text>
  //       <Text style={styles.text}>Nome: {userData.name}</Text>
  //       <Text style={styles.text}>Apelido: {userData.nickname}</Text>
  //       <Text style={styles.text}>Criado em: {userData.createdAt}</Text>
  //       <Text style={styles.text}>Alterado em: {userData.alteratedAt}</Text>
  //     </View>

  //     <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
  //       <Text style={styles.logoutButtonText}>Sair</Text>
  //     </TouchableOpacity>
  //   </View>
  // );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
  },
  
  userInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10 },
  logoutButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 30,
  },
  logoutButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
