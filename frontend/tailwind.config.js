/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Token Mapping
        bg: {
          DEFAULT: 'var(--color-bg)',
          subtle: 'var(--color-bg-subtle)',
          dark: '#0B1220',
          light: '#F8FAFC',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          subtle: 'var(--color-surface-subtle)',
          dark: '#111C2E',
          light: '#FFFFFF',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          dark: '#263449',
          light: '#E2E8F0',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          dark: '#F8FAFC',
          light: '#0F172A',
        },
        brand: {
          DEFAULT: '#10B981',
          hover: '#059669',
          soft: 'var(--color-brand-soft)',
        },
        status: {
          available: '#10B981',
          pending: '#F59E0B',
          occupied: '#EF4444',
          maintenance: '#64748B',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '18px',
        input: '11px',
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        raised: 'var(--shadow-raised)',
        glow: '0 0 24px -4px rgba(16, 185, 129, 0.25)',
      },
    },
  },
  plugins: [],
};
