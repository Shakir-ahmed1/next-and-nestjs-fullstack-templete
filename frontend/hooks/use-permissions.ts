"use client";

import { authClient } from "@/lib/auth-client";
import { customRoles } from "@/lib/auth-permissions";
import React from "react";

/**
 * Hook to check permissions for the active organization.
 */
export function usePermissions() {
    const { data: activeOrg, isPending: isOrgPending } = authClient.useActiveOrganization();
    const { data: session, isPending: isSessionPending } = authClient.useSession();

    const isPending = isOrgPending || isSessionPending;

    const currentUserMember = React.useMemo(() => {
        if (!activeOrg || !session?.user) return null;
        return activeOrg.members.find(m => m.userId === session.user.id);
    }, [activeOrg, session]);

    const hasPermission = (permission: any) => {
        if (!currentUserMember?.role) return false;

        try {
            const roleName = currentUserMember.role as keyof typeof customRoles;
           
            const role = customRoles[roleName];

            if (!role) {
                console.warn(`Role "${roleName}" not found in customRoles`);
                return false;
            }

            // Cast to 'any' because TypeScript cannot guarantee compatibility between 
            // the different generic 'authorize' signatures in the roles union.
            // @type-ignore
            const { success } = (role as any).authorize(permission);

            return success;
        } catch (e) {
            console.error("Permission check failed", e);
            return false;
        }
    };

    return {
        hasPermission,
        activeOrg,
        role: currentUserMember?.role,
        isPending,
    };
}
