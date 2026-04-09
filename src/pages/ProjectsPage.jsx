import { useEffect, useMemo, useState } from "react";
import { usePortfolio } from "../hooks/usePortfolioData";

const REPOSITORY_URL = "https://github.com/jlcabucoscec";

function getVisibleEntryCount() {
  if (typeof window === "undefined") {
    return 2;
  }

  if (window.innerWidth >= 640) {
    return 2;
  }

  return 1;
}

function chunkProjects(projects, visibleCount) {
  const pages = [];

  for (let index = 0; index < projects.length; index += visibleCount) {
    pages.push(projects.slice(index, index + visibleCount));
  }

  return pages;
}

function getGalleryImages(project) {
  const images = [project.thumbnailUrl, ...(project.screenshots || [])].filter(Boolean);
  return [...new Set(images)];
}

function getTechnologyIcon(technology) {
  const value = technology.toLowerCase();

  if (value.includes("node") || value.includes("react") || value.includes("javascript") || value.includes("html")) {
    return "code";
  }

  if (value.includes("sql") || value.includes("firebase") || value.includes("database") || value.includes("json")) {
    return "database";
  }

  if (value.includes("analytics") || value.includes("chart") || value.includes("report")) {
    return "analytics";
  }

  if (value.includes("security") || value.includes("auth") || value.includes("policy")) {
    return "shield";
  }

  return "deployed_code";
}

function getTechnologyMarks(project) {
  return (project.technologies || []).slice(0, 3).map((technology) => {
    const tokens = technology
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((token) => token[0])
      .join("")
      .toUpperCase();

    return tokens || technology.slice(0, 2).toUpperCase();
  });
}

