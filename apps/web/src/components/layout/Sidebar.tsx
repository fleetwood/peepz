"use client"

import { clientEnv } from '@peeps/config/env'
import { BarChart, Bell, Heart, Home, Settings, User, Users } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import UserSidebar from '../user/UserSidebar'

const Sidebar = () => {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: 'Home', link: '/' },
    { icon: Users, label: 'Family', link: '/family/123' },
    { icon: Heart, label: 'Memories', link: '/memories' },
    ...(clientEnv.isDev ? [{ icon: BarChart, label: 'Theme', link: '/theme' }] : []),
  ]

  return (
    <aside className="w-20 md:w-64 h-full border-r border-border bg-background flex flex-col flex-shrink-0">
      <div className="p-6 hidden md:block">
        <h1 className="text-primary">FamilyCircle</h1>
      </div>
      
      <div className="p-4 md:hidden flex justify-center">
        <h1 className="text-primary">FC</h1>
      </div>
      
      <div className="p-4 border-t border-border">
        <UserSidebar />
      </div>

      <nav className="flex-1 p-3 border-t border-border">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.link === '/' ? pathname === '/' : pathname === item.link
            return (
              <li key={item.label}>
                <button
                  className={`w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-primary hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => {
                    router.push(item.link)
                  }}
                >
                  <Icon className="w-6 h-6" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

Sidebar.displayName = "Sidebar"
export default Sidebar
