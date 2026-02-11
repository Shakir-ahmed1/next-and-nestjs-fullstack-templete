import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

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

    @ManyToOne(() => Organization, (organization) => organization.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;
}
