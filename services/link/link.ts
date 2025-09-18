import { Project } from "../project/project";

export interface Link {
    code: number;
    title: string;
    url?: string;
    previewImageUrl?: string;
    createdAt?: string;
    project: Project;
}
/*
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "../project/project.entity";

@Entity('link')
export class Link {
    @PrimaryGeneratedColumn()
    code?: number;

    @Column()
    title?: string;

    @Column()
    url?: string;

    @Column()
    previewImageUrl?: string;

    @CreateDateColumn()
    createdAt?: string;

    @ManyToOne(() => Project, project => project.links, {nullable: false})
    @JoinColumn({ name: 'projectCode', referencedColumnName: 'code' })
    project?: Project; 
}*/