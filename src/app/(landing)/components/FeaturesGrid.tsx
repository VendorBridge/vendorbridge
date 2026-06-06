"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FileSearch,
  Building2,
  ShieldCheck,
  GitCompareArrows,
  Receipt,
  BarChart3,
} from "lucide-react";
import { setupSectionReveal } from "../animations/scrollAnimations";
import { setupCardTilt, setupMagneticButton } from "../animations/gsapAnimations";
import { LANDING_IMAGES } from "../lib/images";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FEATURES = [
  {
    icon: FileSearch,
    title: "RFQ Management",
    description:
      "Create, publish, and track requests for quotation with multi-vendor distribution and deadline management.",
    image: LANDING_IMAGES.dashboard,
    size: "large" as const,
  },
  {
    icon: Building2,
    title: "Vendor Portal",
    description:
      "Self-service portal for vendors to submit quotes, upload documents, and track bid status.",
    image: LANDING_IMAGES.office,
    size: "medium" as const,
  },
  {
    icon: ShieldCheck,
    title: "Smart Approvals",
    description: "Configurable approval chains with escalation rules and audit trails.",
    image: LANDING_IMAGES.collaboration,
    size: "small" as const,
  },
  {
    icon: GitCompareArrows,
    title: "Quote Comparison",
    description:
      "Side-by-side matrix comparing vendor quotes on price, delivery, and compliance.",
    image: LANDING_IMAGES.warehouse,
    size: "wide" as const,
  },
  {
    icon: Receipt,
    title: "PO & Invoices",
    description:
      "Auto-generate purchase orders and match invoices against approved quotes.",
    image: LANDING_IMAGES.supplyChain,
    size: "medium" as const,
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Real-time spend analytics, vendor performance, and savings tracking.",
    image: LANDING_IMAGES.dashboard,
    size: "small" as const,
  },
];

const SIZE_CLASSES = {
  large: "md:col-span-2 md:row-span-2",
  medium: "md:col-span-1 md:row-span-2",
  small: "md:col-span-1 md:row-span-1",
  wide: "md:col-span-2 md:row-span-1",
};

export function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = sectionRef.current;
      if (!scope) return;
      setupSectionReveal(scope);

      const cleanups: (() => void)[] = [];
      scope.querySelectorAll(".feature-card").forEach((card) => {
        cleanups.push(setupCardTilt(card as HTMLElement));
        const btn = card.querySelector("[data-magnetic-inner]");
        if (btn) cleanups.push(setupMagneticButton(btn as HTMLElement, 0.2));
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative bg-[#0A0A0A] px-6 py-24 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <p
            data-reveal
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FF9B6B]"
          >
            Platform Features
          </p>
          <h2
            data-reveal
            className="mt-4 font-[family-name:var(--font-jakarta)] text-[clamp(2rem,4vw,3.5rem)] font-bold text-white"
          >
            Everything procurement needs,{" "}
            <span className="relative inline-block">
              nothing it doesn&apos;t
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
              >
                <path
                  d="M2 6C50 2 150 2 198 6"
                  stroke="#E8D754"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
        </div>

        <div className="grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-3 md:grid-rows-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              data-reveal
              data-magnetic-inner
              className={`feature-card group relative overflow-hidden rounded-2xl border border-white/8 bg-[#1A1A1A] transition-colors hover:border-[#6C3FF5]/30 ${SIZE_CLASSES[feature.size]}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative z-10 flex h-full flex-col p-6">
                <feature.icon
                  size={22}
                  className="text-[#6C3FF5] transition-colors group-hover:text-[#FF9B6B]"
                />
                <h3 className="mt-4 font-[family-name:var(--font-jakarta)] text-lg font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#A0A0A0]">
                  {feature.description}
                </p>
              </div>

              <div className="absolute bottom-0 right-0 h-1/2 w-1/2 opacity-30 transition-opacity group-hover:opacity-50">
                <Image
                  src={feature.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="300px"
                />
                <div className="absolute inset-0 bg-gradient-to-tl from-transparent to-[#1A1A1A]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
