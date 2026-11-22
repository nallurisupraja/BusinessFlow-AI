
import { useEffect, useState } from "react";
import { fetchHealth, type HealthResponse } from "./api";

export function HealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchHealth()
      .then((data) => {
        if (active) {
          setHealth(data);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to connect to the backend.");
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
    return <p className="text-gray-600">Checking system status...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div>
      <p className="text-green-600">
        Backend: {health?.status ?? "Unknown"}
      </p>
      <p className="text-gray-600">
        Database: {health?.database ?? "Unknown"}
      </p>
    </div>
  );
}
