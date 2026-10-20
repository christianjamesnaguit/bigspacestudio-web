import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiError, login } from "../../api/auth";
import { useAuth } from "../../api/use-auth";
import "./auth.css";

type LoginProps = {
	modal?: boolean;
	onClose?: () => void;
};

function Login({ modal = false, onClose }: LoginProps) {
	const navigate = useNavigate();
	const { authenticate } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(false);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	const handleClose = useCallback(() => {
		if (isClosing) {
			return;
		}

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			onClose?.();
			return;
		}

		setIsClosing(true);
		window.setTimeout(() => onClose?.(), 180);
	}, [isClosing, onClose]);

	useEffect(() => {
		if (!modal) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				handleClose();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [modal, handleClose]);

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
			navigate(["Admin", "Staff"].includes(response.data.user.role) ? "/admin" : "/");
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to log in. Check your details and try again."));
		} finally {
			setIsSubmitting(false);
		}
	}

	const content = (
			<section className="auth-card" aria-labelledby="login-title">
				<div className="auth-topbar">
					<span className="auth-brand">
						BIG SPACE STUDIO
					</span>
					{modal ? (
						<button className="auth-close" type="button" onClick={handleClose} aria-label="Close login">
							&times;
						</button>
					) : (
						<Link className="auth-back" to="/">Return to Site</Link>
					)}
				</div>
				<div className="auth-heading">
					<p className="auth-eyebrow">Session Portal</p>
					<h1 id="login-title">Welcome back</h1>
					<p>Log in to manage your studio bookings and schedule.</p>
				</div>

				<form className="auth-form" onSubmit={handleSubmit}>
					<label htmlFor="login-email">Email address</label>
					<input id="login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

					<label htmlFor="login-password">Password</label>
					<input id="login-password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />

					<div className="auth-options">
						<label className="checkbox-label">
							<input name="remember" type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
							Remember me
						</label>
						<Link to="/recover">Forgot password?</Link>
					</div>

					{error && <p className="auth-error" role="alert">{error}</p>}
					<button type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Log in"}</button>
				</form>

				<p className="auth-switch">
					Don&apos;t have an account? <Link to="/signup">Create one</Link>
				</p>
			</section>
	);

	if (modal) {
		return (
			<div className={`auth-modal${isClosing ? " is-closing" : ""}`} role="dialog" aria-modal="true" aria-labelledby="login-title" onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					handleClose();
				}
			}}>
				{content}
			</div>
		);
	}

	return (
		<main className="auth-page">
			{content}
		</main>
	);
}

export default Login;
