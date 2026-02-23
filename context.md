

**This is the SINGLE SOURCE OF TRUTH for the YatraX project. Read everything before writing any code. Every design decision, visual specification, interaction pattern, data model, and architectural choice is documented here.**

---

## SECTION 1: PROJECT OVERVIEW

### What Is YatraX

YatraX (Yatra = Journey in Sanskrit + X = Next-gen) is a mobile-first Progressive Web App that provides real-time AI-powered safety intelligence to tourists. It continuously analyzes the tourist's surroundings using 153 factors across 16 categories and provides proactive alerts BEFORE danger occurs — not just reactive warnings.

The app's entire visual identity — colors, animation speeds, glow intensities — shifts dynamically based on the current ML-calculated safety score, making the interface itself a safety indicator. The app feels alive and responsive to the environment.

**Target region**: Assam, India (expandable to other Indian states, then global)
**Target users**: Domestic and international tourists, solo travelers, female travelers, elderly tourists, adventure travelers in remote/wilderness areas
**Platform**: Progressive Web App — installable, works offline, feels native
**Status**: In active development, refactoring from MVP to production architecture

---

## SECTION 2: COMPLETE TECH STACK

### Frontend Core
- React 19 with concurrent features
- TypeScript 5.7 in strict mode
- Vite 6 as bundler with HMR

### Styling and UI
- Tailwind CSS v4 with CSS-first configuration using @theme block
- shadcn/ui built on Radix UI primitives (all components installed)
- Lucide React for consistent iconography (300+ icons)
- CSS animations preferred over JS animations for performance

### Mapping and Location
- Leaflet 1.9.4 for map rendering (NOT Google Maps JavaScript API)
- React-Leaflet 4.2.1 for React bindings

### Data and State
- React Context for global state (session, theme, SOS)
- localStorage for persistent settings, offline SOS queue, SOS ball position
- IndexedDB planned for offline map tiles cache

### Utilities
- qrcode.react for QR code generation on digital ID
- date-fns for date/time formatting
- sonner for toast notifications

### Backend (Separate Repository)
- Spring Boot or Node.js REST API plus WebSocket server
- PostgreSQL with PostGIS for spatial database (zones, stations)
- Redis for real-time data cache
- Python ML pipeline for safety score calculation (future phases)
- JWT for authentication

### Google Maps Platform (HYBRID APPROACH)
Critical architectural decision: Google provides DATA, Leaflet provides MAP RENDERING. We never load the Google Maps JavaScript API for tile rendering.

APIs used:
- Places API (New) — search autocomplete, place details, nearby search, place photos
- Directions API — route calculation with alternatives, polyline decoding
- Distance Matrix API — real travel time to police stations and hospitals
- Geocoding API — reverse geocode for SOS address context and location labels
- Air Quality API — AQI data as safety score factor
- Geolocation API — WiFi-based positioning fallback when GPS fails

Estimated cost: $400-600/month for 1000 active users without caching, $100-150/month with aggressive caching

### Environment Variables
```
VITE_API_BASE_URL        — Backend API base URL
VITE_WS_URL              — WebSocket endpoint
VITE_GOOGLE_MAPS_API_KEY — Google Maps Platform key
VITE_ENABLE_GOOGLE_PLACES          — Feature flag (boolean)
VITE_ENABLE_GOOGLE_DIRECTIONS      — Feature flag
VITE_ENABLE_GOOGLE_GEOCODING       — Feature flag
VITE_ENABLE_GOOGLE_DISTANCE_MATRIX — Feature flag
VITE_ENABLE_GOOGLE_AIR_QUALITY     — Feature flag
VITE_APP_VERSION                   — Semantic version string
```

When Google feature flags are disabled, the app falls back to: Nominatim for search, straight-line distance for routing, no AQI data.

---

## SECTION 3: DESIGN SYSTEM — "Glassmorphism Safety"

### Visual Philosophy

"Premium frosted-glass aesthetic that breathes with the environment."

