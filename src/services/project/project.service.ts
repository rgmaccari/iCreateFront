import api from "../api/api";
import { Project } from "./project";
import { ProjectPreview } from "./project.preview";

export class ProjectService {
    static async create(project: Omit<Project, "code" | "createtAt" | "alteratedAt">): Promise<Project> {
        const response = await api.post<Project>("/projects", project);
        return response.data;
    }

    static async update(code: number, project: Partial<Project>): Promise<Project> {
        const response = await api.put<Project>(`/projects/${code}`, project);
        return response.data;
    }

    static async findAllPreview(code: number): Promise<ProjectPreview[]> {
        const response = await api.get(`/projects/preview/${code}`);
        return response.data;
    }

    static async findByCode(code: number): Promise<Project> {
        const response = await api.get(`/projects/${code}`);
        return response.data;
    }

    static async deleteByCode(code: number): Promise<void> {
        await api.delete(`/projects/${code}`);
    }
}