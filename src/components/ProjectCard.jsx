import { useEffect, useMemo, useState } from "react";

function getGalleryImages(project) {
  const images = [project.thumbnailUrl, ...(project.screenshots || [])].filter(Boolean);
  return [...new Set(images)];
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
        className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-[28px] border border-[var(--outline)] bg-[var(--modal-card-bg)] p-6 md:p-8"
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
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--outline)] bg-[var(--button-secondary-bg)] text-[var(--text)]"
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
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--outline)] bg-[var(--button-secondary-bg)] text-[var(--text)]"
                onClick={() => setActiveIndex((current) => (current - 1 + images.length) % images.length)}
                type="button"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <div className="overflow-hidden rounded-[24px] border border-[var(--outline)] bg-[var(--preview-bg)]">
                <img
                  alt={`${title} screenshot ${activeIndex + 1}`}
                  className="max-h-[70vh] w-full object-contain"
                  src={activeImage}
                />
              </div>

              <button
                aria-label="Next screenshot"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--outline)] bg-[var(--button-secondary-bg)] text-[var(--text)]"
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
                      "overflow-hidden rounded-2xl border bg-[var(--preview-bg)]",
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
          <div className="mt-8 grid min-h-[20rem] place-items-center rounded-[24px] border border-dashed border-[var(--outline)] bg-[var(--preview-bg)] p-8 text-center">
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

export default function ProjectCard({ project, fullWidth = false }) {
  const galleryImages = useMemo(() => getGalleryImages(project), [project]);
  const [showScreenshots, setShowScreenshots] = useState(false);

  const visual = (
    <div
      className={[
        "relative overflow-hidden bg-[var(--project-visual-bg)]",
        fullWidth ? "h-full min-h-[20rem] lg:min-h-[32rem]" : "aspect-[16/10] rounded-[24px]",
      ].join(" ")}
    >
      {project.useThumbnail && project.thumbnailUrl ? (
        <img alt={project.title} className="h-full w-full object-cover" src={project.thumbnailUrl} />
      ) : null}
      <div className="absolute inset-0 bg-[var(--project-visual-scrim)]" />
      <div className="absolute inset-4 rounded-[20px] border border-[rgba(173,199,255,0.12)] bg-[var(--project-gradient-bg)]" />
      <div className="absolute left-5 right-5 top-5 z-10 flex flex-wrap gap-3">
        <span className="rounded-full border border-[rgba(173,199,255,0.14)] bg-[var(--chip-bg)] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[var(--primary)] [font-family:var(--font-label)]">
          {project.category}
        </span>
        <span className="rounded-full border border-[rgba(173,199,255,0.14)] bg-[var(--chip-bg)] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)] [font-family:var(--font-label)]">
          {project.yearLabel}
        </span>
      </div>
      <div className="absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--secondary)] [font-family:var(--font-label)]">
            {project.metricLabel}
          </p>
          <strong className="mt-1 block text-2xl font-extrabold [font-family:var(--font-display)]">
            {project.metricValue}
          </strong>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <article
        className={[
          "flex h-full overflow-hidden rounded-[28px] border border-[rgba(68,71,78,0.14)] bg-[var(--project-card-bg)]",
          fullWidth ? "flex-col lg:grid lg:grid-cols-[1.08fr_0.92fr]" : "flex-col",
        ].join(" ")}
        style={{ boxShadow: "var(--shadow)" }}
      >
        {project.linkUrl ? (
          <a
            aria-label={`Open ${project.title}`}
            className={fullWidth ? "block h-full" : "block"}
            href={project.linkUrl}
            rel="noreferrer"
            target="_blank"
          >
            {visual}
          </a>
        ) : (
          <div>{visual}</div>
        )}

        <div className={["flex grow flex-col", fullWidth ? "p-8 lg:p-10" : "p-7"].join(" ")}>
          <h3 className="text-[1.9rem] font-bold leading-tight tracking-[-0.04em] [font-family:var(--font-display)]">
            {project.linkUrl ? (
              <a className="transition hover:text-[var(--primary)]" href={project.linkUrl} rel="noreferrer" target="_blank">
                {project.title}
              </a>
            ) : (
              project.title
            )}
          </h3>
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--secondary)] [font-family:var(--font-label)]">
            {project.role}
          </p>

          <p className="mt-4 text-base leading-7 text-[var(--text-soft)]">{project.summary}</p>
          <p className="mt-3 text-base leading-7 text-[var(--text-soft)]">{project.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-full border border-[rgba(173,199,255,0.14)] bg-[var(--chip-bg)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--primary)] [font-family:var(--font-label)]"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-7">
            <button
              className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--primary-button-text)] shadow-[0_0_24px_rgba(173,199,255,0.16)] transition hover:-translate-y-0.5"
              onClick={() => setShowScreenshots(true)}
              type="button"
            >
              <span className="material-symbols-outlined mr-2 text-base">view_carousel</span>
              {galleryImages.length ? "View Screenshots" : "View Sample"}
            </button>
          </div>
        </div>
      </article>

      {showScreenshots ? (
        <ScreenshotModal
          images={galleryImages}
          initialIndex={0}
          onClose={() => setShowScreenshots(false)}
          title={project.title}
        />
      ) : null}
    </>
  );
}
