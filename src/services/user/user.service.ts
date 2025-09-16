import api from "../api/api";
import { User } from "./user";


export class UserService {
  
  static async create(user: Omit<User, "code" | "createdAt" | "alteratedAt">): Promise<User> {
    const response = await api.post<User>("/users", user);
    return response.data;
  }

  static async update(code: number, user: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/users/${code}`, user);
    return response.data;
  }

  static async delete(code: number): Promise<void> {
    await api.delete(`/users/${code}`);
  }
}
