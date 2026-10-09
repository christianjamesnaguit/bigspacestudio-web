import "./styles/schedules.css";
import Sidebar from "../../../components/dashboard/sidebar.tsx";
import { useEffect, useMemo, useState } from "react";
import { getApiError } from "../../../api/auth";
import { getDashboardSchedules, type DashboardSchedule } from "../../../api/dashboard";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Schedules() {
	const [month, setMonth] = useState(() => new Date());
	const [schedules, setSchedules] = useState<DashboardSchedule[]>([]);
	const [error, setError] = useState("");
	const monthLabel = month.toLocaleDateString([], { month: "long", year: "numeric" });

	useEffect(() => {
		getDashboardSchedules()
			.then(setSchedules)
			.catch((requestError) => setError(getApiError(requestError, "Unable to load schedules.")));
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
			return date < 1 || date > daysInMonth ? null : { date, schedules: eventsByDate.get(date) ?? [] };
		});
	}, [month, schedules]);

	return (
		<>
			<Sidebar />
			<main className="admin-body">
				<div className="page-heading">
					<div>
						<p className="eyebrow">{monthLabel}</p>
						<h1>Schedule</h1>
						<p className="page-description">See what is happening in the studio this month.</p>
					</div>
					<button type="button">Add event</button>
				</div>

				<section className="dashboard-panel calendar-panel">
					<div className="calendar-toolbar">
						<button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>Previous</button>
						<strong>{monthLabel}</strong>
						<button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>Next</button>
					</div>
					{error && <p role="alert">{error}</p>}
					<div className="calendar-weekdays">
						{weekdays.map((day) => <span key={day}>{day}</span>)}
					</div>
					<div className="calendar-grid">
						{calendarDays.map((day, index) => (
							<article className={day ? "calendar-day" : "calendar-day empty-calendar-day"} key={day?.date ?? `empty-${index}`}>
								{day && <>
									<strong className="calendar-date">{day.date}</strong>
									<div className="calendar-events">
										{day.schedules.map((schedule) => (
											<p key={schedule.schedule_id}>
												{new Date(`1970-01-01T${schedule.start_time}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
												{" - "}
												{schedule.bookings?.[0]?.package.package_name ?? schedule.status}
											</p>
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
