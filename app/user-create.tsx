import { UserService } from "@/services/user/user.service";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from 'react-native-svg';

export default function UserCreateScreen() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        nickname: '',
        password: ''
    });

    const handleImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            if (form.name) formData.append("name", form.name);
            if (form.nickname) formData.append("nickname", form.nickname);
            if (form.password) formData.append("password", form.password);

            if (selectedImage) {
                formData.append("avatar", {
                    uri: selectedImage,
                    type: 'image/jpeg',
                    name: 'avatar.jpg'
                } as any);
            }

            console.log('Enviando dados do formulário:', formData);

            const User = await UserService.create(formData);
            console.log('Usuário criado (resposta crua):', JSON.stringify(User, null, 2));
            router.back();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <KeyboardAvoidingView 
         style={styles.container}
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar barStyle="light-content" backgroundColor="#4A3B5C" />

    <View style={styles.background} />              
 
    <View style={styles.purpleSection}>
         <Svg 
        height="150" 
        width="100%" 
        style={styles.svgCurve}
        viewBox="0 0 400 150"
         >
        <Path
        d="M0,60 C120,10 280,10 400,60 L400,150 L0,150 Z"
        fill="#4A3B5C"
        />
        </Svg>
    </View>

    <SafeAreaView style={styles.safeArea}>
    <View style={styles.content}>
        //botão de voltar
    <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
    >
    <Ionicons name="arrow-back-circle" size={48} color="#D9D6CE" />
    </TouchableOpacity>
          //titulo
    <View style={styles.header}>
    <Text style={styles.title}>Seja Bem Vindo ao</Text>
    <Text style={styles.subtitle}>ICreate!</Text>
    </View>

   {/* Avatar Selector */}
    <View style={styles.avatarContainer}>
    <TouchableOpacity 
        style={styles.avatarCircle}
        onPress={handleImagePicker}
        activeOpacity={0.7}
    >
     {selectedImage ? (
        <Image 
        source={{ uri: selectedImage }} 
        style={styles.avatarImage}
        />
     ) : (
    <View style={styles.avatarPlaceholder}>
    <Ionicons 
        name="camera" 
        size={40} 
        color="#B3B0A8" 
    />
    </View>
    )}
    </TouchableOpacity>
                
    <Text style={styles.avatarText}>SELECIONE A IMAGEM</Text>
    </View>

            {/* Custom Form */}
            <View style={styles.formContainer}>
            {/* Campo Nome */}
               <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
               <Ionicons 
               name="person" 
               size={24} 
               color="#4A3B5C" 
              style={styles.inputIcon} 
                />
            <TextInput
                style={styles.input}
                placeholder="NOME"
                placeholderTextColor="#9B8FA3"
                value={form.name}
                onChangeText={(text) => setForm({...form, name: text})}
                autoCapitalize="words"
              />
             </View>
             </View>
                        {/* Campo Nickname */}
            <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons 
                name="person"      //trocar por "at" se quiser usar o @ ao inves da pessoinha
                size={24} 
                color="#4A3B5C" 
                style={styles.inputIcon} 
            />
           <TextInput
                style={styles.input}
                placeholder="Nickname"
                placeholderTextColor="#9B8FA3"
                value={form.nickname}
                onChangeText={(text) => setForm({...form, nickname: text})}
                autoCapitalize="none"
            />
            </View>
            </View>

               {/* Campo Senha */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                <TouchableOpacity 
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
                 value={form.password}
                 onChangeText={(text) => setForm({...form, password: text})}
                 secureTextEntry={!showPassword}
                autoCapitalize="none"
            />
            
                </View>
                </View>
      {/* Botão Criar Conta */}
             <TouchableOpacity 
                 style={styles.createButton} 
                 onPress={handleSubmit}
                 activeOpacity={0.8}
                >
             <Text style={styles.createButtonText}>CRIAR CONTA</Text>
            </TouchableOpacity>
                </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#F7F4EA',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 20,
    },
    backButton: {
        position: "absolute",
        top: 10,
        left: 0,
        zIndex: 10,
    },
    header: {
        marginTop: 70,
        alignItems: "center",
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
    avatarContainer: {
        alignItems: "center",
        marginTop: 30,
        marginBottom: 25,
    },
    avatarCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#D4CCE0",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        marginTop: 15,
        fontSize: 12,
        color: "#B3B0A8",
        fontWeight: "500",
        letterSpacing: 1,
        fontFamily: 'AbhayaLibre-ExtraBold',
    },
    formContainer: {
        width: "100%",
        paddingHorizontal: 10,
    },
    inputContainer: {
        marginBottom: 15,
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
    inputIcon: {
        marginRight: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#4A3B5C',
        fontFamily: 'AbhayaLibre-ExtraBold',
    },
    eyeButton: {
        padding: 5,
    },
    createButton: {
        backgroundColor: '#D4CCE0',
        borderRadius: 25,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    createButtonText: {
        color: '#4A3B5C',
        fontSize: 16,
        fontFamily: 'AbhayaLibre-ExtraBold',
        letterSpacing: 1,
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