
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('session')
export class Session {
    @PrimaryColumn()
    id: string;

    @Column()
    expiresAt: Date;

    @Column({ unique: true })
    token: string;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}
