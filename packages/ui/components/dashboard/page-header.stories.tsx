import type { Meta, StoryObj } from "@storybook/react-vite"
import { PageHeader } from "@/components/dashboard/page-header"

const meta: Meta<typeof PageHeader> = { title: "Dashboard/PageHeader", component: PageHeader }
export default meta
type Story = StoryObj<typeof PageHeader>

export const Simple: Story = { args: { title: "Factures" } }
export const AvecDescription: Story = {
  args: { title: "Factures", description: "Vos factures récentes" },
}
