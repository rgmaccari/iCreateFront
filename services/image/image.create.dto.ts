export class ImageCreateDto {
    filename?: string;
    isCover?: boolean;
    data?: Buffer;
    projectCode?: number;
}