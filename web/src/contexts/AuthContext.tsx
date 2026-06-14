// src/contexts/AuthContext.tsx
import { createContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrMobile: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (emailOrMobile: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (emailOrMobile && password.length >= 6) {
          const mockUser: User = {
            id: '1',
            email: emailOrMobile.includes('@') ? emailOrMobile : `${emailOrMobile}@example.com`,
            name: emailOrMobile.includes('admin') ? 'Admin User' : 'Dr. John Doe',
            role: emailOrMobile.includes('admin') ? 'admin' : 'doctor',
          };
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};