import './home.css'
import Header from '../components/header.tsx'
import Footer from '../components/footer.tsx'

function Home() {
    return (
        <>
        <Header />
        <div className="container">
            <h1>Welcome to the Home Page</h1>
            <p>This is the home page of our application.</p>
        </div>
        <Footer />
        </>
    )
}

export default Home