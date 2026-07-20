import { useEffect, useState } from "react";

function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

function isLowMemoryDevice(): boolean {
  const nav = navigator as NavigatorWithMemory;
  return typeof nav.deviceMemory === "number" && nav.deviceMemory < 4;
}

/**
 * The single decision point for "show the full scroll-scrubbed 3D
 * experience, or the simpler static fallback" — three independent
 * signals feed into one boolean (spec 3.5 / 3.6):
 *
 *  1. No WebGL support at all (old browsers, some locked-down/headless
 *     environments) — the 3D scene literally cannot render.
 *  2. `prefers-reduced-motion: reduce` — an explicit OS-level
 *     accessibility choice. This ALWAYS wins regardless of how capable
 *     the device is; it's a preference, not a performance guess.
 *  3. `navigator.deviceMemory` (Chromium-only; undefined elsewhere)
 *     reporting under 4GB — a rough proxy for "this device will
 *     likely struggle with a live WebGL scene."
 *
 * Every consumer of this hook (PinnedShowcase) branches on ONE boolean
 * rather than re-checking these signals itself.
 */
export function useReducedExperience(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    const webglSupported = detectWebGLSupport();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !webglSupported || prefersReducedMotion || isLowMemoryDevice();
  });

  useEffect(() => {
    // prefers-reduced-motion can change live if the user flips the OS
    // setting without reloading the page — listen for that specifically.
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent): void => {
      if (event.matches) {
        setReduced(true);
        return;
      }
      // Motion preference turned off — re-check the OTHER two signals
      // in case one of them is still a reason to stay reduced.
      setReduced(!detectWebGLSupport() || isLowMemoryDevice());
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}
