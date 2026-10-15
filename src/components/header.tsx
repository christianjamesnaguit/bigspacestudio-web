import "./styles.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../api/use-auth";
import Login from "../pages/dashboard/login";

function Header() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <header>
        <div className="header-margin">
          <img src="/src/assets/logo.jpg" alt="Logo" className="logo" />
          <nav className="desktop-navigation desktop-only">
            <ul className="primary-nav">
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
          </nav>
          <nav className="desktop-navigation desktop-only">
            <ul className="account-nav">
              {user ? (
                <li>
                  <Link to="/admin">Dashboard</Link>
                </li>
              ) : (
                <>
                  <li>
                    <button className="header-link" type="button" onClick={() => setIsLoginOpen(true)}>
                      Login
                    </button>
                  </li>
                </>
              )}
              <li>
                <Link to="/booking" className="nav-button">
                  Book Now!
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <nav className="mobile-navigation mobile-only--flex tablet-only--flex" aria-label="Mobile navigation">
          <button
            className={isMenuOpen ? "mobile-menu-toggle open" : "mobile-menu-toggle"}
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>
          <div
            id="mobile-menu"
            className={isMenuOpen ? "mobile-menu open" : "mobile-menu"}
            aria-hidden={!isMenuOpen}
            inert={!isMenuOpen}
          >
            <ul>
              <li><Link to="/" onClick={closeMenu}>Home</Link></li>
              <li><Link to="/services" onClick={closeMenu}>Services</Link></li>
              <li><Link to="/portfolio" onClick={closeMenu}>Portfolio</Link></li>
              <li><Link to="/faq" onClick={closeMenu}>FAQ</Link></li>
              <li><Link to="/contacts" onClick={closeMenu}>Contact</Link></li>
              {user && <li><Link to="/admin" onClick={closeMenu}>Dashboard</Link></li>}
              {!user && (
                <li>
                  <Link to="/login" className="header-link" onClick={closeMenu}>
                    Login
                  </Link>
                </li>
              )}
              <li><Link to="/booking" className="nav-button" onClick={closeMenu}>Book Now!</Link></li>
            </ul>
          </div>
        </nav>
      </header>
      {isLoginOpen && <Login modal onClose={() => setIsLoginOpen(false)} />}
    </>
  );
}

export default Header;
