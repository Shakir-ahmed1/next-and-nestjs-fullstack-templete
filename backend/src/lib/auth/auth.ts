
import { betterAuth } from "better-auth";
import { typeormAdapter } from "@hedystia/better-auth-typeorm";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "../users/entities/user.entity";

export const getBetterAuthConfig = (configService: ConfigService, dataSource: DataSource) => {
    return betterAuth({
        baseURL: configService.get('PUBLIC_URL'),
        trustedOrigins: [
            configService.get('PUBLIC_URL', ''),
            `http://localhost:${configService.get('FRONTEND_PORT')}`,
        ],
        database: typeormAdapter(dataSource),
        emailAndPassword: {
            enabled: true,
            sendResetPassword: async ({ user, url }) => {
                console.log(`Reset password for ${user.email}: ${url}`);
            },
        },
        socialProviders: {
            google: {
                clientId: configService.get('GOOGLE_CLIENT_ID', ''),
                clientSecret: configService.get('GOOGLE_CLIENT_SECRET', ''),
            }
        },
        // Secret is required for production, good to have it anyway
        secret: configService.get('AUTH_SECRET', 'a-very-secret-key-change-it-in-prod'),
    });
};
