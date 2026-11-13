import { useCallback, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import { useAuth } from "../context/AuthContext";

/** Only allow same-origin relative paths to prevent open redirects. */
function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/app";
}

const FEATURES = [
  {
    title: "3D travel globe",
    body: "See every country and province you have visited or planned, highlighted on an interactive globe.",
  },
  {
    title: "Day-by-day itineraries",
    body: "Organise each day with sights, food, transport and stays — across multiple countries.",
  },
  {
    title: "Drafts welcome",
    body: "Not sure about dates yet? Start a draft and fill in the details when you're ready.",
  },
];

export default function LandingPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(params.get("login") === "1");

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setParams({}, { replace: true });
  }, [setParams]);

  const handleSuccess = useCallback(() => {
    setModalOpen(false);
    navigate(safeNext(params.get("next")), { replace: true });
  }, [navigate, params]);

  const isAuthed = status === "authenticated";
  const primaryCta = isAuthed ? (
    <Link to="/app" className="btn btn-primary btn-lg">
      Open my globe
    </Link>
  ) : (
    <button
      className="btn btn-primary btn-lg"
      onClick={() => setModalOpen(true)}
    >
      Start planning
    </button>
  );

  return (
    <div className="landing">
      <header className="topbar">
        <Link to="/" className="brand">
          drift
        </Link>
        {isAuthed ? (
          <Link to="/app" className="btn btn-ghost">
            Dashboard
          </Link>
        ) : (
          <button className="btn btn-ghost" onClick={() => setModalOpen(true)}>
            Log in
          </button>
        )}
      </header>

      <section className="hero">
        <h1>
          Plan trips. <span className="accent">Paint your world.</span>
        </h1>
        <p className="lead">
          Drift turns your travel plans into a living 3D globe. Build
          itineraries, track where you've been, and dream up where to go next.
        </p>
        {primaryCta}
      </section>

      <section className="features">
        {FEATURES.map((f) => (
          <article key={f.title} className="feature-card">
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </section>

      <footer className="landing-footer muted">
        © {new Date().getFullYear()} Drift
      </footer>

      <LoginModal
        open={modalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
