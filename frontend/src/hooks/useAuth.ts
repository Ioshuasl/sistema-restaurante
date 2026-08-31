
import { useState } from 'react';
// Fix: Use 'react-router' instead of 'react-router-dom' to resolve missing export member error
import { useNavigate } from 'react-router';
import { loginUser } from '../services/userService';
import { type LoginPayload } from '../types';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (credentials: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      
      // Persistência dos dados
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success('Acesso autorizado! Bem-vindo.');
      
      // Redirecionamento para o Dashboard
      navigate('/admin/dashboard');
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Credenciais inválidas. Verifique seu usuário e senha.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.info('Sessão encerrada.');
  };

  return {
    login,
    logout,
    isLoading,
    error,
    isAuthenticated: !!localStorage.getItem('token')
  };
};