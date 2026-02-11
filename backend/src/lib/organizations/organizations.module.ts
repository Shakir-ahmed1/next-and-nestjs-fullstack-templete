import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../auth/entities/organization.entity';
import { Member } from '../auth/entities/member.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationsAdminController } from './organizations-admin.controller';
import { MembersController } from './members/members.controller';
import { MembersService } from './members/members.serivice';

@Module({
    imports: [TypeOrmModule.forFeature([Organization, Member])],
    controllers: [OrganizationsAdminController, MembersController],
    providers: [OrganizationsService, MembersService],
    exports: [OrganizationsService, MembersService],
})
export class OrganizationsModule { }
