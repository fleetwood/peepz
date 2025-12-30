"use client"

import Login from '@/components/Login'
import { useCurrentUser } from '@/context/CurrentUserProvider'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { User } from 'lucide-react'

export type UserSidebarProps = Record<string, never>

const UserSidebar = (_props: UserSidebarProps) => {
  const { auth, user, userLoading } = useCurrentUser()

  if (userLoading) return null

  if (!user) {
    return <Login buttonText="Log in" className="w-full" />
  }

  const displayName = user.person?.preferredName ?? user.person?.name?.[0] ?? 'User'
  const email = user.auth?.email ?? ''

  return (
    <div className="flex items-center justify-center gap-3 px-2 md:justify-start">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
        <User className="h-5 w-5 text-secondary-foreground" />
      </div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="hidden text-left md:block" type="button">
            <p className="text-foreground">{displayName}</p>
            <p className="text-muted-foreground">{email}</p>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
          >
            <DropdownMenu.Item
              className="cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
              onSelect={async () => {
                await auth.signOut()
              }}
            >
              Log out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}

UserSidebar.displayName = "UserSidebar"
export default UserSidebar