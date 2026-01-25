
import { betterAuth, Path } from "better-auth";
import { typeormAdapter } from "@hedystia/better-auth-typeorm";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { openAPI, OpenAPIModelSchema } from "better-auth/plugins";
import { COOKIE_PREFIX } from "./auth.config";
import { sendEmail, sendResetPasswordEmail } from "../utils/send-email";

const logger = new Logger('BetterAuth');

export const getBetterAuthConfig = (configService: ConfigService, dataSource: DataSource) => {
    const auth = betterAuth({
        baseURL: configService.get('PUBLIC_URL'),
        trustedOrigins: [
            configService.get('PUBLIC_URL', ''),
            `http://localhost:${configService.get('FRONTEND_PORT')}`,
        ],
        database: typeormAdapter(dataSource),
        emailAndPassword: {
            enabled: true,
            sendResetPassword: sendResetPasswordEmail,

        },
        socialProviders: {
            google: {
                clientId: configService.get('GOOGLE_CLIENT_ID', ''),
                clientSecret: configService.get('GOOGLE_CLIENT_SECRET', ''),
            }
        },
        // Secret is required for production, good to have it anyway
        secret: configService.get('AUTH_SECRET', 'a-very-secret-key-change-it-in-prod'),
        logger: {
            enabled: true,
            level: 'debug',
            log: (level, message, ...args) => {
                // Custom logging implementation
                logger.log(`[${level}] ${message}`, args);
            }
        },
        plugins: [
            openAPI(),
        ],
        advanced: {
            cookiePrefix: COOKIE_PREFIX,
        }
    },
    );
    return auth;
};


