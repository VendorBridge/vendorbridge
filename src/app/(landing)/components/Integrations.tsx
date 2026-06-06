"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setupSectionReveal } from "../animations/scrollAnimations";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LOGOS = [
  "SAP",
  "Oracle",
  "QuickBooks",
  "Slack",
  "Teams",
  "Google Workspace",
  "Salesforce",
  "AWS",
];

function LogoMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;

      const items = track.children;
      const totalWidth = Array.from(items).reduce(
        (sum, el) => sum + (el as HTMLElement).offsetWidth + 48,
        0
      );

      gsap.to(track, {
        x: -totalWidth / 2,
        duration: 30,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: trackRef }
  );

  const doubled = [...LOGOS, ...LOGOS];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[#0A0A0A] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[#0A0A0A] to-transparent" />

      <div ref={trackRef} className="flex w-max gap-12 px-6">
        {doubled.map((logo, i) => (
          <div
            key={`${logo}-${i}`}
            className="group flex h-16 w-40 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-[#1A1A1A] transition-all duration-300 hover:border-[#6C3FF5]/40 hover:bg-[#6C3FF5]/5"
          >
            <span className="font-[family-name:var(--font-jakarta)] text-sm font-bold text-[#A0A0A0] transition-colors group-hover:text-white">
              {logo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Integrations() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = sectionRef.current;
      if (!scope) return;
      setupSectionReveal(scope);
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="integrations"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0A0A0A] px-6 py-24 lg:px-16 lg:py-32"
    >
      {/* Connection lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
        aria-hidden
      >
        <line x1="10%" y1="30%" x2="90%" y2="50%" stroke="#6C3FF5" strokeWidth="1" />
        <line x1="20%" y1="70%" x2="80%" y2="40%" stroke="#FF9B6B" strokeWidth="1" />
        <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="#E8D754" strokeWidth="1" />
      </svg>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p
            data-reveal
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FF9B6B]"
          >
            Integrations
          </p>
          <h2
            data-reveal
            className="mt-4 font-[family-name:var(--font-jakarta)] text-[clamp(2rem,4vw,3rem)] font-bold text-white"
          >
            Works with your stack
          </h2>
          <p data-reveal className="mx-auto mt-4 max-w-lg text-[#A0A0A0]">
            Connect VendorBridge to your existing ERP, accounting, and collaboration tools.
          </p>
        </div>

        <div data-reveal>
          <LogoMarquee />
        </div>
      </div>
    </section>
  );
}
