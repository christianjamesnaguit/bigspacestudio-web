import { Link } from "react-router-dom";
import "./auth.css";

function Signup() {
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
					<p className="auth-eyebrow">Admin portal</p>
					<h1 id="signup-title">Create an account</h1>
					<p>Set up your account to start managing studio work.</p>
				</div>

				<form className="auth-form" onSubmit={(event) => event.preventDefault()}>
					<label htmlFor="signup-name">Full name</label>
					<input id="signup-name" name="name" type="text" placeholder="Your name" autoComplete="name" required />

					<label htmlFor="signup-email">Email address</label>
					<input id="signup-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />

					<label htmlFor="signup-password">Password</label>
					<input id="signup-password" name="password" type="password" placeholder="Create a password" autoComplete="new-password" required />

					<label htmlFor="signup-confirm-password">Confirm password</label>
					<input id="signup-confirm-password" name="confirmPassword" type="password" placeholder="Repeat your password" autoComplete="new-password" required />

					<button type="submit">Create account</button>
				</form>

				<p className="auth-switch">
					Already have an account? <Link to="/login">Log in</Link>
				</p>
			</section>
		</main>
	);
}

export default Signup;
