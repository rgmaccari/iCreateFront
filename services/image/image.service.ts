import api from "../api/api";
import { Image } from "./image";
import { ImageCreateDto } from "./image.create.dto";

export class ImageService {
    static async create(projectCode: number, formData: FormData): Promise<Image[]> {
        try {
            const formDataEntries: any[] = [];
            formData.forEach((value, key) => formDataEntries.push([key, value]));

            const response = await api.post(`/images/${projectCode}`, formData, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("[ImageService] Erro ao criar imagens:", error);
            throw error;
        }
    }

    static async update(code: number, image: ImageCreateDto): Promise<Image> {
        const response = await api.put<Image>(`/images/${code}`, image);
        return response.data;
    }

    static async findByCode(code: number): Promise<Image> {
        const response = await api.get(`/images/${code}`);
        return response.data;
    }

    static async findAllByProjectCode(projectCode: number): Promise<Image[]> {
        const response = await api.get(`/images/all/${projectCode}`);
        return response.data;
    }

    static async deleteByCode(code: number): Promise<void> {
        await api.delete(`/images/${code}`);
    }
}
