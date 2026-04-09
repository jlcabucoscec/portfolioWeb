import { Link } from "react-router-dom";
import FeaturedProjectCard from "../components/FeaturedProjectCard";
import { usePortfolio } from "../hooks/usePortfolioData";

function Stat({ label, value }) {
  return (
    <div className="min-w-[7rem]">
      <div className="text-3xl font-extrabold text-[var(--tertiary)] [font-family:var(--font-display)]">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[var(--text-soft)] [font-family:var(--font-label)]">
        {label}
      </div>
    </div>
  );
}

function FocusTile({ description, icon, title }) {
  return (
    <article
      className="relative flex flex-col gap-4 overflow-hidden rounded-[18px] border border-[rgba(68,71,78,0.16)] bg-[var(--panel-bg)] p-5 text-left lg:h-full"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--tertiary),transparent)] opacity-80" />
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center text-[1.35rem] text-[var(--tertiary)]">
          {icon}
        </span>
        <h3 className="text-lg font-bold tracking-[-0.03em] [font-family:var(--font-display)]">{title}</h3>
      </div>
      <p className="text-sm leading-6 text-[var(--text-soft)]">{description}</p>
    </article>
  );
}

export default function HomePage() {
  const { data } = usePortfolio();
  const profile = data.profile;
  const featuredProjects = data.projects.filter((project) => project.featured).slice(0, 3);
  const skillPreview = data.skills.slice(0, 6);
  const nameParts = profile.name.split(" ");

  return (
    <>
      <section className="relative mx-auto mb-20 max-w-7xl px-6 md:px-8">
        <div className="absolute -right-12 -top-20 h-72 w-72 rounded-full bg-[#00295d]/25 blur-[120px]" />
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--soft-badge-bg)] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[var(--secondary)] [font-family:var(--font-label)]">
              <span className="h-2 w-2 rounded-full bg-[var(--tertiary)]" />
              {profile.availability}
            </div>

            <h1 className="text-5xl font-extrabold leading-[0.88] tracking-[-0.06em] text-[var(--text)] sm:text-7xl lg:text-8xl [font-family:var(--font-display)]">
              {nameParts.slice(0, 3).join(" ")} <span className="block text-[var(--primary)]">{nameParts.slice(3).join(" ")}</span>
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-relaxed text-[var(--text-soft)] md:text-2xl">
              {profile.tagline}
            </p>

            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--text-soft)]">{profile.summary}</p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                className="group inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary-button-text)] shadow-[0_0_24px_rgba(173,199,255,0.2)] transition hover:-translate-y-0.5"
                to="/projects"
              >
                View Projects
                <span className="material-symbols-outlined text-lg transition group-hover:translate-x-1">arrow_forward</span>
              </Link>
              <Link
                className="inline-flex items-center rounded-xl border border-[rgba(68,71,78,0.25)] bg-[var(--glass-card-bg)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--text)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[rgba(173,199,255,0.25)]"
                to="/contact"
              >
                Contact Me
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-5 lg:pb-14">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[28px] bg-[rgba(173,199,255,0.08)] transition duration-500 group-hover:translate-x-0" />
            <div
              className="relative overflow-hidden rounded-[28px] border border-[rgba(68,71,78,0.18)] bg-[var(--surface-low)]"
              style={{ boxShadow: "var(--shadow)" }}
            >
              {profile.profileImageUrl ? (
                <img
                  alt={profile.profileImageAlt || profile.name}
                  className="aspect-[4/5] w-full object-cover"
                  src={profile.profileImageUrl}
                />
              ) : (
                <div className="flex aspect-[4/5] items-end bg-[var(--hero-identity-bg)] p-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[var(--secondary)] [font-family:var(--font-label)]">
                      Portfolio Identity
                    </p>
                    <h2 className="mt-3 max-w-[10ch] text-4xl font-extrabold tracking-[-0.05em] [font-family:var(--font-display)]">
                      The Technical Architect
                    </h2>
                  </div>
                </div>
              )}
            </div>

            <div
              className="mt-5 rounded-2xl border border-[rgba(68,71,78,0.22)] bg-[var(--glass-card-strong-bg)] p-5 backdrop-blur-xl lg:absolute lg:-bottom-6 lg:left-4 lg:mt-0 xl:-left-10"
              style={{ boxShadow: "0 32px 40px rgba(0, 46, 104, 0.34)" }}
            >
              <div className="flex flex-wrap gap-5 sm:flex-nowrap sm:gap-6">
                <Stat label="Years of Craft" value={`${profile.yearsOfCraft}+`} />
                <div className="h-12 w-px bg-[rgba(68,71,78,0.35)]" />
                <Stat label="Projects Shipped" value={profile.projectsShipped} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-20 max-w-7xl px-6 md:px-8">
        <div className="grid gap-6 lg:auto-rows-fr lg:grid-cols-[1.25fr_0.75fr_0.75fr]">
          <article
            className="flex min-h-[24rem] flex-col justify-between rounded-[24px] border border-[rgba(68,71,78,0.12)] bg-[var(--surface-low)] p-8 lg:row-span-2"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <div>
              <div className="mb-8 flex items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-[var(--tertiary)]">terminal</span>
                <h3 className="text-2xl font-bold [font-family:var(--font-display)]">The Technical Architect</h3>
              </div>
              <p className="max-w-xl text-base leading-8 text-[var(--text-soft)]">
                {profile.focusSummary}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {skillPreview.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-md border border-[rgba(68,71,78,0.12)] bg-[var(--surface-high)] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[var(--secondary)] [font-family:var(--font-label)]"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </article>

          <FocusTile
            description="Structured learning flows turn technical subjects into guided, repeatable classroom delivery."
            icon="school"
            title="Teaching Mechanism"
          />

          <FocusTile
            description="Reusable components and scalable page patterns keep the product easier to extend and maintain."
            icon="precision_manufacturing"
            title="Modular Design"
          />

          <FocusTile
            description="Readable architecture and organized implementation keep every system dependable after launch."
            icon="auto_awesome"
            title="Clean Systems"
          />

          <FocusTile
            description="Projects move quickly, but delivery still stays grounded in QA, clarity, and long-term upkeep."
            icon="bolt"
            title="Fast Delivery"
          />
        </div>
      </section>

      <section className="bg-[var(--surface-low)] py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.36em] text-[var(--tertiary)] [font-family:var(--font-label)]">
                Selected Works
              </p>
              <h2 className="text-3xl font-bold tracking-[-0.04em] [font-family:var(--font-display)] md:text-4xl">
                Featured Projects
              </h2>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary)]"
              to="/projects"
            >
              View All
              <span className="material-symbols-outlined text-base">open_in_new</span>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {featuredProjects.map((project) => (
              <FeaturedProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
