import "./styles/books.css";
import "../../styles/booking.css";
import Sidebar from "../../../components/dashboard/sidebar.tsx";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getApiError } from "../../../api/auth";
import {
	createDashboardBooking,
	decideDashboardBooking,
	getDashboardBookings,
	getDashboardBlockedDates,
	getDashboardCustomers,
	getDashboardPackages,
	getDashboardSchedules,
	updateDashboardBooking,
	type BookingInput,
	type DashboardBooking,
	type DashboardCustomer,
	type DashboardPackage,
	type DashboardSchedule,
} from "../../../api/dashboard";

function customerName(booking: DashboardBooking) {
	return booking.customer ? [booking.customer.first_name, booking.customer.last_name].filter(Boolean).join(" ") || booking.customer.email : "Deleted customer";
}

const bookingWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
type BookingDecision = "approve" | "deny" | "confirm" | "cancel";

function dateValue(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function scheduleDateValue(value: string) {
	return value.slice(0, 10);
}

function scheduleDurationMinutes(schedule: DashboardSchedule) {
	const [startHour, startMinute] = schedule.start_time.split(":").map(Number);
	const [endHour, endMinute] = schedule.end_time.split(":").map(Number);
	return endHour * 60 + endMinute - startHour * 60 - startMinute;
}

function Books() {
	const [bookings, setBookings] = useState<DashboardBooking[]>([]);
	const [customers, setCustomers] = useState<DashboardCustomer[]>([]);
	const [packages, setPackages] = useState<DashboardPackage[]>([]);
	const [schedules, setSchedules] = useState<DashboardSchedule[]>([]);
	const [blockedDates, setBlockedDates] = useState<string[]>([]);
	const [editingBooking, setEditingBooking] = useState<DashboardBooking | null>(null);
	const [decisionTarget, setDecisionTarget] = useState<{ booking: DashboardBooking; decision: BookingDecision } | null>(null);
	const [decisionReason, setDecisionReason] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [selectedCustomerId, setSelectedCustomerId] = useState("");
	const [selectedPackageId, setSelectedPackageId] = useState("");
	const [selectedScheduleId, setSelectedScheduleId] = useState("");
	const [selectedDate, setSelectedDate] = useState("");
	const [calendarMonth, setCalendarMonth] = useState(() => new Date());

	async function loadData() {
		const [bookingRows, customerRows, packageRows, scheduleRows, blockedDateRows] = await Promise.all([
			getDashboardBookings(),
			getDashboardCustomers(),
			getDashboardPackages(),
			getDashboardSchedules(),
			getDashboardBlockedDates(),
		]);
		setBookings(bookingRows);
		setCustomers(customerRows);
		setPackages(packageRows);
		setSchedules(scheduleRows);
		setBlockedDates(blockedDateRows);
	}

	useEffect(() => {
		let isActive = true;
		Promise.all([
			getDashboardBookings(),
			getDashboardCustomers(),
			getDashboardPackages(),
			getDashboardSchedules(),
			getDashboardBlockedDates(),
		])
			.then(([bookingRows, customerRows, packageRows, scheduleRows, blockedDateRows]) => {
				if (isActive) {
					setBookings(bookingRows);
					setCustomers(customerRows);
					setPackages(packageRows);
					setSchedules(scheduleRows);
					setBlockedDates(blockedDateRows);
				}
			})
			.catch((requestError) => {
				if (isActive) {
					setError(getApiError(requestError, "Unable to load booking data."));
				}
			});
		return () => { isActive = false; };
	}, []);

	function openForm(booking: DashboardBooking | null = null) {
		setEditingBooking(booking);
		setError("");
		setMessage("");
		setSelectedCustomerId(booking?.customer ? String(booking.customer.id) : "");
		setSelectedPackageId(booking ? String(booking.package.package_id) : "");
		setSelectedScheduleId(booking ? String(booking.schedule.schedule_id) : "");
		const bookingDate = booking ? scheduleDateValue(booking.schedule.schedule_date) : "";
		setSelectedDate(bookingDate);
		setCalendarMonth(booking ? new Date(`${bookingDate}T00:00:00`) : new Date());
		setIsFormOpen(true);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		if (editingBooking) {
			if (!selectedPackageId || !selectedScheduleId) {
				setError("Choose a package and an available session time.");
				return;
			}
			setError("");
			setMessage("");
			setIsSaving(true);
			try {
				await updateDashboardBooking(editingBooking.booking_id, {
					package_id: Number(selectedPackageId),
					schedule_id: Number(selectedScheduleId),
				});
				setMessage("Booking updated.");
				setIsFormOpen(false);
				setEditingBooking(null);
				try {
					await loadData();
				} catch (requestError) {
					setError(getApiError(requestError, "Booking saved, but the list could not be refreshed. Reload the page."));
				}
			} catch (requestError) {
				setError(getApiError(requestError, "Unable to update booking."));
			} finally {
				setIsSaving(false);
			}
			return;
		}

		if (!selectedCustomerId || !selectedPackageId || !selectedScheduleId) {
			setError("Choose a customer, package, and available session time.");
			return;
		}
		const payload: BookingInput = {
			customer_id: Number(selectedCustomerId),
			package_id: Number(selectedPackageId),
			schedule_id: Number(selectedScheduleId),
			requests: String(formData.get("requests") || "No additional requests."),
			booking_status: "pending",
		};

		setError("");
		setMessage("");
		setIsSaving(true);
		try {
			await createDashboardBooking(payload);
			setMessage("Booking created.");
			setIsFormOpen(false);
			try {
				await loadData();
			} catch (requestError) {
				setError(getApiError(requestError, "Booking saved, but the list could not be refreshed. Reload the page."));
			}
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to save booking."));
		} finally {
			setIsSaving(false);
		}
	}

	function openDecisionModal(booking: DashboardBooking, decision: BookingDecision) {
		setError("");
		setMessage("");
		setDecisionTarget({ booking, decision });
		setDecisionReason("");
	}

	async function handleDecisionSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!decisionTarget || !decisionReason.trim()) {
			setError("Enter a reason for this decision.");
			return;
		}
		setError("");
		setMessage("");
		setIsSaving(true);
		try {
			const { booking, decision } = decisionTarget;
			await decideDashboardBooking(booking.booking_id, decision, decisionReason.trim());
			setMessage({
				approve: "Booking approved.",
				deny: "Booking denied.",
				confirm: "Booking confirmed.",
				cancel: "Booking cancelled.",
			}[decision]);
			setDecisionTarget(null);
			setDecisionReason("");
			try {
				await loadData();
			} catch (requestError) {
				setError(getApiError(requestError, "Booking updated, but the list could not be refreshed. Reload the page."));
			}
		} catch (requestError) {
			setError(getApiError(requestError, `Unable to ${decisionTarget.decision} booking.`));
		} finally {
			setIsSaving(false);
		}
	}

	const selectedPackage = packages.find((studioPackage) => String(studioPackage.package_id) === selectedPackageId);
	const packageFitsSchedule = (schedule: DashboardSchedule) => !selectedPackage
		|| selectedPackage.pricing_type === "hourly"
		|| scheduleDurationMinutes(schedule) >= (selectedPackage.duration_minutes ?? 0);
	const selectableSchedules = schedules.filter((schedule) =>
		(schedule.status === "available" || schedule.schedule_id === editingBooking?.schedule.schedule_id)
		&& (!blockedDates.some((blockedDate) => scheduleDateValue(blockedDate) === scheduleDateValue(schedule.schedule_date)) || schedule.schedule_id === editingBooking?.schedule.schedule_id)
		&& packageFitsSchedule(schedule),
	);
	const availableSchedules = schedules.filter((schedule) =>
		schedule.status === "available"
		&& !blockedDates.some((blockedDate) => scheduleDateValue(blockedDate) === scheduleDateValue(schedule.schedule_date))
		&& scheduleDateValue(schedule.schedule_date) >= dateValue(new Date())
		&& packageFitsSchedule(schedule),
	);
	const futureAvailableSchedules = schedules.filter((schedule) =>
		schedule.status === "available"
		&& !blockedDates.some((blockedDate) => scheduleDateValue(blockedDate) === scheduleDateValue(schedule.schedule_date))
		&& scheduleDateValue(schedule.schedule_date) >= dateValue(new Date()),
	);
	const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
	const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
	const calendarDays = [
		...Array.from({ length: firstDay }, () => null),
		...Array.from({ length: daysInMonth }, (_, index) => index + 1),
	];
	const selectedSchedule = schedules.find((schedule) => String(schedule.schedule_id) === selectedScheduleId);
	const selectedCustomer = customers.find((customer) => String(customer.id) === selectedCustomerId);
	const scheduleDates = new Set(availableSchedules.map((schedule) => scheduleDateValue(schedule.schedule_date)));
	const daySchedules = availableSchedules.filter((schedule) => scheduleDateValue(schedule.schedule_date) === selectedDate);
	const pendingBookings = bookings.filter((booking) => booking.booking_status === "pending");
	const activeBookings = bookings.filter((booking) =>
		booking.booking_status === "approved"
		|| (booking.booking_status === "confirmed" && scheduleDateValue(booking.schedule.schedule_date) >= dateValue(new Date())),
	);
	const historyBookings = bookings.filter((booking) =>
		booking.booking_status === "denied"
		|| booking.booking_status === "cancelled"
		|| (booking.booking_status === "confirmed" && scheduleDateValue(booking.schedule.schedule_date) < dateValue(new Date())),
	);
	const bookingTotal = selectedPackage
		? selectedPackage.pricing_type === "hourly" && selectedSchedule
			? Number(selectedPackage.price) * scheduleDurationMinutes(selectedSchedule) / 60
			: Number(selectedPackage.price)
		: null;

	function renderBookingRow(booking: DashboardBooking, section: "pending" | "active") {
		return (
			<div className={`table-row${section === "pending" ? " booking-pending-row" : " booking-active-row"}`} key={booking.booking_id}>
				<span><strong>{customerName(booking)}</strong></span>
				<span>{booking.package.package_name}</span>
				<span>{new Date(`${booking.schedule.schedule_date}T${booking.schedule.start_time}`).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
				<span className={`status status-${booking.booking_status}`}>{booking.booking_status}</span>
				{section === "active" && <span className="booking-decision-reason">{booking.decision_reason || "No reason provided"}</span>}
				<span className="crud-row-actions">
					{booking.booking_status !== "confirmed" && <button type="button" className="crud-secondary" onClick={() => openForm(booking)}>Edit</button>}
					{section === "pending" && <>
						<button type="button" className="booking-approve" onClick={() => openDecisionModal(booking, "approve")}>Approve</button>
						<button type="button" className="booking-deny" onClick={() => openDecisionModal(booking, "deny")}>Deny</button>
					</>}
					{section === "active" && <>
						{booking.booking_status === "approved" && <button type="button" className="booking-approve" onClick={() => openDecisionModal(booking, "confirm")}>Confirm</button>}
						<button type="button" className="booking-deny" onClick={() => openDecisionModal(booking, "cancel")}>Cancel</button>
					</>}
				</span>
			</div>
		);
	}

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
					<button type="button" onClick={() => openForm()}>New booking</button>
				</div>

				{(error || message) && <p className={error ? "crud-error" : "crud-success"} role={error ? "alert" : "status"}>{error || message}</p>}
				{isFormOpen && (
					editingBooking ? (
						<form className="dashboard-panel crud-form page-panel" onSubmit={handleSubmit}>
							<h2>Edit booking package and schedule</h2>
							<div className="crud-fields">
								<label>Package
									<select required value={selectedPackageId} onChange={(event) => { setSelectedPackageId(event.target.value); setSelectedScheduleId(""); }}>
										<option value="" disabled>Select a package</option>
										{packages.map((studioPackage) => <option key={studioPackage.package_id} value={studioPackage.package_id}>{studioPackage.package_name} — ₱{Number(studioPackage.price).toLocaleString()}{studioPackage.pricing_type === "hourly" ? " / hour" : ""}</option>)}
									</select>
								</label>
								<label>Schedule
									<select required value={selectedScheduleId} onChange={(event) => setSelectedScheduleId(event.target.value)}>
										<option value="" disabled>Select a time</option>
										{selectableSchedules.map((schedule) => (
											<option key={schedule.schedule_id} value={schedule.schedule_id}>
												{new Date(`${schedule.schedule_date}T${schedule.start_time}`).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
											</option>
										))}
									</select>
								</label>
							</div>
							<div className="crud-actions">
								<button type="submit" disabled={isSaving || packages.length === 0 || selectableSchedules.length === 0}>
									{isSaving ? "Saving..." : "Save booking"}
								</button>
								<button type="button" className="crud-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
							</div>
						</form>
					) : (
						<div className="admin-booking-layout">
							<form className="booking-form admin-booking-form" onSubmit={handleSubmit}>
								{(customers.length === 0 || packages.length === 0 || availableSchedules.length === 0) && (
									<p className="crud-error" role="status">
										{customers.length === 0
											? "Add a customer before creating a booking."
											: packages.length === 0
												? "No active packages are available."
												: futureAvailableSchedules.length === 0
													? "No future schedule slots are available. Add availability in Schedule first."
													: "No future schedule slots fit this package. Choose another package or add a longer time slot in Schedule."}
									</p>
								)}
								<section className="booking-step">
									<div className="step-heading">
										<span>1</span>
										<div><h2>Choose a service</h2><p>Select the package for this session.</p></div>
									</div>
									<div className="service-options">
										{packages.map((studioPackage) => (
											<label
												className={`service-option${selectedPackageId === String(studioPackage.package_id) ? " selected" : ""}`}
												key={studioPackage.package_id}
											>
												<input
													type="radio"
													name="admin-package"
													value={studioPackage.package_id}
													checked={selectedPackageId === String(studioPackage.package_id)}
													onChange={() => { setSelectedPackageId(String(studioPackage.package_id)); setSelectedScheduleId(""); }}
												/>
												<span className="service-option-copy">
													<strong>{studioPackage.package_name}</strong>
													<small>{studioPackage.description || `${studioPackage.duration_minutes ?? ""} minute studio session`}</small>
												</span>
												<span className="service-price">₱{Number(studioPackage.price).toLocaleString()}{studioPackage.pricing_type === "hourly" ? " / hour" : ""}</span>
											</label>
										))}
										{packages.length === 0 && <p>No active packages are available. Add or activate a package before booking.</p>}
									</div>
								</section>

								<section className="booking-step">
									<div className="step-heading">
										<span>2</span>
										<div><h2>Find a date and time</h2><p>Choose an available studio session.</p></div>
									</div>
									<div className="admin-booking-calendar">
										<div className="simple-calendar">
											<div className="calendar-heading">
												<button
													type="button"
													aria-label="Previous month"
													disabled={calendarMonth.getFullYear() === new Date().getFullYear() && calendarMonth.getMonth() === new Date().getMonth()}
													onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
												>&lt;</button>
												<strong>{calendarMonth.toLocaleDateString([], { month: "long", year: "numeric" })}</strong>
												<button type="button" aria-label="Next month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>&gt;</button>
											</div>
											<div className="booking-calendar-grid booking-calendar-weekdays">
												{bookingWeekdays.map((day) => <span key={day}>{day}</span>)}
											</div>
											<div className="booking-calendar-grid">
												{calendarDays.map((day, index) => {
													if (!day) {
														return <span className="calendar-empty" key={`empty-${index}`} />;
													}
													const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
													const value = dateValue(date);
													const hasAvailability = scheduleDates.has(value);
													return (
														<button
															type="button"
															className={`booking-calendar-day${selectedDate === value ? " selected" : ""}${hasAvailability ? " has-availability" : ""}`}
															disabled={!hasAvailability}
															key={value}
															onClick={() => {
																setSelectedDate(value);
																setSelectedScheduleId("");
															}}
														>{day}</button>
													);
												})}
											</div>
										</div>
										<div className="admin-booking-times">
											<span className="booking-label">{selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString([], { dateStyle: "full" }) : "Available times"}</span>
											{daySchedules.length > 0 ? daySchedules.map((schedule) => (
												<button
													type="button"
													className={`admin-booking-time${selectedScheduleId === String(schedule.schedule_id) ? " selected" : ""}`}
													key={schedule.schedule_id}
													onClick={() => setSelectedScheduleId(String(schedule.schedule_id))}
												>
													{new Date(`1970-01-01T${schedule.start_time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
													{" – "}
													{new Date(`1970-01-01T${schedule.end_time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
												</button>
											)) : <p className="admin-booking-empty">{selectedDate ? "No available times on this date." : "Choose a highlighted date to see available times."}</p>}
										</div>
									</div>
								</section>

								<section className="booking-step">
									<div className="step-heading">
										<span>3</span>
										<div><h2>Customer details</h2><p>Choose the customer and add any session notes.</p></div>
									</div>
									<div className="booking-fields">
										<div className="booking-field booking-field-wide">
											<label htmlFor="admin-booking-customer">Customer</label>
											<select id="admin-booking-customer" value={selectedCustomerId} onChange={(event) => setSelectedCustomerId(event.target.value)} required>
												<option value="">Select a customer</option>
												{customers.map((customer) => <option key={customer.id} value={customer.id}>{[customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email} ({customer.email})</option>)}
											</select>
										</div>
										<div className="booking-field booking-field-wide">
											<label htmlFor="admin-booking-notes">Project notes <span>(optional)</span></label>
											<textarea id="admin-booking-notes" name="requests" rows={4} maxLength={10000} placeholder="Tell us a little about the session..." />
										</div>
									</div>
								</section>
								<button className="booking-submit" type="submit" disabled={isSaving || customers.length === 0 || packages.length === 0 || availableSchedules.length === 0}>
									{isSaving ? "Creating booking..." : "Create booking"}
								</button>
								<button className="admin-booking-cancel" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button>
							</form>
							<aside className="booking-summary admin-booking-summary">
								<p className="booking-eyebrow">BOOKING DETAILS</p>
								<h2>Booking summary</h2>
								<div className="summary-item"><span>Customer</span><strong>{selectedCustomer ? [selectedCustomer.first_name, selectedCustomer.last_name].filter(Boolean).join(" ") || selectedCustomer.email : "Choose a customer"}</strong></div>
								<div className="summary-item"><span>Service</span><strong>{selectedPackage?.package_name ?? "Choose a service"}</strong></div>
								<div className="summary-item"><span>Date</span><strong>{selectedDate || "Choose a date"}</strong></div>
								<div className="summary-item"><span>Time</span><strong>{selectedSchedule ? `${new Date(`1970-01-01T${selectedSchedule.start_time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – ${new Date(`1970-01-01T${selectedSchedule.end_time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Choose a time"}</strong></div>
								<hr />
								<div className="summary-item admin-booking-total"><span>{selectedPackage?.pricing_type === "hourly" ? "Estimated rental total" : "Package total"}</span><strong>{bookingTotal !== null ? `₱${bookingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}</strong></div>
							</aside>
						</div>
					)
				)}

				<section className="dashboard-panel page-panel">
					<div className="table-toolbar"><strong>Pending bookings</strong><span>{pendingBookings.length} awaiting decision</span></div>
					<div className="booking-table">
						<div className="table-row table-header booking-pending-row"><span>Customer</span><span>Session</span><span>Date</span><span>Status</span><span>Actions</span></div>
						{pendingBookings.map((booking) => renderBookingRow(booking, "pending"))}
						{pendingBookings.length === 0 && <p>No pending bookings.</p>}
					</div>
				</section>
				<section className="dashboard-panel page-panel">
					<div className="table-toolbar"><strong>Approved and confirmed bookings</strong><span>{activeBookings.length} active</span></div>
					<div className="booking-table">
						<div className="table-row table-header booking-active-row"><span>Customer</span><span>Session</span><span>Date</span><span>Status</span><span>Reason</span><span>Actions</span></div>
						{activeBookings.map((booking) => renderBookingRow(booking, "active"))}
						{activeBookings.length === 0 && <p>No approved or upcoming confirmed bookings.</p>}
					</div>
				</section>
				<section className="dashboard-panel page-panel">
					<div className="table-toolbar"><strong>Booking history</strong><span>{historyBookings.length} reviewed</span></div>
					<div className="booking-table">
						<div className="table-row table-header booking-history-row"><span>Customer</span><span>Session</span><span>Date</span><span>Status</span><span>Reason</span></div>
						{historyBookings.map((booking) => (
							<div className="table-row booking-history-row" key={booking.booking_id}>
								<span><strong>{customerName(booking)}</strong></span>
								<span>{booking.package.package_name}</span>
								<span>{new Date(`${booking.schedule.schedule_date}T${booking.schedule.start_time}`).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
								<span className={`status status-${booking.booking_status}`}>{booking.booking_status}</span>
								<span className="booking-decision-reason">{booking.decision_reason || "No reason provided"}</span>
							</div>
						))}
						{historyBookings.length === 0 && <p>No booking history yet.</p>}
					</div>
				</section>
				{decisionTarget && (
					<div className="booking-decision-backdrop" onMouseDown={(event) => {
						if (event.target === event.currentTarget && !isSaving) setDecisionTarget(null);
					}}>
						<form
							className="booking-decision-modal"
							role="dialog"
							aria-modal="true"
							aria-labelledby="booking-decision-title"
							onSubmit={handleDecisionSubmit}
						>
							<p className="booking-eyebrow">BOOKING DECISION</p>
							<h2 id="booking-decision-title">
								{decisionTarget.decision === "approve" ? "Approve booking?"
									: decisionTarget.decision === "deny" ? "Deny booking?"
										: decisionTarget.decision === "confirm" ? "Confirm booking?"
											: "Cancel booking?"}
							</h2>
							<p>
								{decisionTarget.decision === "approve"
									? `Approving the booking for ${customerName(decisionTarget.booking)} will move it to active bookings.`
									: decisionTarget.decision === "deny"
										? `Denying the booking for ${customerName(decisionTarget.booking)} will release the reserved time slot.`
										: decisionTarget.decision === "confirm"
											? `Confirming the booking for ${customerName(decisionTarget.booking)} will finalize the reservation.`
											: `Cancelling the booking for ${customerName(decisionTarget.booking)} will release the reserved time slot.`}
							</p>
							<label htmlFor="booking-decision-reason">Reason</label>
							<textarea
								id="booking-decision-reason"
								required
								maxLength={2000}
								rows={4}
								value={decisionReason}
								onChange={(event) => setDecisionReason(event.target.value)}
								placeholder="Add a reason for this decision..."
							/>
							<div className="booking-decision-actions">
								<button type="button" className="crud-secondary" disabled={isSaving} onClick={() => setDecisionTarget(null)}>Cancel</button>
								<button type="submit" className={decisionTarget.decision === "approve" || decisionTarget.decision === "confirm" ? "booking-approve" : "booking-deny"} disabled={isSaving || !decisionReason.trim()}>
									{isSaving ? "Saving..." : decisionTarget.decision === "approve" ? "Approve booking"
										: decisionTarget.decision === "deny" ? "Deny booking"
											: decisionTarget.decision === "confirm" ? "Confirm booking" : "Cancel booking"}
								</button>
							</div>
						</form>
					</div>
				)}
			</main>
		</>
	);
}

export default Books;
