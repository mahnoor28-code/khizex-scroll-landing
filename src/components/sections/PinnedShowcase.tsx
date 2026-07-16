import React from "react";
import Phase4ProductScene from "../three/Phase4ProductScene";

/**
 * PLACEHOLDER for now. This is where the pinned 3D scroll experience
 * will live starting Phase 5 (scroll mapping) through Phase 7 (pinning).
 *
 * Phase 4: now rendering the real .glb model, still with OrbitControls
 * for manual testing — OrbitControls comes OUT in Phase 5 once scroll
 * takes over camera control.
 */
export default function PinnedShowcase(): React.ReactElement {
  return (
    <section className="pinned-showcase" aria-label="Product showcase">
      <div className="pinned-showcase__canvas-wrap">
        <Phase4ProductScene />
      </div>
    </section>
  );
}
