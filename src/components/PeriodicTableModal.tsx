import React, { useState, useMemo } from 'react';
import { X, Search, Filter, Sparkles, Check } from 'lucide-react';
import { ALL_ELEMENTS, ElementInfo, CATEGORY_COLORS } from '../data/elementsData';
import { useApp } from '../context/AppContext';

interface PeriodicTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectElement: (element: ElementInfo) => void;
  currentAtomicNumber: number;
}

// Standard periodic table grid layout mapping (Row 1-7, Col 1-18)
// 0 represents empty spacer
export const PERIODIC_GRID_MAIN: (number)[][] = [
  // Period 1
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  // Period 2
  [3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 7, 8, 9, 10],
  // Period 3
  [11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 14, 15, 16, 17, 18],
  // Period 4
  [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
  // Period 5
  [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
  // Period 6 (57-71 are lanthanides)
  [55, 56, -1, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
  // Period 7 (89-103 are actinides)
  [87, 88, -2, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118]
];

// Lanthanides 57-71
export const LANTHANIDES = [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];
// Actinides 89-103
export const ACTINIDES = [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103];

export const PeriodicTableModal: React.FC<PeriodicTableModalProps> = ({
  isOpen,
  onClose,
  onSelectElement,
  currentAtomicNumber
}) => {
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredElement, setHoveredElement] = useState<ElementInfo | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const elementsMap = useMemo(() => {
    const map = new Map<number, ElementInfo>();
    ALL_ELEMENTS.forEach(el => map.set(el.atomicNumber, el));
    return map;
  }, []);

  const filteredElements = useMemo(() => {
    return ALL_ELEMENTS.filter(el => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        el.name.includes(searchQuery.trim()) ||
        el.englishName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        el.symbol.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        el.atomicNumber.toString() === searchQuery.trim();

      const matchesCat =
        selectedCategory === 'all' || el.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`border rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden my-auto ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Header Bar */}
        <div className={`p-4 border-b flex items-center justify-between gap-3 ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <h2 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>{t('الجدول الدوري الشامل للعناصر الكيميائية', 'Comprehensive Periodic Table of Elements')}</span>
              <span className="text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                118 {t('عنصراً', 'Elements')}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t(
                'انقر على أي عنصر لتحميل مكوناته (بروتونات، نيوترونات، إلكترونات) في محاكي الذرة',
                'Click any element to load its subatomic structure into the Atom Builder simulator'
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('ابحث بالاسم العربي، الإنجليزي، الرمز أو العدد الذري...', 'Search by Arabic, English name, symbol, or atomic number...')}
              className={`w-full border rounded-xl pr-9 pl-3 py-2 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills & View Mode */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 text-xs">
            {/* View Mode Toggle (Table / Cards for Mobile) */}
            <div className="flex items-center rounded-xl border border-slate-700/60 p-0.5 text-xs font-bold shrink-0 bg-slate-900/60 mr-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t('جدول دوري (18 مجموعة)', 'Periodic Table Grid')}
              >
                <span>⊞</span>
                <span className="text-[11px]">{t('جدول', 'Table')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'cards'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t('بطاقات عناصر للموبايل', 'Responsive Cards View')}
              >
                <span>▦</span>
                <span className="text-[11px]">{t('بطاقات', 'Cards')}</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : isDark ? 'bg-slate-800/80 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {t('الكل (118)', 'All (118)')}
            </button>
            {Object.entries(CATEGORY_COLORS).map(([catKey, val]) => (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-all shrink-0 ${val.border} ${
                  selectedCategory === catKey
                    ? `${val.bg} ${val.text} ring-1 ring-white/20 font-bold`
                    : isDark ? 'bg-slate-900/50 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {t(val.badge, catKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Periodic Grid Container */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 space-y-4">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {filteredElements.map((el) => {
                const isSelected = el.atomicNumber === currentAtomicNumber;
                const colors = CATEGORY_COLORS[el.category] || CATEGORY_COLORS['nonmetal'];
                return (
                  <button
                    key={el.atomicNumber}
                    onClick={() => {
                      onSelectElement(el);
                      onClose();
                    }}
                    onMouseEnter={() => setHoveredElement(el)}
                    onMouseLeave={() => setHoveredElement(null)}
                    className={`p-3 rounded-xl border flex flex-col justify-between text-start transition-all active:scale-95 ${
                      colors.border
                    } ${isSelected ? 'ring-2 ring-cyan-400 shadow-md scale-[1.02]' : ''} ${
                      colors.bg
                    } hover:shadow-lg`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs font-bold text-slate-400">#{el.atomicNumber}</span>
                      {el.isRadioactive && <span className="text-amber-400 text-xs" title="عنصر مشع">☢</span>}
                    </div>
                    <div className="my-1.5 flex items-baseline gap-2">
                      <span className="text-xl font-black text-white">{el.symbol}</span>
                      <span className="text-xs font-bold text-slate-200 truncate">{t(el.name, el.englishName)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-700/40">
                      <span>{el.atomicMass.toFixed(1)} u</span>
                      <span className="truncate max-w-[80px]">{t(CATEGORY_COLORS[el.category]?.badge || '', el.category)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              {/* Mobile Swipe Hint */}
              <div className="sm:hidden text-center py-1.5 px-3 bg-cyan-950/60 border border-cyan-800/40 rounded-xl text-[11px] text-cyan-300 font-medium flex items-center justify-between">
                <span>👉</span>
                <span>{t('اسحب أفقياً لتصفح الجدول أو حوّل لـ (بطاقات ▦)', 'Swipe table or toggle (Cards ▦)')}</span>
                <span>👈</span>
              </div>

              {/* Main 7 Periods Grid */}
              <div className="min-w-[860px]">
            <div className="grid grid-cols-18 gap-1.5 text-center" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
              {PERIODIC_GRID_MAIN.map((row, rIdx) =>
                row.map((zNum, cIdx) => {
                  if (zNum === 0) {
                    return <div key={`spacer-${rIdx}-${cIdx}`} className="aspect-square" />;
                  }

                  if (zNum === -1) {
                    return (
                      <div
                        key="lanthanide-spacer"
                        className="aspect-square rounded-lg border border-dashed border-purple-500/40 bg-purple-950/20 flex flex-col items-center justify-center text-[9px] text-purple-300 p-0.5"
                      >
                        <span>57-71</span>
                        <span className="text-[8px] text-slate-400">لانثانيدات</span>
                      </div>
                    );
                  }

                  if (zNum === -2) {
                    return (
                      <div
                        key="actinide-spacer"
                        className="aspect-square rounded-lg border border-dashed border-fuchsia-500/40 bg-fuchsia-950/20 flex flex-col items-center justify-center text-[9px] text-fuchsia-300 p-0.5"
                      >
                        <span>89-103</span>
                        <span className="text-[8px] text-slate-400">أكتينيدات</span>
                      </div>
                    );
                  }

                  const el = elementsMap.get(zNum);
                  if (!el) return null;

                  const isSelected = el.atomicNumber === currentAtomicNumber;
                  const isMatch = filteredElements.some(f => f.atomicNumber === el.atomicNumber);
                  const colors = CATEGORY_COLORS[el.category] || CATEGORY_COLORS['nonmetal'];

                  return (
                    <button
                      key={el.atomicNumber}
                      onClick={() => {
                        onSelectElement(el);
                        onClose();
                      }}
                      onMouseEnter={() => setHoveredElement(el)}
                      onMouseLeave={() => setHoveredElement(null)}
                      className={`relative aspect-square rounded-lg border p-1 flex flex-col items-center justify-between transition-all duration-200 group text-right ${
                        colors.border
                      } ${isSelected ? 'ring-2 ring-cyan-400 shadow-md scale-105 z-10' : ''} ${
                        isMatch
                          ? `${colors.bg} hover:scale-105 hover:z-10 hover:shadow-lg`
                          : 'opacity-25 grayscale hover:opacity-100 hover:grayscale-0'
                      }`}
                    >
                      <div className="w-full flex justify-between items-center text-[8px] leading-none text-slate-400 font-mono">
                        <span>{el.atomicNumber}</span>
                        {el.isRadioactive && (
                          <span className="text-[8px] text-amber-400" title="عنصر مشع">☢</span>
                        )}
                      </div>
                      <span className={`text-sm font-extrabold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {el.symbol}
                      </span>
                      <span className="text-[8px] text-slate-300 truncate w-full text-center">
                        {t(el.name, el.englishName)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Lanthanides & Actinides separated rows */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
              {/* Lanthanides Row */}
              <div className="flex items-center gap-2">
                <span className="w-28 text-[10px] font-bold text-purple-400 shrink-0">
                  {t('اللانثانيدات (La-Lu):', 'Lanthanides (La-Lu):')}
                </span>
                <div className="grid grid-cols-15 gap-1.5 flex-1">
                  {LANTHANIDES.map(z => {
                    const el = elementsMap.get(z)!;
                    const isSelected = el.atomicNumber === currentAtomicNumber;
                    const isMatch = filteredElements.some(f => f.atomicNumber === el.atomicNumber);
                    const colors = CATEGORY_COLORS[el.category];
                    return (
                      <button
                        key={el.atomicNumber}
                        onClick={() => {
                          onSelectElement(el);
                          onClose();
                        }}
                        onMouseEnter={() => setHoveredElement(el)}
                        onMouseLeave={() => setHoveredElement(null)}
                        className={`aspect-square rounded-lg border p-1 flex flex-col items-center justify-between text-right transition-all ${
                          colors.border
                        } ${isSelected ? 'ring-2 ring-cyan-400 scale-105' : ''} ${
                          isMatch ? `${colors.bg} hover:scale-105` : 'opacity-25'
                        }`}
                      >
                        <span className="text-[8px] text-slate-400 font-mono">{el.atomicNumber}</span>
                        <span className="text-xs font-extrabold text-purple-300">{el.symbol}</span>
                        <span className="text-[7.5px] text-slate-300 truncate w-full text-center">{t(el.name, el.englishName)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actinides Row */}
              <div className="flex items-center gap-2">
                <span className="w-28 text-[10px] font-bold text-fuchsia-400 shrink-0">
                  {t('الأكتينيدات (Ac-Lr):', 'Actinides (Ac-Lr):')}
                </span>
                <div className="grid grid-cols-15 gap-1.5 flex-1">
                  {ACTINIDES.map(z => {
                    const el = elementsMap.get(z)!;
                    const isSelected = el.atomicNumber === currentAtomicNumber;
                    const isMatch = filteredElements.some(f => f.atomicNumber === el.atomicNumber);
                    const colors = CATEGORY_COLORS[el.category];
                    return (
                      <button
                        key={el.atomicNumber}
                        onClick={() => {
                          onSelectElement(el);
                          onClose();
                        }}
                        onMouseEnter={() => setHoveredElement(el)}
                        onMouseLeave={() => setHoveredElement(null)}
                        className={`aspect-square rounded-lg border p-1 flex flex-col items-center justify-between text-right transition-all ${
                          colors.border
                        } ${isSelected ? 'ring-2 ring-cyan-400 scale-105' : ''} ${
                          isMatch ? `${colors.bg} hover:scale-105` : 'opacity-25'
                        }`}
                      >
                        <span className="text-[8px] text-slate-400 font-mono">{el.atomicNumber}</span>
                        <span className="text-xs font-extrabold text-fuchsia-300">{el.symbol}</span>
                        <span className="text-[7.5px] text-slate-300 truncate w-full text-center">{t(el.name, el.englishName)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Preview Footer Strip */}
        <div className={`p-3 border-t flex items-center justify-between text-xs ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}>
          {hoveredElement ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{t(hoveredElement.name, hoveredElement.englishName)}</span>
                <span className="font-mono text-cyan-400 text-sm font-bold">({hoveredElement.symbol})</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{t('العدد الذري:', 'Atomic Number:')} {hoveredElement.atomicNumber}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{t('الكتلة الذرية:', 'Atomic Mass:')} {hoveredElement.atomicMass.toFixed(3)} u</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">{t('التوزيع:', 'Config:')} {hoveredElement.electronConfig}</span>
              </div>
            </div>
          ) : (
            <span className="text-slate-500">
              💡 {t(
                'مرر الفأرة فوق أي عنصر لمعاينة خصائصه، أو انقر عليه مباشرة لتحميله في جهاز بناء الذرة.',
                'Hover over any element to inspect properties, or click to load into the Atom Builder.'
              )}
            </span>
          )}

          <div className="flex items-center gap-2">
            <span className="text-slate-500">{t('العناصر المعروضة:', 'Displayed:')} {filteredElements.length} / 118</span>
          </div>
        </div>
      </div>
    </div>
  );
};
