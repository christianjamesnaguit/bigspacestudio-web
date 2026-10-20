import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Sidebar from "../../../components/dashboard/sidebar.tsx";
import { getApiError } from "../../../api/auth";
import { useAuth } from "../../../api/use-auth";
import {
	getDashboardSettings,
	updateDashboardSettings,
} from "../../../api/dashboard";
import type { DashboardPreferences } from "../../../api/dashboard";
import "./styles/settings.css";

const defaultPreferences: DashboardPreferences = {
	default_booking_duration: 2,
	default_booking_status: "pending",
	auto_confirm_requests: false,
	notify_new_bookings: true,
	notify_booking_reminders: true,
	notify_weekly_summary: false,
};

function Settings() {
	const { user, authenticate } = useAuth();
	const [firstName, setFirstName] = useState(user?.first_name ?? "");
	const [lastName, setLastName] = useState(user?.last_name ?? "");
	const [email, setEmail] = useState(user?.email ?? "");
	const [preferences, setPreferences] = useState(defaultPreferences);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		let active = true;
		getDashboardSettings()
			.then((settings) => {
				if (!active) return;
				setFirstName(settings.user.first_name);
				setLastName(settings.user.last_name);
				setEmail(settings.user.email);
				setPreferences({ ...defaultPreferences, ...settings.preferences });
			})
			.catch((requestError: unknown) => {
				if (active) setError(getApiError(requestError, "Unable to load settings."));
			})
			.finally(() => {
				if (active) setIsLoading(false);
			});
		return () => { active = false; };
	}, []);

	function updatePreference<Key extends keyof DashboardPreferences>(
		key: Key,
		value: DashboardPreferences[Key],
	) {
		setPreferences((current) => ({ ...current, [key]: value }));
		setSaved(false);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setSaved(false);
		setIsSaving(true);
		try {
			const response = await updateDashboardSettings({
				first_name: firstName,
				last_name: lastName,
				email,
				preferences,
			});
			authenticate(response.user);
			setPreferences({ ...defaultPreferences, ...response.preferences });
			setSaved(true);
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to save settings."));
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<>
			<Sidebar />
			<main className="admin-body settings-page">
				<div className="page-heading">
					<div>
						<p className="eyebrow">Workspace</p>
						<h1>Settings</h1>
						<p className="page-description">Manage your account and dashboard preferences.</p>
					</div>
				</div>

				{(error || saved) && (
					<div className={error ? "settings-notice settings-notice-error" : "settings-notice"} role={error ? "alert" : "status"}>
						{error || "Your changes have been saved."}
					</div>
				)}

				<form className="settings-layout" onSubmit={handleSubmit}>
					<section className="dashboard-panel settings-panel settings-profile-panel">
						<div className="settings-panel-heading">
							<div>
								<p className="eyebrow">Account</p>
								<h2>Profile information</h2>
							</div>
							<p>These details are used for your {user?.role === "Staff" ? "staff" : "admin"} account.</p>
						</div>
						<div className="settings-fields">
							<label>
								First name
								<input required maxLength={100} name="first_name" type="text" value={firstName} onChange={(event) => { setFirstName(event.target.value); setSaved(false); }} />
							</label>
							<label>
								Last name
								<input required maxLength={100} name="last_name" type="text" value={lastName} onChange={(event) => { setLastName(event.target.value); setSaved(false); }} />
							</label>
							{user?.role !== "Staff" && (
								<label className="settings-field-wide">
									Email address
									<input required maxLength={255} name="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSaved(false); }} />
								</label>
							)}
						</div>
					</section>

					<section className="dashboard-panel settings-panel">
						<div className="settings-panel-heading">
							<div>
								<p className="eyebrow">Studio preferences</p>
								<h2>Booking defaults</h2>
							</div>
							<p>Saved defaults for reviewing new bookings.</p>
						</div>
						<div className="settings-fields">
							<label>
								Default booking duration
								<select
									name="default_booking_duration"
									value={preferences.default_booking_duration}
									onChange={(event) => updatePreference("default_booking_duration", Number(event.target.value))}
								>
									<option value={1}>1 hour</option>
									<option value={2}>2 hours</option>
									<option value={3}>3 hours</option>
									<option value={4}>4 hours</option>
								</select>
							</label>
							<label>
								Default booking status
								<select
									name="default_booking_status"
									value={preferences.default_booking_status}
									onChange={(event) => updatePreference("default_booking_status", event.target.value as DashboardPreferences["default_booking_status"])}
								>
									<option value="pending">Pending review</option>
									<option value="confirmed">Confirmed</option>
								</select>
							</label>
							<label className="settings-checkbox settings-field-wide">
								<input
									checked={preferences.auto_confirm_requests}
									name="auto_confirm_requests"
									type="checkbox"
									onChange={(event) => updatePreference("auto_confirm_requests", event.target.checked)}
								/>
								<span>
									<strong>Automatically confirm requests</strong>
									<small>Save this preference for future booking workflow configuration.</small>
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
							<p>Choose which updates you prefer to receive.</p>
						</div>
						<div className="settings-options">
							<label className="settings-checkbox">
								<input checked={preferences.notify_new_bookings} name="notify_new_bookings" type="checkbox" onChange={(event) => updatePreference("notify_new_bookings", event.target.checked)} />
								<span><strong>New booking requests</strong><small>Get notified when a customer submits a request.</small></span>
							</label>
							<label className="settings-checkbox">
								<input checked={preferences.notify_booking_reminders} name="notify_booking_reminders" type="checkbox" onChange={(event) => updatePreference("notify_booking_reminders", event.target.checked)} />
								<span><strong>Upcoming booking reminders</strong><small>Receive a reminder before each confirmed session.</small></span>
							</label>
							<label className="settings-checkbox">
								<input checked={preferences.notify_weekly_summary} name="notify_weekly_summary" type="checkbox" onChange={(event) => updatePreference("notify_weekly_summary", event.target.checked)} />
								<span><strong>Weekly studio summary</strong><small>Receive a summary of bookings and studio activity.</small></span>
							</label>
						</div>
					</section>

					<div className="settings-actions">
						<span className="settings-save-hint">{isLoading ? "Loading saved settings..." : "Changes are saved to your account."}</span>
						<button type="submit" disabled={isLoading || isSaving}>
							{isSaving ? "Saving..." : "Save changes"}
						</button>
					</div>
				</form>
			</main>
		</>
	);
}

export default Settings;
