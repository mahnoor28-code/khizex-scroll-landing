import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import NarrativeText from "./NarrativeText";

// Lazy-loaded: the Three.js/R3F/GSAP-scene bundle only downloads once
// this section is actually needed, never blocking the Hero's initial
// paint (LCP). See the production build output — Phase11ProductScene
// ships as its own separate chunk from the main bundle.
const Phase11ProductScene = lazy(() => import("../three/Phase11ProductScene"));

/**
 * Phase 11: responsive pass.
 *  - Smaller screens get a shorter pin duration (150vh vs 200vh) — the
 *    same animation, just less scroll distance required to complete it,
 *    since mobile users typically scroll in shorter, faster gestures.
 *  - Touch scroll and window resize both already work correctly here
 *    without extra code: Lenis leaves touch input native (see
 *    useLenis.ts), and ScrollTrigger's `invalidateOnRefresh: true`
 *    (set in useScrollProgress.ts, Phase 7) recalculates pin boundaries
 *    automatically whenever the window resizes or the device rotates.
 */
export default function PinnedShowcase(): React.ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const progressRef = useScrollProgress(sectionRef as React.RefObject<HTMLElement>, {
    pin: true,
    pinDurationVh: window.innerWidth < 768 ? 150 : 200
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
            <Phase11ProductScene progressRef={progressRef} active={isVisible} />
          </Suspense>
        ) : null}
      </div>
      <NarrativeText progressRef={progressRef} />
    </section>
  );
}
