import "./styles/contacts.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import { useRef } from "react";
import { useScrollReveal } from "../hooks/use-scroll-reveal";

function Contacts() {
  const contactsRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);
  useScrollReveal(contactsRef);
  useScrollReveal(formRef);

  return (
    <>
      <Header />
      <section className="body-margin" ref={contactsRef}>
        <div className="contact-hero home-reveal">
          <div className="contact-hero-intro">
            <h1 className="contact-header">We're here to help.</h1>
          </div>
          <div className="contact-hero-contact">
            <div className="contact-hero-socials">
              <p className="contact-hero-label">Social media</p>
              <div className="contact-hero-social-list">
                <a
                  className="contact-hero-social-link"
                  href="https://www.facebook.com/bigspacestudio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img className="contact-hero-social-logo" src="/src/assets/facebook.png" alt="" />
                  <span className="contact-hero-social-handle">@bigspacestudio</span>
                </a>
                <a
                  className="contact-hero-social-link"
                  href="https://m.me/bigspacestudio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img className="contact-hero-social-logo" src="/src/assets/messenger.png" alt="" />
                  <span className="contact-hero-social-handle">Big Space Studio</span>
                </a>
                <a
                  className="contact-hero-social-link"
                  href="https://www.instagram.com/bigspacestudio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img className="contact-hero-social-logo" src="/src/assets/instagram.png" alt="" />
                  <span className="contact-hero-social-handle">@bigspacestudio</span>
                </a>
                <a
                  className="contact-hero-social-link"
                  href="https://www.tiktok.com/@bigspace.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img className="contact-hero-social-logo" src="/src/assets/tiktok.png" alt="" />
                  <span className="contact-hero-social-handle">@bigspace.studio</span>
                </a>
              </div>
            </div>
            <div className="contact-hero-details">
              <a className="contact-hero-link" href="mailto:info@company.com">
                <span className="contact-hero-label">Email</span>
                <span>info@company.com</span>
              </a>
              <a className="contact-hero-link" href="tel:1234567890">
                <span className="contact-hero-label">Phone</span>
                <span>(123) 456-7890</span>
              </a>
            </div>
          </div>
        </div>
        <div className="flex-container">
          <div className="contact-info home-reveal">
            <div className="main-header">
              <h2>Business Information</h2>
            </div>
            <hr />
            <div className="studio-detail">
              <img src="/src/assets/icons/building.svg" alt="Building" />
              <p>2nd Floor, Franches Building, <br></br>Santo Rosario St, San Jose,{" "}
                <br></br>Angeles, Pampanga</p>
            </div>
            <hr></hr>
            <div className="studio-detail">
              <img src="/src/assets/icons/hourglass.svg" alt="Clock" />
              <p>Monday - Saturday <br />9:00 AM - 5:00 PM</p>
            </div>
          </div>
          <div className="maps home-reveal home-reveal--delay-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3851.4791863796663!2d120.59099577588056!3d15.132006163844105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396f30014b3d4f7%3A0x92f18fdab4527e58!2sBig%20Space%20Studio!5e0!3m2!1sen!2sph!4v1791448508532!5m2!1sen!2sph"
              title="Big Space Studio location"
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </section>
      <section className="body-margin" ref={formRef}>
          <div className="contact-form home-reveal">
            <h2>Still have questions? Send us a message and let us know.</h2>
            <form>
              <div className="form-row">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" autoComplete="name" required />
              </div>
              <div className="form-row">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="subject">Subject</label>
                <input id="subject" name="subject" type="text" required />
              </div>
              <div className="form-row">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={6} required />
              </div>
              <button type="submit">Send message</button>
            </form>
          </div>
      </section>
      <Footer />
    </>
  );
}

export default Contacts;