function ScreenshotModal({ images, initialIndex, onClose, title }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeImage = images[activeIndex];

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }

      if (images.length && event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % images.length);
      }

      if (images.length && event.key === "ArrowLeft") {
        setActiveIndex((current) => (current - 1 + images.length) % images.length);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, onClose]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[80] grid place-items-center bg-[var(--modal-backdrop)] p-6 backdrop-blur-md"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-[18px] border border-[var(--outline)] bg-[var(--modal-card-bg)] p-6 md:p-8"
        style={{ boxShadow: "var(--shadow)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
              Project Screenshots
            </p>
            <h3 className="text-3xl font-bold tracking-[-0.04em] [font-family:var(--font-display)]">{title}</h3>
          </div>
          <button
            aria-label="Close screenshots"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--outline)] bg-[var(--button-secondary-bg)] text-[var(--text)] transition hover:border-[var(--primary)]"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {images.length ? (
          <>
            <div className="mt-8 grid items-center gap-4 md:grid-cols-[auto_1fr_auto]">
              <button
                aria-label="Previous screenshot"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--outline)] bg-[var(--button-secondary-bg)] text-[var(--text)] transition hover:border-[var(--primary)]"
                onClick={() => setActiveIndex((current) => (current - 1 + images.length) % images.length)}
                type="button"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <div className="overflow-hidden rounded-[16px] border border-[var(--outline)] bg-[var(--preview-bg)]">
                <img
                  alt={`${title} screenshot ${activeIndex + 1}`}
                  className="max-h-[70vh] w-full object-contain"
                  src={activeImage}
                />
              </div>

              <button
                aria-label="Next screenshot"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--outline)] bg-[var(--button-secondary-bg)] text-[var(--text)] transition hover:border-[var(--primary)]"
                onClick={() => setActiveIndex((current) => (current + 1) % images.length)}
                type="button"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div className="mt-5">
              <span className="text-sm text-[var(--text-soft)]">
                {activeIndex + 1} / {images.length}
              </span>
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    className={[
                      "overflow-hidden rounded-[12px] border bg-[var(--preview-bg)]",
                      activeIndex === index
                        ? "border-[var(--primary)] shadow-[0_0_0_3px_rgba(173,199,255,0.16)]"
                        : "border-[var(--outline)]",
                    ].join(" ")}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  >
                    <img alt="" className="h-[72px] w-[96px] object-cover" src={image} />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-8 grid min-h-[20rem] place-items-center rounded-[16px] border border-dashed border-[var(--outline)] bg-[var(--preview-bg)] p-8 text-center">
            <div>
              <span className="material-symbols-outlined text-5xl text-[var(--primary)]">imagesmode</span>
              <strong className="mt-4 block text-2xl [font-family:var(--font-display)]">No screenshots uploaded yet</strong>
              <p className="mx-auto mt-3 max-w-lg leading-8 text-[var(--text-soft)]">
                Add thumbnail or screenshot URLs in the admin dashboard to populate this carousel.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectShowcase({ onNavigate, onViewScreenshots, project }) {
  const marks = getTechnologyMarks(project);

  return (
    <article
      className="relative col-span-12 flex h-full flex-col self-start overflow-hidden rounded-[12px] border border-[var(--outline)] bg-[var(--surface-low)] p-4 lg:col-span-8 lg:self-stretch"
      style={{ boxShadow: "var(--shadow)" }}
    >
      {project.useThumbnail && project.thumbnailUrl ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10">
          <img alt="" className="h-full w-full object-cover" src={project.thumbnailUrl} />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,218,243,0.06),transparent_46%,var(--surface-low))]" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34%] lg:block">
        <div className="absolute -bottom-12 right-[-2rem] h-48 w-48 rounded-full bg-[rgba(0,218,243,0.08)] blur-3xl" />
      </div>

      <div className="relative z-10 mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-[3px] bg-[var(--tertiary)] shadow-[0_0_10px_rgba(0,218,243,0.45)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
            Featured Development
          </span>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Previous project"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(68,71,78,0.16)] bg-[var(--surface-card)] text-[var(--text)] transition hover:text-[var(--primary)]"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onNavigate(-1);
            }}
            type="button"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button
            aria-label="Next project"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(68,71,78,0.16)] bg-[var(--surface-card)] text-[var(--text)] transition hover:text-[var(--primary)]"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onNavigate(1);
            }}
            type="button"
          >
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-[40rem] lg:max-w-[62%]">
        <h1 className="text-[1.65rem] font-extrabold leading-[0.95] tracking-[-0.06em] md:text-[2.15rem] [font-family:var(--font-display)]">
          {project.linkUrl ? (
            <a className="transition hover:text-[var(--primary)]" href={project.linkUrl} rel="noreferrer" target="_blank">
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h1>

        <p className="mt-2.5 max-w-[42rem] text-[13px] leading-6 text-[var(--text-soft)]">{project.description}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {(project.technologies || []).slice(0, 3).map((technology) => (
            <div
              key={technology}
              className="inline-flex items-center gap-2 rounded-[10px] border border-[rgba(68,71,78,0.12)] bg-[var(--surface-card)] px-2.5 py-1.5"
            >
              <span className="material-symbols-outlined text-sm text-[var(--tertiary)]">{getTechnologyIcon(technology)}</span>
              <span className="text-xs font-medium text-[var(--text)]">{technology}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-auto flex flex-wrap items-center gap-3 pt-4">
        <button
          className="inline-flex min-h-[2.5rem] items-center gap-2.5 rounded-[10px] bg-[var(--tertiary)] px-4 py-2 text-sm font-bold text-[var(--primary-button-text)] transition hover:brightness-105"
          onClick={onViewScreenshots}
          type="button"
        >
          {project.screenshots?.length || project.thumbnailUrl ? "View Screenshots" : "View Sample"}
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </button>

        {marks.length ? (
          <div className="hidden items-center gap-2 md:flex">
            {marks.map((mark) => (
              <span
                key={mark}
                className="inline-flex h-7 w-7 items-center justify-center rounded-[9px] border border-[rgba(68,71,78,0.16)] bg-[var(--surface-card)] text-[10px] font-bold uppercase tracking-[0.14em]"
              >
                {mark}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function InsightCard({ description, icon, index, label }) {
  return (
    <article
      className="rounded-[12px] border border-[var(--outline)] bg-[var(--surface-low)] p-3 transition-colors hover:bg-[var(--surface-card)]"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className="flex items-start justify-between">
        <div className="inline-flex rounded-[10px] bg-[var(--surface-card)] p-1.5 text-[var(--tertiary)]">
          <span className="material-symbols-outlined text-[1.05rem]">{icon}</span>
        </div>
        <span className="text-[1.9rem] font-black leading-none tracking-[-0.06em] text-[rgba(68,71,78,0.22)] [font-family:var(--font-display)]">
          {index}
        </span>
      </div>

      <div className="mt-2.5">
        <h3 className="text-[15px] font-bold [font-family:var(--font-display)]">{label}</h3>
        <p className="mt-0.5 text-[11px] leading-5 text-[var(--text-soft)]">{description}</p>
      </div>
    </article>
  );
}

function ProjectBrowserCard({ active, onSelect, project }) {
  const preview = (
    <div className="mb-5 overflow-hidden rounded-[10px] aspect-video bg-[var(--project-visual-bg)]">
      <div className="relative h-full w-full">
        {project.useThumbnail && project.thumbnailUrl ? (
          <img alt={project.title} className="h-full w-full object-cover opacity-65 transition-all group-hover:opacity-85" src={project.thumbnailUrl} />
        ) : null}
        <div className="absolute inset-0 bg-[var(--project-visual-scrim)]" />
      </div>
    </div>
  );

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  return (
    <article
      className={[
        "group flex h-full cursor-pointer flex-col rounded-[12px] border p-4 transition-all duration-500",
        active
          ? "border-[rgba(0,218,243,0.22)] bg-[var(--surface-card)]"
          : "border-transparent bg-[var(--surface-card)] hover:border-[rgba(0,218,243,0.18)]",
      ].join(" ")}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {project.linkUrl ? (
        <a href={project.linkUrl} onClick={(event) => event.stopPropagation()} rel="noreferrer" target="_blank">
          {preview}
        </a>
      ) : (
        preview
      )}

      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex rounded-[6px] bg-[rgba(0,218,243,0.1)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--tertiary)] [font-family:var(--font-label)]">
          {project.category}
        </span>
      </div>

      <h4 className="text-base font-bold leading-tight transition-colors group-hover:text-[var(--primary)] [font-family:var(--font-display)]">
        {project.linkUrl ? (
          <a href={project.linkUrl} onClick={(event) => event.stopPropagation()} rel="noreferrer" target="_blank">
            {project.title}
          </a>
        ) : (
          project.title
        )}
      </h4>

      <p className="mt-2.5 text-xs leading-6 text-[var(--text-soft)]">{project.summary || project.description}</p>
    </article>
  );
}

export default function ProjectsPage() {
  const { data } = usePortfolio();
  const projects = data?.projects || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [showScreenshots, setShowScreenshots] = useState(false);
  const [visibleEntryCount, setVisibleEntryCount] = useState(getVisibleEntryCount);
  const [entryPage, setEntryPage] = useState(0);

  useEffect(() => {
    if (projects.length && activeIndex > projects.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, projects.length]);

  useEffect(() => {
    function handleResize() {
      setVisibleEntryCount(getVisibleEntryCount());
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!projects.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div
          className="rounded-[12px] border border-[var(--outline)] bg-[var(--surface-low)] p-8"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--tertiary)] [font-family:var(--font-label)]">
            Projects
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] [font-family:var(--font-display)]">
            No project entries available yet.
          </h1>
        </div>
      </section>
    );
  }

  const activeProject = projects[activeIndex];
  const categories = Array.from(new Set(projects.map((project) => project.category)));
  const galleryImages = useMemo(() => getGalleryImages(activeProject), [activeProject]);
  const projectPages = useMemo(() => chunkProjects(projects, visibleEntryCount), [projects, visibleEntryCount]);

  function navigateProjects(step) {
    setActiveIndex((current) => (current + step + projects.length) % projects.length);
  }

  function navigateEntries(step) {
    if (!projectPages.length) {
      return;
    }

    const nextPage = (entryPage + step + projectPages.length) % projectPages.length;
    setEntryPage(nextPage);
    setActiveIndex(Math.min(nextPage * visibleEntryCount, projects.length - 1));
  }

  useEffect(() => {
    if (!projectPages.length) {
      return;
    }

    const nextPage = Math.floor(activeIndex / visibleEntryCount);
    if (nextPage !== entryPage) {
      setEntryPage(nextPage);
    }
  }, [activeIndex, entryPage, projectPages.length, visibleEntryCount]);

  useEffect(() => {
    if (projectPages.length && entryPage > projectPages.length - 1) {
      setEntryPage(projectPages.length - 1);
    }
  }, [entryPage, projectPages.length]);

  const insights = [
    {
      description: `${projects.length} integrated full-stack solutions deployed.`,
      icon: "folder_special",
      index: "01",
      label: "Projects",
    },
    {
      description: activeProject.technologies.slice(0, 3).join(", ") || "Dynamic modular architectures.",
      icon: "settings_input_component",
      index: "02",
      label: "Features",
    },
    {
      description: categories.join(", ") || "Education, Security, and Governance.",
      icon: "category",
      index: "03",
      label: "Categories",
    },
  ];

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="grid grid-cols-12 items-start gap-4">
          <ProjectShowcase
            onNavigate={navigateProjects}
            onViewScreenshots={() => setShowScreenshots(true)}
            project={activeProject}
          />

          <div className="col-span-12 grid self-start gap-2.5 lg:col-span-4">
            {insights.map((insight) => (
              <InsightCard key={insight.index} {...insight} />
            ))}
          </div>

          <section
            className="col-span-12 mt-1 rounded-[12px] border border-[var(--outline)] bg-[var(--surface-low)] p-5 md:p-6"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-[-0.04em] [font-family:var(--font-display)]">
                  Browse all entries
                </h2>
                <p className="mt-1 text-sm text-[var(--text-soft)]">
                  Archived and active institutional frameworks.
                </p>
              </div>

              <a
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] transition hover:translate-x-1"
                href={REPOSITORY_URL}
                rel="noreferrer"
                target="_blank"
              >
                View All Repository
                <span className="material-symbols-outlined text-sm">trending_flat</span>
              </a>
            </div>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${entryPage * 100}%)` }}
              >
                {projectPages.map((page, pageIndex) => (
                  <div key={`page-${pageIndex}`} className="grid min-w-full grid-cols-1 gap-3 md:grid-cols-2">
                    {page.map((project) => {
                      const projectIndex = projects.findIndex((entry) => entry.id === project.id);

                      return (
                        <ProjectBrowserCard
                          key={project.id}
                          active={projectIndex === activeIndex}
                          onSelect={() => setActiveIndex(projectIndex)}
                          project={project}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)] [font-family:var(--font-label)]">
              <span>
                Page {projectPages.length ? entryPage + 1 : 0} / {projectPages.length || 1}
              </span>
              <div className="flex items-center gap-3">
                <span>{projects.length} total entries</span>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Previous entry set"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--outline)] bg-[var(--surface-card)] text-[var(--text)] transition hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={projectPages.length < 2}
                    onClick={() => navigateEntries(-1)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[1.1rem]">arrow_back</span>
                  </button>
                  <button
                    aria-label="Next entry set"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--outline)] bg-[var(--surface-card)] text-[var(--text)] transition hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={projectPages.length < 2}
                    onClick={() => navigateEntries(1)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[1.1rem]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {showScreenshots ? (
          <ScreenshotModal
            images={galleryImages}
            initialIndex={0}
            onClose={() => setShowScreenshots(false)}
            title={activeProject.title}
          />
        ) : null}
      </section>
    </>
  );
}
