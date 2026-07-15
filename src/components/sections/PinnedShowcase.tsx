import React from "react";

/**
 * PLACEHOLDER for now. This is where the pinned 3D scroll experience
 * will live starting Phase 5 (scroll mapping) through Phase 7 (pinning).
 * For Phase 2, it's just a full-viewport section so the page's overall
 * rhythm (Hero -> big section -> Features -> Ending) is visible and
 * testable before any animation complexity gets added on top.
 */
export default function PinnedShowcase(): React.ReactElement {
  return (
    <section className="pinned-showcase" aria-label="Product showcase">
      <div className="pinned-showcase__placeholder">
        <p>3D scroll experience goes here (Phase 5+)</p>
      </div>
    </section>
  );
}
