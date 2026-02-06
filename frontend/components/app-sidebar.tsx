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
import {
  BarChart3,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { handleSignOut } from "@/lib/auth-client";
import { Button } from "./ui/button";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { title: "Products", icon: Package, href: "/dashboard/products" },
  { title: "Orders", icon: ShoppingCart, href: "/dashboard/orders" },
  { title: "Customers", icon: Users, href: "/dashboard/customers" },
  { title: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function AppSidebar() {
  const { data: user, isLoading } = useUserProfile();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">
            My App
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Change this block: */}
            {/* The 'href' for navigation should be handled differently, perhaps with `next/link` or an event handler for signing out. */}
            {/* For styling purposes, the content (icon and text) needs to be directly within the button/link component */}
            <SidebarMenuButton asChild>
              {/* Use a Link component and place content inside it for proper flex alignment */}
              <div onClick={handleSignOut} className="flex items-center gap-3 w-full p-1 cursor-pointer">
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton className="w-full p-1">
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
                    <Link href='/profile'>
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