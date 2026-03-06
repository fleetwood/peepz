<script setup lang="ts">
import { computed } from 'vue'
import { useCurrentUser } from '@composables/useCurrentUser'
import { useLayout } from '@composables/useLayout'
import { HeartIcon, HomeIcon, ThemeIcon, UsersIcon } from '@icons'
import { clientEnv } from '@peeps/config/env'
import { cn } from '@peeps/utils'

const { colorTheme } = useLayout()
const { user, userLoading, auth } = useCurrentUser()

const isWarmTheme = computed(() => colorTheme.value === 'warm')

const navItems = computed(() => [
  { icon: HomeIcon, label: 'Home', href: '/' },
  ...(user?.value?.needsOnboarding 
    ? [
        { icon: HeartIcon, label: 'Onboarding', href: '/onboarding' }
      ]
    : []),
  ...(user?.value?.families && user.value.families.length > 0
    ? user.value.families.map(family => ({
        icon: UsersIcon, 
        label: family.name, 
        href: `/family/${family.id}`
      }))
    : []),
  { icon: HeartIcon, label: 'Memories', href: '/memories' },
  ...(clientEnv.isDev
    ? [
        { icon: ThemeIcon, label: 'Theme', href: '/theme' }
      ]
    : []),
])

const route = useRoute()
</script>

<template>
  <aside class="w-20 md:w-64 h-full flex flex-col flex-shrink-0 border-r border-border bg-card">
    <!-- Logo -->
    <div class="p-4 md:p-6 flex items-center justify-center md:justify-start gap-2">
      <img src="@peeps/ui/assets/logo_64.png" alt="Peeps" class="h-8 w-8" />
      <h2
        :class="cn(
          'hidden md:block font-extrabold tracking-tight',
          isWarmTheme ? 'text-gradient-yellow-orange' : 'text-gradient-orange-yellow'
        )"
      >
        EEPS
      </h2>
    </div>

    <!-- User Section -->
    <UserSidebar />

    <!-- Navigation -->
    <nav class="flex-1 p-3">
      <ul class="space-y-2">
        <li v-for="item in navItems" :key="item.label">
          <NuxtLink
            :to="item.href"
            :class="cn(
              'w-full flex items-center justify-center md:justify-start gap-4 px-4 py-3 rounded-lg transition-colors duration-200',
              route.path === item.href || (item.href !== '/' && route.path.startsWith(item.href))
                ? 'bg-primary text-primary-foreground'
                : 'text-primary hover:bg-accent hover:text-accent-foreground'
            )"
          >
            <component :is="item.icon" class="w-6 h-6" style="color: currentColor" />
            <span class="hidden md:inline">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>
