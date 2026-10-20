import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/dashboard/sidebar";
import { getApiError } from "../../../api/auth";
import { createStaffMember, getStaffMember, updateStaffMember } from "../../../api/staff";
import type { StaffInput, StaffMember } from "../../../api/staff";
import "./styles/admin.css";
import "./styles/staff.css";

function StaffEdit() {
	const { id } = useParams();
	const navigate = useNavigate();
	const isCreating = !id;
	const staffId = id ? Number(id) : null;
	const [staff, setStaff] = useState<StaffMember | null>(null);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (isCreating || !staffId || !Number.isInteger(staffId)) return;
		let active = true;
		getStaffMember(staffId)
			.then((record) => {
				if (!active) return;
				setStaff(record);
				setFirstName(record.first_name);
				setLastName(record.last_name);
				setEmail(record.email);
			})
			.catch((requestError) => {
				if (active) setError(getApiError(requestError, "Unable to load staff member."));
			});
		return () => { active = false; };
	}, [isCreating, staffId]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setIsSaving(true);
		const input: StaffInput = {
			first_name: firstName,
			last_name: lastName,
			email,
			...(password ? { password } : {}),
		};
		try {
			if (isCreating) await createStaffMember({ ...input, password });
			else if (staffId) await updateStaffMember(staffId, input);
			navigate("/admin/staff", { state: { message: isCreating ? "Staff member created." : "Staff member updated." } });
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to save staff member."));
		} finally {
			setIsSaving(false);
		}
	}

	if (!isCreating && (!staffId || !Number.isInteger(staffId))) return <Navigate to="/admin/staff" replace />;

	return (
		<>
			<Sidebar />
			<main className="admin-body">
				<div className="page-heading">
					<div>
						<p className="eyebrow"><Link to="/admin/staff">Staff</Link></p>
						<h1>{isCreating ? "Add staff member" : "Edit staff member"}</h1>
						<p className="page-description">Manage staff account details.</p>
					</div>
				</div>
				{error && <p className="crud-error" role="alert">{error}</p>}
				{!isCreating && !staff && !error && <p role="status">Loading staff member...</p>}
				{(isCreating || staff) && (
					<form className="dashboard-panel staff-edit-form page-panel" onSubmit={handleSubmit}>
						<div className="crud-fields">
							<label>First name<input required maxLength={100} value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
							<label>Last name<input required maxLength={100} value={lastName} onChange={(event) => setLastName(event.target.value)} /></label>
							<label>Email address<input required type="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
							<label>{isCreating ? "Initial password" : "New password (optional)"}
								<input required={isCreating} type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
							</label>
							<label>Role<input value="Staff" readOnly /></label>
						</div>
						<div className="staff-edit-actions">
							<button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : isCreating ? "Create staff account" : "Save changes"}</button>
							<Link className="admin-button-link admin-button-secondary" to="/admin/staff">Cancel</Link>
						</div>
					</form>
				)}
			</main>
		</>
	);
}

export default StaffEdit;
