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
            <h2>Service 1</h2>
            <p className="service-subtitle">100 PHP</p>
            <p>Description of Service 1</p>
            <Link to="/#" className="nav-button">
              Book Now!
            </Link>
          </div>
          <div className="service-item">
            <h2>Service 2</h2>
            <p className="service-subtitle">1,000 PHP</p>
            <p>Description of Service 2</p>
            <p>Inclusions of Service 2</p>
            <p>Inclusions of Service 2</p>
            <Link to="/#" className="nav-button">
              Book Now!
            </Link>
          </div>
          <div className="service-item">
            <h2>Service 3</h2>
            <p className="service-subtitle">10,000 PHP</p>
            <p>Description of Service 3</p>
            <p>Inclusions of Service 3</p>
            <p>Inclusions of Service 3</p>
            <p>Add-ons of Service 3</p>
            <p>Add-ons of Service 3</p>
            <Link to="/#" className="nav-button">
              Book Now!
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Services;
