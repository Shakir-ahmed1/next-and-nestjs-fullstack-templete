import { Controller, Get, Delete, Param, InternalServerErrorException, Put } from '@nestjs/common';
import { Roles, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { OrganizationsService } from './organizations.service';
import { UserAdminRoles } from '../auth/admin-helpers';

@Controller('api/admin/organizations')
export class OrganizationsAdminController {
    constructor(private orgService: OrganizationsService) { }

    @Get()
    @Roles(UserAdminRoles)
    async getAll(@Session() session: UserSession) {
        return this.orgService.findAll();
    }

    @Delete(':id')
    @Roles(UserAdminRoles)
    async delete(@Session() session: UserSession, @Param('id') id: string) {
        return this.orgService.delete(id);
    }
    @Put(':id')
    @Roles(UserAdminRoles)
    async updateOrg(@Session() session: UserSession, @Param('id') id: string) {
        throw new InternalServerErrorException("Methode not implemented")
    }
}
