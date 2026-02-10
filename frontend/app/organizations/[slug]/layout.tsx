"use client";

import React from "react";
import NavSideContainer from "@/components/nav-side-container";
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
    Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HasPermission from "@/components/has-permission";

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const pathname = usePathname();
    const slug = params.slug as string;

    const { data: organization, isPending } = useQuery({
        queryKey: ["organization", slug],
        queryFn: async () => {
            const res = await authClient.organization.getFullOrganization({
                query: {
                    organizationSlug: slug
                }
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        }
    });

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
            title: "Settings",
            href: `/organizations/${slug}/settings`,
            icon: Settings,
            permissions: {
                organization: ["delete", "update"]
            }
        },
    ];

    if (isPending) {
        return (
            <NavSideContainer>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </NavSideContainer>
        );
    }

    if (!organization) {
        return (
            <NavSideContainer>
                <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                    <h1 className="text-xl font-bold">Organization not found</h1>
                    <Link href="/organizations" className="text-primary hover:underline">
                        Back to my organizations
                    </Link>
                </div>
            </NavSideContainer>
        );
    }

    return (
        <NavSideContainer>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 border-b pb-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded-lg">
                            <AvatarImage src={organization.logo || ""} />
                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-2xl">
                                {organization.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
                            <p className="text-muted-foreground">/{organization.slug}</p>
                        </div>
                    </div>

                    <nav className="flex space-x-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <HasPermission permissions={item.permissions} key={item.href} item={item.title}>
                                <Link
                        
                                    href={item.href}
                                    className={cn(
                                        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                                </HasPermission>
                            );
                        })}
                    </nav>
                </div>
                {children}
            </div>
        </NavSideContainer>
    );
}
