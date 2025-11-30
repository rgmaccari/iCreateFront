import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../user/user";
import api from "./api";
import websocketService from "./websocket.service";

export class AuthService {
  private static currentUser: User | null = null;

  static async login(nickname: string, password: string): Promise<User> {
    console.log("Acionando o AuthService - login()");

    const response = await api.post<{ access_token: string; user: User }>(
      `/auth/login`,
      { nickname, password }
    );
    const { access_token, user } = response.data;
    // salvar token e usuário
    await AuthService.registerInMemory(user, access_token);

    return user;
  }

  static async logout(): Promise<void> {
    console.log("Acionando o AuthService - logout()");
    websocketService.disconnect();
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("current_user");
    await AsyncStorage.clear();
    AuthService.currentUser = null;
  }

  static getUser(): User | null {
    console.log("Acionando o AuthService - getUser()");
    return AuthService.currentUser;
  }

  static async registerInMemory(
    user: User,
    accessToken: string
  ): Promise<void> {
    console.log("Acionando o AuthService - registerInMemory()");
    await AsyncStorage.setItem("access_token", accessToken);

    const userString = JSON.stringify(user);
    const size = new Blob([userString]).size;

    if (size > 1500000) {
      // Limite seguro <2MB
      console.warn("User muito grande; salvando versão minimal");
      const minimalUser = {
        id: user.code,
        nickname: user.nickname,
        code: user.code,
      }; // Ajuste campos essenciais
      await AsyncStorage.setItem("current_user", JSON.stringify(minimalUser));
    } else {
      await AsyncStorage.setItem("current_user", userString);
    }

    AuthService.currentUser = user;
  }

  static async loadUserFromStorage(): Promise<User | null> {
    try {
      console.log("Acionando o AuthService - loadUserFromStorage()");
      const token = await AuthService.safeGetItem("access_token");
      const userString = await AuthService.safeGetItem("current_user");
      console.warn(
        "Tamanho do userString (bytes):",
        userString ? new Blob([userString]).size : 0
      );

      if (token && userString) {
        const user = JSON.parse(userString);
        AuthService.currentUser = user;
        return user;
      }
      return null;
    } catch (error) {
      console.error("Erro ao ler storage:", error);
      await AuthService.safeRemoveItem("current_user"); // Use safeRemoveItem (adicione abaixo)
      return null;
    }
  }

  static async getToken(): Promise<string | null> {
    console.log("Acionando o AuthService - getToken()");
    return AuthService.safeGetItem("access_token");
  }

  static async checkNickname(
    nickname: string
  ): Promise<{ question: string; answer: string }> {
    console.log("Acionando o AuthService - checkNickname()");
    const response = await api.post<{
      valid: boolean;
      questions: { question: string; answer: string };
    }>("/auth/recovery/check-nickname", { nickname });

    //Se chegou aqui, valid é true (caso contrário o beck já lançou exceção)
    return response.data.questions;
  }

  static async validateSecurityAnswers(
    nickname: string,
    securityAnswersJson: string
  ): Promise<any> {
    console.log("Acionando o AuthService - validateSecurityAnswers()");
    const response = await api.post("/auth/recovery/validate-answers", {
      nickname,
      securityAnswers: securityAnswersJson,
    });
    return response.data;
  }

  static async resetPasswordBySecurity(
    nickname: string,
    newPassword: string
  ): Promise<void> {
    console.log("Acionando o AuthService - resetPasswordBySecurity()");
    await api.post("/auth/recovery/reset-password", {
      nickname,
      newPassword,
    });
  }

  static async safeGetItem(key: string): Promise<string | null> {
    console.log("Acionando o AuthService - safeGetItem()");
    try {
      return await AsyncStorage.getItem(key); // Mude aqui: chame AsyncStorage direto, sem recursão
    } catch (error) {
      console.error(`Erro ao ler ${key}:`, error);
      await AuthService.safeRemoveItem(key); // Use safeRemoveItem
      return null;
    }
  }

  static async safeRemoveItem(key: string): Promise<void> {
    console.log("Acionando o AuthService - safeRemoveItem()");
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Erro ao remover ${key}:`, error);
    }
  }
}
