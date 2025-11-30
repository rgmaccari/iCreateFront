import api from "../api/api";

export class UserActivityService {
  static async countDataByUser(): Promise<any> {
    console.log("Acionando o UserActivityService - countDataByUser()");
    const response = await api.get<any>(`/user_activities`);
    return response.data;
  }
}
