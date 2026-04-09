import { useState, useEffect } from "react";
import { usePortfolio } from "../hooks/usePortfolioData";

function groupSkills(skills) {
  return skills.reduce((groups, skill) => {
    groups[skill.category] ||= [];
    groups[skill.category].push(skill);
    return groups;
  }, {});
}

export default function AboutPage() {
  const { data } = usePortfolio();
  const skillGroups = Object.entries(groupSkills(data.skills));
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerScreen = 3;
  const totalScreens = Math.ceil(skillGroups.length / itemsPerScreen);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalScreens);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalScreens]);

  const strengths = [
    "Front-end development and clean interface implementation",
    "Programming fundamentals and practical technical instruction",
    "System development for classrooms, administration, and reporting",
    "Automation through Node.js, Google Apps Script, and data tools",
  ];

  return (
    <>
      <section className="mx-auto mb-14 max-w-7xl px-6 md:px-8">
        <div className="grid items-stretch gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-xs uppercase tracking-[0.32em] text-[var(--tertiary)] [font-family:var(--font-label)]">
              About
            </p>
            <h1 className="max-w-[15ch] text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] md:text-6xl [font-family:var(--font-display)]">
              Bridging classroom instruction and delivery-ready system development.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-soft)] md:text-lg">{data.profile.tagline}</p>
          </div>

          <article
            className="overflow-hidden rounded-[18px] border border-[rgba(68,71,78,0.14)] bg-[var(--project-visual-bg)]"
            style={{ boxShadow: "var(--shadow)" }}
          >
            {data.profile.profileImageUrl ? (
              <img
                alt={data.profile.profileImageAlt || data.profile.name}
                className="h-full min-h-[21rem] w-full object-cover"
                src={data.profile.profileImageUrl}
              />
            ) : (
              <div className="flex min-h-[21rem] flex-col justify-end bg-[var(--hero-identity-bg)] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--secondary)] [font-family:var(--font-label)]">
                  Profile Image
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] [font-family:var(--font-display)]">
                  {data.profile.name}
                </h2>
                <p className="mt-3 text-base text-[var(--secondary)]">{data.profile.title}</p>
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="mx-auto mb-14 max-w-7xl px-6 md:px-8">
        <div className="grid items-stretch gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article
            className="h-full rounded-[18px] border border-[rgba(68,71,78,0.14)] bg-[var(--panel-bg)] p-6"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
              Professional Story
            </p>
            <h2 className="text-[1.9rem] font-bold tracking-[-0.04em] [font-family:var(--font-display)]">
              Instruction paired with production-minded practice.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-[var(--text-soft)]">{data.profile.summary}</p>
            <p className="mt-3 text-[15px] leading-7 text-[var(--text-soft)]">{data.profile.focusSummary}</p>
          </article>

          <article
            className="h-full rounded-[18px] border border-[rgba(68,71,78,0.14)] bg-[var(--glass-card-bg)] p-6 backdrop-blur-md"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
              Strengths
            </p>
            <ul className="divide-y divide-[rgba(68,71,78,0.14)]">
              {strengths.map((item, index) => (
                <li
                  key={item}
                  className={[
                    "grid grid-cols-[auto_1fr] items-start gap-3 py-3.5 text-[15px] leading-7 text-[var(--text-soft)]",
                    index === 0 ? "pt-1" : "",
                    index === strengths.length - 1 ? "pb-1" : "",
                  ].join(" ")}
                >
                  <span className="pt-1 text-[var(--tertiary)] [font-family:var(--font-display)]">
                    0{index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto mb-14 max-w-7xl px-6 md:px-8">
        <div className="mb-8">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
            Experience
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.04em] [font-family:var(--font-display)] md:text-4xl">
            Timeline Job History.
          </h2>
        </div>

        <div className="grid gap-4">
          {data.experiences.map((experience, index) => (
            <article key={experience.id} className="grid gap-4 md:grid-cols-[24px_1fr]">
              <div className="relative hidden md:block">
                <span
                  className={[
                    "absolute left-1/2 top-0 w-px -translate-x-1/2 bg-[linear-gradient(180deg,var(--tertiary),rgba(173,199,255,0.12))]",
                    index === data.experiences.length - 1 ? "h-12" : "h-full",
                  ].join(" ")}
                />
                <span className="absolute left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--tertiary)] shadow-[0_0_0_8px_rgba(0,218,243,0.08)]" />
              </div>

              <div
                className="rounded-[18px] border border-[rgba(68,71,78,0.14)] bg-[var(--timeline-card-bg)] p-5"
                style={{ boxShadow: "var(--shadow)" }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
                      {experience.organization}
                    </p>
                    <h3 className="mt-2.5 text-[1.55rem] font-bold tracking-[-0.04em] [font-family:var(--font-display)]">
                      {experience.title}
                    </h3>
                  </div>
                  <span className="text-xs uppercase tracking-[0.22em] text-[var(--secondary)] [font-family:var(--font-label)]">
                    {experience.period}
                  </span>
                </div>
                <p className="mt-4 text-[15px] leading-7 text-[var(--text-soft)]">{experience.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--secondary)] [font-family:var(--font-label)]">
                  {experience.emphasis}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full bg-[var(--surface-low)] py-14">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
              Training
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.04em] [font-family:var(--font-display)] lg:text-right md:text-4xl">
              Certifications and seminars.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.certifications.map((certification) => (
              <article
                key={certification.id}
                className="rounded-[18px] border border-[rgba(68,71,78,0.14)] bg-[var(--panel-bg)] p-6"
                style={{ boxShadow: "var(--shadow)" }}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--tertiary)] [font-family:var(--font-label)]">
                  {certification.period}
                </p>
                <h3 className="mt-2.5 text-[1.35rem] font-bold tracking-[-0.04em] [font-family:var(--font-display)]">
                  {certification.title}
                </h3>
                <strong className="mt-3 inline-block text-[var(--primary)]">{certification.issuer}</strong>
                <p className="mt-3 text-[15px] leading-7 text-[var(--text-soft)]">{certification.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full bg-[var(--surface-low)] px-6 py-14 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
              Skill Map
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.04em] [font-family:var(--font-display)] lg:text-right md:text-4xl">
              Organized by capability area.
            </h2>
          </div>

          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-[24px]">
            <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {Array.from({ length: totalScreens }).map((_, screenIndex) => (
                <div key={screenIndex} className="w-full flex-shrink-0">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-6 md:px-8">
                    {skillGroups.slice(screenIndex * itemsPerScreen, (screenIndex + 1) * itemsPerScreen).map(([category, skills]) => (
                      <article
                        key={category}
                        className="rounded-[18px] border border-[rgba(68,71,78,0.14)] bg-[var(--panel-bg)] p-5"
                        style={{ boxShadow: "var(--shadow)" }}
                      >
                        <p className="text-xs uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
                          {category}
                        </p>
                        <h3 className="mt-2.5 text-[1.35rem] font-bold tracking-[-0.04em] [font-family:var(--font-display)]">
                          {category} capabilities
                        </h3>
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          {skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="inline-flex items-center rounded-full border border-[rgba(173,199,255,0.14)] bg-[var(--chip-bg)] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--primary)] [font-family:var(--font-label)]"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: totalScreens }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-[var(--primary)]"
                    : "w-2 bg-[rgba(173,199,255,0.28)]"
                }`}
                aria-label={`Go to screen ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
