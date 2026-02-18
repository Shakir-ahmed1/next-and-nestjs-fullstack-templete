"use client";

import React from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import {
    Users,
    Settings,
    LayoutDashboard,
    Building2,
    Loader2,
    Shield,
    User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemberPermissionGuard } from "@/components/auth/member-permission-guard";
import { useOrganization } from "@/hooks/use-organization";

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const pathname = usePathname();
    const slug = params.slug as string;

    const { data: organization, isPending } = useOrganization(slug)

    const navItems = [
        {
            title: "Overview",
            href: `/organizations/${slug}`,
            icon: LayoutDashboard,

        },
        {
            title: "Members",
            href: `/organizations/${slug}/members`,
            icon: Users,
        },
        {
            title: "Roles",
            href: `/organizations/${slug}/roles`,
            icon: Shield,
            permissions: {
                ac: ["read"]
            }
        },
        {
            title: "Settings",
            href: `/organizations/${slug}/settings`,
            icon: Settings,
            permissions: {
                organization: ["delete", "update"]
            }
        },
        {
            title: "My Info",
            href: `/organizations/${slug}/my-info`,
            icon: User,
        },
    ];

    if (isPending) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <Building2 className="h-12 w-12 text-muted-foreground" />
                <h1 className="text-xl font-bold">Organization not found</h1>
                <Link href="/organizations" className="text-primary hover:underline">
                    Back to my organizations
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b pb-2">
                {/* <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 rounded-lg">
                        <AvatarImage src={organization.logo || ""} />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-2xl">
                            {organization.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
                        <p className="text-muted-foreground">/{organization.slug}aa</p>
                    </div>
                </div> */}

                <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar pb-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.title === "Overview" && pathname === `/organizations/${slug}`);
                        return (
                            <MemberPermissionGuard permission={item.permissions} key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm font-medium transition-colors whitespace-nowrap",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span className={cn(
                                        isActive ? "inline" : "hidden md:inline"
                                    )}>
                                        {item.title}
                                    </span>
                                </Link>
                            </MemberPermissionGuard>
                        );
                    })}
                </nav>
            </div>
            {children}
        </div>
    );
}
