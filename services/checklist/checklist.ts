import { ChecklistItem } from './checklist-item';

export interface Checklist {
  code: number;
  title: string;
  itens: ChecklistItem[];
  projectCode: number | null;
  updatedAt: string;
}
