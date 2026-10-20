import "./styles/admin.css";
import Sidebar from "../../../components/dashboard/sidebar.tsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiError } from "../../../api/auth";
import { getDashboardOverview, type DashboardBooking, type DashboardStats } from "../../../api/dashboard";

function customerName(customer: DashboardBooking["customer"]) {
  return [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email;
}

function bookingDate(booking: DashboardBooking) {
  return `${new Date(`${booking.schedule.schedule_date}T${booking.schedule.start_time}`).toLocaleDateString()} ${new Date(`1970-01-01T${booking.schedule.start_time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function Admin() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardOverview()
      .then((data) => {
        setStats(data.stats);
        setBookings(data.bookings);
      })
      .catch((requestError) => setError(getApiError(requestError, "Unable to load dashboard data.")));
  }, []);

  return (
    <>
      <Sidebar />
      <section className="admin-body">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Overview</p>
            <h1>Admin Dashboard</h1>
            <p className="page-description">
              Keep track of studio activity and upcoming work.
            </p>
          </div>
        </div>

        {error && <p role="alert">{error}</p>}
        <div className="stats-grid">
          <article className="stat-card">
            <span>Upcoming bookings</span>
            <strong>{stats?.upcoming_bookings ?? "—"}</strong>
            <small>From the schedules table</small>
          </article>
          <article className="stat-card">
            <span>Active customers</span>
            <strong>{stats?.active_customers ?? "—"}</strong>
            <small>Registered customer accounts</small>
          </article>
          <article className="stat-card">
            <span>Studio hours</span>
            <strong>{stats ? `${stats.studio_hours}h` : "—"}</strong>
            <small>Scheduled in the next 7 days</small>
          </article>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Next up</p>
                <h2>Upcoming bookings</h2>
              </div>
              <a href="/admin/books">View all</a>
            </div>
            <div className="booking-list">
              {bookings.length === 0 && <p>No upcoming bookings.</p>}
              {bookings.map((booking) => (
                <div className="booking-row" key={booking.booking_id}>
                  <div><strong>{customerName(booking.customer)}</strong><span>{booking.package.package_name}</span></div>
                  <time>{bookingDate(booking)}</time>
                  <span className={`status status-${booking.booking_status}`}>{booking.booking_status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-panel activity-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Workspace</p>
                <h2>Manage your studio</h2>
              </div>
            </div>
            <div className="activity-list">
              <div className="activity-row"><span className="activity-dot" /><div><strong><Link to="/admin/books">Manage bookings</Link></strong><span>Create, update, and cancel studio bookings.</span></div></div>
              <div className="activity-row"><span className="activity-dot" /><div><strong><Link to="/admin/customers">Manage customers</Link></strong><span>Maintain customer records and account details.</span></div></div>
              <div className="activity-row"><span className="activity-dot" /><div><strong><Link to="/admin/schedules">Manage schedule</Link></strong><span>Add studio availability and block time slots.</span></div></div>
            </div>
          </section>
        </div>

        <section className="dashboard-panel masterlist-panel">
          <div className="panel-heading">
            <div>
                <p className="eyebrow">Booking records</p>
                <h2>Upcoming booking list</h2>
            </div>
              <a href="/admin/books">View bookings</a>
          </div>
          <div className="masterlist">
            <div className="masterlist-row masterlist-header"><span>Client name</span><span>Package</span><span>Price</span><span>Date</span><span>Status</span></div>
            {bookings.map((booking) => (
              <div className="masterlist-row" key={booking.booking_id}>
                <strong>{customerName(booking.customer)}</strong>
                <span>{booking.package.package_name}</span>
                <span>₱{Number(booking.total_price).toLocaleString()}</span>
                <span>{bookingDate(booking)}</span>
                <span className={`status status-${booking.booking_status}`}>{booking.booking_status}</span>
              </div>
            ))}
            {bookings.length === 0 && <p>No upcoming bookings.</p>}
          </div>
        </section>
      </section>
    </>
  );
}

export default Admin;