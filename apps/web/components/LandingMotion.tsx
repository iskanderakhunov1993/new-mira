"use client";

import { useEffect } from "react";

export function LandingMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".mira-landing");
    if (!root) return;

    const header = root.querySelector<HTMLElement>("[data-landing-header]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));

    const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 18);
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (reduceMotion) return () => window.removeEventListener("scroll", syncHeader);

    root.classList.add("motion-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    revealTargets.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", syncHeader);
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
