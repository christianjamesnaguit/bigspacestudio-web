import './styles/home.css'
import Header from '../components/header.tsx'
import Footer from '../components/footer.tsx'
import { Link } from 'react-router-dom'

function Home() {
    return (
        <>
        <Header />
            <div className="body-margin">
                <div className="hero-section">
                    <div>
                        <div className="hero-text">
                            <h1>Welcome to the Home Page</h1>
                            <p>This is the home page of our application.</p>
                        </div>
                        <div className="cta-buttons">
                            <Link to="/booking" className="nav-button">Book Now!</Link>
                            <Link to="/portfolio"  className="nav-button">View Our Work</Link>
                        </div>
                    </div>
                    <div>
                        <img src="/src/assets/hero-image.jpg" alt="Hero" className="hero-image" />
                    </div>
                </div>
            </div>
        <Footer />
        </>
    )
}

export default Home