import React, { useState, useEffect, useRef } from 'react';
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

  // Initialize or reset 100-nuclei grid
  const initSimulation = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsedCycles(0);
    const cells: DecayCell[] = [];
    for (let i = 0; i < 100; i++) {
      cells.push({ id: i, status: 'unstable', decayCycle: null });
    }
    setGridCells(cells);
    setHistoryPoints([{ cycle: 0, count: 100 }]);
  };

  useEffect(() => {
    initSimulation();
  }, [selectedIsotopeId]);

  // One half-life cycle step
  const tickCycle = () => {
    setGridCells(prev => {
      let anyChanged = false;
      const next = prev.map(cell => {
        if (cell.status === 'unstable') {
          // 50% probability of decay per half-life
          if (Math.random() < 0.5) {
            anyChanged = true;
            return { ...cell, status: 'stable' as const, decayCycle: elapsedCycles + 1 };
          }
        }
        return cell;
      });

      const unstableCount = next.filter(c => c.status === 'unstable').length;
      setHistoryPoints(h => [...h, { cycle: elapsedCycles + 1, count: unstableCount }]);
      setElapsedCycles(c => c + 1);

      if (unstableCount === 0) {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }

      return next;
    });
  };

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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, elapsedCycles]);

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
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.018;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Trail path
        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.7;
        ctx.setLineDash([2, 4]);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, p.x, p.y - 8);
      }

      singleAnimFrameRef.current = requestAnimationFrame(render);
    };

    singleAnimFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (singleAnimFrameRef.current) cancelAnimationFrame(singleAnimFrameRef.current);
    };
  }, [singleStatus, activeIsotope]);

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Isotope Selector & Nuclear Specs (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 gap-2">
              <h3 className="font-bold text-slate-200 text-base flex items-center gap-2">
                <span>اختر النظير المشع</span>
              </h3>
              <div className="flex items-center gap-1.5">
                {onOpenGuide && (
                  <button
                    onClick={onOpenGuide}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-all"
                    title="شرح عمر النصف والإشعاع"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>دليل عمر النصف</span>
                  </button>
                )}
                <Radiation className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Isotope Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold block">
                مكتبة النظائر الإشعاعية الموسعة (6 أمثلة واقعية):
              </label>
              <select
                value={selectedIsotopeId}
                onChange={(e) => setSelectedIsotopeId(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="carbon14">⚛️ الكربون-14 (تأريخ الحفريات، 5,730 سنة)</option>
                <option value="iodine131">🩺 اليود-131 (طب الغدة الدرقية، 8.02 أيام)</option>
                <option value="radon222">💨 الرادون-222 (غاز الصخور المشع، 3.82 أيام)</option>
                <option value="cesium137">☢️ السيزيوم-137 (المفاعلات والصناعة، 30.17 سنة)</option>
                <option value="cobalt60">🔬 الكوبالت-60 (التعقيم وسكين غاما، 5.27 سنة)</option>
                <option value="uranium238">🌋 اليورانيوم-238 (عمر الأرض، 4.468 مليار سنة)</option>
              </select>
            </div>

            {/* Specs Card */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block font-semibold">عمر النصف (T₁/₂)</span>
                  <span className="font-mono font-bold text-amber-400 text-sm mt-0.5 block">
                    {activeIsotope.halfLifeStr}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block font-semibold">نمط الاضمحلال</span>
                  <span className="font-bold text-red-400 text-xs mt-0.5 block truncate">
                    {activeIsotope.decayModeAr}
                  </span>
                </div>
              </div>

              {/* Nuclear Equation */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-400 text-[10px] block font-semibold mb-1">
                  معادلة التحول النووي (Transmutation):
                </span>
                <span className="font-mono font-black text-cyan-300 text-sm tracking-wide">
                  {activeIsotope.equation}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/60">
                <strong className="text-emerald-400">التطبيق العملي: </strong>
                {activeIsotope.practicalUse}
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
                  <span>{isPlaying ? 'إيقاف مؤقت' : 'بدء المحاكاة'}</span>
                </button>

                <button
                  onClick={tickCycle}
                  disabled={isPlaying || unstableCount === 0}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>خطوة (عمر نصف)</span>
                </button>
              </div>

              <button
                onClick={initSimulation}
                className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة تعيين 100 نواة مشعة</span>
              </button>
            </div>
          </div>

          {/* Single Nucleus Disintegration Experiment */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
            <h4 className="font-bold text-slate-200 text-sm flex items-center justify-between pb-2 border-b border-slate-800">
              <span>مختبر اضمحلال نواة مفردة</span>
              <Microscope className="w-4 h-4 text-cyan-400" />
            </h4>
            <p className="text-[11px] text-slate-400">
              انقر لإثارة نواة واحدة ومشاهدة تحللها اللحظي إلى النواة الابنة مع إطلاق الإشعاع:
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
                <span>إثارة النواة واضمحلالها</span>
              </button>

              <button
                onClick={resetSingleDecay}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                إعادة النواة الأصلية
              </button>
            </div>
          </div>
        </div>

        {/* Middle: 100 Nuclei Stochastic Grid (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 text-base">
                شبكة النوى المشعة (100 نواة)
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                الدورة: {elapsedCycles} ({realElapsedTime} {activeIsotope.timeUnit})
              </span>
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
                        ? `نواة ${activeIsotope.name} غير مستقرة`
                        : `نواة ${activeIsotope.daughterName} مستقرة ناتجة في الدورة ${cell.decayCycle}`
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

            {/* Live Percentages */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-xl">
                <span className="text-xs text-slate-400 block font-semibold mb-1">
                  النسبة المشعة المتبقية
                </span>
                <span className="font-mono text-2xl font-black text-red-400">
                  {unstableCount}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  {unstableCount} من 100 نواة
                </span>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl">
                <span className="text-xs text-slate-400 block font-semibold mb-1">
                  النسبة المستقرة المتكونة
                </span>
                <span className="font-mono text-2xl font-black text-emerald-400">
                  {stableCount}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  {stableCount} من 100 نواة
                </span>
              </div>
            </div>

            {/* Explanation on Stochastic Behavior */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <p>
                💡 <strong>الطبيعة الاحتمالية:</strong> تحلل أي نواة فردية محددة هو حدث كمي عشوائي تماماً لا يمكن التنبؤ بلحظة حدوثه بدقة. لكن عند اجتماع عدد كبير من النوى (كما في هذه المئة)، يظهر قانون نصف العمر الإحصائي الدقيق (كل دورة ينخفض العدد للنصف تقريباً).
              </p>
            </div>
          </div>
        </div>

        {/* Right: Exponential Decay Chart & Scientific Insights (Span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-slate-200 text-base pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>منحنى الاضمحلال الأسي</span>
              <TrendingDown className="w-4 h-4 text-cyan-400" />
            </h3>

            {/* Custom SVG Exponential Decay Chart */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
              <svg viewBox="0 0 240 140" className="w-full h-36 overflow-visible">
                {/* Axes */}
                <line x1="28" y1="10" x2="28" y2="120" stroke="#334155" strokeWidth="1.5" />
                <line x1="28" y1="120" x2="230" y2="120" stroke="#334155" strokeWidth="1.5" />

                {/* Grid horizontal ticks */}
                <line x1="25" y1="10" x2="28" y2="10" stroke="#64748b" />
                <text x="22" y="14" fill="#64748b" fontSize="8" textAnchor="end" fontFamily="IBM Plex Mono">100%</text>

                <line x1="25" y1="65" x2="28" y2="65" stroke="#64748b" />
                <text x="22" y="69" fill="#64748b" fontSize="8" textAnchor="end" fontFamily="IBM Plex Mono">50%</text>

                <line x1="25" y1="92" x2="28" y2="92" stroke="#64748b" />
                <text x="22" y="96" fill="#64748b" fontSize="8" textAnchor="end" fontFamily="IBM Plex Mono">25%</text>

                {/* Theoretical Curve (Dashed blue line) */}
                <path
                  d="M 28 10 Q 75 75, 125 98 T 225 118"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                {/* Simulated Data Points line */}
                {historyPoints.length > 1 && (
                  <path
                    d={historyPoints.map((pt, idx) => {
                      const maxCycles = Math.max(5, elapsedCycles);
                      const x = 28 + (pt.cycle / maxCycles) * (220 - 28);
                      const y = 120 - (pt.count / 100) * 110;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                  />
                )}

                {/* Points markers */}
                {historyPoints.map((pt) => {
                  const maxCycles = Math.max(5, elapsedCycles);
                  const x = 28 + (pt.cycle / maxCycles) * (220 - 28);
                  const y = 120 - (pt.count / 100) * 110;
                  return (
                    <circle
                      key={pt.cycle}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>

              <div className="w-full flex justify-between px-2 pt-1 text-[9px] text-slate-500 font-mono">
                <span>0 دورات</span>
                <span className="text-cyan-400">--- الخط النظري</span>
                <span className="text-red-400">━ المحاكاة الحية</span>
              </div>
            </div>

            {/* Educational Science Card */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-1.5">
              <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>عن {activeIsotope.name}:</span>
              </h5>
              <p>{activeIsotope.scienceDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
