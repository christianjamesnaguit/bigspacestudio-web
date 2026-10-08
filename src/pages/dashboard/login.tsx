import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiError, login } from "../../api/auth";
import { useAuth } from "../../api/use-auth";
import "./auth.css";

function Login() {
	const navigate = useNavigate();
	const { authenticate } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(false);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			const response = await login(email, password, remember);
			authenticate(response.data.user);
			if (remember) {
				localStorage.setItem("remember-auth", "true");
			}
			navigate("/admin");
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to log in. Check your details and try again."));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="auth-page">
			<section className="auth-card" aria-labelledby="login-title">
				<div className="auth-topbar">
					<span className="auth-brand">
						BIG SPACE STUDIO
					</span>
					<Link className="auth-back" to="/">Return to Site</Link>
				</div>
				<div className="auth-heading">
					<p className="auth-eyebrow">Admin portal</p>
					<h1 id="login-title">Welcome back</h1>
					<p>Log in to manage your studio bookings and schedule.</p>
				</div>

				<form className="auth-form" onSubmit={handleSubmit}>
					<label htmlFor="login-email">Email address</label>
					<input id="login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

					<div className="auth-label-row">
						<label htmlFor="login-password">Password</label>
						<Link to="/recover">Forgot password?</Link>
					</div>
					<input id="login-password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />

					<label className="checkbox-label">
						<input name="remember" type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
						Remember me
					</label>

					{error && <p className="auth-error" role="alert">{error}</p>}
					<button type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Log in"}</button>
				</form>

				<p className="auth-switch">
					Don&apos;t have an account? <Link to="/signup">Create one</Link>
				</p>
			</section>
		</main>
	);
}

export default Login;
