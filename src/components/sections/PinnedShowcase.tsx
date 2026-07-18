import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import NarrativeText from "./NarrativeText";

// Lazy-loaded: the Three.js/R3F/GSAP-scene bundle only downloads once
// this section is actually needed, never blocking the Hero's initial
// paint (LCP). See the production build output — Phase9ProductScene
// ships as its own separate chunk from the main bundle.
const Phase9ProductScene = lazy(() => import("../three/Phase9ProductScene"));

/**
 * Phase 9: performance pass.
 *  - The 3D scene component itself is lazy-loaded (see import above).
 *  - It isn't even MOUNTED until this section first scrolls into view
 *    (via IntersectionObserver) — so scrolling past it on a fast flick
 *    never triggers the model download at all.
 *  - Once mounted, `isVisible` toggles the render loop on/off (passed
 *    as `active` to Phase9ProductScene) so a canvas that's scrolled
 *    fully out of view stops rendering frames entirely.
 */
export default function PinnedShowcase(): React.ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const progressRef = useScrollProgress(sectionRef as React.RefObject<HTMLElement>, {
    pin: true,
    pinDurationVh: 200
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) setHasBeenVisible(true);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="pinned-showcase"
      aria-label="Product showcase"
      ref={sectionRef as React.RefObject<HTMLElement>}
    >
      <div className="pinned-showcase__canvas-wrap">
        {hasBeenVisible ? (
          <Suspense fallback={<div className="pinned-showcase__loading">Loading experience…</div>}>
            <Phase9ProductScene progressRef={progressRef} active={isVisible} />
          </Suspense>
        ) : null}
      </div>
      <NarrativeText progressRef={progressRef} />
    </section>
  );
}
