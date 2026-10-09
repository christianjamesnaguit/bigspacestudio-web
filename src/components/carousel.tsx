import { useEffect, useRef, useState } from "react";
import "./styles.css";

const images = [
  "/images/photo1.jpg",
  "/images/photo2.jpg",
  "/images/photo3.jpg",
];

function Carousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, []);

  const animateTo = (index: number, nextDirection: "next" | "prev") => {
    if (isAnimating || index === current) return;

    setDirection(nextDirection);
    setIsAnimating(true);
    animationTimeout.current = setTimeout(() => {
      setCurrent(index);
      setIsAnimating(false);
    }, 400);
  };

  const nextImage = () => {
    animateTo((current + 1) % images.length, "next");
  };

  const previousImage = () => {
    animateTo((current - 1 + images.length) % images.length, "prev");
  };

  const nextIndex = (current + 1) % images.length;
  const previousIndex = (current - 1 + images.length) % images.length;

  return (
    <div className="carousel">
      <button className="carousel-arrow previous" type="button" aria-label="Previous image" onClick={previousImage}>
        ‹
      </button>

      <div className="carousel-content">
        <div className="carousel-window">
          <img
            src={images[current]}
            className={`carousel-image current ${isAnimating ? direction : ""}`}
            alt={`Studio portfolio image ${current + 1}`}
          />

          {isAnimating && (
            <img
              src={images[direction === "next" ? nextIndex : previousIndex]}
              className={`carousel-image incoming ${direction}`}
              alt={`Studio portfolio image ${direction === "next" ? nextIndex + 1 : previousIndex + 1}`}
            />
          )}
        </div>

        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show portfolio image ${index + 1}`}
              aria-current={index === current ? "true" : undefined}
              className={`carousel-dot ${index === current ? "active" : ""}`}
              onClick={() => animateTo(index, index > current ? "next" : "prev")}
            />
          ))}
        </div>
      </div>

      <button className="carousel-arrow next" type="button" aria-label="Next image" onClick={nextImage}>
        ›
      </button>
    </div>
  );
}

export default Carousel;
