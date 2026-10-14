import { Link } from "react-router-dom";
import "./styles.css";

function Footer() {
  return (
    <>
      <footer>
        <div className="footer-margin mobile-hidden">
          <div className="top-content">
            <h1 className="company-name">BIG SPACE STUDIO.</h1>
            <ul className="socials">
              <li>
                <a href="https://www.facebook.com/bigspacestudio/" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/src/assets/facebook.png"
                    alt="Social"
                    className="social"
                  />
                </a>
              </li>
              <li>
                <a href="https://www.tiktok.com/@bigspace.studio" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/src/assets/tiktok.png"
                    alt="Social"
                    className="social"
                  />
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/bigspacestudio/" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/src/assets/instagram.png"
                    alt="Social"
                    className="social"
                  />
                </a>
              </li>
              <li>
                <Link to="/booking" className="nav-button">
                  Book Now!
                </Link>
              </li>
            </ul>
          </div>
          <hr></hr>
          <div className="bot-content">
            <ul className="quick-link">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/services">Services</Link>
              </li>
              <li>
                <Link to="/portfolio">Portfolio</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
              <li>
                <Link to="/contacts">Contact</Link>
              </li>
            </ul>
            <ul className="quick-link">
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Booking Policy</a>
              </li>
              <li>
                <a href="#">Cancellation Policy</a>
              </li>
              <li>
                <a href="#">Rescheduling Policy</a>
              </li>
            </ul>
            <p className="address">
              2nd Floor, Franches Building, <br></br>Santo Rosario St, San Jose,{" "}
              <br></br>Angeles, Pampanga
            </p>
            <ul className="contacts">
              <li>
                <img
                  src="/src/assets/icons/phone.svg"
                  alt="Phone"
                  className="contact"
                />{" "}
                +63 0912 345 6789
              </li>
              <li>
                <img
                  src="/src/assets/icons/email.svg"
                  alt="Email"
                  className="contact"
                />{" "}
                Bigspace@gmail.com
              </li>
            </ul>
          </div>
          <p className="copyright">
            &copy; 2026 Big Space Studio. All rights reserved.
          </p>
        </div>
        <div className="footer-mobile-layout mobile-only">
          <div className="mobile-footer-overview">
            <h2 className="mobile-footer-brand" aria-label="Big Space Studio">
              <span>BIG</span>
              <span>SPACE</span>
              <span>STUDIO.</span>
            </h2>
            <div className="mobile-footer-details">
              <p className="mobile-footer-address">
                2nd Floor, Franches Building,
                <br />
                Santo Rosario St, San Jose,
                <br />
                Angeles, Pampanga
              </p>
              <ul className="mobile-footer-contacts">
                <li>
                  <img src="/src/assets/icons/phone.svg" alt="" />
                  <span>+63 0912 345 6789</span>
                </li>
                <li>
                  <img src="/src/assets/icons/email.svg" alt="" />
                  <span>Bigspace@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          <hr className="mobile-footer-divider" />
          <div className="mobile-footer-links">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/#about">About</Link></li>
              <li><Link to="/services">Packages</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/contacts">Contact</Link></li>
              <li><Link to="/booking">Book Now</Link></li>
            </ul>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Booking Policy</a></li>
              <li><a href="#">Cancellation Policy</a></li>
              <li><a href="#">Rescheduling Policy</a></li>
            </ul>
          </div>
          <p className="mobile-footer-copyright">
            &copy; 2026 Big Space Studio. All Rights Reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
