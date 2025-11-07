import api from "../api/api";
import { Link } from "./link";
import { LinkCreateDto } from "./link.create.dto";

export class LinkService {
    static async create(link: LinkCreateDto): Promise<Link> {
        const response = await api.post<Link>(`/links`, link);
        return response.data;
    }

    static async update(code: number, link: LinkCreateDto): Promise<Link> {
        const response = await api.put<Link>(`/links/${code}`, link);
        return response.data;
    }

    static async findByCode(code: number): Promise<Link> {
        const response = await api.get(`/links/${code}`);
        return response.data;
    }

    static async findAllByProjectCode(projectCode: number): Promise<Link[]> {
        const response = await api.get(`/links/all/${projectCode}`);
        return response.data;
    }

    static async findAllLinks(): Promise<Link[]> {
        const response = await api.get(`/links/allByUser`);
        return response.data;
    }

    static async deleteByCode(code: number): Promise<void> {
        await api.delete(`/links/${code}`);
    }

}