
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Menu, Search, MessageSquare, ChevronRight, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { getConfig } from '../../services/configService';
import { connectionState } from '../../functions/instanceConnect';

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
  showSearch?: boolean;
  hasUnreadNotifications?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  onMenuClick,
  showSearch = false,
  hasUnreadNotifications = false
}) => {
  const navigate = useNavigate();
  const [waStatus, setWaStatus] = useState<'open' | 'close' | 'error' | 'loading'>('loading');
  const [instanceName, setInstanceName] = useState<string | null>(null);

  const checkWhatsAppStatus = useCallback(async (name: string) => {
    try {
      const response = await connectionState({
        instanceName: name,
      });

      if (response && response.instance) {
        setWaStatus(response.instance.state as any);
      } else {
        setWaStatus('close');
      }
    } catch (error) {
      setWaStatus('error');
    }
  }, []);

  useEffect(() => {
    const initStatus = async () => {
      try {
        const config = await getConfig();
        if (config?.evolutionInstanceName) {
          setInstanceName(config.evolutionInstanceName);
          await checkWhatsAppStatus(config.evolutionInstanceName);
        } else {
          setWaStatus('close');
        }
      } catch (e) {
        setWaStatus('error');
      }
    };

    initStatus();
    const interval = setInterval(() => {
      if (instanceName) checkWhatsAppStatus(instanceName);
    }, 45000); // Checagem a cada 45s

    return () => clearInterval(interval);
  }, [instanceName, checkWhatsAppStatus]);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-20 flex items-center justify-between px-4 sm:px-8 shrink-0 transition-colors z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors hidden sm:block">
          {title}
        </h1>

        {showSearch && (
          <div className="relative w-48 xl:w-80 hidden md:block ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs outline-none dark:text-slate-100 transition-all focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* WhatsApp Status Indicator */}
        <Link
          to="/admin/config"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:shadow-md active:scale-95 ${waStatus === 'open'
              ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20'
              : 'bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20'
            }`}
        >
          <div className="relative flex h-2 w-2">
            {waStatus === 'open' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${waStatus === 'open' ? 'bg-emerald-500' :
                waStatus === 'loading' ? 'bg-slate-300' : 'bg-rose-500'
              }`}></span>
          </div>
          <div className="flex flex-col leading-none hidden xs:block">
            <span className={`text-[8px] font-black uppercase tracking-tighter ${waStatus === 'open' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
              WhatsApp
            </span>
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
              {waStatus === 'open' ? 'Online' : waStatus === 'loading' ? 'Verificando...' : 'Offline'}
            </span>
          </div>
          <MessageSquare size={14} className={waStatus === 'open' ? 'text-emerald-500' : 'text-rose-500'} />
        </Link>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

        <button
          onClick={() => navigate('/admin/order')}
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-2">
          <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-xs border border-slate-200 dark:border-slate-700">
            AD
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
