import { Project } from "../project/project";

export interface Link {
    code?: number;
    title?: string;
    url?: string;
    previewImageUrl?: string;
    createdAt?: string;
    project?: Project;
}