import React, { useEffect, useRef } from 'react';
import { Atom, Flame, Radiation, BookOpen, FlaskConical, Sun, Moon, Globe2, Volume2, VolumeX, Sparkles, Network, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp, ActiveTabType, ApparatusStationType } from '../context/AppContext';

interface HeaderProps {
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide }) => {
  const {
    lang,
    toggleLang,
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    t,
    activeTab,
    setActiveTab,
    activeApparatusStation,
    setActiveApparatusStation
  } = useApp();
  const isDark = theme === 'dark';

  const navRef = useRef<HTMLDivElement>(null);
  const isNavDragging = useRef<boolean>(false);
  const startX = useRef<number>(0);
  const scrollLeftVal = useRef<number>(0);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = 240;
      navRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleNavMouseDown = (e: React.MouseEvent) => {
    if (!navRef.current) return;
    isNavDragging.current = true;
    startX.current = e.pageX - navRef.current.offsetLeft;
    scrollLeftVal.current = navRef.current.scrollLeft;
  };

  const handleNavMouseMove = (e: React.MouseEvent) => {
    if (!isNavDragging.current || !navRef.current) return;
    e.preventDefault();
    const x = e.pageX - navRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    navRef.current.scrollLeft = scrollLeftVal.current - walk;
  };

  const handleNavMouseUp = () => {
    isNavDragging.current = false;
  };

  // Global Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === '1') {
        setActiveTab('atom-builder');
      } else if (e.key === '2') {
        setActiveTab('molecule-builder');
      } else if (e.key === '3') {
        setActiveTab('states-of-matter');
      } else if (e.key === '4') {
        setActiveTab('radioactive-decay');
      } else if (e.key === '5') {
        setActiveTab('experiments-lab');
      } else if (e.key === 't' || e.key === 'T') {
        toggleTheme();
      } else if (e.key === 'l' || e.key === 'L') {
        toggleLang();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleSound();
      } else if (e.key === '?' || e.key === 'g' || e.key === 'G') {
        onOpenGuide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, toggleTheme, toggleLang, toggleSound, onOpenGuide]);

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
      id: 'molecule-builder',
      num: '02',
      labelAr: 'تكوين المركبات',
      labelEn: 'Molecule Builder',
      shortAr: 'المركبات',
      shortEn: 'Molecules',
      icon: <Network className="w-4 h-4 shrink-0" />
    },
    {
      id: 'states-of-matter',
      num: '03',
      labelAr: 'حالات المادة والديناميكا',
      labelEn: 'States of Matter',
      shortAr: 'الحالات',
      shortEn: 'States',
      icon: <Flame className="w-4 h-4 shrink-0" />
    },
    {
      id: 'radioactive-decay',
      num: '04',
      labelAr: 'النشاط الإشعاعي وعمر النصف',
      labelEn: 'Radioactive Decay',
      shortAr: 'الإشعاع',
      shortEn: 'Decay',
      icon: <Radiation className="w-4 h-4 shrink-0" />
    },
    {
      id: 'experiments-lab',
      num: '05',
      labelAr: 'معمل التجارب التفاعلي',
      labelEn: 'Experimental Lab',
      shortAr: 'المعمل',
      shortEn: 'Lab',
      icon: <FlaskConical className="w-4 h-4 shrink-0" />
    }
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full max-w-full backdrop-blur-md border-b px-4 sm:px-8 py-3.5 transition-colors ${
        isDark ? 'bg-slate-950/95 border-slate-800/90 shadow-md' : 'bg-white/95 border-slate-200/90 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-3.5">
        {/* Zone 1: Brand Wordmark + Mobile Actions */}
        <div className="flex items-center justify-between w-full xl:w-auto gap-4 min-w-0">
          <button
            type="button"
            onClick={() => setActiveTab('atom-builder')}
            className="flex items-center gap-3 min-w-0 text-start group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 flex items-center justify-center text-white shadow-md shrink-0 group-hover:bg-cyan-500 transition-colors">
              <Atom className="w-5 h-5" />
            </div>
            <span className={`text-base sm:text-lg font-black tracking-tight truncate whitespace-nowrap ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {t('مختبر الفيزياء والكيمياء التفاعلي', 'Interactive Physics & Chemistry Lab')}
            </span>
          </button>

          {/* Mobile & Tablet Utility Actions */}
          <div className="flex items-center gap-2 xl:hidden shrink-0">
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border transition-colors ${
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
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title={t('تبديل المظهر', 'Toggle Theme')}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={toggleLang}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 whitespace-nowrap ${
                isDark ? 'bg-slate-900 border-slate-800 text-cyan-400' : 'bg-slate-100 border-slate-200 text-cyan-700'
              }`}
              title={t('تبديل اللغة', 'Switch Language')}
            >
              <Globe2 className="w-4 h-4" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenGuide}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark ? 'bg-cyan-950/60 border-cyan-800/60 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-700'
              }`}
              title={t('الموسوعة والدليل العلمي', 'Scientific Guide')}
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Zone 2: Unified Scientific Module Navigation with Chevrons and Pan */}
        <div className="relative flex items-center w-full xl:w-auto max-w-full">
          <button
            type="button"
            onClick={() => scrollNav('right')}
            className={`p-1.5 rounded-xl border shrink-0 me-1 flex items-center justify-center transition-all ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
            title={t('تمرير يميناً', 'Scroll Right')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <nav
            ref={navRef}
            onMouseDown={handleNavMouseDown}
            onMouseMove={handleNavMouseMove}
            onMouseUp={handleNavMouseUp}
            onMouseLeave={handleNavMouseUp}
            aria-label="Primary Simulation Modules"
            className={`w-full xl:w-auto flex items-center justify-start xl:justify-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing select-none ${
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
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-xl font-bold transition-all text-xs sm:text-sm whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-cyan-400'}>{item.icon}</span>
                  <span>
                    <span className={`font-mono text-xs me-1 ${isActive ? 'text-cyan-100' : 'text-slate-400'}`}>
                      {item.num}.
                    </span>
                    <span className="hidden sm:inline">{t(item.labelAr, item.labelEn)}</span>
                    <span className="sm:hidden inline">{t(item.shortAr, item.shortEn)}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => scrollNav('left')}
            className={`p-1.5 rounded-xl border shrink-0 ms-1 flex items-center justify-center transition-all ${
              isDark
                ? 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
            title={t('تمرير يساراً', 'Scroll Left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Zone 3: Desktop Global Utility Actions */}
        <div className="hidden xl:flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleSound}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              soundEnabled
                ? isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-cyan-700'
                : isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500'
            }`}
            title={soundEnabled ? t('كتم الصوت', 'Mute Audio') : t('تشغيل الصوت', 'Unmute Audio')}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? t('الصوت مفعل', 'Audio On') : t('صامت', 'Muted')}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all ${
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
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title={t('تبديل اللغة', 'Switch Language')}
          >
            <Globe2 className="w-4 h-4 text-cyan-500" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('الدليل العلمي', 'Science Guide')}</span>
          </button>
        </div>
      </div>

      {/* Quick Apparatus Suite Sub-Bar when Experimental Lab is active */}
      {activeTab === 'experiments-lab' && (
        <div className={`mt-2 pt-2 border-t max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-0.5 ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-cyan-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('محطات وأجهزة المعمل:', 'Lab Apparatus Stations:')}</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {[
              { id: 'main_workbench', labelAr: 'كأس التفاعلات والدليل', labelEn: 'Reaction Beaker', icon: '🧪' },
              { id: 'burette_titration', labelAr: 'السحاحة ومعايرة pH', labelEn: 'Burette & pH', icon: '🎯' },
              { id: 'pneumatic_gas', labelAr: 'حوض إزاحة الغاز', labelEn: 'Gas Trough', icon: '🌊' },
              { id: 'digital_scale', labelAr: 'الميزان الرقمي 0.01g', labelEn: 'Analytical Balance', icon: '⚖️' },
              { id: 'cylinder_pipette', labelAr: 'المخبار والماصة', labelEn: 'Cylinder & Pipette', icon: '💧' },
              { id: 'test_tube_rack', labelAr: 'حامل الأنابيب (4)', labelEn: 'Test Tube Rack', icon: '🧪' },
              { id: 'spectrometer_discharge', labelAr: 'مطياف الانبعاث والتفريغ', labelEn: 'Spectrometer & Discharge', icon: '🌈' }
            ].map((appItem) => {
              const isSelected = activeApparatusStation === appItem.id;
              return (
                <button
                  key={appItem.id}
                  type="button"
                  onClick={() => setActiveApparatusStation(appItem.id as ApparatusStationType)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 border ${
                    isSelected
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-900 border-slate-800/90 text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{appItem.icon}</span>
                  <span>{t(appItem.labelAr, appItem.labelEn)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
