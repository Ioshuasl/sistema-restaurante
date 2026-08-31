
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { getConfig } from '../../../services/configService';

const PedidoConfirmado: React.FC = () => {
    // Fix: Use 'react-router' instead of 'react-router-dom' to resolve missing export member error
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');

    useEffect(() => {
        getConfig().then(cfg => {
            if (cfg?.telefone) setPhone(cfg.telefone.replace(/\D/g, ''));
        });
    }, []);

    const handleWhatsAppRedirect = () => {
        const message = encodeURIComponent(`Olá! Gostaria de informações sobre o meu pedido que acabei de realizar pelo cardápio digital.`);
        window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center transition-colors duration-300">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-8 animate-bounce">
                <CheckCircle2 size={48} />
            </div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">Pedido Recebido!</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm font-medium leading-relaxed">
                Seu pedido já foi enviado para a nossa cozinha e em breve estará pronto.
            </p>
            
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button 
                    onClick={handleWhatsAppRedirect}
                    className="bg-green-500 text-white w-full py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-green-100 dark:shadow-none flex items-center justify-center gap-3 active:scale-95"
                >
                    <MessageCircle size={22} />
                    Falar no WhatsApp
                </button>

                <button 
                    onClick={() => navigate('/')} 
                    className="bg-slate-800 dark:bg-slate-700 text-white w-full py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-black dark:hover:bg-slate-600 transition shadow-xl shadow-slate-200 dark:shadow-none active:scale-95"
                >
                    Voltar ao Início
                </button>
            </div>
        </div>
    );
};

export default PedidoConfirmado;