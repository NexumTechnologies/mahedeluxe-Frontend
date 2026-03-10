export const metadata = {
  title: "Under Maintenance | MaheDeluxe",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Animated background (theme-driven colors; no hard-coded new colors) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-36 left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full blur-3xl opacity-35 motion-safe:animate-[spin_30s_linear_infinite] motion-reduce:animate-none bg-[conic-gradient(from_90deg_at_50%_50%,var(--chart-1),var(--chart-2),var(--chart-3),var(--chart-4),var(--chart-5),var(--chart-1))]" />
        <div className="absolute left-[10%] top-[18%] h-[30rem] w-[30rem] rounded-full blur-3xl opacity-25 motion-safe:animate-pulse motion-reduce:animate-none bg-[radial-gradient(circle_at_center,var(--chart-2),transparent_60%)]" />
        <div className="absolute right-[8%] top-[55%] h-[32rem] w-[32rem] rounded-full blur-3xl opacity-25 motion-safe:animate-pulse motion-reduce:animate-none bg-[radial-gradient(circle_at_center,var(--chart-4),transparent_60%)]" />
        <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-15 motion-safe:animate-[spin_70s_linear_infinite] motion-reduce:animate-none bg-[conic-gradient(from_180deg_at_50%_50%,var(--chart-3),transparent_35%,var(--chart-5),transparent_70%,var(--chart-3))]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(var(--foreground)_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-safe:animate-ping motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span>Temporarily offline for updates</span>
        </div>

        <div className="relative mt-8 w-full">
          {/* Glow ring */}
          <div className="pointer-events-none absolute -inset-1 rounded-3xl opacity-60 blur-xl motion-safe:animate-[spin_18s_linear_infinite] motion-reduce:animate-none bg-[conic-gradient(from_90deg_at_50%_50%,var(--chart-2),var(--chart-4),var(--chart-1),var(--chart-5),var(--chart-2))]" />
          <div className="pointer-events-none absolute -inset-[2px] rounded-3xl opacity-40 blur-md bg-[radial-gradient(circle_at_top,var(--chart-1),transparent_55%)]" />

          {/* Floating sparkles */}
          <div className="pointer-events-none absolute -top-6 left-10 h-3 w-3 rounded-full bg-primary/70 blur-[1px] motion-safe:animate-bounce motion-reduce:animate-none" style={{ animationDelay: "0.2s" }} />
          <div className="pointer-events-none absolute -top-10 right-14 h-2.5 w-2.5 rounded-full bg-secondary-foreground/40 blur-[1px] motion-safe:animate-bounce motion-reduce:animate-none" style={{ animationDelay: "0.8s" }} />
          <div className="pointer-events-none absolute -bottom-8 left-1/3 h-2 w-2 rounded-full bg-primary/50 blur-[1px] motion-safe:animate-bounce motion-reduce:animate-none" style={{ animationDelay: "1.3s" }} />

          <div className="relative rounded-2xl border border-border bg-card/70 p-8 shadow-lg backdrop-blur sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <div className="h-6 w-6 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin motion-reduce:animate-none" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
            <span className="bg-[linear-gradient(90deg,var(--chart-2),var(--chart-4),var(--chart-1),var(--chart-5))] bg-[length:200%_200%] bg-clip-text text-transparent motion-safe:animate-pulse motion-reduce:animate-none">
              Under Maintenance
            </span>
          </h1>

          <div className="mx-auto mt-4 h-1 w-32 rounded-full bg-[linear-gradient(90deg,var(--chart-2),var(--chart-4),var(--chart-1))] opacity-80" />

          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            We’re working on improvements to make your experience better. Please
            check back soon.
          </p>

          <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 rounded-full bg-[linear-gradient(90deg,var(--chart-2),var(--chart-4),var(--chart-1))] motion-safe:animate-[pulse_1.6s_ease-in-out_infinite] motion-reduce:animate-none" />
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Thanks for your patience.
          </p>
          </div>
        </div>
      </div>
    </main>
  );
}
