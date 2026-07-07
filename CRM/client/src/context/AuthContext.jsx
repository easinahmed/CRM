import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeApi, loginApi, logoutApi } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await getMeApi();
      setUser(data.data);
    } catch (error) {
      // 401 is expected when user is not logged in - don't treat as error
      if (error.response?.status !== 401) {
        console.error('Auth check failed:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await loginApi(credentials);
    setUser(data.data.user);
    toast.success('Welcome back!');
    return data.data;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // continue
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
