---
name: AI Coding Coach
description: Post-session scoring dashboard for AI coding tool users
colors:
  primary: "oklch(0.65 0.16 45)"
  primary-dim: "oklch(0.65 0.16 45 / 0.12)"
  primary-hover: "oklch(0.72 0.14 45)"
  accent: "oklch(0.72 0.15 155)"
  accent-dim: "oklch(0.72 0.15 155 / 0.12)"
  bg: "oklch(0.09 0 0)"
  surface: "oklch(0.14 0 0)"
  surface-raised: "oklch(0.18 0 0)"
  border: "oklch(0.22 0 0)"
  ink: "oklch(0.93 0 0)"
  muted: "oklch(0.65 0 0)"
  danger: "oklch(0.62 0.2 27)"
  danger-dim: "oklch(0.62 0.2 27 / 0.12)"
  warning: "oklch(0.75 0.15 85)"
typography:
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "'SF Mono', 'Cascadia Code', 'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.8rem"
    fontWeight: 500
    lineHeight: 1.5
  display:
    fontFamily: "'SF Mono', 'Cascadia Code', 'JetBrains Mono', ui-monospace, monospace"
    fontSize: "2.2rem"
    fontWeight: 700
    lineHeight: 1
  heading:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  2xl: "4rem"
components:
  progress-ring:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    size: "140px"
    rounded: "{rounded.full}"
  axis-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "0.5rem"
    rounded: "{rounded.sm}"
    height: "44px"
  coaching-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "1.5rem"
    rounded: "{rounded.lg}"
  delta-badge-up:
    backgroundColor: "{colors.accent-dim}"
    textColor: "{colors.accent}"
    padding: "3px 8px"
    rounded: "{rounded.full}"
  delta-badge-down:
    backgroundColor: "{colors.danger-dim}"
    textColor: "{colors.danger}"
    padding: "3px 8px"
    rounded: "{rounded.full}"
  pb-badge:
    backgroundColor: "{colors.primary-dim}"
    textColor: "{colors.primary}"
    padding: "4px 10px"
    rounded: "{rounded.full}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    padding: "10px 12px"
    rounded: "{rounded.sm}"
    height: "44px"
  nav-link-active:
    backgroundColor: "{colors.primary-dim}"
    textColor: "{colors.primary}"
    padding: "10px 12px"
    rounded: "{rounded.sm}"
---

# Design System: AI Coding Coach

## 1. Overview

**Creative North Star: "The Training Log"**

Like a runner's logbook after a race. Honest data, personal progress, the quiet confidence of knowing your numbers. No coach yelling, just the facts and what to try next. The interface is something you open for 10 seconds after a session, absorb the insight, and close knowing what to work on.

The system occupies the intersection of athletic personal tracking (Apple Fitness, Strava) and developer tool density (Raycast, Linear). It uses a dark canvas with restrained crimson and green accent moments. The aesthetic is terminal-adjacent but never cold: warm crimson gives it pulse, and the monospace data values give it developer credibility.

This system explicitly rejects: the Grafana 47-panel monitoring wall, generic SaaS dark dashboards with radar charts and green accents, corporate HR training platforms, and over-gamified apps with mascots and fake urgency streaks. The dashboard is personal, not surveillance. Athletic, not corporate.

**Key Characteristics:**
- Pure black canvas, achromatic neutrals, OKLCH color space throughout
- Crimson primary for active/warm moments, green accent for positive signals
- Monospace for all data values and navigation, system sans for body prose
- Coaching insight leads the page (not a vanity score)
- Apple Fitness progress ring as the score visualization
- 44px minimum touch targets, full keyboard navigation, screen reader semantics

## 2. Colors: The Crimson Logbook

A restrained dark palette with two committed moments: crimson primary and green accent. Color appears sparingly and means something when it does.

### Primary
- **Warm Crimson** (oklch 0.65 0.16 45): Active state, primary accent, score ring for mid-range scores (5-7), navigation active state, coaching bullets, personal best badge background tint. The single warm element in an otherwise achromatic system.
- **Crimson Dim** (oklch 0.65 0.16 45 / 0.12): Background tint for active nav links, PB badge fill, primary-associated containers.
- **Crimson Hover** (oklch 0.72 0.14 45): Lighter variant for hover states on crimson elements.

