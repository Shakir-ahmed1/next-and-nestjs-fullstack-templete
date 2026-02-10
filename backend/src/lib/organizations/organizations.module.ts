import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../auth/entities/organization.entity';
import { Member } from '../auth/entities/member.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationsAdminController } from './organizations-admin.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Organization, Member])],
    controllers: [OrganizationsAdminController],
    providers: [OrganizationsService],
    exports: [OrganizationsService],
})
export class OrganizationsModule { }
