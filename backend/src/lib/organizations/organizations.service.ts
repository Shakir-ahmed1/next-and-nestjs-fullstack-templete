import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../auth/entities/organization.entity';
import { Member } from '../auth/entities/member.entity';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        @InjectRepository(Member)
        private memberRepo: Repository<Member>,
    ) { }

    async findAll() {
        return this.orgRepo.find({
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: string) {
        return this.orgRepo.findOne({ where: { id } });
    }

    async getMembers(orgId: string) {
        return this.memberRepo.find({ where: { organizationId: orgId } });
    }

    async delete(id: string) {
        await this.memberRepo.delete({ organizationId: id });
        return this.orgRepo.delete(id);
    }
}
