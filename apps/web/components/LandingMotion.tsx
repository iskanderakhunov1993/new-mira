"use client";

import { useEffect } from "react";

export function LandingMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".landing-page");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    root.classList.add("motion-ready");

    const revealTargets = Array.from(root.querySelectorAll<HTMLElement>(
      ":scope > section, .benefit, .result-proof-grid article, .free-principles article, .how li, .faq details",
    ));

    revealTargets.forEach((element, index) => {
      element.classList.add("motion-reveal");
      element.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9% 0px", threshold: 0.12 });

    revealTargets.forEach((element) => observer.observe(element));

    let animationFrame = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    const renderMotion = () => {
      const normalizedX = (pointerX / window.innerWidth - 0.5) * 2;
      const normalizedY = (pointerY / window.innerHeight - 0.5) * 2;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

      root.style.setProperty("--cursor-x", `${pointerX}px`);
      root.style.setProperty("--cursor-y", `${pointerY}px`);
      root.style.setProperty("--parallax-x", `${normalizedX * 16}px`);
      root.style.setProperty("--parallax-y", `${normalizedY * 12}px`);
      root.style.setProperty("--phone-x", `${normalizedX * 7}px`);
      root.style.setProperty("--phone-y", `${normalizedY * 6}px`);
      root.style.setProperty("--scroll-progress", String(progress));
      root.style.setProperty("--scroll-drift", `${Math.min(window.scrollY * 0.045, 90)}px`);
      animationFrame = 0;
    };

    const requestMotionFrame = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(renderMotion);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      root.classList.add("has-pointer");
      requestMotionFrame();
    };

    const handlePointerLeave = () => {
      root.classList.remove("has-pointer");
      pointerX = window.innerWidth / 2;
      pointerY = window.innerHeight / 2;
      requestMotionFrame();
    };

    const finePointer = window.matchMedia("(pointer: fine)");
    if (finePointer.matches) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", handlePointerLeave);
    }

    window.addEventListener("scroll", requestMotionFrame, { passive: true });
    window.addEventListener("resize", requestMotionFrame);
    renderMotion();

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("scroll", requestMotionFrame);
      window.removeEventListener("resize", requestMotionFrame);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      root.classList.remove("motion-ready", "has-pointer");
    };
  }, []);

  return (
    <div className="landing-motion-layer" aria-hidden="true">
      <span className="scroll-progress" />
      <i className="cursor-glow" />
      <i className="ambient-orb ambient-orb-one" />
      <i className="ambient-orb ambient-orb-two" />
    </div>
  );
}
