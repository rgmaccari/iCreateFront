import api from "../api/api";
import { BaseItemDto } from "./base-item.dto";
import { ItemResponseDto } from "./item.response.dto";
import { BaseItem } from "./project-item";

export class ItemService {
  static async create(item: BaseItemDto): Promise<ItemResponseDto> {
    const response = await api.post<ItemResponseDto>(`/items`, item);
    return response.data;
  }

  static async update(code: number, item: BaseItemDto): Promise<BaseItem> {
    const response = await api.put<BaseItem>(`/items/${code}`);
    return response.data;
  }

  static async getComponents(projectCode: number): Promise<BaseItem> {
    const response = await api.put<BaseItem>(`/items/all${projectCode}`);
    return response.data;
  }

  static async delete(code: number): Promise<void> {
    await api.delete(`/links/${code}`);
  }
}
