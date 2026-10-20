import { useCallback, useEffect, useRef, useState } from "react";
import SiteMediaContent from "../api/site-media-content";
import { useSiteMedia } from "../api/site-media-context";
import { defaultSiteMedia, getHomeMediaKeys } from "../api/site-media-defaults";
import "./styles.css";

const defaultSlides = Object.keys(defaultSiteMedia)
  .filter((key) => key.startsWith("home.carousel."));

function Carousel() {
  const { media, isLoaded } = useSiteMedia();
  const slides = isLoaded ? getHomeMediaKeys(media, "carousel") : defaultSlides;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIndex = Math.max(0, Math.min(current, slides.length - 1));

  const animateTo = useCallback(
    (index: number, nextDirection: "next" | "prev") => {
      if (isAnimating || index === activeIndex) return;

      setDirection(nextDirection);
      setIsAnimating(true);
      animationTimeout.current = setTimeout(() => {
        setCurrent(index);
        setIsAnimating(false);
      }, 400);
    },
    [activeIndex, isAnimating],
  );

  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isAnimating) return;
    if (slides.length < 2) return;

    const autoplayInterval = window.setInterval(() => {
      animateTo((activeIndex + 1) % slides.length, "next");
    }, 5000);

    return () => window.clearInterval(autoplayInterval);
  }, [activeIndex, animateTo, isAnimating, slides.length]);

  const renderSlide = (mediaKey: string, className: string) => (
    <SiteMediaContent key={media[mediaKey]?.url ?? mediaKey} mediaKey={mediaKey} className={className} />
  );

  const nextImage = () => animateTo((activeIndex + 1) % slides.length, "next");

  const previousImage = () => {
    animateTo((activeIndex - 1 + slides.length) % slides.length, "prev");
  };

  if (slides.length === 0) return null;

  const nextIndex = (activeIndex + 1) % slides.length;
  const previousIndex = (activeIndex - 1 + slides.length) % slides.length;

  return (
    <div className="carousel">
      <button className="carousel-arrow previous" type="button" aria-label="Previous slide" onClick={previousImage}>
        ‹
      </button>

      <div className="carousel-content">
        <div className="carousel-window">
          {renderSlide(
            slides[activeIndex],
            `carousel-media current ${isAnimating ? direction : ""}`,
          )}

          {isAnimating && (
            renderSlide(
              slides[direction === "next" ? nextIndex : previousIndex],
              `carousel-media incoming ${direction}`,
            )
          )}
        </div>

        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show portfolio slide ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`carousel-dot ${index === activeIndex ? "active" : ""}`}
              onClick={() => animateTo(index, index > activeIndex ? "next" : "prev")}
            />
          ))}
        </div>
      </div>

      <button className="carousel-arrow next" type="button" aria-label="Next slide" onClick={nextImage}>
        ›
      </button>
    </div>
  );
}

export default Carousel;
