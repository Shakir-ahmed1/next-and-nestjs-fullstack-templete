import React from "react";
import { requireAuth } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { canAccessAdminPage } from "@/lib/admin-helpers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user }= await requireAuth();

    if (!(canAccessAdminPage(user.role))) {
        redirect("/");
    }

    return <>{children}</>;
}
