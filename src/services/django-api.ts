/** Future live adapter. The demo UI never invokes this service. */
export type DjangoEmployee = {
  id: number;
  first_name: string;
  last_name: string;
  dept: string;
  role: string;
  salary: number;
  bonus: number;
  phone: number;
  hire_date: string;
  leave_balance: number;
};
export type Resource = "employees" | "departments" | "roles" | "attendance" | "leaves" | "payroll";
export class DjangoApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function createDjangoApi(
  baseUrl: string,
  getHeaders: () => Record<string, string> = () => ({}),
) {
  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/${path}`, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...getHeaders(),
        ...init.headers,
      },
    });
    if (!response.ok)
      throw new DjangoApiError(response.status, `Request failed (${response.status})`);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  };
  return {
    list: <T>(resource: Resource) => request<T[] | { results: T[] }>(`${resource}/`),
    get: <T>(resource: Resource, id: number) => request<T>(`${resource}/${id}/`),
    create: <T>(resource: Resource, data: unknown) =>
      request<T>(`${resource}/`, { method: "POST", body: JSON.stringify(data) }),
    update: <T>(resource: Resource, id: number, data: unknown) =>
      request<T>(`${resource}/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (resource: Resource, id: number) =>
      request<void>(`${resource}/${id}/`, { method: "DELETE" }),
  };
}
