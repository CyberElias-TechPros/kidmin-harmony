import type {
  AuthResponse,
  User,
  Child,
  ChildDetails,
  ChildInput,
  AttendanceList,
  Event,
  EventDetails,
  EventsList,
  Lesson,
  LessonDetails,
  Partner,
  ReportSummary,
  ReportsAnalytics,
} from "./types";

// The API base URL. In production the Vercel app proxies /api/* to the
// Cloudflare Worker (see vercel.json), so the default relative "/api" works
// without any environment config and avoids CORS. For a fully separate origin,
// set VITE_API_URL to your worker URL deployed on Cloudflare.
const API_URL: string = (import.meta.env.VITE_API_URL as string) || "/api";

const TOKEN_KEY = "kidmin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(message, res.status);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<T>(path, { method: "POST", body: form });
  },
};

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
  register: (payload: { name: string; email: string; password: string; role: string }) =>
    api.post<AuthResponse>("/auth/register", payload),
  me: () => api.get<{ user: User }>("/auth/me"),
  updateProfile: (payload: { name: string; avatar?: string }) => api.put<{ user: User }>("/auth/me", payload),
  logout: () => api.post<{ ok: boolean }>("/auth/logout"),
  seed: () => api.post<{ ok: boolean; seeded: boolean }>("/auth/seed"),
};

// ---- Children ----
export const childrenApi = {
  list: () => api.get<{ children: Child[] }>("/children"),
  get: (id: string) => api.get<ChildDetails>(`/children/${id}`),
  create: (data: ChildInput) => api.post<{ child: Child }>("/children", data),
  update: (id: string, data: ChildInput) => api.put<{ child: Child }>(`/children/${id}`, data),
  remove: (id: string) => api.del<{ ok: boolean }>(`/children/${id}`),
  addNote: (id: string, text: string, author?: string) =>
    api.post<{ note: { id: string; author: string; text: string; date: string } }>(
      `/children/${id}/notes`,
      { text, author }
    ),
  removeNote: (id: string, noteId: string) =>
    api.del<{ ok: boolean }>(`/children/${id}/notes/${noteId}`),
};

// ---- Attendance ----
export interface AttendanceCheckIn {
  id: string;
  childId: string;
  childName: string;
  time: string;
  checkedBy: string | null;
  status: string;
}

export const attendanceApi = {
  list: () => api.get<AttendanceList>("/attendance"),
  get: (id: string) => api.get<{ session: { id: string; date: string; serviceType: string }; checkIns: AttendanceCheckIn[] }>(`/attendance/${id}`),
  createSession: (data: { date: string; serviceType: string }) =>
    api.post<{ session: { id: string; date: string; serviceType: string } }>("/attendance/sessions", data),
  checkin: (data: { childId: string; date?: string; serviceType?: string; sessionId?: string }) =>
    api.post<{ ok: boolean; alreadyCheckedIn?: boolean; checkedInAt: string }>("/attendance/checkin", data),
};

// ---- Events ----
export const eventsApi = {
  list: () => api.get<EventsList>("/events"),
  get: (id: string) => api.get<EventDetails>(`/events/${id}`),
  create: (data: Partial<Event>) => api.post<{ event: Event }>("/events", data),
  update: (id: string, data: Partial<Event>) => api.put<{ event: Event }>(`/events/${id}`, data),
  remove: (id: string) => api.del<{ ok: boolean }>(`/events/${id}`),
  registerChild: (id: string, childId: string, status?: string) =>
    api.post<{ ok: boolean; alreadyRegistered?: boolean }>(`/events/${id}/attendees`, { childId, status }),
  removeChild: (id: string, childId: string) =>
    api.del<{ ok: boolean }>(`/events/${id}/attendees/${childId}`),
  addVolunteer: (id: string, data: { name: string; role?: string; assigned?: string }) =>
    api.post<{ ok: boolean; volunteerId: string }>(`/events/${id}/volunteers`, data),
  removeVolunteer: (id: string, volunteerId: string) =>
    api.del<{ ok: boolean }>(`/events/${id}/volunteers/${volunteerId}`),
};

// ---- Lessons ----
export interface LessonActivityInput {
  name: string;
  description?: string;
  duration?: number;
  materials?: string[];
}

export const lessonsApi = {
  list: () => api.get<{ lessons: Lesson[] }>("/lessons"),
  get: (id: string) => api.get<LessonDetails>(`/lessons/${id}`),
  create: (data: Partial<Lesson> & { objectives?: string[]; materials?: string[]; activities?: LessonActivityInput[] }) =>
    api.post<{ lesson: Lesson }>("/lessons", data),
  update: (id: string, data: Partial<Lesson> & { objectives?: string[]; materials?: string[]; activities?: LessonActivityInput[] }) =>
    api.put<{ lesson: Lesson }>(`/lessons/${id}`, data),
  remove: (id: string) => api.del<{ ok: boolean }>(`/lessons/${id}`),
};

// ---- Partners ----
export const partnersApi = {
  list: () => api.get<{ partners: Partner[] }>("/partners"),
  create: (data: Partial<Partner>) => api.post<{ partner: Partner }>("/partners", data),
  update: (id: string, data: Partial<Partner>) => api.put<{ partner: Partner }>(`/partners/${id}`, data),
  remove: (id: string) => api.del<{ ok: boolean }>(`/partners/${id}`),
};

// ---- Reports ----
export const reportsApi = {
  summary: () => api.get<ReportSummary>("/reports/summary"),
  analytics: () => api.get<ReportsAnalytics>("/reports/analytics"),
};
