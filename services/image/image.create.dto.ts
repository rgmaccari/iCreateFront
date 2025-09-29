export class ImageCreateDto {
    filename?: string;
    isCover?: boolean;
    data?: { uri: string; mimeType: string; name: string };;
    projectCode?: number;
}
