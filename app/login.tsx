import { AuthService } from "@/services/api/auth.service";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";



export default function LoginScreen() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    try {
      const user = await AuthService.login(nickname, password);
      if (user) router.replace("/main/user/user-screen");
    } catch (error) {
      console.error("Erro na requisição:", error);
      Alert.alert("Erro", "Não foi possível buscar o usuário. Verifique o código ou a conexão com a API.");
    }
  };

  const handleCreate = () => {
    router.push('/user-register-screen');
  }

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/images/icon-with-name.png")} style={styles.logo} resizeMode="contain" />

      <TextInput
        style={styles.input}
        placeholder="Digite seu apelido..."
        placeholderTextColor="#7A7A7A"
        value={nickname}
        onChangeText={setNickname}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#7A7A7A"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <View style={styles.options}>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={styles.linkText}>Cadastro</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={styles.linkText}>Esqueci minha senha</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f0faff",
    padding: 24,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E8DCCE",
    padding: 12,
    marginBottom: 16,
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#9191d8ff",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fdfdfdff",
    fontSize: 16,
    fontWeight: "600",
  },
  options: {
    alignItems: "center"
  },
  linkText: {

    color: "#505063ff",
    fontSize: 12,
    marginTop: 14,
    textDecorationLine: "underline",
  },
});



