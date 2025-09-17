import { Project } from "../project/project";

export interface Image {
    code: number;
    filename: string;
    isCover: boolean;
    data: Buffer;
    mimeType: string;
    createdAt: string;
    alteratedAt: string;
    project: Project;
}