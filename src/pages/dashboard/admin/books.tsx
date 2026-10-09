import "./styles/books.css";
import Sidebar from "../../../components/dashboard/sidebar.tsx";
import { useEffect, useState } from "react";
import { getApiError } from "../../../api/auth";
import { getDashboardBookings, type DashboardBooking } from "../../../api/dashboard";

function customerName(booking: DashboardBooking) {
	return [booking.customer.first_name, booking.customer.last_name].filter(Boolean).join(" ") || booking.customer.email;
}

function Books() {
	const [bookings, setBookings] = useState<DashboardBooking[]>([]);
	const [error, setError] = useState("");

	useEffect(() => {
		getDashboardBookings()
			.then(setBookings)
			.catch((requestError) => setError(getApiError(requestError, "Unable to load bookings.")));
	}, []);

	return (
		<>
			<Sidebar />
			<main className="admin-body">
				<div className="page-heading">
					<div>
						<p className="eyebrow">Studio activity</p>
						<h1>Bookings</h1>
						<p className="page-description">Review and manage upcoming studio bookings.</p>
					</div>
					<button type="button">New booking</button>
				</div>

				<section className="dashboard-panel page-panel">
					<div className="table-toolbar"><strong>All bookings</strong><span>{bookings.length} total</span></div>
					{error && <p role="alert">{error}</p>}
					<div className="booking-table">
						<div className="table-row table-header"><span>Customer</span><span>Session</span><span>Date</span><span>Status</span></div>
						{bookings.map((booking) => (
							<div className="table-row" key={booking.booking_id}>
								<span><strong>{customerName(booking)}</strong></span>
								<span>{booking.package.package_name}</span>
								<span>{new Date(`${booking.schedule.schedule_date}T${booking.schedule.start_time}`).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
								<span className={`status status-${booking.booking_status}`}>{booking.booking_status}</span>
							</div>
						))}
					</div>
				</section>
			</main>
		</>
	);
}

export default Books;