The app does not just display safety data — it BECOMES the safety state. The entire color palette, animation speed, glow intensity, and SOS ball size shifts based on the ML safety score. Every glass card, every button, every badge reflects the current safety context.

### Core Design Principles
1. Glassmorphism First — every overlay uses frosted-glass effect
2. Dynamic Theming — entire palette shifts with safety score
3. Smooth Transitions — 2-second color interpolations in oklch color space
4. Mobile-Native Feel — active states over hover, 44px minimum touch targets
5. Accessibility Always — color is never the only indicator, aria-labels everywhere
6. Dark Mode Responsive — auto-switches at 6 PM and 6 AM, user-overrideable

---

## SECTION 4: DYNAMIC COLOR SYSTEM

The safety score (0-100) drives three distinct theme states. Every 30 seconds or on significant location change, the backend calculates a new score and the entire app transitions smoothly.

### Theme State: SAFE (Score 80-100)
Emotion: Calm, peaceful, reassuring

CSS Variables:
- --theme-bg-from: oklch(0.97 0.03 160) — soft emerald wash
- --theme-bg-to: oklch(0.97 0.02 180) — cyan tint
- --theme-primary: oklch(0.65 0.17 160) — emerald-500 base
- --theme-primary-foreground: oklch(0.99 0 0)
- --theme-glow: oklch(0.65 0.17 160 / 0.15) — subtle emerald glow
- --theme-card-bg: rgba(255, 255, 255, 0.70)
- --theme-card-border: rgba(16, 185, 129, 0.15)
- --sos-scale: 1
- --sos-pulse-speed: 3s — slow calm pulse

Visual appearance: Background has gentle emerald gradient barely perceptible. Glass cards have emerald-tinted borders. SOS ball is 48px pulsing slowly. Status badge reads "Low Risk" in emerald. All interactive elements use emerald accent.

### Theme State: CAUTION (Score 50-79)
Emotion: Alert, attentive, watchful

CSS Variables:
- --theme-bg-from: oklch(0.97 0.03 85) — warm amber wash
- --theme-bg-to: oklch(0.97 0.02 95) — yellow tint
- --theme-primary: oklch(0.68 0.15 85) — amber-500 base
- --theme-primary-foreground: oklch(0.99 0 0)
- --theme-glow: oklch(0.68 0.15 85 / 0.15) — amber glow
- --theme-card-bg: rgba(255, 255, 255, 0.70)
- --theme-card-border: rgba(245, 158, 11, 0.15)
- --sos-scale: 1.17
- --sos-pulse-speed: 2s — medium pulse

Visual appearance: Background shifts to warm amber gradient. Glass cards have amber-tinted borders. SOS ball grows to 56px and pulses faster. Status badge reads "Moderate Risk" in amber. Transition from previous state is smooth 2-second fade.

### Theme State: DANGER (Score 0-49)
Emotion: Urgent, alarming, protective

CSS Variables:
- --theme-bg-from: oklch(0.97 0.03 25) — urgent red wash
- --theme-bg-to: oklch(0.97 0.02 35) — orange-red tint
- --theme-primary: oklch(0.62 0.23 25) — red-500 base
- --theme-primary-foreground: oklch(0.99 0 0)
- --theme-glow: oklch(0.62 0.23 25 / 0.20) — intense red glow at 20%
- --theme-card-bg: rgba(255, 255, 255, 0.75) — slightly more opaque
- --theme-card-border: rgba(220, 38, 38, 0.20)
- --sos-scale: 1.33
- --sos-pulse-speed: 1s — aggressive rapid pulse

Visual appearance: Background has urgent red gradient more noticeable than other states. Glass cards have red-tinted borders with stronger glow. SOS ball grows to 64px pulsing rapidly. Status badge reads "High Risk" in red with alert icon. Digital ID card border glows red subtly. Map risk zones appear more prominent.

### Theme Transition Mechanics

