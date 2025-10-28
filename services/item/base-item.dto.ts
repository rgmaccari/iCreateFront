export interface BaseItemDto{
    type: 'link' | 'image' | 'sketch' | 'checklist';
    componentCode?: number;
    x: number;
    y: number;
    width: number;
    height: number;
}