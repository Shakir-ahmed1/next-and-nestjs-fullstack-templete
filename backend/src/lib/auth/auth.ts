
import { betterAuth } from "better-auth";
import { typeormAdapter } from "@hedystia/better-auth-typeorm";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "../users/entities/user.entity";

export const getBetterAuthConfig = (config: ConfigService, dataSource: DataSource) => {
    return betterAuth({
        baseURL: config.get('PUBLIC_URL'),
        trustedOrigins: [
            config.get('PUBLIC_URL', ''),
            `http://localhost:${config.get('FRONTEND_PORT')}`,
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
                clientId: config.get('GOOGLE_CLIENT_ID', ''),
                clientSecret: config.get('GOOGLE_CLIENT_SECRET', ''),
            }
        },
        // Secret is required for production, good to have it anyway
        secret: config.get('BETTER_AUTH_SECRET', 'a-very-secret-key-change-it-in-prod'),
    });
};
