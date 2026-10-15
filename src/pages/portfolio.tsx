import "./styles/portfolio.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import { useRef } from "react";
import { useScrollReveal } from "../hooks/use-scroll-reveal";

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
            <img
              src="/images/eg1.jpg"
              alt="Portfolio photography"
              className="grid-item"
            />
            <img
              src="/images/eg2.jpg"
              alt="Portfolio photography"
              className="grid-item"
            />
            <img
              src="/images/eg3.jpg"
              alt="Portfolio photography"
              className="grid-item"
            />
            <img
              src="/images/eg4.jpg"
              alt="Portfolio photography"
              className="grid-item"
            />
          </div>
          <div className="feature-whole home-reveal home-reveal--delay-100">
            <img src="/images/eg5.jpg" alt="Portfolio photography" className="whole-item" />
          </div>
        </div>
      </section>
      <section className="body-margin">
        <div className="feature-section">
          <div className="feature-whole home-reveal">
            <img src="/images/eg6.jpg" alt="Portfolio photography" className="whole-item" />
          </div>
          <div className="feature-grid home-reveal home-reveal--delay-100">
            <img
              src="/images/eg1.jpg"
              alt="Portfolio photography"
              className="grid-item"
            />
            <img
              src="/images/eg2.jpg"
              alt="Portfolio photography"
              className="grid-item"
            />
            <img
              src="/images/eg3.jpg"
              alt="Portfolio photography"
              className="grid-item"
            />
            <img
              src="/images/eg4.jpg"
              alt="Portfolio photography"
              className="grid-item"
            />
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}

export default Portfolio;
