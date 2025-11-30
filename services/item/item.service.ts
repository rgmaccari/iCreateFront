import api from "../api/api";
import { BaseItemDto } from "./base-item.dto";
import { ItemResponseDto } from "./item.response.dto";
import { BaseItem, ProjectItem } from "./project-item";

export class ItemService {
  static async create(item: BaseItemDto): Promise<ItemResponseDto> {
    console.log("Acionando o ItemService - create()");
    const response = await api.post<ItemResponseDto>(`/items`, item);
    return response.data;
  }

  static async update(code: number, item: BaseItemDto): Promise<BaseItem> {
    console.log("Acionando o ItemService - update()");
    const response = await api.put<BaseItem>(`/items/${code}`);
    return response.data;
  }

  static async getComponents(projectCode: number): Promise<ProjectItem[]> {
    console.log("Acionando o ItemService - getComponents()");
    const response = await api.get<ProjectItem[]>(`/items/all/${projectCode}`);
    return response.data;
  }

  static async updatePosition(
    code: number,
    x?: number,
    y?: number,
    width?: number,
    height?: number
  ) {
    console.log("Acionando o ItemService - updatePosition()");
    const response = await api.patch(`/items/${code}/position`, {
      x,
      y,
      width,
      height,
    });
    return response.data;
  }

  static async delete(code: number): Promise<void> {
    console.log("Acionando o ItemService - delete()");
    await api.delete(`/items/${code}`);
  }
}