All animatable CSS custom properties are registered with @property declarations so browsers can interpolate them smoothly:

```
@property --theme-primary {
  syntax: '<color>';
  initial-value: oklch(0.65 0.17 160);
  inherits: true;
}
```

The :root element uses SPECIFIC property transitions (NOT "transition: all 2s" which destroys performance):

```
:root {
  transition-property: --theme-primary, --theme-bg-from, --theme-bg-to,
                       --theme-glow, --theme-card-border, --sos-scale;
  transition-duration: 2s;
  transition-timing-function: ease-in-out;
}
```

Why oklch color space: perceptually uniform (humans perceive transitions as smooth), wide gamut (richer colors than RGB/HSL), predictable interpolation (no unexpected hue shifts during transition), modern browser support above 90% with graceful degradation.

The ThemeProvider updates BOTH our custom --theme-* variables AND shadcn's --color-primary (converted to HSL) simultaneously so that all shadcn components (buttons, badges, inputs, switches) shift color together with the theme.

---

## SECTION 5: GLASS CARD HIERARCHY

Three levels of glassmorphism with precise opacity and blur values. Higher levels are more prominent.

### Level 1: Hero Cards (Highest Prominence)
Used for: Safety score hero card, digital ID card front

- background: var(--theme-card-bg) at 70% opacity white
- backdrop-filter: blur(20px)
- border: 1px solid var(--theme-card-border)
- box-shadow: 0 8px 32px var(--theme-glow), 0 4px 16px rgba(0,0,0,0.04)
- border-radius: 24px (rounded-3xl)
- Dark mode: bg rgba(30,41,59,0.70) with white/5 border, glow shadow intensified

### Level 2: Action Cards (Medium Prominence)
Used for: Quick action buttons, alert list items, destination bar, search results

- background: rgba(255,255,255,0.50)
- backdrop-filter: blur(16px)
- border: 1px solid rgba(0,0,0,0.04)
- box-shadow: 0 4px 16px rgba(0,0,0,0.03)
- border-radius: 16px (rounded-2xl)
- Dark mode: bg rgba(30,41,59,0.50) with white/4 border

### Level 3: Info Cards (Lowest Prominence)
Used for: Daily tip, settings sections, bottom sheet content

- background: rgba(255,255,255,0.30)
- backdrop-filter: blur(12px)
- border: 1px solid rgba(0,0,0,0.02)
- box-shadow: none
- border-radius: 12px (rounded-xl)
- Dark mode: bg rgba(30,41,59,0.30) with white/3 border

### Glass on Glass Rule
When nesting glass cards, child uses the next level down. Level 1 hero containing Level 2 actions. Never same level inside same level (causes visual muddiness).

---

## SECTION 6: GRADIENT MESH BACKGROUND

Fixed full-screen layer behind all content providing a dynamic animated background that reinforces theme state without being distracting.

Structure: 3-4 radial gradients using theme color variables, animated with a slow 60-second CSS animation loop. Pure CSS, no JavaScript animation frames, GPU-accelerated.

Light mode opacity: 0.4
Dark mode opacity: 0.15 (much subtler)

In safe theme: gentle emerald orbs drifting slowly
In caution theme: warm amber orbs with slightly more energy
In danger theme: urgent red orbs with heightened presence

Transition: 2-second smooth fade when theme changes (driven by the CSS variable transitions)

Reduced motion: animation disabled, static at 20% opacity

---

## SECTION 7: TYPOGRAPHY SCALE

Constrained type scale optimized for mobile-first readability:

- text-4xl (36px): Safety score number only
- text-3xl (30px): Page titles
- text-2xl (24px): Section headers
- text-xl (20px): Card titles
- text-lg (18px): Prominent labels, user name in header
- text-base (16px): Default body text
- text-sm (14px): Secondary text, labels, button text
- text-xs (12px): Tertiary text, captions, timestamps
- text-[10px]: Micro labels, badge text, tab labels
- text-[9px]: Smallest text (legend items, fine print)