### Secondary
- **Progress Green** (oklch 0.72 0.15 155): Strong scores (8+), positive deltas, "what good looks like" signal labels. Shared with the success semantic role.
- **Green Dim** (oklch 0.72 0.15 155 / 0.12): Background for positive delta badges.

### Tertiary
- **Alert Crimson** (oklch 0.62 0.2 27): Weak scores (below 5), negative deltas, anti-pattern warnings, "what weak looks like" labels. Deeper and redder than the primary; signals concern without alarm.
- **Alert Dim** (oklch 0.62 0.2 27 / 0.12): Background for negative delta badges, anti-pattern containers.
- **Caution Amber** (oklch 0.75 0.15 85): Warning states. Rarely used in current surface.

### Neutral
- **Void** (oklch 0.09 0 0): Page background. Pure achromatic black with minimal lightness.
- **Surface** (oklch 0.14 0 0): Panel backgrounds, coaching containers, tooltip fills.
- **Surface Raised** (oklch 0.18 0 0): Axis track backgrounds, skeleton loading states.
- **Border** (oklch 0.22 0 0): Separators, section dividers, evidence quote borders.
- **Ink** (oklch 0.93 0 0): Primary text. High contrast against void.
- **Muted** (oklch 0.65 0 0): Secondary text, labels, timestamps, meta values.

### Named Rules
**The Restrained Color Rule.** Crimson and green are committed moments: ring fill, badges, signal labels, delta indicators. They never appear as decorative fills, gradients, or background washes. Their rarity is the point. A screen with more than 15% saturated color has lost restraint.

## 3. Typography

**Body Font:** System sans (-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif)
**Data/Label Font:** SF Mono, Cascadia Code, JetBrains Mono, ui-monospace, monospace

**Character:** The monospace does the heavy lifting. It carries navigation links, section headers, score values, dates, delta badges, and all data elements. The system sans appears only in body prose (coaching suggestions, insight text, descriptions). This split makes the interface feel like a developer's personal tool, not a consumer dashboard.

### Hierarchy
- **Display** (mono, 700, 2.2rem, line-height 1): Score number inside the progress ring. The single largest element on any screen.
- **Heading** (sans, 700, 1.5rem, line-height 1.2): Axis deep-dive page titles.
- **Insight** (sans, 500, 1.25rem, line-height 1.45): The coaching insight sentence. max-width 58ch, text-wrap: pretty.
- **Body** (sans, 400, 0.9rem, line-height 1.55): Coaching items, suggestions, descriptions. max-width 62ch.
- **Label** (mono, 500, 0.8rem, letter-spacing 0.02em): Section headers, navigation links, meta labels, timestamps.
- **Data** (mono, 600-700, 0.875-1.1rem): Score values, axis numbers, session scores. Weight communicates hierarchy.

### Named Rules
**The Mono-First Rule.** If a text element represents data, navigation, or a label, it is monospace. If it represents prose or coaching language, it is system sans. There is no third option. Display fonts are prohibited.

## 4. Elevation

Flat by default. The system uses tonal layering (void < surface < surface-raised) to create depth without shadows. The single exception is the tooltip, which uses a pronounced box-shadow to float above the surface.

### Shadow Vocabulary
- **Tooltip shadow** (`0 8px 32px oklch(0 0 0 / 0.4)`): The only shadow in the system. Applied to the axis tooltip on hover/focus. Its opacity and blur radius make it clearly float above the dark surface without introducing a distinct elevation language.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are differentiated by lightness steps (0.09 > 0.14 > 0.18), not shadows. Shadows appear only on floating overlays (tooltip). Adding box-shadow to cards, panels, or containers is prohibited.

## 5. Components

### Progress Ring
The signature element. An Apple Fitness-style circular progress ring (SVG, 140px diameter) that fills proportionally to the score (0-10). The ring is the score visualization, not a big number hero.
- **Shape:** Full circle, 10px stroke width, round stroke-linecap
- **Background track:** surface-raised (oklch 0.18)
- **Fill color:** Semantic (green >= 8, crimson 5-7, danger < 5)
- **Animation:** stroke-dashoffset transition, 0.8s cubic-bezier(0.16, 1, 0.3, 1). Disabled under prefers-reduced-motion.
- **Center label:** Display mono score + "of 10" sublabel in muted

