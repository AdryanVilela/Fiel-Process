import React from 'react';
import { LayoutDashboard, FilePlus2, Search, CircleUser } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  onSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onChangeView, onSearch }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer flex-shrink-0 group"
          onClick={() => onChangeView('dashboard')}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-brand-700 rounded-xl flex items-center justify-center text-white font-bold shadow-brand-500/20 shadow-lg group-hover:scale-105 transition-transform">
            PF
          </div>
          <span className="font-bold text-lg text-slate-800 hidden md:block tracking-tight">ProcessFlow</span>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md relative group">
          <input
            type="text"
            placeholder="Buscar processos..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all group-hover:border-slate-300"
            onChange={(e) => onSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-400 group-hover:text-brand-500 transition-colors" size={18} />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => onChangeView('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentView === 'dashboard' ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium hidden md:block">Dashboard</span>
          </button>
          
          <button 
            onClick={() => onChangeView('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentView === 'editor' ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <FilePlus2 size={18} />
            <span className="text-sm font-medium hidden md:block">Novo</span>
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block"></div>

          <button className="p-2 rounded-full text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <CircleUser size={24} />
          </button>
        </nav>
      </div>
      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3 border-b border-slate-100 bg-white">
         <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            onChange={(e) => onSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>
    </header>
  );
};