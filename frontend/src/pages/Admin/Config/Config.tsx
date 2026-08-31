import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Building2, Truck, MessageSquare, Printer, Loader2, CloudCheck, Palette, Clock, Wallet,
  ChevronLeft, ChevronRight // <--- NOVOS IMPORTS
} from 'lucide-react';
import Sidebar from "../../../components/Admin/Sidebar";
import AdminHeader from "../../../components/Admin/AdminHeader";
import { getConfig, updateConfig } from '../../../services/configService';
import RestauranteTab from "../../../components/Admin/Config/RestauranteTab";
import AparenciaTab from "../../../components/Admin/Config/AparenciaTab";
import MobilePreview from "../../../components/Admin/Config/MobilePreview";
import TaxasTab from "../../../components/Admin/Config/TaxasTab";
import WhatsAppTab from "../../../components/Admin/Config/WhatsAppTab";
import ImpressaoTab from "../../../components/Admin/Config/ImpressaoTab";
import HorariosTab from "../../../components/Admin/Config/HorariosTab";
import FinanceiroTab from "../../../components/Admin/Config/FinanceiroTab";
import WhatsAppQrModal from "../../../components/Admin/Config/WhatsAppQrModal";
import { connectInstance } from "../../../functions/instanceConnect";
import { toast } from "react-toastify";
import axios from "axios";

type ActiveTab = 'restaurante' | 'taxas' | 'whatsapp' | 'impressao' | 'aparencia' | 'horarios' | 'financeiro';
type SyncStatus = 'synced' | 'saving' | 'error' | 'idle';

const UNREAD_ORDERS_KEY = 'gs-sabores-unread-orders';

