import api from "../api/api";
import { Preferences } from "./preferences";
import { PreferencesUpdateDto } from "./preferences.update.dto";

export class PreferencesService {
  static async update(preferences: PreferencesUpdateDto): Promise<Preferences> {
    console.log("Acionando o PreferencesService - update()");
    const response = await api.put<Preferences>(`/preferences`, preferences);
    return response.data;
  }

  static async find(): Promise<Preferences> {
    console.log("Acionando o PreferencesService - find()");
    const response = await api.get(`/preferences`);
    return response.data;
  }

  static async enableNotifications(enable: boolean): Promise<void> {
    console.log("Acionando o PreferencesService - enableNotifications()");
    await api.put(
      "/preferences/notifications",
      { enable: enable },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
