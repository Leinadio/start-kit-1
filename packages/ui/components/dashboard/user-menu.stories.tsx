import type { Meta, StoryObj } from "@storybook/react-vite"
import { UserMenu } from "@/components/dashboard/user-menu"

const meta: Meta<typeof UserMenu> = { title: "Dashboard/UserMenu", component: UserMenu }
export default meta
type Story = StoryObj<typeof UserMenu>

export const Defaut: Story = {}
