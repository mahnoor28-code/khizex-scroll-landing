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

export default function Features(): React.ReactElement {
  return (
    <section
      className="features"
      aria-label="Product features"
      id="features"
      tabIndex={-1}
    >
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
