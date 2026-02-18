// components/dashboard-header.tsx
"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Bell, Search, Building2, ChevronsUpDown, Plus } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation"
import Link from "next/link"
import ActiveOrganizationContext, { useActiveOrganizationContext } from "@/hooks/contexts/active-organization"


export function DashboardHeader() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { data: organizations } = authClient.useListOrganizations();
  const { activeOrg, handleSetActiveOrg } = useActiveOrganizationContext()
  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  return (
    <header className="flex items-center justify-between border-b bg-background/95 backdrop-blur px-2 md:px-4 py-3 sticky top-0 z-50 gap-2 md:gap-7">
      <div className="flex items-center gap-2 md:gap-3">
        <SidebarTrigger className="md:hidden" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-auto px-2 hover:bg-accent hover:text-accent-foreground flex items-center gap-2 md:gap-3 justify-start
              min-w-fit max-w-[150px] md:max-w-none
              "
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
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
              <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
                <h1 className="text-sm md:text-xl font-bold tracking-tight truncate">{activeOrg?.name || "Select Org"}</h1>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[200px] md:w-[--radix-dropdown-menu-trigger-width]"
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
                <div className="flex size-6 items-center justify-center rounded-sm border shrink-0">
                  <Avatar className="h-4 w-4 rounded-sm">
                    <AvatarImage src={org.logo || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {org.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="truncate font-medium">{org.name}</span>
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
      </div>
      <div className="flex items-center gap-1 md:gap-3">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary w-40 xl:w-64"
          />
        </div>

        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Link href="/notifications" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          title="Toggle theme"
        >
          {!mounted ? (
            <div className="h-5 w-5" />
          ) : resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header >
  )
}