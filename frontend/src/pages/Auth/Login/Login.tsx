
import React, { useState } from 'react';
// Fix: Use 'react-router' instead of 'react-router-dom' to resolve missing export member error
import { useNavigate } from 'react-router';
import { User, Lock, ArrowRight, CookingPot, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
    } catch (err) {
      // O erro já é tratado via toast no hook useAuth
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      {/* Botão Voltar */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-bold transition group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
        Voltar para a Loja
      </button>

      <div className="max-w-md w-full">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-red-200 dark:shadow-none mx-auto mb-4 animate-float">
            <CookingPot size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Painel Gestão</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Acesso exclusivo para administradores</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-10 transition-colors">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 transition-colors">
                Usuário
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors">
                  <User size={20} />
                </div>
                <input 
                  type="text"
                  required
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium dark:text-slate-100 focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-500/10 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  placeholder="admin_01"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">
                  Senha
                </label>
                <button type="button" className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider hover:underline">
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium dark:text-slate-100 focus:ring-2 focus:ring-red-500/20 dark:focus:ring-red-500/10 transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                ${isLoading 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-100 dark:shadow-none active:scale-[0.98]'
                }
              `}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={14} />
            Conexão Segura
          </div>
          <p className="text-[10px] text-slate-300 dark:text-slate-700 font-medium">GS SABORES © 2025 - TODOS OS DIREITOS RESERVADOS</p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;