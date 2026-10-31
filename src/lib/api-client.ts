export class ApiError extends Error {
  code: string;
  status: number;
  fields?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    code = "API_ERROR",
    fields?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

let onUnauthorizedHandler: (() => void) | null = null;

export function setOnUnauthorized(handler: () => void) {
  onUnauthorizedHandler = handler;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Ensure cookies are sent with requests
  };

  const response = await fetch(endpoint, config);

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // Response had no JSON body
  }

  if (!response.ok) {
    if (response.status === 401) {
      if (onUnauthorizedHandler) {
        onUnauthorizedHandler();
      }
    }

    const errorPayload = data?.error;
    throw new ApiError(
      errorPayload?.message || `Request failed with status ${response.status}`,
      response.status,
      errorPayload?.code || "REQUEST_FAILED",
      errorPayload?.fields
    );
  }

  return (data?.data ?? data) as T;
}

export default apiClient;
