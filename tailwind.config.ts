import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				display: ['Instrument Serif', 'Georgia', 'serif'],
			},
			boxShadow: {
				soft: '0 1px 0 rgba(36,24,16,0.04), 0 12px 32px rgba(36,24,16,0.06)',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				ink: 'hsl(var(--ink))',
				sage: 'hsl(var(--sage))',
				champagne: 'hsl(var(--champagne))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'orbit': {
					to: { transform: 'rotate(360deg)' }
				},
				'orbit-reverse': {
					to: { transform: 'rotate(-360deg)' }
				},
				'loader-anim': {
					'0%': { inset: '0 35px 35px 0' },
					'12.5%': { inset: '0 35px 0 0' },
					'25%': { inset: '35px 35px 0 0' },
					'37.5%': { inset: '35px 0 0 0' },
					'50%': { inset: '35px 0 0 35px' },
					'62.5%': { inset: '0 0 0 35px' },
					'75%': { inset: '0 0 35px 35px' },
					'87.5%': { inset: '0 0 35px 0' },
					'100%': { inset: '0 35px 35px 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				orbit: 'orbit 1.1s linear infinite',
				'orbit-reverse': 'orbit-reverse 1.8s linear infinite',
				'loader-anim': 'loader-anim 2.5s infinite',
				'loader-anim-delayed': 'loader-anim 2.5s infinite -1.25s'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
