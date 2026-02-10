// components/app-sidebar.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUserProfile } from "@/hooks/use-profile";
import { usePermissions } from "@/hooks/use-permissions";
import {
  BarChart3,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Building2,
  ChevronsUpDown,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { authClient, handleSignOut } from "@/lib/auth-client";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    permission: { finance: ["read"] } as const
  },
  {
    title: "Products",
    icon: Package,
    href: "/dashboard/products",
    permission: { inventory: ["read"] } as const
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/dashboard/orders",
    permission: { sales: ["read"] } as const
  },
  {
    title: "Customers",
    icon: Users,
    href: "/dashboard/customers",
    permission: { sales: ["read"] } as const
  },
  { title: "Settings", icon: Settings, href: "/dashboard/settings" },
  { title: "Organizations", icon: Building2, href: "/organizations" },
];

export function AppSidebar() {
  const { data: user, isLoading } = useUserProfile();
  const { data: activeOrg, isPending: isOrgPending } = authClient.useActiveOrganization();
  const { data: organizations } = authClient.useListOrganizations();
  const { hasPermission } = usePermissions();

  const handleSetActiveOrg = async (orgSlug: string) => {
    await authClient.organization.setActive({
      organizationSlug: orgSlug,
    });
    redirect(`/organizations/${orgSlug}`);
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission as any);
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="border-b">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {activeOrg ? (
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={activeOrg.logo || undefined} />
                        <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                          {activeOrg.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Building2 className="size-4" />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold uppercase text-xs">
                      {activeOrg?.name || "Select Organization"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Organizations
                </DropdownMenuLabel>
                {organizations?.map((org) => (
                  <DropdownMenuItem
                    key={org.slug}
                    onClick={() => handleSetActiveOrg(org.slug)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <Avatar className="h-4 w-4 rounded-sm">
                        <AvatarImage src={org.logo || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {org.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {org.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/organizations" className="flex items-center gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">
                      Manage Organizations
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">
            My App
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-lg font-semibold">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin">
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/users">
                      <Users className="h-5 w-5" />
                      <span>Manage Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/organizations">
                      <Building2 className="h-5 w-5" />
                      <span>Manage Organizations</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Organization Switcher */}

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div onClick={handleSignOut} className="flex items-center gap-3 w-full p-1 cursor-pointer">
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="w-full">
              <div className="flex items-center gap-3 w-full">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || undefined} alt={user?.name} />
                      <AvatarFallback className="text-xs font-semibold bg-linear-to-br from-blue-500 to-purple-600">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Link href='/profile' className="flex-1 overflow-hidden">
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium truncate">{user?.name || "User"}</span>
                        <span className="text-xs text-muted-foreground truncate pb-1">
                          {user?.email || "user@example.com"}
                        </span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}