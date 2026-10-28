import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FlaskConical,
  Flame,
  Info,
  BookOpen,
  ShieldAlert,
  Layers,
  Search,
  Atom,
  GripVertical,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  BUILDER_ELEMENTS,
  BUILDER_ELEMENTS_MAP,
  COMPOUNDS_DATABASE,
  BuilderElement,
  CompoundInfo,
  evaluateMoleculeComposition
} from '../data/compoundsData';
import { MoleculeViewer3D } from './MoleculeViewer3D';
import { playLabSound } from '../utils/soundEffects';

interface MoleculeBuilderProps {
  onOpenGuide?: (category?: 'basics' | 'states' | 'atoms' | 'decay' | 'missions') => void;
}

type ElementGroupFilter = 'all' | 'bio' | 'halogens' | 'alkali' | 'metals' | 'noble';

export const MoleculeBuilder: React.FC<MoleculeBuilderProps> = ({ onOpenGuide }) => {
  const { lang, theme, t, setActiveTab, launchLabExperiment } = useApp();
  const isDark = theme === 'dark';
  const isAr = lang === 'ar';

  // State of currently added atom counts { H: 2, O: 1 }
  const [elementCounts, setElementCounts] = useState<Record<string, number>>({
    H: 2,
    O: 1
  });

  // Track sequence of added atoms for the timeline / assembly tray
  const [assemblyHistory, setAssemblyHistory] = useState<string[]>(['H', 'O', 'H']);

  // Selected filter category for recipes
  const [recipeCategory, setRecipeCategory] = useState<'all' | 'water_oxide' | 'acid' | 'base' | 'salt' | 'organic'>('all');

  // Element palette search and category filter
  const [elementFilter, setElementFilter] = useState<ElementGroupFilter>('all');
  const [elementSearch, setElementSearch] = useState<string>('');
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState<boolean>(false);

  // Compute stability and identity analysis
  const analysis = useMemo(() => {
    return evaluateMoleculeComposition(elementCounts);
  }, [elementCounts]);

  const activeCompound: CompoundInfo | undefined = analysis.compound;

  // Add an atom
  const handleAddElement = (symbol: string) => {
    setElementCounts(prev => ({
      ...prev,
      [symbol]: (prev[symbol] || 0) + 1
    }));
    setAssemblyHistory(prev => [...prev, symbol]);
    playLabSound('nucleon');
  };

  // Remove an atom
  const handleRemoveElement = (symbol: string) => {
    if (!elementCounts[symbol] || elementCounts[symbol] <= 0) return;

    setElementCounts(prev => {
      const next = { ...prev };
      next[symbol] -= 1;
      if (next[symbol] <= 0) {
        delete next[symbol];
      }
      return next;
    });

    setAssemblyHistory(prev => {
      const idx = prev.lastIndexOf(symbol);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });

    playLabSound('click');
  };

  // Clear all
  const handleClearAll = () => {
    setElementCounts({});
    setAssemblyHistory([]);
    playLabSound('click');
  };

  // Load a preset recipe
  const handleLoadRecipe = (compound: CompoundInfo) => {
    setElementCounts({ ...compound.elementCounts });
    const newHistory: string[] = [];
    Object.entries(compound.elementCounts).forEach(([sym, count]) => {
      for (let i = 0; i < count; i++) {
        newHistory.push(sym);
      }
    });
    setAssemblyHistory(newHistory);
    playLabSound('success');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, symbol: string) => {
    e.dataTransfer.setData('text/plain', symbol);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const symbol = e.dataTransfer.getData('text/plain');
    if (symbol && BUILDER_ELEMENTS_MAP.has(symbol)) {
      handleAddElement(symbol);
    }
  };

  // Send compound to Experimental Lab
  const handleSendToLab = () => {
    if (!activeCompound) return;
    playLabSound('fizz');
    launchLabExperiment('experiments-lab', {
      notes: `${activeCompound.nameAr} (${activeCompound.formula})`
    });
  };

  // Send compound to States of Matter
  const handleSendToStates = () => {
    if (!activeCompound) return;
    playLabSound('crystallize');
    let mappedSubstance = 'water';
    if (activeCompound.id === 'CO2') mappedSubstance = 'co2';
    else if (activeCompound.id === 'O2') mappedSubstance = 'oxygen';
    else if (activeCompound.id === 'N2') mappedSubstance = 'nitrogen';
    else if (activeCompound.id === 'CH4') mappedSubstance = 'methane';
    else if (['Fe', 'FeO', 'Fe2O3', 'Cu', 'CuSO4', 'Al', 'Al2O3'].includes(activeCompound.id)) mappedSubstance = 'iron';

    launchLabExperiment('states-of-matter', {
      substanceId: mappedSubstance
    });
  };

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    if (recipeCategory === 'all') return COMPOUNDS_DATABASE;
    return COMPOUNDS_DATABASE.filter(c => c.category === recipeCategory);
  }, [recipeCategory]);

  // Filtered palette elements (search + category)
  const filteredElements = useMemo(() => {
    return BUILDER_ELEMENTS.filter(el => {
      // Search check
      if (elementSearch.trim()) {
        const query = elementSearch.trim().toLowerCase();
        const matchSymbol = el.symbol.toLowerCase().includes(query);
        const matchNameAr = el.nameAr.includes(query);
        const matchNameEn = el.nameEn.toLowerCase().includes(query);
        const matchNum = String(el.atomicNumber) === query;
        if (!matchSymbol && !matchNameAr && !matchNameEn && !matchNum) return false;
      }

      // Category check
      if (elementFilter === 'all') return true;
      if (elementFilter === 'bio') {
        return ['H', 'C', 'N', 'O', 'P', 'S', 'Se'].includes(el.symbol);
      }
      if (elementFilter === 'halogens') {
        return ['F', 'Cl', 'Br', 'I'].includes(el.symbol);
      }
      if (elementFilter === 'alkali') {
        return ['Li', 'Na', 'K', 'Rb', 'Be', 'Mg', 'Ca', 'Sr', 'Ba'].includes(el.symbol);
      }
      if (elementFilter === 'metals') {
        return ['Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Al', 'Ag', 'Sn', 'Pt', 'Au', 'Hg', 'Pb', 'Bi', 'U'].includes(el.symbol);
      }
      if (elementFilter === 'noble') {
        return ['He', 'Ne', 'Ar', 'Kr', 'Xe'].includes(el.symbol);
      }
      return true;
    });
  }, [elementFilter, elementSearch]);

  return (
    <div className="w-full flex flex-col gap-6 pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner & High-Level Actions */}
      <div className={`p-6 sm:p-7 rounded-3xl border transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800 shadow-lg' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-cyan-600 flex items-center justify-center text-white shadow-md shrink-0">
              <FlaskConical className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
                  {t('تكوين وتشييد المركبات الكيميائية', 'Molecular Compound Builder')}
                </h1>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {t('02 · بناء الجزيئات', '02 · Molecules')}
                </span>
              </div>
              <p className="text-sm mt-1 leading-relaxed text-slate-300 max-w-3xl">
                {t(
                  'اسحب العناصر مباشرة من اللوحة الجانبية على اليمين إلى ساحة التفاعل، وتحقق من استقرار الروابط وخصائص الجزيء ثلاثي الأبعاد.',
                  'Drag elements directly from the right-hand palette onto the reaction canvas, inspect bond stability, and explore 3D properties.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={analysis.totalAtoms === 0}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border transition-all ${
                analysis.totalAtoms === 0
                  ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500'
                  : isDark
                  ? 'bg-slate-800/80 border-slate-700 text-rose-300 hover:bg-rose-950/40 hover:border-rose-700'
                  : 'bg-slate-100 border-slate-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('تفريغ المنصة', 'Clear Canvas')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const randomRecipe = COMPOUNDS_DATABASE[Math.floor(Math.random() * COMPOUNDS_DATABASE.length)];
                handleLoadRecipe(randomRecipe);
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border transition-all ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-100'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t('مركب عشوائي', 'Random Compound')}</span>
            </button>

            {onOpenGuide && (
              <button
                type="button"
                onClick={() => onOpenGuide('basics')}
                className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t('قواعد التكافؤ', 'Valence Guide')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Three-Column Ergonomic Layout:
          In RTL (Arabic):
          - Right Side: Draggable Elements Dock (Right next to Canvas!)
          - Center: Reaction Workbench & 3D Viewer & Stability Panel
          - Left Side: Scientific Dossier & Recipes Library
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT SIDE DOCK (in RTL): Draggable Elements Palette (Visible on Desktop lg:col-span-4) */}
        <div className="hidden lg:flex lg:col-span-4 xl:col-span-4 flex-col gap-4 sticky top-24">
          <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold tracking-tight text-slate-100">
                  {t('درج العناصر القابلة للسحب', 'Draggable Elements Palette')}
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/50">
                {filteredElements.length} {t('عنصر', 'elements')}
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3.5 leading-relaxed">
              {t(
                'اسحب العنصر مباشرة بضعة سنتمترات إلى ساحة التفاعل على اليسار، أو انقر عليه للإضافة الفورية.',
                'Drag any element directly onto the workbench stage beside it, or click to add instantly.'
              )}
            </p>

            {/* Element Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute start-3 top-3 text-slate-400" />
              <input
                type="text"
                value={elementSearch}
                onChange={e => setElementSearch(e.target.value)}
                placeholder={t('ابحث بالاسم أو الرمز (مثال: C, Fe, أكسجين)...', 'Search symbol or name (e.g. C, Fe, Gold)...')}
                className={`w-full ps-9 pe-3 py-2 rounded-xl text-xs font-medium border transition-colors outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            {/* Quick Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 mb-3">
              {[
                { id: 'all', labelAr: 'الكل (46)', labelEn: 'All' },
                { id: 'bio', labelAr: 'الحيوية', labelEn: 'Bio' },
                { id: 'halogens', labelAr: 'هالوجين', labelEn: 'Halogen' },
                { id: 'alkali', labelAr: 'قلوية', labelEn: 'Alkali' },
                { id: 'metals', labelAr: 'معادن', labelEn: 'Metals' },
                { id: 'noble', labelAr: 'خاملة', labelEn: 'Noble' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setElementFilter(cat.id as ElementGroupFilter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                    elementFilter === cat.id
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {t(cat.labelAr, cat.labelEn)}
                </button>
              ))}
            </div>

            {/* Scrollable Elements Grid (Right-Side Dock) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[580px] overflow-y-auto scrollbar-thin pe-1">
              {filteredElements.map(el => {
                const currentCount = elementCounts[el.symbol] || 0;
                return (
                  <div
                    key={el.symbol}
                    draggable
                    onDragStart={e => handleDragStart(e, el.symbol)}
                    onClick={() => handleAddElement(el.symbol)}
                    className={`p-2.5 rounded-2xl border cursor-grab active:cursor-grabbing select-none transition-all hover:scale-102 active:scale-95 group relative flex flex-col justify-between ${
                      currentCount > 0
                        ? isDark ? 'bg-slate-950 border-cyan-500 shadow-md ring-1 ring-cyan-500/50' : 'bg-cyan-50/80 border-cyan-400 shadow-md'
                        : isDark ? 'bg-slate-950/80 hover:bg-slate-800/90 border-slate-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {/* Header: Atomic Number & Drag handle */}
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                      <span className="font-bold">#{el.atomicNumber}</span>
                      <GripVertical className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                    </div>

                    {/* Center: Symbol with CPK Color */}
                    <div className="flex items-center justify-center my-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-sm group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: el.colorHex === '#FFFFFF' ? '#475569' : el.colorHex }}
                      >
                        {el.symbol}
                      </div>
                    </div>

                    {/* Footer: Name & Valence */}
                    <div className="text-center mt-0.5">
                      <span className="text-xs font-bold block truncate text-slate-100">
                        {t(el.nameAr, el.nameEn)}
                      </span>
                      <span className="text-[11px] text-cyan-400 font-mono block mt-0.5">
                        {t('تكافؤ', 'Valence')} {el.primaryValence}
                      </span>
                    </div>

                    {/* Count Badge */}
                    {currentCount > 0 && (
                      <span className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-cyan-600 text-white font-mono text-xs font-bold flex items-center justify-center shadow-md">
                        {currentCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER STAGE: Workbench Drop Target & 3D Viewer & Stability (lg:col-span-8 xl:col-span-5) */}
        <div className="lg:col-span-8 xl:col-span-5 flex flex-col gap-6">
          
          {/* Reaction Chamber Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`p-6 sm:p-7 rounded-3xl border transition-all relative ${
              isDark ? 'bg-slate-900/90 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-5 h-5 text-cyan-500" />
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-100">
                  {t('منصة التفاعل والتجميع الكيميائي', 'Reaction & Assembly Workbench')}
                </h2>
              </div>
              <span className="text-sm font-mono text-slate-300">
                {t('إجمالي الذرات:', 'Total Atoms:')}{' '}
                <strong className="text-cyan-400 text-base font-bold">{analysis.totalAtoms}</strong>
              </span>
            </div>

            {/* Mobile Quick Elements Strip & Drawer Launcher (Visible on mobile/tablet < lg) */}
            <div className="lg:hidden flex flex-col gap-2 mb-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('إضافة عناصر مباشرة:', 'Quick Elements:')}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobilePaletteOpen(true)}
                  className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-4"
                >
                  <span>{t('عرض جميع العناصر (46)', 'View All (46)')}</span>
                  <span>↗</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['H', 'C', 'N', 'O', 'Na', 'Cl', 'Fe', 'Cu', 'S', 'P', 'Ca', 'K'].map(sym => {
                  const el = BUILDER_ELEMENTS_MAP.get(sym);
                  if (!el) return null;
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleAddElement(sym)}
                      className="flex flex-col items-center justify-center p-1.5 rounded-xl border bg-slate-900 border-slate-700 hover:border-cyan-400 text-white shrink-0 min-w-[48px] active:scale-95 transition-transform"
                    >
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-xs"
                        style={{ backgroundColor: el.colorHex === '#FFFFFF' ? '#475569' : el.colorHex }}
                      >
                        {el.symbol}
                      </span>
                      <span className="text-[10px] font-bold mt-1 text-slate-300">{t(el.nameAr, el.nameEn)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dropped Atoms List / Timeline */}
            {analysis.totalAtoms === 0 ? (
              <div className={`py-10 sm:py-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-colors ${
                isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-600'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2.5">
                  <Atom className="w-7 h-7 opacity-80" />
                </div>
                <h3 className="text-base font-bold text-slate-200 mb-1">
                  {t('أفلت العناصر هنا لتوليف الجزيء', 'Drop Elements Here')}
                </h3>
                <p className="text-xs font-medium leading-relaxed max-w-sm text-slate-400">
                  {t(
                    'اسحب العناصر من اللوحة الجانبية على اليمين مباشرة إلى هذه الخانة لتجميع الروابط واختبار الاستقرار.',
                    'Drag elements from the side palette directly into this zone to test bonds and stability.'
                  )}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {/* Active Element Counters Grid */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {Object.entries(elementCounts)
                    .filter(([_, count]) => count > 0)
                    .map(([sym, count]) => {
                      const el = BUILDER_ELEMENTS_MAP.get(sym);
                      if (!el) return null;
                      return (
                        <div
                          key={sym}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all shadow-xs ${
                            isDark ? 'bg-slate-950/80 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0"
                            style={{ backgroundColor: el.colorHex === '#FFFFFF' ? '#475569' : el.colorHex }}
                          >
                            {sym}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-100">{t(el.nameAr, el.nameEn)}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {t('تكافؤ', 'Valence')}: {el.primaryValence}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 ms-1.5">
                            <button
                              type="button"
                              onClick={() => handleRemoveElement(sym)}
                              className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 hover:bg-rose-900/60 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                              title={t('إنقاص ذرة', 'Decrease atom')}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-black w-5 text-center text-cyan-400">
                              {count}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddElement(sym)}
                              className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 hover:bg-cyan-600 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                              title={t('إضافة ذرة', 'Add atom')}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Assembly Order Chips (Visual sequence as user placed them) */}
                <div className={`p-3 rounded-2xl border flex items-center gap-2 overflow-x-auto scrollbar-none text-xs ${
                  isDark ? 'bg-slate-950/70 border-slate-800/90 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <span className="text-xs font-bold text-slate-400 shrink-0">
                    {t('تسلسل التجميع:', 'Sequence:')}
                  </span>
                  <div className="flex items-center gap-1.5 flex-nowrap">
                    {assemblyHistory.map((sym, idx) => {
                      const el = BUILDER_ELEMENTS_MAP.get(sym);
                      return (
                        <React.Fragment key={`${sym}-${idx}`}>
                          <span
                            className="px-2 py-0.5 rounded-lg text-xs font-bold text-white shadow-xs"
                            style={{ backgroundColor: el?.colorHex === '#FFFFFF' ? '#475569' : el?.colorHex || '#475569' }}
                          >
                            {sym}
                          </span>
                          {idx < assemblyHistory.length - 1 && (
                            <span className="text-slate-500 font-bold">→</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3D Ball-and-Stick / Space-Filling Visualizer */}
          <MoleculeViewer3D
            compound={activeCompound}
            analysis={analysis}
            elementCounts={elementCounts}
          />

          {/* Chemical Stability & Octet Rule Assessment Gauge */}
          <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
            analysis.status === 'stable_known'
              ? isDark ? 'bg-emerald-950/20 border-emerald-800/60 shadow-md' : 'bg-emerald-50 border-emerald-200'
              : analysis.status === 'theoretical_stable'
              ? isDark ? 'bg-cyan-950/20 border-cyan-800/60 shadow-md' : 'bg-cyan-50 border-cyan-200'
              : analysis.status === 'radical'
              ? isDark ? 'bg-amber-950/20 border-amber-800/60 shadow-md' : 'bg-amber-50 border-amber-200'
              : analysis.status === 'unstable_valency'
              ? isDark ? 'bg-rose-950/20 border-rose-800/60 shadow-md' : 'bg-rose-50 border-rose-200'
              : isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {analysis.status === 'stable_known' || analysis.status === 'theoretical_stable' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : analysis.status === 'radical' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                ) : analysis.status === 'unstable_valency' ? (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-base font-black tracking-tight text-slate-100">
                    {t(analysis.statusAr, analysis.statusEn)}
                  </h3>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {analysis.empiricalFormula || '—'}
                  </span>
                </div>
              </div>

              {analysis.totalAtoms > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
                    analysis.octetsFulfilled
                      ? isDark ? 'bg-emerald-900/40 border-emerald-700 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : isDark ? 'bg-rose-900/40 border-rose-700 text-rose-300' : 'bg-rose-100 border-rose-300 text-rose-800'
                  }`}>
                    {analysis.octetsFulfilled
                      ? t('الثمانيات: مكتملة ✓', 'Octet: Satisfied ✓')
                      : t('تكافؤات شاغرة ⚠️', 'Open Valencies ⚠️')}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-normal">
              {t(analysis.explanationAr, analysis.explanationEn)}
            </p>

            {analysis.totalAtoms > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-700/50">
                <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[11px] text-slate-400 block">{t('الكتلة المولية', 'Molar Mass')}</span>
                  <span className="font-mono text-sm font-bold text-cyan-400">{analysis.totalMass} g/mol</span>
                </div>
                <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[11px] text-slate-400 block">{t('إلكترونات التكافؤ', 'Valence e⁻')}</span>
                  <span className="font-mono text-sm font-bold text-slate-100">{analysis.totalValenceElectrons} e⁻</span>
                </div>
                <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[11px] text-slate-400 block">{t('إلكترونات مفردة', 'Unpaired e⁻')}</span>
                  <span className={`font-mono text-sm font-bold ${analysis.unpairedElectrons > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {analysis.unpairedElectrons} e⁻
                  </span>
                </div>
                <div className={`p-2.5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[11px] text-slate-400 block">{t('روابط متوقعة', 'Expected Bonds')}</span>
                  <span className="font-mono text-sm font-bold text-slate-100">{analysis.possibleBonds}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LEFT COLUMN: Scientific Dossier & Recipes Library (lg:col-span-12 xl:col-span-3) */}
        <div className="lg:col-span-12 xl:col-span-3 flex flex-col gap-6">
          
          {/* Detailed Compound Scientific Dossier */}
          {activeCompound ? (
            <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                    {t('وثيقة المركب الكيميائي', 'Chemical Dossier')}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-100 mt-1">
                    {t(activeCompound.nameAr, activeCompound.nameEn)}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    {t('الاسم النظامي:', 'IUPAC:')}{' '}
                    <strong className="text-cyan-300">{t(activeCompound.iupacAr, activeCompound.iupacEn)}</strong>
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <span className="text-xl sm:text-2xl font-mono font-black text-cyan-400 block">
                    {activeCompound.formula}
                  </span>
                  <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                    {activeCompound.molarMass} g/mol
                  </span>
                </div>
              </div>

              {/* Scientific Parameters Table */}
              <div className="grid grid-cols-2 gap-2.5 my-3">
                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[11px] text-slate-400 block">{t('نوع الرابطة', 'Bonding')}</span>
                  <strong className="text-cyan-300 text-xs font-bold block mt-0.5">
                    {t(activeCompound.bondingTypeAr, activeCompound.bondingTypeEn)}
                  </strong>
                </div>

                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[11px] text-slate-400 block">{t('الحالة 25°C', 'State 25°C')}</span>
                  <strong className="text-amber-300 text-xs font-bold block mt-0.5">
                    {t(activeCompound.stateAtRoomTempAr, activeCompound.stateAtRoomTempEn)}
                  </strong>
                </div>

                <div className={`col-span-2 p-3 rounded-2xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[11px] text-slate-400 block">{t('الشكل الهندسي لروابط لويس', 'Lewis Geometry')}</span>
                  <strong className="text-slate-100 text-xs font-bold block mt-0.5">
                    {t(activeCompound.lewisInfo.geometryAr, activeCompound.lewisInfo.geometryEn)}
                  </strong>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {t(activeCompound.lewisInfo.bondsDescAr, activeCompound.lewisInfo.bondsDescEn)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-1">
                  {t('الأهمية العلمية:', 'Significance:')}
                </span>
                <p className="text-xs leading-relaxed text-slate-200">
                  {t(activeCompound.descriptionAr, activeCompound.descriptionEn)}
                </p>
              </div>

              {/* Real World Applications */}
              <div className="mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-1">
                  {t('الاستخدامات والتطبيقات:', 'Applications:')}
                </span>
                <ul className="space-y-1">
                  {(isAr ? activeCompound.applicationsAr : activeCompound.applicationsEn).slice(0, 3).map((app, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-cyan-400 font-bold shrink-0">•</span>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safety & Hazard Warning */}
              <div className={`p-3 rounded-2xl border flex items-start gap-2.5 mb-4 ${
                isDark ? 'bg-rose-950/20 border-rose-800/40 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="text-xs leading-relaxed">
                  <strong className="font-bold">{t('السلامة:', 'Safety:')} </strong>
                  <span>{t(activeCompound.safetyAr, activeCompound.safetyEn)}</span>
                </div>
              </div>

              {/* Direct Inter-Module Lab Triggers */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleSendToLab}
                  className="px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>{t('إرسال للمعمل', 'Send to Lab')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendToStates}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    isDark ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('حالات المادة', 'States')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={`p-6 rounded-3xl border text-center flex flex-col items-center justify-center min-h-[220px] transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300 shadow-md' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2.5">
                <FlaskConical className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                {t('اكتشف روعة المركبات الكيميائية', 'Discover Compounds')}
              </h3>
              <p className="text-xs leading-relaxed text-slate-300 max-w-xs">
                {t(
                  'عند مطابقة تركيبة كيميائية حقيقية، ستظهر لك بطاقة علمية تفصيلية كاملة بخصائص المركب ومجسمه.',
                  'Assemble atoms matching a real compound to reveal its comprehensive scientific dossier.'
                )}
              </p>
            </div>
          )}

          {/* Quick Recipe Library (وصفات توليف المركبات السريعة) */}
          <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-bold tracking-tight text-slate-100">
                  {t('وصفات كيميائية جاهزة', 'Compound Recipes')}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-300">
                {COMPOUNDS_DATABASE.length} {t('مركب', 'items')}
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-2 mb-2.5">
              {[
                { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                { id: 'water_oxide', labelAr: 'أكاسيد', labelEn: 'Oxides' },
                { id: 'acid', labelAr: 'أحماض', labelEn: 'Acids' },
                { id: 'base', labelAr: 'قواعد', labelEn: 'Bases' },
                { id: 'salt', labelAr: 'أملاح', labelEn: 'Salts' },
                { id: 'organic', labelAr: 'عضوية', labelEn: 'Organic' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setRecipeCategory(cat.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                    recipeCategory === cat.id
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {t(cat.labelAr, cat.labelEn)}
                </button>
              ))}
            </div>

            {/* Recipe Buttons Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto scrollbar-thin pe-1">
              {filteredRecipes.map(c => {
                const isSelected = activeCompound?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleLoadRecipe(c)}
                    className={`p-2.5 rounded-xl border text-start flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-md'
                        : isDark
                        ? 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono font-black text-xs text-cyan-400">
                        {c.formula}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.molarMass}g
                      </span>
                    </div>
                    <span className="text-xs font-bold truncate mt-1 text-slate-100">
                      {t(c.nameAr, c.nameEn)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="fixed bottom-5 end-5 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobilePaletteOpen(true)}
          className="px-4 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-2xl border border-cyan-400 active:scale-95 transition-all"
        >
          <Layers className="w-4 h-4 text-cyan-200" />
          <span>{t('لوحة العناصر (46)', 'Elements (46)')}</span>
          {analysis.totalAtoms > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-900 text-[10px] font-mono text-cyan-200">
              {analysis.totalAtoms}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Bottom Sheet Drawer Modal */}
      {isMobilePaletteOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsMobilePaletteOpen(false)}
          />
          <div className={`relative z-10 w-full max-h-[85vh] rounded-t-3xl border-t p-5 flex flex-col gap-3 shadow-2xl overflow-hidden transition-all ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  {t('لوحة العناصر الكيميائية (46 عنصراً)', 'Chemical Elements Drawer (46)')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobilePaletteOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute start-3 top-3 text-slate-400" />
              <input
                type="text"
                value={elementSearch}
                onChange={e => setElementSearch(e.target.value)}
                placeholder={t('ابحث بالاسم أو الرمز (مثال: C, Fe, أكسجين)...', 'Search symbol or name (e.g. C, Fe, Gold)...')}
                className="w-full ps-9 pe-3 py-2 rounded-xl text-xs font-medium border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {[
                { id: 'all', labelAr: 'الكل (46)', labelEn: 'All (46)' },
                { id: 'bio', labelAr: 'الحيوية', labelEn: 'Bio' },
                { id: 'halogens', labelAr: 'الهالوجين', labelEn: 'Halogens' },
                { id: 'alkali', labelAr: 'قلوية', labelEn: 'Alkali' },
                { id: 'metals', labelAr: 'معادن', labelEn: 'Metals' },
                { id: 'noble', labelAr: 'خاملة', labelEn: 'Noble' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setElementFilter(cat.id as ElementGroupFilter)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    elementFilter === cat.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t(cat.labelAr, cat.labelEn)}
                </button>
              ))}
            </div>

            {/* Elements Grid (tap to add directly!) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto max-h-[48vh] pe-1 py-1">
              {filteredElements.map(el => {
                const currentCount = elementCounts[el.symbol] || 0;
                return (
                  <button
                    key={el.symbol}
                    type="button"
                    onClick={() => handleAddElement(el.symbol)}
                    className="p-2.5 rounded-2xl border text-center transition-all bg-slate-950 border-slate-800 hover:border-cyan-400 active:scale-95 flex flex-col items-center justify-between gap-1 relative"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-xs" style={{ backgroundColor: el.colorHex === '#FFFFFF' ? '#475569' : el.colorHex }}>
                      {el.symbol}
                    </div>
                    <span className="text-[11px] font-bold truncate text-slate-100 max-w-full">
                      {t(el.nameAr, el.nameEn)}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400">
                      {t('تكافؤ', 'Valence')} {el.primaryValence}
                    </span>
                    {currentCount > 0 && (
                      <span className="absolute -top-1 -end-1 w-4.5 h-4.5 rounded-full bg-cyan-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {currentCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Close Button */}
            <button
              type="button"
              onClick={() => setIsMobilePaletteOpen(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all mt-1"
            >
              {t('تم / العودة لمنصة التفاعل', 'Done / Back to Workbench')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
