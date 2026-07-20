import React from "react";
import { NARRATIVE_REVEALS } from "../../config/narrativeReveals";

/**
 * The "reduced" path: no Canvas, no WebGL, no pinning, no scroll-tied
 * animation — just a static image and the same narrative copy shown
 * plainly. This section behaves like ordinary content: it scrolls
 * normally, all text is immediately visible and readable, nothing is
 * gated behind JS running or motion playing.
 */
export default function StaticShowcase(): React.ReactElement {
  return (
    <section className="static-showcase" aria-label="Product showcase (static)">
      <img
        src="/images/product-fallback.svg"
        alt="Product preview"
        className="static-showcase__image"
      />
      <div className="static-showcase__text">
        {NARRATIVE_REVEALS.map((reveal) => (
          <p key={reveal.id}>{reveal.text}</p>
        ))}
      </div>
    </section>
  );
}
