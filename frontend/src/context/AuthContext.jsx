import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosInstance';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load: check if cookie still valid → auto login
  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data.user);
  };

  const login = async (email, password, rememberMe = true) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    setUser(data.user);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
