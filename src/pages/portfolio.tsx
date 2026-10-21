import "./styles/portfolio.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, TouchEvent } from "react";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import SiteMediaContent from "../api/site-media-content";
import { useSiteMedia } from "../api/site-media-context";
import { defaultSiteMedia, portfolioCategories } from "../api/site-media-defaults";

type PortfolioItem = {
	mediaKey: string;
	category: string | null;
	shootType: string | null;
	clientName: string | null;
  isFeatured: boolean;
	altText: string;
};

function Portfolio() {
  const portfolioRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipeOrigin = useRef<{ x: number; y: number } | null>(null);
  const { media, isLoaded } = useSiteMedia();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeMediaKey, setActiveMediaKey] = useState<string | null>(null);
  useScrollReveal(portfolioRef);

  const items = useMemo<PortfolioItem[]>(() => {
    const portfolioMediaKeys = isLoaded
      ? Object.keys(media).filter((mediaKey) => mediaKey.startsWith("portfolio."))
      : Object.keys(defaultSiteMedia).filter((mediaKey) => mediaKey.startsWith("portfolio."));

    return portfolioMediaKeys
      .sort((left, right) => Number(left.split(".").at(-1)) - Number(right.split(".").at(-1)))
      .map((mediaKey) => {
        const fallback = defaultSiteMedia[mediaKey];
        const record = media[mediaKey];

        return {
          mediaKey,
          category: record ? record.category : fallback.category ?? null,
          shootType: record ? record.shoot_type : fallback.shoot_type ?? null,
          clientName: record ? record.client_name : fallback.client_name ?? null,
          isFeatured: record?.is_featured ?? false,
          altText: record?.alt_text && record.alt_text !== "Portfolio photography" ? record.alt_text : fallback.alt_text,
        };
      });
  }, [isLoaded, media]);

  const filteredItems = useMemo(
		() => selectedCategory
			? items.filter((item) => item.category === selectedCategory)
			: items,
		[items, selectedCategory],
	);
  const featuredItem = filteredItems.find((item) => item.isFeatured) ?? filteredItems[0];
  const galleryItems = filteredItems.filter((item) => item.mediaKey !== featuredItem?.mediaKey);
	const activeIndex = filteredItems.findIndex((item) => item.mediaKey === activeMediaKey);
	const activeItem = activeIndex >= 0 ? filteredItems[activeIndex] : null;

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (activeItem && !dialog.open) {
			dialog.showModal();
		} else if (!activeItem && dialog.open) {
			dialog.close();
		}
	}, [activeItem]);

	function showAdjacentImage(offset: number) {
		if (activeIndex < 0 || filteredItems.length < 2) return;
		const nextIndex = (activeIndex + offset + filteredItems.length) % filteredItems.length;
		setActiveMediaKey(filteredItems[nextIndex].mediaKey);
	}

	function handleLightboxKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
		if (event.key === "ArrowLeft") {
			event.preventDefault();
			showAdjacentImage(-1);
		} else if (event.key === "ArrowRight") {
			event.preventDefault();
			showAdjacentImage(1);
		}
	}

	function handleSwipeStart(event: TouchEvent<HTMLDivElement>) {
		const touch = event.touches[0];
		swipeOrigin.current = { x: touch.clientX, y: touch.clientY };
	}

	function handleSwipeEnd(event: TouchEvent<HTMLDivElement>) {
		const origin = swipeOrigin.current;
		const touch = event.changedTouches[0];
		swipeOrigin.current = null;
		if (!origin || !touch) return;

		const horizontalDistance = touch.clientX - origin.x;
		const verticalDistance = touch.clientY - origin.y;
		if (Math.abs(horizontalDistance) < 48 || Math.abs(horizontalDistance) < Math.abs(verticalDistance)) return;

		showAdjacentImage(horizontalDistance > 0 ? -1 : 1);
	}

  return (
    <>
      <Header />
      <main className="portfolio-page" ref={portfolioRef}>
        {featuredItem && (
          <section className="portfolio-featured body-margin" aria-labelledby="portfolio-featured-title">
            <button
              type="button"
              className="portfolio-feature-image"
              aria-label={`View featured ${featuredItem.category ?? "portfolio"} image full screen`}
              onClick={() => setActiveMediaKey(featuredItem.mediaKey)}
            >
              <SiteMediaContent mediaKey={featuredItem.mediaKey} alt={featuredItem.altText} />
              <span>Featured frame <span aria-hidden="true">↗</span></span>
            </button>
            <div className="portfolio-feature-copy">
              <p className="portfolio-feature-kicker">01 <span>/</span> Featured session</p>
              <h2 id="portfolio-featured-title">{featuredItem.clientName || featuredItem.category || "A portrait story"}</h2>
              <p className="portfolio-feature-description">A moment worth keeping, photographed with care and intention.</p>
              <dl className="portfolio-feature-details">
                {featuredItem.category && <div><dt>Category</dt><dd>{featuredItem.category}</dd></div>}
                {featuredItem.shootType && <div><dt>Shoot type</dt><dd>{featuredItem.shootType}</dd></div>}
                {featuredItem.clientName && <div><dt>Client / project</dt><dd>{featuredItem.clientName}</dd></div>}
              </dl>
              <button
                type="button"
                className="portfolio-feature-link"
                onClick={() => setActiveMediaKey(featuredItem.mediaKey)}
              >
                View featured image <span aria-hidden="true">↗</span>
              </button>
            </div>
          </section>
        )}

        <section className="portfolio-gallery body-margin" aria-labelledby="portfolio-gallery-title">
          <div className="portfolio-gallery-heading">
            <div>
              <p className="portfolio-eyebrow">The collection</p>
              <h2 id="portfolio-gallery-title">Every frame, a story.</h2>
            </div>
            <span className="portfolio-result-count">{String(filteredItems.length).padStart(2, "0")} images</span>
          </div>

          <div className="portfolio-filters" role="tablist" aria-label="Filter portfolio by category">
            {[null, ...portfolioCategories].map((category) => (
              <button
                key={category ?? "all"}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category}
                className={selectedCategory === category ? "active" : ""}
                onClick={() => {
						setSelectedCategory(category);
						setActiveMediaKey(null);
					}}
              >
                {category ?? "All work"}
              </button>
            ))}
          </div>

          {galleryItems.length > 0 ? (
            <div className="portfolio-masonry">
              {galleryItems.map((item, index) => (
                <figure className="portfolio-card" key={item.mediaKey}>
                  <button
                    type="button"
                    className="portfolio-image-trigger"
                    aria-label={`View ${item.clientName || item.category || "portfolio"} image full screen`}
                    onClick={() => setActiveMediaKey(item.mediaKey)}
                  >
                    <SiteMediaContent mediaKey={item.mediaKey} alt={item.altText} />
                    <span className="portfolio-image-index">{String(index + 2).padStart(2, "0")}</span>
                  </button>
                  <figcaption>
                    <div>
                      <h3>{item.clientName || item.shootType || item.category || "Untitled session"}</h3>
                      <p>{[item.category, item.clientName ? item.shootType : null].filter(Boolean).join(" · ")}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : !featuredItem ? (
            <p className="portfolio-empty">No images in this category yet.</p>
          ) : null}
        </section>

        <dialog
          ref={dialogRef}
          className="portfolio-lightbox"
          aria-label="Full-screen portfolio image viewer"
          onClose={() => setActiveMediaKey(null)}
          onCancel={() => setActiveMediaKey(null)}
          onKeyDown={handleLightboxKeyDown}
          onClick={(event) => {
				if (event.target === event.currentTarget) setActiveMediaKey(null);
			}}
        >
          {activeItem && (
            <div className="portfolio-lightbox-layout" onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}>
              <div className="portfolio-lightbox-topbar">
                <span>{String(activeIndex + 1).padStart(2, "0")} <i>/</i> {String(filteredItems.length).padStart(2, "0")}</span>
                <button type="button" aria-label="Close full-screen viewer" onClick={() => setActiveMediaKey(null)}>×</button>
              </div>
              <div className="portfolio-lightbox-stage">
                <button type="button" className="portfolio-lightbox-arrow" aria-label="Previous image" onClick={() => showAdjacentImage(-1)} disabled={filteredItems.length < 2}>‹</button>
                <SiteMediaContent mediaKey={activeItem.mediaKey} alt={activeItem.altText} />
                <button type="button" className="portfolio-lightbox-arrow" aria-label="Next image" onClick={() => showAdjacentImage(1)} disabled={filteredItems.length < 2}>›</button>
              </div>
              <div className="portfolio-lightbox-caption">
                <div>
                  <p>{activeItem.category || "Portfolio"}</p>
                  <h2>{activeItem.clientName || activeItem.category || "Untitled session"}</h2>
                </div>
                <div className="portfolio-lightbox-meta">
                  {activeItem.shootType && <span>{activeItem.shootType}</span>}
                  {activeItem.clientName && <span>{activeItem.clientName}</span>}
                </div>
              </div>
            </div>
          )}
        </dialog>
      </main>
      <Footer />
    </>
  );
}

export default Portfolio;
