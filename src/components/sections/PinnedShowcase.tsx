import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { useReducedExperience } from "../../hooks/useReducedExperience";
import NarrativeText from "./NarrativeText";
import StaticShowcase from "./StaticShowcase";

// Lazy-loaded: the Three.js/R3F/GSAP-scene bundle only downloads once
// this section is actually needed, never blocking the Hero's initial
// paint (LCP). See the production build output — Phase11ProductScene
// ships as its own separate chunk from the main bundle.
const Phase11ProductScene = lazy(() => import("../three/Phase11ProductScene"));

/**
 * Phase 12: this component now has two completely separate render
 * paths. `useReducedExperience()` is checked FIRST, before any
 * ScrollTrigger/pin/Canvas setup even happens — a no-WebGL or
 * reduced-motion visitor never triggers the 3D bundle download, never
 * gets a pinned section, never runs GSAP scrub logic. They get
 * <StaticShowcase>, plain and simple.
 */
export default function PinnedShowcase(): React.ReactElement {
  const reducedExperience = useReducedExperience();

  if (reducedExperience) {
    return <StaticShowcase />;
  }

  return <FullScrollExperience />;
}

function FullScrollExperience(): React.ReactElement {
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
