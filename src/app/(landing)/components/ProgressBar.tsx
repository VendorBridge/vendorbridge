"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { setupProgressBar } from "../animations/scrollAnimations";

gsap.registerPlugin(useGSAP);

export function ProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!barRef.current) return;
    setupProgressBar(barRef.current);
  });

  return (
    <div className="fixed left-0 top-0 z-[100] h-[2px] w-full bg-transparent">
      <div
        ref={barRef}
        className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#6C3FF5] via-[#FF9B6B] to-[#E8D754]"
      />
    </div>
  );
}
