
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import Attendance from "./pages/attendance/Attendance";
import AttendanceScanner from "./pages/attendance/AttendanceScanner";
import Events from "./pages/events/Events";
import EventDetails from "./pages/events/EventDetails";
import AddEvent from "./pages/events/AddEvent";
import Curriculum from "./pages/curriculum/Curriculum";
import LessonDetails from "./pages/curriculum/LessonDetails";
import AddLesson from "./pages/curriculum/AddLesson";

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
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
                <ProtectedRoute>
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
            
            {/* Attendance */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/scanner"
              element={
                <ProtectedRoute>
                  <AttendanceScanner />
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
                <ProtectedRoute>
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
                <ProtectedRoute>
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
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
