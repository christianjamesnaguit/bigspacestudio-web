import { useEffect, useMemo, useRef, useState } from "react";
import "./styles/faq.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import SiteMediaContent from "../api/site-media-content";
import { getApiError } from "../api/auth";
import { getFaqs } from "../api/faqs";
import type { FaqItem } from "../api/faqs";

function FAQ() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const faqRef = useRef<HTMLElement>(null);
  useScrollReveal(faqRef);
  const categories = useMemo(() => [...new Set(faqs.map((faq) => faq.category))], [faqs]);
  const categoryFaqs = faqs
    .filter((faq) => faq.category === selectedCategory)
    .sort((first, second) => first.sort_order - second.sort_order || first.id - second.id);

  useEffect(() => {
    let active = true;
    getFaqs()
      .then((items) => {
        if (!active) return;
        setFaqs(items);
        setSelectedCategory(items[0]?.category ?? "");
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiError(requestError, "Unable to load FAQs."));
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <Header />
      <main className="body-margin" ref={faqRef}>
        <div className="faq-section">
          <div className="faq-left home-reveal">
            <h1 className="faq-header">FREQUENTLY ASKED QUESTIONS</h1>
            <p>This section provides answers to the most common questions about our services.</p>
            {isLoading ? <p role="status">Loading questions...</p> : error ? (
              <p role="alert">{error}</p>
            ) : categories.length === 0 ? (
              <p>No frequently asked questions are available right now.</p>
            ) : (
              <>
                <label htmlFor="faq-category">Choose a category</label>
                <select
                  id="faq-category"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <div className="faq-list">
                  {categoryFaqs.map((faq) => (
                    <details key={faq.id}>
                      <summary>{faq.summary}</summary>
                      <div className="faq-answers"><p>{faq.detail}</p></div>
                    </details>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="faq-right home-reveal home-reveal--delay-100">
            <SiteMediaContent mediaKey="faq.image" alt="Big Space Studio" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default FAQ;
