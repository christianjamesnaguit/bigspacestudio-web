import { useRef, useState } from "react";
import "./styles/faq.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import { useScrollReveal } from "../hooks/use-scroll-reveal";

const faqCategories = {
  BOOKING: [
    ["How do I book a session?", "You can book a session through our booking page."],
    ["Do you accept walk-ins?", "Walk-ins are subject to studio availability, so booking ahead is recommended."],
    ["How early should I book?", "We recommend booking at least one week in advance."],
  ],
  PAYMENT: [
    ["What payment methods do you accept?", "We accept major cards and other available payment options at checkout."],
    ["Is the reservation fee refundable?", "Reservation fees follow the terms in our booking policy."],
    ["When is the balance due?", "The remaining balance is due before the session begins."],
  ],
  STUDIO: [
    ["What is included with the studio rental?", "Your rental includes the selected studio space and included equipment."],
    ["Can I bring a production team?", "You can bring your production team within the booking capacity."],
    ["Do you provide equipment?", "Available equipment depends on the studio package you choose."],
  ],
  SHOOT: [
    ["Can I schedule a photo shoot?", "Our studio can be booked for photo and video shoots."],
    ["Can I bring my own photographer?", "You are welcome to bring your own photographer or creative team."],
    ["How long can a shoot last?", "Shoot length depends on the package and studio availability."],
  ],
  DELIVERY: [
    ["When will I receive my files?", "Delivery timing depends on the selected service and project scope."],
    ["How are files delivered?", "Completed files are delivered through a digital download link."],
    ["Can I request revisions?", "Revision options depend on the service included in your booking."],
  ],
  POLICIES: [
    ["What is your cancellation policy?", "Cancellation terms are outlined in our booking policy."],
    ["Can I reschedule my session?", "Rescheduling requests are handled according to availability and policy."],
    ["Where can I read your studio policies?", "Our current studio policies are available before you confirm a booking."],
  ],
} as const;

type FaqCategory = keyof typeof faqCategories;

function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>("BOOKING");
  const faqRef = useRef<HTMLElement>(null);
  useScrollReveal(faqRef);

  return (
    <>
      <Header />
      <main className="body-margin" ref={faqRef}>
        <div className="faq-section">
          <div className="faq-left home-reveal">
            <h1 className="faq-header">FREQUENTLY ASKED QUESTIONS</h1>
            <p>This section provides answers to the most common questions about our services.</p>
            <label htmlFor="faq-category">Choose a category</label>
            <select
              id="faq-category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as FaqCategory)}
            >
              {Object.keys(faqCategories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="faq-list">
              {faqCategories[selectedCategory].map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}</summary>
                  <div className="faq-answers">
                    <p>{answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
          <div className="faq-right home-reveal home-reveal--delay-100">
            <img src="/images/photo3.jpg" alt="Big Space Studio" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default FAQ;
