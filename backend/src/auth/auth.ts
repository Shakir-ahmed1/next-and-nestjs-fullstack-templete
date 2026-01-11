
import { betterAuth } from "better-auth";
import { PUBLIC_URL, FRONTEND_PORT, DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "config";
import { createPool } from "mysql2/promise";

export const auth = betterAuth({
    baseURL: PUBLIC_URL,
    trustedOrigins(request) {
        return [PUBLIC_URL, `http://localhost:${FRONTEND_PORT}`]
    },
    database: createPool({
        uri: DATABASE_URL,
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
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
        }
    }
});
