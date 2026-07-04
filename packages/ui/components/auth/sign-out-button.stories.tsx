import type { Meta, StoryObj } from "@storybook/react-vite"
import { SignOutButton } from "@/components/auth/sign-out-button"

const meta: Meta<typeof SignOutButton> = { title: "Auth/SignOutButton", component: SignOutButton }
export default meta
export const Defaut: StoryObj<typeof SignOutButton> = {}
