import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { organization } from 'better-auth/plugins';
import { Organization } from 'src/lib/auth/entities/organization.entity';
import { Member } from 'src/lib/auth/entities/member.entity';

@Injectable()
export class MembersService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        @InjectRepository(Member)
        private memberRepo: Repository<Member>,
    ) { }

    async getUserMemberships(userId: string) {
        return this.memberRepo.find({
            where: { userId },
            // 1. First, tell TypeORM to join the organization relation
            relations: {
                organization: true // Use the actual property name defined in your Member entity
            },
            // 2. Then, specify which columns to retrieve
            select: {
                id: true, // Always include the ID of the main entity
                role: true,
                organization: {
                    id: true, // You usually need the ID for the relation to map correctly
                    slug: true,
                    name: true,
                    logo: true,
                }
            }
        });
    }
}
