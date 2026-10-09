import "./styles/booking.css";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import { useState } from "react";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const timeOptions = Array.from({ length: 10 }, (_, index) => index + 9)
  .flatMap((hour) =>
    [0, 30].map((minute) => {
      const displayHour = hour % 12 || 12;
      const period = hour < 12 ? "AM" : "PM";
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      return { value, label: `${displayHour}:${String(minute).padStart(2, "0")} ${period}` };
    }),
  )
  .concat({ value: "19:00", label: "7:00 PM" });

function dateValue(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function Booking() {
  const [selectedService, setSelectedService] = useState("Portrait Session");
  const [additionalPackage, setAdditionalPackage] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const today = new Date();
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
  const isCurrentMonth =
    calendarMonth.getFullYear() === today.getFullYear() &&
    calendarMonth.getMonth() === today.getMonth();

  return (
    <>
      <Header />
      <main className="body-margin booking-page">
        <section className="booking-intro">
          <p className="booking-eyebrow">BOOK YOUR SESSION</p>
          <h1>Let's make space for your moment.</h1>
          <p>
            This is a preview of the booking flow. Choose a service, find a
            schedule, and share your details so we can prepare your session.
          </p>
        </section>

        <div className="booking-layout">
          <form className="booking-form" onSubmit={(event) => event.preventDefault()}>
            <section className="booking-step">
              <div className="step-heading">
                <span>1</span>
                <div>
                  <h2>Choose a service</h2>
                  <p>Start by telling us what you need the studio for.</p>
                </div>
              </div>
              <div className="service-options">
                {[
                  ["Portrait Session", "Individual or couple portraits", "₱3,500"],
                  ["Creative Shoot", "Bring your concept to life", "₱5,000"],
                  ["Studio Rental", "A private space for your production", "₱1,500/hr"],
                ].map(([name, description, price]) => (
                  <label
                    className={`service-option${selectedService === name ? " selected" : ""}`}
                    key={name}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={name}
                      checked={selectedService === name}
                      onChange={() => setSelectedService(name)}
                    />
                    <span className="service-option-copy">
                      <strong>{name}</strong>
                      <small>{description}</small>
                    </span>
                    <span className="service-price">{price}</span>
                  </label>
                ))}
                <label
                  className={`service-option additional-package-option${selectedService === "Additional packages" ? " selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="service"
                    value="Additional packages"
                    checked={selectedService === "Additional packages"}
                    onChange={() => setSelectedService("Additional packages")}
                  />
                  <span className="service-option-copy">
                    <strong>Additional packages</strong>
                    <small>Explore other package options</small>
                  </span>
                  <select
                    aria-label="Choose an additional package"
                    value={additionalPackage}
                    onChange={(event) => {
                      setAdditionalPackage(event.target.value);
                      setSelectedService("Additional packages");
                    }}
                  >
                    <option value="">Choose package</option>
                    <option value="Extra retouched photos">Extra retouched photos</option>
                    <option value="Additional outfit">Additional outfit</option>
                    <option value="Makeup and styling">Makeup and styling</option>
                    <option value="Same-day preview">Same-day preview</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="booking-step">
              <div className="step-heading">
                <span>2</span>
                <div>
                  <h2>Find a date and time</h2>
                  <p>Availability will be connected here in the next phase.</p>
                </div>
              </div>
              <div className="booking-date-fields">
                <div className="booking-field">
                  <span className="booking-label">Preferred date</span>
                  <div className="simple-calendar">
                    <div className="calendar-heading">
                      <button
                        type="button"
                        aria-label="Previous month"
                        disabled={isCurrentMonth}
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                      >
                        &lt;
                      </button>
                      <strong>{currentMonth}</strong>
                      <button
                        type="button"
                        aria-label="Next month"
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                      >
                        &gt;
                      </button>
                    </div>
                    <div className="booking-calendar-grid booking-calendar-weekdays">
                      {weekdays.map((day) => <span key={day}>{day}</span>)}
                    </div>
                    <div className="booking-calendar-grid">
                      {days.map((day, index) => {
                        if (!day) {
                          return <span className="calendar-empty" key={`empty-${index}`} />;
                        }

                        const value = dateValue(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                        const isPast = value < dateValue(today.getFullYear(), today.getMonth(), today.getDate());

                        return (
                          <button
                            type="button"
                            className={selectedDate === value ? "booking-calendar-day selected" : "booking-calendar-day"}
                            disabled={isPast}
                            key={value}
                            onClick={() => setSelectedDate(value)}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="booking-time-fields">
                  <div className="booking-field">
                    <label htmlFor="booking-start-time">Start time</label>
                    <select
                      id="booking-start-time"
                      name="startTime"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                    >
                      <option value="">Select start time</option>
                      {timeOptions.map((time) => (
                        <option value={time.value} key={time.value}>{time.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="booking-field">
                    <label htmlFor="booking-end-time">End time</label>
                    <select
                      id="booking-end-time"
                      name="endTime"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                    >
                      <option value="">Select end time</option>
                      {timeOptions.map((time) => (
                        <option value={time.value} key={time.value}>{time.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section className="booking-step">
              <div className="step-heading">
                <span>3</span>
                <div>
                  <h2>Your details</h2>
                  <p>We will use these details to confirm your request.</p>
                </div>
              </div>
              <div className="booking-fields">
                <div className="booking-field">
                  <label htmlFor="booking-name">Full name</label>
                  <input id="booking-name" name="name" type="text" placeholder="Juan dela Cruz" />
                </div>
                <div className="booking-field">
                  <label htmlFor="booking-email">Email address</label>
                  <input id="booking-email" name="email" type="email" placeholder="you@example.com" />
                </div>
                <div className="booking-field booking-field-wide">
                  <label htmlFor="booking-notes">Project notes <span>(optional)</span></label>
                  <textarea id="booking-notes" name="notes" rows={4} placeholder="Tell us a little about your session..." />
                </div>
              </div>
            </section>

            <button className="booking-submit" type="submit">Request this booking</button>
            <p className="booking-disclaimer">
              Placeholder only — no booking will be submitted yet.
            </p>
          </form>

          <aside className="booking-summary">
            <p className="booking-eyebrow">YOUR REQUEST</p>
            <h2>Booking summary</h2>
            <div className="summary-item">
              <span>Service</span>
              <strong>
                {selectedService === "Additional packages" && additionalPackage
                  ? additionalPackage
                  : selectedService}
              </strong>
            </div>
            <div className="summary-item">
              <span>Date</span>
              <strong>{selectedDate || "Choose a date"}</strong>
            </div>
            <div className="summary-item">
              <span>Time</span>
              <strong>
                {startTime && endTime
                  ? `${startTime} - ${endTime}`
                  : "Choose start and end time"}
              </strong>
            </div>
            <hr />
            <div className="summary-next">
              <span>Next step</span>
              <p>After this form is connected, we can check availability and send a confirmation.</p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Booking;
