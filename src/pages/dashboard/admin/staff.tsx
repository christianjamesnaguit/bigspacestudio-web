import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../../../components/dashboard/sidebar";
import { getApiError } from "../../../api/auth";
import { deleteStaffMember, getStaffList } from "../../../api/staff";
import type { StaffListMember } from "../../../api/staff";
import "./styles/admin.css";
import "./styles/staff.css";

function Staff() {
	const [staff, setStaff] = useState<StaffListMember[]>([]);
	const [error, setError] = useState("");
	const location = useLocation();
	const [message, setMessage] = useState(() => (location.state as { message?: string } | null)?.message ?? "");

	async function refreshStaff() {
		setStaff(await getStaffList());
	}

	useEffect(() => {
		let active = true;
		getStaffList()
			.then((rows) => { if (active) setStaff(rows); })
			.catch((requestError) => { if (active) setError(getApiError(requestError, "Unable to load staff.")); });
		return () => { active = false; };
	}, []);

	async function handleDelete(member: StaffListMember) {
		if (!window.confirm(`Delete ${member.first_name} ${member.last_name}?`)) return;
		setError("");
		setMessage("");
		try {
			await deleteStaffMember(member.id);
			setMessage("Staff member deleted.");
			try {
				await refreshStaff();
			} catch (requestError) {
				setError(getApiError(requestError, "Staff member deleted, but the list could not be refreshed."));
			}
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to delete staff member."));
		}
	}

	return (
		<>
			<Sidebar />
			<main className="admin-body">
				<div className="page-heading">
					<div>
						<p className="eyebrow">People</p>
						<h1>Staff</h1>
						<p className="page-description">Manage staff accounts and profile photos.</p>
					</div>
					<Link className="admin-button-link" to="/admin/staff/new">Add staff member</Link>
				</div>
				{(error || message) && <p className={error ? "crud-error" : "crud-success"} role={error ? "alert" : "status"}>{error || message}</p>}
				<section className="dashboard-panel page-panel staff-panel">
					<div className="table-toolbar"><strong>Staff directory</strong><span>{staff.length} staff members</span></div>
					<div className="staff-list">
						{staff.map((member) => (
							<article className="staff-card" key={member.id}>
								<div className="staff-details">
									<strong>{member.first_name} {member.last_name}</strong>
									<a href={`mailto:${member.email}`}>{member.email}</a>
									<span>{member.role}</span>
								</div>
								<div className="staff-actions">
									<Link className="admin-button-link admin-button-secondary" to={`/admin/staff/${member.id}/edit`}>Edit</Link>
									<button type="button" className="crud-danger" onClick={() => handleDelete(member)}>Delete</button>
								</div>
							</article>
						))}
						{staff.length === 0 && !error && <p>No staff accounts yet. Add a staff member to get started.</p>}
					</div>
				</section>
			</main>
		</>
	);
}

export default Staff;
