import { useState } from "react";
import { fetchJSON } from "../api/client";
import { usePortfolio } from "../hooks/usePortfolioData";

const initialForm = {
  name: "",
  email: "",
  subject: "Project Inquiry",
  message: "",
};

export default function ContactPage() {
  const { data } = usePortfolio();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      await fetchJSON("/api/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus({ type: "success", message: "Message sent successfully. I will get back to you soon." });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="mx-auto mb-12 max-w-7xl px-6 md:px-8">
        <p className="mb-3 text-xs uppercase tracking-[0.32em] text-[var(--tertiary)] [font-family:var(--font-label)]">
          Availability: Open for new projects
        </p>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] md:text-6xl [font-family:var(--font-display)]">
          Get in <span className="text-[var(--primary)] italic">touch</span>
        </h1>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:grid-rows-[auto_1fr]">
          <article className="rounded-[18px] border border-[rgba(68,71,78,0.14)] bg-[var(--glass-card-bg)] p-6 md:p-7 backdrop-blur-md lg:col-start-1 lg:row-start-1">
            <p className="text-lg italic leading-7 text-[var(--text)] [font-family:var(--font-display)]">
              "Architecting digital experiences with precision and technical excellence."
            </p>
          </article>

          <article
            className="h-full rounded-[18px] border border-[rgba(68,71,78,0.14)] bg-[var(--surface-low)] p-6 md:p-7 lg:col-start-1 lg:row-start-2"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <h2 className="text-[1.9rem] font-bold tracking-[-0.04em] [font-family:var(--font-display)]">
              Contact Information
            </h2>
            <div className="mt-6 divide-y divide-[rgba(68,71,78,0.14)]">
              {data.contacts.map((contact) => (
                <div key={contact.id} className="grid grid-cols-[auto_1fr] gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="material-symbols-outlined pt-1 text-[1.35rem] text-[var(--tertiary)]">
                    {contact.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="mb-1.5 text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)] [font-family:var(--font-label)]">
                      {contact.label}
                    </p>
                    {contact.url ? (
                      <a
                        className="block text-base font-medium leading-7 transition hover:text-[var(--primary)]"
                        href={contact.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <p className="text-base font-medium leading-7">{contact.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="lg:col-start-2 lg:row-span-2">
            <article
              className="flex h-full flex-col rounded-[18px] border border-[rgba(68,71,78,0.14)] bg-[var(--panel-bg)] p-6 md:p-8"
              style={{ boxShadow: "var(--shadow)" }}
            >
              <div className="mx-auto flex h-full w-full max-w-[40rem] flex-col">
                <h3 className="text-[2rem] font-bold tracking-[-0.04em] [font-family:var(--font-display)]">
                  Send a Message
                </h3>

                <form className="mt-6 grid grow content-start grid-cols-1 gap-5" onSubmit={handleSubmit}>
                  <label className="grid min-w-0 gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)] [font-family:var(--font-label)]">
                      Full Name
                    </span>
                    <input
                      className="w-full rounded-[14px] border border-[var(--outline-strong)] bg-[var(--input-bg)] px-4 py-3.5 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:border-[var(--primary)] focus:ring-0"
                      placeholder="John Doe"
                      required
                      type="text"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    />
                  </label>

                  <label className="grid min-w-0 gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)] [font-family:var(--font-label)]">
                      Email Address
                    </span>
                    <input
                      className="w-full rounded-[14px] border border-[var(--outline-strong)] bg-[var(--input-bg)] px-4 py-3.5 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:border-[var(--primary)] focus:ring-0"
                      placeholder="john@example.com"
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    />
                  </label>

                  <label className="grid min-w-0 gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)] [font-family:var(--font-label)]">
                      Subject
                    </span>
                    <select
                      className="w-full appearance-none rounded-[14px] border border-[var(--outline-strong)] bg-[var(--input-bg)] px-4 py-3.5 text-[var(--text)] focus:border-[var(--primary)] focus:ring-0"
                      value={form.subject}
                      onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                    >
                      <option className="bg-[var(--surface-high)]">Project Inquiry</option>
                      <option className="bg-[var(--surface-high)]">Collaboration</option>
                      <option className="bg-[var(--surface-high)]">Technical Consultation</option>
                      <option className="bg-[var(--surface-high)]">Curriculum Work</option>
                    </select>
                  </label>

                  <label className="grid min-w-0 gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)] [font-family:var(--font-label)]">
                      Message
                    </span>
                    <textarea
                      className="min-h-[10rem] w-full resize-y rounded-[14px] border border-[var(--outline-strong)] bg-[var(--input-bg)] px-4 py-3.5 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:border-[var(--primary)] focus:ring-0 transition"
                      placeholder="Briefly describe your project or inquiry..."
                      required
                      rows="6"
                      value={form.message}
                      onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                    />
                  </label>

                  <div className="pt-1">
                    <button
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[var(--primary)] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary-button-text)] shadow-[0_0_24px_rgba(173,199,255,0.16)] transition hover:-translate-y-0.5"
                      disabled={submitting}
                      type="submit"
                    >
                      {submitting ? "Sending..." : "Send Message"}
                      <span className="material-symbols-outlined text-lg transition group-hover:translate-x-1">send</span>
                    </button>
                  </div>

                  {status.message ? (
                    <p
                      className={[
                        "rounded-[14px] border px-4 py-3 text-sm",
                        status.type === "error"
                          ? "border-[rgba(255,141,131,0.28)] bg-[rgba(255,141,131,0.08)] text-[var(--danger)]"
                          : "border-[rgba(173,199,255,0.24)] bg-[rgba(173,199,255,0.08)] text-[var(--primary)]",
                      ].join(" ")}
                    >
                      {status.message}
                    </p>
                  ) : null}
                </form>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
