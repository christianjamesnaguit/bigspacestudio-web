import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiError, register } from "../../api/auth";
import { useAuth } from "../../api/use-auth";
import "./auth.css";

function Signup() {
	const navigate = useNavigate();
	const { authenticate } = useAuth();
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		if (password !== passwordConfirmation) {
			setError("Passwords do not match.");
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await register(firstName, lastName, email, password, passwordConfirmation);
			authenticate(response.data.user);
			navigate("/admin");
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to create your account. Please try again."));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="auth-page">
			<section className="auth-card" aria-labelledby="signup-title">
				<div className="auth-topbar">
					<span className="auth-brand">
						BIG SPACE STUDIO
					</span>
					<Link className="auth-back" to="/">Return to Site</Link>
				</div>
				<div className="auth-heading">
					<p className="auth-eyebrow">Session Portal</p>
					<h1 id="signup-title">Create an account</h1>
					<p>Set up your account to start managing studio work.</p>
				</div>

				<form className="auth-form" onSubmit={handleSubmit}>
					<label htmlFor="signup-first-name">First name</label>
					<input id="signup-first-name" name="first_name" type="text" placeholder="Your first name" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />

					<label htmlFor="signup-last-name">Last name</label>
					<input id="signup-last-name" name="last_name" type="text" placeholder="Your last name" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} required />

					<label htmlFor="signup-email">Email address</label>
					<input id="signup-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

					<label htmlFor="signup-password">Password</label>
					<input id="signup-password" name="password" type="password" placeholder="Create a password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />

					<label htmlFor="signup-confirm-password">Confirm password</label>
					<input id="signup-confirm-password" name="password_confirmation" type="password" placeholder="Repeat your password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required />

					{error && <p className="auth-error" role="alert">{error}</p>}
					<button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</button>
				</form>

				<p className="auth-switch">
					Already have an account? <Link to="/login">Log in</Link>
				</p>
			</section>
		</main>
	);
}

export default Signup;
