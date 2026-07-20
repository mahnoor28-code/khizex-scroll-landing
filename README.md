# KHIZEX — 3D Scroll-Driven Landing Page

An Apple-style product page where a real 3D model rotates, lifts, and
reframes in lockstep with scroll position — built around one section
that pins in place while its animation scrubs, then releases back into
normal scroll.

## Stack

- React 18 + strict TypeScript, built with Vite
- **3D:** Three.js via `@react-three/fiber` + `@react-three/drei`
- **Scroll choreography:** GSAP + ScrollTrigger (chosen over Framer
  Motion — see below)
- **Smooth scroll:** Lenis, synced into the same GSAP ticker
- Zero `any` anywhere in the codebase (verified via `npx tsc -b --force`
  against a `strict: true` tsconfig)

## Running it

```bash
npm install
npm run dev
```

```bash
npm run build   # typecheck (tsc -b) + production bundle
```

## Why GSAP + ScrollTrigger over Framer Motion

The spec allows either, but requires picking one and using it
consistently. GSAP won here because:

- **Pinning is first-class.** `pin: true` on a `ScrollTrigger` handles
  the "section locks in place while its internal animation plays"
  behavior directly. Framer Motion has no equivalent primitive — you'd
  hand-roll it with `position: sticky` and manual scroll math, which is
  exactly the kind of scattered, ad-hoc logic the spec is trying to
  avoid.
- **`scrub` ties animation state directly to scroll position**, which
  is what makes reverse-scrubbing (scrolling back up plays the
  animation backward, exactly) work for free — there's no separate
  "reverse" code path to write or get wrong.
- Resize handling (`invalidateOnRefresh: true`) and pin-boundary
  recalculation are built in.

## Why Lenis, and what it changes

Native wheel scroll is mechanical — each wheel "click" jumps a fixed
pixel amount rather than easing. Lenis intercepts scroll input and
maintains its own virtual scroll position, interpolating toward the
target instead of snapping to it.

**This does change how scroll events fire**, which the spec explicitly
asks projects to call out: once Lenis is active, GSAP's `ScrollTrigger`
has to be told to re-check itself every time *Lenis* reports movement
(`lenis.on("scroll", ScrollTrigger.update)`), rather than relying
purely on the browser's native `scroll` event. Skipping that line would
silently desync the pinned animation from what's visually on screen.
Touch input is deliberately left un-smoothed by Lenis (its default
behavior) — phones already have good native momentum scroll, and
layering extra easing on top of that reads as laggy rather than smooth.
See `src/hooks/useLenis.ts` for the full implementation and reasoning.

## Architecture

```
User scrolls
     ↓
Lenis smooths the raw wheel/touch delta into eased motion
     ↓
Native `scroll` event fires → lenis.on("scroll") → ScrollTrigger.update()
     ↓
ScrollTrigger (pinned to the showcase section) computes progress: 0 → 1
     ↓
useScrollProgress hook stores that number in a ref (NOT React state —
this updates dozens of times/sec, far too often to route through
setState without janking the render loop)
     ↓
Every R3F frame (useFrame) reads that ref and calls
getAnimationStateAt(progress) from the typed scrollTimeline config
     ↓
Model rotation, model position, and camera distance are all set
directly on the Three.js objects — no re-render involved
```

### Typed scroll-to-animation config (`src/config/scrollTimeline.ts`)

Every "at X% scroll, the model should look like Y" decision lives in
ONE typed array of keyframes — nothing is a magic number scattered
inside a component:

```ts
export const PRODUCT_SCROLL_TIMELINE: readonly ScrollKeyframe[] = [
  { progress: 0,    rotationY: 0,             positionY: 0,    cameraZ: 3.2 },
  { progress: 0.33, rotationY: Math.PI * 0.5, positionY: 0.3,  cameraZ: 2.6 },
  { progress: 0.66, rotationY: Math.PI * 1.5, positionY: -0.2, cameraZ: 2.2 },
  { progress: 1,    rotationY: Math.PI * 2,   positionY: 0,    cameraZ: 3.2 }
];
```

`getAnimationStateAt(progress)` linearly interpolates ("lerps") between
whichever two keyframes bracket the current scroll progress — this is
what makes the motion smooth and continuous rather than snapping
between fixed poses, and what makes it scrub correctly in *either*
scroll direction (the same math runs whether progress is increasing or
decreasing).

