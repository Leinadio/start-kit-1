import type { Meta, StoryObj } from "@storybook/react-vite"
import { EmailForm } from "@/components/account/email-form"

const meta: Meta<typeof EmailForm> = { title: "Account/EmailForm", component: EmailForm }
export default meta
export const Defaut: StoryObj<typeof EmailForm> = {}
