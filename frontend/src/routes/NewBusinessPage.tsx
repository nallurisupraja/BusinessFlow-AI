import { useNavigate } from "@tanstack/react-router";
import { BusinessForm } from "../features/businesses/BusinessForm";
import { createBusiness } from "../features/businesses/api";

export function NewBusinessPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Register a Business</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <BusinessForm
            submitLabel="Register Business"
            onSubmit={async (values) => {
              const created = await createBusiness(values);
              await navigate({ to: "/businesses/$businessId", params: { businessId: created.id } });
            }}
          />
        </div>
      </div>
    </main>
  );
}
