import "./styles/services.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import { Link } from "react-router-dom";

function Services() {
  return (
    <>
      <Header />
      <section className="body-margin">
        <h1 className="service-header">Our Services</h1>
        <hr></hr>
        <div className="services-container">
          <div className="service-item">
            <p className="service-subtitle">1 pax</p>
            <h2>Service 1</h2>
            <Link to="/#" className="nav-button">
              Book Now!
            </Link>
            <p>Description of Service 1</p>
          </div>
          <div className="service-item">
            <p className="service-subtitle">1 pax</p>
            <h2>Service 2</h2>
            <Link to="/#" className="nav-button">
              Book Now!
            </Link>
            <p>Description of Service 2</p>
            <p>Description of Service 2</p>
            <p>Description of Service 2</p>
          </div>
          <div className="service-item">
            <p className="service-subtitle">1 pax</p>
            <h2>Service 3</h2>
            <Link to="/#" className="nav-button">
              Book Now!
            </Link>
            <p>Description of Service 3</p>
            <p>Description of Service 3</p>
            <p>Description of Service 3</p>
            <p>Description of Service 3</p>
            <p>Description of Service 3</p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Services;
