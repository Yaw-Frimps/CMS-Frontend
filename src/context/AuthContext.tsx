import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface LoginData {
  token: string;
  id: number;
  email: string;
  role: string;
  memberId: number;
  profileImageUrl?: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  memberId: number | null;
  profileImageUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginData) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  useEffect(() => {
    const hydrateFromStorage = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    };
    
    // Only hydrate if we don't already have user data from initial state
    if (!user && !token) {
      hydrateFromStorage();
    }
  }, []);

  const login = (data: { token: string; id: number; email: string; role: string; memberId: number; profileImageUrl?: string }) => {
    setToken(data.token);
    const userData = { id: data.id, email: data.email, role: data.role, memberId: data.memberId, profileImageUrl: data.profileImageUrl || null };
    setUser(userData);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const newUserData = { ...user, ...updatedData };
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      updateUser,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Separate file export to satisfy react-refresh/only-export-components
// Keep hooks separate from provider exports
