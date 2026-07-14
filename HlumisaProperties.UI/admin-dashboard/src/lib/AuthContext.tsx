"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  loginApi,
  fetchMe,
  getStoredToken,
  getStoredUser,
  storeAuth,
  clearAuth,
  type UserInfo,
  type LoginCredentials,
} from "./auth";

type AuthContextType = {
  user: UserInfo | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a stored token and validate it
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Try to use stored user info first for instant load
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      // Validate token by fetching /me
      try {
        const freshUser = await fetchMe(token);
        setUser(freshUser);
        storeAuth(token, freshUser);
      } catch {
        // Token is invalid/expired, clear auth
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await loginApi(credentials);
    const userInfo: UserInfo = {
      id: result.email, // We'll update this after fetching /me
      email: result.email,
      firstName: result.firstName,
      lastName: result.lastName,
    };

    // Store token immediately
    storeAuth(result.token, userInfo);

    // Fetch full user info to get the ID
    try {
      const freshUser = await fetchMe(result.token);
      setUser(freshUser);
      storeAuth(result.token, freshUser);
    } catch {
      // If /me fails, still set user from login response
      setUser(userInfo);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}