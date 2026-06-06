"use client";

import { useLenis } from "./hooks/useLenis";
import { ProgressBar } from "./components/ProgressBar";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ProblemSolution } from "./components/ProblemSolution";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { HowItWorks } from "./components/HowItWorks";
import { Testimonials } from "./components/Testimonials";
import { StatsCounter } from "./components/StatsCounter";
import { Integrations } from "./components/Integrations";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";

export default function LandingPage() {
  useLenis();

  return (
    <>
      <ProgressBar />
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <FeaturesGrid />
        <HowItWorks />
        <Testimonials />
        <StatsCounter />
        <Integrations />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
