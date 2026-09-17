import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import About from "./pages/about";
import Services from "./pages/services";
import Portfolio from "./pages/portfolio";
import Contacts from "./pages/contacts";
import Booking from "./pages/booking";

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/booking" element={<Booking />} />
    </Routes>
  );
}

export default Routing;