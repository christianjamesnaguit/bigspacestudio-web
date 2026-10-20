import "./styles.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../api/use-auth";

function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/");
    }
  }

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
        {user?.role === "Admin" && <NavLink
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
          to="/admin/staff"
        >
          Staff
        </NavLink>}
        {user?.role === "Admin" && <NavLink
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
          to="/admin/media"
        >
          Website
        </NavLink>}
      </nav>

      <nav className="sidebar-footer" aria-label="Account navigation">
        {user && (
          <div className="sidebar-current-user" aria-label="Signed-in user">
            <span className="sidebar-current-user-label">Signed in as</span>
            <strong>{user.first_name} {user.last_name}</strong>
            <span>{user.email}</span>
            <span className="sidebar-current-user-role">{user.role}</span>
          </div>
        )}
        <Link className="sidebar-link" to="/admin/settings">
          Settings
        </Link>
        <Link className="sidebar-link" to="/">
          Return to site
        </Link>
        <button className="sidebar-link sidebar-logout" type="button" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;