"use client";

import { authClient } from "@/lib/auth-client";
import { customRoles } from "@/lib/auth-permissions";
import React from "react";

export function usePermissions() {
    const { data: activeOrg, isPending: isOrgPending } = authClient.useActiveOrganization();
    const { data: session, isPending: isSessionPending } = authClient.useSession();

    const isPending = isOrgPending || isSessionPending;

    // Pre-calculate the member once
    const currentUserMember = React.useMemo(() => {
        if (!activeOrg || !session?.user) return null;
        return activeOrg.members.find(m => m.userId === session.user.id);
    }, [activeOrg, session]);

    // This is now a simple, synchronous function again
    const hasPermission = React.useCallback((permission: string): boolean => {
        if (!currentUserMember?.role) return false;

        try {
            const roleName = currentUserMember.role as keyof typeof customRoles;
            const role = customRoles[roleName];

            if (role) {
                // Assuming authorize() is a synchronous method in your customRoles config
                const { success } = (role as any).authorize(permission);
                return success;
            }
        } catch (e) {
            console.error("Static permission check failed", e);
        }

        return false;
    }, [currentUserMember]);

    return {
        hasPermission, // Works exactly like your old function!
        activeOrg,
        role: currentUserMember?.role,
        isPending,
    };
}