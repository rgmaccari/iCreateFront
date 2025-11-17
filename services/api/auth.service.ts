import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../user/user";
import api from "./api";
import websocketService from "./websocket.service";

export class AuthService {
  private static currentUser: User | null = null;

  static async login(nickname: string, password: string): Promise<User> {
    const response = await api.post<{ access_token: string; user: User }>(`/auth/login`, { nickname, password });
    const { access_token, user } = response.data;
    // salvar token e usuário
    await AuthService.registerInMemory(user, access_token);

    return user;
  }

  static async logout(): Promise<void> {
    websocketService.disconnect();
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('current_user');
    AuthService.currentUser = null;
  }

  static getUser(): User | null {
    return AuthService.currentUser;
  }

  static async registerInMemory(user: User, accessToken: string): Promise<void> {
    await AsyncStorage.setItem('access_token', accessToken);
    await AsyncStorage.setItem('current_user', JSON.stringify(user));
    AuthService.currentUser = user;
  }

  static async loadUserFromStorage(): Promise<User | null> {
    const token = await AsyncStorage.getItem('access_token');
    const userString = await AsyncStorage.getItem('current_user');

    if (token && userString) {
      const user = JSON.parse(userString);
      AuthService.currentUser = user;
      return user
    }

    return null;
  }

  static async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('access_token');
  }

  static async checkNickname(nickname: string): Promise<{ question: string; answer: string }> {
    const response = await api.post<{
      valid: boolean;
      questions: { question: string; answer: string };
    }>('/auth/recovery/check-nickname', { nickname });

    //Se chegou aqui, valid é true (caso contrário o beck já lançou exceção)
    return response.data.questions;
  }

  static async validateSecurityAnswers(nickname: string, securityAnswersJson: string): Promise<any> {
    const response = await api.post('/auth/recovery/validate-answers', {
      nickname,
      securityAnswers: securityAnswersJson
    });
    return response.data;
  }

  static async resetPasswordBySecurity(nickname: string, newPassword: string): Promise<void> {
    await api.post('/auth/recovery/reset-password', {
      nickname,
      newPassword
    });
  }
}
