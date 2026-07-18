import React, { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { NARRATIVE_REVEALS, getRevealOpacity } from "../../config/narrativeReveals";
import type { ScrollProgressStore } from "../../hooks/useScrollProgress";

interface NarrativeTextProps {
  progressRef: RefObject<ScrollProgressStore>;
}

/**
 * This sits OUTSIDE the <Canvas> (it's regular DOM, not WebGL), so it
 * can't use useFrame like the 3D scene does. Instead it runs its own
 * requestAnimationFrame loop reading the same progressRef, and writes
 * opacity directly to each paragraph's style — skipping React state/
 * re-renders for the same reason the 3D scene does (this updates far
 * too often, dozens of times a second, to route through setState).
 *
 * Accessibility: every line is always present in the DOM. Only
 * `opacity` changes — never `display` or `visibility` — so screen
 * readers can still discover and read this text regardless of its
 * current visual fade state (spec requirement 3.6).
 */
export default function NarrativeText({ progressRef }: NarrativeTextProps): React.ReactElement {
  const elementRefs = useRef<Map<string, HTMLParagraphElement>>(new Map());

  useEffect(() => {
    let frameId: number;

    const tick = (): void => {
      const progress = progressRef.current?.progress ?? 0;

      for (const reveal of NARRATIVE_REVEALS) {
        const el = elementRefs.current.get(reveal.id);
        if (el) {
          const opacity = getRevealOpacity(progress, reveal);
          el.style.opacity = String(opacity);
          el.style.transform = `translateY(${(1 - opacity) * 16}px)`;
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [progressRef]);

  return (
    <div className="narrative-text">
      {NARRATIVE_REVEALS.map((reveal) => (
        <p
          key={reveal.id}
          ref={(node) => {
            if (node) elementRefs.current.set(reveal.id, node);
            else elementRefs.current.delete(reveal.id);
          }}
          className="narrative-text__line"
        >
          {reveal.text}
        </p>
      ))}
    </div>
  );
}
