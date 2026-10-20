import "./styles/schedules.css";
import Sidebar from "../../../components/dashboard/sidebar.tsx";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { getApiError } from "../../../api/auth";
import {
	createDashboardSchedule,
	deleteDashboardSchedule,
	blockDashboardScheduleDate,
	getDashboardBlockedDates,
	getDashboardSchedules,
	unblockDashboardScheduleDate,
	updateDashboardSchedule,
	type DashboardSchedule,
	type ScheduleInput,
} from "../../../api/dashboard";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Schedules() {
	const [month, setMonth] = useState(() => new Date());
	const [schedules, setSchedules] = useState<DashboardSchedule[]>([]);
	const [blockedDates, setBlockedDates] = useState<string[]>([]);
	const [editingSchedule, setEditingSchedule] = useState<DashboardSchedule | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isDateActionPending, setIsDateActionPending] = useState(false);
	const monthLabel = month.toLocaleDateString([], { month: "long", year: "numeric" });

	async function loadSchedules() {
		const [scheduleRows, blockedDateRows] = await Promise.all([
			getDashboardSchedules(),
			getDashboardBlockedDates(),
		]);
		setSchedules(scheduleRows);
		setBlockedDates(blockedDateRows);
	}

	useEffect(() => {
		let isActive = true;
		Promise.all([getDashboardSchedules(), getDashboardBlockedDates()])
			.then(([rows, blockedDateRows]) => {
				if (isActive) {
					setSchedules(rows);
					setBlockedDates(blockedDateRows);
				}
			})
			.catch((requestError) => {
				if (isActive) {
					setError(getApiError(requestError, "Unable to load schedules."));
				}
			});
		return () => { isActive = false; };
	}, []);

	const calendarDays = useMemo(() => {
		const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
		const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
		const eventsByDate = new Map<number, DashboardSchedule[]>();

		schedules.forEach((schedule) => {
			const scheduleDate = new Date(`${schedule.schedule_date}T00:00:00`);
			if (scheduleDate.getFullYear() === month.getFullYear() && scheduleDate.getMonth() === month.getMonth()) {
				const daySchedules = eventsByDate.get(scheduleDate.getDate()) ?? [];
				eventsByDate.set(scheduleDate.getDate(), [...daySchedules, schedule]);
			}
		});

		return Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, index) => {
			const date = index - firstDay + 1;
			if (date < 1 || date > daysInMonth) return null;
			const scheduleDate = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
			return { date, scheduleDate, schedules: eventsByDate.get(date) ?? [] };
		});
	}, [month, schedules]);

	function isDateBlocked(daySchedules: DashboardSchedule[], scheduleDate: string) {
		return blockedDates.includes(scheduleDate) || daySchedules.some((schedule) =>
			schedule.status === "blocked"
			&& schedule.start_time.slice(0, 5) === "00:00"
			&& schedule.end_time.slice(0, 5) === "23:59",
		);
	}

	async function toggleDateBlock(scheduleDate: string, daySchedules: DashboardSchedule[]) {
		const blocked = isDateBlocked(daySchedules, scheduleDate);
		if (!blocked && daySchedules.some((schedule) => schedule.bookings?.some((booking) =>
			["pending", "approved", "confirmed"].includes(booking.booking_status),
		))) {
			setError("A date with active bookings cannot be blocked.");
			return;
		}
		setError("");
		setMessage("");
		setIsDateActionPending(true);
		try {
			if (blocked) {
				await unblockDashboardScheduleDate(scheduleDate);
				setMessage("Date unblocked. Existing schedule slots are available again.");
			} else {
				await blockDashboardScheduleDate(scheduleDate);
				setMessage("Date blocked from public booking.");
			}
			await loadSchedules();
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to update date availability."));
		} finally {
			setIsDateActionPending(false);
		}
	}

	function openForm(schedule: DashboardSchedule | null = null) {
		setEditingSchedule(schedule);
		setError("");
		setMessage("");
		setIsFormOpen(true);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const status = formData.get("status");
		if (status !== "available" && status !== "blocked") {
			setError("Choose a valid schedule status.");
			return;
		}
		const payload: ScheduleInput = {
			schedule_date: String(formData.get("schedule_date")),
			start_time: String(formData.get("start_time")),
			end_time: String(formData.get("end_time")),
			status,
		};
		setError("");
		setMessage("");
		setIsSaving(true);
		try {
			if (editingSchedule) {
				await updateDashboardSchedule(editingSchedule.schedule_id, payload);
				setMessage("Schedule updated.");
			} else {
				await createDashboardSchedule(payload);
				setMessage("Schedule created.");
			}
			setIsFormOpen(false);
			setEditingSchedule(null);
			try {
				await loadSchedules();
			} catch (requestError) {
				setError(getApiError(requestError, "Schedule saved, but the calendar could not be refreshed. Reload the page."));
			}
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to save schedule."));
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete(schedule: DashboardSchedule) {
		if (!window.confirm("Delete this schedule? Schedules with booking history cannot be deleted.")) {
			return;
		}
		setError("");
		setMessage("");
		try {
			await deleteDashboardSchedule(schedule.schedule_id);
			setMessage("Schedule deleted.");
			try {
				await loadSchedules();
			} catch (requestError) {
				setError(getApiError(requestError, "Schedule deleted, but the calendar could not be refreshed. Reload the page."));
			}
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to delete schedule."));
		}
	}

	return (
		<>
			<Sidebar />
			<main className="admin-body">
				<div className="page-heading">
					<div>
						<p className="eyebrow">{monthLabel}</p>
						<h1>Schedule</h1>
						<p className="page-description">Set available time slots and block whole dates when the studio is unavailable.</p>
					</div>
				</div>

				{(error || message) && <p className={error ? "crud-error" : "crud-success"} role={error ? "alert" : "status"}>{error || message}</p>}
				{isFormOpen && (
					<form className="dashboard-panel crud-form page-panel" onSubmit={handleSubmit}>
						<h2>{editingSchedule ? "Edit schedule" : "Add schedule"}</h2>
						<div className="crud-fields">
							<label>Date<input required type="date" name="schedule_date" defaultValue={editingSchedule?.schedule_date ?? ""} /></label>
							<label>Start time<input required type="time" name="start_time" defaultValue={editingSchedule?.start_time.slice(0, 5) ?? ""} /></label>
							<label>End time<input required type="time" name="end_time" defaultValue={editingSchedule?.end_time.slice(0, 5) ?? ""} /></label>
							<label>Status
								<select name="status" defaultValue={editingSchedule?.status === "blocked" ? "blocked" : "available"}>
									<option value="available">Available</option>
									<option value="blocked">Blocked</option>
								</select>
							</label>
						</div>
						{editingSchedule?.status === "booked" && <p>This schedule has an active booking. Its booked status is managed automatically.</p>}
						<div className="crud-actions">
							<button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save schedule"}</button>
							<button type="button" className="crud-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
						</div>
					</form>
				)}

				<section className="dashboard-panel calendar-panel">
					<div className="calendar-toolbar">
						<button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>Previous</button>
						<strong>{monthLabel}</strong>
						<button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>Next</button>
					</div>
					<div className="calendar-weekdays">
						{weekdays.map((day) => <span key={day}>{day}</span>)}
					</div>
					<div className="calendar-grid">
						{calendarDays.map((day, index) => (
							<article className={day ? `calendar-day${isDateBlocked(day.schedules, day.scheduleDate) ? " calendar-day-blocked" : ""}` : "calendar-day empty-calendar-day"} key={day?.date ?? `empty-${index}`}>
								{day && <>
									<div className="calendar-day-heading">
										<strong className="calendar-date">{day.date}</strong>
										<button
											type="button"
											className={isDateBlocked(day.schedules, day.scheduleDate) ? "calendar-date-action calendar-date-unblock" : "calendar-date-action"}
											disabled={isDateActionPending || (!isDateBlocked(day.schedules, day.scheduleDate) && day.schedules.some((schedule) => schedule.bookings?.some((booking) =>
												["pending", "approved", "confirmed"].includes(booking.booking_status),
											)))}
											onClick={() => toggleDateBlock(day.scheduleDate, day.schedules)}
										>
											{isDateBlocked(day.schedules, day.scheduleDate) ? "Unblock" : "Block date"}
										</button>
									</div>
									{isDateBlocked(day.schedules, day.scheduleDate) && <span className="calendar-blocked-label">Unavailable all day</span>}
									<div className="calendar-events">
										{day.schedules.filter((schedule) => schedule.status !== "available").map((schedule) => (
											<div className="calendar-event" key={schedule.schedule_id}>
												<p>
													{isDateBlocked([schedule], day.scheduleDate)
														? "Unavailable all day"
														: `${new Date(`1970-01-01T${schedule.start_time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${schedule.bookings?.[0]?.package.package_name ?? schedule.status}`}
												</p>
												{schedule.status === "blocked" && !isDateBlocked([schedule], day.scheduleDate) && <div className="crud-row-actions">
													<button type="button" className="crud-secondary" onClick={() => openForm(schedule)}>Edit</button>
													<button type="button" className="crud-danger" onClick={() => handleDelete(schedule)}>Delete</button>
												</div>}
											</div>
										))}
									</div>
								</>}
							</article>
						))}
					</div>
				</section>
			</main>
		</>
	);
}

export default Schedules;
