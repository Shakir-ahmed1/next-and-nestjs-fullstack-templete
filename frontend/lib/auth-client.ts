import { NEXT_PUBLIC_API_URL } from "@/config";
import { createAuthClient } from "better-auth/react";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { customAC, customRoles } from "./auth-permissions";

export const authClient = createAuthClient({
    baseURL: NEXT_PUBLIC_API_URL + '/auth', // Points to NestJS backend
    plugins: [
        adminClient(),
        organizationClient(
            {
                ac: customAC,
                roles: customRoles,
            }
        ),
    ],
})

export const handleSignOut = async () => {
    await authClient.signOut({
        fetchOptions: {
            onError: (ctx) => {
                toast.error(ctx.error.message);
            },
            onSuccess: async () => {
                toast.success("You have been signed out");
            },
        }
    })
    redirect('/signin')
}