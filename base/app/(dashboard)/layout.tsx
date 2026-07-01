import { redirect } from "next/navigation"
import { adapters } from "@/lib/adapters"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await adapters.auth.getSession()
  if (!session) redirect("/login")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardTopbar />
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
