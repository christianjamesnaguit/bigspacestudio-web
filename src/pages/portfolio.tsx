import "./styles/portfolio.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";

function Portfolio() {
  return (
    <>
      <Header />
      <section className="body-margin">
        <div className="feature-section">
          <div className="feature-grid">
            <img
              src="/template-grid.png"
              alt="About Us"
              className="grid-item"
            />
            <img
              src="/template-grid.png"
              alt="About Us"
              className="grid-item"
            />
            <img
              src="/template-grid.png"
              alt="About Us"
              className="grid-item"
            />
            <img
              src="/template-grid.png"
              alt="About Us"
              className="grid-item"
            />
          </div>
          <div className="feature-whole">
            <img src="/template.png" alt="About Us" className="whole-item" />
          </div>
        </div>
      </section>
      <section className="body-margin">
        <div className="feature-section">
          <div className="feature-whole">
            <img src="/template.png" alt="About Us" className="whole-item" />
          </div>
          <div className="feature-grid">
            <img
              src="/template-grid.png"
              alt="About Us"
              className="grid-item"
            />
            <img
              src="/template-grid.png"
              alt="About Us"
              className="grid-item"
            />
            <img
              src="/template-grid.png"
              alt="About Us"
              className="grid-item"
            />
            <img
              src="/template-grid.png"
              alt="About Us"
              className="grid-item"
            />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Portfolio;
