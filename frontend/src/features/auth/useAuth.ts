import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from "../../shared/api/client";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  first_name: string;
  last_name?: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/token/', data);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      const userResponse = await api.get('/users/me/');
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      navigate('/');
      return userResponse.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка входа');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/register/', data);
      await login({ email: data.email, password: data.password });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
  };

  return {
    login,
    register,
    logout,
    getUser,
    isAuthenticated,
    loading,
    error,
  };
}