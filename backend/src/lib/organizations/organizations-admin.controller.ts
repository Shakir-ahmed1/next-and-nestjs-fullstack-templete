import { Controller, Get, Delete, Param, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { OrganizationsService } from './organizations.service';

@Controller('api/admin/organizations')
export class OrganizationsAdminController {
    constructor(private orgService: OrganizationsService) { }

    @Get()
    async getAll(@Session() session: UserSession) {
        if (!session) throw new UnauthorizedException();
        // Check if user is a system admin
        if (session.user.role !== 'admin') {
            throw new ForbiddenException('Only system admins can access this resource');
        }
        return this.orgService.findAll();
    }

    @Delete(':id')
    async delete(@Session() session: UserSession, @Param('id') id: string) {
        if (!session) throw new UnauthorizedException();
        if (session.user.role !== 'admin') {
            throw new ForbiddenException('Only system admins can perform this action');
        }
        return this.orgService.delete(id);
    }
}
