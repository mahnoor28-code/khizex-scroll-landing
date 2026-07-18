import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * A plain mutable object, NOT React state. GSAP writes to `.progress`
 * on every scroll tick; the 3D scene reads it inside useFrame (which
 * already runs every render frame regardless). This deliberately skips
 * React's render cycle for a value that changes dozens of times a
 * second — using setState here would re-render the whole component
 * tree on every scroll pixel, which is exactly the kind of main-thread
 * jank the assignment's performance section warns against.
 */
export interface ScrollProgressStore {
  progress: number;
}

export interface UseScrollProgressOptions {
  /** When true, the section stays fixed on screen while its animation scrubs */
  pin?: boolean;
  /**
   * How much extra scroll distance (in viewport-heights) the pinned
   * animation gets to play out over. Ignored when pin is false.
   */
  pinDurationVh?: number;
}

/**
 * Wires a GSAP ScrollTrigger to `triggerRef`'s DOM element: as the user
 * scrolls through that element, `.progress` goes from 0 (element just
 * entering) to 1 (element fully scrolled past). `scrub: 1` means the
 * animation follows the scrollbar with a small (1 second) catch-up
 * smoothing, rather than snapping instantly to the raw scroll value.
 *
 * Phase 7: `pin: true` keeps the section fixed full-viewport while the
 * user scrolls through it — the page only resumes normal scrolling once
 * `end` is reached. `end` is a FUNCTION here (not a fixed number) so
 * that on window resize, ScrollTrigger recalculates it against the
 * current `window.innerHeight` rather than a stale pixel value from
 * whatever size the window was at page load (spec requirement 3.4).
 */
export function useScrollProgress(
  triggerRef: RefObject<HTMLElement>,
  options: UseScrollProgressOptions = {}
): RefObject<ScrollProgressStore> {
  const store = useRef<ScrollProgressStore>({ progress: 0 });
  const { pin = false, pinDurationVh = 200 } = options;

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: pin ? () => `+=${(window.innerHeight * pinDurationVh) / 100}` : "bottom top",
      pin,
      pinSpacing: pin,
      anticipatePin: pin ? 1 : 0,
      // Recompute `end` (and pin boundaries) whenever ScrollTrigger
      // refreshes, which it already does automatically on window resize.
      invalidateOnRefresh: true,
      scrub: 1,
      onUpdate: (self) => {
        store.current.progress = self.progress;
      }
    });

    return () => {
      trigger.kill();
    };
  }, [triggerRef, pin, pinDurationVh]);

  return store;
}
