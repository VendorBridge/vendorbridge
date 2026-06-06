"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LANDING_IMAGES } from "../lib/images";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TESTIMONIALS = [
  {
    quote:
      "VendorBridge cut our RFQ cycle from three weeks to three days. Our finance team finally trusts the procurement data.",
    name: "Sarah Chen",
    title: "Head of Procurement",
    company: "Meridian Industries",
    image: LANDING_IMAGES.collaboration,
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200&q=80",
  },
  {
    quote:
      "The vendor portal alone saved us 200 hours per quarter. Vendors love it, and we get better quotes faster.",
    name: "James Okonkwo",
    title: "Supply Chain Director",
    company: "Atlas Manufacturing",
    image: LANDING_IMAGES.warehouse,
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&q=80",
  },
  {
    quote:
      "Approval workflows used to be a black box. Now every stakeholder has visibility, and nothing falls through the cracks.",
    name: "Elena Vasquez",
    title: "CFO",
    company: "Pacific Retail Group",
    image: LANDING_IMAGES.office,
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200&q=80",
  },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const current = TESTIMONIALS[active];

  useGSAP(
    () => {
      const scope = sectionRef.current;
      const bg = bgRef.current;
      if (!scope || !bg) return;

      gsap.to(bg, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [active] }
  );

  const navigate = (dir: -1 | 1) => {
    setActive((prev) => (prev + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] overflow-hidden bg-[#0A0A0A]"
    >
      <div ref={bgRef} className="absolute inset-0">
        <Image
          key={current.image}
          src={current.image}
          alt=""
          fill
          className="object-cover transition-opacity duration-700"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/85" />
      </div>

      <div className="noise-overlay pointer-events-none absolute inset-0 z-10 opacity-[0.04]" />

      <div className="relative z-20 mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-center px-6 py-24 lg:px-16">
        <blockquote className="relative">
          <span
            className="absolute -left-4 -top-8 font-[family-name:var(--font-space)] text-[clamp(6rem,15vw,12rem)] leading-none text-[#6C3FF5]/15 lg:-left-8"
            aria-hidden
          >
            &ldquo;
          </span>
          <p className="relative font-[family-name:var(--font-jakarta)] text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-snug text-white">
            {current.quote}
          </p>
        </blockquote>

        <div className="mt-12 flex items-center gap-5">
          <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-[#6C3FF5]/30 ring-offset-2 ring-offset-transparent">
            <Image
              src={current.avatar}
              alt={current.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div>
            <p className="font-semibold text-white">{current.name}</p>
            <p className="text-sm text-[#A0A0A0]">
              {current.title}, {current.company}
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-[#6C3FF5] hover:bg-[#6C3FF5]/10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => navigate(1)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-[#6C3FF5] hover:bg-[#6C3FF5]/10"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>
          <span className="ml-4 text-sm text-[#A0A0A0]">
            {String(active + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
