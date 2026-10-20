import "./styles/customers.css";
import Sidebar from "../../../components/dashboard/sidebar.tsx";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getApiError } from "../../../api/auth";
import {
	createDashboardCustomer,
	deleteDashboardCustomer,
	getDashboardCustomers,
	updateDashboardCustomer,
	type CustomerRecord,
} from "../../../api/dashboard";

type CustomerForm = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
};

const emptyCustomer: CustomerForm = { first_name: "", last_name: "", email: "", password: "" };

function Customers() {
	const [customers, setCustomers] = useState<CustomerRecord[]>([]);
	const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [form, setForm] = useState<CustomerForm>(emptyCustomer);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	async function loadCustomers() {
		setCustomers(await getDashboardCustomers());
	}

	useEffect(() => {
		let isActive = true;
		getDashboardCustomers()
			.then((rows) => {
				if (isActive) {
					setCustomers(rows);
				}
			})
			.catch((requestError) => {
				if (isActive) {
					setError(getApiError(requestError, "Unable to load customers."));
				}
			});
		return () => { isActive = false; };
	}, []);

	function openCreateForm() {
		setEditingCustomer(null);
		setForm(emptyCustomer);
		setError("");
		setMessage("");
		setIsFormOpen(true);
	}

	function openEditForm(customer: CustomerRecord) {
		setEditingCustomer(customer);
		setForm({ first_name: customer.first_name ?? "", last_name: customer.last_name ?? "", email: customer.email, password: "" });
		setError("");
		setMessage("");
		setIsFormOpen(true);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setMessage("");
		setIsSaving(true);
		try {
			if (editingCustomer) {
				const { password, ...customerData } = form;
				await updateDashboardCustomer(editingCustomer.id, {
					...customerData,
					...(password ? { password } : {}),
				});
				setMessage("Customer updated.");
			} else {
				await createDashboardCustomer(form);
				setMessage("Customer created.");
			}
			setEditingCustomer(null);
			setIsFormOpen(false);
			setForm(emptyCustomer);
			try {
				await loadCustomers();
			} catch (requestError) {
				setError(getApiError(requestError, "Customer saved, but the list could not be refreshed. Reload the page."));
			}
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to save customer."));
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete(customer: CustomerRecord) {
		const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email;
		if (!window.confirm(`Delete ${name}? Customers with booking history cannot be deleted.`)) {
			return;
		}

		setError("");
		setMessage("");
		try {
			await deleteDashboardCustomer(customer.id);
			setMessage("Customer deleted.");
			try {
				await loadCustomers();
			} catch (requestError) {
				setError(getApiError(requestError, "Customer deleted, but the list could not be refreshed. Reload the page."));
			}
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to delete customer."));
		}
	}

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
					<button type="button" onClick={openCreateForm}>Add customer</button>
				</div>

				{(error || message) && <p className={error ? "crud-error" : "crud-success"} role={error ? "alert" : "status"}>{error || message}</p>}
				{isFormOpen && (
					<form className="dashboard-panel crud-form page-panel" onSubmit={handleSubmit}>
						<h2>{editingCustomer ? "Edit customer" : "Add customer"}</h2>
						<div className="crud-fields">
							<label>First name<input required maxLength={100} value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} /></label>
							<label>Last name<input required maxLength={100} value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} /></label>
							<label>Email<input required type="email" maxLength={255} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
							<label>{editingCustomer ? "New password (optional)" : "Temporary password"}
								<input required={!editingCustomer} type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
							</label>
						</div>
						<div className="crud-actions">
							<button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save customer"}</button>
							<button type="button" className="crud-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
						</div>
					</form>
				)}

				<section className="dashboard-panel page-panel">
					<div className="table-toolbar"><strong>Customer history</strong><span>{customers.length} customers</span></div>
					<div className="booking-table">
						<div className="table-row table-header"><span>Customer</span><span>Last session</span><span>Bookings</span><span>Lifetime value</span><span>Actions</span></div>
						{customers.map((customer) => (
							<div className="table-row" key={customer.id}>
								<span><strong>{[customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email}</strong><small>{customer.email}</small></span>
								<span>—</span>
								<span>{customer.bookings_count}</span>
								<span>₱{Number(customer.bookings_sum_total_price ?? 0).toLocaleString()}</span>
								<div className="crud-row-actions">
									<button type="button" className="crud-secondary" onClick={() => openEditForm(customer)}>Edit</button>
									<button type="button" className="crud-danger" onClick={() => handleDelete(customer)}>Delete</button>
								</div>
							</div>
						))}
						{customers.length === 0 && <p>No customers yet.</p>}
					</div>
				</section>
			</main>
		</>
	);
}

export default Customers;
