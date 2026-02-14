// components/app-sidebar.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserProfile } from "@/hooks/use-profile";
import { useMemberPermissions } from "@/hooks/use-member-permissions";
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
  PanelLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { handleSignOut } from "@/lib/auth-client";
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
import Image from "next/image";
import { Fragment } from "react/jsx-runtime";
import { canAccessAdminPage } from "@/lib/admin-helpers";

const menuItems = [
  { title: "Organizations", icon: Building2, href: "/organizations" },
  // { title: "Dashboard", icon: LayoutDashboard, href: "/" },
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
];

export function AppSidebar() {
  const { data: user, isLoading } = useUserProfile();
  const { hasMemberPermission } = useMemberPermissions();
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"


  if (!user) return;
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return hasMemberPermission(item.permission as any);
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarHeader className="border-b">



          {/* <SidebarMenu>
              <SidebarMenuItem>
              <SidebarTrigger></SidebarTrigger>
              <SidebarGroupLabel className="text-lg font-semibold">
                Native
              </SidebarGroupLabel>

            </SidebarMenu> */}
          <SidebarMenuItem className="list-none">
            {/* We use a div instead of SidebarMenuButton as the wrapper 
      to avoid the 'asChild' single-element restriction.
    */}
            <div className="group relative flex h-12 justify-between items-center px-2">

              {/* 1. THE LOGO & TEXT AREA */}
              <>
                <Link
                  href="/"
                  className={`flex items-center gap-2 transition-opacity duration-200 ${isCollapsed ? "group-hover:opacity-0" : "opacity-100"
                    }`}
                >
                  <Image src="/native-logo-2.png" alt="Logo" width={24} height={24} className="shrink-0" />
                  {state === "expanded" && (
                    <span className="font-semibold whitespace-nowrap">Native PLC</span>
                  )}
                </Link>

                {/* 2. THE COLLAPSED HOVER TRIGGER */}
                {isCollapsed && (
                  <button
                    onClick={toggleSidebar}
                    className="absolute h-6 w-6 flex items-center justify-center rounded-md border bg-background opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
                    title="Expand Sidebar"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                )}
              </>

              {/* 3. THE EXPANDED TRIGGER (Standard shadcn position) */}
              {!isCollapsed && (
                <Fragment >
                  <SidebarTrigger className="h-6 w-6" />
                </Fragment>
              )}

            </div>
          </SidebarMenuItem>          {/* </SidebarMenuItem> */}

        </SidebarHeader>
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

        {canAccessAdminPage(user?.role) && (
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