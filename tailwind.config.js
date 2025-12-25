/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          foreground: '#FFFFFF',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        background: '#FFFFFF',
        foreground: '#111827',
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#3B82F6',
        muted: {
          DEFAULT: '#F9FAFB',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#F9FAFB',
          foreground: '#111827',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}
