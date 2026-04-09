import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInAdmin } from "../lib/firebaseAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      await signInAdmin(form.email, form.password);
      navigate("/admin");
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--auth-bg)] px-6 py-16 text-[var(--text)]">
      <div className="absolute -right-8 top-0 h-80 w-80 rounded-full bg-[rgba(77,144,255,0.24)] blur-[110px]" />
      <div className="absolute -left-8 bottom-0 h-72 w-72 rounded-full bg-[rgba(0,218,243,0.16)] blur-[110px]" />

      <div className="relative mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center">
        <div className="mb-10 text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(68,71,78,0.18)] bg-[var(--auth-badge-bg)] md:h-20 md:w-20"
            style={{ boxShadow: "0 20px 40px rgba(0,46,104,0.22)" }}
          >
            <span className="material-symbols-outlined text-4xl md:text-5xl text-[var(--primary)]">architecture</span>
          </div>
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
            Admin Access
          </p>
          <h1 className="text-5xl font-extrabold tracking-[-0.05em] [font-family:var(--font-display)]">
            Welcome Back, Architect
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[var(--text-soft)]">
            Authenticate to access the administrative terminal for the portfolio dashboard.
          </p>
        </div>

        <div
          className="w-full rounded-[28px] border border-[rgba(68,71,78,0.24)] bg-[var(--auth-card-bg)] p-8 backdrop-blur-xl md:p-10"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <form className="flex flex-col space-y-8" onSubmit={handleSubmit}>
            <label className="block" htmlFor="login-email">
              <span className="mb-3 block text-[10px] uppercase tracking-[0.26em] text-[var(--primary)] [font-family:var(--font-label)]">
                Identity / Email
              </span>
              <div className="relative border-b-2 border-[rgba(68,71,78,0.3)] transition-colors duration-300 focus-within:border-[var(--primary)]">
                <input
                  autoComplete="username"
                  className="w-full bg-transparent px-0 py-3 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none"
                  id="login-email"
                  placeholder="architect@tech.portfolio"
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
            </label>

            <label className="block" htmlFor="login-password">
              <span className="mb-3 block text-[10px] uppercase tracking-[0.26em] text-[var(--primary)] [font-family:var(--font-label)]">
                Security / Password
              </span>
              <div className="relative border-b-2 border-[rgba(68,71,78,0.3)] transition-colors duration-300 focus-within:border-[var(--primary)]">
                <input
                  autoComplete="current-password"
                  className="w-full bg-transparent px-0 py-3 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none"
                  id="login-password"
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                />
              </div>
            </label>

            <button
              className="w-full flex items-center justify-center rounded-2xl bg-[var(--primary)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary-button-text)] transition hover:-translate-y-0.5"
              disabled={loading}
              type="submit"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {error ? (
            <p className="mt-5 rounded-2xl border border-[rgba(255,141,131,0.28)] bg-[rgba(255,141,131,0.08)] px-5 py-4 text-sm text-[var(--danger)]">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-[0.22em] text-[var(--text-soft)] [font-family:var(--font-label)]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--tertiary)]" />
              <span>System Online</span>
            </div>
            <span className="hidden h-4 w-px bg-[rgba(68,71,78,0.45)] md:block" />
            <span>Encrypted Session</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[var(--text-soft)] transition hover:text-[var(--text)] [font-family:var(--font-label)]"
            to="/"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Return to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
