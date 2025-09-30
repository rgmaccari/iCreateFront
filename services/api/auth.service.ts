import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../user/user";
import api from "./api";

export class AuthService {
  private static currentUser: User | null = null;

  static async login(nickname: string, password: string): Promise<User> {
    const response = await api.post<{ access_token: string; user: User }>(`/auth/login`, { nickname, password });
    const { access_token, user } = response.data;
    // salvar token e usuário
    await AuthService.registerInMemory(user, access_token);

    return user;
  }

  static async registerInMemory(user: User, accessToken: string): Promise<void> {
    await AsyncStorage.setItem('access_token', accessToken);
    await AsyncStorage.setItem('current_user', JSON.stringify(user));
    AuthService.currentUser = user;
  }

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('current_user');
    AuthService.currentUser = null;
  }

  static getUser(): User | null {
    return AuthService.currentUser;
  }

  static async loadUserFromStorage(): Promise<void> {
    const token = await AsyncStorage.getItem('access_token');
    const userString = await AsyncStorage.getItem('current_user');
    if (token && userString) {
      AuthService.currentUser = JSON.parse(userString);
    }
  }

  static async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('access_token');
  }
}
