import React from 'react';
import { Atom, Flame, Radiation, BookOpen, FlaskConical, Sun, Moon, Globe2, Volume2, VolumeX } from 'lucide-react';
import { useApp, ActiveTabType } from '../context/AppContext';

interface HeaderProps {
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide }) => {
  const { lang, toggleLang, theme, toggleTheme, soundEnabled, toggleSound, t, activeTab, setActiveTab } = useApp();
  const isDark = theme === 'dark';

  const navItems: { id: ActiveTabType; num: string; labelAr: string; labelEn: string; shortAr: string; shortEn: string; icon: React.ReactNode }[] = [
    {
      id: 'atom-builder',
      num: '01',
      labelAr: 'بناء الذرة (1-118)',
      labelEn: 'Atom Builder (1-118)',
      shortAr: 'الذرات',
      shortEn: 'Atoms',
      icon: <Atom className="w-4 h-4 shrink-0" />
    },
    {
      id: 'states-of-matter',
      num: '02',
      labelAr: 'حالات المادة والديناميكا',
      labelEn: 'States of Matter',
      shortAr: 'الحالات',
      shortEn: 'States',
      icon: <Flame className="w-4 h-4 shrink-0" />
    },
    {
      id: 'radioactive-decay',
      num: '03',
      labelAr: 'النشاط الإشعاعي وعمر النصف',
      labelEn: 'Radioactive Decay',
      shortAr: 'الإشعاع',
      shortEn: 'Decay',
      icon: <Radiation className="w-4 h-4 shrink-0" />
    },
    {
      id: 'experiments-lab',
      num: '04',
      labelAr: 'معمل التجارب التفاعلي',
      labelEn: 'Experimental Lab',
      shortAr: 'المعمل',
      shortEn: 'Lab',
      icon: <FlaskConical className="w-4 h-4 shrink-0" />
    }
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full max-w-full backdrop-blur-md border-b px-3 sm:px-6 py-2.5 transition-colors ${
        isDark ? 'bg-slate-950/95 border-slate-800/90' : 'bg-white/95 border-slate-200 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-2.5">
        {/* Zone 1: Brand Wordmark + Mobile Actions */}
        <div className="flex items-center justify-between w-full xl:w-auto gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setActiveTab('states-of-matter')}
            className="flex items-center gap-2.5 min-w-0 text-start group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-xs shrink-0 group-hover:bg-cyan-500 transition-colors">
              <Atom className="w-5 h-5" />
            </div>
            <span className={`text-sm sm:text-base font-extrabold tracking-tight truncate whitespace-nowrap ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {t('مختبر الفيزياء والكيمياء التفاعلي', 'Interactive Physics & Chemistry Lab')}
            </span>
          </button>

          {/* Mobile & Tablet Utility Actions */}
          <div className="flex items-center gap-1.5 xl:hidden shrink-0">
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled
                  ? isDark ? 'bg-slate-900 border-slate-800 text-cyan-400' : 'bg-slate-100 border-slate-200 text-cyan-700'
                  : isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
              title={soundEnabled ? t('كتم المؤثرات الصوتية', 'Mute Sound Effects') : t('تشغيل المؤثرات الصوتية', 'Enable Sound Effects')}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title={t('تبديل المظهر', 'Toggle Theme')}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={toggleLang}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 whitespace-nowrap ${
                isDark ? 'bg-slate-900 border-slate-800 text-cyan-400' : 'bg-slate-100 border-slate-200 text-cyan-700'
              }`}
              title={t('تبديل اللغة', 'Switch Language')}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenGuide}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'bg-cyan-950/60 border-cyan-800/60 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-700'
              }`}
              title={t('الموسوعة والدليل العلمي', 'Scientific Guide')}
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Zone 2: Unified Scientific Module Navigation */}
        <nav
          aria-label="Primary Simulation Modules"
          className={`w-full xl:w-auto grid grid-cols-4 sm:flex items-center justify-center gap-1 p-1 rounded-xl border ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200/90'
          }`}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 rounded-lg font-bold transition-all text-[11px] sm:text-xs min-w-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-cyan-500'}>{item.icon}</span>
                <span className="truncate">
                  <span className="inline sm:hidden">{t(item.shortAr, item.shortEn)}</span>
                  <span className="hidden sm:inline">
                    <span className={`font-mono text-[10px] me-1 ${isActive ? 'text-cyan-100' : 'text-slate-500'}`}>
                      {item.num}.
                    </span>
                    {t(item.labelAr, item.labelEn)}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Desktop Global Utility Actions */}
        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleSound}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              soundEnabled
                ? isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-cyan-700'
                : isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-500'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-400'
            }`}
            title={soundEnabled ? t('كتم الصوت', 'Mute Audio') : t('تشغيل الصوت', 'Unmute Audio')}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? t('الصوت مفعل', 'Audio On') : t('صامت', 'Muted')}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title={t('تبديل الوضع الليلي / النهاري', 'Toggle Dark/Light Theme')}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleLang}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title={t('تبديل اللغة', 'Switch Language')}
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-500" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-xs whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('الدليل العلمي', 'Science Guide')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
