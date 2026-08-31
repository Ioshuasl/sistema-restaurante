
import React, { useState } from 'react';
import { Building2, Phone, Mail, MapPin, Search, Loader2 } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import axios from 'axios';
import { toast } from 'react-toastify';

interface RestauranteTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  inputClasses: string;
  labelClasses: string;
}

export default function RestauranteTab({ data, onChange, inputClasses, labelClasses }: RestauranteTabProps) {
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);

  const handleBuscarCNPJ = async () => {
    const cleanCnpj = data.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      toast.warning("Digite um CNPJ válido para buscar.");
      return;
    }
    setIsSearchingCnpj(true);
    try {
      const res = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      const d = res.data;
      onChange('razaoSocial', d.razao_social || "");
      onChange('nomeFantasia', d.nome_fantasia || d.razao_social || "");
      onChange('cep', d.cep || "");
      onChange('logadouro', d.logradouro || "");
      onChange('numero', d.numero || "");
      onChange('bairro', d.bairro || "");
      onChange('cidade', d.municipio || "");
      onChange('estado', d.uf || "");
      toast.success("Dados da empresa importados!");
    } catch (e) {
      toast.error("CNPJ não encontrado.");
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  const handleBuscarCEP = async () => {
    const cleanCep = data.cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setIsSearchingCep(true);
    try {
      const res = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (res.data.erro) { toast.error("CEP não encontrado"); return; }
      onChange('logadouro', res.data.logradouro || "");
      onChange('bairro', res.data.bairro || "");
      onChange('cidade', res.data.localidade || "");
      onChange('estado', res.data.uf || "");
    } catch (e) {
      toast.error("Erro ao buscar CEP");
    } finally {
      setIsSearchingCep(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Building2 size={14} /> Identificação Jurídica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 flex gap-2 items-end">
            <div className="flex-1">
              <label className={labelClasses}>CNPJ</label>
              <IMaskInput 
                mask="00.000.000/0000-00" 
                className={inputClasses} 
                value={data.cnpj} 
                onAccept={(v) => onChange('cnpj', v)} 
                placeholder="00.000.000/0000-00" 
              />
            </div>
            <button onClick={handleBuscarCNPJ} disabled={isSearchingCnpj} className="bg-slate-800 text-white p-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center shrink-0">
              {isSearchingCnpj ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </div>
          <div className="md:col-span-8">
            <label className={labelClasses}>Razão Social</label>
            <input className={inputClasses} value={data.razaoSocial} onChange={e => onChange('razaoSocial', e.target.value)} placeholder="Nome registrado" />
          </div>
          <div className="md:col-span-12">
            <label className={labelClasses}>Nome Fantasia (No Cardápio)</label>
            <input className={inputClasses} value={data.nomeFantasia} onChange={e => onChange('nomeFantasia', e.target.value)} placeholder="Ex: GS Sabores" />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Phone size={14} /> Contato
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>WhatsApp</label>
            <IMaskInput mask="(00) 00000-0000" className={inputClasses} value={data.telefone} onAccept={(v) => onChange('telefone', v)} placeholder="(00) 00000-0000" />
          </div>
          <div>
            <label className={labelClasses}>E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" className={`${inputClasses} pl-12`} value={data.email} onChange={e => onChange('email', e.target.value)} placeholder="contato@empresa.com" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <MapPin size={14} /> Endereço
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 flex gap-2 items-end">
            <div className="flex-1">
              <label className={labelClasses}>CEP</label>
              <IMaskInput mask="00000-000" className={inputClasses} value={data.cep} onAccept={(v) => onChange('cep', v)} placeholder="00000-000" />
            </div>
            <button onClick={handleBuscarCEP} disabled={isSearchingCep} className="bg-slate-800 text-white p-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center shrink-0">
              {isSearchingCep ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </div>
          <div className="md:col-span-8">
            <label className={labelClasses}>Rua/Av</label>
            <input className={inputClasses} value={data.logadouro} onChange={e => onChange('logadouro', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClasses}>Nº</label>
            <input className={inputClasses} value={data.numero} onChange={e => onChange('numero', e.target.value)} />
          </div>
          <div className="md:col-span-5">
            <label className={labelClasses}>Bairro</label>
            <input className={inputClasses} value={data.bairro} onChange={e => onChange('bairro', e.target.value)} />
          </div>
          <div className="md:col-span-5">
            <label className={labelClasses}>Cidade</label>
            <input className={inputClasses} value={data.cidade} onChange={e => onChange('cidade', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClasses}>UF</label>
            <input className={inputClasses} maxLength={2} value={data.estado} onChange={e => onChange('estado', e.target.value.toUpperCase())} />
          </div>
        </div>
      </section>
    </div>
  );
}
