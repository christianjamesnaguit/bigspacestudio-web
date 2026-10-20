import "./styles/portfolio.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import { useRef } from "react";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import SiteMediaContent from "../api/site-media-content";

function Portfolio() {
  const portfolioRef = useRef<HTMLElement>(null);
  useScrollReveal(portfolioRef);

  return (
    <>
      <Header />
      <main ref={portfolioRef}>
      <section className="body-margin">
        <div className="feature-section">
          <div className="feature-grid home-reveal">
            <SiteMediaContent mediaKey="portfolio.1" alt="Portfolio photography" className="grid-item" />
            <SiteMediaContent mediaKey="portfolio.2" alt="Portfolio photography" className="grid-item" />
            <SiteMediaContent mediaKey="portfolio.3" alt="Portfolio photography" className="grid-item" />
            <SiteMediaContent mediaKey="portfolio.4" alt="Portfolio photography" className="grid-item" />
          </div>
          <div className="feature-whole home-reveal home-reveal--delay-100">
            <SiteMediaContent mediaKey="portfolio.5" alt="Portfolio photography" className="whole-item" />
          </div>
        </div>
      </section>
      <section className="body-margin">
        <div className="feature-section">
          <div className="feature-whole home-reveal">
            <SiteMediaContent mediaKey="portfolio.6" alt="Portfolio photography" className="whole-item" />
          </div>
          <div className="feature-grid home-reveal home-reveal--delay-100">
            <SiteMediaContent mediaKey="portfolio.1" alt="Portfolio photography" className="grid-item" />
            <SiteMediaContent mediaKey="portfolio.2" alt="Portfolio photography" className="grid-item" />
            <SiteMediaContent mediaKey="portfolio.3" alt="Portfolio photography" className="grid-item" />
            <SiteMediaContent mediaKey="portfolio.4" alt="Portfolio photography" className="grid-item" />
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}

export default Portfolio;
