import { AuthService } from "@/services/api/auth.service";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";



export default function LoginScreen() {


  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  //Realiza a busca do user acionando AuthService.login mn
  const handleSearchUser = async () => {
    console.log("Botão clicado, código digitado:", nickname);
    try {
      const user = await AuthService.login(nickname, password);
      router.replace({ pathname: "/main/user", params: { user: JSON.stringify(user) } });
    } catch (error) {
      console.error("Erro na requisição:", error);
      Alert.alert("Erro", "Não foi possível buscar o usuário. Verifique o código ou a conexão com a API.");
    }
  };

  const handleCreateUser = () => {
    router.push('/user-create');
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Digite seu apelido..."
        keyboardType="default"
        value={nickname}
        onChangeText={setNickname}
      />

      <TextInput
        style={styles.input}
        placeholder="senha"
        keyboardType="default"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSearchUser}>
        <Text style={styles.buttonText}>Buscar Usuário</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleCreateUser}>
        <Text style={styles.linkText}>Cadastro</Text>
      </TouchableOpacity>

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
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: '#007BFF',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});