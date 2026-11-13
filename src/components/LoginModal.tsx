import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { AuthError } from "../services";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    emailRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email, password });
      setPassword("");
      onSuccess();
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="login-title">Welcome back</h2>
        <p className="muted">
          Log in to see your travel globe and itineraries.
        </p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input
              ref={emailRef}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
        {import.meta.env.DEV && (
          <p className="hint">
            Demo account: <code>caoyun880@yahoo.com</code> / <code>baobeiwoaini</code>
          </p>
        )}
      </div>
    </div>
  );
}
