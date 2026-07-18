import React, { useRef } from "react";
import Phase6ProductScene from "../three/Phase6ProductScene";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import NarrativeText from "./NarrativeText";

/**
 * Phase 8: narrative text now overlays the 3D canvas, fading in/out at
 * specific scroll-progress points (see src/config/narrativeReveals.ts) —
 * not just "appears when scrolled into view."
 */
export default function PinnedShowcase(): React.ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useScrollProgress(sectionRef as React.RefObject<HTMLElement>, {
    pin: true,
    pinDurationVh: 200
  });

  return (
    <section
      className="pinned-showcase"
      aria-label="Product showcase"
      ref={sectionRef as React.RefObject<HTMLElement>}
    >
      <div className="pinned-showcase__canvas-wrap">
        <Phase6ProductScene progressRef={progressRef} />
      </div>
      <NarrativeText progressRef={progressRef} />
    </section>
  );
}
