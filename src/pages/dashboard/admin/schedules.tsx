import "./styles/schedules.css";
import Sidebar from "../../../components/dashboard/sidebar.tsx";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const eventsByDate = new Map<number, string[]>([
	[5, ["10:00 AM Maya Chen", "2:00 PM Northstar"]],
	[6, ["9:00 AM Studio setup"]],
	[7, ["1:00 PM Editing"]],
	[9, ["9:00 AM Lowlight Films", "3:00 PM Equipment return"]],
	[10, ["11:00 AM Open studio"]],
]);

const calendarDays = Array.from({ length: 35 }, (_, index) => {
	const date = index - 3;

	if (date < 1 || date > 31) {
		return null;
	}

	return { date, events: eventsByDate.get(date) ?? [] };
});

function Schedules() {
	return (
		<>
			<Sidebar />
			<main className="admin-body">
				<div className="page-heading">
					<div>
						<p className="eyebrow">October 2026</p>
						<h1>Schedule</h1>
						<p className="page-description">See what is happening in the studio this month.</p>
					</div>
					<button type="button">Add event</button>
				</div>

				<section className="dashboard-panel calendar-panel">
					<div className="calendar-toolbar"><button type="button">Previous</button><strong>October 2026</strong><button type="button">Next</button></div>
					<div className="calendar-weekdays">
						{weekdays.map((day) => <span key={day}>{day}</span>)}
					</div>
					<div className="calendar-grid">
						{calendarDays.map((day, index) => (
							<article className={day ? "calendar-day" : "calendar-day empty-calendar-day"} key={day?.date ?? `empty-${index}`}>
								{day && <>
									<strong className="calendar-date">{day.date}</strong>
									<div className="calendar-events">
										{day.events.map((event) => <p key={event}>{event}</p>)}
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
