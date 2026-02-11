import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrganizationRole } from './organization-role.entity';

@Entity('organization')
export class Organization {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ nullable: true })
    logo: string;

    @Column({ type: 'text', nullable: true })
    metadata: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => OrganizationRole, (role) => role.organization)
    roles: OrganizationRole[];
}
