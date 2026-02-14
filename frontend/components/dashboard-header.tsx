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
    <header className="flex items-center justify-between border-b bg-background/95 backdrop-blur px-4 py-3 sticky  gap-7 top-0 z-50">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              className="w-auto px-2 hover:bg-accent hover:text-accent-foreground flex items-center gap-3 justify-start
              min-w-50 max-w-100
              md:min-w-100 
              md:max-w-150
              "
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
                <h1 className="text-2xl font-bold tracking-tight truncate">{activeOrg?.name || "Select Organization"}</h1>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]
                          min-w-90 max-w-100
              md:min-w-100 md:max-w-150"
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
                <h1 className="text-2xl font-bold tracking-tight truncate">{org.name}</h1>
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
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary w-64"
          />
        </div>

        <Button variant="ghost" size="icon" >
          <Link href="/notifications" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="icon"
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