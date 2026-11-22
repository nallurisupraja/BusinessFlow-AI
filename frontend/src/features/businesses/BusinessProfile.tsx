import { useEffect, useState } from "react";
import { BusinessForm } from "./BusinessForm";
import { getBusiness, updateBusiness } from "./api";
import type { BusinessFormValues } from "./schema";
import { BUSINESS_TYPE_OPTIONS, type Business } from "./types";

interface BusinessProfileProps {
  businessId: string;
}

// Converts a saved business into form values (null becomes an empty string).
function toFormValues(business: Business): BusinessFormValues {
  return {
    name: business.name,
    business_type: business.business_type,
    owner_name: business.owner_name,
    email: business.email,
    phone: business.phone,
    country: business.country,
    state: business.state,
    city: business.city,
    address: business.address ?? "",
    pin_code: business.pin_code ?? "",
    gstin: business.gstin ?? "",
    website: business.website ?? "",
    description: business.description ?? "",
  };
}

export function BusinessProfile({ businessId }: BusinessProfileProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getBusiness(businessId)
      .then((data) => {
        if (active) {
          setBusiness(data);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError("Could not load business.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [businessId]);

  async function saveChanges(values: BusinessFormValues) {
    const updated = await updateBusiness(businessId, values);
    setBusiness(updated);
    setEditing(false);
    setMessage("Saved successfully.");
  }

  if (loading) {
    return <p className="text-gray-600">Loading business...</p>;
  }

  if (error || !business) {
    return (
      <p role="alert" className="text-red-600">
        {error ?? "Could not load business."}
      </p>
    );
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <BusinessForm
          initialValues={toFormValues(business)}
          submitLabel="Save changes"
          onSubmit={saveChanges}
        />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    );
  }

  const typeLabel =
    BUSINESS_TYPE_OPTIONS.find((option) => option.value === business.business_type)?.label ??
    business.business_type;

  const details: [string, string | null][] = [
    ["Business type", typeLabel],
    ["Owner name", business.owner_name],
    ["Email", business.email],
    ["Phone", business.phone],
    ["Country", business.country],
    ["State", business.state],
    ["City", business.city],
    ["Address", business.address],
    ["PIN code", business.pin_code],
    ["GSTIN", business.gstin],
    ["Website", business.website],
    ["Description", business.description],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{business.name}</h2>
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setEditing(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Edit Business
        </button>
      </div>

      {message && <p className="text-green-600">{message}</p>}

      <dl className="grid gap-4 md:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="text-gray-900">{value || "-"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
