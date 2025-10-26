import api from "../api/api";
import { Note } from "./note";
import { NoteCreateDto } from "./note.create.dto";

export class NoteService {
    static async create(note: NoteCreateDto): Promise<Note> {
        const response = await api.post<Note>(`/notes`, note);
        return response.data;
    }

    static async update(code: number, note: NoteCreateDto): Promise<Note> {
        const response = await api.put<Note>(`/notes/${code}`, note);
        return response.data;
    }

    static async findByCode(code: number): Promise<Note> {
        const response = await api.get(`/notes/${code}`);
        return response.data;
    }
    static async findAllByProjectCode(projectCode: number): Promise<Note[]> {
        console.log(`Buscando notas para o projeto com código: ${projectCode}`);
        const response = await api.get(`/notes/all/${projectCode}`);
        return response.data;
    }

    static async deleteByCode(code: number): Promise<void> {
        await api.delete(`/notes/${code}`);
    }
}