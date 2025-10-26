import { ChecklistItemDto } from "./checklist-item.dto";

export interface ChecklistDto {
    title: string;

    itens: ChecklistItemDto[];

    projectCode: number | null;
}
