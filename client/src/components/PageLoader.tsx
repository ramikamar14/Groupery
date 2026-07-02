// Minimal branded fallback shown while a lazy-loaded route chunk is fetched.
// Kept intentionally content-free (no copy) to avoid a text flash between
// route transitions — just a violet spinner centered on the app background.
export function PageLoader() {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "var(--bg)" }}
      role="status"
      aria-label="Loading"
    >
      <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
}

export default PageLoader;