### Axis Row
Interactive row showing skill name, progress bar, and numeric score. Clickable to deep-dive.
- **Layout:** 4-column grid (110px label | 1fr track | 36px score | 20px chevron)
- **Track:** 6px height, surface-raised background, colored fill bar (scaleX transform)
- **Hover:** surface background, chevron opacity 1
- **Focus:** 2px crimson outline, 2px offset
- **Min height:** 44px (touch target)

### Coaching Panel
Container for coaching suggestions. The primary actionable content after the insight.
- **Background:** surface with 1px border
- **Radius:** 16px (lg)
- **Internal padding:** 1.5rem
- **Items:** 6px crimson dots (position absolute), 0.9rem body text, 62ch max-width

### Delta Badge
Pill-shaped indicator showing score change from previous session.
- **Positive:** green-dim background, green text, prefix "+"
- **Negative:** danger-dim background, danger text
- **Neutral:** muted at 12% opacity background, muted text
- **Shape:** full radius pill, mono 0.8rem 600 weight

### Personal Best Badge
Appears when the current score equals or exceeds all-time best.
- **Shape:** full radius pill
- **Background:** primary-dim
- **Text:** primary, mono, 0.75rem, 700 weight, 0.04em tracking

### Navigation
Monospace link bar in the page header.
- **Default:** muted text, transparent background
- **Hover:** ink text, surface background
- **Active:** primary text, primary-dim background
- **Size:** 0.8rem mono, 10px 12px padding, 44px min-height

### Tooltip
Axis detail overlay on hover/focus. The only elevated element.
- **Background:** surface with 1px border
- **Shadow:** 0 8px 32px oklch(0 0 0 / 0.4)
- **Radius:** 10px (md)
- **Max width:** 320px
- **Entry:** opacity + translateY(4px), 0.15s ease
- **Dismissed by:** mouseout, focusout, Escape key

### Sparkline Chart
SVG trend visualization showing score history.
- **Line:** primary stroke, 2px, round cap/join
- **Area:** primary-dim fill beneath the line
- **Dots:** primary fill, last dot in ink (current session emphasis)
- **Grid:** border color, 0.5px stroke
- **Labels:** mono 11px, muted fill

## 6. Do's and Don'ts

### Do:
- **Do** lead every page with the coaching insight, not the score number. The insight is what changes behavior.
- **Do** use the progress ring as the primary score visualization. One ring per screen maximum.
- **Do** use monospace for all data elements (scores, dates, navigation, labels, commands).
- **Do** respect 44px minimum touch targets on all interactive elements.
- **Do** provide visible focus indicators (2px crimson outline, 2px offset) on all focusable elements.
- **Do** use skeleton loading states (shimmer animation) rather than spinners when loading data.
- **Do** honor prefers-reduced-motion by disabling all transitions and animations.
- **Do** maintain the tonal layering hierarchy: void (0.09) < surface (0.14) < surface-raised (0.18).
- **Do** use semantic score colors consistently: green >= 8, crimson 5-7, danger < 5.

### Don't:
- **Don't** use radar charts. They are the generic AI dashboard cliche this product exists to oppose.
- **Don't** use a big-number hero metric. The ring replaces the hero-metric template.
- **Don't** add box-shadows to cards or containers. Tonal layering only. Shadows are reserved for the tooltip.
- **Don't** introduce display or decorative fonts. The system uses two stacks: system sans and monospace. No third option.
- **Don't** use border-left or border-right greater than 1px as colored accent stripes.
- **Don't** add gradient text, glassmorphism, or decorative blurs.
- **Don't** use green accents on a dark background as the primary brand color. That's every AI tool in 2025-2026. Our primary is crimson.
- **Don't** create multiple card grids. This is a single-column reading experience, not a SaaS dashboard grid.
- **Don't** use streaks, badges (except PB), leaderboards, or gamification patterns. Motivating, not infantilizing.
- **Don't** introduce alerts, toast notifications, or urgency states. This is a post-session debrief, not a monitoring tool.
- **Don't** use tiny uppercase tracked eyebrows above every section. Section headers are mono, 0.8rem, sentence case.
