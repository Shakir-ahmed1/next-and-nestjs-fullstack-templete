import { Controller, Get, Delete, Param, InternalServerErrorException, Put } from '@nestjs/common';
import { Roles, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { OrganizationsService } from './organizations.service';

@Controller('api/admin/organizations')
export class OrganizationsAdminController {
    constructor(private orgService: OrganizationsService) { }

    @Get()
    @Roles(['admin', 'owner', 'super_owner'])
    async getAll(@Session() session: UserSession) {
        return this.orgService.findAll();
    }

    @Delete(':id')
    @Roles(['admin', 'owner', 'super_owner'])
    async delete(@Session() session: UserSession, @Param('id') id: string) {
        return this.orgService.delete(id);
    }
    @Put(':id')
    @Roles(['admin', 'owner', 'super_owner'])
    async updateOrg(@Session() session: UserSession, @Param('id') id: string) {
        throw new InternalServerErrorException("Methode not implemented")
    }
}
