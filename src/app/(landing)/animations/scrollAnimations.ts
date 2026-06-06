import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function setupParallax(
  image: Element,
  trigger: Element,
  yPercent = 20
) {
  return gsap.to(image, {
    yPercent,
    ease: "none",
    scrollTrigger: {
      trigger,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}

export function setupSectionReveal(section: Element) {
  return gsap.from(section.querySelectorAll("[data-reveal]"), {
    y: 50,
    opacity: 0,
    duration: 0.9,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

export function setupClipReveal(image: Element, trigger: Element) {
  return gsap.fromTo(
    image,
    { clipPath: "inset(0 100% 0 0)" },
    {
      clipPath: "inset(0 0% 0 0)",
      duration: 1.2,
      ease: "power3.inOut",
      scrollTrigger: {
        trigger,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    }
  );
}

export function setupCountUp(
  element: Element,
  endValue: number,
  suffix = "",
  decimals = 0
) {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: endValue,
    duration: 2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: element,
      start: "top 85%",
      toggleActions: "play none none none",
    },
    onUpdate: () => {
      const display =
        decimals > 0
          ? obj.val.toFixed(decimals)
          : Math.round(obj.val).toLocaleString();
      element.textContent = `${display}${suffix}`;
    },
  });
}

export function setupProgressBar(bar: Element) {
  return gsap.to(bar, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3,
    },
  });
}

export function setupHorizontalScroll(
  container: Element,
  panels: Element[],
  pin: Element
) {
  const totalScroll = (panels.length - 1) * 100;

  const tween = gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: container,
      pin,
      scrub: 1,
      snap: 1 / (panels.length - 1),
      end: () => `+=${window.innerWidth * (panels.length - 1)}`,
    },
  });

  return tween;
}
