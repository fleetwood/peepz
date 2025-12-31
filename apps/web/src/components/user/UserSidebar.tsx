"use client"

import AsyncContainer from '@/components/layout/AsyncContainer'
import Login from '@/components/Login'
import { useCurrentUser } from '@/context/CurrentUserProvider'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { ThemeName } from '@peeps/ui'
import { themeNames, themes } from '@peeps/ui'
import { Check, ChevronRight, Egg, Leaf, Moon, Sun, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

type UserSidebarProps = Record<string, never>

const emptySubscribe = () => () => {}
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

function ThemeIcon(props: { icon: string }) {
  switch (props.icon) {
    case 'sun':
      return <Sun className="h-4 w-4" />
    case 'moon':
      return <Moon className="h-4 w-4" />
    case 'egg':
      return <Egg className="h-4 w-4" />
    case 'leaf':
      return <Leaf className="h-4 w-4" />
    default:
      return <Sun className="h-4 w-4" />
  }
}

const UserSidebar = (_props: UserSidebarProps) => {
  const router = useRouter()
  const { auth, user, userLoading } = useCurrentUser()
  const { setTheme, theme } = useTheme()
  const mounted = useMounted()
  const currentTheme = ((theme as ThemeName | undefined) ?? themeNames[0])

  return (
    <AsyncContainer isLoading={[userLoading]}>
      {!user ? (
        <Login buttonText="Log in" className="w-full" />
      ) : (
        (() => {
          const rawDisplayName = user.person?.preferredName ?? user.person?.name?.[0] ?? 'User'
          const email = user.auth?.email ?? ''
          const displayName = rawDisplayName.includes('@') ? 'User' : rawDisplayName
          const showEmail = email.length > 0 && email.toLowerCase() !== displayName.toLowerCase()

          return (
        <div className="flex items-center justify-center gap-3 px-2 md:justify-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <User className="h-5 w-5 text-secondary-foreground" />
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="hidden text-left md:block" type="button">
                <p className="text-foreground">{displayName}</p>
                {showEmail && <p className="text-muted-foreground">{email}</p>}
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
                  onSelect={() => {
                    router.push('/notifications')
                  }}
                >
                  Notifications
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                  onSelect={() => {
                    router.push('/profile')
                  }}
                >
                  Profile
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  className="cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                  onSelect={() => {
                    router.push('/settings')
                  }}
                >
                  Settings
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-border" />

                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger className="flex w-full cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
                    <span>Theme</span>
                    <ChevronRight className="h-4 w-4" />
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent
                      sideOffset={8}
                      className="z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
                    >
                      {themeNames.map((name) => {
                        const meta = themes[name]
                        const isActive = mounted && currentTheme === name
                        return (
                          <DropdownMenu.Item
                            key={name}
                            className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                            disabled={!mounted}
                            onSelect={() => {
                              setTheme(name)
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <ThemeIcon icon={meta.icon} />
                              {meta.name}
                            </span>
                            {isActive && <Check className="h-4 w-4" />}
                          </DropdownMenu.Item>
                        )
                      })}
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>

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
        })()
      )}
    </AsyncContainer>
  )
}

UserSidebar.displayName = "UserSidebar"
export default UserSidebar