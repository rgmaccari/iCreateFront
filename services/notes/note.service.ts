import api from "../api/api";
import { Note } from "./note";
import { NoteCreateDto } from "./note.create.dto";

export class NoteService {
  static async create(note: NoteCreateDto): Promise<Note> {
    console.log("Acionando o NoteService - create()");
    const response = await api.post<Note>(`/notes`, note);
    return response.data;
  }

  static async update(code: number, note: NoteCreateDto): Promise<Note> {
    console.log("Acionando o NoteService - update()");
    const response = await api.put<Note>(`/notes/${code}`, note);
    return response.data;
  }

  static async findByCode(code: number): Promise<Note> {
    console.log("Acionando o NoteService - findByCode()");
    const response = await api.get(`/notes/${code}`);
    return response.data;
  }

  static async findAllByProjectCode(projectCode: number): Promise<Note[]> {
    console.log("Acionando o NoteService - findAllByProjectCode()");
    const response = await api.get(`/notes/all/${projectCode}`);
    return response.data;
  }

  static async findAllNotes(): Promise<Note[]> {
    console.log("Acionando o NoteService - findAllNotes()");
    const response = await api.get(`/notes/allByUser`);
    return response.data;
  }

  static async deleteByCode(code: number): Promise<void> {
    console.log("Acionando o NoteService - deleteByCode()");
    await api.delete(`/notes/${code}`);
  }
}
