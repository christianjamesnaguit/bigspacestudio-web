import './styles.css'

function Header() {
    return (
        <>
        <header>
            <img src="/logo.png" alt="Logo" className="logo" />
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/services">Services & Packages</a></li>
                    <li><a href="/portfolio">Portfolio</a></li>
                    <li><a href="/faq">FAQs</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </nav>
        </header>
        </>
    )
}

export default Header