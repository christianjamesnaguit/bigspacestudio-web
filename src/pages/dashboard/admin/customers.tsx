import "./styles/customers.css";
import Sidebar from "../../../components/dashboard/sidebar.tsx";

function Customers() {
	return (
		<>
			<Sidebar />
			<main className="admin-body">
				<div className="page-heading">
					<div>
						<p className="eyebrow">People</p>
						<h1>Customers</h1>
						<p className="page-description">View customer details and their studio history.</p>
					</div>
					<button type="button">Add customer</button>
				</div>

				<section className="dashboard-panel page-panel">
					<div className="table-toolbar"><strong>Customer history</strong><span>84 customers</span></div>
					<div className="booking-table">
						<div className="table-row table-header"><span>Customer</span><span>Last session</span><span>Bookings</span><span>Lifetime value</span></div>
						<div className="table-row"><span><strong>Maya Chen</strong><small>maya.chen@example.com</small></span><span>Oct 2, 2026</span><span>8</span><span>$2,480</span></div>
						<div className="table-row"><span><strong>Northstar Records</strong><small>hello@northstar.test</small></span><span>Sep 28, 2026</span><span>14</span><span>$6,920</span></div>
						<div className="table-row"><span><strong>Lowlight Films</strong><small>team@lowlight.test</small></span><span>Sep 19, 2026</span><span>5</span><span>$4,100</span></div>
					</div>
				</section>
			</main>
		</>
	);
}

export default Customers;
