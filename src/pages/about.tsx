import './styles/about.css'
import Header from '../components/header.tsx'
import Footer from '../components/footer.tsx'

function About() {
    return (
        <>
        <Header />
            <div className="body-margin">
                <p>this is the about page</p>
            </div>
        <Footer />
        </>
    )
}

export default About