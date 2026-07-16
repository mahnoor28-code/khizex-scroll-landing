import React from "react";
import Phase3TestScene from "../three/Phase3TestScene";

/**
 * PLACEHOLDER for now. This is where the pinned 3D scroll experience
 * will live starting Phase 5 (scroll mapping) through Phase 7 (pinning).
 *
 * Phase 3 note: Phase3TestScene below is a TEMPORARY isolated test — it
 * gets swapped for the real .glb-driven scene in Phase 4.
 */
export default function PinnedShowcase(): React.ReactElement {
  return (
    <section className="pinned-showcase" aria-label="Product showcase">
      <div className="pinned-showcase__canvas-wrap">
        <Phase3TestScene />
      </div>
    </section>
  );
}
