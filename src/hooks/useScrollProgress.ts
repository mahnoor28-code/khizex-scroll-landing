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

/**
 * Wires a GSAP ScrollTrigger to `triggerRef`'s DOM element: as the user
 * scrolls through that element, `.progress` goes from 0 (element just
 * entering) to 1 (element fully scrolled past). `scrub: 1` means the
 * animation follows the scrollbar with a small (1 second) catch-up
 * smoothing, rather than snapping instantly to the raw scroll value.
 */
export function useScrollProgress(triggerRef: RefObject<HTMLElement>): RefObject<ScrollProgressStore> {
  const store = useRef<ScrollProgressStore>({ progress: 0 });

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        store.current.progress = self.progress;
      }
    });

    return () => {
      trigger.kill();
    };
  }, [triggerRef]);

  return store;
}
