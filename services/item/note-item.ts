import { BaseItem } from "./base-item";

export interface NoteItem extends BaseItem {
    type: 'sketch';
    title?: string;
    description: string;

    // Vai obter:
    // code: number;
    // type: 'link' | 'image' | 'sketch' | 'checklist';
    // componentCode?: number;
    // x: number;
    // y: number;
    // width: number;
    // height: number;
    // borderColor?: string;
}