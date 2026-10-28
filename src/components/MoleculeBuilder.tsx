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
  Share2,
  ArrowRight,
  RefreshCw,
  Atom
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

type ElementGroupFilter = 'all' | 'bio' | 'metals' | 'halogens';

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

  // Element palette category filter
  const [elementFilter, setElementFilter] = useState<ElementGroupFilter>('all');

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
    else if (activeCompound.id === 'Fe' || activeCompound.id === 'FeO' || activeCompound.id === 'Fe2O3') mappedSubstance = 'iron';

    launchLabExperiment('states-of-matter', {
      substanceId: mappedSubstance
    });
  };

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    if (recipeCategory === 'all') return COMPOUNDS_DATABASE;
    return COMPOUNDS_DATABASE.filter(c => c.category === recipeCategory);
  }, [recipeCategory]);

  // Filtered palette elements
  const filteredElements = useMemo(() => {
    if (elementFilter === 'all') return BUILDER_ELEMENTS;
    if (elementFilter === 'bio') {
      return BUILDER_ELEMENTS.filter(e => ['H', 'C', 'N', 'O', 'P', 'S'].includes(e.symbol));
    }
    if (elementFilter === 'halogens') {
      return BUILDER_ELEMENTS.filter(e => ['F', 'Cl', 'Br', 'I'].includes(e.symbol));
    }
    if (elementFilter === 'metals') {
      return BUILDER_ELEMENTS.filter(e => ['Na', 'Mg', 'Al', 'Si', 'K', 'Ca', 'Fe', 'Cu'].includes(e.symbol));
    }
    return BUILDER_ELEMENTS;
  }, [elementFilter]);

  return (
    <div className="w-full flex flex-col gap-8 pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. Header Banner & High-Level Actions */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800 shadow-lg' : 'bg-white border-slate-200/90 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-600 flex items-center justify-center text-white shadow-md shrink-0">
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
              <p className="text-sm mt-1.5 leading-relaxed text-slate-300 max-w-3xl">
                {t(
                  'اسحب العناصر بالترتيب المرغوب، وفحص الاستقرار الكيميائي وفق قاعدة الثمانيات، واستكشف المركبات الحقيقية بمجسمات 3D ومعلومات شاملة.',
                  'Assemble chemical elements in specific arrangements, evaluate stability via the Octet rule, and explore real molecules with 3D models.'
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

      {/* 2. Main Work Area: Workbench & 3D Stage (Left) + Dossier & Recipes (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 cols): Reaction Chamber, Atom Nodes, 3D Canvas, Stability Gauge */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Reaction Chamber Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`p-6 sm:p-7 rounded-3xl border transition-all relative ${
              isDark ? 'bg-slate-900/90 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
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

            {/* Dropped Atoms List / Timeline */}
            {analysis.totalAtoms === 0 ? (
              <div className={`py-12 sm:py-14 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-colors ${
                isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-600'
              }`}>
                <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                  <Atom className="w-8 h-8 opacity-80" />
                </div>
                <h3 className="text-base font-bold text-slate-200 mb-1">
                  {t('المنصة جاهزة لإضافة العناصر', 'Workbench Ready for Elements')}
                </h3>
                <p className="text-sm font-medium leading-relaxed max-w-md text-slate-400">
                  {t(
                    'اسحب العناصر من الدرج السفلي وأفلتها هنا، أو انقر على أي عنصر لإضافته مباشرة بالترتيب الكيميائي المناسب.',
                    'Drag elements from the bottom palette and drop here, or click any element to assemble in desired order.'
                  )}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Active Element Counters Grid */}
                <div className="flex flex-wrap items-center gap-3">
                  {Object.entries(elementCounts)
                    .filter(([_, count]) => count > 0)
                    .map(([sym, count]) => {
                      const el = BUILDER_ELEMENTS_MAP.get(sym);
                      if (!el) return null;
                      return (
                        <div
                          key={sym}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all shadow-xs ${
                            isDark ? 'bg-slate-950/80 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0"
                            style={{ backgroundColor: el.colorHex === '#FFFFFF' ? '#475569' : el.colorHex }}
                          >
                            {sym}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-100">{t(el.nameAr, el.nameEn)}</span>
                            <span className="text-xs text-slate-400 font-mono">
                              {t('تكافؤ', 'Valence')}: {el.primaryValence}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 ms-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveElement(sym)}
                              className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 hover:bg-rose-900/60 hover:text-white flex items-center justify-center transition-colors text-sm font-bold"
                              title={t('إنقاص ذرة', 'Decrease atom')}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-mono font-black w-6 text-center text-cyan-400">
                              {count}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddElement(sym)}
                              className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 hover:bg-cyan-600 hover:text-white flex items-center justify-center transition-colors text-sm font-bold"
                              title={t('إضافة ذرة', 'Add atom')}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Assembly Order Chips (Visual sequence as user placed them) */}
                <div className={`p-3.5 rounded-2xl border flex items-center gap-2 overflow-x-auto scrollbar-none text-xs ${
                  isDark ? 'bg-slate-950/70 border-slate-800/90 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <span className="text-xs font-bold text-slate-400 shrink-0">
                    {t('تسلسل التجميع:', 'Assembly Order:')}
                  </span>
                  <div className="flex items-center gap-1.5 flex-nowrap">
                    {assemblyHistory.map((sym, idx) => {
                      const el = BUILDER_ELEMENTS_MAP.get(sym);
                      return (
                        <React.Fragment key={`${sym}-${idx}`}>
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
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
          <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-3">
                {analysis.status === 'stable_known' || analysis.status === 'theoretical_stable' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : analysis.status === 'radical' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                ) : analysis.status === 'unstable_valency' ? (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-6 h-6 text-slate-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-100">
                    {t(analysis.statusAr, analysis.statusEn)}
                  </h3>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {analysis.empiricalFormula || '—'}
                  </span>
                </div>
              </div>

              {analysis.totalAtoms > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                    analysis.octetsFulfilled
                      ? isDark ? 'bg-emerald-900/40 border-emerald-700 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : isDark ? 'bg-rose-900/40 border-rose-700 text-rose-300' : 'bg-rose-100 border-rose-300 text-rose-800'
                  }`}>
                    {analysis.octetsFulfilled
                      ? t('قاعدة الثمانيات: مكتملة ✓', 'Octet Rule: Satisfied ✓')
                      : t('تكافؤات شاغرة ⚠️', 'Open Valencies ⚠️')}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm leading-relaxed text-slate-200 font-normal">
              {t(analysis.explanationAr, analysis.explanationEn)}
            </p>

            {analysis.totalAtoms > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/50">
                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block mb-0.5">{t('الكتلة المولية', 'Molar Mass')}</span>
                  <span className="font-mono text-base font-bold text-cyan-400">{analysis.totalMass} g/mol</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block mb-0.5">{t('إلكترونات التكافؤ', 'Valence e⁻')}</span>
                  <span className="font-mono text-base font-bold text-slate-100">{analysis.totalValenceElectrons} e⁻</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block mb-0.5">{t('إلكترونات مفردة', 'Unpaired e⁻')}</span>
                  <span className={`font-mono text-base font-bold ${analysis.unpairedElectrons > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {analysis.unpairedElectrons} e⁻
                  </span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block mb-0.5">{t('روابط متوقعة', 'Expected Bonds')}</span>
                  <span className="font-mono text-base font-bold text-slate-100">{analysis.possibleBonds}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Compound Dossier (if known) or Discovery Guide + Fast Recipes */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Detailed Compound Scientific Dossier */}
          {activeCompound ? (
            <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                    {t('وثيقة المركب الكيميائي', 'Chemical Dossier')}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 mt-1">
                    {t(activeCompound.nameAr, activeCompound.nameEn)}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    {t('الاسم النظامي (IUPAC):', 'IUPAC:')}{' '}
                    <strong className="text-cyan-300">{t(activeCompound.iupacAr, activeCompound.iupacEn)}</strong>
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-cyan-400 block">
                    {activeCompound.formula}
                  </span>
                  <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                    {activeCompound.molarMass} g/mol
                  </span>
                </div>
              </div>

              {/* Scientific Parameters Table */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block">{t('نوع الرابطة الكيميائية', 'Bonding Type')}</span>
                  <strong className="text-cyan-300 text-xs sm:text-sm font-bold block mt-1">
                    {t(activeCompound.bondingTypeAr, activeCompound.bondingTypeEn)}
                  </strong>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block">{t('الحالة عند 25°C', 'State at 25°C')}</span>
                  <strong className="text-amber-300 text-xs sm:text-sm font-bold block mt-1">
                    {t(activeCompound.stateAtRoomTempAr, activeCompound.stateAtRoomTempEn)}
                  </strong>
                </div>

                <div className={`col-span-2 p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs text-slate-400 block">{t('الشكل الهندسي لروابط لويس', 'Lewis Geometry')}</span>
                  <strong className="text-slate-100 text-xs sm:text-sm font-bold block mt-1">
                    {t(activeCompound.lewisInfo.geometryAr, activeCompound.lewisInfo.geometryEn)}
                  </strong>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {t(activeCompound.lewisInfo.bondsDescAr, activeCompound.lewisInfo.bondsDescEn)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-1.5">
                  {t('الأهمية والخواص العلمية:', 'Scientific Significance:')}
                </span>
                <p className="text-sm leading-relaxed text-slate-200">
                  {t(activeCompound.descriptionAr, activeCompound.descriptionEn)}
                </p>
              </div>

              {/* Real World Applications */}
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block mb-1.5">
                  {t('أبرز الاستخدامات والتطبيقات:', 'Key Applications:')}
                </span>
                <ul className="space-y-1.5">
                  {(isAr ? activeCompound.applicationsAr : activeCompound.applicationsEn).map((app, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-cyan-400 font-bold shrink-0">•</span>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safety & Hazard Warning */}
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3 mb-5 ${
                isDark ? 'bg-rose-950/20 border-rose-800/40 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <strong className="font-bold">{t('إرشادات السلامة والمخاطر:', 'Safety & Hazards:')} </strong>
                  <span>{t(activeCompound.safetyAr, activeCompound.safetyEn)}</span>
                </div>
              </div>

              {/* Direct Inter-Module Lab Triggers */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleSendToLab}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md"
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>{t('إرسال للمعمل', 'Send to Lab')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendToStates}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                    isDark ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>{t('حالات المادة', 'States of Matter')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={`p-8 rounded-3xl border text-center flex flex-col items-center justify-center min-h-[260px] transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300 shadow-md' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
            }`}>
              <div className="w-16 h-16 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3.5">
                <FlaskConical className="w-9 h-9" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-1.5">
                {t('اكتشف روعة المركبات الكيميائية', 'Discover Chemical Compounds')}
              </h3>
              <p className="text-xs sm:text-sm max-w-sm leading-relaxed text-slate-300">
                {t(
                  'عندما تشكل تركيبة لعنصر أو مركب كيميائي حقيقي موجود في الطبيعة، ستظهر لك بطاقة علمية تفصيلية كاملة بخصائصه وتطبيقاته ومجسمه ثلاثي الأبعاد.',
                  'When you assemble elements matching a real chemical compound, a comprehensive scientific dossier with its 3D geometry and properties will emerge.'
                )}
              </p>
              <span className="text-xs text-cyan-400 font-bold mt-4">
                {t('جرب وصفة من المكتبة أدناه للبدء السريع ↓', 'Pick a recipe from the library below for instant preview ↓')}
              </span>
            </div>
          )}

          {/* Quick Recipe Library (وصفات توليف المركبات السريعة) */}
          <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            isDark ? 'bg-slate-900/90 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-cyan-500" />
                <h3 className="text-base font-bold tracking-tight text-slate-100">
                  {t('مكتبة الوصفات الكيميائية الشائعة', 'Standard Recipe Library')}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-300">
                {COMPOUNDS_DATABASE.length} {t('مركب', 'compounds')}
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 mb-3">
              {[
                { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                { id: 'water_oxide', labelAr: 'الأكاسيد والماء', labelEn: 'Oxides' },
                { id: 'acid', labelAr: 'الأحماض', labelEn: 'Acids' },
                { id: 'base', labelAr: 'القواعد', labelEn: 'Bases' },
                { id: 'salt', labelAr: 'الأملاح', labelEn: 'Salts' },
                { id: 'organic', labelAr: 'عضوية', labelEn: 'Organic' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setRecipeCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                    recipeCategory === cat.id
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {t(cat.labelAr, cat.labelEn)}
                </button>
              ))}
            </div>

            {/* Recipe Buttons Grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[250px] overflow-y-auto scrollbar-thin pe-1">
              {filteredRecipes.map(c => {
                const isSelected = activeCompound?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleLoadRecipe(c)}
                    className={`p-3 rounded-2xl border text-start flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-md'
                        : isDark
                        ? 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 text-slate-200'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono font-black text-sm text-cyan-400">
                        {c.formula}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {c.molarMass} g/mol
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold truncate mt-1 text-slate-100">
                      {t(c.nameAr, c.nameEn)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Element Palette (درج العناصر الكيميائية للبناء) */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isDark ? 'bg-slate-900/90 border-slate-800 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-100">
                {t('درج العناصر الكيميائية (انقر للإضافة أو اسحب إلى المنصة)', 'Chemical Elements Palette (Click to Add or Drag onto Canvas)')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('انقر على أي عنصر لإضافته مباشرة أو اسحبه وأفلته في المنصة أعلاه', 'Click any element to add, or drag and drop it onto the reaction stage')}
              </p>
            </div>
          </div>

          {/* Group Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {[
              { id: 'all', labelAr: 'كل العناصر (18)', labelEn: 'All (18)' },
              { id: 'bio', labelAr: 'اللافلزات الحيوية (6)', labelEn: 'Nonmetals (6)' },
              { id: 'halogens', labelAr: 'الهالوجينات (4)', labelEn: 'Halogens (4)' },
              { id: 'metals', labelAr: 'الفلزات والمعادن (8)', labelEn: 'Metals (8)' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setElementFilter(tab.id as ElementGroupFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  elementFilter === tab.id
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {t(tab.labelAr, tab.labelEn)}
              </button>
            ))}
          </div>
        </div>

        {/* Spacious, Highly Readable Elements Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {filteredElements.map(el => {
            const currentCount = elementCounts[el.symbol] || 0;
            return (
              <div
                key={el.symbol}
                draggable
                onDragStart={e => handleDragStart(e, el.symbol)}
                onClick={() => handleAddElement(el.symbol)}
                className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all hover:scale-105 active:scale-95 group relative flex flex-col justify-between min-h-[110px] ${
                  currentCount > 0
                    ? isDark ? 'bg-slate-950 border-cyan-500 shadow-md ring-1 ring-cyan-500/50' : 'bg-cyan-50/80 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                    : isDark ? 'bg-slate-950/80 hover:bg-slate-800/90 border-slate-800' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {/* Header: Atomic Number & Group */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span className="font-bold">#{el.atomicNumber}</span>
                  <span title={t('إلكترونات التكافؤ', 'Valence Electrons')} className="text-slate-400">
                    {el.valenceElectrons}e⁻
                  </span>
                </div>

                {/* Center: Symbol with CPK Color Accent */}
                <div className="flex items-center justify-center my-1.5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-black text-white shadow-sm group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: el.colorHex === '#FFFFFF' ? '#475569' : el.colorHex }}
                  >
                    {el.symbol}
                  </div>
                </div>

                {/* Footer: Name & Valence */}
                <div className="text-center mt-1">
                  <span className="text-xs sm:text-sm font-bold block truncate text-slate-100">
                    {t(el.nameAr, el.nameEn)}
                  </span>
                  <span className="text-xs text-cyan-400 font-mono block mt-0.5">
                    {t('تكافؤ', 'Valence')} {el.primaryValence}
                  </span>
                </div>

                {/* Count Badge if Present */}
                {currentCount > 0 && (
                  <span className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-cyan-600 text-white font-mono text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-slate-900">
                    {currentCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
