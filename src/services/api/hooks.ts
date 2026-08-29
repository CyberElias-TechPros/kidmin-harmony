import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  childrenApi,
  eventsApi,
  lessonsApi,
  attendanceApi,
  partnersApi,
  reportsApi,
} from "./client";
import type { ChildInput, Event, Lesson, Partner } from "./types";
import type { LessonActivityInput } from "./client";

export const queryKeys = {
  children: ["children"],
  child: (id: string) => ["children", id],
  events: ["events"],
  event: (id: string) => ["events", id],
  lessons: ["lessons"],
  lesson: (id: string) => ["lessons", id],
  attendance: ["attendance"],
  attendanceSession: (id: string) => ["attendance", id],
  partners: ["partners"],
  reports: ["reports"],
  summary: ["reports", "summary"],
  analytics: ["reports", "analytics"],
};

function useInvalidate(keys: QueryKey[]) {
  const qc = useQueryClient();
  return () => keys.forEach((key) => qc.invalidateQueries({ queryKey: key }));
}

// ---------------------------------------------------------------------------
// Children
// ---------------------------------------------------------------------------
export function useChildren() {
  return useQuery({ queryKey: queryKeys.children, queryFn: () => childrenApi.list() });
}

export function useChild(id: string) {
  return useQuery({
    queryKey: queryKeys.child(id),
    queryFn: () => childrenApi.get(id),
    enabled: !!id,
  });
}

export function useCreateChild() {
  const invalidate = useInvalidate([queryKeys.children]);
  return useMutation({
    mutationFn: (data: ChildInput) => childrenApi.create(data),
    onSuccess: () => {
      invalidate();
      toast.success("Child registered successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateChild() {
  const invalidate = useInvalidate([queryKeys.children]);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChildInput }) => childrenApi.update(id, data),
    onSuccess: () => {
      invalidate();
      toast.success("Child updated successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteChild() {
  const invalidate = useInvalidate([queryKeys.children]);
  return useMutation({
    mutationFn: (id: string) => childrenApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Child deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text, author }: { id: string; text: string; author?: string }) =>
      childrenApi.addNote(id, text, author),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.child(vars.id) });
      toast.success("Note added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export function useEvents() {
  return useQuery({ queryKey: queryKeys.events, queryFn: () => eventsApi.list() });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: () => eventsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const invalidate = useInvalidate([queryKeys.events]);
  return useMutation({
    mutationFn: (data: Partial<Event>) => eventsApi.create(data),
    onSuccess: () => {
      invalidate();
      toast.success("Event created successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateEvent() {
  const invalidate = useInvalidate([queryKeys.events]);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) => eventsApi.update(id, data),
    onSuccess: () => {
      invalidate();
      toast.success("Event updated successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteEvent() {
  const invalidate = useInvalidate([queryKeys.events]);
  return useMutation({
    mutationFn: (id: string) => eventsApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Event deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRegisterEventChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, childId, status }: { eventId: string; childId: string; status?: string }) =>
      eventsApi.registerChild(eventId, childId, status),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.event(vars.eventId) });
      qc.invalidateQueries({ queryKey: queryKeys.events });
      toast.success("Child registered for event");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------
export function useLessons() {
  return useQuery({ queryKey: queryKeys.lessons, queryFn: () => lessonsApi.list() });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: queryKeys.lesson(id),
    queryFn: () => lessonsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateLesson() {
  const invalidate = useInvalidate([queryKeys.lessons]);
  return useMutation({
    mutationFn: (data: Partial<Lesson> & { objectives?: string[]; materials?: string[]; activities?: LessonActivityInput[] }) =>
      lessonsApi.create(data),
    onSuccess: () => {
      invalidate();
      toast.success("Lesson created successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateLesson() {
  const invalidate = useInvalidate([queryKeys.lessons]);
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Lesson> & { objectives?: string[]; materials?: string[]; activities?: LessonActivityInput[] };
    }) => lessonsApi.update(id, data),
    onSuccess: () => {
      invalidate();
      toast.success("Lesson updated successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteLesson() {
  const invalidate = useInvalidate([queryKeys.lessons]);
  return useMutation({
    mutationFn: (id: string) => lessonsApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Lesson deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------
export function useAttendance() {
  return useQuery({ queryKey: queryKeys.attendance, queryFn: () => attendanceApi.list() });
}

export function useCheckIn() {
  const invalidate = useInvalidate([queryKeys.attendance, queryKeys.children]);
  return useMutation({
    mutationFn: (data: { childId: string; date?: string; serviceType?: string; sessionId?: string }) =>
      attendanceApi.checkin(data),
    onSuccess: () => {
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAttendanceSession(id: string) {
  return useQuery({
    queryKey: queryKeys.attendanceSession(id),
    queryFn: () => attendanceApi.get(id),
    enabled: !!id,
  });
}

export function useCreateAttendanceSession() {
  const invalidate = useInvalidate([queryKeys.attendance]);
  return useMutation({
    mutationFn: (data: { date: string; serviceType: string }) => attendanceApi.createSession(data),
    onSuccess: () => {
      invalidate();
      toast.success("Attendance session created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------------------------------------------------------------------------
// Partners
// ---------------------------------------------------------------------------
export function usePartners() {
  return useQuery({ queryKey: queryKeys.partners, queryFn: () => partnersApi.list() });
}

export function useCreatePartner() {
  const invalidate = useInvalidate([queryKeys.partners]);
  return useMutation({
    mutationFn: (data: Partial<Partner>) => partnersApi.create(data),
    onSuccess: () => {
      invalidate();
      toast.success("Partner added successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePartner() {
  const invalidate = useInvalidate([queryKeys.partners]);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Partner> }) => partnersApi.update(id, data),
    onSuccess: () => {
      invalidate();
      toast.success("Partner updated successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePartner() {
  const invalidate = useInvalidate([queryKeys.partners]);
  return useMutation({
    mutationFn: (id: string) => partnersApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Partner deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
export function useReportSummary() {
  return useQuery({ queryKey: queryKeys.summary, queryFn: () => reportsApi.summary() });
}

export function useReportAnalytics() {
  return useQuery({ queryKey: queryKeys.analytics, queryFn: () => reportsApi.analytics() });
}
