import { AuthService } from "@/services/api/auth.service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function LoginScreen() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);//adicionado para o icone do olhinho 
  const router = useRouter();

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
    <KeyboardAvoidingView            //este trecho serve para que ao abrir o teclado o layout se ajuste automatico
      style={styles.container}       //pois quando abrimos o teclado ele fica encima dos botoes, irei adicionar nas outras telas
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#4A3B5C" />
      
    
    <View style={styles.background} /> //style do fundo do app


    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}> //conteiner principal de todo conteudo visivel

      <View style={styles.header}>
          <Text style={styles.title}>ICreate!</Text>         
      </View>

      <View style={styles.formContainer}> //Container dos campos de input e botões
            //buttom do nickname
      <View style={styles.inputContainer}>//adiciona a margem entre os botoes(espaçamento)
      <View style={styles.inputWrapper}>//adiciona o fundo roxo e arredonda as bordas
           <Ionicons 
              name="person" 
              size={24} 
              color="#4A3B5C" //cor oficial dos meu icones
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder="NICKNAME"
              placeholderTextColor="#9B8FA3" //cor da fonte dentro dos botoes
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="none"
            />
      </View>
      </View>

            // Campo Senha do usuário
      <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
      <TouchableOpacity    //TouchableOpacity para o ícone de olho(se clicar ele deixa a senha visivel)
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
         >
          <Ionicons 
              name={showPassword ? "eye-off" : "eye"} 
              size={24} 
              color="#4A3B5C" 
            />
        </TouchableOpacity>
           <TextInput
              style={styles.input}
              placeholder="SENHA"
              placeholderTextColor="#9B8FA3"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

      </View>
      </View>

            // Botão Login 
      <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleSearchUser}//QUANDO CLICAR EXECUTA A FUNÇÃO DE LOGIN, VERIFICA SE O USUARIO EXISTE
          activeOpacity={0.8}
      >
      <Text style={styles.loginButtonText}>ENTRAR</Text>
      </TouchableOpacity>

            //link do cadastrese
      <TouchableOpacity 
          onPress={handleCreateUser} //navega para a tela de criar usuario
          style={styles.registerContainer}
      >
      <Text style={styles.registerText}>
          Não tem conta? <Text style={styles.registerLink}>Cadastre-se</Text>
      </Text>
      </TouchableOpacity>
      </View>
      </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { //// Ocupa toda a tela disponível
    flex: 1,
  },

  background: { //cor do fundo da tela
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: '#F7F4EA',
},

  safeArea: {  /// Ocupa espaço disponível (respeitando notch/status bar)
    flex: 1,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontFamily: 'AbhayaLibre-ExtraBold',
    textAlign: "center",
    color: "#B3B0A8",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 32,
    fontFamily: 'AbhayaLibre-ExtraBold',
    color: "#B3B0A8",
    marginTop: 4,
    letterSpacing: 1,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4CCE0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  inputIcon: {  //espaço entre os icones e texto
    marginRight: 15,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#4A3B5C',
    fontFamily: 'AbhayaLibre-ExtraBold',
  },

  eyeButton: {  //area clicavel do icone do olhinho para mostrar a senha
    padding: 5,
  },

  loginButton: {
    backgroundColor: '#D4CCE0',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  
  loginButtonText: {
    color: '#4A3B5C',
    fontSize: 16,
    fontFamily: 'AbhayaLibre-ExtraBold',
    letterSpacing: 1,
  },

  registerContainer: {
    alignItems: 'center',
    marginTop: 30,
  },

  registerText: {
    fontSize: 16,
    color: '#B3B0A8',
    fontFamily: 'AbhayaLibre-ExtraBold',
  },

  registerLink: { //estilização do cadastre-se
    color: '#4A3B5C',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },

  purpleSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: -1,
  },

  svgCurve: {
    position: 'absolute',
    bottom: 0,
  },
});