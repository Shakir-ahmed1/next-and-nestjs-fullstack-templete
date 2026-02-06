import React from "react";
import NavSideContainer from "@/components/nav-side-container";
import { requireAuth } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await requireAuth();

    if (session.user.role !== "admin") {
        redirect("/");
    }

    return <NavSideContainer>{children}</NavSideContainer>;
}
