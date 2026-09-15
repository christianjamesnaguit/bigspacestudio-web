import './home.css'
import Header from './components/header.tsx'
import Footer from './components/footer.tsx'

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
                            <a href="/book" className="nav-button">Book Now!</a>
                            <a href="/portfolio" className="nav-button">View Our Work</a>
                        </div>
                    </div>
                    <div>
                        <img src="/hero-image.png" alt="Hero" />
                    </div>
                </div>
            </div>
        <Footer />
        </>
    )
}

export default Home