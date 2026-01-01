// components/dashboard-header.tsx
"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Bell, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  return (
    <header className="flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
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

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && theme === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  )
}