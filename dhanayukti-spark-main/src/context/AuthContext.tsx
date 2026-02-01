import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginApi, setAuth } from "@/services/api";

type AuthState = {
  token: string | null;
  userId: number | null;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "dhanyukti_auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, userId: null };
    try {
      const parsed = JSON.parse(raw) as AuthState;
      // Set the in-memory token immediately so first requests include Authorization
      setAuth(parsed.token, parsed.userId);
      return parsed;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return { token: null, userId: null };
    }
  });

  useEffect(() => {
    setAuth(state.token, state.userId);
  }, [state.token, state.userId]);

  const login = async (username: string, password: string) => {
    const res = await loginApi(username, password);
    const next = { token: res.token, userId: res.userId };
    // IMPORTANT: set in-memory auth immediately (avoid race with React state update)
    setAuth(next.token, next.userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setState(next);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    // Clear in-memory auth immediately
    setAuth(null, null);
    setState({ token: null, userId: null });
  };

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state.token, state.userId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};

