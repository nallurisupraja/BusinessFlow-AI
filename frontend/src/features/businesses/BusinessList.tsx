import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { listBusinesses } from "./api";
import { BUSINESS_TYPE_OPTIONS, type Business } from "./types";

// Shows the saved businesses as links to their profile pages.
export default function BusinessList() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    listBusinesses()
      .then((data) => {
        if (active) {
          setBusinesses(data);
        }
      })
      .catch(() => {
        if (active) {
          setError("Could not load businesses.");
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
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading businesses...</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-red-600">
        {error}
      </p>
    );
  }

  if (businesses.length === 0) {
    return <p className="text-gray-600">No businesses yet. Add your first business.</p>;
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {businesses.map((business) => {
        const typeLabel =
          BUSINESS_TYPE_OPTIONS.find((option) => option.value === business.business_type)?.label ??
          business.business_type;

        return (
          <li key={business.id}>
            <Link
              to="/businesses/$businessId"
              params={{ businessId: business.id }}
              className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-400"
            >
              <p className="font-semibold text-gray-900">{business.name}</p>
              <p className="text-sm text-gray-600">{typeLabel}</p>
              <p className="text-sm text-gray-600">
                {business.city}, {business.state}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
