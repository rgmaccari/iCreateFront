export interface BaseItemDto{
    code: number;
    type: 'link' | 'image' | 'sketch' | 'checklist';
    componentCode?: number;
    x: number;
    y: number;
    width: number;
    height: number;

    // Vai obter:
    // code: number; -> Item
    // x: number;
    // y: number;
    // width: number;
    // height: number;
    // borderColor?: string;
}