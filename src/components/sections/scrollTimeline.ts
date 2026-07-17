/**
 * Central, typed scroll choreography config.
 *
 * Every "at X% scroll, the model should look like Y" decision lives
 * HERE, not scattered as magic numbers inside components. If a reviewer
 * or teammate wants to know how scroll maps to animation, this file is
 * the answer.
 */

export interface ScrollKeyframe {
  /** 0 = section start, 1 = section end */
  progress: number;
  /** Model rotation around the Y axis, in radians */
  rotationY: number;
  /** Camera distance from the model along Z */
  cameraZ: number;
}

export const PRODUCT_SCROLL_TIMELINE: readonly ScrollKeyframe[] = [
  { progress: 0, rotationY: 0, cameraZ: 3.2 },
  { progress: 0.5, rotationY: Math.PI, cameraZ: 2.2 },
  { progress: 1, rotationY: Math.PI * 2, cameraZ: 3.2 }
];

/**
 * Linear interpolation between two numbers. "lerp" = "linear
 * interpolation" — given a start value, an end value, and a fraction (t)
 * between 0 and 1, it returns the point that fraction of the way
 * between them. This is THE core building block of smooth animation.
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Given a scroll progress (0-1), find which two keyframes it falls
 * between and interpolate the model's rotation/camera state. This is
 * what makes fast scrolling look smooth instead of snapping between
 * keyframes — we always compute an in-between value, never jump straight
 * to a keyframe's exact number.
 */
export function getAnimationStateAt(progress: number): { rotationY: number; cameraZ: number } {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const timeline = PRODUCT_SCROLL_TIMELINE;

  for (let i = 0; i < timeline.length - 1; i += 1) {
    const current = timeline[i];
    const next = timeline[i + 1];
    if (clamped >= current.progress && clamped <= next.progress) {
      const segmentT = (clamped - current.progress) / (next.progress - current.progress);
      return {
        rotationY: lerp(current.rotationY, next.rotationY, segmentT),
        cameraZ: lerp(current.cameraZ, next.cameraZ, segmentT)
      };
    }
  }

  const last = timeline[timeline.length - 1];
  return { rotationY: last.rotationY, cameraZ: last.cameraZ };
}
