// app/(dashboard)/layout.tsx
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { requireAuth } from "@/lib/auth-helpers"

export default async function NavSideContainer({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="w-full px-4 py-4 md:px-6 lg:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}