
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  Package, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';

interface SidebarProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const UNREAD_ORDERS_KEY = 'gs-sabores-unread-orders';

const Sidebar: React.FC<SidebarProps> = ({ isDarkMode, toggleTheme, isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasUnread, setHasUnread] = useState(false);
  
  useEffect(() => {
    const checkUnread = () => {
      const val = localStorage.getItem(UNREAD_ORDERS_KEY);
      setHasUnread(val === 'true');
    };

    checkUnread();
    window.addEventListener('storage', checkUnread);
    window.addEventListener('storage-update', checkUnread);
    
    return () => {
      window.removeEventListener('storage', checkUnread);
      window.removeEventListener('storage-update', checkUnread);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/order', icon: Package, label: 'Pedidos', alert: true },
    { path: '/admin/product', icon: ShoppingBag, label: 'Produtos' },
    { path: '/admin/user/consult', icon: Users, label: 'Usuários' },
    { path: '/admin/config', icon: Settings, label: 'Configurações' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg">
            <ShoppingBag className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">S&G Admin</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              onClick={() => onClose && onClose()}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                isActive 
                ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.alert && hasUnread && !isActive && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
        {toggleTheme && (
          <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all font-bold text-sm">
            {isDarkMode ? <><Sun size={20} className="text-amber-500" /> Modo Claro</> : <><Moon size={20} className="text-indigo-500" /> Modo Escuro</>}
          </button>
        )}
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all font-bold text-sm">
          <LogOut className="h-5 w-5" /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col h-screen sticky top-0 transition-colors">
        {sidebarContent}
      </aside>

      <div className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <aside className={`absolute inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {sidebarContent}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
