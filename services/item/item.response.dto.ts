import { ChecklistItem } from "../checklist/checklist-item";

export interface ItemResponseDto {
  code: number;
  type: "image" | "note" | "link" | "checklist";
  componentCode: number;
  x: number;
  y: number;
  width: number;
  height: number;
  borderColor: string;
  title: string;
  createdAt: string;

  //Para Note Item
  description: string;
  sort: number;
  updatedAt: string;

  //Para Link Item
  url: string;
  previewImageUrl: string;

  //Para Image Item
  filename: string;
  isCover: boolean;
  source: string; //URL

  //Para checklist
  items: ChecklistItem[];
}
