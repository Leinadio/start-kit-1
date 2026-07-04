import type { Meta, StoryObj } from "@storybook/react-vite"
import { PasswordForm } from "@/components/account/password-form"

const meta: Meta<typeof PasswordForm> = { title: "Account/PasswordForm", component: PasswordForm }
export default meta
export const Defaut: StoryObj<typeof PasswordForm> = {}
