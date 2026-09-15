import './styles.css'

function Footer() {
    return (
        <>
            <footer>
                <div className="footer-margin">
                    <div className="top-content">
                        <img src="/logo.png" alt="Logo" className="logo" />
                        <ul className="socials">
                            <li><a href="#"><img src="/src/assets/facebook.png" alt="Social" className="social" /></a></li>
                            <li><a href="#"><img src="/src/assets/tiktok.png" alt="Social" className="social" /></a></li>
                            <li><a href="#"><img src="/src/assets/instagram.png" alt="Social" className="social" /></a></li>
                            <li><a href="/src/pages/book" className="nav-button">Book Now!</a></li>
                        </ul>
                    </div>
                    <hr></hr>
                    <div className="bot-content">
                        <ul className="quick-link">
                            <li><a href="/src/pages/home">Home</a></li>
                            <li><a href="/src/pages/about">About</a></li>
                            <li><a href="/src/pages/services">Services</a></li>
                            <li><a href="/src/pages/portfolio">Portfolio</a></li>
                            <li><a href="/src/pages/faq">FAQs</a></li>
                            <li><a href="/src/pages/contact">Contact</a></li>
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