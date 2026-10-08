import "./styles.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../api/use-auth";
import Login from "../pages/dashboard/login";

function Header() {
  const { user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <header>
        <div className="header-margin">
          <img src="/src/assets/logo.jpg" alt="Logo" className="logo" />
          <nav>
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
          <nav>
            <ul className="account-nav">
              {user ? (
                <li>
                  <Link to="/admin">Admin</Link>
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
      </header>
      {isLoginOpen && <Login modal onClose={() => setIsLoginOpen(false)} />}
    </>
  );
}

export default Header;
