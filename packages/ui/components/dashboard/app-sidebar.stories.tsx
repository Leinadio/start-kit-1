import type { Meta, StoryObj } from "@storybook/react-vite"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

const meta: Meta<typeof AppSidebar> = {
  title: "Dashboard/AppSidebar",
  component: AppSidebar,
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof AppSidebar>

export const Defaut: Story = {}
