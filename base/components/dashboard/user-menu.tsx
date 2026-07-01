"use client"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "@/lib/auth/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const router = useRouter()
  const { data } = useSession()
  const email = data?.user.email ?? ""
  const initial = email ? email.charAt(0).toUpperCase() : "?"

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Menu utilisateur">
        <Avatar>
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{email}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>Se déconnecter</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
