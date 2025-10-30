export interface BaseItemDto {
  type: "link" | "image" | "note" | "checklist";
  componentCode?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  projectCode: number;
}