Font stack: system fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif)

Font weights: bold (700) for score and card titles, semibold (600) for section headers, medium (500) for buttons and badges, normal (400) for body text

Line heights: 1.1 for display (large numbers), 1.2 for headings, 1.5 for body, 1.4 for UI elements

---

## SECTION 8: SPACING AND LAYOUT

Safe area support: padding-top env(safe-area-inset-top) on StatusBar, padding-bottom env(safe-area-inset-bottom) on BottomNav and floating elements

Page container padding: 16px horizontal, top includes safe-area, bottom includes 80px for tab nav plus safe-area

Card spacing: space-y-4 (16px) between cards on home, space-y-6 (24px) between sections, gap-3 (12px) inside cards, gap-2 (8px) for tight groups like badges

Touch targets: minimum 44px by 44px everywhere, no exceptions. Buttons, links, interactive areas all meet this requirement.

---

## SECTION 9: ANIMATION SYSTEM

### Philosophy
Purposeful not decorative. Fast (200-400ms) for UI interactions. Slow (1-2s) for theme transitions. Smooth with appropriate easing. Skippable via prefers-reduced-motion.

### Core Animations

1. Theme Transition: 2000ms ease-in-out on :root CSS variables. Long enough to notice, short enough not to annoy. Feels organic.

2. Safety Score Morph: requestAnimationFrame-based smooth counting animation, NOT stepping. Duration 800ms, easeOutCubic easing (starts fast, ends slow — feels natural for numbers). Animates from previous score to new score.

3. Card Entrance: Staggered slide-in-up animation. Each child delayed by 60ms (child 1 at 0ms, child 2 at 60ms, child 3 at 120ms, up to 8 children). Each animation: 400ms ease-out, translateY(12px) to translateY(0) with opacity 0 to 1.

4. SOS Ball Pulse: Keyframe animation with speed tied to theme. Box-shadow expands from 0 to 12px then fades. Safe: 3s, Caution: 2s, Danger: 1s.

5. Countdown Pop: 400ms ease-out. Scale from 0.3 to 1.15 (overshoot) to 1.0, with opacity 0 to 1. Used for 3-2-1 countdown numbers.

6. Touch Feedback: 100ms ease-out, scale(0.97) plus opacity 0.9 on :active state. Applied to all interactive elements via .touch-action class. -webkit-tap-highlight-color: transparent.

7. Gradient Mesh Drift: 60-second loop, 4 blobs drifting with scale variations. Pure CSS keyframes.

8. Directional Bounce: 1s infinite ease-in-out. Four variants (left, right, up, down) each bouncing 8px in their direction. Used for SOS swipe guide arrows.

9. Holographic Shift: 6s ease-in-out infinite. Background-position shift creating shimmer effect on ID card.

10. Draw Ring: SVG stroke-dashoffset animation for the safety score ring progress.

### Reduced Motion
All animations disabled via @media (prefers-reduced-motion: reduce). Stagger children render at full opacity immediately. Gradient mesh becomes static at 20% opacity. SOS pulse becomes static glow.

---

## SECTION 10: DARK MODE SYSTEM

### Auto-Switch Logic
Default preference: "auto"
Storage key: "safeguard-theme-mode" in localStorage
Values: "light", "dark", "auto"
Auto behavior: Dark mode activates at 6 PM (hour >= 18), light mode at 6 AM (hour < 6)
Implementation: Class-based (.dark on html element)

### Dark Mode Adjustments

Base colors in dark mode:
- --color-background: hsl(222 47% 6%) — near-black slate
- --color-foreground: hsl(210 40% 98%) — near-white
- --color-card: hsl(222 47% 8%) — slightly lighter slate
- --color-muted: hsl(217 33% 17%) — medium slate
- --color-border: hsl(217 33% 17%)

