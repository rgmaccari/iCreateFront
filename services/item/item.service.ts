import api from "../api/api";
import { BaseItem } from "./base-item";
import { BaseItemDto } from "./base-item.dto";

export class ItemService{
    static async create(item: BaseItemDto): Promise<BaseItem>{
        const response = await api.post<BaseItem>(`/items`);
        return response.data;
    }

    static async update(code: number, item: BaseItemDto): Promise<BaseItem>{
        const response = await api.put<BaseItem>(`/items/${code}`);
        return response.data;
    }

    static async delete(code: number): Promise<void>{
        await api.delete(`/links/${code}`)
    }
}