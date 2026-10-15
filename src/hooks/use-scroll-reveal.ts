import { useEffect, type RefObject } from "react";

export function useScrollReveal<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll(".home-reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [containerRef]);
}