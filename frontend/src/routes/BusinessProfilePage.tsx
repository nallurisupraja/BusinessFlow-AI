import { Link, useParams } from "@tanstack/react-router";
import { BusinessProfile } from "../features/businesses/BusinessProfile";

export function BusinessProfilePage() {
  const { businessId } = useParams({ from: "/businesses/$businessId" });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 inline-block text-blue-600 hover:underline">
          Back to dashboard
        </Link>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <BusinessProfile businessId={businessId} />
        </div>
      </div>
    </main>
  );
}
