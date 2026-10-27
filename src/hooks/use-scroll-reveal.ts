import { useEffect, type RefObject } from "react";

export function useScrollReveal<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const revealElements = (root: ParentNode) => {
      if (root instanceof Element && root.matches(".home-reveal, .portfolio-reveal")) {
        observer.observe(root);
      }
      root.querySelectorAll(".home-reveal, .portfolio-reveal").forEach((element) => observer.observe(element));
    };

    if (!("IntersectionObserver" in window)) {
      container.querySelectorAll(".home-reveal, .portfolio-reveal").forEach((element) => element.classList.add("is-visible"));
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

    revealElements(container);
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) revealElements(node);
        });
      });
    });
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [containerRef]);
}