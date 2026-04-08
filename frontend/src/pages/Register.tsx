import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(username, password);
      navigate("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm rounded-lg border border-border-dark bg-bg-card p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-accent-yellow">
          Create Account
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              Username
              <span className="ml-1 text-xs text-text-secondary">(3-64 chars)</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={64}
              className="w-full rounded-lg border border-border-dark bg-bg-input px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              Password
              <span className="ml-1 text-xs text-text-secondary">(min 8 chars)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
              className="w-full rounded-lg border border-border-dark bg-bg-input px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent-green py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-blue hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
