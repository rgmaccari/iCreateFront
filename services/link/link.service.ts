import api from "../api/api";
import { Link } from "./link";
import { LinkCreateDto } from "./link.create.dto";

export class LinkService {
  static async create(link: LinkCreateDto): Promise<Link> {
    console.log("Acionando o LinkService - create()");
    const response = await api.post<Link>(`/links`, link);
    return response.data;
  }

  static async update(code: number, link: LinkCreateDto): Promise<Link> {
    console.log("Acionando o LinkService - update()");
    const response = await api.put<Link>(`/links/${code}`, link);
    return response.data;
  }

  static async findByCode(code: number): Promise<Link> {
    console.log("Acionando o LinkService - findByCode()");
    const response = await api.get(`/links/${code}`);
    return response.data;
  }

  static async findAllByProjectCode(projectCode: number): Promise<Link[]> {
    console.log("Acionando o LinkService - findAllByProjectCode()");
    const response = await api.get(`/links/all/${projectCode}`);
    return response.data;
  }

  static async findAllLinks(): Promise<Link[]> {
    console.log("Acionando o LinkService - findAllLinks()");
    const response = await api.get(`/links/allByUser`);
    return response.data;
  }

  static async deleteByCode(code: number): Promise<void> {
    console.log("Acionando o LinkService - deleteByCode()");
    await api.delete(`/links/${code}`);
  }
}
