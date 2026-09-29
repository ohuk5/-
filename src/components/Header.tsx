import React from 'react';
import { Atom, Flame, Radiation, BookOpen, FlaskConical, Sun, Moon, Globe2 } from 'lucide-react';
import { useApp, ActiveTabType } from '../context/AppContext';

interface HeaderProps {
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide }) => {
  const { lang, toggleLang, theme, toggleTheme, t, activeTab, setActiveTab } = useApp();
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 sm:px-4 py-3 transition-colors ${
      isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
              <Atom className="w-5 h-5 animate-spin" style={{ animationDuration: '14s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('محاكي الذرات وحالات المادة', 'Atomic & Matter Simulator')}
                </span>
                <span className="text-[11px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 hidden sm:inline">
                  {t('118 عنصراً + معمل تجارب', '118 Elements + Lab')}
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t(
                  'البنية الذرية، الديناميكا الحرارية والضغط والجاذبية، والاضمحلال الإشعاعي',
                  'Atomic Structure, Thermodynamics, Pressure & Gravity, and Radioactive Decay'
                )}
              </p>
            </div>
          </div>

          {/* Quick mobile controls */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title={t('تبديل الوضع الليلي / النهاري', 'Toggle Light/Dark Theme')}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleLang}
              className={`px-2 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                isDark ? 'bg-slate-900 border-slate-800 text-cyan-400' : 'bg-slate-100 border-slate-200 text-cyan-600'
              }`}
              title={t('تبديل اللغة', 'Toggle Language')}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              onClick={onOpenGuide}
              className={`p-2 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title={t('الدليل العلمي', 'Scientific Guide')}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Responsive & Touch-Optimized) */}
        <div className="w-full lg:w-auto flex items-center justify-center">
          <nav
            aria-label="App Navigation"
            className={`w-full sm:w-auto grid grid-cols-4 sm:flex items-center gap-1 p-1 rounded-2xl border ${
              isDark ? 'bg-slate-900/95 border-slate-800 shadow-inner shadow-black/40' : 'bg-slate-100/90 border-slate-200 shadow-inner'
            }`}
          >
            <button
              onClick={() => setActiveTab('atom-builder')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] sm:text-xs md:text-sm ${
                activeTab === 'atom-builder'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Atom className="w-4 h-4 shrink-0" />
              <span className="truncate">
                <span className="inline sm:hidden">{t('الذرات', 'Atoms')}</span>
                <span className="hidden sm:inline">{t('بناء الذرة (1-118)', 'Atom Builder (1-118)')}</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('states-of-matter')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] sm:text-xs md:text-sm ${
                activeTab === 'states-of-matter'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-4 h-4 shrink-0" />
              <span className="truncate">
                <span className="inline sm:hidden">{t('الحالات', 'States')}</span>
                <span className="hidden sm:inline">{t('حالات المادة والحرارة', 'States of Matter')}</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('radioactive-decay')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] sm:text-xs md:text-sm ${
                activeTab === 'radioactive-decay'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radiation className="w-4 h-4 shrink-0" />
              <span className="truncate">
                <span className="inline sm:hidden">{t('النشاط', 'Decay')}</span>
                <span className="hidden sm:inline">{t('عمر النصف والنشاط', 'Radioactive Decay')}</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('experiments-lab')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] sm:text-xs md:text-sm ${
                activeTab === 'experiments-lab'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/50'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FlaskConical className="w-4 h-4 shrink-0 text-indigo-400" />
              <span className="truncate">
                <span className="inline sm:hidden">{t('المعمل', 'Lab')}</span>
                <span className="hidden sm:inline">{t('معمل التجارب 🔬', 'Experimental Lab 🔬')}</span>
              </span>
            </button>
          </nav>

          {/* Desktop Controls: Theme, Language, Guide */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400 hover:text-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title={t('تبديل الوضع الليلي / النهاري', 'Toggle Light/Dark Theme')}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={toggleLang}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-cyan-700'
              }`}
              title={t('تبديل اللغة (العربية / English)', 'Toggle Language (Arabic / English)')}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Guide Button */}
            <button
              onClick={onOpenGuide}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title={t('الدليل العلمي والمفاهيم', 'Scientific Conceptual Guide')}
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('الدليل العلمي', 'Science Guide')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
