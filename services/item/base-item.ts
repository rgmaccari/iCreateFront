export interface BaseItem {
  code: number;
  type: 'image' | 'note' | 'link' | 'checklist';
  componentCode: number;
  x: number;
  y: number;
  width: number;
  height: number;
  borderColor?: string;
}
