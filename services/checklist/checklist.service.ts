import api from "../api/api";
import { Checklist } from "./checklist";
import { ChecklistDto } from "./checklist.dto";

export class ChecklistService {
  static async create(note: ChecklistDto): Promise<Checklist> {
    console.log("Acionando o ChecklistService - create()");
    const response = await api.post<Checklist>(`/checklists`, note);
    console.log("response mn", JSON.stringify(response.data, null, 2));
    return response.data;
  }

  static async update(code: number, note: ChecklistDto): Promise<Checklist> {
    console.log("Acionando o ChecklistService - update()");
    const response = await api.put<Checklist>(`/checklists/${code}`, note);
    return response.data;
  }

  static async findByCode(code: number): Promise<Checklist> {
    console.log("Acionando o ChecklistService - findByCode()");
    const response = await api.get(`/checklists/${code}`);
    return response.data;
  }

  static async findAllChecklists(): Promise<Checklist[]> {
    console.log("Acionando o ChecklistService - findAllChecklists()");
    const response = await api.get(`/checklists/allByUser`);
    return response.data;
  }

  static async findAllByProjectCode(projectCode: number): Promise<Checklist[]> {
    console.log("Acionando o ChecklistService - findAllByProjectCode()");
    const response = await api.get(`/checklists/all/${projectCode}`);
    return response.data;
  }

  static async deleteByCode(code: number): Promise<void> {
    console.log("Acionando o ChecklistService - deleteByCode()");
    await api.delete(`/checklists/${code}`);
  }
}
