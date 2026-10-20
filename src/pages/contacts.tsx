import "./styles/contacts.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import SiteMediaContent from "../api/site-media-content";

function Contacts() {
  const contactsRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  useScrollReveal(contactsRef);
  useScrollReveal(formRef);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const { VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY } = import.meta.env;
    if (!VITE_EMAILJS_SERVICE_ID || !VITE_EMAILJS_TEMPLATE_ID || !VITE_EMAILJS_PUBLIC_KEY) {
      setFeedback({
        type: "error",
        message: "The contact form is not configured yet. Please contact us by email instead.",
      });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    try {
      await emailjs.send(
        VITE_EMAILJS_SERVICE_ID,
        VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.get("name"),
          from_email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        },
        { publicKey: VITE_EMAILJS_PUBLIC_KEY },
      );
      form.reset();
      setFeedback({ type: "success", message: "Your message has been sent. We'll be in touch soon." });
    } catch (error) {
      console.error("Failed to send contact form message:", error);
      setFeedback({ type: "error", message: "We couldn't send your message. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <section className="body-margin" ref={contactsRef}>
        <div className="contact-hero home-reveal">
          <SiteMediaContent mediaKey="contact.background" className="contact-hero-background" />
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
                  <SiteMediaContent mediaKey="social.facebook" className="contact-hero-social-logo" alt="" />
                  <span className="contact-hero-social-handle">@bigspacestudio</span>
                </a>
                <a
                  className="contact-hero-social-link"
                  href="https://m.me/bigspacestudio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiteMediaContent mediaKey="social.messenger" className="contact-hero-social-logo" alt="" />
                  <span className="contact-hero-social-handle">Big Space Studio</span>
                </a>
                <a
                  className="contact-hero-social-link"
                  href="https://www.instagram.com/bigspacestudio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiteMediaContent mediaKey="social.instagram" className="contact-hero-social-logo" alt="" />
                  <span className="contact-hero-social-handle">@bigspacestudio</span>
                </a>
                <a
                  className="contact-hero-social-link"
                  href="https://www.tiktok.com/@bigspace.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiteMediaContent mediaKey="social.tiktok" className="contact-hero-social-logo" alt="" />
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
              <SiteMediaContent mediaKey="contact.icon.building" alt="Building" />
              <p>2nd Floor, Franches Building, <br></br>Santo Rosario St, San Jose,{" "}
                <br></br>Angeles, Pampanga</p>
            </div>
            <hr></hr>
            <div className="studio-detail">
              <SiteMediaContent mediaKey="contact.icon.hours" alt="Clock" />
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
            <form onSubmit={handleSubmit}>
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
              {feedback && (
                <p className={`contact-form-feedback contact-form-feedback--${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>
                  {feedback.message}
                </p>
              )}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send message"}
              </button>
            </form>
          </div>
      </section>
      <Footer />
    </>
  );
}

export default Contacts;
