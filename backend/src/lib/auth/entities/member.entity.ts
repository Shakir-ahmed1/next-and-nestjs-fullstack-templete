import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('member')
export class Member {
    @PrimaryColumn()
    id: string;

    @Column()
    organizationId: string;

    @Column()
    userId: string;

    @Column()
    role: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
