"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setupCountUp } from "../animations/scrollAnimations";
import { LANDING_IMAGES } from "../lib/images";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STATS = [
  { value: 500, suffix: "+", label: "Vendors managed" },
  { value: 10000, suffix: "+", label: "RFQs processed" },
  { value: 99.9, suffix: "%", label: "Uptime", decimals: 1 },
  { value: 40, suffix: "+", label: "Countries" },
];

export function StatsCounter() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = sectionRef.current;
      if (!scope) return;

      scope.querySelectorAll("[data-count]").forEach((el, i) => {
        const stat = STATS[i];
        if (!stat) return;
        setupCountUp(el, stat.value, stat.suffix, stat.decimals ?? 0);
      });

      gsap.from(scope.querySelectorAll(".stat-card"), {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scope,
          start: "top 75%",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-32"
    >
      <div className="absolute inset-0">
        <Image
          src={LANDING_IMAGES.supplyChain}
          alt="Global supply chain"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/90 via-[#0A0A0A]/80 to-[#0A0A0A]/90" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#FF9B6B]">
          By the Numbers
        </p>
        <h2 className="mt-4 text-center font-[family-name:var(--font-jakarta)] text-[clamp(2rem,4vw,3rem)] font-bold text-white">
          Trusted at scale
        </h2>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="stat-card rounded-2xl border border-white/10 bg-[#1A1A1A]/60 p-8 text-center backdrop-blur-sm"
            >
              <p
                data-count
                className="font-[family-name:var(--font-space)] text-[clamp(2.5rem,5vw,4rem)] font-bold text-white"
              >
                0{stat.suffix}
              </p>
              <p className="mt-2 text-sm text-[#A0A0A0]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