Glass cards: bg-slate-800/70 with white/5 borders
Safety theme glows: Intensity increases from 15% to 25% in dark mode because colored glows are more visible against dark backgrounds and create beautiful halos
Map tiles: Switch from OpenStreetMap standard to CartoDB Dark Matter
Digital ID card: Premium black card finish (like Amex Centurion) instead of white
Leaflet popups and tooltips: Dark background (slate-950/92) with white/6 borders

### Dark Mode Detection
MutationObserver watches for class changes on document.documentElement to detect when .dark is toggled. This drives map tile URL switching and other dark-mode-dependent features.

---

## SECTION 11: SOS FLOATING BALL — Signature Feature

This is the most complex and most critical UI element in YatraX. It must be accessible from every page, always visible, and provide emergency SOS through intuitive touch gestures.

### Visual Design — Idle State

Shape: Perfect circle
Size: Dynamic based on theme — 48px (safe), 56px (caution), 64px (danger), calculated as calc(48px * var(--sos-scale))
Background: var(--theme-card-bg) — frosted glass
Backdrop-filter: blur(20px)
Border: 1px solid var(--theme-card-border)
Shadow: 0 4px 16px rgba(0,0,0,0.08) plus animated glow shadow from sos-pulse keyframe
Icon: Siren icon from Lucide, centered
Opacity: 0.85 at rest
Z-index: 50 (above everything except toasts)
Position: fixed
Cursor: grab (grabbing when dragging)
Animation: sos-pulse at var(--sos-pulse-speed) ease-in-out infinite

### Positioning Rules

Snaps ONLY to left or right edge of viewport (never top/bottom edge)
Can move vertically anywhere within bounds
Respects safe areas (top and bottom) plus 80px for bottom tab navigation
Edge padding: 8px from viewport edge
Default position: Right edge, 40% from top of viewport
Position persisted in localStorage key "safeguard-sos-position"
Spring snap animation on release (200ms ease-out)

### Interaction State Machine

#### State 1: Idle (Default)
Subtle pulse animation. Semi-transparent at 85%. Siren icon visible. No guides showing. Draggable.

#### State 2: Dragging
Opacity increases to 1.0. Scale increases to 1.05. Cursor changes to grabbing. No SOS logic during drag. On release: calculates nearest horizontal edge and snaps with spring animation.

#### State 3: Long Press (300ms hold without movement)
Triggered after 300ms of holding without drag movement exceeding 10px.
Heavy haptic feedback fires.
Ball expands to 1.3x scale.
Background dims slightly (overlay at 20% black opacity).
Guide arrows appear showing valid swipe directions:
- If ball is on RIGHT edge: show left arrow, up arrow, down arrow
- If ball is on LEFT edge: show right arrow, up arrow, down arrow
Text label appears below ball: "Swipe to trigger SOS"
Guide arrows animate with directional bounce (1s infinite loop).

#### State 4: Silent Pre-Alert (2-second hold without swiping)
If user holds for 2 full seconds without swiping while in long-press state:
POST /api/sos/pre-alert to backend silently.
Very subtle glow intensification (barely noticeable — user should NOT realize this happened).
No toast, no notification, no UI change.
Backend monitors the pre-alert and watches for escalation.
Purpose: If the tourist is scared or uncertain, the backend already knows something might be wrong.

#### State 5: Valid Swipe Detected — Countdown
Valid swipe conditions (ALL must be true):
- Long press state is active (after 300ms hold)
- Swipe distance >= 80px
- Horizontal swipe direction is TOWARD center of screen (right ball swipes left, left ball swipes right)
- Vertical swipes (up or down) are always valid regardless of ball side

When valid swipe detected:
Full-screen glassmorphism overlay appears (200ms fade-in).
Large morphing countdown number in center: 3, 2, 1.
Each number uses countdown-pop animation (400ms).
Heavy haptic on each tick.
Background pulses red, intensifying with each tick.
Prominent text: "TAP ANYWHERE TO CANCEL" pulsing below countdown.
If user taps anywhere: cancel, overlay fades out (200ms), ball returns to idle, light haptic.
If countdown completes without cancellation: SOS fires.

