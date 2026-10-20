import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import Carousel from "../components/carousel.tsx";
import Showcase from "../components/showcase.tsx";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import SiteMediaContent from "../api/site-media-content";
import "./styles/home.css";

function Home() {
  const homeRef = useRef<HTMLElement>(null);
  useScrollReveal(homeRef);

  return (
    <>
      <Header />
      <main className="home-page" ref={homeRef}>
        <section className="body-margin main-section">
          <div className="hero-section">
            <div className="hero-left home-reveal">
              <div className="hero-text">
                <h1>
                  The Perfect Space for <br></br>Life's Biggest Moments.
                </h1>
                <p>Professional studio photography designed around you.</p>
              </div>
              <div className="cta-buttons">
                <Link to="/booking" className="nav-button">
                  Book Now!
                </Link>
                <Link to="/portfolio" className="nav-button">
                  View Our Work
                </Link>
              </div>
            </div>
            <div className="hero-right home-reveal home-reveal--delay-100">
              <Carousel />
            </div>
          </div>
        </section>
        <section className="body-margin sub-section">
          <div className="home-reveal">
            <Showcase />
          </div>
          <h1 className="why-header home-reveal">
            WHY CHOOSE BIG SPACE STUDIO?
          </h1>
          <div className="why-section">
            <div className="why-content home-reveal">
              <SiteMediaContent mediaKey="home.quality.premium" alt="PREMIUM QUALITY" />
              <h2>
                PREMIUM
                <br />
                QUALITY
              </h2>
              <p>Professional lighting, equipment, and retouching</p>
            </div>
            <div className="why-content home-reveal home-reveal--delay-100">
              <SiteMediaContent mediaKey="home.quality.professional" alt="PROFESSIONAL EXPERIENCE" />
              <h2>
                PROFESSIONAL
                <br />
                EXPERIENCE
              </h2>
              <p>
                A comfortable studio experience with a team that guides you
                throughout the shoot
              </p>
            </div>
            <div className="why-content home-reveal home-reveal--delay-150">
              <SiteMediaContent mediaKey="home.quality.comfort" alt="COMFORTABLE STUDIO" />
              <h2>
                COMFORTABLE
                <br />
                STUDIO
              </h2>
              <p>Private and comfortable environment</p>
            </div>
            <div className="why-content home-reveal home-reveal--delay-200">
              <SiteMediaContent mediaKey="home.quality.beauty" alt="BEAUTIFUL RESULTS" />
              <h2>
                BEAUTIFUL
                <br />
                RESULTS
              </h2>
              <p>Images designed to look polished, flattering, and timeless</p>
            </div>
          </div>
        </section>
        <section className="body-margin">
          <div className="about-section" id="about">
            <div className="about-left home-reveal">
              <h1 className="about-header">ABOUT US</h1>
              <p>
                Big Space Studio is a premier photography studio that
                specializes in capturing life's most precious moments. Our team
                of experienced photographers and state-of-the-art equipment
                ensure that every shot is perfect, from lighting to composition.
                We pride ourselves on providing a comfortable and professional
                environment for our clients, making sure that every session is
                enjoyable and stress-free.
              </p>
              <hr></hr>
              <h2>MISSION</h2>
              <p>
                Our mission is to provide our clients with high-quality,
                timeless images that they will cherish for a lifetime. We strive
                to create a welcoming and comfortable environment where our
                clients can feel at ease and confident in front of the camera.
              </p>
              <h2>VISION</h2>
              <p>
                Our vision is to be the leading photography studio in the
                industry, known for our exceptional quality, professionalism,
                and customer service. We aim to continue to innovate and evolve
                with the latest trends and technology in photography, while
                staying true to our core values of excellence and client
                satisfaction.
              </p>
            </div>
            <div className="about-right home-reveal home-reveal--delay-100">
              <SiteMediaContent mediaKey="home.about" alt="About Us" className="about-image" />
            </div>
          </div>
        </section>
        <section className="body-margin">
          <div className="milestone-section">
            <div className="milestone-left home-reveal">
              <SiteMediaContent mediaKey="home.milestones" alt="Big Space Studio milestones" className="about-image" />
            </div>
            <div className="milestone-right home-reveal home-reveal--delay-100">
              <h1 className="milestone-header">MILESTONES</h1>
              <p>1k+ clients served</p>
              <p>10k+ photoshoots</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
