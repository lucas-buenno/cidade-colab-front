# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Cidade Colab
**Generated:** 2026-09-10
**Category:** Civic collaboration
**Style:** Brutalism (raw, unadorned, high contrast)
**Design Dials:** Variance 10/10 (Bold / Asymmetric) | Motion 1/10 (Instant) | Density 6/10 (Standard)

**Intent:** Treat the city as infrastructure — functional, jarring, and readable. Prioritize WCAG 2.2 AA over novelty.

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#DD614C` | `--color-primary` |
| On Primary | `#111827` | `--color-on-primary` |
| Secondary | `#DAA144` | `--color-secondary` |
| On Secondary | `#111827` | `--color-on-secondary` |
| Accent/CTA | `#DD614C` | `--color-accent` |
| On Accent/CTA | `#111827` | `--color-on-accent` |
| Background | `#F3EEE6` | `--color-background` |
| Foreground | `#111827` | `--color-foreground` |
| Card / Surface | `#FFFFFF` | `--color-card` |
| Card Foreground | `#111827` | `--color-card-foreground` |
| Muted | `#E7DFD3` | `--color-muted` |
| Muted Foreground | `#374151` | `--color-muted-foreground` |
| Border | `#111827` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `--color-on-destructive` |
| Success | `#16A34A` | `--color-success` |
| Warning | `#D97706` | `--color-warning` |
| Ring | `#111827` | `--color-ring` |

Dark surfaces: background `#1C1917`, surface `#2A2623`, foreground `#F4F1EC`, offset shadow in `#DD614C`.

**On-primary is `#111827` (not white)** so CTA text meets 4.5:1 on `#DD614C`.

### Typography

- **Display / body:** Darker Grotesque (weights 300–900)
- **Labels / meta:** JetBrains Mono
- **H1:** ~3rem+, weight 800, tight leading (~0.9)
- **Body:** ≥16px, weight 500
- **Label caps:** 0.75rem, uppercase, tracking-wider, font-mono

```css
@import url("https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap");
```

### Spacing

Scale: 4 / 8 / 12 / 16 / 24 / 32.

### Radius and shadow

- Radius: `0px` (no pills, no cards with rounded corners)
- Card shadow: `4px 4px 0 0 var(--foreground)` (hard offset, no blur)
- Borders: `2px solid var(--foreground)` (visible structure)

---

## Component Specs

### Buttons

- Default: primary fill `#DD614C`, 2px ink border, offset shadow, min-height 44px, `cursor-pointer`
- Hover/active: translate 2px and drop shadow (pressed block)
- Secondary: `#DAA144` fill, same structure
- Ghost: underline, no fill
- Disabled: opacity 0.6, no press, `cursor-not-allowed`
- Focus-visible: 3px solid ring, 3px offset

### Cards

- White/surface, 2px ink border, offset shadow, square corners
- Category chips: secondary fill, mono uppercase, square

### Inputs

- 2px ink border, square, 16px+ type
- Focus: offset shadow in primary (`3px 3px 0 0 var(--primary)`)
- Error: destructive border + inline alert text

### Modals

- Opaque overlay, no backdrop blur
- 4px ink border, offset shadow, square

---

## Accessibility

- WCAG 2.2 AA contrast on body and CTA text
- Keyboard-first; skip link visible on focus
- Touch targets ≥44px
- `prefers-reduced-motion` respected
- Color is never the only state signal (border, weight, pressed offset)

## Content tone

Concise, confident, helpful. Short labels. No ornamental copy.

## Anti-patterns

- Soft elevation, blur, gradients, pills, rounded-xl
- White text on `#DD614C` for small type
- Low-contrast gray body (`#374151` minimum on light surface)
- Invisible focus
- Emoji as icons (use Phosphor)

## QA checklist

- [ ] Tokens used instead of one-off hex
- [ ] Square corners and 2px ink borders on panels
- [ ] Darker Grotesque + JetBrains Mono loaded
- [ ] Primary CTA contrast ≥4.5:1
- [ ] Focus ring 3px visible
- [ ] Light and dark both checked
- [ ] Reduced motion does not hide content
