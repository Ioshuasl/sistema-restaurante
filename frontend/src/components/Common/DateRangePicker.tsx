
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ range, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = selectedDate.toISOString().split('T')[0];

    if (!range.start || (range.start && range.end)) {
      onChange({ start: dateStr, end: '' });
    } else {
      if (dateStr < range.start) {
        onChange({ start: dateStr, end: range.start });
      } else {
        onChange({ start: range.start, end: dateStr });
      }
      setIsOpen(false); // Fecha ao completar a seleção
    }
  };

  const isSelected = (dateStr: string) => dateStr === range.start || dateStr === range.end;
  const isInRange = (dateStr: string) => range.start && range.end && dateStr > range.start && dateStr < range.end;

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = startOfMonth(year, month);
    const days = [];

    // Células vazias para o início do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Dias do mês
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      const selected = isSelected(dateStr);
      const between = isInRange(dateStr);

      days.push(
        <button
          key={d}
          type="button"
          onClick={() => handleDateClick(d)}
          className={`h-10 w-10 rounded-xl text-xs font-bold transition-all relative flex items-center justify-center
            ${selected ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 z-10' : ''}
            ${between ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
          `}
        >
          {d}
          {selected && (range.start === range.end || !range.end) && (
             <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></span>
          )}
        </button>
      );
    }

    return days;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">{label}</label>}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-12 pr-4 cursor-pointer flex items-center justify-between group transition-all hover:ring-4 hover:ring-orange-500/5"
      >
        <CalendarIcon className={`absolute left-4 text-slate-400 transition-colors ${isOpen ? 'text-orange-500' : ''}`} size={18} />
        
        <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
          {range.start ? (
            <span>
              {formatDisplayDate(range.start)} 
              {range.end ? ` — ${formatDisplayDate(range.end)}` : ' — Selecione o fim'}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-600">Selecione o período</span>
          )}
        </div>

        {range.start && (
          <button 
            onClick={(e) => { e.stopPropagation(); onChange({ start: '', end: '' }); }}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-200 w-[320px]">
          <div className="flex items-center justify-between mb-4">
            <button 
              type="button" 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button 
              type="button" 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
              <div key={d} className="h-8 flex items-center justify-center text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <button 
              type="button" 
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                onChange({ start: today, end: today });
                setIsOpen(false);
              }}
              className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline"
            >
              Hoje
            </button>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
