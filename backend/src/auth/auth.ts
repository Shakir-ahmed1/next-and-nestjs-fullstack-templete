
import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise";

export const auth = betterAuth({

    trustedOrigins(request) {
        return ['http://localhost:3001']
    },
    database: createPool({
        uri: process.env.DATABASE_URL,
        connectionLimit: 10,
        timezone: "Z", // Important to ensure consistent timezone values
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }) => {
            console.log(`Reset password for ${user.email}: ${url}`);
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "GOOGLE_CLIENT_SECRET",
        }
    }
});
