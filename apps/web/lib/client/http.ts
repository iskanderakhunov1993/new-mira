type ApiErrorPayload = {
  error?: unknown;
};

export async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const result = await response.json() as T & ApiErrorPayload;
  if (!response.ok) {
    const message = typeof result.error === "string" ? result.error : "Не удалось сохранить данные";
    throw new Error(message);
  }
  return result;
}
