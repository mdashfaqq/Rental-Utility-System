import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { authApi } from '@/services/api';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: (reason?: 'manual' | 'idle') => void;
  isAuthenticated: boolean;
  loading: boolean;
  
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // ✅ dynamic settings
  const [idleTimeout, setIdleTimeout] = useState(5 * 60 * 1000); // default 5 min
  const [autoLogoutEnabled, setAutoLogoutEnabled] = useState(true);

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [loading, setLoading] = useState(true); // ✅ IMPORTANT


useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    setIsAuthenticated(true);
  }

  setLoading(false); // 🔥 MUST be AFTER checking token
}, []);

useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    setIsAuthenticated(true);
  }

  setLoading(false); // ✅ AFTER checking token
}, []);
  // =========================
  // ✅ AUTH CHECK (DO NOT TOUCH)
  // =========================
useEffect(() => {
  try {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else {
      setToken(null);
      setUser(null);
    }
  } catch (error) {
    console.error('Auth parse error:', error);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  } finally {
    setLoading(false); // ✅ move inside finally
  }

  loadSettings(); // keep this
}, []);

  // =========================
  // ✅ LOAD SETTINGS (DYNAMIC)
  // =========================
  const loadSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings.php?type=security`);
      const data = await res.json();

      console.log('SECURITY SETTINGS:', data);

      let settingsObj: any = {};

      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          settingsObj[item.key] = item.value;
        });
      } else {
        settingsObj = data.data || data;
      }

      setAutoLogoutEnabled(settingsObj.autoLogout === 'true');

      const timeoutMinutes = Number(settingsObj.sessionTimeout || 5);
      setIdleTimeout(timeoutMinutes * 60 * 1000);

    } catch (err) {
      console.error('Settings failed, using fallback');

      setAutoLogoutEnabled(true);
      setIdleTimeout(5 * 60 * 1000);
    }
  };

  // =========================
  // ✅ LOGIN
  // =========================
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ username, password });

      if (response.data.token && response.data.user) {
        const { token: authToken, user: userData } = response.data;

        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_data', JSON.stringify(userData));

        setToken(authToken);
        setUser(userData);

        toast.success('Login successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      return false;
    }
  };

  // =========================
  // ✅ REGISTER
  // =========================
  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await authApi.register(userData);

      if (response.status === 201) {
        toast.success('Registration successful! Please login.');
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      return false;
    }
  };

  // =========================
  // ✅ LOGOUT
  // =========================
  const logout = useCallback((reason: 'manual' | 'idle' = 'manual') => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    setToken(null);
    setUser(null);

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    if (reason === 'idle') {
      toast.warning('Logged out due to inactivity');
    } else {
      toast.success('Logged out successfully');
    }
  }, []);

  // =========================
  // ✅ AUTO LOGOUT (DYNAMIC)
  // =========================
  useEffect(() => {
    if (!token || !autoLogoutEnabled) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      idleTimerRef.current = setTimeout(() => {
        logout('idle');
      }, idleTimeout);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    resetIdleTimer();
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
    };

  }, [token, logout, idleTimeout, autoLogoutEnabled]);

  // =========================
  // ✅ CONTEXT VALUE
  // =========================
  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};