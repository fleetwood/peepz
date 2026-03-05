import animate from 'tailwindcss-animate'
import { textGradientPlugin } from '@peeps/ui/plugins/textGradient'
import { transitionPlugin } from '@peeps/ui/plugins/transitions'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-mode="dark"]', '[data-mode="system"]'],
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        peeps: ['var(--font-peeps)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans : ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
        mono : ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)'
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)'
        },
        danger: {
          DEFAULT: 'var(--danger)',
          foreground: 'var(--danger-foreground)'
        },
        info: {
          DEFAULT: 'var(--info)',
          foreground: 'var(--info-foreground)'
        },
        page: {
          DEFAULT: 'var(--page)',
          foreground: 'var(--page-foreground)'
        },
        parchment  : 'var(--parchment)',
        gold       : 'var(--gold)',
        neutral    : 'var(--neutral)',
        red        : 'var(--red)',
        orange     : 'var(--orange)',
        yellow     : 'var(--yellow)',
        green      : 'var(--green)',
        blue       : 'var(--blue)',
        purple     : 'var(--purple)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [animate, textGradientPlugin, transitionPlugin],
}
