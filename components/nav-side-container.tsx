// app/(dashboard)/layout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export default function NavSideContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}