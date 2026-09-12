import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import ChildrenList from "./pages/children/ChildrenList";
import ChildDetails from "./pages/children/ChildDetails";
import AddChild from "./pages/children/AddChild";
import EditChild from "./pages/children/EditChild";
import Attendance from "./pages/attendance/Attendance";
import AttendanceScanner from "./pages/attendance/AttendanceScanner";
import ManualCheckIn from "./pages/attendance/ManualCheckIn";
import Events from "./pages/events/Events";
import EventDetails from "./pages/events/EventDetails";
import AddEvent from "./pages/events/AddEvent";
import EditEvent from "./pages/events/EditEvent";
import Curriculum from "./pages/curriculum/Curriculum";
import LessonDetails from "./pages/curriculum/LessonDetails";
import AddLesson from "./pages/curriculum/AddLesson";
import EditLesson from "./pages/curriculum/EditLesson";
import Partners from "./pages/partners/Partners";
import Reports from "./pages/reports/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <Layout>{children}</Layout>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Children Management */}
            <Route
              path="/children"
              element={
                <ProtectedRoute>
                  <ChildrenList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/children/add"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher", "volunteer", "cellLeader"]}>
                  <AddChild />
                </ProtectedRoute>
              }
            />
            <Route
              path="/children/:id"
              element={
                <ProtectedRoute>
                  <ChildDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/children/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <EditChild />
                </ProtectedRoute>
              }
            />

            {/* Attendance */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher", "volunteer", "cellLeader"]}>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/scanner"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher", "volunteer", "cellLeader"]}>
                  <AttendanceScanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/manual"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher", "volunteer", "cellLeader"]}>
                  <ManualCheckIn />
                </ProtectedRoute>
              }
            />

            {/* Events */}
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/add"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <AddEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <EventDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <EditEvent />
                </ProtectedRoute>
              }
            />

            {/* Curriculum */}
            <Route
              path="/lessons"
              element={
                <ProtectedRoute>
                  <Curriculum />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/add"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <AddLesson />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/:id"
              element={
                <ProtectedRoute>
                  <LessonDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <EditLesson />
                </ProtectedRoute>
              }
            />

            {/* Partners - Admin only */}
            <Route
              path="/partners"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Partners />
                </ProtectedRoute>
              }
            />

            {/* Reports - Admin and Teacher only */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Profile & Settings */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
