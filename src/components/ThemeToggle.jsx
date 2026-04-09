import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { isLight, toggleTheme } = useTheme();

  return (
    <button
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      className="inline-flex h-9 w-9 items-center justify-center text-[var(--text-soft)] transition hover:text-[var(--primary)]"
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
      onClick={toggleTheme}
      type="button"
    >
      <span className="material-symbols-outlined text-[1.05rem]">{isLight ? "dark_mode" : "light_mode"}</span>
    </button>
  );
}
