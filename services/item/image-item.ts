import { BaseItem } from "./base-item";

export interface ImageItem extends BaseItem {
    type: 'image';
    filename: string;
    isCover: boolean;
    source: string; //URL
    createdAt: string;

    // Vai obter:
    // code: number; -> Item
    // x: number;
    // y: number;
    // width: number;
    // height: number;
    // borderColor?: string;
}