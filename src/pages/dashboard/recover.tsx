import { Link } from "react-router-dom";
import "./auth.css";

function Recover() {
	return (
		<main className="auth-page">
			<section className="auth-card" aria-labelledby="recover-title">
				<div className="auth-topbar">
					<span className="auth-brand">BIG SPACE STUDIO</span>
					<Link className="auth-back" to="/">Return to Site</Link>
				</div>
				<div className="auth-heading">
					<p className="auth-eyebrow">Account recovery</p>
					<h1 id="recover-title">Reset your password</h1>
					<p>Enter your email and we&apos;ll send you a link to reset your password.</p>
				</div>

				<form className="auth-form" onSubmit={(event) => event.preventDefault()}>
					<label htmlFor="recover-email">Email address</label>
					<input id="recover-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
					<button type="submit">Send reset link</button>
				</form>

				<p className="auth-switch">
					Remember your password? <Link to="/login">Back to login</Link>
				</p>
			</section>
		</main>
	);
}

export default Recover;
