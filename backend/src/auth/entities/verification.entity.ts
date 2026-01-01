
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('verification')
export class Verification {
    @PrimaryColumn()
    id: string;

    @Column()
    identifier: string;

    @Column()
    value: string;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    createdAt: Date;

    @Column({ nullable: true })
    updatedAt: Date;
}
