import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getApiError, requestPasswordReset, resetPassword } from "../../api/auth";
import "./auth.css";

function Recover() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const [email, setEmail] = useState(searchParams.get("email") ?? "");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setMessage("");

		if (token && password !== passwordConfirmation) {
			setError("Passwords do not match.");
			return;
		}

		setIsSubmitting(true);
		try {
			if (token) {
				await resetPassword(token, email, password, passwordConfirmation);
				navigate("/login", { state: { message: "Your password has been reset. You can now log in." } });
			} else {
				const response = await requestPasswordReset(email);
				setMessage(response.data.message);
			}
		} catch (requestError) {
			setError(getApiError(requestError, "We could not process that request. Please try again."));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="auth-page">
			<section className="auth-card" aria-labelledby="recover-title">
				<div className="auth-topbar">
					<span className="auth-brand">BIG SPACE STUDIO</span>
					<Link className="auth-back" to="/">Return to Site</Link>
				</div>
				<div className="auth-heading">
					<p className="auth-eyebrow">Account recovery</p>
					<h1 id="recover-title">{token ? "Choose a new password" : "Reset your password"}</h1>
					<p>{token ? "Create a new password for your account." : "Enter your email and we&apos;ll send you a link to reset your password."}</p>
				</div>

				<form className="auth-form" onSubmit={handleSubmit}>
					<label htmlFor="recover-email">Email address</label>
					<input id="recover-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

					{token && <>
						<label htmlFor="recover-password">New password</label>
						<input id="recover-password" name="password" type="password" placeholder="Create a new password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />

						<label htmlFor="recover-confirm-password">Confirm new password</label>
						<input id="recover-confirm-password" name="password_confirmation" type="password" placeholder="Repeat your new password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required />
					</>}

					{message && <p className="auth-success" role="status">{message}</p>}
					{error && <p className="auth-error" role="alert">{error}</p>}
					<button type="submit" disabled={isSubmitting}>{isSubmitting ? "Please wait..." : token ? "Reset password" : "Send reset link"}</button>
				</form>

				<p className="auth-switch">
					Remember your password? <Link to="/login">Back to login</Link>
				</p>
			</section>
		</main>
	);
}

export default Recover;
