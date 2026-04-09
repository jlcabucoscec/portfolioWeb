import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { usePortfolio } from "../hooks/usePortfolioData";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

const socialLinks = [
  { href: "https://github.com/jlcabucoscec", label: "GitHub" },
  { href: "https://www.facebook.com/jl.king.56863", label: "Facebook" },
  { href: "https://www.instagram.com/louiscabucos", label: "Instagram" },
];

function navClass({ isActive }) {
  return [
    "relative pb-1 text-sm font-bold tracking-tight transition-colors",
    isActive ? "text-[var(--primary)]" : "text-[var(--text-soft)] hover:text-[var(--primary)]",
  ].join(" ");
}

export default function PublicLayout() {
  const location = useLocation();
  const { data, loading, error } = usePortfolio();
  const brandName = "JLPortfolioDev";
  const brandTitle = data?.profile?.title || "Technical Portfolio";
  const footerCopy = data?.profile
    ? `${data.profile.name} brings together teaching, system development, and delivery-ready digital work in one portfolio experience.`
    : "A portfolio built around teaching, systems thinking, and delivery-ready digital work.";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--page-background)] text-[var(--text)]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(var(--grid-line)_1px,transparent_1px),linear-gradient(90deg,var(--grid-line)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(180deg,rgba(255,255,255,0.55),transparent)]" />

      <header className="sticky top-0 z-40 border-b border-[rgba(68,71,78,0.12)] bg-[var(--header-bg)] backdrop-blur-md">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-6 py-4 md:px-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <NavLink
            className="min-w-0 lg:justify-self-start lg:self-center"
            to="/"
          >
            <span className="block truncate text-lg font-extrabold tracking-[-0.05em] text-[var(--primary)] [font-family:var(--font-display)]">
              {brandName}
            </span>
            <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.22em] text-[var(--text-soft)] [font-family:var(--font-label)]">
              {brandTitle}
            </span>
          </NavLink>

          <nav
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:justify-self-center lg:self-center"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <NavLink key={link.to} className={navClass} to={link.to}>
                {({ isActive }) => (
                  <span className="relative">
                    {link.label}
                    {isActive ? (
                      <span className="absolute inset-x-0 -bottom-1.5 h-0.5 rounded-full bg-[var(--primary)]" />
                    ) : null}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-3 lg:justify-self-end lg:self-center">
            <NavLink
              className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-soft)] transition hover:text-[var(--primary)]"
              to="/login"
            >
              Admin
            </NavLink>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 pb-20 pt-24">
        {loading && !data ? (
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <div
              className="rounded-[24px] border border-[var(--outline)] bg-[var(--panel-bg)] p-10"
              style={{ boxShadow: "var(--shadow)" }}
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
                Loading Portfolio Data
              </p>
              <h1 className="text-4xl font-extrabold tracking-[-0.04em] [font-family:var(--font-display)]">
                Preparing the React portfolio.
              </h1>
            </div>
          </div>
        ) : error && !data ? (
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <div
              className="rounded-[24px] border border-[rgba(255,141,131,0.28)] bg-[var(--panel-bg)] p-10"
              style={{ boxShadow: "var(--shadow)" }}
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[var(--danger)] [font-family:var(--font-label)]">
                Backend Unavailable
              </p>
              <h1 className="text-4xl font-extrabold tracking-[-0.04em] [font-family:var(--font-display)]">
                {error}
              </h1>
              <p className="mt-4 max-w-2xl text-[var(--text-soft)]">
                Start the backend server to load the SQLite-backed portfolio data.
              </p>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <footer className="relative z-10 border-t border-[rgba(68,71,78,0.18)] bg-[var(--surface-low)]/80 py-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="max-w-2xl text-sm leading-7 text-[var(--text-soft)]">
            {footerCopy}
          </p>
          <div className="flex flex-wrap gap-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                className="transition hover:text-[var(--tertiary)]"
                href={link.href}
                rel="noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
