import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function DesignTokensShowcase() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-12 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header with Theme Toggle */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-brand font-semibold">ParkEase Design System</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Day 3 — Visual Foundations</h1>
            <p className="text-text-muted text-sm mt-1">
              Typography: JetBrains Mono | Theme: {theme.toUpperCase()} | Palette: Midnight Navy & Emerald
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="self-start sm:self-auto px-4 py-2 rounded-input bg-surface-raised hover:bg-surface border border-border text-sm font-medium transition-all shadow-subtle hover:border-brand/40 flex items-center gap-2"
          >
            <span>{theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}</span>
          </button>
        </header>

        {/* Color System Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">1. Core Palette & Surfaces</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="p-4 rounded-card bg-bg border border-border space-y-1">
              <div className="font-semibold">Main BG</div>
              <div className="text-text-muted font-mono">{theme === 'dark' ? '#0B1220' : '#F8FAFC'}</div>
            </div>
            <div className="p-4 rounded-card bg-surface border border-border space-y-1">
              <div className="font-semibold">Surface</div>
              <div className="text-text-muted font-mono">{theme === 'dark' ? '#111C2E' : '#FFFFFF'}</div>
            </div>
            <div className="p-4 rounded-card bg-surface-raised border border-border space-y-1">
              <div className="font-semibold">Surface Raised</div>
              <div className="text-text-muted font-mono">{theme === 'dark' ? '#172338' : '#FFFFFF'}</div>
            </div>
            <div className="p-4 rounded-card bg-brand text-bg-dark font-bold space-y-1">
              <div>Emerald Brand</div>
              <div className="font-mono">#10B981</div>
            </div>
            <div className="p-4 rounded-card bg-brand-hover text-bg-dark font-bold space-y-1">
              <div>Brand Hover</div>
              <div className="font-mono">#059669</div>
            </div>
            <div className="p-4 rounded-card bg-border border border-border space-y-1">
              <div className="font-semibold">Border</div>
              <div className="text-text-muted font-mono">{theme === 'dark' ? '#263449' : '#E2E8F0'}</div>
            </div>
          </div>
        </section>

        {/* Semantic Status Colors */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">2. Semantic Status Indicators</h2>
          <div className="flex flex-wrap gap-3">
            <span className="park-badge bg-status-available/15 text-status-available border-status-available/30">
              <span className="w-1.5 h-1.5 rounded-full bg-status-available"></span> Available
            </span>
            <span className="park-badge bg-status-pending/15 text-status-pending border-status-pending/30">
              <span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span> Reserved / Pending
            </span>
            <span className="park-badge bg-status-occupied/15 text-status-occupied border-status-occupied/30">
              <span className="w-1.5 h-1.5 rounded-full bg-status-occupied"></span> Occupied
            </span>
            <span className="park-badge bg-status-maintenance/15 text-status-maintenance border-status-maintenance/30">
              <span className="w-1.5 h-1.5 rounded-full bg-status-maintenance"></span> Maintenance
            </span>
            <span className="park-badge bg-status-info/15 text-status-info border-status-info/30">
              <span className="w-1.5 h-1.5 rounded-full bg-status-info"></span> Informational
            </span>
          </div>
        </section>

        {/* Typography Hierarchy */}
        <section className="park-card p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">3. JetBrains Mono Hierarchy</h2>
          <div className="space-y-2 border-l-2 border-brand/40 pl-4">
            <div className="text-2xl md:text-3xl font-bold">Display / Hero Headline (Bold)</div>
            <div className="text-lg md:text-xl font-semibold">Section Subheading (SemiBold)</div>
            <div className="text-sm md:text-base text-text">
              Body text: ParkEase smart parking slot management system foundation. Monospace font with high legibility, comfortable 1.6 line-height, and tailored character spacing.
            </div>
            <div className="text-xs text-text-muted">
              Metadata & label text: Slot #A-102 | Hourly Rate: $4.00/hr | Updated just now
            </div>
          </div>
        </section>

        {/* Layout & Radii Preview */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="park-card p-6 space-y-3">
            <h3 className="font-bold text-base">Standard Card (`rounded-card`: 18px)</h3>
            <p className="text-sm text-text-muted">
              Subtle border, deep background contrast, and 18px radius adhering to Section 5 of DESIGN.md.
            </p>
          </div>
          <div className="park-card-raised p-6 space-y-3">
            <h3 className="font-bold text-base">Elevated Card (`rounded-card` + Raised Shadow)</h3>
            <p className="text-sm text-text-muted">
              Elevated card surface for hover states and prominent parking summary panels.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DesignTokensShowcase />
    </ThemeProvider>
  );
}
