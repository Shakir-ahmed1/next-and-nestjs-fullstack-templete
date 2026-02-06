
import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Session } from '../../auth/entities/session.entity';
import { Account } from '../../auth/entities/account.entity';

@Entity('user')
export class User {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    emailVerified: boolean;

    @Column({ nullable: true })
    image: string;

    @Column({ default: 'user' })
    role: string;

    @Column({ default: false })
    banned: boolean;

    @Column({ nullable: true })
    banReason?: string;

    @Column({ type: "datetime", nullable: true })
    banExpires?: Date;
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Session, (session) => session.user)
    sessions: Session[];

    @OneToMany(() => Account, (account) => account.user)
    accounts: Account[];
}
