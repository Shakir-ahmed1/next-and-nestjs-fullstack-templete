import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('organizationRole')
export class OrganizationRole {
    @PrimaryColumn()
    id: string;

    @Column()
    role: string;

    @Column({ type: 'text', nullable: true })
    permission: string;

    @Column()
    organizationId: string;

    @ManyToOne(() => Organization, (organization) => organization.roles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
