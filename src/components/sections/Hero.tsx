import React from "react";

/**
 * First thing the user sees. Deliberately simple, no scroll logic here —
 * this section just needs to load instantly (it affects LCP), so it
 * stays as plain HTML/CSS with zero animation-library dependency.
 */
export default function Hero(): React.ReactElement {
  return (
    <header className="hero">
      <p className="hero__eyebrow">KHIZEX</p>
      <h1 className="hero__title">Built to move with you.</h1>
      <p className="hero__subtitle">Scroll to see it in motion.</p>
    </header>
  );
}
