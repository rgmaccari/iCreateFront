export interface BaseItem {
    code: number;
    type: 'link' | 'image' | 'sketch' | 'checklist';
    componentCode?: number;
    x: number;
    y: number;
    width: number;
    height: number;
    borderColor?: string;
}