import { Link } from "react-router-dom";
import "./auth.css";

function Login() {
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

				<form className="auth-form" onSubmit={(event) => event.preventDefault()}>
					<label htmlFor="login-email">Email address</label>
					<input id="login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />

					<div className="auth-label-row">
						<label htmlFor="login-password">Password</label>
						<Link to="/recover">Forgot password?</Link>
					</div>
					<input id="login-password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" required />

					<label className="checkbox-label">
						<input name="remember" type="checkbox" />
						Remember me
					</label>

					<button type="submit">Log in</button>
				</form>

				<p className="auth-switch">
					Don&apos;t have an account? <Link to="/signup">Create one</Link>
				</p>
			</section>
		</main>
	);
}

export default Login;
