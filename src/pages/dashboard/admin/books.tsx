import "./styles/books.css";
import Sidebar from "../../../components/dashboard/sidebar.tsx";

function Books() {
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
					<div className="table-toolbar"><strong>All bookings</strong><span>12 upcoming</span></div>
					<div className="booking-table">
						<div className="table-row table-header"><span>Customer</span><span>Session</span><span>Date</span><span>Status</span></div>
						<div className="table-row"><span><strong>Northstar Records</strong></span><span>Mixing session</span><span>Oct 5, 2:00 PM</span><span className="status status-confirmed">Confirmed</span></div>
						<div className="table-row"><span><strong>Maya Chen</strong></span><span>Portrait session</span><span>Oct 6, 10:00 AM</span><span className="status status-pending">Pending</span></div>
						<div className="table-row"><span><strong>Lowlight Films</strong></span><span>Production day</span><span>Oct 9, 9:00 AM</span><span className="status status-confirmed">Confirmed</span></div>
						<div className="table-row"><span><strong>Jordan Ellis</strong></span><span>Recording session</span><span>Oct 11, 1:00 PM</span><span className="status status-cancelled">Cancelled</span></div>
					</div>
				</section>
			</main>
		</>
	);
}

export default Books;
