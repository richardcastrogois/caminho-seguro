type RouteLoadingProps = {
  label: string;
  variant?: "dashboard" | "form";
};

export function RouteLoading({ label, variant = "dashboard" }: RouteLoadingProps) {
  const cardCount = variant === "form" ? 3 : 6;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <div className="h-4 w-32 rounded-full bg-slate-100" />
          <div className="mt-3 h-8 w-full max-w-sm rounded-xl bg-slate-100" />
          <div className="mt-3 h-4 w-full max-w-lg rounded-full bg-slate-100" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <p className="text-sm font-semibold text-slate-500">{label}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cardCount }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="skeleton-shimmer h-10 w-10 rounded-2xl bg-slate-100" />
              <div className="skeleton-shimmer mt-5 h-5 w-2/3 rounded-full bg-slate-100" />
              <div className="skeleton-shimmer mt-3 h-4 w-full rounded-full bg-slate-100" />
              <div className="skeleton-shimmer mt-2 h-4 w-5/6 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
