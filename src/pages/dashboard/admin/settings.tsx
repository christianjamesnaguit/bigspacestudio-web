import { useState } from "react";
import Sidebar from "../../../components/dashboard/sidebar.tsx";
import { useAuth } from "../../../api/use-auth";
import "./styles/settings.css";

function Settings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <>
      <Sidebar />
      <main className="admin-body">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Settings</h1>
            <p className="page-description">
              Manage your account and studio preferences.
            </p>
          </div>
        </div>

        {saved && (
          <div className="settings-notice" role="status">
            Settings saved for this preview. Connect these fields to the API when persistence is ready.
          </div>
        )}

        <form className="settings-layout" onSubmit={handleSubmit}>
          <section className="dashboard-panel settings-panel">
            <div className="settings-panel-heading">
              <div>
                <p className="eyebrow">Account</p>
                <h2>Profile information</h2>
              </div>
              <p>Update the details used for your admin account.</p>
            </div>
            <div className="settings-fields">
              <label>
                First name
                <input name="firstName" type="text" defaultValue={user?.first_name ?? ""} />
              </label>
              <label>
                Last name
                <input name="lastName" type="text" defaultValue={user?.last_name ?? ""} />
              </label>
              <label className="settings-field-wide">
                Email address
                <input name="email" type="email" defaultValue={user?.email ?? ""} />
              </label>
            </div>
          </section>

          <section className="dashboard-panel settings-panel">
            <div className="settings-panel-heading">
              <div>
                <p className="eyebrow">Studio preferences</p>
                <h2>Booking defaults</h2>
              </div>
              <p>Set the defaults used when reviewing new bookings.</p>
            </div>
            <div className="settings-fields">
              <label>
                Default booking duration
                <select name="duration" defaultValue="2">
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                </select>
              </label>
              <label>
                Default booking status
                <select name="status" defaultValue="pending">
                  <option value="pending">Pending review</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </label>
              <label className="settings-checkbox settings-field-wide">
                <input name="autoConfirm" type="checkbox" />
                <span>
                  <strong>Automatically confirm requests</strong>
                  <small>Use this only when your schedule is fully up to date.</small>
                </span>
              </label>
            </div>
          </section>

          <section className="dashboard-panel settings-panel">
            <div className="settings-panel-heading">
              <div>
                <p className="eyebrow">Notifications</p>
                <h2>Email preferences</h2>
              </div>
              <p>Choose which updates should be sent to your inbox.</p>
            </div>
            <div className="settings-options">
              <label className="settings-checkbox">
                <input name="newBookings" type="checkbox" defaultChecked />
                <span>
                  <strong>New booking requests</strong>
                  <small>Get notified when a customer submits a request.</small>
                </span>
              </label>
              <label className="settings-checkbox">
                <input name="reminders" type="checkbox" defaultChecked />
                <span>
                  <strong>Upcoming booking reminders</strong>
                  <small>Receive a reminder before each confirmed session.</small>
                </span>
              </label>
              <label className="settings-checkbox">
                <input name="weeklySummary" type="checkbox" />
                <span>
                  <strong>Weekly studio summary</strong>
                  <small>Receive a summary of bookings and studio activity.</small>
                </span>
              </label>
            </div>
          </section>

          <div className="settings-actions">
            <button type="submit">Save changes</button>
          </div>
        </form>
      </main>
    </>
  );
}

export default Settings;