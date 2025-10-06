import api from "../api/api";
import { Preferences } from "./preferences";
import { PreferencesUpdateDto } from "./preferences.update.dto";

export class PreferencesService {

    static async update(userCode: number, preferences: PreferencesUpdateDto): Promise<Preferences> {
        const response = await api.put<Preferences>(`/preferences/${userCode}`, preferences);
        return response.data;
    }

    static async findByCode(userCode: number): Promise<Preferences> {
        const response = await api.get(`/preferences/${userCode}`);
        return response.data;
    }


}
