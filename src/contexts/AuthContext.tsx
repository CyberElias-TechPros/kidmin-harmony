import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { authApi, setToken, getToken, ApiError } from "@/services/api/client";
import type { User, Role } from "@/services/api/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

const USER_SESSION_KEY = "kidmin_user_session";

interface AuthProviderProps {
  children: React.ReactNode;
}

const loadCachedUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => (getToken() ? loadCachedUser() : null));
  const [isLoading, setIsLoading] = useState<boolean>(!!getToken());

  // Restore / validate the session on initial load.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    authApi
      .me()
      .then((res) => {
        if (cancelled) return;
        setUser(res.user);
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(res.user));
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setToken(null);
          setUser(null);
          localStorage.removeItem(USER_SESSION_KEY);
        } else {
          // Network hiccup: fall back to the cached user so the app stays usable.
          setUser(loadCachedUser());
        }
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user: resUser } = await authApi.login(email, password);
      setToken(token);
      setUser(resUser);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(resUser));
      toast.success(`Welcome back, ${resUser.name}!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid email or password";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: Role) => {
    setIsLoading(true);
    try {
      const { token, user: resUser } = await authApi.register({ name, email, password, role });
      setToken(token);
      setUser(resUser);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(resUser));
      toast.success(`Welcome, ${resUser.name}!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Swallow network errors on logout; we still clear the local session.
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
