import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import "./styles/errors.css";

type ErrorPageProps = {
  code: "403" | "404" | "500";
  title: string;
  message: string;
};

function ErrorPage({ code, title, message }: ErrorPageProps) {
  return (
    <div className="error-page">
      <Header />
      <main className="error-content">
        <div className="error-code" aria-hidden="true">
          {code}
        </div>
        <p className="error-eyebrow">Big Space Studio</p>
        <h1>{title}</h1>
        <p className="error-message">{message}</p>
        <div className="error-actions">
          <Link to="/" className="nav-button">
            Back to home
          </Link>
          <Link to="/contacts" className="error-secondary-link">
            Contact us
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function Forbidden() {
  return (
    <ErrorPage
      code="403"
      title="Access denied"
      message="You do not have permission to view this page."
    />
  );
}

export function NotFound() {
  return (
    <ErrorPage
      code="404"
      title="Page not found"
      message="The page you are looking for may have moved or no longer exists."
    />
  );
}

export function ServerError() {
  return (
    <ErrorPage
      code="500"
      title="Something went wrong"
      message="We are having trouble loading this page. Please try again shortly."
    />
  );
}
