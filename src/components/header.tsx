import './styles.css'
import { Link } from "react-router-dom";

function Header() {
    return (
        <>
        <header>
            <div className="header-margin">
                <img src="/src/assets/logo.jpg" alt="Logo" className="logo" />
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/services">Services</Link></li>
                        <li><Link to="/portfolio">Portfolio</Link></li>
                        <li><Link to="/contacts">Contact</Link></li>
                        <li><Link to="/booking" className="nav-button">Book Now!</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
        </>
    )
}

export default Header