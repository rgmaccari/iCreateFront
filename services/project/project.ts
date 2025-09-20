import { Image } from "../image/image";
import { Link } from "../link/link";
import { User } from "../user/user";

export interface Project {
    code: number;
    title: string;
    sketch: string;
    createdAt: string;
    alteratedAt: string;
    images: Image[];
    links: Link[];
    user: User;
}
