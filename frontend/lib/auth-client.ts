import { NEXT_PUBLIC_API_URL } from "@/config";
import { createAuthClient } from "better-auth/react";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { customMemberAC, customMemberRoles } from "./auth-member-permissions";
import { customUserAc, customUserRoles } from "./auth-user-permissions";

export const authClient = createAuthClient({
    baseURL: NEXT_PUBLIC_API_URL + '/auth', // Points to NestJS backend
    plugins: [
        adminClient(
            {
                roles: customUserRoles,
                ac: customUserAc,
            }
        ),
        organizationClient(
            {
                ac: customMemberAC,
                roles: customMemberRoles,
                
                dynamicAccessControl: {
                    enabled: true,
                },
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