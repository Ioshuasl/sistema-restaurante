
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router";
import { type Produto, type SubProduto, type CartItem } from './types';
import { toast, ToastContainer } from 'react-toastify';

// Pages
import Cardapio from "./pages/Public/Cardapio/Cardapio";
import Checkout from "./pages/Public/Checkout/Checkout";
import PedidoConfirmado from "./pages/Public/Pedido-Confirmado/Pedido-Confirmado";
import Login from "./pages/Auth/Login/Login";
import Dashboard from "./pages/Admin/Dashboard/DashBoard";
import OrderManagment from "./pages/Admin/Order/Order-Managment";
import ProductManagment from "./pages/Admin/Product/Product-Managment";
import UserManagment from "./pages/Admin/Users/User-Managment"
import Config from "./pages/Admin/Config/Config"

// Constants for Storage
const CART_STORAGE_KEY = 'gs-sabores-cart-v2';
const THEME_STORAGE_KEY = 'gs-sabores-theme';
const CART_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 horas

export default function App() {
  const navigate = useNavigate();
  
  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState(() => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
      const root = window.document.documentElement;
      if (isDarkMode) {
          root.classList.add('dark');
          localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      } else {
          root.classList.remove('dark');
          localStorage.setItem(THEME_STORAGE_KEY, 'light');
      }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // Cart Management com Persistência Robusta
  const [cart, setCart] = useState<CartItem[]>(() => {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      
      try {
          const { items, timestamp } = JSON.parse(saved);
          
          if (Date.now() - timestamp > CART_EXPIRATION_MS) {
              localStorage.removeItem(CART_STORAGE_KEY);
              return [];
          }
          
          return Array.isArray(items) ? items : [];
      } catch (e) {
          console.error("Erro ao recuperar carrinho:", e);
          return [];
      }
  });

  useEffect(() => {
      const dataToSave = {
          items: cart,
          timestamp: Date.now()
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [cart]);

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => 
        prev.map(item => 
            item.cartItemId === cartItemId 
                ? { ...item, quantity: Math.max(0, item.quantity + delta) } 
                : item
        ).filter(item => item.quantity > 0)
    );
  };

  const handleUpdateItem = (
    cartItemId: string,
    newConfig: { 
        product: Produto, 
        selectedSubProducts: SubProduto[], 
        quantity: number, 
        unitPriceWithSubProducts: number,
        observation?: string 
    }
  ) => {
    setCart(prev => prev.map(item => {
        if (item.cartItemId === cartItemId) {
            const subProductIds = newConfig.selectedSubProducts.map(op => op.id).sort().join('-');
            return {
                ...item,
                product: newConfig.product,
                selectedSubProducts: newConfig.selectedSubProducts,
                quantity: newConfig.quantity,
                unitPriceWithSubProducts: newConfig.unitPriceWithSubProducts,
                observation: newConfig.observation,
                cartItemId: `${newConfig.product.id}-${subProductIds}-${newConfig.observation || ''}`
            };
        }
        return item;
    }));
  };

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={
              <Cardapio 
                  cart={cart} 
                  setCart={setCart} 
                  isDarkMode={isDarkMode} 
                  toggleTheme={toggleTheme}
                  onCheckout={() => navigate('/checkout')}
              />
          } 
        />
        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              onBack={() => navigate('/')}
              onConfirm={() => {
                  setCart([]);
                  localStorage.removeItem(CART_STORAGE_KEY);
                  navigate('/pedido-confirmado');
              }}
              onIncrease={(id) => updateQuantity(id, 1)}
              onDecrease={(id) => updateQuantity(id, -1)}
              onUpdateItem={handleUpdateItem}
              isDarkMode={isDarkMode}
            />
          }
        />
        <Route path="/pedido-confirmado" element={<PedidoConfirmado />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<Dashboard isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
        <Route path="/admin/order" element={<OrderManagment isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
        <Route path="/admin/product" element={<ProductManagment isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
        <Route path="/admin/user/consult" element={<UserManagment isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
        <Route path="/admin/config" element={<Config isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
      </Routes>
      <ToastContainer position="bottom-right" theme={isDarkMode ? 'dark' : 'light'} />
    </>
  );
}
