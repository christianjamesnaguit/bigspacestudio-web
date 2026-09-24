import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import Carousel from "../components/carousel.tsx";
import { Link } from "react-router-dom";
import "./styles/home.css";

function Home() {
  return (
    <>
      <Header />
      <section className="body-margin main-section">
        <div className="hero-section">
          <div className="hero-left">
            <div className="hero-text">
              <h1>
                The Perfect Space for <br></br>Life's Biggest Moments.
              </h1>
              <p>This is the home page of our application.</p>
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
          <div className="hero-right">
            <Carousel />
          </div>
        </div>
      </section>
      <section className="body-margin sub-section">
        <h1 className="why-header">WHY CHOOSE BIG SPACE STUDIO?</h1>
        <div className="why-section">
          <div className="why-content">
            <img src="/src/assets/premium.png" alt="PREMIUM QUALITY" />
            <h2>
              PREMIUM
              <br />
              QUALITY
            </h2>
            <p>Professional lighting, equipment, and retouching</p>
          </div>
          <div className="why-content">
            <img
              src="/src/assets/professional.png"
              alt="PROFESSIONAL EXPERIENCE"
            />
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
          <div className="why-content">
            <img src="/src/assets/comfort.png" alt="COMFORTABLE STUDIO" />
            <h2>
              COMFORTABLE
              <br />
              STUDIO
            </h2>
            <p>Private and comfortable environment</p>
          </div>
          <div className="why-content">
            <img src="/src/assets/beauty.png" alt="BEAUTIFUL RESULTS" />
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
          <div className="about-left">
            <h1 className="about-header">ABOUT US</h1>
            <p>
              Big Space Studio is a premier photography studio that specializes
              in capturing life's most precious moments. Our team of experienced
              photographers and state-of-the-art equipment ensure that every
              shot is perfect, from lighting to composition. We pride ourselves
              on providing a comfortable and professional environment for our
              clients, making sure that every session is enjoyable and
              stress-free.
            </p>
            <hr></hr>
            <h2>MISSION</h2>
            <p>
              Our mission is to provide our clients with high-quality, timeless
              images that they will cherish for a lifetime. We strive to create
              a welcoming and comfortable environment where our clients can feel
              at ease and confident in front of the camera.
            </p>
            <h2>VISION</h2>
            <p>
              Our vision is to be the leading photography studio in the
              industry, known for our exceptional quality, professionalism, and
              customer service. We aim to continue to innovate and evolve with
              the latest trends and technology in photography, while staying
              true to our core values of excellence and client satisfaction.
            </p>
          </div>
          <div className="about-right">
            <img src="/template.png" alt="About Us" className="about-image" />
          </div>
        </div>
      </section>
      <section className="body-margin">
        <div className="milestone-section">
          <div className="milestone-left">
            <img src="/template.png" alt="About Us" className="about-image" />
          </div>
          <div className="milestone-right">
            <h1 className="milestone-header">MILESTONES</h1>
            <p>1k+ satisfied clients</p>
            <hr></hr>
            <p>10k+ photoshoots</p>
          </div>
        </div>
      </section>
      <section className="body-margin">
        <div className="faq-section">
          <div className="faq-left">
            <h1 className="faq-header">FREQUENTLY ASKED QUESTIONS</h1>
          </div>
          <div className="faq-right">
            <details>
              <summary>What is your pricing?</summary>
              <div className="faq-answers">
                <p>
                  Our pricing varies depending on the type of session and the
                  length of time. Please contact us for a quote.
                </p>
              </div>
            </details>
            <details>
              <summary>What is your return policy?</summary>
              <div className="faq-answers">
                <p>
                  Our return policy is as follows: If you are not satisfied with
                  your purchase, you can return it within 30 days for a full
                  refund.
                </p>
              </div>
            </details>
            <details>
              <summary>How long does it take to receive my order?</summary>
              <div className="faq-answers">
                <p>
                  Our orders are typically processed within 1-2 business days.
                  Shipping times may vary depending on your location and the
                  shipping method chosen.
                </p>
              </div>
            </details>
            <details>
              <summary>What is your shipping policy?</summary>
              <div className="faq-answers">
                <p>
                  Our shipping policy is as follows: We ship worldwide and the
                  shipping cost will be calculated at checkout.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Home;
