
import { API_BASE_URL } from "../health/api";
import { SessionExpiredError } from "../auth/api";

interface ChatResponse {
  business_id: string;
  answer: string;
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    throw new SessionExpiredError();
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as { detail?: unknown };

      if (typeof body.detail === "string") {
        message = body.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function chatWithAssistant(
  businessId: string,
  message: string,
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      business_id: businessId,
      message,
    }),
  });

  return readJson<ChatResponse>(response);
}
