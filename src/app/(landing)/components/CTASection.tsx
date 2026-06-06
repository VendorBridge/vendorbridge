"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setupMagneticButton } from "../animations/gsapAnimations";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = sectionRef.current;
      if (!scope) return;

      gsap.from(scope.querySelectorAll("[data-reveal]"), {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scope,
          start: "top 80%",
        },
      });

      scope.querySelectorAll("[data-magnetic]").forEach((btn) => {
        setupMagneticButton(btn as HTMLElement);
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-24 lg:px-16 lg:py-32"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#6C3FF5]/20 via-[#0A0A0A] to-[#FF9B6B]/10" />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.03]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2
          data-reveal
          className="font-[family-name:var(--font-jakarta)] text-[clamp(2.5rem,5vw,4rem)] font-bold leading-tight text-white"
        >
          Ready to transform procurement?
        </h2>
        <p data-reveal className="mx-auto mt-6 max-w-xl text-lg text-[#A0A0A0]">
          Join 500+ companies already using VendorBridge to streamline their
          supply chain operations.
        </p>

        <div
          data-reveal
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            data-magnetic
            className="rounded-full bg-[#6C3FF5] px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#5a32d4]"
          >
            Start free trial
          </Link>
          <Link
            href="/login"
            data-magnetic
            className="rounded-full border border-white/15 px-8 py-4 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/5"
          >
            Talk to sales
          </Link>
        </div>
      </div>
    </section>
  );
}
