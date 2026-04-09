import { Link } from "react-router-dom";

export default function FeaturedProjectCard({ project }) {
  const visual = (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-[var(--project-visual-bg)]">
      {project.useThumbnail && project.thumbnailUrl ? (
        <img alt={project.title} className="h-full w-full object-cover" src={project.thumbnailUrl} />
      ) : null}
      <div className="absolute inset-0 bg-[var(--project-visual-scrim)]" />
      <div className="absolute inset-3.5 rounded-[12px] border border-[rgba(173,199,255,0.12)] bg-[var(--project-gradient-bg)]" />
      <div className="absolute left-4 right-4 top-4 z-10 flex flex-wrap gap-2">
        <span className="rounded-full border border-[rgba(173,199,255,0.14)] bg-[var(--chip-bg)] px-2.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[var(--primary)] [font-family:var(--font-label)]">
          {project.category}
        </span>
        <span className="rounded-full border border-[rgba(173,199,255,0.14)] bg-[var(--chip-bg)] px-2.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)] [font-family:var(--font-label)]">
          {project.yearLabel}
        </span>
      </div>
    </div>
  );

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[rgba(68,71,78,0.14)] bg-[var(--project-card-bg)]" style={{ boxShadow: "var(--shadow)" }}>
      {project.linkUrl ? (
        <a aria-label={`View ${project.title}`} className="block" href={project.linkUrl} rel="noreferrer" target="_blank">
          {visual}
        </a>
      ) : (
        <div>{visual}</div>
      )}

      <div className="flex grow flex-col justify-between p-5">
        <h3 className="text-[1.25rem] font-bold leading-tight tracking-[-0.04em] [font-family:var(--font-display)]">
          {project.title}
        </h3>
        <Link
          className="mt-4 inline-flex items-center justify-center rounded-[12px] bg-[var(--primary)] px-4 py-2.5 text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary-button-text)] shadow-[0_0_24px_rgba(173,199,255,0.16)] transition hover:-translate-y-0.5"
          to="/projects"
        >
          View Project
        </Link>
      </div>
    </article>
  );
}
