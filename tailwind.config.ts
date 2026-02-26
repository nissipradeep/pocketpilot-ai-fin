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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: '#0A0A0B',
				foreground: '#FFFFFF',
				primary: {
					DEFAULT: '#6366F1',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#161618',
					foreground: '#A1A1AA'
				},
				card: {
					DEFAULT: '#161618',
					foreground: '#FFFFFF'
				},
				income: '#10B981',
				expense: '#EF4444'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem'
			},
			boxShadow: {
				'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
				'card': '0 4px 20px rgba(0, 0, 0, 0.4)'
			},
			fontFamily: {
				display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
				sans: ['Inter', 'sans-serif']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
