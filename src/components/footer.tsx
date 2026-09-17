import { Link } from 'react-router-dom'
import './styles.css'

function Footer() {
    return (
        <>
            <footer>
                <div className="footer-margin">
                    <div className="top-content">
                        <h1 className="company-name">BIG SPACE STUDIO.</h1>
                        <ul className="socials">
                            <li><a href="#"><img src="/src/assets/facebook.png" alt="Social" className="social" /></a></li>
                            <li><a href="#"><img src="/src/assets/tiktok.png" alt="Social" className="social" /></a></li>
                            <li><a href="#"><img src="/src/assets/instagram.png" alt="Social" className="social" /></a></li>
                            <li><Link to="/booking" className="nav-button">Book Now!</Link></li>
                        </ul>
                    </div>
                    <hr></hr>
                    <div className="bot-content">
                        <ul className="quick-link">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/services">Services</Link></li>
                            <li><Link to="/portfolio">Portfolio</Link></li>
                            <li><Link to="/contacts">Contact</Link></li>
                        </ul>
                        <ul className="quick-link">
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                            <li><a href="#">Booking Policy</a></li>
                            <li><a href="#">Cancellation Policy</a></li>
                            <li><a href="#">Rescheduling Policy</a></li>
                        </ul>
                        <p className="address">2nd Floor, Franches Building, <br></br>Santo Rosario St, San Jose, <br></br>Angeles, Pampanga</p>
                        <ul className="contacts">
                            <li><img src="/src/assets/call.svg" alt="Number" className="contact" /> +63 0912 345 6789</li>
                            <li><img src="/src/assets/mail.svg" alt="Email" className="contact" /> placeholderemail@example.com</li>
                        </ul>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer