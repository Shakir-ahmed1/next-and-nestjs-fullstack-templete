"use client";

import React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { customAC } from "@/lib/auth-permissions";
import { permission } from "process";

interface PermissionGuardProps {
    permission?: any;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component to wrap parts of the UI that require specific permissions.
 */
export function PermissionGuard({
    children,
    permission,
    fallback = null,
}: PermissionGuardProps) {
    const { hasPermission, isPending } = usePermissions();
    if (isPending) return null;

    if (!permission || hasPermission(permission)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
