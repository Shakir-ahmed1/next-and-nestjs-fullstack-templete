"use client";

import { authClient } from "@/lib/auth-client";
import { customUserRoles } from "@/lib/auth-user-permissions";

export function useUserPermissions() {
    const { data: session, isPending } = authClient.useSession();


    // Pre-calculate the member once
    const currentUser = session?.user;
    if (!currentUser) return {
        hasUserPermission: () => false,
        role: "user",
        isPending,
    };

    // This is now a simple, synchronous function again
    const hasUserPermission = (permission: string): boolean => {
        if (!currentUser.role) return false;

        try {
            const roleName = currentUser.role as keyof typeof customUserRoles;
            const role = customUserRoles[roleName];

            if (role) {
                // Assuming authorize() is a synchronous method in your customRoles config
                const { success } = (role as any).authorize(permission);
                return success;
            }
        } catch (e) {
            console.error("Static user permission check failed", e);
        }
        return false;
    }

    return {
        hasUserPermission, // Works exactly like your old function!
        role: currentUser.role,
        isPending,
    };
}