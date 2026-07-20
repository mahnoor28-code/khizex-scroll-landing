import React from "react";
import Hero from "./components/sections/Hero";
import PinnedShowcase from "./components/sections/PinnedShowcase";
import Features from "./components/sections/Features";
import Ending from "./components/sections/Ending";
import SkipLink from "./components/sections/SkipLink";
import { useLenis } from "./hooks/useLenis";

export default function App(): React.ReactElement {
  useLenis();

  return (
    <main>
      <SkipLink />
      <Hero />
      <PinnedShowcase />
      <Features />
      <Ending />
    </main>
  );
}
