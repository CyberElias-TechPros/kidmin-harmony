
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, Home, CalendarCheck, BookOpen, Calendar, HeartHandshake, 
  BarChart3, LogOut, Menu, X, ChevronDown, User, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
  { title: 'Children', href: '/children', icon: <Users className="h-5 w-5" /> },
  { title: 'Attendance', href: '/attendance', icon: <CalendarCheck className="h-5 w-5" />, roles: ['admin', 'teacher', 'volunteer', 'cellLeader'] },
  { title: 'Lessons', href: '/lessons', icon: <BookOpen className="h-5 w-5" /> },
  { title: 'Events', href: '/events', icon: <Calendar className="h-5 w-5" /> },
  { title: 'Partners', href: '/partners', icon: <HeartHandshake className="h-5 w-5" />, roles: ['admin'] },
  { title: 'Reports', href: '/reports', icon: <BarChart3 className="h-5 w-5" />, roles: ['admin', 'teacher'] },
  { title: 'Users', href: '/admin/users', icon: <Shield className="h-5 w-5" />, roles: ['admin'] },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-background/90 border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => navigate('/dashboard')}
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-lg hidden sm:inline-block">
                KidMin Harmony
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {filteredNavItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors",
                  location.pathname === item.href && "bg-secondary text-foreground"
                )}
                onClick={() => navigate(item.href)}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Button>
            ))}
          </nav>
          
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      {user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Log in
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs h-full bg-background p-6 flex flex-col">
            <div className="space-y-4">
              {filteredNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors",
                    location.pathname === item.href && "bg-secondary text-foreground"
                  )}
                  onClick={() => navigate(item.href)}
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </Button>
              ))}
            </div>
            
            <div className="mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive"
                onClick={logout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container py-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;
