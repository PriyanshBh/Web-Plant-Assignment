# Design System: Mini Project Manager

**Direction:** Calm, editorial, tool-like. Think a well-made notebook crossed with a precise instrument. Flat solid colors, hairline borders, tight typography, and generous whitespace. The interface earns its character from layout, type, and motion, not from decoration.

---

## 1. Hard Bans (Zero "AI Slop")
- **No gradients anywhere:** backgrounds, buttons, text, borders, progress bars, or avatars.
- **No glassmorphism:** no frosted blur panels, floating color blobs, mesh backgrounds, or glow/neon shadows.
- **No purple-to-blue palettes:** no default Tailwind indigo/violet as the brand.
- **No emoji as icons or decoration:** use Lucide icons exclusively.
- **No stock 3D illustrations:** clean line-art SVGs or purposeful typography only.
- **No generic marketing hype:** e.g., "supercharge your workflow". Use honest, calm microcopy.
- **No heavy drop shadows:** shadows only on popovers/dialogs (one soft, low-opacity shadow: `0 4px 20px -2px rgba(0,0,0,0.08)`).
- **No more than one accent color:** Vermilion (`#E5502B` / `#FF6A42`). No rainbow badges.
- **No Lorem ipsum anywhere:** use real, human microcopy.

---

## 2. Color Tokens (CSS Variables)

### Light Mode
```css
:root {
  --bg:        #F7F6F2;   /* warm paper */
  --surface:   #FFFFFF;
  --surface-2: #F0EEE8;
  --border:    #E4E1D9;
  --ink:       #151515;
  --ink-2:     #55534E;
  --ink-3:     #8A877F;
  --accent:    #E5502B;   /* vermilion, single brand accent */
  --accent-ink:#FFFFFF;
  --danger:    #B42318;
  --todo-fg:   #5F5D57;
  --todo-bg:   #EFEDE6;
  --prog-fg:   #9A5A00;
  --prog-bg:   #FFF1D6;
  --done-fg:   #1B6B45;
  --done-bg:   #DDF2E6;
}
```

### Dark Mode
```css
.dark {
  --bg:        #0F0F0E;
  --surface:   #171716;
  --surface-2: #1F1F1D;
  --border:    #2C2B28;
  --ink:       #F2F1EC;
  --ink-2:     #A8A59C;
  --ink-3:     #75726B;
  --accent:    #FF6A42;
  --accent-ink:#151515;
  --danger:    #F97066;
  --todo-fg:   #B5B2A9;
  --todo-bg:   #262522;
  --prog-fg:   #F5B14C;
  --prog-bg:   #33270F;
  --done-fg:   #5FCB92;
  --done-bg:   #12301F;
}
```

- Contrast: All text and background combinations strictly pass WCAG AA.
- Flash prevention: Theme script applied inline before hydration.

---

## 3. Typography
- **UI Font:** Geist Sans.
- **Numbers / Dates / Counts:** Geist Mono (tabular figures).
- **Headings:** Tight tracking (`-0.02em`), font-weight 600, line-height ~1.15.
- **Body:** font-size 14px, line-height ~1.5.
- **Labels / Eyebrows:** 11-12px, font-weight 500, uppercase, `letter-spacing: +0.06em`, color `--ink-3`.
- **Display Serif (Landing headline / Hero titles only):** Instrument Serif or Fraunces.

---

## 4. Spacing, Borders, Elevation
- **Grid:** 4px base increment (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`).
- **Radii:**
  - Cards: `12px` (`rounded-xl`)
  - Inputs & Buttons: `8px` (`rounded-lg`)
  - Status Pills & Badges: `9999px` (`rounded-full`)
- **Elevation:** Depth is created through hairline 1px borders (`border: 1px solid var(--border)`) and subtle surface stepping (`--bg` -> `--surface` -> `--surface-2`), never heavy shadows.
- **Focus Ring:** `2px solid var(--accent)` with `2px` offset, visible on keyboard focus (`focus-visible`).

---

## 5. Components Style Guide
- **Button:**
  - Primary CTA: Solid `--ink` (or solid `--accent` for primary create actions).
  - Secondary: `--surface` background with `--border`.
  - Ghost: transparent, hover `--surface-2`.
  - Destructive: text/border `--danger`, hover background with muted red tint.
  - Active: `transform: scale(0.98)` for immediate tactile feedback.
- **Input / Textarea:**
  - Min height 40px (min 16px font-size on mobile to prevent iOS zooming).
  - 1px border `--border`, turns `--ink` on focus with vermilion focus ring.
  - Clear error states with inline helper text.
- **StatusPill:**
  - Compact rounded pill with a leading 6px solid dot. Uses `--todo-*`, `--prog-*`, `--done-*` tokens.
- **Progress Bar:**
  - 6px height, divided into three solid flat segments (`todo`, `in-progress`, `done`). Rounded outer container, no gradients.
- **Skeletons:**
  - Solid `--surface-2` rectangles with soft opacity pulsing. No sweeping shimmering gradients.

---

## 6. Motion & Animation Standards
- **Framework:** `motion` (Framer Motion) for layout transitions & conditional presence, CSS transitions for micro-interactions (`150ms ease-out`).
- **Timings:** Micro: 120-180ms. Standard: 200-280ms. Sheets / dialogs: 300-360ms.
- **Required Interactions:**
  1. Staggered fade & rise entrance (30-40ms stagger, max 8 items) for cards and task rows.
  2. Sliding active tab indicator on status filter using `layoutId`.
  3. `layout` and `AnimatePresence` on task list filtering, sorting, and status changes.
  4. Animated SVG checkmark draw when completing tasks + strikethrough transition.
  5. Sheet sliding from bottom on mobile; dialog scale-in on desktop.
  6. Count-up animation for dashboard stats on initial mount.
- **Accessibility:** `@media (prefers-reduced-motion: reduce)` must completely disable layout springs and transform shifts, falling back to instant or simple opacity transitions.
