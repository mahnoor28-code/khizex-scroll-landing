/**
 * Narrative text reveals, synced to the SAME scroll progress (0→1) that
 * drives the 3D model in scrollTimeline.ts. Each line fades in just
 * before its `revealAt` point and fades out just before `hideAt` —
 * tied to animation progress, not viewport visibility.
 */

export interface NarrativeReveal {
  id: string;
  text: string;
  /** Progress (0–1) at which this line is fully visible */
  revealAt: number;
  /** Progress (0–1) at which this line starts fading back out */
  hideAt: number;
}

export const NARRATIVE_REVEALS: readonly NarrativeReveal[] = [
  { id: "line-1", text: "Precision, reimagined.", revealAt: 0.12, hideAt: 0.3 },
  { id: "line-2", text: "Every angle, considered.", revealAt: 0.42, hideAt: 0.62 },
  { id: "line-3", text: "Built to move with you.", revealAt: 0.78, hideAt: 1 }
];

const FADE_WIDTH = 0.08;

/**
 * Returns 0–1 opacity for a given reveal at the current scroll progress:
 * ramps up to 1 over FADE_WIDTH before `revealAt`, holds at 1, then
 * ramps back down to 0 over FADE_WIDTH before `hideAt`.
 */
export function getRevealOpacity(progress: number, reveal: NarrativeReveal): number {
  const fadeInStart = reveal.revealAt - FADE_WIDTH;
  const fadeOutStart = reveal.hideAt - FADE_WIDTH;

  if (progress < fadeInStart) return 0;
  if (progress < reveal.revealAt) {
    return (progress - fadeInStart) / FADE_WIDTH;
  }
  if (progress < fadeOutStart) return 1;
  if (progress < reveal.hideAt) {
    return 1 - (progress - fadeOutStart) / FADE_WIDTH;
  }
  return 0;
}
