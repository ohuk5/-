import React from 'react';
import { Atom, Flame, Radiation, BookOpen } from 'lucide-react';

interface HeaderProps {
  activeTab: 'atom-builder' | 'states-of-matter' | 'radioactive-decay';
  setActiveTab: (tab: 'atom-builder' | 'states-of-matter' | 'radioactive-decay') => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenGuide }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Atom className="w-5 h-5 animate-spin" style={{ animationDuration: '14s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-bold tracking-tight text-white">
                  محاكي سلوك الذرات وحالات المادة
                </span>
                <span className="text-xs text-cyan-400 font-medium hidden sm:inline">
                  · 118 عنصراً
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                البنية الذرية، الديناميكا الحرارية والضغط والجاذبية، والاضمحلال الإشعاعي
              </p>
            </div>
          </div>

          <button
            onClick={onOpenGuide}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="دليل المفاهيم العلمية"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-center">
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-xs md:text-sm">
            <button
              onClick={() => setActiveTab('atom-builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'atom-builder'
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>بناء الذرة (1-118)</span>
            </button>

            <button
              onClick={() => setActiveTab('states-of-matter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'states-of-matter'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>حالات المادة والحرارة</span>
            </button>

            <button
              onClick={() => setActiveTab('radioactive-decay')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === 'radioactive-decay'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radiation className="w-3.5 h-3.5" />
              <span>عمر النصف والنشاط</span>
            </button>
          </div>

          <button
            onClick={onOpenGuide}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all"
            title="دليل المفاهيم العلمية"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>الدليل العلمي</span>
          </button>
        </div>
      </div>
    </header>
  );
};
