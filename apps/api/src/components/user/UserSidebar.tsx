"use client"

import AsyncContainer from '@/components/layout/AsyncContainer'
import Login from '@/components/Login'
import { useCurrentUser } from '@/context/CurrentUserProvider'

import { useLayout } from '@/context/LayoutProvider'
import type { ThemeName } from '@peeps/ui'
import { themeNames, themes } from '@peeps/ui'
import { Check, Computer, Egg, Leaf, LucideProps, Moon, Sun, User } from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes, useSyncExternalStore } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '../ui/dropdown-menu'

type UserSidebarProps = Record<string, never>

const emptySubscribe = () => () => {}
const useMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false)

type ModeTypes = {
  value: 'system' | 'light' | 'dark'
  label: string,
  icon : ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
}

  const themeModes: ModeTypes[] = [
    { value: 'system', label: 'System', icon: Computer },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ]
  
function ThemeIcon(props: { icon: string }) {
  switch (props.icon) {
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
  const { setTheme, theme, colorTheme, mode, setMode, navigate } = useLayout()
  const mounted = useMounted()
  const currentTheme = colorTheme as ThemeName


  return (
    <AsyncContainer isLoading={[userLoading]}>
      {!user ? (
        <Login buttonText="Log in" className="w-full" />
      ) : (
        <div className="rounded-lg border border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className='flex items-center gap-2 p-2'>
                <div className="hidden text-left md:block bg-primary rounded-full p-1">
                  <User className="h-10 w-10 text-secondary-foreground" />
                </div>
                <div className='flex-grow text-left'>
                  <p>{user.preferredName}</p>
                  <p className="text-xs text-muted">{user.fullName}</p>
                </div>
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
                      {themeModes.map((m) => (
                        <DropdownMenuItem
                          key={m.value}
                          className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                          disabled={!mounted}
                          onSelect={() => setMode(m.value)}
                        >
                          <span className="flex items-center gap-2">
                            <m.icon className="h-4 w-4" />
                            {m.label}
                          </span>
                          {mounted && mode === m.value && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="my-1 h-px bg-border" />
                      {themeNames.map((name) => {
                        const meta = themes[name]
                        const isActive = mounted && currentTheme === name
                        return (
                          <DropdownMenuItem
                            key={name}
                            className="flex cursor-pointer select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                            disabled={!mounted}
                            onSelect={() => setTheme(name)}
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
      )}
    </AsyncContainer>
  )
}

UserSidebar.displayName = "UserSidebar"
export default UserSidebar