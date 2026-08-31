
import React from 'react';
import { Palette, Shapes, Type, Layout, ImageIcon, LayoutGrid, StretchHorizontal, Square, CircleDot } from 'lucide-react';

interface AparenciaTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  inputClasses: string;
}

export default function AparenciaTab({ data, onChange, inputClasses }: AparenciaTabProps) {
  return (
    <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Palette size={14} /> Cor de Destaque</h3>
        <div className="flex flex-wrap gap-3">
          {['#dc2626', '#16a34a', '#2563eb', '#ea580c', '#9333ea', '#111827'].map(color => (
            <button 
              key={color} 
              onClick={() => onChange('primaryColor', color)}
              className={`w-12 h-12 rounded-2xl border-4 transition-all ${data.primaryColor === color ? 'border-orange-500 scale-110 shadow-lg' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input type="color" value={data.primaryColor} onChange={e => onChange('primaryColor', e.target.value)} className="w-12 h-12 rounded-2xl cursor-pointer border-none bg-transparent" />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Shapes size={14} /> Arredondamento</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { id: '0px', name: 'Quadrado', icon: Square },
            { id: '8px', name: 'Leve', icon: CircleDot },
            { id: '16px', name: 'Curvo', icon: Shapes },
            { id: '9999px', name: 'Pill', icon: CircleDot }
          ].map(style => (
            <button 
              key={style.id} 
              onClick={() => onChange('borderRadius', style.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${data.borderRadius === style.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
            >
              <style.icon size={20} />
              <span className="text-[10px] font-black uppercase">{style.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Type size={14} /> Tipografia</h3>
        <select className={inputClasses} value={data.fontFamily} onChange={e => onChange('fontFamily', e.target.value)}>
          <option value="sans">Sans Serif (Moderna)</option>
          <option value="serif">Serif (Elegante)</option>
          <option value="mono">Monospace (Técnica)</option>
          <option value="poppins">Poppins (Pop)</option>
        </select>
      </section>

      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Layout size={14} /> Estrutura do Menu</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'modern', name: 'Modern', icon: LayoutGrid },
            { id: 'compact', name: 'Compact', icon: StretchHorizontal },
            { id: 'minimalist', name: 'Minimal', icon: Type }
          ].map(l => (
            <button 
              key={l.id} 
              onClick={() => onChange('menuLayout', l.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${data.menuLayout === l.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
            >
              <l.icon size={20} />
              <span className="text-[10px] font-black uppercase">{l.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} /> Banner Promocional</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.showBanner} onChange={e => onChange('showBanner', e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-orange-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>
        {data.showBanner && (
          <input className={inputClasses} value={data.bannerImage} onChange={e => onChange('bannerImage', e.target.value)} placeholder="URL da imagem do banner..." />
        )}
      </section>
    </div>
  );
}
