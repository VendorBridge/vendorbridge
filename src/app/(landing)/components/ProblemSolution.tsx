"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { setupSectionReveal, setupClipReveal } from "../animations/scrollAnimations";
import { LANDING_IMAGES } from "../lib/images";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PAIN_POINTS = [
  { icon: FileSpreadsheet, text: "Scattered spreadsheets across departments" },
  { icon: Clock, text: "Weeks lost chasing vendor quotes manually" },
  { icon: AlertTriangle, text: "No visibility into approval bottlenecks" },
];

const FLOW_STEPS = ["Create RFQ", "Collect Quotes", "Compare & Approve", "Generate PO"];

export function ProblemSolution() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = sectionRef.current;
      if (!scope) return;
      setupSectionReveal(scope);
      const img = scope.querySelector(".clip-reveal");
      if (img) setupClipReveal(img, scope);
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0A0A0A]"
    >
      <div className="grid lg:grid-cols-2">
        {/* Dark side */}
        <div className="relative flex flex-col justify-center px-6 py-24 lg:px-16 lg:py-32">
          <p
            data-reveal
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FF9B6B]"
          >
            The Problem
          </p>

          <h2
            data-reveal
            className="mt-4 font-[family-name:var(--font-jakarta)] text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight text-white"
          >
            <span className="font-[family-name:var(--font-space)] text-[#6C3FF5]">
              78%
            </span>{" "}
            of procurement teams still use spreadsheets
          </h2>

          <ul className="mt-10 space-y-5">
            {PAIN_POINTS.map((point) => (
              <li
                key={point.text}
                data-reveal
                className="flex items-start gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A1A1A]">
                  <point.icon size={18} className="text-[#FF9B6B]" />
                </div>
                <p className="pt-2 text-[#A0A0A0]">{point.text}</p>
              </li>
            ))}
          </ul>

          {/* Before / After */}
          <div data-reveal className="mt-12 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                Before
              </p>
              <p className="mt-2 text-sm text-[#A0A0A0]">
                14-day quote cycles, email chains, lost approvals
              </p>
            </div>
            <div className="rounded-2xl border border-[#6C3FF5]/20 bg-[#6C3FF5]/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6C3FF5]">
                After
              </p>
              <p className="mt-2 text-sm text-[#A0A0A0]">
                48-hour turnaround, automated workflows, full audit trail
              </p>
            </div>
          </div>
        </div>

        {/* Image side with restored working image and smooth blending overlays */}
        <div className="relative min-h-[450px] lg:min-h-0 bg-[#0A0A0A]">
          <div className="clip-reveal absolute inset-0 w-full h-full overflow-hidden">
            <Image
              src={LANDING_IMAGES.teamHandshake}
              alt="Business team reviewing procurement documents"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Smooth gradient overlays to blend the image seamlessly into the surrounding dark theme */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A] z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/20 to-[#0A0A0A] z-10" />
          </div>

          {/* Solution flow diagram - positioned beautifully over the blended background image */}
          <div
            data-reveal
            className="absolute bottom-8 left-8 right-8 z-20 rounded-2xl border border-white/10 bg-[#1A1A1A]/90 p-6 backdrop-blur-md lg:bottom-12 lg:left-12 lg:right-auto lg:max-w-md shadow-2xl"
          >
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <CheckCircle2 size={16} className="text-[#6C3FF5]" />
              VendorBridge Flow
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {FLOW_STEPS.map((step, i) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-lg bg-[#6C3FF5]/15 px-3 py-1.5 text-xs font-medium text-[#6C3FF5]">
                    {step}
                  </span>
                  {i < FLOW_STEPS.length - 1 && (
                    <ArrowRight size={14} className="text-[#A0A0A0]" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
