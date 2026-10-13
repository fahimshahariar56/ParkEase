/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Semantic token mapping (all via CSS custom properties) ───
        // ─── Temporary backward-compat token — pages still reference 'brand'
        // Phase 2 page redesign will remove these references
        // Currently maps to a neutral accent via CSS var (not emerald)
        brand: {
          DEFAULT: 'var(--color-brand)',
          hover:   'var(--color-brand-hover)',
          soft:    'var(--color-brand-soft)',
        },

        bg: {
          DEFAULT: 'var(--color-bg)',
          subtle:  'var(--color-bg-subtle)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised:  'var(--color-surface-raised)',
          subtle:  'var(--color-surface-subtle)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle:  'var(--color-border-subtle)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted:   'var(--color-text-muted)',
        },

        // ─── Semantic status colors ───
        // Used by badges, slot states, form validation — not brand decoration
        status: {
          available:   'var(--color-status-available)',
          pending:     'var(--color-status-pending)',
          occupied:    'var(--color-status-occupied)',
          maintenance: 'var(--color-status-maintenance)',
          info:        'var(--color-status-info)',
          confirmed:   'var(--color-status-confirmed)',
          cancelled:   'var(--color-status-cancelled)',
        },

        // ─── Optional restrained accent ───
        accent: {
          DEFAULT: 'var(--color-accent)',
          fg:      'var(--color-accent-fg)',
        },

        // ─── Pure monochrome shorthands ───
        ink: {
          DEFAULT: '#111113',
          subtle:  '#62626B',
          faint:   '#A1A1AA',
        },
        chalk: {
          DEFAULT: '#F5F5F5',
          subtle:  '#E4E4E7',
          faint:   '#D4D4D8',
        },
      },

      fontFamily: {
        // Inter for UI / body / navigation (DESIGN.md §4)
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        // JetBrains Mono for technical data: slot IDs, timestamps, code, KPIs
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },

      fontSize: {
        // Display / hero headings (DESIGN.md §4)
        'display-lg': ['clamp(2.5rem, 5vw, 4.75rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display':    ['clamp(2rem,   4vw, 3.5rem)',   { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-sm': ['clamp(1.5rem, 3vw, 2.25rem)',  { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },

      borderRadius: {
        // Rectangular language (DESIGN.md §5)
        btn:   'var(--radius-btn)',    // 7px — buttons
        input: 'var(--radius-input)',  // 6px — inputs
        card:  'var(--radius-card)',   // 10px — cards
        sm:    'var(--radius-sm)',     // 4px — chips, tags
        pill:  'var(--radius-pill)',   // 9999px — status badges only
      },

      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        raised: 'var(--shadow-raised)',
        // No colored glow — monochrome system
      },

      transitionDuration: {
        base:   '150',
        motion: '200',
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      maxWidth: {
        content: '1280px',
        prose:   '68ch',
        sidebar: '256px',
      },

      spacing: {
        sidebar: '256px',
      },

      animation: {
        'fade-in': 'fadeIn 200ms ease both',
        'slide-up': 'slideUp 200ms cubic-bezier(0.16,1,0.3,1) both',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
