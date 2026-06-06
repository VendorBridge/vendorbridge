"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FilePlus, MessageSquareQuote, GitCompare, FileCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  {
    number: "01",
    title: "Create RFQ",
    description:
      "Define line items, set deadlines, and invite qualified vendors — all from one intuitive form.",
    icon: FilePlus,
    mock: {
      fields: ["Title: Office Furniture Q1", "Deadline: Mar 15, 2026", "Vendors: 12 invited"],
    },
  },
  {
    number: "02",
    title: "Vendors Quote",
    description:
      "Vendors receive notifications and submit competitive quotes through their dedicated portal.",
    icon: MessageSquareQuote,
    mock: {
      bids: [
        { vendor: "Acme Supplies", amount: "$24,500" },
        { vendor: "Global Office", amount: "$22,800" },
        { vendor: "Prime Furnish", amount: "$26,100" },
      ],
    },
  },
  {
    number: "03",
    title: "Compare & Approve",
    description:
      "Side-by-side comparison matrix with automated scoring. Route to approvers with one click.",
    icon: GitCompare,
    mock: {
      matrix: [
        { criteria: "Price", scores: ["★★★", "★★★★", "★★"] },
        { criteria: "Delivery", scores: ["★★★★", "★★★", "★★★★"] },
        { criteria: "Quality", scores: ["★★★", "★★★★", "★★★"] },
      ],
    },
  },
  {
    number: "04",
    title: "Generate PO & Invoice",
    description:
      "Winning quote auto-converts to a purchase order. Invoices matched and ready for payment.",
    icon: FileCheck,
    mock: {
      doc: { po: "PO-2026-0847", total: "$22,800", status: "Approved" },
    },
  },
];

function StepMock({ step }: { step: (typeof STEPS)[number] }) {
  const mock = step.mock;

  if ("fields" in mock && mock.fields) {
    return (
      <div className="space-y-3 rounded-xl border border-white/10 bg-[#121212] p-5">
        {mock.fields.map((f) => (
          <div key={f} className="rounded-lg bg-[#1A1A1A] px-4 py-3 text-sm text-[#A0A0A0]">
            {f}
          </div>
        ))}
        <div className="mt-2 h-2 w-3/4 rounded bg-[#6C3FF5]/30" />
        <div className="h-2 w-1/2 rounded bg-[#6C3FF5]/20" />
      </div>
    );
  }
  if ("bids" in mock && mock.bids) {
    return (
      <div className="space-y-2 rounded-xl border border-white/10 bg-[#121212] p-5">
        {mock.bids.map((bid, i) => (
          <div
            key={bid.vendor}
            className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
              i === 1 ? "bg-[#6C3FF5]/15 text-white" : "bg-[#1A1A1A] text-[#A0A0A0]"
            }`}
          >
            <span>{bid.vendor}</span>
            <span className="font-[family-name:var(--font-space)] font-bold">{bid.amount}</span>
          </div>
        ))}
      </div>
    );
  }
  if ("matrix" in mock && mock.matrix) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#121212] p-5">
        <div className="grid grid-cols-4 gap-2 text-xs text-[#A0A0A0]">
          <div />
          <div className="text-center">Acme</div>
          <div className="text-center font-semibold text-[#6C3FF5]">Global</div>
          <div className="text-center">Prime</div>
          {mock.matrix.map((row) => (
            <div key={row.criteria} className="contents">
              <div className="py-2">{row.criteria}</div>
              {row.scores.map((s, i) => (
                <div
                  key={`${row.criteria}-${i}`}
                  className="py-2 text-center text-[#E8D754]"
                >
                  {s}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-white/10 bg-[#121212] p-5">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <span className="text-sm text-[#A0A0A0]">Purchase Order</span>
        <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-400">
          {"doc" in mock ? mock.doc.status : "Approved"}
        </span>
      </div>
      <p className="mt-4 font-[family-name:var(--font-space)] text-2xl font-bold text-white">
        {"doc" in mock ? mock.doc.po : "PO-2026-0847"}
      </p>
      <p className="mt-2 text-[#6C3FF5]">{"doc" in mock ? mock.doc.total : "$22,800"}</p>
    </div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const container = containerRef.current;
      const panels = panelsRef.current;
      if (!section || !container || !panels) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const panelEls = gsap.utils.toArray<HTMLElement>(".hiw-panel", panels);
        gsap.to(panelEls, {
          xPercent: -100 * (panelEls.length - 1),
          ease: "none",
          scrollTrigger: {
            trigger: container,
            pin: section,
            scrub: 1,
            snap: 1 / (panelEls.length - 1),
            end: () => `+=${window.innerWidth * (panelEls.length - 1)}`,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section id="how-it-works" ref={sectionRef} className="relative bg-[#121212]">
      <div className="px-6 py-16 lg:px-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FF9B6B]">
          How It Works
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-jakarta)] text-[clamp(2rem,4vw,3rem)] font-bold text-white">
          Four steps to procurement clarity
        </h2>
      </div>

      <div ref={containerRef} className="relative">
        <div
          ref={panelsRef}
          className="flex flex-col lg:h-screen lg:flex-row lg:flex-nowrap"
        >
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="hiw-panel flex w-full shrink-0 flex-col justify-center px-6 py-12 lg:h-screen lg:w-screen lg:px-16 lg:py-0"
            >
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div>
                  <span className="font-[family-name:var(--font-space)] text-7xl font-bold text-[#6C3FF5]/20 lg:text-9xl">
                    {step.number}
                  </span>
                  <div className="mt-4 flex items-center gap-3">
                    <step.icon size={24} className="text-[#FF9B6B]" />
                    <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-bold text-white lg:text-3xl">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-4 max-w-md text-[#A0A0A0]">{step.description}</p>
                </div>

                <div
                  className="rounded-2xl border border-white/10 bg-[#1A1A1A] p-4 shadow-2xl"
                  style={{ perspective: "1000px" }}
                >
                  <div className="mb-3 flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <StepMock step={step} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
