"use client"

import { Home, Users, Heart, Bell, User, Settings } from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Users, label: 'Family', active: false },
    { icon: Heart, label: 'Memories', active: false },
    { icon: Bell, label: 'Notifications', active: false },
    { icon: User, label: 'Profile', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ]

  return (
    <aside className="w-20 md:w-64 h-full border-r border-border bg-background flex flex-col flex-shrink-0">
      <div className="p-6 hidden md:block">
        <h1 className="text-primary">FamilyCircle</h1>
      </div>
      
      <div className="p-4 md:hidden flex justify-center">
        <h1 className="text-primary">FC</h1>
      </div>
      
      <nav className="flex-1 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.label}>
                <button
                  className={`w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent text-foreground'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-center md:justify-start gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div className="hidden md:block">
            <p className="text-foreground">John Smith</p>
            <p className="text-muted-foreground">@johnsmith</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

Sidebar.displayName = "Sidebar"
export default Sidebar
