import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { authService, LoginPayload, SignupPayload } from '../services/authService';
import { tokenStorage, setUnauthorizedListener, formatApiErrorMessage } from '../services/apiClient';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<UserProfile>;
  signup: (payload: SignupPayload) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<UserProfile | null>;
  setDemoUser: (mockRole: UserRole) => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(tokenStorage.get());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const fetchUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    const existingToken = tokenStorage.get();
    if (!existingToken) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const profile = await authService.getMe();
      setUser(profile);
      setIsDemoMode(false);
      return profile;
    } catch (err) {
      console.warn('Failed to fetch profile with stored token', err);
      tokenStorage.remove();
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedListener(() => {
      setToken(null);
      setUser(null);
    });

    fetchUserProfile();

    return () => {
      setUnauthorizedListener(null);
    };
  }, [fetchUserProfile]);

  const login = async (payload: LoginPayload): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await authService.login(payload);
      setToken(res.access_token);
      setIsDemoMode(false);

      // Immediately fetch real profile from /auth/me
      const profile = await authService.getMe();
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: SignupPayload): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await authService.signup(payload);
      setToken(res.access_token);
      setIsDemoMode(false);

      // Verify profile from /auth/me
      const profile = await authService.getMe();
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setIsDemoMode(false);
  };

  const refreshUser = async (): Promise<UserProfile | null> => {
    if (isDemoMode) return user;
    return fetchUserProfile();
  };

  // Demo Switch for role preview if users want to test role layouts before signing up
  const setDemoUser = (demoRole: UserRole) => {
    setIsDemoMode(true);
    const mockProfiles: Record<UserRole, UserProfile> = {
      student: {
        id: 'demo-student-uuid',
        email: 'alex.chen@campus.edu',
        full_name: 'Alex Chen',
        role: 'student',
        created_at: new Date().toISOString(),
      },
      staff: {
        id: 'demo-staff-uuid',
        email: 'marcus.vance@campus.edu',
        full_name: 'Marcus Vance',
        role: 'staff',
        department_id: 'dept-facilities-uuid',
        department_name: 'Facilities & Maintenance',
        created_at: new Date().toISOString(),
      },
      admin: {
        id: 'demo-admin-uuid',
        email: 'dr.reynolds@campus.edu',
        full_name: 'Dr. Evelyn Reynolds',
        role: 'admin',
        created_at: new Date().toISOString(),
      },
    };
    setUser(mockProfiles[demoRole]);
    setToken('demo-preview-token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
        setDemoUser,
        isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
