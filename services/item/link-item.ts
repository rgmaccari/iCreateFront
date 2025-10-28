import { BaseItem } from "./base-item";

export interface LinkItem extends BaseItem {
    type: 'link';
    title: string;
    url: string;
    previewImageUrl?: string;
    createdAt: string;

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