import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'
import { textGradientPlugin } from '@peeps/ui/plugins/textGradient'
import { transitionPlugin } from '@peeps/ui/plugins/transitions'

const config: Config = {
  darkMode: ['class', '[data-mode="dark"]', '[data-mode="system"]'] as any,
  content : ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme   : {
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
  			// Palette colors
			parchment  : 'var(--parchment)',
			gold       : 'var(--gold)',
			neutral    : 'var(--neutral)',
			red        : 'var(--red)',
			orange     : 'var(--orange)',
			yellow     : 'var(--yellow)',
			green      : 'var(--green)',
			blue       : 'var(--blue)',
			purple     : 'var(--purple)',
			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			sidebar: {
  				DEFAULT: 'var(--sidebar-background)',
  				foreground: 'var(--sidebar-foreground)',
  				primary: 'var(--sidebar-primary)',
  				'primary-foreground': 'var(--sidebar-primary-foreground)',
  				accent: 'var(--sidebar-accent)',
  				'accent-foreground': 'var(--sidebar-accent-foreground)',
  				border: 'var(--sidebar-border)',
  				ring: 'var(--sidebar-ring)'
  			}
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

export default config
