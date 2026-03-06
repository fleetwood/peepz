<template>
  <div class="p-8">
    <div class="max-w-4xl mx-auto space-y-8">
      <h1 class="text-4xl font-bold font-peeps text-primary">
        Peeps Vue Frontend
      </h1>
      
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold">Theme System Test</h2>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-primary text-primary-foreground rounded-lg">
            Primary
          </div>
          <div class="p-4 bg-secondary text-secondary-foreground rounded-lg">
            Secondary
          </div>
          <div class="p-4 bg-accent text-accent-foreground rounded-lg">
            Accent
          </div>
          <div class="p-4 bg-muted text-muted-foreground rounded-lg">
            Muted
          </div>
        </div>
        
        <div class="space-y-2">
          <p><strong>Current Theme:</strong> {{ theme }}</p>
          <p><strong>Color Theme:</strong> {{ colorTheme }}</p>
          <p><strong>Mode:</strong> {{ mode }}</p>
        </div>
        
        <div class="flex gap-4">
          <button 
            @click="setTheme('peeps')"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-80"
          >
            Peeps Theme
          </button>
          <button 
            @click="setTheme('warm')"
            class="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-80"
          >
            Warm Theme
          </button>
        </div>
        
        <div class="flex gap-4">
          <button 
            @click="setMode('light')"
            class="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-80"
          >
            Light Mode
          </button>
          <button 
            @click="setMode('dark')"
            class="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-80"
          >
            Dark Mode
          </button>
          <button 
            @click="setMode('system')"
            class="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-80"
          >
            System Mode
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { theme, colorTheme, mode, setTheme, setMode } = useLayout()
</script>
