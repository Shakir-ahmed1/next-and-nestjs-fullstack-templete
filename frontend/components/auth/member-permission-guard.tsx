"use client";

import React from "react";
import { useMemberPermissions } from "@/hooks/use-member-permissions";
interface MemberPermissionGuardProps {
    permission?: any;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component to wrap parts of the UI that require specific permissions.
 */
export function MemberPermissionGuard({
    children,
    permission,
    fallback = null,
}: MemberPermissionGuardProps) {
    const { hasMemberPermission, isPending } = useMemberPermissions();
    if (isPending) return null;

    if (!permission || hasMemberPermission(permission)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
