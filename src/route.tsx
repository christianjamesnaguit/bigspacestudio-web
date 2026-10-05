import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Services from "./pages/services";
import Portfolio from "./pages/portfolio";
import FAQ from "./pages/faq";
import Contacts from "./pages/contacts";
import Booking from "./pages/booking";
import Admin from "./pages/dashboard/admin/admin";
import Books from "./pages/dashboard/admin/books";
import Customers from "./pages/dashboard/admin/customers";
import Schedules from "./pages/dashboard/admin/schedules";
import Login from "./pages/dashboard/login";
import Signup from "./pages/dashboard/signup";
import Recover from "./pages/dashboard/recover";

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/books" element={<Books />} />
      <Route path="/admin/customers" element={<Customers />} />
      <Route path="/admin/schedules" element={<Schedules />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/recover" element={<Recover />} />
    </Routes>
  );
}

export default Routing;
