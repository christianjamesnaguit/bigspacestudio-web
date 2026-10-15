import "./styles/services.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useScrollReveal } from "../hooks/use-scroll-reveal";

function Services() {
  const servicesRef = useRef<HTMLElement>(null);
  useScrollReveal(servicesRef);

  return (
    <>
      <Header />
      <main className="body-margin" ref={servicesRef}>
        <h1 className="service-header home-reveal">Most Popular Services</h1>
        <hr />
        <div className="services-container">
          <div className="service-item home-reveal">
            <h2>Service 1</h2>
            <p className="service-subtitle">100 PHP</p>
            <p>Description of Service 1</p>
            <Link to="/booking" className="nav-button">
              Book Now!
            </Link>
          </div>
          <div className="service-item home-reveal home-reveal--delay-100">
            <h2>Service 2</h2>
            <p className="service-subtitle">1,000 PHP</p>
            <p>Description of Service 2</p>
            <p>Inclusions of Service 2</p>
            <p>Inclusions of Service 2</p>
            <Link to="/booking" className="nav-button">
              Book Now!
            </Link>
          </div>
          <div className="service-item home-reveal home-reveal--delay-150">
            <h2>Service 3</h2>
            <p className="service-subtitle">10,000 PHP</p>
            <p>Description of Service 3</p>
            <p>Inclusions of Service 3</p>
            <p>Inclusions of Service 3</p>
            <p>Add-ons of Service 3</p>
            <p>Add-ons of Service 3</p>
            <Link to="/booking" className="nav-button">
              Book Now!
            </Link>
          </div>
        </div>
        <section className="alternative-packages">
          <div className="alternative-packages-header home-reveal">
            <div>
              <p className="section-eyebrow">MORE OPTIONS</p>
              <h2>Alternative Packages</h2>
              <p>Explore other packages that may suit your session.</p>
            </div>
            <div className="package-controls">
              <label>
                <span className="visually-hidden">Search packages</span>
                <input type="search" placeholder="Search packages" />
              </label>
              <label>
                <span className="visually-hidden">Filter packages</span>
                <select defaultValue="all">
                  <option value="all">All packages</option>
                  <option value="portrait">Portrait</option>
                  <option value="creative">Creative</option>
                  <option value="rental">Studio rental</option>
                </select>
              </label>
            </div>
          </div>
          <div className="package-list">
            <article className="package-card home-reveal">
              <div>
                <h3>Mini Portrait Package</h3>
                <p className="package-price">₱2,000</p>
                <p>A shorter portrait session for simple, polished results.</p>
              </div>
              <Link to="/booking" className="package-link">View package</Link>
            </article>
            <article className="package-card home-reveal home-reveal--delay-100">
              <div>
                <h3>Content Creator Package</h3>
                <p className="package-price">₱4,000</p>
                <p>A flexible setup for creating a batch of social content.</p>
              </div>
              <Link to="/booking" className="package-link">View package</Link>
            </article>
            <article className="package-card home-reveal home-reveal--delay-150">
              <div>
                <h3>Half-day Studio Package</h3>
                <p className="package-price">₱5,500</p>
                <p>Extended studio access for larger creative projects.</p>
              </div>
              <Link to="/booking" className="package-link">View package</Link>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Services;
