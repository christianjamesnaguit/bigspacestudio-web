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
            <p>2nd Floor, Franches Building, <br></br>Santo Rosario St, San Jose,{" "}
              <br></br>Angeles, Pampanga</p>
            <hr></hr>
            <div className="headers">
              <img src="/src/assets/icons/hourglass.svg" alt="Clock" />
              <h3>Business Hours</h3>
            </div>
            <p>Monday - Friday <br />9:00 AM - 5:00 PM</p>
          </div>
          <div className="maps">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3851.4791863796663!2d120.59099577588056!3d15.132006163844105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396f30014b3d4f7%3A0x92f18fdab4527e58!2sBig%20Space%20Studio!5e0!3m2!1sen!2sph!4v1791448508532!5m2!1sen!2sph"
              title="Big Space Studio location"
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </section>
      <section className="body-margin">
        <div className="flex-container">
          <div className="contact-info">
            <div className="main-header">
              <img src="/src/assets/icons/clipboard.svg" alt="Clipboard" />
              <h2>Social Media</h2>
            </div>
            <hr />
            <div className="headers">
              <img src="/src/assets/icons/email.svg" alt="Email" />
              <h3>Facebook</h3>
            </div>
            <p>www.facebook.com/bigspacestudio</p>
            <hr></hr>
            <div className="headers">
              <img src="/src/assets/icons/phone.svg" alt="Phone" />
              <h3>Messenger</h3>
            </div>
            <p>Big Space Studio</p>
            <hr></hr>
            <div className="headers">
              <img src="/src/assets/icons/building.svg" alt="Building" />
              <h3>Instagram</h3>
            </div>
            <p>www.instagram.com/bigspacestudio</p>
            <hr></hr>
            <div className="headers">
              <img src="/src/assets/icons/hourglass.svg" alt="Clock" />
              <h3>Tiktok</h3>
            </div>
            <p>www.tiktok.com/@bigspacestudio</p>
          </div>  
          <div className="contact-form">
            <h2>Send us a message</h2>
            <form>
              <div className="form-row">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" autoComplete="name" required />
              </div>
              <div className="form-row">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="subject">Subject</label>
                <input id="subject" name="subject" type="text" required />
              </div>
              <div className="form-row">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={6} required />
              </div>
              <button type="submit">Send message</button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Contacts;
