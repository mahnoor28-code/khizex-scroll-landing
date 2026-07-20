import React from "react";

/**
 * Visually hidden until focused (classic accessibility pattern) — a
 * keyboard user tabbing through the page will land on this BEFORE the
 * 300vh-tall pinned showcase, and can jump straight past it to Features
 * instead of being forced through the whole scroll sequence to reach
 * the rest of the page's content.
 */
export default function SkipLink(): React.ReactElement {
  return (
    <a href="#features" className="skip-link">
      Skip 3D showcase
    </a>
  );
}
