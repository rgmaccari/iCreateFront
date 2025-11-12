import api from "../api/api";
import { AuthService } from "../api/auth.service";
import { User } from "./user";


export class UserService {
  static async create(user: Omit<FormData, "code" | "createdAt" | "alteratedAt">): Promise<User> {
    const response = await api.post<{ access_token: string; user: User }>("/users", user, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    const { access_token, user: userData } = response.data;

    if (userData && access_token) {
      await AuthService.registerInMemory(userData, access_token);
    }

    return userData;
  }

  static async update(code: number, user: FormData): Promise<User> {
    const response = await api.put<User>(`/users/${code}`, user, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    if (response && response.data) {
      AuthService.registerInMemory(response.data, await AuthService.getToken() || '');
    }

    return response.data;
  }

  static async delete(code: number): Promise<void> {
    await api.delete(`/users/${code}`);
  }
}
