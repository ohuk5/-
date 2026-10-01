import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Radiation,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Activity,
  Zap,
  Microscope,
  TrendingDown,
  Info,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { ISOTOPES, IsotopeInfo } from '../data/isotopesData';
import { useApp } from '../context/AppContext';

interface DecayCell {
  id: number;
  status: 'unstable' | 'stable';
  decayCycle: number | null;
}

interface EjectedParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  label: string;
  life: number;
}

interface RadioactiveDecayProps {
  onOpenGuide?: () => void;
}

export const RadioactiveDecay: React.FC<RadioactiveDecayProps> = ({ onOpenGuide }) => {
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';
  const [selectedIsotopeId, setSelectedIsotopeId] = useState<string>('carbon14');
  const [gridCells, setGridCells] = useState<DecayCell[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [elapsedCycles, setElapsedCycles] = useState<number>(0);
  const [historyPoints, setHistoryPoints] = useState<{ cycle: number; count: number }[]>([
    { cycle: 0, count: 100 }
  ]);

  // Single Nucleus Animation Lab
  const [singleStatus, setSingleStatus] = useState<'idle' | 'vibrating' | 'exploding' | 'decayed'>('idle');
  const singleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ejectedParticlesRef = useRef<EjectedParticle[]>([]);
  const vibrationIntensityRef = useRef<number>(0);
  const explosionTimeRef = useRef<number>(0);
  const singleAnimFrameRef = useRef<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const activeIsotope: IsotopeInfo = ISOTOPES[selectedIsotopeId] || ISOTOPES['carbon14'];

  // Keep references to prevent stale closures and duplicate cycle recordings
  const gridCellsRef = useRef<DecayCell[]>([]);
  const elapsedCyclesRef = useRef<number>(0);
  gridCellsRef.current = gridCells;
  elapsedCyclesRef.current = elapsedCycles;

  // Initialize or reset 100-nuclei grid
  const initSimulation = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    elapsedCyclesRef.current = 0;
    setElapsedCycles(0);
    const cells: DecayCell[] = [];
    for (let i = 0; i < 100; i++) {
      cells.push({ id: i, status: 'unstable', decayCycle: null });
    }
    gridCellsRef.current = cells;
    setGridCells(cells);
    setHistoryPoints([{ cycle: 0, count: 100 }]);
  }, []);

  useEffect(() => {
    initSimulation();
  }, [selectedIsotopeId, initSimulation]);

  // One half-life cycle step (Strictly prevents duplicate data points on the same cycle)
  const tickCycle = useCallback(() => {
    const currentCells = gridCellsRef.current;
    const currentCycle = elapsedCyclesRef.current;
    const nextCycle = currentCycle + 1;

    let newUnstable = 0;
    const nextCells = currentCells.map(cell => {
      if (cell.status === 'unstable') {
        // 50% probability of decay per half-life
        if (Math.random() < 0.5) {
          return { ...cell, status: 'stable' as const, decayCycle: nextCycle };
        }
        newUnstable++;
      }
      return cell;
    });

    gridCellsRef.current = nextCells;
    elapsedCyclesRef.current = nextCycle;

    setGridCells(nextCells);
    setElapsedCycles(nextCycle);

    // Guaranteed deduplication: ensure exactly ONE entry exists per cycle on X-axis
    setHistoryPoints(prev => {
      const filtered = prev.filter(pt => pt.cycle !== nextCycle);
      return [...filtered, { cycle: nextCycle, count: newUnstable }].sort((a, b) => a.cycle - b.cycle);
    });

    if (newUnstable === 0) {
      setIsPlaying(false);
    }
  }, []);

  // Play/Pause interval
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        tickCycle();
      }, 1600);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, tickCycle]);

  const unstableCount = gridCells.filter(c => c.status === 'unstable').length;
  const stableCount = 100 - unstableCount;
  const realElapsedTime = (elapsedCycles * activeIsotope.realHalfLife).toLocaleString();

  // Single Nucleus Experiment Animation Loop
  useEffect(() => {
    const canvas = singleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Background subtle grid
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y < h; y += 30) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      // Vibration step
      let vx = 0;
      let vy = 0;
      if (singleStatus === 'vibrating') {
        vibrationIntensityRef.current += 0.04;
        vx = (Math.random() - 0.5) * vibrationIntensityRef.current;
        vy = (Math.random() - 0.5) * vibrationIntensityRef.current;

        if (vibrationIntensityRef.current >= 5.5) {
          setSingleStatus('exploding');
          explosionTimeRef.current = 0;
          spawnEjectedParticles(cx, cy);
        }
      }

      const nx = cx + vx;
      const ny = cy + vy;

      // Draw Main Nucleus
      if (singleStatus === 'idle' || singleStatus === 'vibrating') {
        // Unstable Parent Nucleus
        const pGrad = ctx.createRadialGradient(nx - 6, ny - 6, 2, nx, ny, 35);
        pGrad.addColorStop(0, '#fca5a5');
        pGrad.addColorStop(0.4, '#ef4444');
        pGrad.addColorStop(1, '#7f1d1d');

        ctx.beginPath();
        ctx.arc(nx, ny, 32, 0, Math.PI * 2);
        ctx.fillStyle = pGrad;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
        ctx.shadowBlur = singleStatus === 'vibrating' ? 20 : 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(activeIsotope.symbol, nx, ny + 4);
      } else if (singleStatus === 'exploding') {
        explosionTimeRef.current += 0.045;
        const progress = explosionTimeRef.current;

        // Flash aura
        const flashRadius = 32 + progress * 55;
        const flashOpacity = Math.max(0, 1 - progress / 1.4);
        if (flashOpacity > 0) {
          const fGrad = ctx.createRadialGradient(nx, ny, 10, nx, ny, flashRadius);
          fGrad.addColorStop(0, '#ffffff');
          fGrad.addColorStop(0.3, 'rgba(251, 146, 60, 0.8)');
          fGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

          ctx.beginPath();
          ctx.arc(nx, ny, flashRadius, 0, Math.PI * 2);
          ctx.fillStyle = fGrad;
          ctx.fill();
        }

        // Emerging daughter nucleus
        const dGrad = ctx.createRadialGradient(nx - 6, ny - 6, 2, nx, ny, 32);
        dGrad.addColorStop(0, '#a7f3d0');
        dGrad.addColorStop(0.4, '#10b981');
        dGrad.addColorStop(1, '#064e3b');

        ctx.beginPath();
        ctx.arc(nx, ny, 30 * Math.min(1, progress), 0, Math.PI * 2);
        ctx.fillStyle = dGrad;
        ctx.fill();

        if (progress >= 1.4) {
          setSingleStatus('decayed');
          vibrationIntensityRef.current = 0;
        }
      } else if (singleStatus === 'decayed') {
        // Stable Daughter Nucleus
        const dGrad = ctx.createRadialGradient(nx - 6, ny - 6, 2, nx, ny, 32);
        dGrad.addColorStop(0, '#a7f3d0');
        dGrad.addColorStop(0.4, '#10b981');
        dGrad.addColorStop(1, '#064e3b');

        ctx.beginPath();
        ctx.arc(nx, ny, 30, 0, Math.PI * 2);
        ctx.fillStyle = dGrad;
        ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(activeIsotope.daughterSymbol, nx, ny + 4);
      }

      // Draw Ejected Particles (Alpha / Beta / Gamma)
      const particles = ejectedParticlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Decelerate and hold particle inside canvas bounds
        const distFromCenter = Math.sqrt((p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy));
        if (distFromCenter < 100) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94;
          p.vy *= 0.94;
        }

        // Clamp securely inside canvas
        p.x = Math.max(35, Math.min(w - 35, p.x));
        p.y = Math.max(28, Math.min(h - 22, p.y));

        // Trail path
        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label Tag Box
        ctx.font = 'bold 9px Cairo, sans-serif';
        ctx.textAlign = 'center';
        const labelW = ctx.measureText(p.label).width + 8;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(p.x - labelW / 2, p.y - 18, labelW, 13);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 0.8;
        ctx.strokeRect(p.x - labelW / 2, p.y - 18, labelW, 13);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(p.label, p.x, p.y - 8);
      }

      // Top Status Banner on Canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
      ctx.fillRect(6, 6, w - 12, 20);
      ctx.strokeStyle = singleStatus === 'decayed' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(6, 6, w - 12, 20);

      ctx.font = 'bold 9.5px Cairo, sans-serif';
      ctx.textAlign = 'center';
      if (singleStatus === 'idle' || singleStatus === 'vibrating') {
        ctx.fillStyle = '#f87171';
        ctx.fillText(
          lang === 'ar'
            ? `النواة الأم الأصلية غير المستقرة: ${activeIsotope.name} (${activeIsotope.symbol})`
            : `Unstable Parent Nucleus: ${activeIsotope.nameEn} (${activeIsotope.symbol})`,
          w / 2,
          20
        );
      } else {
        ctx.fillStyle = '#34d399';
        ctx.fillText(
          lang === 'ar'
            ? `تم التفكك ⬅️ تكونت: ${activeIsotope.daughterName} (${activeIsotope.daughterSymbol}) + انبعاث ${activeIsotope.decayModeAr}`
            : `Decayed ⬅️ Formed: ${activeIsotope.daughterNameEn} (${activeIsotope.daughterSymbol}) + ${activeIsotope.decayModeEn}`,
          w / 2,
          20
        );
      }

      singleAnimFrameRef.current = requestAnimationFrame(render);
    };

    singleAnimFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (singleAnimFrameRef.current) cancelAnimationFrame(singleAnimFrameRef.current);
    };
  }, [singleStatus, activeIsotope, lang]);

  const spawnEjectedParticles = (cx: number, cy: number) => {
    const list: EjectedParticle[] = [];

    if (activeIsotope.decayMode === 'alpha') {
      // Alpha particle (He-4 nucleus)
      const angle = (Math.random() - 0.5) * (Math.PI / 3);
      list.push({
        x: cx + 15,
        y: cy,
        vx: Math.cos(angle) * 4.2,
        vy: Math.sin(angle) * 4.2,
        size: 9,
        color: '#f97316',
        label: 'جسيم ألفا (⁴₂He²⁺)',
        life: 1.0
      });
    } else if (activeIsotope.decayMode === 'beta') {
      // Beta particle + Antineutrino
      const angle1 = -Math.PI / 6 + (Math.random() - 0.5) * 0.4;
      const angle2 = Math.PI / 4 + (Math.random() - 0.5) * 0.4;

      list.push({
        x: cx + 15,
        y: cy,
        vx: Math.cos(angle1) * 6.0,
        vy: Math.sin(angle1) * 6.0,
        size: 4.5,
        color: '#38bdf8',
        label: 'جسيم بيتا (e⁻)',
        life: 1.0
      });

      list.push({
        x: cx + 15,
        y: cy,
        vx: Math.cos(angle2) * 7.2,
        vy: Math.sin(angle2) * 7.2,
        size: 2.5,
        color: '#4ade80',
        label: 'ضديد نيوترينو (ν̄)',
        life: 0.9
      });
    } else {
      // Beta + Gamma photons
      const angle1 = -Math.PI / 4;
      const angle2 = Math.PI / 4;
      const angle3 = Math.PI / 10;

      list.push({
        x: cx + 15,
        y: cy,
        vx: Math.cos(angle1) * 6.0,
        vy: Math.sin(angle1) * 6.0,
        size: 4.5,
        color: '#38bdf8',
        label: 'جسيم بيتا (e⁻)',
        life: 1.0
      });

      list.push({
        x: cx + 15,
        y: cy,
        vx: Math.cos(angle2) * 8.0,
        vy: Math.sin(angle2) * 8.0,
        size: 6.0,
        color: '#eab308',
        label: 'أشعة غاما (γ)',
        life: 1.0
      });

      list.push({
        x: cx + 15,
        y: cy,
        vx: Math.cos(angle3) * 7.2,
        vy: Math.sin(angle3) * 7.2,
        size: 2.5,
        color: '#4ade80',
        label: 'ضديد نيوترينو (ν̄)',
        life: 0.85
      });
    }

    ejectedParticlesRef.current = list;
  };

  const triggerSingleDecay = () => {
    setSingleStatus('vibrating');
    vibrationIntensityRef.current = 1.0;
    ejectedParticlesRef.current = [];
  };

  const resetSingleDecay = () => {
    setSingleStatus('idle');
    vibrationIntensityRef.current = 0;
    ejectedParticlesRef.current = [];
  };

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      <div className="w-full flex flex-col md:flex-row gap-5 items-start overflow-x-hidden">
        {/* Left: Isotope Selector & Nuclear Specs */}
        <div className="w-full md:w-[320px] lg:w-[360px] shrink-0 flex flex-col gap-4 order-2 md:order-1">
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between pb-2 border-b gap-2 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                <span>{t('اختر النظير المشع', 'Select Radioactive Isotope')}</span>
              </h3>
              <div className="flex items-center gap-1.5">
                {onOpenGuide && (
                  <button
                    onClick={onOpenGuide}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                    title={t('شرح عمر النصف والإشعاع', 'Half-life & Radiation Guide')}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('دليل عمر النصف', 'Guide')}</span>
                  </button>
                )}
                <Radiation className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Isotope Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold block">
                {t(`مكتبة النظائر الإشعاعية الموسعة (${Object.keys(ISOTOPES).length} نظائر واقعية):`, `Radioactive Isotopes Library (${Object.keys(ISOTOPES).length} Real Isotopes):`)}
              </label>
              <select
                value={selectedIsotopeId}
                onChange={(e) => setSelectedIsotopeId(e.target.value)}
                className={`w-full py-2.5 px-3 border rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-emerald-500 cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                {Object.values(ISOTOPES).map(iso => (
                  <option key={iso.id} value={iso.id}>
                    {iso.symbol} {lang === 'ar' ? iso.name : iso.nameEn} ({lang === 'ar' ? iso.halfLifeStr : iso.halfLifeStrEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Specs Card */}
            <div className={`p-3.5 rounded-xl border space-y-2.5 text-xs ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className={`p-2 rounded-lg border ${
                  isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'
                }`}>
                  <span className="text-slate-400 text-[10px] block font-semibold">{t('عمر النصف (T₁/₂)', 'Half-Life (T₁/₂)')}</span>
                  <span className="font-mono font-bold text-amber-500 text-sm mt-0.5 block">
                    {lang === 'ar' ? activeIsotope.halfLifeStr : activeIsotope.halfLifeStrEn}
                  </span>
                </div>
                <div className={`p-2 rounded-lg border ${
                  isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'
                }`}>
                  <span className="text-slate-400 text-[10px] block font-semibold">{t('نمط الاضمحلال', 'Decay Mode')}</span>
                  <span className="font-bold text-red-400 text-xs mt-0.5 block truncate">
                    {lang === 'ar' ? activeIsotope.decayModeAr : activeIsotope.decayModeEn}
                  </span>
                </div>
              </div>

              {/* Nuclear Equation */}
              <div className={`p-2.5 rounded-lg border text-center ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <span className="text-slate-400 text-[10px] block font-semibold mb-1">
                  {t('معادلة التحول النووي (Transmutation):', 'Transmutation Nuclear Equation:')}
                </span>
                <span className="font-mono font-black text-cyan-400 text-sm tracking-wide">
                  {activeIsotope.equation}
                </span>
              </div>

              <div className={`text-[11px] leading-relaxed pt-1 border-t ${
                isDark ? 'text-slate-400 border-slate-800/60' : 'text-slate-600 border-slate-200'
              }`}>
                <strong className="text-emerald-500">{t('التطبيق العملي: ', 'Practical Application: ')}</strong>
                {lang === 'ar' ? activeIsotope.practicalUse : activeIsotope.practicalUseEn}
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? t('إيقاف مؤقت', 'Pause') : t('بدء المحاكاة', 'Start Simulation')}</span>
                </button>

                <button
                  onClick={tickCycle}
                  disabled={isPlaying || unstableCount === 0}
                  className={`py-2.5 px-3 disabled:opacity-40 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>{t('خطوة (عمر نصف)', 'Step (1 Half-life)')}</span>
                </button>
              </div>

              <button
                onClick={initSimulation}
                className={`w-full py-2 px-3 border rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isDark ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('إعادة تعيين 100 نواة مشعة', 'Reset 100 Nuclei')}</span>
              </button>
            </div>
          </div>

          {/* Single Nucleus Disintegration Experiment */}
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h4 className={`font-bold text-sm flex items-center justify-between pb-2 border-b ${
              isDark ? 'text-slate-200 border-slate-800' : 'text-slate-900 border-slate-200'
            }`}>
              <span>{t('مختبر اضمحلال نواة مفردة', 'Single Nucleus Chamber')}</span>
              <Microscope className="w-4 h-4 text-cyan-400" />
            </h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              {t('انقر لإثارة نواة واحدة ومشاهدة تحللها اللحظي إلى النواة الابنة مع إطلاق الإشعاع:', 'Click to trigger spontaneous single nucleus disintegration and emission:')}
            </p>

            {/* Canvas Box */}
            <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
              <canvas
                ref={singleCanvasRef}
                width={320}
                height={180}
                className="w-full h-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={triggerSingleDecay}
                disabled={singleStatus === 'vibrating' || singleStatus === 'exploding'}
                className="py-2 px-3 bg-red-950/40 hover:bg-red-900/40 border border-red-900/50 text-red-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{t('إثارة النواة واضمحلالها', 'Trigger Decay')}</span>
              </button>

              <button
                onClick={resetSingleDecay}
                className={`py-2 px-3 font-semibold text-xs rounded-xl transition-all ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                {t('إعادة النواة الأصلية', 'Restore Nucleus')}
              </button>
            </div>

            {/* Decayed Materials Breakdown Panel (تقرير بيان المواد التي تفككت والجسيمات الناتجة) */}
            <div className={`p-3.5 rounded-xl border space-y-2.5 text-xs ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('بيان المواد التي تفككت والتحول النووي:', 'Decayed Materials & Transmutation Breakdown:')}</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  singleStatus === 'decayed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {singleStatus === 'decayed' ? t('تم التفكك بنجاح', 'Decay Complete') : t('جاهزة للتفكك', 'Ready for Decay')}
                </span>
              </div>

              {/* Transformation Comparison Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {/* Parent Material */}
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 space-y-1">
                  <span className="text-[10px] font-bold text-red-400 block">{t('🔴 المادة الأصلية (Parent):', '🔴 Parent Isotope:')}</span>
                  <div className="font-bold text-white text-xs">{lang === 'ar' ? activeIsotope.name : activeIsotope.nameEn}</div>
                  <div className="font-mono text-cyan-300 font-bold">{activeIsotope.symbol}</div>
                  <div className="text-[10px] text-slate-400">
                    p⁺ = {activeIsotope.atomicNumber} | n⁰ = {activeIsotope.massNumber - activeIsotope.atomicNumber}
                  </div>
                  <div className="text-[9px] text-red-300 font-semibold">{t('نواة مشعة غير مستقرة', 'Radioactive')}</div>
                </div>

                {/* Daughter Material */}
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 block">{t('🟢 المادة الناتجة (Daughter):', '🟢 Daughter Isotope:')}</span>
                  <div className="font-bold text-white text-xs">{lang === 'ar' ? activeIsotope.daughterName : activeIsotope.daughterNameEn}</div>
                  <div className="font-mono text-emerald-300 font-bold">{activeIsotope.daughterSymbol}</div>
                  <div className="text-[10px] text-slate-400">
                    p⁺ = {activeIsotope.daughterAtomic} | n⁰ = {activeIsotope.daughterMass - activeIsotope.daughterAtomic}
                  </div>
                  <div className="text-[9px] text-emerald-300 font-semibold">{t('نواة وليدة مستقرة تماماً', 'Stable Daughter')}</div>
                </div>
              </div>

              {/* Emitted Radiation Particles */}
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{t('⚡ الإشعاع والجسيمات المنبعثة المقذوفة:', '⚡ Ejected Radiation & Quanta:')}</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-tight">
                  {lang === 'ar' ? activeIsotope.emittedParticleDesc : activeIsotope.emittedParticleDescEn}
                </p>
              </div>

              {/* Nuclear Equation */}
              <div className="p-2 rounded-lg bg-slate-900/90 border border-cyan-800/50 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400 text-[10px]">{t('المعادلة النووية:', 'Nuclear Eq:')}</span>
                <span className="text-cyan-300 font-extrabold tracking-wide">{activeIsotope.equation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Simulation Stage & Decay Curves */}
        <div className="w-full flex-1 min-w-0 flex flex-col lg:flex-row gap-5 order-1 md:order-2">
          {/* Middle: 100 Nuclei Stochastic Grid */}
          <div className="w-full lg:flex-1 flex flex-col gap-4">
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-base ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                {t('شبكة النوى المشعة (100 نواة)', 'Radioactive Grid (100 Nuclei)')}
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                {t('الدورة:', 'Cycle:')} {elapsedCycles} ({realElapsedTime} {t(activeIsotope.timeUnit, 'units')})
              </span>
            </div>

            {/* Live Dual-Material Composition Bar (شريط نسبة تحول المواد الحية) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-red-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500" />
                  <span>{lang === 'ar' ? activeIsotope.name : activeIsotope.nameEn} ({activeIsotope.symbol}): {unstableCount}%</span>
                </span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span>{lang === 'ar' ? activeIsotope.daughterName : activeIsotope.daughterNameEn} ({activeIsotope.daughterSymbol}): {stableCount}%</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${unstableCount}%` }}
                  title={`${unstableCount}% ${activeIsotope.name}`}
                />
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${stableCount}%` }}
                  title={`${stableCount}% ${activeIsotope.daughterName}`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span>{t('المادة المشعة الأصلية المتبقية', 'Remaining Parent Material')}</span>
                <span>{t('المادة المستقرة الناتجة عن التفكك', 'Transmuted Daughter Material')}</span>
              </div>
            </div>

            {/* 10x10 Grid of 100 atoms */}
            <div className="grid grid-cols-10 gap-1.5 sm:gap-2 p-3 sm:p-4 bg-slate-950 rounded-xl border border-slate-800">
              {gridCells.map((cell) => {
                const isUnstable = cell.status === 'unstable';
                return (
                  <div
                    key={cell.id}
                    title={
                      isUnstable
                        ? `${activeIsotope.name} (${activeIsotope.symbol}) ${t('لم تتفكك بعد', 'unstable')}`
                        : `${activeIsotope.daughterName} (${activeIsotope.daughterSymbol}) ${t('تفككت واستقرت في الدورة', 'stable formed in cycle')} ${cell.decayCycle}`
                    }
                    className={`aspect-square rounded-full transition-all duration-700 flex items-center justify-center ${
                      isUnstable
                        ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] border border-red-400'
                        : 'bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.4)] border border-emerald-400 scale-[0.92]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Live Percentages with Explicit Element Names */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-xl">
                <span className="text-xs text-red-300 block font-bold mb-1">
                  🔴 {lang === 'ar' ? activeIsotope.name : activeIsotope.nameEn} ({activeIsotope.symbol})
                </span>
                <span className="font-mono text-2xl font-black text-red-400">
                  {unstableCount}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                  {unstableCount} / 100 {t('ذرة لم تتفكك بعد', 'nuclei remaining')}
                </span>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl">
                <span className="text-xs text-emerald-300 block font-bold mb-1">
                  🟢 {lang === 'ar' ? activeIsotope.daughterName : activeIsotope.daughterNameEn} ({activeIsotope.daughterSymbol})
                </span>
                <span className="font-mono text-2xl font-black text-emerald-400">
                  {stableCount}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                  {stableCount} / 100 {t('ذرة تفككت وتحولت كلياً', 'daughters formed')}
                </span>
              </div>
            </div>

            {/* Accumulated Radiation Quanta Counter */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-amber-300 block">
                    {t('إجمالي الجسيمات الإشعاعية المنبعثة في الوسط:', 'Total Ejected Radioactive Particles:')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {lang === 'ar' ? activeIsotope.emittedParticleDesc : activeIsotope.emittedParticleDescEn}
                  </span>
                </div>
              </div>
              <span className="text-xl font-mono font-black text-amber-400 shrink-0">
                +{stableCount}
              </span>
            </div>

            {/* Explanation on Stochastic Behavior */}
            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
              isDark ? 'bg-slate-950/40 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <p>
                💡 <strong>{t('الطبيعة الاحتمالية:', 'Stochastic Nature:')}</strong> {t(
                  'تحلل أي نواة فردية محددة هو حدث كمي عشوائي تماماً لا يمكن التنبؤ بلحظة حدوثه بدقة. لكن عند اجتماع عدد كبير من النوى، يظهر قانون نصف العمر الإحصائي الدقيق.',
                  'Decay of an individual nucleus is completely random and unpredictable. With a large sample, the exact statistical half-life rule emerges.'
                )}
              </p>
            </div>
          </div>
        </div>

          {/* Right: Exponential Decay Chart & Scientific Insights */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`font-bold text-base pb-2 border-b flex items-center justify-between ${
              isDark ? 'text-slate-200 border-slate-800' : 'text-slate-900 border-slate-200'
            }`}>
              <span>{t('منحنى الاضمحلال الأسي', 'Decay Curve')}</span>
              <TrendingDown className="w-4 h-4 text-cyan-400" />
            </h3>

            {/* Custom SVG Exponential Decay Chart */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
              {(() => {
                const maxCycles = Math.max(5, elapsedCycles);
                const plotXStart = 40;
                const plotXEnd = 236;
                const plotYTop = 14;
                const plotYBottom = 118;
                const plotW = plotXEnd - plotXStart;
                const plotH = plotYBottom - plotYTop;

                // Mathematical theoretical curve: N(t) = 100 * (0.5)^t
                const theoreticalPath = Array.from({ length: 61 }, (_, i) => {
                  const t = (i / 60) * maxCycles;
                  const count = 100 * Math.pow(0.5, t);
                  const x = plotXStart + (t / maxCycles) * plotW;
                  const y = plotYBottom - (count / 100) * plotH;
                  return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
                }).join(' ');

                // Simulated line connecting points
                const simulationPath = historyPoints.length > 1
                  ? historyPoints.map((pt, idx) => {
                      const x = plotXStart + (pt.cycle / maxCycles) * plotW;
                      const y = plotYBottom - (pt.count / 100) * plotH;
                      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
                    }).join(' ')
                  : '';

                return (
                  <svg viewBox="0 0 250 145" className="w-full h-36 overflow-visible">
                    {/* Background horizontal dashed guides */}
                    <line x1={plotXStart} y1="14" x2={plotXEnd} y2="14" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1={plotXStart} y1="66" x2={plotXEnd} y2="66" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1={plotXStart} y1="92" x2={plotXEnd} y2="92" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />

                    {/* Axes lines */}
                    <line x1={plotXStart} y1="10" x2={plotXStart} y2={plotYBottom} stroke="#334155" strokeWidth="1.5" />
                    <line x1={plotXStart} y1={plotYBottom} x2={plotXEnd} y2={plotYBottom} stroke="#334155" strokeWidth="1.5" />

                    {/* Y-axis Ticks & Unclipped Percentage Labels */}
                    <line x1={plotXStart - 4} y1="14" x2={plotXStart} y2="14" stroke="#64748b" strokeWidth="1.2" />
                    <text x={plotXStart - 6} y="17" fill="#64748b" fontSize="8" textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontWeight="600">100%</text>

                    <line x1={plotXStart - 4} y1="66" x2={plotXStart} y2="66" stroke="#64748b" strokeWidth="1.2" />
                    <text x={plotXStart - 6} y="69" fill="#64748b" fontSize="8" textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontWeight="600">50%</text>

                    <line x1={plotXStart - 4} y1="92" x2={plotXStart} y2="92" stroke="#64748b" strokeWidth="1.2" />
                    <text x={plotXStart - 6} y="95" fill="#64748b" fontSize="8" textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontWeight="600">25%</text>

                    <line x1={plotXStart - 4} y1={plotYBottom} x2={plotXStart} y2={plotYBottom} stroke="#64748b" strokeWidth="1.2" />
                    <text x={plotXStart - 6} y={plotYBottom + 3} fill="#64748b" fontSize="8" textAnchor="end" fontFamily="IBM Plex Mono, monospace" fontWeight="600">0%</text>

                    {/* X-axis Ticks & Integer Cycle Numbers */}
                    {Array.from({ length: maxCycles + 1 }, (_, c) => {
                      const x = plotXStart + (c / maxCycles) * plotW;
                      return (
                        <g key={c}>
                          <line x1={x} y1={plotYBottom} x2={x} y2={plotYBottom + 3.5} stroke="#475569" strokeWidth="1" />
                          <text
                            x={x}
                            y={plotYBottom + 13}
                            fill="#64748b"
                            fontSize="7.5"
                            textAnchor="middle"
                            fontFamily="IBM Plex Mono, monospace"
                          >
                            {c}
                          </text>
                        </g>
                      );
                    })}

                    {/* Exact Theoretical Curve: N(t) = 100 * (0.5)^t */}
                    <path
                      d={theoreticalPath}
                      fill="none"
                      stroke="rgba(56, 189, 248, 0.75)"
                      strokeWidth="1.75"
                      strokeDasharray="4 3"
                    />

                    {/* Simulated Data Points line */}
                    {simulationPath && (
                      <path
                        d={simulationPath}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Simulated Data Points markers */}
                    {historyPoints.map((pt) => {
                      const x = plotXStart + (pt.cycle / maxCycles) * plotW;
                      const y = plotYBottom - (pt.count / 100) * plotH;
                      return (
                        <circle
                          key={pt.cycle}
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill="#ef4444"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                  </svg>
                );
              })()}

              <div className="w-full flex items-center justify-between px-2 pt-2 text-[10px] font-mono border-t border-slate-900 mt-1">
                <span className="text-slate-400">⏱️ {t('الدورات (t)', 'Cycles (t)')}</span>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 flex items-center gap-1.5">
                    <span className="inline-block w-4 border-b-2 border-dashed border-cyan-400" />
                    <span>{t('الخط النظري N(t)', 'Theory N(t)')}</span>
                  </span>
                  <span className="text-red-400 flex items-center gap-1.5 font-bold">
                    <span className="inline-block w-3.5 h-1 bg-red-500 rounded-full" />
                    <span>{t('المحاكاة الحية', 'Simulation')}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Educational Science Card */}
            <div className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
              isDark ? 'bg-slate-950/40 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <h5 className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>{lang === 'ar' ? `عن ${activeIsotope.name}:` : `About ${activeIsotope.nameEn}:`}</span>
              </h5>
              <p>{lang === 'ar' ? activeIsotope.scienceDesc : activeIsotope.scienceDescEn}</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
