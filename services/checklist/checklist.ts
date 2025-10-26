import { ChecklistItem } from "./checklist-item";

export interface Checklist {
    title: string;
    itens: ChecklistItem[];
    projectCode: number | null;
}
