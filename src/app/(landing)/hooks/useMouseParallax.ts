"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

interface UseMouseParallaxOptions {
  intensity?: number;
  enabled?: boolean;
}

export function useMouseParallax(
  ref: RefObject<HTMLElement | null>,
  options: UseMouseParallaxOptions = {}
) {
  const { intensity = 20, enabled = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion || isTouch) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = ((e.clientX / innerWidth) - 0.5) * intensity;
      const y = ((e.clientY / innerHeight) - 0.5) * intensity;
      xTo(x);
      yTo(y);
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [ref, intensity, enabled]);
}
