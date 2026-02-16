# ForecastAI - UI/UX Documentation

<div align="center">

## 🎨 Dark Terminal UI/UX Design System

**Version 2.0 | February 2026**

*A comprehensive guide to the ForecastAI frontend design system, page layouts, components, color schemes, animations, and user experience patterns.*

</div>

---

## 📑 Table of Contents

1. [Design System Overview](#1-design-system-overview)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Components Library](#5-components-library)
6. [Page-by-Page Breakdown](#6-page-by-page-breakdown)
7. [Animations & Effects](#7-animations--effects)
8. [Responsive Design](#8-responsive-design)
9. [Accessibility](#9-accessibility)

---

## 1. Design System Overview

### 1.1 Theme Philosophy

The **Dark Terminal Theme** draws inspiration from:
- Modern code editors (VS Code, JetBrains)
- Data science dashboards (Hex, Observable)
- Terminal/CLI aesthetics
- Premium SaaS products (Linear, Vercel)

### 1.2 Key Characteristics

| Characteristic | Implementation |
|---------------|----------------|
| **Base Theme** | Dark mode with deep navy (#0A0E1A) foundations |
| **Visual Depth** | Layered backgrounds with subtle elevation |
| **Data Focus** | Monospace typography for metrics and KPIs |
| **Interactivity** | Framer Motion animations on all interactions |
| **Glassmorphism** | Frosted glass effects on modals and overlays |
| **Gradient Accents** | Blue-to-purple gradients on primary CTAs |

### 1.3 Technology Stack

```
Frontend Framework: React 18 + Vite 5
Styling: Tailwind CSS + Custom CSS Variables
Animations: Framer Motion
Icons: Lucide Icons
Charts: Recharts / Chart.js
Fonts: Space Grotesk, Inter, JetBrains Mono
```

---

## 2. Color Palette

### 2.1 Background Colors

| Variable | Hex Code | Usage |
|----------|----------|-------|
| `--bg-primary` | `#0A0E1A` | Main page background |
| `--bg-secondary` | `#131829` | Card backgrounds, panels |
| `--bg-tertiary` | `#1C2333` | Elevated elements, inputs |
| `--bg-elevated` | `#242B3D` | Hover states, dropdowns |

### 2.2 Text Colors

| Variable | Hex Code | Usage |
|----------|----------|-------|
| `--text-primary` | `#E8EDF4` | Headlines, primary text |
| `--text-secondary` | `#A3ADBF` | Body text, descriptions |
| `--text-tertiary` | `#6B7790` | Placeholder text, captions |

### 2.3 Accent Colors

| Variable | Hex Code | Usage |
|----------|----------|-------|
| `--accent-blue` | `#4A9EFF` | Primary brand, links, CTAs |
| `--accent-cyan` | `#00D9FF` | Charts, data highlights |
| `--accent-purple` | `#B794F6` | Gradients, secondary accent |
| `--accent-pink` | `#FF6B9D` | Alerts, special highlights |
| `--accent-green` | `#4ADE80` | Success states, positive trends |
| `--accent-yellow` | `#FFC947` | Warning states, caution |
| `--accent-red` | `#FF5757` | Error states, negative trends |
| `--accent-orange` | `#FF8A5B` | Information, highlights |

### 2.4 Status Colors

```css
--status-info: var(--accent-blue);     /* Informational messages */
--status-success: var(--accent-green); /* Success confirmations */
--status-warning: var(--accent-yellow);/* Warning notifications */
--status-error: var(--accent-red);     /* Error messages */
```

### 2.5 Data Visualization Palette

Colorblind-safe palette for charts:

| Variable | Color | Used For |
|----------|-------|----------|
| `--viz-1` | `#4A9EFF` | Primary data series |
| `--viz-2` | `#4ADE80` | Secondary series / positive |
| `--viz-3` | `#FFC947` | Tertiary series |
| `--viz-4` | `#FF6B9D` | Fourth series |
| `--viz-5` | `#B794F6` | Fifth series |
| `--viz-6` | `#00D9FF` | Sixth series |
| `--viz-7` | `#FF8A5B` | Seventh series |
| `--viz-8` | `#8B5CF6` | Eighth series |

---

## 3. Typography

### 3.1 Font Families

```css
--font-display: 'Space Grotesk', system-ui, sans-serif;  /* Headings */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;  /* Body */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;   /* Data/Code */
```

### 3.2 Type Scale

| Variable | Size | Line Height | Usage |
|----------|------|-------------|-------|
| `--text-xs` | 0.75rem (12px) | 1.5 | Captions, labels |
| `--text-sm` | 0.875rem (14px) | 1.5 | Small body text |
| `--text-base` | 1rem (16px) | 1.5 | Default body |
| `--text-lg` | 1.125rem (18px) | 1.5 | Large body |
| `--text-xl` | 1.25rem (20px) | 1.25 | Section subheads |
| `--text-2xl` | 1.5rem (24px) | 1.25 | Card titles |
| `--text-3xl` | 1.875rem (30px) | 1.25 | Page subheadings |
| `--text-4xl` | 2.25rem (36px) | 1.25 | Page titles |
| `--text-5xl` | 3rem (48px) | 1.1 | Hero headings |
| `--text-6xl` | 3.75rem (60px) | 1.1 | Display text |

### 3.3 Font Weights

| Variable | Weight | Usage |
|----------|--------|-------|
| `--font-light` | 300 | Subtle text |
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Emphasis |
| `--font-semibold` | 600 | Subheadings |
| `--font-bold` | 700 | Headlines |

### 3.4 Typography Classes

| Class | Description |
|-------|-------------|
| `.text-hero` | 60px, bold, tight tracking |
| `.text-h1` | 36px, bold, display font |
| `.text-h2` | 30px, semibold |
| `.text-h3` | 24px, semibold |
| `.text-data` | Monospace, semibold |
| `.gradient-text` | Blue-to-purple text gradient |
| `.gradient-text-cyan` | Cyan-to-blue text gradient |

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (8px Grid)

| Variable | Size | Usage |
|----------|------|-------|
| `--space-0` | 0 | No spacing |
| `--space-1` | 0.25rem (4px) | Micro spacing |
| `--space-2` | 0.5rem (8px) | Tight spacing |
| `--space-3` | 0.75rem (12px) | Close elements |
| `--space-4` | 1rem (16px) | Default |
| `--space-5` | 1.25rem (20px) | Comfortable |
| `--space-6` | 1.5rem (24px) | Generous |
| `--space-8` | 2rem (32px) | Section spacing |
| `--space-10` | 2.5rem (40px) | Large spacing |
| `--space-12` | 3rem (48px) | XL spacing |
| `--space-16` | 4rem (64px) | XXL spacing |
| `--space-20` | 5rem (80px) | Page sections |
| `--space-24` | 6rem (96px) | Hero sections |

### 4.2 Border Radius

| Variable | Size | Usage |
|----------|------|-------|
| `--radius-sm` | 0.25rem (4px) | Badges, small elements |
| `--radius-md` | 0.5rem (8px) | Buttons, inputs |
| `--radius-lg` | 0.75rem (12px) | Cards |
| `--radius-xl` | 1rem (16px) | Modals, large cards |
| `--radius-2xl` | 1.5rem (24px) | Feature cards |
| `--radius-full` | 9999px | Pills, avatars |

### 4.3 Shadows

| Variable | Effect | Usage |
|----------|--------|-------|
| `--shadow-sm` | 0 1px 3px rgba(0,0,0,0.4) | Subtle depth |
| `--shadow-md` | 0 4px 12px rgba(0,0,0,0.5) | Card hover |
| `--shadow-lg` | 0 20px 40px rgba(0,0,0,0.6) | Modals |
| `--shadow-xl` | 0 40px 80px rgba(0,0,0,0.7) | Dialogs |
| `--shadow-glow-blue` | 0 0 20px rgba(74,158,255,0.3) | Neon effect |
| `--shadow-glow-purple` | 0 0 20px rgba(183,148,246,0.3) | Secondary glow |

---

## 5. Components Library

### 5.1 Buttons

#### Primary Button (`.btn-primary`)
```css
Background: linear-gradient(135deg, #4A9EFF, #B794F6)
Color: white
Padding: 12px 24px
Border-radius: 8px
Shadow: 0 4px 12px rgba(74,158,255,0.3)
Hover: translateY(-2px), shadow increase
```

#### Secondary Button (`.btn-secondary`)
```css
Background: transparent
Border: 1.5px solid rgba(163,173,191,0.12)
Color: --text-primary
Hover: border-color: #4A9EFF, bg: rgba(74,158,255,0.08)
```

#### Icon Button (`.btn-icon`)
```css
Size: 40x40px
Background: --bg-tertiary
Border-radius: 8px
Hover: scale(1.05), bg: --bg-elevated
```

### 5.2 Cards

#### Standard Card (`.card`)
```css
Background: --bg-secondary
Border: 1px solid rgba(163,173,191,0.12)
Border-radius: 12px
Padding: 24px
Hover: border-color: rgba(74,158,255,0.3), translateY(-2px)
```

#### Glass Card (`.glass-card`)
```css
Background: rgba(28,35,51,0.6)
Backdrop-filter: blur(24px)
Border: 1px solid rgba(163,173,191,0.12)
Box-shadow: inset 0 1px 0 rgba(255,255,255,0.05)
```

#### Feature Card (`.feature-card`)
```css
Base: standard card styles
Padding: 32px
Border-radius: 16px
Animated top gradient bar (3px, blue-to-purple) on hover
Hover: translateY(-4px), larger shadow
```

### 5.3 Inputs

#### Text Input (`.input-field`)
```css
Background: --bg-secondary
Border: 1.5px solid rgba(163,173,191,0.12)
Padding: 12px
Border-radius: 8px
Focus: border-color: #4A9EFF, shadow ring
Placeholder: --text-tertiary
```

#### Select Dropdown (`.select-field`)
```css
Custom dropdown arrow SVG
Background position: right 12px center
Appearance: none
```

### 5.4 Badges

| Class | Background | Border | Text Color |
|-------|------------|--------|------------|
| `.badge-success` | rgba(74,222,128,0.15) | rgba(74,222,128,0.3) | `--accent-green` |
| `.badge-warning` | rgba(255,201,71,0.15) | rgba(255,201,71,0.3) | `--accent-yellow` |
| `.badge-error` | rgba(255,87,87,0.15) | rgba(255,87,87,0.3) | `--accent-red` |
| `.badge-info` | rgba(74,158,255,0.15) | rgba(74,158,255,0.3) | `--accent-blue` |
| `.badge-purple` | rgba(183,148,246,0.15) | rgba(183,148,246,0.3) | `--accent-purple` |

### 5.5 Progress Bar

```css
Track: --bg-tertiary, 8px height, rounded
Fill: gradient(90deg, --accent-blue, --accent-cyan)
Animation: shimmer effect (2s infinite)
```

### 5.6 KPI Card

```css
Icon: 48x48px, gradient background
Value: font-mono, 30px, bold
Label: uppercase, letter-spacing: 0.5px
Change indicator: positive=green, negative=red
```

### 5.7 Data Table

```css
Header: bg: --bg-tertiary, uppercase, 12px
Rows: alternating bg, hover highlight
Border: 1px solid --border-primary between rows
Font: monospace
```

### 5.8 Modal

```css
Overlay: rgba(10,14,26,0.85), backdrop-blur: 8px
Content: --bg-secondary, max-width: 600px
Animation: scale + fade in (0.3s)
Header/Footer: border separator
```

### 5.9 Navigation

```css
Fixed, glass effect (rgba(10,14,26,0.8) + blur(24px))
Link hover: underline animation (scaleX transition)
Height: 64px
```

---

## 6. Page-by-Page Breakdown

### 6.1 Landing Page (`/`)

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│  Fixed Nav Bar (Glass Effect)                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Hero Section (pt-32 pb-20)                    │
│  ├─ Badge: "Powered by Advanced ML Models"     │
│  ├─ Hero Title: "Transform Sales Data..."      │
│  ├─ Subtitle: platform description             │
│  ├─ CTA Buttons: Primary + Secondary           │
│  └─ Trust Badges: "No credit card", "14-day"   │
│                                                 │
│  Dashboard Preview Card (right side on lg)      │
│  └─ Animated bar chart + live badge            │
│                                                 │
├─────────────────────────────────────────────────┤
│  Stats Section (bg-secondary)                  │
│  ├─ 98.77% Accuracy (animated counter)         │
│  ├─ 500+ Clients                               │
│  └─ 10M+ Predictions                           │
├─────────────────────────────────────────────────┤
│  Features Grid (3 columns)                     │
│  ├─ AI-Powered Forecasting                     │
│  ├─ Interactive Dashboards                     │
│  ├─ Scenario Planning                          │
│  ├─ Enterprise Security                        │
│  ├─ Real-time Updates                          │
│  └─ Team Collaboration                         │
├─────────────────────────────────────────────────┤
│  CTA Section (gradient overlay)                │
│  └─ "Ready to transform your forecasting?"     │
├─────────────────────────────────────────────────┤
│  Footer                                         │
└─────────────────────────────────────────────────┘
```

**Key Visual Elements:**
- Gradient mesh background with animated orbs
- Animated counter component for stats
- Scroll indicator with bounce animation
- Feature cards with top gradient border on hover

**Colors Used:**
- Background: `--bg-primary` + gradient mesh
- Cards: `--bg-secondary`
- CTAs: Blue-purple gradient
- Feature icons: Custom gradients per feature

---

### 6.2 Login Page (`/login`)

**Layout:** Split-panel (40% / 60%)

**Left Panel (Branding):**
- Video background with low opacity (0.05)
- ForecastAI logo + tagline
- Feature highlights with check icons
- Trust badges (GDPR, 256-bit encryption)

**Right Panel (Form):**
- Glassmorphic card (backdrop blur)
- Email input with Mail icon
- Password input with toggle visibility
- "Remember me" checkbox
- Primary login button
- "Forgot password" + "Register" links

**Visual Effects:**
- Decorative gradient blobs (blur: 120px)
- Input focus rings in indigo
- Button gradient + hover scale
- Loading spinner state

---

### 6.3 Register Page (`/register`)

**Layout:** Split-panel (40% / 60%)

**Left Panel:**
- 14-day free trial badge (emerald accent)
- Headline: "Start your journey to smarter forecasting"
- Benefits list with animated entrance

**Right Panel (Form):**
- Full name input
- Work email input
- Password with strength indicator
  - 5-bar visual strength meter
  - Requirement checklist (8+ chars, upper, lower, number)
- Confirm password with match validation
- Terms acceptance checkbox
- Create account button

**Password Strength Colors:**
```javascript
['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981']
// Very Weak → Weak → Fair → Good → Strong
```

---

### 6.4 Dashboard (`/dashboard`)

**Layout:** Sidebar + Main Content

**Components:**
1. **Welcome Banner**
   - User greeting
   - Quick action buttons

2. **KPI Cards Row** (4 columns)
   - Total Forecasts
   - Active Sessions
   - Accuracy Rate
   - Saved Models

3. **Quick Actions**
   - Start Analysis (primary)
   - Upload Data
   - View Reports

4. **Activity Feed**
   - Recent analyses
   - Timestamps
   - Status badges

5. **System Health**
   - Backend status
   - Frontend status
   - Last sync time

---

### 6.5 Analysis Pipeline (`/analysis`)

**5-Step Progress Indicator:**
```
[1. Upload Data] → [2. Profile Dataset] → [3. Preprocess] → [4. Train Model] → [5. View Results]
```

**Step States:**
- Completed: Green circle + checkmark
- Active: Blue circle + ring animation
- Pending: Gray circle

**Step 1: Upload**
- Drag-drop zone (dashed border)
- File format validation
- Column mapping modal

**Step 2: Profile**
- Dataset statistics
- Data quality score
- Missing value analysis

**Step 3: Preprocess**
- Animated log entries
- Transformation explanations
- Green checkmarks for completed

**Step 4: Training**
- Real-time progress bar
- Model status (Prophet, XGBoost, SARIMA)
- Elapsed time counter

**Step 5: Results**
- Tab navigation (Insights, Charts, Actions)
- Business insights summary
- Interactive forecast chart
- Actionable recommendations

---

### 6.6 Scenario Planner (`/scenarios`)

**Features:**
- Parameter adjustment sliders
- Real-time chart updates
- Scenario comparison overlay
- Save/load scenarios
- Export options

---

### 6.7 Reports (`/reports`)

**Components:**
- Report history table
- Date range filters
- Export buttons (PDF, CSV)
- Report preview modal

---

## 7. Animations & Effects

### 7.1 Animation Durations

| Variable | Duration | Usage |
|----------|----------|-------|
| `--duration-fast` | 150ms | Micro interactions |
| `--duration-base` | 250ms | Standard transitions |
| `--duration-slow` | 350ms | Emphasis animations |
| `--duration-slower` | 500ms | Page transitions |

### 7.2 Easing Functions

```css
--easing-ease-in: cubic-bezier(0.4, 0, 1, 1);
--easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
--easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 7.3 Key Animations

| Animation | Effect | Duration |
|-----------|--------|----------|
| `shimmer` | Progress bar shine | 2s infinite |
| `spin` | Loading spinner | 0.8s linear infinite |
| `pulseRing` | Pulse effect | 2s ease-out infinite |
| `skeleton-loading` | Skeleton placeholder | 1.5s ease-in-out infinite |
| `modalIn` | Modal entrance | 0.3s ease-out |
| `gradientShift` | Background movement | 20s ease infinite |

### 7.4 Framer Motion Patterns

**Page Transitions:**
```jsx
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
```

**Scroll Reveal:**
```jsx
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ delay: index * 0.1 }}
```

**Button Hover:**
```jsx
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

---

## 8. Responsive Design

### 8.1 Breakpoints

| Breakpoint | Min-Width | Target |
|------------|-----------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktops |
| `xl` | 1280px | Large desktops |
| `2xl` | 1536px | Ultra-wide |

### 8.2 Layout Patterns

**Landing Page:**
- Mobile: Single column, stacked
- Desktop: Two-column hero grid

**Dashboard:**
- Mobile: Stacked cards
- Tablet: 2-column grid
- Desktop: Sidebar + main content

**Auth Pages:**
- Mobile: Full-width form
- Desktop: Split panel (40/60)

### 8.3 Typography Scaling

```css
/* Mobile (base) */
.text-hero: 36px

/* Tablet (md) */
.text-hero: 48px

/* Desktop (lg) */
.text-hero: 60px
```

---

## 9. Accessibility

### 9.1 Focus States

```css
*:focus-visible {
  outline: 2px solid var(--accent-blue);
  outline-offset: 2px;
}
```

### 9.2 Color Contrast

All text combinations meet WCAG AA standards:
- Primary text on bg-primary: 12.5:1
- Secondary text on bg-primary: 7.2:1
- Accent colors on bg-secondary: 5.5:1+

### 9.3 Screen Reader Utilities

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 9.4 Keyboard Navigation

- All interactive elements are focusable
- Tab order follows visual hierarchy
- Skip links available for main content
- Escape key closes modals

---

## 📎 Quick Reference

### File Locations

| File | Path | Purpose |
|------|------|---------|
| Main CSS | `frontend/src/index.css` | Design system variables |
| Landing | `frontend/src/pages/Landing.jsx` | Homepage |
| Login | `frontend/src/pages/Login.jsx` | Auth |
| Register | `frontend/src/pages/Register.jsx` | Auth |
| Dashboard | `frontend/src/pages/Dashboard.jsx` | Main dashboard |
| Analysis | `frontend/src/pages/AnalysisDashboard.jsx` | Pipeline |
| Layout | `frontend/src/components/layout/Layout.jsx` | Wrapper |
| Sidebar | `frontend/src/components/layout/Sidebar.jsx` | Navigation |
| Header | `frontend/src/components/layout/Header.jsx` | Top bar |

### CSS Class Naming Convention

```
.component-name         → Base component
.component-name:hover   → Hover state
.component-name.active  → Active state
.component-name.loading → Loading state
```

---

<div align="center">

Built with ❤️ for ForecastAI

**Last Updated:** February 2026

</div>
