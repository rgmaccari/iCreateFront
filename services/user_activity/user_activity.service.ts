import api from "../api/api";

export class UserActivityService {
    static async countDataByUser(): Promise<any> {
        const response = await api.get<any>(`/user_activities`);
        return response.data;
    }
}
