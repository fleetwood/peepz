"use client"

import AsyncContainer from '@/components/layout/AsyncContainer'
import Login from '@/components/Login'
import { useCurrentUser } from '@/context/CurrentUserProvider'

import { useLayout } from '@/context/LayoutProvider'
import type { ThemeName } from '@peeps/ui'
import { themeNames, themes } from '@peeps/ui'
import { Check, ChevronRight, Egg, Leaf, Moon, Sun, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu'

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
  const { auth, user, userLoading } = useCurrentUser()
  const { setTheme, theme, colorTheme, mode, navigate } = useLayout()
  const mounted = useMounted()
  const currentTheme = colorTheme as ThemeName

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
        <div className="flex items-center justify-center gap-3 px-2 md:justify-start bg-muted">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <User className="h-5 w-5 text-secondary-foreground" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden text-left md:block" type="button">
                <p>{displayName}</p>
                {showEmail && <p className="text-muted-foreground">{email}</p>}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent
                className="z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
              >
                <DropdownMenuItem
                  className="cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                  onSelect={() => {
                    navigate('/notifications')
                  }}
                >
                  Notifications
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                  onSelect={() => {
                    navigate('/profile')
                  }}
                >
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                  onSelect={() => {
                    navigate('/settings')
                  }}
                >
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 h-px bg-border" />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex w-full cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent
                      sideOffset={8}
                      className="z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
                    >
                      <DropdownMenuItem
                        className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                        disabled={!mounted}
                        onSelect={() => {
                          setTheme(`${colorTheme}-system`)
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          System
                        </span>
                        {mounted && mode === 'system' && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                        disabled={!mounted}
                        onSelect={() => {
                          setTheme(`${colorTheme}-light`)
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </span>
                        {mounted && mode === 'light' && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                        disabled={!mounted}
                        onSelect={() => {
                          setTheme(`${colorTheme}-dark`)
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </span>
                        {mounted && mode === 'dark' && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 h-px bg-border" />
                      {themeNames.map((name) => {
                        const meta = themes[name]
                        const isActive = mounted && currentTheme === name
                        return (
                          <DropdownMenuItem
                            key={name}
                            className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                            disabled={!mounted}
                            onSelect={() => {
                              setTheme(`${name}-${mode === 'system' ? 'light' : mode}`)
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <ThemeIcon icon={meta.icon} />
                              {meta.name}
                            </span>
                            {isActive && <Check className="h-4 w-4" />}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuItem
                  className="cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                  onSelect={async () => {
                    await auth.signOut()
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>
          )
        })()
      )}
    </AsyncContainer>
  )
}

UserSidebar.displayName = "UserSidebar"
export default UserSidebar