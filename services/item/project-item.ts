import { ChecklistItem } from '../checklist/checklist-item';
export type BaseItem = {
  code: number;
  componentCode: number;
  x: number;
  y: number;
  width: number;
  height: number;
  borderColor?: string;
  projectCode?: number;
};

export type LinkItem = BaseItem & {
  type: 'link'; // literal fixo
  title: string;
  url: string;
  previewImageUrl?: string;
  createdAt?: string;
};

export type ChecklistBoardItem = BaseItem & {
  type: 'checklist';
  title: string;
  items: ChecklistItem[];
  updatedAt: string;
};

export type ImageItem = BaseItem & {
  type: 'image'; // literal fixo
  filename?: string;
  isCover?: boolean;
  source: string;
  createdAt?: string;
};

export type NoteItem = BaseItem & {
  type: 'note'; // literal fixo
  title?: string;
  description: string;
  sort: number;
  updatedAt: string;
};

export type ProjectItem = LinkItem | ImageItem | NoteItem | ChecklistBoardItem;
