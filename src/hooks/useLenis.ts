import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Mounted ONCE at the App level (not per-section) — Lenis takes over
 * scroll for the whole page, not just the pinned showcase.
 *
 * Why Lenis, and what it changes (documented here for the README):
 * Native wheel/touch scroll is fine for reading a page, but feels
 * mechanical for a choreographed 3D experience — each wheel "click"
 * jumps a fixed pixel amount rather than easing smoothly. Lenis
 * intercepts scroll input and maintains its own virtual scroll
 * position, interpolating toward the target instead of snapping to it.
 *
 * The tradeoff: Lenis's virtual position means GSAP's ScrollTrigger
 * (which normally listens to the browser's native `scroll` event) has
 * to be told to re-check itself every time LENIS reports movement,
 * via `lenis.on("scroll", ScrollTrigger.update)`. Skipping this line
 * would silently desync pinning/scrubbing from what's visually
 * scrolling — this is the "changes how scroll events fire" tradeoff
 * the assignment spec calls out.
 *
 * `gsap.ticker` (not `requestAnimationFrame` directly) drives Lenis's
 * own update loop so both systems share one render clock instead of
 * two competing rAF loops.
 */
export function useLenis(): void {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1 // subtle easing — too high a value reads as "laggy", not "smooth"
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number): void => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);
}
