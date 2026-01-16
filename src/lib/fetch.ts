type FetchOptions = {
  method?: string;
  data?: any;
  headers?: Record<string, string>;
  auth?: boolean;
  cache?: RequestCache;
};

export async function Fetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const headers: Record<string, string> = { ...(options.headers || {}) };
  let body: BodyInit | undefined;

  const credentials = options.auth ? "include" : undefined;

  if (options.data !== undefined) {
    if (options.data instanceof FormData) {
      body = options.data;
    } else if (typeof options.data === "string") {
      body = options.data;
    } else {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      body = JSON.stringify(options.data);
    }
  }

  const res = await fetch(url, {
    method: options.method || (body ? "POST" : "GET"),
    headers,
    body,
    credentials,
    cache: options.cache,
  });

  const contentType = res.headers.get("content-type") || "";
  let data: any = undefined;
  let error: string | undefined = undefined;

  if (contentType.includes("application/json")) {
    const json = await res.json().catch(() => null);
    data = json?.data ?? json;
    error = json?.error;
  } else {
    const text = await res.text().catch(() => "");
    if (text) {
      data = text;
      if (!res.ok) error = text;
    }
  }

  if (!res.ok && !error) {
    error = `Request failed (${res.status})`;
  }

  return { ok: res.ok, status: res.status, data, error };
}
