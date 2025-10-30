import api from "../api/api";
import { BaseItemDto } from "./base-item.dto";
import { ItemResponseDto } from "./item.response.dto";
import { BaseItem, ProjectItem } from "./project-item";

export class ItemService {
  static async create(item: BaseItemDto): Promise<ItemResponseDto> {
    const response = await api.post<ItemResponseDto>(`/items`, item);
    return response.data;
  }

  static async update(code: number, item: BaseItemDto): Promise<BaseItem> {
    const response = await api.put<BaseItem>(`/items/${code}`);
    return response.data;
  }

  static async getComponents(projectCode: number): Promise<ProjectItem[]> {
    const response = await api.get<ProjectItem[]>(`/items/all/${projectCode}`);
    return response.data;
  }

  static async updatePosition(code: number, x?: number, y?: number, width?: number, height?: number) {
    const response = await api.patch(`/items/${code}/position`, {
      x,
      y,
      width,
      height,
    });
    return response.data;
  }


  static async delete(code: number): Promise<void> {
    await api.delete(`/links/${code}`);
  }
}
