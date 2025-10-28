import { BaseItem } from "./base-item";

export interface NoteItem extends BaseItem {
    type: 'note';
    componentCode: number;
    title: string;
    description: string;
    sort: number;
    updatedAt: string;

    // Vai obter:
    // code: number; -> Item
    // x: number;
    // y: number;
    // width: number;
    // height: number;
    // borderColor?: string;
}