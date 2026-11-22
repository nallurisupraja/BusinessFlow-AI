
// Backend address for API calls (the file did not declare this constant before).
export const API_BASE_URL = "http://localhost:8000";


export interface HealthResponse {
  status: string;
  database?: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}
