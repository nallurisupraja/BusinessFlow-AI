
import { Link } from "@tanstack/react-router";
import { AnalyticsDashboard } from "../features/analytics/AnalyticsDashboard";

export function HomePage() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#c6a66b]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a18a61]">
              Overview
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#172f40] sm:text-3xl">
            Welcome to your dashboard
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#879198]">
            Here is an overview of your business performance and financial activity.
          </p>
        </div>

        <Link
          to="/businesses/new"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#172f40] px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_15px_rgba(23,47,64,0.15)] transition hover:bg-[#25475d] hover:shadow-lg sm:self-auto"
        >
          <span className="text-lg leading-none text-[#d6b978]">+</span>
          Add Business
        </Link>
      </header>

      <AnalyticsDashboard />
    </div>
  );
}
