import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, CalendarCheck, BookOpen, Calendar, ArrowRight, AlertTriangle,
  HeartHandshake, BarChart3, UserPlus, School, TrendingUp,
} from "lucide-react";
import { useChildren, useEvents, useLessons, useReportSummary } from "@/services/api/hooks";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role === "parent") {
    return <ParentDashboard />;
  }
  if (user?.role === "admin" || user?.role === "teacher") {
    return <StaffDashboard />;
  }
  return <VolunteerDashboard />;
};

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: summary, isLoading } = useReportSummary();
  const { data: childrenData } = useChildren();
  const { data: eventsData } = useEvents();
  const { data: lessonsData } = useLessons();

  const upcomingEvents = eventsData?.upcoming ?? [];
  const pastLessons = lessonsData?.lessons ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here's what's happening in your children's ministry</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Children"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            value={summary?.totalChildren ?? 0}
            subtitle={`${summary?.teachersCount ?? 0} teachers assigned`}
          />
          <StatCard
            title="Today's Attendance"
            icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />}
            value={summary?.attendance.today ?? 0}
            subtitle={`${summary?.attendance.percentage ?? 0}% present`}
            trend="up"
          />
          <StatCard
            title="Upcoming Events"
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            value={summary?.upcomingEvents ?? 0}
            subtitle={summary?.nextEvent ? `Next: ${summary.nextEvent.title}` : "No upcoming events"}
          />
          <StatCard
            title="Lessons"
            icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            value={summary?.totalLessons ?? 0}
            subtitle={`${pastLessons.length} lessons in total`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="rounded-full bg-orange-100 p-1">
                  <Users className="h-4 w-4 text-orange-700" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">{summary?.attendance.absentees ?? 0} children absent today</p>
                  <p className="text-sm text-orange-700/70">Consider following up with parents</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="rounded-full bg-orange-100 p-1">
                  <CalendarCheck className="h-4 w-4 text-orange-700" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">
                    {upcomingEvents.length > 0 ? "Upcoming events to prepare" : "No upcoming events scheduled"}
                  </p>
                  <p className="text-sm text-orange-700/70">
                    {upcomingEvents.length > 0 ? `${upcomingEvents[0].title} is coming up` : "Plan new events for your ministry"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events happening soon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg cursor-pointer hover:bg-secondary/70"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {event.registeredAttendees}/{event.capacity} registered
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-6">No upcoming events. Create one to get started.</p>
              )}
              <Button variant="ghost" className="w-full" onClick={() => navigate("/events/add")}>
                + Create New Event
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickAction icon={<UserPlus className="h-4 w-4" />} label="Register New Child" onClick={() => navigate("/children/add")} />
              <QuickAction icon={<CalendarCheck className="h-4 w-4" />} label="Check-In Children" onClick={() => navigate("/attendance/scanner")} />
              <QuickAction icon={<Calendar className="h-4 w-4" />} label="Create New Event" onClick={() => navigate("/events/add")} />
              <QuickAction icon={<BookOpen className="h-4 w-4" />} label="Add New Lesson" onClick={() => navigate("/lessons/add")} />
              <QuickAction icon={<HeartHandshake className="h-4 w-4" />} label="Manage Partners" onClick={() => navigate("/partners")} showIf={user?.role === "admin"} />
              <QuickAction icon={<BarChart3 className="h-4 w-4" />} label="View Reports" onClick={() => navigate("/reports")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registration Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Registered Children</span>
                  <span className="text-sm font-medium">{childrenData?.children.length ?? 0}</span>
                </div>
                <ProgressBar value={100} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Future Events</span>
                  <span className="text-sm font-medium">{upcomingEvents.length}</span>
                </div>
                <ProgressBar value={Math.min(100, upcomingEvents.length * 10)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: eventsData } = useEvents();
  const upcomingEvents = eventsData?.upcoming ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here's what's happening today</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{new Date(event.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/events/${event.id}`)}>Details</Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-6">No upcoming events.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction icon={<CalendarCheck className="h-4 w-4" />} label="Check-In Children" onClick={() => navigate("/attendance/scanner")} />
            <QuickAction icon={<Users className="h-4 w-4" />} label="Children" onClick={() => navigate("/children")} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: childrenData, isLoading } = useChildren();
  const { data: eventsData } = useEvents();
  const { data: lessonsData } = useLessons();

  const children = childrenData?.children ?? [];
  const events = eventsData?.upcoming ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Here's what's happening with your children</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Children</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <Card key={child.id}>
                <CardHeader className="pb-2">
                  <CardTitle>{child.fullName}</CardTitle>
                  <CardDescription>{child.age ?? "?"} years old • {child.ageGroup ?? "Ungrouped"} Class</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <School className="h-4 w-4" />
                    <span>{child.ageGroup ?? "Not assigned"} Ministry</span>
                  </div>
                  {child.allergies ? (
                    <div className="mt-2 flex items-center gap-2 text-sm text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{child.allergies}</span>
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/children/${child.id}`)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No children are registered to your account yet.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.slice(0, 4).map((event) => (
            <Card key={event.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription>
                  {new Date(event.startDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => navigate(`/events/${event.id}`)}>
                  View Event Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <Button variant="ghost" className="w-full" onClick={() => navigate("/events")}>
          View All Events <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Curriculum</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(lessonsData?.lessons ?? []).slice(0, 4).map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{lesson.title}</CardTitle>
                <CardDescription>{lesson.category ?? "Lesson"}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => navigate(`/lessons/${lesson.id}`)}>
                  View Lesson
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <Button variant="ghost" className="w-full" onClick={() => navigate("/lessons")}>
          View All Lessons <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ---- shared sub-components ----
interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  value: React.ReactNode;
  subtitle?: string;
  trend?: "up" | "down";
}

const StatCard = ({ title, icon, value, subtitle, trend }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs flex items-center text-muted-foreground">
        {trend ? <TrendingUp className="h-3 w-3 mr-1 text-green-500" /> : null}
        {subtitle}
      </p>
    </CardContent>
  </Card>
);

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  showIf?: boolean;
}

const QuickAction = ({ icon, label, onClick, showIf = true }: QuickActionProps) => {
  if (!showIf) return null;
  return (
    <Button variant="outline" className="w-full justify-between" onClick={onClick}>
      {label}
      {icon}
    </Button>
  );
};

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
    <div className="bg-primary h-full rounded-full" style={{ width: `${value}%` }} />
  </div>
);

export default Dashboard;
