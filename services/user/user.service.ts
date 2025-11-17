import api from "../api/api";
import { AuthService } from "../api/auth.service";
import { User } from "./user";

export interface AuthResponse {
  user: User;
  access_token: string;
}
export class UserService {

  static async create(user: Omit<FormData, "code" | "createdAt" | "alteratedAt">): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/users", user, {
      headers: {
        "Content-Type": "multipart-form-data"
      }
    });

    if (response && response.data) {
      AuthService.registerInMemory(response.data.user, response.data.access_token);
    }

    return response.data;
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
