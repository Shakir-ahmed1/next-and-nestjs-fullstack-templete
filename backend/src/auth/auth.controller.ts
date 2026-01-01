import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { auth } from './auth';
import { toNodeHandler } from 'better-auth/node';

@Controller('api/auth/temp')
export class AuthController {
    // @All('*')
    // async handle(@Req() req: Request, @Res() res: Response) {
    //     // return toNodeHandler(auth)(req, res);
    // }
}
