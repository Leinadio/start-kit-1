import type { Meta, StoryObj } from "@storybook/react-vite"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar"

const meta: Meta<typeof DashboardTopbar> = {
  title: "Dashboard/DashboardTopbar",
  component: DashboardTopbar,
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof DashboardTopbar>

export const Defaut: Story = {}
