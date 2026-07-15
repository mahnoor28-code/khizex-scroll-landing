import React from "react";

interface Feature {
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  { title: "Lightweight", description: "Engineered foam that barely feels there." },
  { title: "Breathable", description: "Mesh upper built for long days on your feet." },
  { title: "Durable", description: "Reinforced sole tested well past its limits." }
];

/**
 * Standard scroll-into-view section — no scroll-scrubbed animation
 * needed here per spec, just needs to be reachable and readable
 * normally (keyboard, screen reader, no JS required to see the content).
 */
export default function Features(): React.ReactElement {
  return (
    <section className="features" aria-label="Product features">
      <h2 className="features__title">Why it holds up</h2>
      <ul className="features__list">
        {FEATURES.map((feature) => (
          <li key={feature.title} className="features__item">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
