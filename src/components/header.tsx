import './styles.css'

function Header() {
    return (
        <>
        <header>
            <div className="header-margin">
                <img src="/logo.png" alt="Logo" className="logo" />
                <nav>
                    <ul>
                        <li><a href="/src/">Home</a></li>
                        <li><a href="/src/about">About</a></li>
                        <li><a href="/src/services">Services</a></li>
                        <li><a href="/src/portfolio">Portfolio</a></li>
                        <li><a href="/src/faq">FAQs</a></li>
                        <li><a href="/src/contact">Contact</a></li>
                        <li><a href="/src/book" className="nav-button">Book Now!</a></li>
                    </ul>
                </nav>
            </div>
        </header>
        </>
    )
}

export default Header