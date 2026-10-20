import "./styles/booking.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import { useEffect, useMemo, useState } from "react";
import { getApiError } from "../api/auth";
import {
	getPublicBookingOptions,
	submitPublicBooking,
} from "../api/public-booking";
import type {
	AvailableSchedule,
	PublicPackage,
} from "../api/public-booking";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateValue(year: number, month: number, day: number) {
	return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatTime(time: string) {
	const [hourValue, minute] = time.split(":").map(Number);
	const period = hourValue >= 12 ? "PM" : "AM";
	const hour = hourValue % 12 || 12;
	return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

function formatPrice(price: string) {
	return new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
		maximumFractionDigits: 2,
	}).format(Number(price));
}

function scheduleDurationMinutes(schedule: AvailableSchedule) {
	const [startHour, startMinute] = schedule.start_time.split(":").map(Number);
	const [endHour, endMinute] = schedule.end_time.split(":").map(Number);
	return endHour * 60 + endMinute - startHour * 60 - startMinute;
}

function Booking() {
	const today = new Date();
	const [packages, setPackages] = useState<PublicPackage[]>([]);
	const [schedules, setSchedules] = useState<AvailableSchedule[]>([]);
	const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
	const [selectedDate, setSelectedDate] = useState("");
	const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
	const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [requests, setRequests] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [confirmation, setConfirmation] = useState<number | null>(null);

	useEffect(() => {
		let active = true;
		getPublicBookingOptions()
			.then((options) => {
				if (!active) return;
				setPackages(options.packages);
				setSchedules(options.schedules);
				setSelectedPackageId(options.packages[0]?.package_id ?? null);
			})
			.catch((requestError: unknown) => {
				if (active) setError(getApiError(requestError, "Unable to load booking options."));
			})
			.finally(() => {
				if (active) setIsLoading(false);
			});
		return () => { active = false; };
	}, []);

	const selectedPackage = packages.find((item) => item.package_id === selectedPackageId) ?? null;
	const selectedSchedule = schedules.find((item) => item.schedule_id === selectedScheduleId) ?? null;
	const packageSchedules = useMemo(
		() => schedules.filter((schedule) => !selectedPackage
			|| selectedPackage.pricing_type === "hourly"
			|| scheduleDurationMinutes(schedule) >= selectedPackage.duration_minutes),
		[schedules, selectedPackage],
	);
	const availableDates = useMemo(
		() => new Set(packageSchedules.map((schedule) => schedule.schedule_date)),
		[packageSchedules],
	);
	const dateSchedules = packageSchedules.filter((schedule) => schedule.schedule_date === selectedDate);
	const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
	const daysInMonth = new Date(
		calendarMonth.getFullYear(),
		calendarMonth.getMonth() + 1,
		0,
	).getDate();
	const days = [
		...Array.from({ length: firstDay }, () => null),
		...Array.from({ length: daysInMonth }, (_, index) => index + 1),
	];
	const currentMonth = `${calendarMonth.toLocaleString("en-US", { month: "long" })} ${calendarMonth.getFullYear()}`;
	const todayValue = dateValue(today.getFullYear(), today.getMonth(), today.getDate());
	const maxDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
	const maxDateValue = dateValue(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
	const isCurrentMonth = calendarMonth.getFullYear() === today.getFullYear()
		&& calendarMonth.getMonth() === today.getMonth();
	const isLastMonth = calendarMonth.getFullYear() === maxDate.getFullYear()
		&& calendarMonth.getMonth() === maxDate.getMonth();
	const packageTotal = selectedPackage?.pricing_type === "hourly" && selectedSchedule
		? String(Number(selectedPackage.price) * scheduleDurationMinutes(selectedSchedule) / 60)
		: selectedPackage?.price ?? "";

	function changeMonth(offset: number) {
		setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
		setSelectedDate("");
		setSelectedScheduleId(null);
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!selectedPackage || !selectedSchedule) {
			setError("Choose a package and an available time slot to continue.");
			return;
		}

		setError("");
		setConfirmation(null);
		setIsSubmitting(true);
		try {
			const response = await submitPublicBooking({
				first_name: firstName.trim(),
				last_name: lastName.trim(),
				email: email.trim(),
				package_id: selectedPackage.package_id,
				schedule_id: selectedSchedule.schedule_id,
				requests: requests.trim(),
			});
			setConfirmation(response.booking.booking_id);
			setSchedules((current) => current.filter((slot) => slot.schedule_id !== selectedSchedule.schedule_id));
			setSelectedDate("");
			setSelectedScheduleId(null);
			setFirstName("");
			setLastName("");
			setEmail("");
			setRequests("");
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to submit your booking request."));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<>
			<Header />
			<main className="body-margin booking-page">
				<section className="booking-intro">
					<p className="booking-eyebrow">BOOK YOUR SESSION</p>
					<h1>Let's make space for your moment.</h1>
					<p>Choose an active package and an available studio time. Your request will be reviewed by our team.</p>
				</section>

				{confirmation !== null && (
					<div className="booking-feedback booking-feedback-success" role="status">
						<strong>Booking request submitted.</strong>
						<span>Request #{confirmation} is pending review. Our team will contact you to confirm the booking.</span>
					</div>
				)}
				{error && <div className="booking-feedback booking-feedback-error" role="alert">{error}</div>}

				<div className="booking-layout">
					<form className="booking-form" onSubmit={handleSubmit}>
						<section className="booking-step">
							<div className="step-heading">
								<span>1</span>
								<div>
									<h2>Choose a package</h2>
									<p>Select the service you would like to book.</p>
								</div>
							</div>
							{isLoading ? <p role="status">Loading packages...</p> : packages.length === 0 ? (
								<p className="booking-empty">There are no active packages available right now. Please check back later.</p>
							) : (
								<div className="service-options">
									{packages.map((item) => (
										<label
											className={`service-option${selectedPackageId === item.package_id ? " selected" : ""}`}
											key={item.package_id}
										>
											<input
												type="radio"
												name="package"
												value={item.package_id}
												checked={selectedPackageId === item.package_id}
												onChange={() => { setSelectedPackageId(item.package_id); setSelectedScheduleId(null); }}
											/>
											<span className="service-option-copy">
												<strong>{item.package_name}</strong>
												<small>{item.description}</small>
												{item.duration_minutes > 0 && <small>{item.duration_minutes} minutes</small>}
											</span>
											<span className="service-price">
												{formatPrice(item.price)}{item.pricing_type === "hourly" ? " / hour" : ""}
											</span>
										</label>
									))}
								</div>
							)}
						</section>

						<section className="booking-step">
							<div className="step-heading">
								<span>2</span>
								<div>
									<h2>Find a date and time</h2>
									<p>Only slots published by the studio are available to request.</p>
								</div>
							</div>
							<div className="booking-date-fields">
								<div className="booking-field">
									<span className="booking-label">Available dates</span>
									<div className="simple-calendar">
										<div className="calendar-heading">
											<button type="button" aria-label="Previous month" disabled={isCurrentMonth} onClick={() => changeMonth(-1)}>&lt;</button>
											<strong>{currentMonth}</strong>
											<button type="button" aria-label="Next month" disabled={isLastMonth} onClick={() => changeMonth(1)}>&gt;</button>
										</div>
										<div className="booking-calendar-grid booking-calendar-weekdays">
											{weekdays.map((day) => <span key={day}>{day}</span>)}
										</div>
										<div className="booking-calendar-grid">
											{days.map((day, index) => {
												if (!day) return <span className="calendar-empty" key={`empty-${index}`} />;
												const value = dateValue(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
												const unavailable = value < todayValue || value > maxDateValue || !availableDates.has(value);
												return (
													<button
														type="button"
														className={`booking-calendar-day${selectedDate === value ? " selected" : ""}${availableDates.has(value) ? " has-availability" : ""}`}
														disabled={unavailable}
														key={value}
														onClick={() => { setSelectedDate(value); setSelectedScheduleId(null); }}
													>
														{day}
													</button>
												);
											})}
										</div>
									</div>
								</div>
								<div className="booking-time-fields">
									<span className="booking-label">Available times</span>
									{dateSchedules.length > 0 ? dateSchedules.map((slot) => (
										<button
											className={`booking-slot${selectedScheduleId === slot.schedule_id ? " selected" : ""}`}
											key={slot.schedule_id}
											type="button"
											onClick={() => setSelectedScheduleId(slot.schedule_id)}
										>
											{formatTime(slot.start_time)} – {formatTime(slot.end_time)}
										</button>
									)) : (
										<p className="booking-empty">{selectedDate ? "No times remain on this date." : "Choose a highlighted date to view times."}</p>
									)}
								</div>
							</div>
						</section>

						<section className="booking-step">
							<div className="step-heading">
								<span>3</span>
								<div>
									<h2>Your details</h2>
									<p>We will use these details to review your request.</p>
								</div>
							</div>
							<div className="booking-fields">
								<div className="booking-field">
									<label htmlFor="booking-first-name">First name</label>
									<input id="booking-first-name" autoComplete="given-name" maxLength={100} required value={firstName} onChange={(event) => setFirstName(event.target.value)} />
								</div>
								<div className="booking-field">
									<label htmlFor="booking-last-name">Last name</label>
									<input id="booking-last-name" autoComplete="family-name" maxLength={100} required value={lastName} onChange={(event) => setLastName(event.target.value)} />
								</div>
								<div className="booking-field booking-field-wide">
									<label htmlFor="booking-email">Email address</label>
									<input id="booking-email" autoComplete="email" maxLength={255} required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
								</div>
								<div className="booking-field booking-field-wide">
									<label htmlFor="booking-notes">Project notes <span>(optional)</span></label>
									<textarea id="booking-notes" rows={4} maxLength={10000} value={requests} onChange={(event) => setRequests(event.target.value)} placeholder="Tell us a little about your session..." />
								</div>
							</div>
						</section>

						<button className="booking-submit" type="submit" disabled={isLoading || isSubmitting || !selectedPackage || !selectedSchedule}>
							{isSubmitting ? "Submitting request..." : "Request this booking"}
						</button>
						<p className="booking-disclaimer">Your time slot is reserved while the request is reviewed. This request is not confirmed until our team contacts you.</p>
					</form>

					<aside className="booking-summary">
						<p className="booking-eyebrow">YOUR REQUEST</p>
						<h2>Booking summary</h2>
						<div className="summary-item">
							<span>Package</span>
							<strong>{selectedPackage?.package_name ?? "Choose a package"}</strong>
						</div>
						<div className="summary-item">
							<span>Date</span>
							<strong>{selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString() : "Choose an available date"}</strong>
						</div>
						<div className="summary-item">
							<span>Time</span>
							<strong>{selectedSchedule ? `${formatTime(selectedSchedule.start_time)} – ${formatTime(selectedSchedule.end_time)}` : "Choose an available time"}</strong>
						</div>
						<hr />
						<div className="summary-item booking-summary-total">
							<span>{selectedPackage?.pricing_type === "hourly" ? "Estimated rental total" : "Package price"}</span>
							<strong>{packageTotal ? formatPrice(packageTotal) : selectedPackage?.pricing_type === "hourly" ? `${formatPrice(selectedPackage.price)} / hour` : "—"}</strong>
						</div>
						<div className="summary-next">
							<span>After you submit</span>
							<p>Your request will be marked pending. The studio team will review it and get in touch.</p>
						</div>
					</aside>
				</div>
			</main>
			<Footer />
		</>
	);
}

export default Booking;
