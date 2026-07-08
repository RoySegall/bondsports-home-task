---
name: Obsidian Utility
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#e6bdb7'
  outline: '#ac8883'
  outline-variant: '#5c403b'
  surface-tint: '#ffb4a9'
  primary: '#ffb4a9'
  on-primary: '#690001'
  primary-container: '#ff5542'
  on-primary-container: '#5c0001'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-acrylic: rgba(30, 30, 30, 0.75)
  surface-mica: rgba(18, 18, 18, 0.90)
  status-error: '#FF4433'
  status-success: '#4CAF50'
  status-warning: '#FFC107'
  metadata-badge: rgba(255, 255, 255, 0.1)
rounded: { sm: 0.125rem, DEFAULT: 0.25rem, md: 0.375rem, lg: 0.5rem, xl: 0.75rem, full: 9999px }
spacing: { nav-rail-width: 64px, grid-gutter: 12px, container-padding: 24px }
---

Philosophy: "Non-Intrusive Utility" — Obsidian / Windows Mica-Acrylic. Content over
container. Minimalism + glassmorphism, borderless architecture, no visual noise.

- Primary: vibrant brand red (#FF4433) used SPARINGLY — critical actions, active
  states, errors. Solid #FF4433 button with white text, no border.
- Surfaces: layered translucency on deep charcoal/true black. Mica for app bg,
  Acrylic for floating panels / the nav rail.
- Type: Inter (UI) + JetBrains Mono (metadata badges: sizes, timestamps, codecs).
  Denote hierarchy with weight, not color.
- Nav rail: slim fixed 64px icon rail. Grid: fluid, 12px gutter, 24px margins.
- Shape: soft 4px radius. Grid items NEVER become pills.
- Cards: borderless, thumbnail fills the tile, metadata overlays on hover via a
  bottom gradient wash. Badges: mono, semi-transparent (metadata-badge).
- Elevation: tonal layers + backdrop blur, not drop shadows. Ambient shadows only.
- Loading: minimal indeterminate red progress bar at top, no spinners.
- Search: understated, integrated in header, no border, subtle bg tint on focus.
