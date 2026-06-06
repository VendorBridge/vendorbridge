"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Share2, Globe, Rss, Mail } from "lucide-react";
import { LANDING_IMAGES } from "../lib/images";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FOOTER_LINKS = {
  Product: ["Features", "Integrations", "Pricing", "Changelog"],
  Solutions: ["Manufacturing", "Retail", "Healthcare", "Construction"],
  Resources: ["Documentation", "API Reference", "Blog", "Case Studies"],
  Company: ["About", "Careers", "Contact", "Privacy"],
};

const SOCIAL = [
  { icon: Share2, href: "#", label: "Share" },
  { icon: Rss, href: "#", label: "Blog" },
  { icon: Globe, href: "#", label: "Website" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = sectionRef.current;
      if (!scope) return;

      gsap.from(scope.querySelectorAll("[data-reveal]"), {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: scope,
          start: "top 90%",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <footer ref={sectionRef} className="relative overflow-hidden bg-[#0A0A0A]">
      <div className="absolute inset-0">
        <Image
          src={LANDING_IMAGES.footer}
          alt=""
          fill
          className="object-cover opacity-10"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-[#0A0A0A]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-16 lg:px-16">
        {/* Newsletter */}
        <div
          data-reveal
          className="mb-16 flex flex-col items-start justify-between gap-6 border-b border-white/8 pb-12 lg:flex-row lg:items-center"
        >
          <div>
            <p className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-white">
              Stay in the loop
            </p>
            <p className="mt-1 text-sm text-[#A0A0A0]">
              Procurement insights, product updates — no spam.
            </p>
          </div>
          <form
            className="flex w-full max-w-md gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 rounded-full border border-white/10 bg-[#1A1A1A] px-5 py-3 text-sm text-white placeholder:text-[#A0A0A0] focus:border-[#6C3FF5]/50 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-[#6C3FF5] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5a32d4]"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Link columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div data-reveal className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C3FF5] text-sm font-bold text-white">
                V
              </span>
              <span className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-white">
                VendorBridge
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[#A0A0A0]">
              Enterprise procurement, simplified.
            </p>

            <div className="mt-6 flex gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#A0A0A0] transition-all hover:border-[#6C3FF5] hover:text-[#6C3FF5]"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} data-reveal>
              <p className="text-sm font-semibold text-white">{category}</p>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#A0A0A0] transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          data-reveal
          className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 text-sm text-[#A0A0A0] sm:flex-row"
        >
          <p>&copy; {new Date().getFullYear()} VendorBridge. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-white">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
