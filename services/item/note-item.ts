import { BaseItem } from "./base-item";

export interface NoteItem extends BaseItem {
    type: 'sketch';

    // Vai obter:
    // code: number;
    // componentCode?: number;
    // x: number;
    // y: number;
    // width: number;
    // height: number;
    // borderColor?: string;
}