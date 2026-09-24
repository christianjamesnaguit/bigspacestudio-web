import "./styles/contacts.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";

function Contacts() {
  return (
    <>
      <Header />
      <section className="body-margin">
        <h1 className="contact-header">We're here to help.</h1>
        <div className="flex-container">
          <div className="contact-info">
            <div className="main-header">
              <img src="/src/assets/icons/clipboard.svg" alt="Clipboard" />
              <h2>Studio Information</h2>
            </div>
            <hr />
            <div className="headers">
              <img src="/src/assets/icons/email.svg" alt="Email" />
              <h3>Email Address</h3>
            </div>
            <p>info@company.com</p>
            <hr></hr>
            <div className="headers">
              <img src="/src/assets/icons/phone.svg" alt="Phone" />
              <h3>Phone Number</h3>
            </div>
            <p>(123) 456-7890</p>
            <hr></hr>
            <div className="headers">
              <img src="/src/assets/icons/building.svg" alt="Building" />
              <h3>Business Location</h3>
            </div>
            <p>123 Main Street, City, State, ZIP</p>
            <hr></hr>
            <div className="headers">
              <img src="/src/assets/icons/hourglass.svg" alt="Clock" />
              <h3>Business Hours</h3>
            </div>
            <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
          </div>
          <div className="chatbot">
            <p>chatbot work in progress</p>
          </div>
        </div>
      </section>
      <section className="body-margin">
        <div className="contact-form"></div>
      </section>
      <Footer />
    </>
  );
}

export default Contacts;
