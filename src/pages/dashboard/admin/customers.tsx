import "./styles/customers.css";
import Sidebar from "../../../components/dashboard/sidebar.tsx";
import { useEffect, useState } from "react";
import { getApiError } from "../../../api/auth";
import { getDashboardCustomers } from "../../../api/dashboard";

function Customers() {
	const [customers, setCustomers] = useState<Awaited<ReturnType<typeof getDashboardCustomers>>>([]);
	const [error, setError] = useState("");

	useEffect(() => {
		getDashboardCustomers()
			.then(setCustomers)
			.catch((requestError) => setError(getApiError(requestError, "Unable to load customers.")));
	}, []);

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
					<div className="table-toolbar"><strong>Customer history</strong><span>{customers.length} customers</span></div>
					{error && <p role="alert">{error}</p>}
					<div className="booking-table">
						<div className="table-row table-header"><span>Customer</span><span>Last session</span><span>Bookings</span><span>Lifetime value</span></div>
						{customers.map((customer) => (
							<div className="table-row" key={customer.id}>
								<span><strong>{[customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email}</strong><small>{customer.email}</small></span>
								<span>—</span>
								<span>{customer.bookings_count}</span>
								<span>₱{Number(customer.bookings_sum_total_price ?? 0).toLocaleString()}</span>
							</div>
						))}
					</div>
				</section>
			</main>
		</>
	);
}

export default Customers;
