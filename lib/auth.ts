import { PrismaClient } from "@/app/generated/prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { betterAuth } from 'better-auth';
import { sendEmail } from "./utils";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "@/config";

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "mysql",
    }),

    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                text: `Click the link to reset your password: ${url}`,
            });
        },
        onPasswordReset: async ({ user }, request) => {
            // your logic here
            console.log(`Password for user ${user.email} has been reset.`);
        },
    },
    socialProviders: {
        google: {
            clientId: GOOGLE_CLIENT_ID!,
            clientSecret: GOOGLE_CLIENT_SECRET!,
            prompt: "select_account",
        },
    },
    plugins: [nextCookies()], // make sure this is the last plugin in the array
});
