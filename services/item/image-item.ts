import { BaseItem } from "./base-item";

export interface ImageItem extends BaseItem {
    type: 'image';
    source: string;
}