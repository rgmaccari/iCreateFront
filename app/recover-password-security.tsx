import { AuthService } from "@/services/api/auth.service";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
 
const showToast = (type: string, title: string, message: string) => Alert.alert(title, message);
const securityQuestions = [
    { id: 1, question: "Qual o nome do seu primeiro animal de estimação?" },
    { id: 2, question: "Qual a sua cidade natal?" },
    { id: 3, question: "Qual o nome da sua mãe?" },
];

export default function RecoverPasswordSecurityScreen() {
    const router = useRouter();
    const [nickname, setNickname] = useState("");
    const [step, setStep] = useState(1); 
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const handleAnswerChange = (id: number, text: string) => {
        setAnswers(prev => ({ ...prev, [id]: text }));
    };

    const handleCheckNickname = async () => {
        if (!nickname.trim()) {
            Alert.alert("Erro", "O apelido é obrigatório.");
            return;
        }
        
        setIsLoading(true);
        try {
            await AuthService.checkNickname(nickname); 
            setStep(2); 
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Apelido não encontrado ou erro de conexão.";
            showToast("error", "Erro", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckAnswers = async () => {
        const answersArray = securityQuestions.map(q => answers[q.id]?.trim());
        const missingAnswers = answersArray.some(answer => !answer);

        if (missingAnswers) {
            Alert.alert("Atenção", "Preencha todas as 3 perguntas de segurança.");
            return;
        }

        setIsLoading(true);
        
        const answersJson = JSON.stringify(answers); 
        try {
           await AuthService.validateSecurityAnswers(nickname, answersJson); 
           setStep(3);
           showToast("success", "Sucesso", "Respostas validadas! Prossiga para a nova senha.");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Respostas incorretas. Tente novamente.";
            showToast("error", "Erro", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }

        setIsLoading(true);
        try {
           await AuthService.resetPasswordBySecurity(nickname, newPassword); 
           showToast("success", "Sucesso", "Sua senha foi resetada com sucesso!");
           router.replace('/login');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Não foi possível redefinir a senha.";
            showToast("error", "Erro", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <Text style={styles.title}>Recuperação de Senha</Text>
                        <Text style={styles.subtitle}>Digite seu Apelido para continuar:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Seu Apelido"
                            placeholderTextColor="#7A7A7A"
                            value={nickname}
                            onChangeText={setNickname}
                            editable={!isLoading}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleCheckNickname} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Avançar</Text>}
                        </TouchableOpacity>
                    </>
                );
            case 2:
                return (
                    <>
                        <Text style={styles.title}>Perguntas de Segurança</Text>
                        <Text style={styles.subtitle}>Responda às perguntas cadastradas.</Text>
                        {securityQuestions.map((q) => (
                            <View key={q.id} style={styles.questionContainer}>
                                <Text style={styles.questionText}>{q.question}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Sua resposta"
                                    placeholderTextColor="#7A7A7A"
                                    value={answers[q.id] || ""}
                                    onChangeText={(text) => handleAnswerChange(q.id, text)}
                                    editable={!isLoading}
                                />
                            </View>
                        ))}
                        <TouchableOpacity style={styles.button} onPress={handleCheckAnswers} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verificar Respostas</Text>}
                        </TouchableOpacity>
                    </>
                );
            case 3:
                return (
                    <>
                        <Text style={styles.title}>Redefinir Senha</Text>
                        <Text style={styles.subtitle}>Digite sua nova senha.</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nova Senha (mín. 6 caracteres)"
                            placeholderTextColor="#7A7A7A"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            editable={!isLoading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar Nova Senha"
                            placeholderTextColor="#7A7A7A"
                            secureTextEntry
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            editable={!isLoading}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Redefinir Senha</Text>}
                        </TouchableOpacity>
                    </>
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} disabled={isLoading}>
                <Feather name="arrow-left" size={28} color="#555" />
            </TouchableOpacity>
            <View style={styles.content}>
                {renderStep()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f0faff",
        paddingHorizontal: 24,
    },
    backButton: {
        position: "absolute",
        top: 60,
        left: 24,
        zIndex: 10,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 80,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#4A4688",
        textAlign: 'center',
    },
    subtitle: {
        marginBottom: 10,
        marginTop: 35,
        fontSize: 16,
        color: "#7A7A7A",
        width: '100%',
        textAlign: 'left',
    },
    input: {
        width: "100%",
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E8DCCE",
        padding: 14,
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
        marginTop: 10,
    },
    buttonText: {
        color: "#fdfdfdff",
        fontSize: 16,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    questionContainer: {
        width: "100%",
        marginBottom: 15,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    }
});