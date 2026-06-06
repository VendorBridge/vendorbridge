import gsap from "gsap";
import SplitType from "split-type";

export function animateHeroHeadline(
  selector: string,
  scope?: Element | null
): (() => void) | void {
  const el = scope?.querySelector(selector) ?? document.querySelector(selector);
  if (!el) return;

  const split = new SplitType(el as HTMLElement, { types: "words,chars" });
  const chars = split.chars;
  if (!chars?.length) return;

  gsap.from(chars, {
    y: 100,
    rotationX: -90,
    opacity: 0,
    stagger: 0.02,
    duration: 0.8,
    ease: "back.out(1.7)",
    delay: 0.3,
  });

  return () => split.revert();
}

export function animateFadeUp(
  elements: gsap.TweenTarget,
  options?: gsap.TweenVars
) {
  return gsap.from(elements, {
    y: 60,
    opacity: 0,
    duration: 1,
    stagger: 0.12,
    ease: "power3.out",
    ...options,
  });
}

export function animateScaleIn(
  element: gsap.TweenTarget,
  options?: gsap.TweenVars
) {
  return gsap.from(element, {
    scale: 1.15,
    opacity: 0,
    duration: 1.4,
    ease: "power2.out",
    ...options,
  });
}

export function animateFloating(
  elements: gsap.TweenTarget,
  options?: gsap.TweenVars
) {
  return gsap.to(elements, {
    y: "+=12",
    duration: 2.5,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    stagger: { each: 0.3, from: "random" },
    ...options,
  });
}

export function setupMagneticButton(
  button: HTMLElement,
  strength = 0.4
): () => void {
  const xTo = gsap.quickTo(button, "x", { duration: 0.4, ease: "power3.out" });
  const yTo = gsap.quickTo(button, "y", { duration: 0.4, ease: "power3.out" });

  const onMove = (e: MouseEvent) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    xTo(x * strength);
    yTo(y * strength);
  };

  const onLeave = () => {
    xTo(0);
    yTo(0);
  };

  button.addEventListener("mousemove", onMove);
  button.addEventListener("mouseleave", onLeave);

  return () => {
    button.removeEventListener("mousemove", onMove);
    button.removeEventListener("mouseleave", onLeave);
    gsap.set(button, { x: 0, y: 0 });
  };
}

export function setupCardTilt(
  card: HTMLElement,
  maxTilt = 8
): () => void {
  const onMove = (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotationY: x * maxTilt,
      rotationX: -y * maxTilt,
      transformPerspective: 800,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const onLeave = () => {
    gsap.to(card, {
      rotationY: 0,
      rotationX: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  card.addEventListener("mousemove", onMove);
  card.addEventListener("mouseleave", onLeave);

  return () => {
    card.removeEventListener("mousemove", onMove);
    card.removeEventListener("mouseleave", onLeave);
    gsap.set(card, { rotationY: 0, rotationX: 0 });
  };
}