Narrative text reveals are configured the same way, separately, in
`src/config/narrativeReveals.ts` — each line has a `revealAt`/`hideAt`
progress window and fades via `opacity` only (never `display` or
`visibility`), so screen readers can still discover the text regardless
of its current visual fade state.

### Performance strategy

- **Lazy loading:** the entire Three.js/R3F/GSAP scene component is
  behind `React.lazy()`, and isn't even *mounted* until the showcase
  section first scrolls into view (`IntersectionObserver`). The
  production build confirms the split — the 3D scene ships as its own
  ~936KB chunk, completely separate from the ~283KB main bundle, so it
  never blocks the Hero's initial paint.
- **Render-loop pause:** once mounted, the same `IntersectionObserver`
  toggles the Canvas's `frameloop` between `"always"` and `"never"` —
  scrolled-past content stops rendering frames entirely instead of
  quietly burning GPU/battery off-screen.
- **Profiled during scroll:** captured via Chrome DevTools' Performance
  panel while scrolling fast through the pinned section — Scripting
  time stayed at ~9% of the recorded range, with no long tasks blocking
  the main thread. See `docs/demo-screenshots/02-performance-profile.png`.

### Fallback strategy

`useReducedExperience()` (`src/hooks/useReducedExperience.ts`) combines
three independent signals into one decision, checked *before* any
ScrollTrigger/pin/Canvas setup happens:

1. **No WebGL support** — feature-detected directly.
2. **`prefers-reduced-motion: reduce`** — an explicit OS-level
   accessibility choice. This always wins regardless of device
   capability; it's a preference, not a performance guess. Also
   listened to live, in case the user changes it without reloading.
3. **`navigator.deviceMemory < 4`** (where the browser exposes it) — a
   rough proxy for "this device will likely struggle with a live WebGL
   scene."

When any signal trips, `PinnedShowcase` renders `<StaticShowcase>`
instead — a plain image plus the same narrative copy, always visible,
no pinning, no scroll-scrubbed motion, no 3D bundle ever downloaded.

### Accessibility

- Every narrative text line is always present in the DOM; only
  `opacity`/`transform` are animated, never `display`/`visibility`.
- A skip link (`src/components/sections/SkipLink.tsx`), visually hidden
  until focused, lets keyboard and screen-reader users jump straight
  past the ~200–300vh pinned section to the rest of the page.
- Keyboard scrolling (`Space`, `Page Down`, arrow keys) drives the same
  choreography as mouse/trackpad scroll — GSAP's `ScrollTrigger` reads
  actual scroll position regardless of what caused it to change, so
  there's no separate "keyboard path" to maintain.
- Explicit, high-contrast `:focus-visible` outlines on every
  keyboard-reachable control.

## Project layout

```
src/
  config/
    scrollTimeline.ts     typed model rotation/position/camera keyframes
    narrativeReveals.ts   typed text-reveal progress windows
  hooks/
    useScrollProgress.ts  wires a section to a GSAP ScrollTrigger (+pin)
    useLenis.ts            smooth-scroll setup, synced with ScrollTrigger
    useReducedExperience.ts combines WebGL/motion-pref/memory signals
  components/
    three/
      Phase11ProductScene.tsx   the R3F canvas: model + scroll-driven rig
    sections/
      Hero.tsx, Features.tsx, Ending.tsx
      PinnedShowcase.tsx    branches to full 3D or StaticShowcase
      NarrativeText.tsx     per-frame opacity-driven text overlay
      StaticShowcase.tsx    no-WebGL / reduced-motion / low-memory path
      SkipLink.tsx
```

## Testing the offline scenarios by hand

- **Forward/reverse scrub:** scroll down through the pinned section,
  then scroll back up — the model's rotation/position should visibly
  reverse, not just replay from the start.
- **Fast scroll:** flick-scroll quickly through the pinned section and
  confirm the model doesn't jump straight to an end pose or flicker.
- **Resize:** resize the browser window while inside the pinned
  section — the pin boundaries recalculate rather than breaking.
- **Reduced motion:** Chrome DevTools → `Ctrl+Shift+P` → "Show
  Rendering" → emulate `prefers-reduced-motion: reduce` → refresh →
  `<StaticShowcase>` should render instead of the 3D experience.
- **Keyboard only:** `Tab` to reveal the skip link; separately, use
  `Page Down`/arrow keys to scroll through the pinned section and
  confirm the same choreography plays.
