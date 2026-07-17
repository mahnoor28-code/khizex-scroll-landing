import React, { useRef } from "react";
import Phase6ProductScene from "../three/Phase6ProductScene";
import { useScrollProgress } from "../../hooks/useScrollProgress";

/**
 * Phase 6: model now animates rotation + vertical position + camera
 * distance together, across 4 keyframes instead of 2 — see
 * src/config/scrollTimeline.ts for the full sequence.
 */
export default function PinnedShowcase(): React.ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useScrollProgress(sectionRef as React.RefObject<HTMLElement>);

  return (
    <section
      className="pinned-showcase"
      aria-label="Product showcase"
      ref={sectionRef as React.RefObject<HTMLElement>}
    >
      <div className="pinned-showcase__canvas-wrap">
        <Phase6ProductScene progressRef={progressRef} />
      </div>
    </section>
  );
}
