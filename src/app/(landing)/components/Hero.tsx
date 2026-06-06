"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Play, FileText, Users, TrendingUp } from "lucide-react";
import {
  animateHeroHeadline,
  animateFloating,
  animateScaleIn,
  setupMagneticButton,
} from "../animations/gsapAnimations";
import { useMouseParallax } from "../hooks/useMouseParallax";
import { LANDING_IMAGES } from "../lib/images";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FLOATING_CARDS = [
  { icon: FileText, label: "RFQ Created", value: "847", color: "#6C3FF5" },
  { icon: Users, label: "Active Vendors", value: "124", color: "#FF9B6B" },
  { icon: TrendingUp, label: "Savings", value: "32%", color: "#E8D754" },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useMouseParallax(imageRef, { intensity: 15 });

  useGSAP(
    () => {
      const scope = sectionRef.current;
      if (!scope) return;

      animateHeroHeadline(".hero-headline", scope);
      animateScaleIn(scope.querySelector(".hero-image"), { delay: 0.2 });
      animateFloating(scope.querySelectorAll(".floating-card"));

      const parallaxImg = scope.querySelector(".parallax-image");
      if (parallaxImg) {
        gsap.to(parallaxImg, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      scope.querySelectorAll("[data-magnetic]").forEach((btn) => {
        setupMagneticButton(btn as HTMLElement);
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-[#0A0A0A]"
    >
      <div className="noise-overlay pointer-events-none absolute inset-0 z-10 opacity-[0.03]" />

      <div className="relative z-20 grid min-h-screen lg:grid-cols-2">
        {/* Left content */}
        <div className="flex flex-col justify-center px-6 pb-24 pt-32 lg:px-12 lg:pb-0 lg:pl-16 xl:pl-24">
          <p
            data-reveal
            className="mb-6 font-[family-name:var(--font-jakarta)] text-xs font-semibold uppercase tracking-[0.25em] text-[#FF9B6B]"
          >
            Enterprise Procurement Platform
          </p>

          <h1
            ref={headlineRef}
            className="hero-headline font-[family-name:var(--font-jakarta)] text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-white"
          >
            Procurement shouldn&apos;t be painful.
          </h1>

          <p
            data-reveal
            className="mt-6 max-w-lg text-lg leading-relaxed text-[#A0A0A0]"
          >
            VendorBridge digitizes the entire supply chain — from RFQ to
            invoice — so your team can focus on strategy, not spreadsheets.
          </p>

          <div data-reveal className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              data-magnetic
              className="inline-flex items-center gap-2 rounded-full bg-[#6C3FF5] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#5a32d4]"
            >
              Start free trial
            </Link>
            <button
              data-magnetic
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/5"
            >
              <Play size={16} className="text-[#FF9B6B]" />
              Watch demo
            </button>
          </div>

          {/* Floating stat cards */}
          <div className="mt-16 hidden gap-4 lg:flex">
            {FLOATING_CARDS.map((card) => (
              <div
                key={card.label}
                className="floating-card rounded-2xl border border-white/8 bg-[#1A1A1A]/80 px-5 py-4 backdrop-blur-sm"
              >
                <card.icon size={18} style={{ color: card.color }} />
                <p className="mt-2 font-[family-name:var(--font-space)] text-2xl font-bold text-white">
                  {card.value}
                </p>
                <p className="text-xs text-[#A0A0A0]">{card.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right image */}
        <div className="relative h-[50vh] lg:h-auto">
          <div
            ref={imageRef}
            className="hero-image parallax-image absolute inset-0"
          >
            <Image
              src={LANDING_IMAGES.hero}
              alt="Modern warehouse logistics center"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent lg:hidden" />
          </div>

          {/* Asymmetric grid overlay */}
          <div className="absolute inset-0 z-10 opacity-20">
            <div className="grid h-full w-full grid-cols-6 grid-rows-6">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="border border-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 text-[#A0A0A0]">
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ArrowDown size={16} className="animate-bounce" />
      </div>
    </section>
  );
}