#### State 6: SOS Fired
POST /api/sos/trigger with: touristId, lat, lng, accuracy, timestamp, type "FULL_SOS", reverse-geocoded address, nearest station name and ETA.
Full-screen takeover replaces countdown:
- Large checkmark icon in emerald
- "SOS Sent" heading
- "Help is on the way" subtitle
- Emergency call button (tel:112) — large, prominent
- "Nearest police notified" with station name and ETA
- "I'm Safe Now" dismiss button (appears after 10 seconds, requires confirmation tap)
Heavy haptic success pattern.
Ball temporarily turns emerald, stops pulsing.

### Three-Tier Alert System
Tier 1 — Pre-Alert (Silent): 2-second hold, POST pre-alert, backend monitors, no dispatch, user not notified
Tier 2 — Full SOS (Dispatched): Swipe + countdown completes, POST trigger, emergency services dispatched, tourist profile shared with responders
Tier 3 — Offline SOS (Queued): No network detected, saved to localStorage queue, service worker background sync sends when restored, success screen shows "SOS saved. Will send when connection restored." with emergency call still available via tel: link

### Gesture Handler — Pure Functions
All gesture logic lives in pure functions (no React, no side effects) for testability:
- detectSwipeDirection(startX, startY, endX, endY, ballSide): returns 'horizontal' or 'vertical' or 'invalid'
- isValidSOSTrigger(longPressActive, swipeDirection, swipeDistance): returns boolean
- calculateSnapPosition(currentX, currentY, viewportWidth, viewportHeight, safeArea): returns {x, y, side}

---

## SECTION 12: APP STRUCTURE — 4 Tabs + Floating SOS

### Layout Hierarchy

```
<ErrorBoundary>
  <SessionProvider>
    <ThemeProvider>
      <GradientMeshBackground />
      <SOSProvider>
        <Tabs>                    ← shadcn Tabs component
          <StatusBar />
          <TabsContent value="home">  <Home />  </TabsContent>
          <TabsContent value="map">   <Map />   </TabsContent>
          <TabsContent value="id">    <Identity /> </TabsContent>
          <TabsContent value="settings"> <Settings /> </TabsContent>
          <BottomNav />           ← 4 tabs, no center gap
        </Tabs>
        <SOSBall />               ← z-50, outside tab system, globally accessible
        <Toaster />               ← Toast notifications
      </SOSProvider>
    </ThemeProvider>
  </SessionProvider>
</ErrorBoundary>
```

### Bottom Navigation
Standard 4-tab layout: Home | Map | ID | Settings
No center gap (SOS is floating, not embedded in nav).
Each tab: flex-1, flex-col, centered icon (24px) + label (text-[10px] font-medium).
Active tab: text-primary, icon scales to 110%.
Inactive tab: text-muted-foreground.
Tab transition: 200ms color change.
Background: bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl, top border.
Height: auto with safe-area-bottom padding.

---

## SECTION 13: HOME PAGE — Safety Dashboard

Composition-only root file, maximum 40 lines, zero logic. All data fetching, state management, and effects live in custom hooks (use-dashboard, use-location-share). All rendering lives in sub-components.

### Layout (Top to Bottom)

#### 1. Offline Banner (Conditional)
Only shows when navigator.onLine is false.
Amber background, WifiOff icon, white text.
"You're offline — some features may be unavailable"
Slides in from top, fades out when connection restored.

#### 2. Header
Left: Avatar (48px, rounded-full, border-2 border-primary/20) with AvatarFallback showing first initial.
Left text: "Welcome back," (text-sm font-medium) then first name (text-lg font-semibold).
Right: Notification bell icon (Bell from Lucide, 24px).
Bell has red badge circle (-top-1 -right-1, h-5 w-5, rounded-full, bg-red-500) showing unread count.
Padding: p-4.

