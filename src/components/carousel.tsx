import { useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";

type CarouselSlide =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; alt: string };

const slides: CarouselSlide[] = [
  { type: "image", src: "/images/photo1.jpg", alt: "Studio portfolio image 1" },
  { type: "image", src: "/images/photo2.jpg", alt: "Studio portfolio image 2" },
  { type: "image", src: "/images/photo3.jpg", alt: "Studio portfolio image 3" },
];

function Carousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateTo = useCallback(
    (index: number, nextDirection: "next" | "prev") => {
      if (isAnimating || index === current) return;

      setDirection(nextDirection);
      setIsAnimating(true);
      animationTimeout.current = setTimeout(() => {
        setCurrent(index);
        setIsAnimating(false);
      }, 400);
    },
    [current, isAnimating],
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

    const autoplayInterval = window.setInterval(() => {
      animateTo((current + 1) % slides.length, "next");
    }, 5000);

    return () => window.clearInterval(autoplayInterval);
  }, [animateTo, current, isAnimating]);

  const renderSlide = (
    slide: CarouselSlide,
    className: string,
  ) => {
    if (slide.type === "video") {
      return (
        <video
          key={slide.src}
          src={slide.src}
          className={className}
          aria-label={slide.alt}
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
        />
      );
    }

    return (
      <img
        key={slide.src}
        src={slide.src}
        className={className}
        alt={slide.alt}
      />
    );
  };

  const nextImage = () => animateTo((current + 1) % slides.length, "next");

  const previousImage = () => {
    animateTo((current - 1 + slides.length) % slides.length, "prev");
  };

  const nextIndex = (current + 1) % slides.length;
  const previousIndex = (current - 1 + slides.length) % slides.length;

  return (
    <div className="carousel">
      <button className="carousel-arrow previous" type="button" aria-label="Previous slide" onClick={previousImage}>
        ‹
      </button>

      <div className="carousel-content">
        <div className="carousel-window">
          {renderSlide(
            slides[current],
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
              aria-current={index === current ? "true" : undefined}
              className={`carousel-dot ${index === current ? "active" : ""}`}
              onClick={() => animateTo(index, index > current ? "next" : "prev")}
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
