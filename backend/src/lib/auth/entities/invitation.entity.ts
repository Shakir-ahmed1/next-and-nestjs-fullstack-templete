import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('invitation')
export class Invitation {
    @PrimaryColumn()
    id: string;

    @Column()
    organizationId: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    role: string;

    @Column()
    status: string;

    @Column({ nullable: true })
    expiresAt: Date;

    @Column()
    inviterId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
