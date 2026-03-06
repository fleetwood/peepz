<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { useLayout } from '@/composables/useLayout'
import { themeNames, themes, type ThemeName } from '@peeps/ui'
import { Bell, Check, Computer, Egg, Leaf, LogOut, Moon, Settings, Sun, User } from 'lucide-vue-next'

type ModeType = {
  value: 'system' | 'light' | 'dark'
  label: string
  icon: typeof Sun
}

const themeModes: ModeType[] = [
  { value: 'system', label: 'System', icon: Computer },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

const { user, userLoading, auth } = useCurrentUser()
const { setTheme, setMode, theme, colorTheme, mode, navigate } = useLayout()

const currentTheme = computed(() => colorTheme.value as ThemeName)

const themeIcons: Record<string, typeof Sun> = {
  egg: Egg,
  leaf: Leaf,
}

function getThemeIcon(iconName: string) {
  return themeIcons[iconName] || Sun
}

const sheetOpen = ref(false)

function handleNavigation(path: string) {
  navigate(path)
  sheetOpen.value = false
}
</script>

<template>
  <div class="p-4">
    <!-- Not logged in: Login button -->
    <div v-if="!user && !userLoading" class="flex items-center gap-3">
      <LoginDialog button-text="Login" button-class="w-full" />
    </div>

    <!-- Loading -->
    <div v-else-if="userLoading" class="flex items-center gap-3">
      <div class="h-10 w-10 rounded-full bg-muted animate-pulse" />
      <div class="hidden md:block space-y-1">
        <div class="h-4 w-20 bg-muted rounded animate-pulse" />
      </div>
    </div>

    <!-- Logged in: User menu -->
    <Sheet v-else v-model:open="sheetOpen">
      <SheetTrigger as-child>
        <button
          type="button"
          class="flex items-center gap-2 p-2 w-full rounded-lg hover:bg-accent transition-colors"
        >
          <div class="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <User class="h-5 w-5 text-primary-foreground" />
          </div>
          <div class="hidden md:block text-left flex-1">
            <p class="text-sm font-medium">
              {{ user?.preferredName || user?.name?.[0] || user?.auth?.email?.split('@')[0] || 'User' }}
            </p>
            <p v-if="user?.auth?.email" class="text-xs text-muted-foreground">
              {{ user.auth.email }}
            </p>
          </div>
        </button>
      </SheetTrigger>

      <SheetContent side="left" class="w-[280px] p-0">
        <SheetHeader class="p-4">
          <SheetTitle>Account</SheetTitle>
        </SheetHeader>

        <div class="px-2 py-2 space-y-1">
          <button
            class="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            @click="handleNavigation('/notifications')"
          >
            <Bell class="h-4 w-4" />
            Notifications
          </button>

          <button
            class="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            @click="handleNavigation('/profile')"
          >
            <User class="h-4 w-4" />
            Profile
          </button>

          <button
            class="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            @click="handleNavigation('/settings')"
          >
            <Settings class="h-4 w-4" />
            Settings
          </button>

          <Separator class="my-2" />

          <!-- Theme Section -->
          <div class="px-3 py-1 text-xs font-medium text-muted-foreground">Theme</div>

          <!-- Mode Selection -->
          <button
            v-for="m in themeModes"
            :key="m.value"
            class="w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            @click="setMode(m.value)"
          >
            <span class="flex items-center gap-2">
              <component :is="m.icon" class="h-4 w-4" />
              {{ m.label }}
            </span>
            <Check v-if="mode === m.value" class="h-4 w-4" />
          </button>

          <Separator class="my-2" />

          <!-- Theme Selection -->
          <button
            v-for="name in themeNames"
            :key="name"
            class="w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            @click="setTheme(name)"
          >
            <span class="flex items-center gap-2">
              <component :is="getThemeIcon(themes[name].icon)" class="h-4 w-4" />
              {{ themes[name].name }}
            </span>
            <Check v-if="currentTheme === name" class="h-4 w-4" />
          </button>

          <Separator class="my-2" />

          <button
            class="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            @click="auth.signOut()"
          >
            <LogOut class="h-4 w-4" />
            Log out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
