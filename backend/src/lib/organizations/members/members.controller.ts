import { Controller, Get, Session } from "@nestjs/common";
import { MembersService } from "./members.serivice";
import { get } from "http";
import type{ UserSession } from "@thallesp/nestjs-better-auth";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Members')
@Controller('api/members')
export class MembersController {
    constructor(private readonly membersService: MembersService) {
        
     }
    
    @Get('user-memberships')
    async getUserMemberships(@Session() session: UserSession) {
        return this.membersService.getUserMemberships(session.user.id);
    }
}
