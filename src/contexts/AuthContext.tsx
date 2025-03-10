
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
} from "firebase/auth";
import { 
  auth, 
  loginWithEmail, 
  logoutUser,
  isDemoEmail 
} from '@/services/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'parent' | 'volunteer' | 'cellLeader' | 'partner';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

// Demo users for demonstration purposes
const DEMO_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@church.org',
    password: 'admin123',
    role: 'admin' as const,
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff',
  },
  {
    id: '2',
    name: 'Teacher Smith',
    email: 'teacher@church.org',
    password: 'teacher123',
    role: 'teacher' as const,
    avatar: 'https://ui-avatars.com/api/?name=Teacher+Smith&background=6366f1&color=fff',
  },
  {
    id: '3',
    name: 'Parent Jones',
    email: 'parent@church.org',
    password: 'parent123',
    role: 'parent' as const,
    avatar: 'https://ui-avatars.com/api/?name=Parent+Jones&background=6366f1&color=fff',
  }
];

// Helper function to determine user role based on email domain or saved data
const determineUserRole = (email: string, displayName?: string | null): User => {
  // For demo accounts, use predefined roles
  if (isDemoEmail(email)) {
    const demoUser = DEMO_USERS.find(u => u.email === email);
    if (demoUser) {
      return {
        id: auth.currentUser?.uid || demoUser.id,
        name: demoUser.name,
        email: email,
        role: demoUser.role,
        avatar: demoUser.avatar
      };
    }
  }
  
  // For real users, determine role based on stored value or provide default
  const storedUserData = localStorage.getItem(`user_role_${email}`);
  if (storedUserData) {
    try {
      const userData = JSON.parse(storedUserData);
      return {
        id: auth.currentUser?.uid || '',
        name: displayName || email.split('@')[0],
        email: email,
        role: userData.role,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || email)}&background=6366f1&color=fff`
      };
    } catch (error) {
      console.error("Error parsing stored user data:", error);
    }
  }
  
  // Default for new users
  return {
    id: auth.currentUser?.uid || '',
    name: displayName || email.split('@')[0],
    email: email,
    role: 'parent' as const, // Default role
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || email)}&background=6366f1&color=fff`
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const { email, displayName, uid } = firebaseUser;
        
        if (email) {
          const userWithRole = determineUserRole(email, displayName);
          setUser(userWithRole);
          
          // Store role if this is not a demo account
          if (!isDemoEmail(email)) {
            localStorage.setItem(`user_role_${email}`, JSON.stringify({
              role: userWithRole.role,
              avatar: userWithRole.avatar
            }));
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      if (isDemoEmail(email)) {
        // For demo accounts, check against our predefined list
        const demoUser = DEMO_USERS.find(
          u => u.email === email && u.password === password
        );
        
        if (!demoUser) {
          throw new Error('Invalid demo credentials');
        }
        
        // Still log in with Firebase in case the account exists
        try {
          await loginWithEmail(email, password);
        } catch (firebaseError) {
          console.log("Demo user not in Firebase, would create account in production");
          // In a real app, we might create the account here
        }
        
        // Set the demo user regardless of Firebase result
        setUser({
          id: auth.currentUser?.uid || demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          avatar: demoUser.avatar
        });
        
        toast.success(`Welcome back, ${demoUser.name}!`);
      } else {
        // For real users, authenticate with Firebase
        const userCredential = await loginWithEmail(email, password);
        const { user: firebaseUser } = userCredential;
        
        if (firebaseUser.email) {
          const userWithRole = determineUserRole(
            firebaseUser.email, 
            firebaseUser.displayName
          );
          
          setUser(userWithRole);
          toast.success(`Welcome back, ${userWithRole.name}!`);
        }
      }
    } catch (error) {
      toast.error('Invalid email or password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      toast.info('You have been logged out');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error('Error logging out');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
