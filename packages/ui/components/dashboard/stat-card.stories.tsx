import type { Meta, StoryObj } from "@storybook/react-vite"
import { StatCard } from "@/components/dashboard/stat-card"

const meta: Meta<typeof StatCard> = { title: "Dashboard/StatCard", component: StatCard }
export default meta
type Story = StoryObj<typeof StatCard>

export const Simple: Story = { args: { label: "Utilisateurs", value: "1 248", hint: "+12% ce mois" } }