export default function Config({ isDarkMode, toggleTheme }: { isDarkMode: boolean; toggleTheme: () => void }) {
    const [configData, setConfigData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('restaurante');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    
    // States para Componentes Modulares
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
    const [isConnectingWhatsapp, setIsConnectingWhatsapp] = useState(false);
    const [availablePrinters, setAvailablePrinters] = useState<string[]>([]);
    const [isSearchingPrinters, setIsSearchingPrinters] = useState(false);

    // --- REF PARA O CARROSSEL DE ABAS ---
    const tabsRef = useRef<HTMLDivElement>(null);
    // ------------------------------------

    const isFirstLoad = useRef(true);
    const debounceTimer = useRef<number | null>(null);

    // --- FUNÇÃO DE SCROLL DO CARROSSEL ---
    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsRef.current) {
            const scrollAmount = 200; // Quantidade de pixels para rolar
            tabsRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };
    // -------------------------------------

    const triggerSave = useCallback(async () => {
        if (isFirstLoad.current || !configData?.id) return;
        setSyncStatus('saving');
        try {
            const taxa = typeof configData.taxaEntrega === 'string' 
                ? parseFloat(configData.taxaEntrega.replace(/\./g, '').replace(',', '.')) 
                : configData.taxaEntrega;

            await updateConfig({ ...configData, taxaEntrega: taxa || 0 });
            setSyncStatus('synced');
            setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } catch (error) { 
            setSyncStatus('error');
            toast.error("Erro ao sincronizar ajustes.");
        }
    }, [configData]);

    useEffect(() => {
        const checkUnread = () => {
          setHasUnread(localStorage.getItem(UNREAD_ORDERS_KEY) === 'true');
        };
        checkUnread();
        window.addEventListener('storage-update', checkUnread);

        const fetchConfig = async () => {
            try {
                const c = await getConfig();
                setConfigData({
                    ...c,
                    taxaEntrega: c.taxaEntrega?.toString().replace('.', ',') || "0,00",
                    tipoChavePix: c.tipoChavePix || 'cnpj',
                    chavePix: c.chavePix || ''
                });
                setTimeout(() => { isFirstLoad.current = false; }, 1000);
            } catch (error) { 
                toast.error("Erro ao carregar configurações.");
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchConfig();
        return () => window.removeEventListener('storage-update', checkUnread);
    }, []);

    useEffect(() => {
        if (isFirstLoad.current) return;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = window.setTimeout(triggerSave, 1500) as any;
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, [configData, triggerSave]);

    const handleChange = (field: string, value: any) => {
        setConfigData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleConnectWhatsapp = async () => {
        if (!configData.evolutionInstanceName) {
            toast.warning("Informe o nome da instância primeiro.");
            return;
        }
        setIsConnectingWhatsapp(true);
        setQrCodeBase64(null);
        setIsQrModalOpen(true);
        
        try {
            const connection = await connectInstance({
                instanceName: configData.evolutionInstanceName,
            });

            if (connection?.base64) {
                setQrCodeBase64(connection.base64);
            } else {
                setIsQrModalOpen(false);
                toast.info("Instância já conectada ou conectada em outro aparelho.");
            }
        } catch (error) {
            setIsQrModalOpen(false);
            toast.error("Erro na comunicação com Evolution API");
        } finally {
            setIsConnectingWhatsapp(false);
        }
    };

    const handleFetchPrinters = async () => {
        if (!configData.urlAgenteImpressao) {
            toast.warning("Informe a URL do agente de impressão.");
            return;
        }
        setIsSearchingPrinters(true);
        try {
            const response = await axios.get(`${configData.urlAgenteImpressao}/printers`, { 
                timeout: 6000,
                headers: { 'ngrok-skip-browser-warning': 'true', 'Accept': 'application/json' }
            });

            if (Array.isArray(response.data)) {
                const printerNames = response.data.map((p: any) => {
                    if (typeof p === 'string') return p;
                    return p.name || p.deviceId || "Impressora desconhecida";
                });
                setAvailablePrinters(printerNames);
                toast.success(`${printerNames.length} impressoras detectadas.`);
            } else {
                toast.error("Resposta do agente em formato inválido.");
            }
        } catch (error) {
            console.error("Erro ao buscar impressoras:", error);
            toast.error("Agente de impressão offline ou URL incorreta.");
        } finally {
            setIsSearchingPrinters(false);
        }
    };

    const inputClasses = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 transition-all dark:text-slate-100 placeholder:text-slate-400";
    const labelClasses = "block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1";
    
    const tabClasses = (tab: ActiveTab) => `flex items-center gap-2 px-6 py-4 text-sm font-black uppercase tracking-widest transition-all border-b-4 shrink-0 cursor-pointer select-none ${
        activeTab === tab 
        ? 'border-orange-500 text-orange-600 dark:text-orange-500' 
        : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
    }`;

    if (isLoading || !configData) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 transition-colors">
                <Loader2 className="animate-spin text-orange-500" size={40} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando Ajustes</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
            <Sidebar 
                isDarkMode={isDarkMode} 
                toggleTheme={toggleTheme} 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
            />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <AdminHeader 
                  title="Configurações do Sistema" 
                  onMenuClick={() => setIsMobileMenuOpen(true)} 
                  hasUnreadNotifications={hasUnread}
                />

                <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                  <div className="max-w-6xl mx-auto">
                      
                      {/* Status Bar */}
                      <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                         <div className="flex items-center gap-2">
                           {syncStatus === 'saving' ? <Loader2 size={14} className="animate-spin text-orange-500" /> : <CloudCheck size={16} className="text-emerald-500" />}
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                               {syncStatus === 'saving' ? 'Salvando Alterações...' : `Configurações salvas às ${lastSaved || '--:--'}`}
                           </span>
                         </div>
                         <div className="text-[9px] font-black uppercase text-slate-400">Ambiente de Produção</div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                          
                          {/* --- ÁREA DAS ABAS (CARROSSEL) --- */}
                          <div className="relative group/tabs">
                              
                              {/* Botão Esquerda */}
                              <button 
                                onClick={() => scrollTabs('left')}
                                className="absolute left-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 text-slate-400 hover:text-orange-500 transition-all opacity-0 group-hover/tabs:opacity-100"
                              >
                                <ChevronLeft size={20} />
                              </button>

                              {/* Container Scrollável */}
                              <div 
                                ref={tabsRef}
                                className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 overflow-x-auto hide-scrollbar scroll-smooth"
                              >
                                  <button onClick={() => setActiveTab('restaurante')} className={tabClasses('restaurante')}><Building2 size={18} /> Empresa</button>
                                  <button onClick={() => setActiveTab('aparencia')} className={tabClasses('aparencia')}><Palette size={18} /> Design</button>
                                  <button onClick={() => setActiveTab('financeiro')} className={tabClasses('financeiro')}><Wallet size={18} /> Financeiro</button>
                                  <button onClick={() => setActiveTab('taxas')} className={tabClasses('taxas')}><Truck size={18} /> Logística</button>
                                  <button onClick={() => setActiveTab('horarios')} className={tabClasses('horarios')}><Clock size={18} /> Horários</button>
                                  <button onClick={() => setActiveTab('whatsapp')} className={tabClasses('whatsapp')}><MessageSquare size={18} /> Mensageria</button>
                                  <button onClick={() => setActiveTab('impressao')} className={tabClasses('impressao')}><Printer size={18} /> PDV</button>
                              </div>

                              {/* Botão Direita */}
                              <button 
                                onClick={() => scrollTabs('right')}
                                className="absolute right-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 text-slate-400 hover:text-orange-500 transition-all opacity-0 group-hover/tabs:opacity-100"
                              >
                                <ChevronRight size={20} />
                              </button>
                          </div>
                          {/* --------------------------------- */}

                          <div className="p-6 sm:p-10 min-h-[500px]">
                              {activeTab === 'restaurante' && <RestauranteTab data={configData} onChange={handleChange} inputClasses={inputClasses} labelClasses={labelClasses} />}
                              
                              {activeTab === 'aparencia' && (
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                                  <AparenciaTab data={configData} onChange={handleChange} inputClasses={inputClasses} />
                                  <div className="xl:col-span-5 hidden sm:flex justify-center"><MobilePreview data={configData} /></div>
                                </div>
                              )}

                              {activeTab === 'financeiro' && <FinanceiroTab data={configData} onChange={handleChange} inputClasses={inputClasses} labelClasses={labelClasses} />}
                              
                              {activeTab === 'taxas' && <TaxasTab data={configData} onChange={handleChange} inputClasses={inputClasses} labelClasses={labelClasses} />}
                              
                              {activeTab === 'horarios' && <HorariosTab data={configData} onChange={handleChange} labelClasses={labelClasses} />}
                              
                              {activeTab === 'whatsapp' && (
                                  <WhatsAppTab 
                                      data={configData} 
                                      onChange={handleChange} 
                                      onConnect={handleConnectWhatsapp} 
                                      isConnecting={isConnectingWhatsapp} 
                                      inputClasses={inputClasses} 
                                      labelClasses={labelClasses} 
                                  />
                              )}

                              {activeTab === 'impressao' && (
                                  <ImpressaoTab 
                                      data={configData} 
                                      onChange={handleChange} 
                                      onFetchPrinters={handleFetchPrinters} 
                                      isSearching={isSearchingPrinters} 
                                      availablePrinters={availablePrinters} 
                                      inputClasses={inputClasses} 
                                      labelClasses={labelClasses} 
                                  />
                              )}
                          </div>
                      </div>
                  </div>
                </div>
            </main>

            <WhatsAppQrModal 
                isOpen={isQrModalOpen} 
                onClose={() => setIsQrModalOpen(false)} 
                qrCodeBase64={qrCodeBase64} 
            />

            {/* Mantive o style caso precise de fallback local */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}