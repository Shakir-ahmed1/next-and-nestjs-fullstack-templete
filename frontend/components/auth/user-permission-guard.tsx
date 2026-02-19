"use client";

import React from "react";
import { useUserPermissions } from "@/hooks/use-user-permissions";
import { UserRole, UserRoles } from "@/lib/admin-helpers";
interface UserPermissionGuardProps {
    permissions?: any;
    children: React.ReactNode;
    condition?:  '>' | '<' | '==' | '>= ' | '<=' | '!=';
    fallback?: React.ReactNode;
    targetRole?: UserRole;
    targetValue?: number;
}

export const rolePower = {
    user: 0,
    admin: 1,
    owner: 2,
    super_owner: 3,
}
/**
 * Component to wrap parts of the UI that require specific permissions.
 */
export function UserPermissionGuard({
    children,
    permissions, 
    targetRole,
    fallback = null,
}: UserPermissionGuardProps) {
    const { hasUserPermission, isPending, role: currentRole } = useUserPermissions();

    if (isPending) return null;

    if (!permissions || hasUserPermission(permissions)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
