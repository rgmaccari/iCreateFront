export interface ChecklistItem {
  code?: number;
  text: string;
  checked: boolean;
  sort: number;
  updatedAt?: number;
  checklistCode?: number;
}
