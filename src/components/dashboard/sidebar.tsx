import "./styles.css";
import { Link, NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="dashboard-sidebar">
      <Link className="sidebar-brand" to="/admin">
        BIG SPACE STUDIO
      </Link>

      <nav className="sidebar-nav" aria-label="Admin navigation">
        <NavLink
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
          to="/admin"
        >
          Dashboard
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
          to="/admin/books"
        >
          Bookings
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
          to="/admin/customers"
        >
          Customers
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
          to="/admin/schedules"
        >
          Schedule
        </NavLink>
      </nav>

      <nav className="sidebar-footer" aria-label="Account navigation">
        <Link className="sidebar-link" to="/admin/settings">
          Settings
        </Link>
        <Link className="sidebar-link" to="/">
          Return to site
        </Link>
        <button className="sidebar-link sidebar-logout" type="button">
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;