export type Role = "admin" | "teacher" | "parent" | "volunteer" | "cellLeader" | "partner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string | null;
  age: number | null;
  gender: string | null;
  ageGroup: string | null;
  allergies: string | null;
  medicalNotes: string | null;
  churchMember: boolean;
  parentFirstName: string | null;
  parentLastName: string | null;
  parentName: string;
  parentEmail: string | null;
  parentPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  emergencyContactName: string | null;
  emergencyContactRelation: string | null;
  emergencyContactPhone: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChildNote {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  serviceType: string;
  status: string;
  checkedBy: string | null;
  checkedInAt: string;
}

export interface ChildDetails {
  child: Child;
  notes: ChildNote[];
  attendance: AttendanceRecord[];
}

export interface AttendanceSession {
  id: string;
  date: string;
  serviceType: string;
  present: number;
  total: number;
  absent: number;
}

export interface AttendanceList {
  sessions: AttendanceSession[];
  todayPresent: number;
  totalChildren: number;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  address: string | null;
  capacity: number;
  ageGroup: string | null;
  requiresRegistration: boolean;
  imageUrl: string | null;
  status: string;
  registeredAttendees: number;
  createdAt: string;
}

export interface EventAttendee {
  id: string;
  childId: string;
  name: string;
  age: string | null;
  parent: string | null;
  status: string;
}

export interface EventVolunteer {
  id: string;
  name: string;
  role: string | null;
  assigned: string | null;
}

export interface EventDetails {
  event: Event;
  attendees: EventAttendee[];
  volunteers: EventVolunteer[];
}

export interface EventsList {
  events: Event[];
  upcoming: Event[];
  past: Event[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  ageGroup: string | null;
  category: string | null;
  date: string | null;
  duration: number | null;
  createdAt: string;
}

export interface LessonActivity {
  name: string;
  description: string | null;
  duration: number | null;
  materials: string[];
}

export interface LessonDetails {
  lesson: Lesson;
  objectives: string[];
  materials: string[];
  activities: LessonActivity[];
}

export interface Partner {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  partnershipType: string | null;
  contributionAmount: string | null;
  lastContribution: string | null;
  nextMeeting: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

export interface ReportSummary {
  totalChildren: number;
  teachersCount: number;
  totalLessons: number;
  totalEvents: number;
  upcomingEvents: number;
  totalPartners: number;
  attendance: { today: number; absentees: number; percentage: number };
  nextEvent: { id: string; title: string; date: string } | null;
}

export interface AttendanceTrendPoint {
  month: string;
  key: string;
  full: string;
  attendance: number;
  registered: number;
  rate: number;
}

export interface AgeDistPoint {
  name: string;
  value: number;
  color: string;
}

export interface CurriculumPoint {
  name: string;
  total: number;
  complete: number;
}

export interface CheckInPoint {
  time: string;
  hour: string;
  count: number;
}

export interface TeacherParticipationPoint {
  key: string;
  full: string;
  month: string;
  teachers: number;
  volunteers: number;
}

export interface ReportsAnalytics {
  months: string[];
  attendanceTrend: AttendanceTrendPoint[];
  ageDistribution: AgeDistPoint[];
  curriculumProgress: CurriculumPoint[];
  checkInTimes: CheckInPoint[];
  teacherParticipation: TeacherParticipationPoint[];
  totalChildren: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ChildInput {
  firstName: string;
  lastName: string;
  dob?: string;
  gender?: string;
  ageGroup?: string;
  allergies?: string;
  medicalNotes?: string;
  churchMember?: boolean;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  photoUrl?: string;
}
