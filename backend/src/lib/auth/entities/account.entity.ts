
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('account')
export class Account {
    @PrimaryColumn()
    id: string;

    @Column()
    accountId: string;

    @Column()
    providerId: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'text', nullable: true })
    accessToken: string;

    @Column({ type: 'text', nullable: true })
    refreshToken: string;

    @Column({ type: 'text', nullable: true })
    idToken: string;

    @Column({ nullable: true })
    accessTokenExpiresAt: Date;

    @Column({ nullable: true })
    refreshTokenExpiresAt: Date;

    @Column({ nullable: true })
    scope: string;

    @Column({ nullable: true })
    password: string;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}
