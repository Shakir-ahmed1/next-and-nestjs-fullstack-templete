import React from "react";
import NavSideContainer from "@/components/nav-side-container"
import { requireAuth } from "@/lib/auth-helpers";


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await requireAuth()
    return <NavSideContainer>{children}</NavSideContainer>;
}