#### 3. Safety Score Hero Card (THE MOST IMPORTANT ELEMENT)
Glass Level 1. Full width minus 32px (16px padding each side). Minimum height 240px.

Contents from top to bottom inside card:

SVG Ring Progress:
- 160px diameter SVG centered
- Background ring: stroke on muted color, 12px stroke-width, 20% opacity
- Progress ring: stroke on var(--theme-primary), 12px stroke-width, round linecap
- Stroke-dasharray calculated from score percentage and circumference
- Ring starts from top (rotate -90deg)
- Inside the ring: large score number (text-4xl font-bold), smoothly morphing via requestAnimationFrame

"AI Safety Analysis" label: text-[10px] uppercase tracking-wider text-muted-foreground, centered below ring

Status Badge:
- Rounded-full, h-8, gap-2, text-sm font-semibold
- Score >= 80: bg-emerald-100 text-emerald-700 (dark: bg-emerald-900/40 text-emerald-300), green dot, "Low Risk"
- Score 50-79: bg-amber-100 text-amber-700 (dark: bg-amber-900/40), amber dot, "Moderate Risk"
- Score < 50: bg-red-100 text-red-700 (dark: bg-red-900/40), red dot, "High Risk"
- Dot: h-2 w-2 rounded-full in matching color

Progress Bar:
- Full width, h-2, rounded-full, bg-muted overflow-hidden
- Inner fill: bg-gradient-to-r from-primary to-primary/80, rounded-full, width as percentage
- Transition: width 1000ms ease-out
- Below bar: "{score}% Safe" right-aligned, text-xs text-muted-foreground

Factor Pills (horizontal scrollable badges):
- Container: relative div with fade edges (CSS mask-image or gradient overlays)
- Left fade: absolute inset-y-0 left-0 w-8 gradient from background to transparent
- Right fade: same on right side
- Inner: flex gap-2 overflow-x-auto snap-x snap-mandatory no-scrollbar py-2
- Each pill: flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border shrink-0 snap-start
- Pill contents: emoji (text-sm), factor name (text-xs font-medium), trend icon
- Trend icons: ArrowUp (emerald) for improving, ArrowDown (red) for worsening, ArrowRight (slate) for stable

Description text: "Based on real-time location, crowd density, time, and historical data" — text-xs text-muted-foreground text-center, 2-3 lines

#### 4. Quick Actions (2-column grid)
grid grid-cols-2 gap-3 px-4

Two buttons: "Share Location" and "View Map"
Each button: flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/30 border border-border
Icon container: h-12 w-12 rounded-xl bg-primary/10, icon h-6 w-6 text-primary
Label: text-sm font-medium
Active state: active:scale-97 transition-all
Share Location uses Web Share API (navigator.share) with fallback to clipboard copy
View Map switches active tab to map

#### 5. Emergency Contacts Strip (ALWAYS VISIBLE — NOT COLLAPSIBLE)
Section title: "Emergency Contacts" (text-sm font-semibold mb-3)

Horizontal scroll container with snap:
- flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar
- CSS mask-image edge fades on left and right (gradient to transparent)

5 contact cards:
- Police: number 100, blue icon container, Shield icon
- Ambulance: number 108, rose icon container, Cross icon
- Fire: number 101, orange icon container, Flame icon
- Women Helpline: number 181, purple icon container, Heart icon
- Tourist Helpline: number 1363, emerald icon container, Luggage icon

Each card:
- a tag with href="tel:{number}"
- flex flex-col items-center gap-2 p-4 min-w-[100px] rounded-2xl bg-muted/30 border border-border
- Icon container: h-12 w-12 rounded-xl, color varies per contact
- Name: text-xs font-medium text-center
- Number: text-[10px] text-muted-foreground
- Active state: active:scale-95 transition-all
- Haptic feedback on tap

#### 6. Alert List (Compact List Rows — NOT Cards)
Section title: "Recent Alerts" (text-sm font-semibold mb-3)
Maximum 3 visible. "View All" button opens shadcn Sheet