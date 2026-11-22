
import { Link } from "@tanstack/react-router";
import BusinessList from "../features/businesses/BusinessList";

export function BusinessesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Businesses
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage all your registered businesses.
          </p>
        </div>

        <Link
          to="/businesses/new"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Add Business
        </Link>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <BusinessList />
      </section>
    </div>
  );
}
