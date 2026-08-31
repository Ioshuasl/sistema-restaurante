import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  LogOut,
  ChevronDown,
  ChevronRight,
  Settings,
  Menu,
  X,
  CreditCard,
  PrinterIcon,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  // Controla quais menus estão abertos
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // controle do menu mobile

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) =>
      prev.includes(menu)
        ? prev.filter((item) => item !== menu)
        : [...prev, menu]
    );
  };

  const isActive = (path: string) =>
    location.pathname.startsWith(path)
      ? "text-indigo-600 font-semibold"
      : "text-gray-700 hover:text-indigo-600";

  return (
    <>
      {/* Botão de menu (aparece apenas no mobile) */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden p-4 fixed top-6 right-6 bg-gray-200 rounded-lg shadow-xl"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-lg px-4 py-6 z-50 transform overflow-y-scroll scrollbar-hide
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:flex flex-col justify-between 
        `}
      >
        <div>
          {/* Botão fechar (aparece apenas no mobile) */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-indigo-600">
              Painel do Admin
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {/* Dashboard */}
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-2 px-2 py-2 rounded ${isActive("/admin/dashboard")}`}
              onClick={() => setIsSidebarOpen(false)} // fecha no mobile
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>

            {/* Pedidos */}
            <Link
              to="/admin/order"
              className={`flex items-center gap-2 px-2 py-2 rounded ${isActive("/admin/order")}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <ShoppingCart size={20} />
              Pedidos
            </Link>

            {/* Produto */}

            <Link
              to="/admin/product"
              className={`flex items-center gap-2 px-2 py-2 rounded ${isActive("/admin/product")}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Package size={20} />
              Produto
            </Link>

            {/* Categoria de Produto */}
            <Link
              to="/admin/category-product"
              className={`flex items-center gap-2 px-2 py-2 rounded ${isActive("/admin/category-product")}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Package size={20} />
              Categoria de Produto
            </Link>

            {/*Forma de Pagamento*/}
            <Link
              to="/admin/payment-method"
              className={`flex items-center gap-2 px-2 py-2 rounded ${isActive("/admin/payment-method")}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <CreditCard size={20}/>
              Forma de Pagamento
            </Link>

            {/* Usuários */}
            <div>
              <button
                onClick={() => toggleMenu("user")}
                className="flex text-gray-700 items-center gap-2 w-full text-left px-2 py-2 rounded hover:text-indigo-600"
              >
                <Users size={20} />
                Usuários
                {openMenus.includes("user") ? (
                  <ChevronDown size={18} className="ml-auto" />
                ) : (
                  <ChevronRight size={18} className="ml-auto" />
                )}
              </button>
              {openMenus.includes("user") && (
                <div className="ml-6 flex flex-col gap-2">
                  <Link
                    to="/admin/user/consult"
                    className={isActive("/admin/user/consult")}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    Gerenciar Usuários
                  </Link>
                  <Link
                    to="/admin/user/new"
                    className={isActive("/admin/user/new")}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    Cadastrar Usuário
                  </Link>
                  <Link
                    to="/admin/user/role"
                    className={isActive("/admin/user/role")}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    Gerenciar Cargo
                  </Link>
                </div>
              )}
            </div>

            {/* Configurações */}
            <Link
              to="/admin/config"
              className={`flex items-center gap-2 px-2 py-2 rounded ${isActive("/admin/config")}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Settings size={20} />
              Configurações
            </Link>
          </nav>
        </div>

        {/* Sair */}
        <div className="border-t border-gray-200 mt-2">
          <button
            className="w-full text-left flex items-center gap-2 px-2 py-2 rounded hover:bg-red-600 hover:text-white transition text-gray-700"
            onClick={() => setIsSidebarOpen(false)}
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
