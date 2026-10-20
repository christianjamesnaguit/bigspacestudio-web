import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "./api/use-auth";

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
import Settings from "./pages/dashboard/admin/settings";
import Staff from "./pages/dashboard/admin/staff";
import StaffEdit from "./pages/dashboard/admin/staff-edit";
import Media from "./pages/dashboard/admin/media";
import Login from "./pages/dashboard/login";
import Signup from "./pages/dashboard/signup";
import Recover from "./pages/dashboard/recover";
import { Forbidden, NotFound, ServerError } from "./pages/errors";

function DashboardRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return user?.role === "Admin" || user?.role === "Staff"
    ? children
    : <Navigate to={user ? "/403" : "/login"} replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return user?.role === "Admin" ? children : <Navigate to={user ? "/403" : "/login"} replace />;
}

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/admin" element={<DashboardRoute><Admin /></DashboardRoute>} />
      <Route path="/admin/books" element={<DashboardRoute><Books /></DashboardRoute>} />
      <Route path="/admin/customers" element={<DashboardRoute><Customers /></DashboardRoute>} />
      <Route path="/admin/schedules" element={<DashboardRoute><Schedules /></DashboardRoute>} />
      <Route path="/admin/settings" element={<DashboardRoute><Settings /></DashboardRoute>} />
      <Route path="/admin/staff" element={<AdminRoute><Staff /></AdminRoute>} />
      <Route path="/admin/staff/new" element={<AdminRoute><StaffEdit /></AdminRoute>} />
      <Route path="/admin/staff/:id/edit" element={<AdminRoute><StaffEdit /></AdminRoute>} />
      <Route path="/admin/media" element={<AdminRoute><Media /></AdminRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/recover" element={<Recover />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Routing;
