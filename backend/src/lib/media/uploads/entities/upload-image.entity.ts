
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FilePurpose } from '../../../../common/enums/file-purpose.enum';

@Entity('upload_images')
export class UploadImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fileName: string;

    @Column({ unique: true })
    fileUri: string;

    @Column({ unique: true })
    filePath: string;

    @Column({
        type: 'enum',
        enum: FilePurpose,
    })
    purpose: FilePurpose;

    @Column()
    mimeType: string;

    @Column()
    size: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    userId: string;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}
