import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  Droplet,
  Activity,
  Sparkles,
  Info,
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { playLabSound } from '../utils/soundEffects';
import { useApp } from '../context/AppContext';

interface TitrationPoint {
  volumeAdded: number;
  ph: number;
}

interface BuretteTitrationModuleProps {
  onClose?: () => void;
  soundEnabled?: boolean;
}

export const BuretteTitrationModule: React.FC<BuretteTitrationModuleProps> = ({
  soundEnabled = true
}) => {
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';
  // Titration chemical system selection
  const [systemType, setSystemType] = useState<'strong_strong' | 'weak_strong'>('strong_strong');
  // Indicator selection
  const [indicator, setIndicator] = useState<'phenolphthalein' | 'universal' | 'none'>('phenolphthalein');

  // Burette physical state
  const [buretteVolume, setBuretteVolume] = useState<number>(50.0); // Starts at 50 mL mark (full)
  const [volumeDispensed, setVolumeDispensed] = useState<number>(0.0);
  const [flowMode, setFlowMode] = useState<'closed' | 'single' | 'fast' | 'stream'>('closed');
  const [isStirring, setIsStirring] = useState<boolean>(true);
  const [probeImmersed, setProbeImmersed] = useState<boolean>(true);

  // Droplet visual animation state
  const [isDripping, setIsDripping] = useState<boolean>(false);
  const [dropKey, setDropKey] = useState<number>(0);

  // Data history for titration curve
  const [curveData, setCurveData] = useState<TitrationPoint[]>([{ volumeAdded: 0, ph: 1.0 }]);

  // Initial flask parameters
  // 25.0 mL of 0.1 M Acid (HCl for strong, CH3COOH for weak with pKa = 4.76)
  // Titrant is 0.1 M NaOH
  const analyteVolume = 25.0; // mL
  const analyteMolarity = 0.1; // M
  const titrantMolarity = 0.1; // M

  // Physics calculation of current pH based on volume of NaOH dispensed
  const calculateCurrentPh = (vAdded: number): number => {
    const vTotal = analyteVolume + vAdded;
    const molesAcidInitial = (analyteVolume / 1000) * analyteMolarity;
    const molesBaseAdded = (vAdded / 1000) * titrantMolarity;

    if (systemType === 'strong_strong') {
      // Strong Acid (HCl) + Strong Base (NaOH)
      if (molesBaseAdded < molesAcidInitial - 1e-7) {
        // Excess H+
        const excessMolesH = molesAcidInitial - molesBaseAdded;
        const concH = excessMolesH / (vTotal / 1000);
        return Math.max(1.0, Math.min(6.5, -Math.log10(concH)));
      } else if (Math.abs(molesBaseAdded - molesAcidInitial) <= 1e-7) {
        // Equivalence point
        return 7.0;
      } else {
        // Excess OH-
        const excessMolesOH = molesBaseAdded - molesAcidInitial;
        const concOH = excessMolesOH / (vTotal / 1000);
        const pOH = -Math.log10(concOH);
        return Math.min(13.0, Math.max(7.5, 14.0 - pOH));
      }
    } else {
      // Weak Acid (CH3COOH, pKa=4.76) + Strong Base (NaOH)
      const pKa = 4.76;
      if (vAdded === 0) {
        // Pure 0.1M CH3COOH: [H+] = sqrt(Ka * C)
        const Ka = Math.pow(10, -pKa);
        const concH = Math.sqrt(Ka * analyteMolarity);
        return -Math.log10(concH); // ~2.88
      } else if (molesBaseAdded < molesAcidInitial - 1e-7) {
        // Buffer zone: Henderson-Hasselbalch
        const molesAminus = molesBaseAdded;
        const molesHA = molesAcidInitial - molesBaseAdded;
        const ratio = molesAminus / molesHA;
        return Math.max(2.88, Math.min(8.0, pKa + Math.log10(ratio)));
      } else if (Math.abs(molesBaseAdded - molesAcidInitial) <= 1e-7) {
        // Equivalence: hydrolysis of acetate ion (mildly alkaline ~ 8.72)
        return 8.72;
      } else {
        // Post-equivalence: excess strong base dominates
        const excessMolesOH = molesBaseAdded - molesAcidInitial;
        const concOH = excessMolesOH / (vTotal / 1000);
        const pOH = -Math.log10(concOH);
        return Math.min(13.0, 14.0 - pOH);
      }
    }
  };

  const currentPh = calculateCurrentPh(volumeDispensed);

  // Indicator color calculation based on pH
  const getSolutionColor = (): { color: string; label: string; textClass: string } => {
    if (indicator === 'none') {
      return {
        color: 'rgba(224, 242, 254, 0.45)',
        label: t('محلول شفاف عديم اللون', 'Clear Colorless Solution'),
        textClass: isDark ? 'text-slate-300' : 'text-slate-700'
      };
    }

    if (indicator === 'phenolphthalein') {
      if (currentPh < 8.2) {
        return {
          color: 'rgba(224, 242, 254, 0.45)',
          label: t('عديم اللون (وسط حمضي / متعادل)', 'Colorless (Acidic / Neutral)'),
          textClass: isDark ? 'text-slate-300' : 'text-slate-700'
        };
      } else if (currentPh >= 8.2 && currentPh < 9.5) {
        // Transition pale pink
        const intensity = (currentPh - 8.2) / 1.3;
        return {
          color: `rgba(244, 114, 182, ${0.35 + intensity * 0.45})`,
          label: t('وردي باهت (نقطة التكافؤ / بداية القلوية)', 'Pale Pink (Equivalence Point / Endpoint)'),
          textClass: isDark ? 'text-pink-400 font-semibold' : 'text-pink-600 font-semibold'
        };
      } else {
        // Vivid fuchsia pink
        return {
          color: 'rgba(236, 72, 153, 0.85)',
          label: t('وردي أرجواني ساطع (وسط قلوي قوي)', 'Vivid Fuchsia Pink (Excess Alkaline Base)'),
          textClass: isDark ? 'text-pink-400 font-bold' : 'text-pink-600 font-bold'
        };
      }
    }

    // Universal indicator color spectrum
    if (currentPh <= 3.0) {
      return {
        color: 'rgba(239, 68, 68, 0.75)',
        label: t('أحمر قرمزي (حمض قوي pH ≤ 3)', 'Crimson Red (Strong Acid pH ≤ 3)'),
        textClass: isDark ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold'
      };
    } else if (currentPh <= 5.5) {
      return {
        color: 'rgba(249, 115, 22, 0.75)',
        label: t('برتقالي (حمض معتدل)', 'Orange (Moderate Acid)'),
        textClass: isDark ? 'text-orange-400 font-semibold' : 'text-orange-600 font-semibold'
      };
    } else if (currentPh <= 6.8) {
      return {
        color: 'rgba(234, 179, 8, 0.75)',
        label: t('أصفر كهرماني (حمض خفيف)', 'Amber Yellow (Weak Acid)'),
        textClass: isDark ? 'text-amber-400 font-semibold' : 'text-amber-600 font-semibold'
      };
    } else if (currentPh <= 7.4) {
      return {
        color: 'rgba(34, 197, 94, 0.8)',
        label: t('أخضر عشبي (وسط متعادل تماماً pH 7)', 'Green (Completely Neutral pH 7)'),
        textClass: isDark ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold'
      };
    } else if (currentPh <= 9.0) {
      return {
        color: 'rgba(6, 182, 212, 0.75)',
        label: t('سماوي مزرق (قاعدة خفيفة)', 'Cyan (Mild Base)'),
        textClass: isDark ? 'text-cyan-400 font-semibold' : 'text-cyan-600 font-semibold'
      };
    } else if (currentPh <= 11.5) {
      return {
        color: 'rgba(59, 130, 246, 0.8)',
        label: t('أزرق داكن (قاعدة متوسطة)', 'Deep Blue (Moderate Base)'),
        textClass: isDark ? 'text-blue-400 font-semibold' : 'text-blue-600 font-semibold'
      };
    } else {
      return {
        color: 'rgba(168, 85, 247, 0.85)',
        label: t('أرجواني بنفسجي (قاعدة قوية)', 'Purple Violet (Strong Base)'),
        textClass: isDark ? 'text-purple-400 font-bold' : 'text-purple-600 font-bold'
      };
    }
  };

  const solutionStyle = getSolutionColor();

  // Dispensing timer loop
  useEffect(() => {
    if (flowMode === 'closed' || buretteVolume <= 0) return;

    const intervalTime = flowMode === 'single' ? 1200 : flowMode === 'fast' ? 300 : 90;
    const dispenseAmount = flowMode === 'single' ? 0.05 : flowMode === 'fast' ? 0.15 : 0.4;

    const timer = setInterval(() => {
      setBuretteVolume((prevB) => {
        if (prevB <= 0.05) {
          setFlowMode('closed');
          return 0;
        }
        const actualDispense = Math.min(prevB, dispenseAmount);
        const newB = Number((prevB - actualDispense).toFixed(2));
        const newAdded = Number((volumeDispensed + actualDispense).toFixed(2));

        setVolumeDispensed(newAdded);
        setIsDripping(true);
        setDropKey((k) => k + 1);

        if (soundEnabled) {
          playLabSound('drop');
        }

        const newPh = calculateCurrentPh(newAdded);
        setCurveData((prevData) => {
          // Avoid duplicate points
          const lastPoint = prevData[prevData.length - 1];
          if (lastPoint && Math.abs(lastPoint.volumeAdded - newAdded) < 0.1) {
            return prevData;
          }
          return [...prevData, { volumeAdded: newAdded, ph: Number(newPh.toFixed(2)) }];
        });

        return newB;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [flowMode, buretteVolume, volumeDispensed, systemType, soundEnabled]);

  // Handle single manual drop button
  const handleDispenseSingleDrop = () => {
    if (buretteVolume <= 0) return;
    const actualDispense = 0.05;
    const newB = Number((buretteVolume - actualDispense).toFixed(2));
    const newAdded = Number((volumeDispensed + actualDispense).toFixed(2));

    setBuretteVolume(newB);
    setVolumeDispensed(newAdded);
    setIsDripping(true);
    setDropKey((k) => k + 1);

    if (soundEnabled) {
      playLabSound('drop');
    }

    const newPh = calculateCurrentPh(newAdded);
    setCurveData((prev) => [...prev, { volumeAdded: newAdded, ph: Number(newPh.toFixed(2)) }]);
  };

  // Reset titration experiment
  const handleReset = () => {
    setBuretteVolume(50.0);
    setVolumeDispensed(0.0);
    setFlowMode('closed');
    const initPh = calculateCurrentPh(0);
    setCurveData([{ volumeAdded: 0, ph: Number(initPh.toFixed(2)) }]);
    if (soundEnabled) {
      playLabSound('click');
    }
  };

  return (
    <div className={`rounded-2xl p-4 md:p-6 shadow-xl space-y-6 border transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Top Header & Instrument Info */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('محطة المعايرة الحجمية ومقياس الحموضة (Burette Titration)', 'Burette Titration & Digital pH Meter')}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {t(
              'محاكاة دقيقة وفق معايير PhET: تحكم بصنبور السحاحة، راقب منحنى المعايرة، وتتبع تغيرات الأس الهيدروجيني والكواشف.',
              'PhET-style precision simulation: control burette stopcock valve, plot real-time titration curve, and observe pH indicator changes.'
            )}
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
            {t('إعادة تعيين المعايرة', 'Reset Titration')}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Apparatus Stage vs Curve & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Burette & Flask Stage (7 cols) */}
        <div className={`lg:col-span-7 rounded-xl border p-5 flex flex-col items-center justify-between min-h-[520px] relative overflow-hidden ${
          isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Subtle laboratory tile grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

          {/* Upper Stage: Burette Top Clamps & Volume Scale */}
          <div className="w-full flex items-start justify-between relative z-10 px-4">
            {/* Titrant Bottle Indicator */}
            <div className={`border rounded-lg p-2.5 text-xs space-y-1 shadow-xs ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <span className="text-slate-400 block font-medium">
                {t('المحلول في السحاحة:', 'Titrant Solution in Burette:')}
              </span>
              <span className="font-mono text-cyan-500 font-bold block text-sm">
                NaOH (0.100 M)
              </span>
              <span className="text-slate-400 text-[11px] block">
                {t('الحجم المتبقي:', 'Remaining Volume:')}{' '}
                <strong className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{buretteVolume.toFixed(2)} mL</strong>
              </span>
            </div>

            {/* pH Meter Digital Display Box */}
            <div className={`border rounded-xl p-3 shadow-lg flex flex-col items-center text-center ${
              isDark ? 'bg-slate-900/90 border-cyan-500/30' : 'bg-white border-cyan-500/40'
            }`}>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                {t('مقياس الرقم الهيدروجيني pH', 'Digital pH Meter')}
              </span>
              <div className="mt-1 px-4 py-1.5 rounded bg-black/90 border border-cyan-500/40 text-cyan-400 font-mono text-2xl font-bold tracking-widest shadow-inner tabular-nums">
                {probeImmersed ? currentPh.toFixed(2) : '---'}
              </div>
              <button
                onClick={() => setProbeImmersed(!probeImmersed)}
                className={`mt-2 text-[11px] px-2.5 py-1 rounded transition-colors font-medium ${
                  probeImmersed
                    ? isDark ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                    : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {probeImmersed ? t('القطب مغمور في المحلول ✓', 'Electrode Immersed ✓') : t('انقر لغمر القطب في الدورق', 'Click to Dip Electrode')}
              </button>
            </div>
          </div>

          {/* Center Stage: Iron Stand, Burette Glass Column, Stopcock Valve & Erlenmeyer Flask */}
          <div className="relative w-full flex items-center justify-center my-2 h-[380px]">
            {/* Iron Ring Stand Base & Rod */}
            <div className="absolute right-[48%] top-0 bottom-2 w-2.5 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 rounded-full shadow-lg" />
            <div className="absolute right-[32%] bottom-1 w-44 h-4 bg-gradient-to-t from-slate-800 to-slate-700 rounded-md border-t border-slate-600 shadow-md" />

            {/* Burette Glass Column */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Burette Tube */}
              <div className="w-7 h-[200px] bg-gradient-to-r from-cyan-200/10 via-cyan-100/5 to-cyan-300/15 border-x-2 border-cyan-400/40 rounded-t-sm relative overflow-hidden backdrop-blur-[1px] shadow-sm">
                {/* Liquid Level Inside Burette */}
                <div
                  className="absolute bottom-0 inset-x-0 bg-cyan-400/35 transition-all duration-300 border-t border-cyan-300"
                  style={{ height: `${(buretteVolume / 50.0) * 100}%` }}
                >
                  {/* Subtle liquid meniscus curve */}
                  <div className="w-full h-1 bg-cyan-300/70 rounded-full" />
                </div>

                {/* Milliliter tick markings */}
                <div className="absolute inset-y-0 right-0 w-2 flex flex-col justify-between py-1 text-[8px] text-cyan-300/60 font-mono select-none pointer-events-none">
                  <span>0</span>
                  <span>10</span>
                  <span>20</span>
                  <span>30</span>
                  <span>40</span>
                  <span>50</span>
                </div>
              </div>

              {/* Stopcock Joint & Rotating Valve */}
              <div className="relative my-0.5 flex items-center justify-center">
                {/* Glass funnel tip */}
                <div className="w-3 h-4 bg-cyan-400/30 border-x border-cyan-400/50 clip-funnel" />

                {/* Valve Handle */}
                <div
                  onClick={() => {
                    const nextMode =
                      flowMode === 'closed'
                        ? 'single'
                        : flowMode === 'single'
                        ? 'fast'
                        : flowMode === 'fast'
                        ? 'stream'
                        : 'closed';
                    setFlowMode(nextMode);
                  }}
                  className={`absolute -right-7 cursor-pointer px-2 py-0.5 text-[10px] font-bold rounded shadow transition-all duration-200 select-none ${
                    flowMode === 'closed'
                      ? 'bg-red-900/90 text-red-200 border border-red-700'
                      : flowMode === 'single'
                      ? 'bg-amber-800 text-amber-200 border border-amber-600'
                      : flowMode === 'fast'
                      ? 'bg-emerald-800 text-emerald-100 border border-emerald-600'
                      : 'bg-cyan-800 text-cyan-100 border border-cyan-500 animate-pulse'
                  }`}
                  title="انقر لتدوير صنبور السحاحة"
                >
                  {flowMode === 'closed'
                    ? 'مغلق ✕'
                    : flowMode === 'single'
                    ? 'قطرة واحدة'
                    : flowMode === 'fast'
                    ? 'تقطير سريع'
                    : 'تدفق مستمر'}
                </div>
              </div>

              {/* Burette Fine Needle Tip */}
              <div className="w-1.5 h-6 bg-cyan-400/40 border-x border-cyan-400/60 rounded-b-full relative">
                {/* Animated Falling Droplet */}
                {isDripping && (
                  <div
                    key={dropKey}
                    className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2.5 bg-cyan-300 rounded-full animate-ping opacity-90"
                  />
                )}
              </div>

              {/* Erlenmeyer Flask Below Burette */}
              <div className="relative mt-2 w-32 h-36 flex flex-col items-center">
                {/* Flask Neck */}
                <div className="w-10 h-10 border-x-2 border-slate-400/50 bg-white/5 relative z-10" />

                {/* Flask Conical Body */}
                <div className="w-32 h-24 relative overflow-hidden border-2 border-slate-400/60 rounded-b-2xl bg-gradient-to-b from-white/10 to-white/5 shadow-2xl backdrop-blur-[2px]">
                  {/* Liquid inside Erlenmeyer */}
                  <div
                    className="absolute bottom-0 inset-x-0 transition-all duration-500 border-t"
                    style={{
                      height: `${Math.min(92, 35 + (volumeDispensed / 50.0) * 45)}%`,
                      backgroundColor: solutionStyle.color,
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    {/* Magnetic stirring vortex animation */}
                    {isStirring && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                      </div>
                    )}
                    {/* Magnetic Stirring Flea (bar) at bottom */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-white rounded-full shadow-sm" />
                  </div>

                  {/* Volume level ticks */}
                  <div className="absolute left-1.5 top-6 bottom-4 flex flex-col justify-between text-[7px] text-slate-400/70 font-mono select-none">
                    <span>- 75 mL</span>
                    <span>- 50 mL</span>
                    <span>- 25 mL</span>
                  </div>
                </div>

                {/* Glassware reflection highlights */}
                <div className="absolute top-10 left-3 w-1.5 h-16 bg-white/25 rounded-full blur-[0.5px] pointer-events-none" />

                {/* pH Electrode Probe Dipping Into Flask */}
                {probeImmersed && (
                  <div className="absolute top-1 right-8 w-2 h-28 bg-gradient-to-b from-slate-700 via-slate-600 to-amber-200/90 rounded-b-full shadow-md z-20 pointer-events-none">
                    {/* Glass bulb tip */}
                    <div className="absolute bottom-0 inset-x-0 h-4 bg-amber-400/80 rounded-full border border-amber-300" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lower Stage: Magnetic Stirrer Plate & Solution Status Bar */}
          <div className={`w-full border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 relative z-10 text-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium">
                {t('حالة المحلول في الدورق:', 'Flask Solution State:')}
              </span>
              <span className={`px-2.5 py-1 rounded-md ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'} ${solutionStyle.textClass}`}>
                {solutionStyle.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                {t('الحجم الإجمالي في الدورق:', 'Total Volume:')}{' '}
                <strong className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {(analyteVolume + volumeDispensed).toFixed(2)} mL
                </strong>
              </span>

              <button
                onClick={() => setIsStirring(!isStirring)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  isStirring
                    ? isDark ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                    : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {isStirring ? t('التحريك المغناطيسي: يعمل ⟳', 'Stirring: Active ⟳') : t('تشغيل المحرك المغناطيسي', 'Start Stirrer')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Controls, pH Graph & Settings (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Quick Flow Rate Buttons */}
          <div className={`rounded-xl border p-4 space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sliders className="w-4 h-4 text-cyan-500" />
              {t('التحكم في سكب السحاحة (Burette Flow)', 'Burette Stopcock & Flow Controls')}
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDispenseSingleDrop}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                  isDark
                    ? 'bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 border-cyan-700'
                    : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                }`}
              >
                <Droplet className="w-3.5 h-3.5 text-cyan-500" />
                {t('إسقاط قطرة واحدة (0.05 mL)', 'Single Drop (0.05 mL)')}
              </button>

              <button
                onClick={() => setFlowMode(flowMode === 'single' ? 'closed' : 'single')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  flowMode === 'single'
                    ? 'bg-amber-600 text-white font-bold'
                    : isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                {flowMode === 'single' ? t('إيقاف التقطير', 'Stop Drips') : t('تقطير بطيء مستمر', 'Slow Drip')}
              </button>

              <button
                onClick={() => setFlowMode(flowMode === 'fast' ? 'closed' : 'fast')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  flowMode === 'fast'
                    ? 'bg-emerald-600 text-white font-bold'
                    : isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                {flowMode === 'fast' ? t('إيقاف التدفق', 'Stop Flow') : t('تقطير سريع', 'Fast Drip')}
              </button>

              <button
                onClick={() => setFlowMode('closed')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                  isDark
                    ? 'bg-red-950/60 hover:bg-red-900/80 text-red-300 border-red-800'
                    : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
                }`}
              >
                <Pause className="w-3.5 h-3.5 text-red-500" />
                {t('إغلاق الصنبور فوراً', 'Close Valve')}
              </button>
            </div>
          </div>

          {/* System Selection & Indicator Options */}
          <div className={`rounded-xl border p-4 space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-4 h-4 text-cyan-500" />
              {t('اختيار نوع المحلول والكاشف الكيميائي', 'Reaction System & Chemical Indicator')}
            </h4>

            {/* Reaction System */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 block font-medium">
                {t('نوع المعايرة:', 'Titration Type:')}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSystemType('strong_strong');
                    handleReset();
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-start transition-all ${
                    systemType === 'strong_strong'
                      ? isDark
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-sm'
                        : 'bg-cyan-100 border-cyan-500 text-cyan-900 shadow-sm'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <strong className={`block font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('حمض قوي + قاعدة قوية', 'Strong Acid + Strong Base')}
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    {t('HCl مع NaOH (نقطة التكافؤ pH 7)', 'HCl + NaOH (Equivalence pH 7.0)')}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSystemType('weak_strong');
                    handleReset();
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-start transition-all ${
                    systemType === 'weak_strong'
                      ? isDark
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-sm'
                        : 'bg-cyan-100 border-cyan-500 text-cyan-900 shadow-sm'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <strong className={`block font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('حمض ضعيف + قاعدة قوية', 'Weak Acid + Strong Base')}
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    {t('CH₃COOH مع NaOH (تكافؤ pH 8.7)', 'CH₃COOH + NaOH (Equivalence pH 8.7)')}
                  </span>
                </button>
              </div>
            </div>

            {/* Indicator Select */}
            <div className={`space-y-1.5 text-xs pt-2 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
              <span className="text-slate-400 block font-medium">
                {t('كاشف الدليل الكيميائي:', 'pH Indicator:')}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setIndicator('phenolphthalein')}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium border transition-colors ${
                    indicator === 'phenolphthalein'
                      ? 'bg-pink-600 border-pink-400 text-white font-bold'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('الفينولفثالين', 'Phenolphthalein')}
                </button>

                <button
                  onClick={() => setIndicator('universal')}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium border transition-colors ${
                    indicator === 'universal'
                      ? 'bg-emerald-600 border-emerald-400 text-white font-bold'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('الكاشف الشامل', 'Universal Indicator')}
                </button>

                <button
                  onClick={() => setIndicator('none')}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium border transition-colors ${
                    indicator === 'none'
                      ? 'bg-slate-700 border-slate-500 text-white font-bold'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('بدون كاشف', 'No Indicator')}
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Titration Curve Graph (SVG Plot) */}
          <div className={`rounded-xl border p-4 space-y-2 flex-1 flex flex-col justify-between ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Activity className="w-3.5 h-3.5 text-cyan-500" />
                {t('منحنى المعايرة المباشر (Titration Curve)', 'Real-Time Titration Curve')}
              </span>
              <span className="text-[11px] font-mono text-cyan-500 font-bold">
                V = {volumeDispensed.toFixed(1)} mL | pH = {currentPh.toFixed(2)}
              </span>
            </div>

            {/* SVG Coordinate Grid */}
            <div className={`w-full h-44 rounded-lg border p-2 relative ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-inner'
            }`}>
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 130">
                {/* Y-axis guidelines (pH 0, 7, 14) */}
                <line x1="25" y1="10" x2="290" y2="10" stroke={isDark ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />
                <line x1="25" y1="65" x2="290" y2="65" stroke="#38bdf8" strokeDasharray="3 3" opacity="0.6" />
                <line x1="25" y1="120" x2="290" y2="120" stroke={isDark ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />

                {/* Y-axis labels */}
                <text x="18" y="14" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">
                  14
                </text>
                <text x="18" y="68" fill="#38bdf8" fontSize="8" textAnchor="end" fontFamily="monospace">
                  7
                </text>
                <text x="18" y="122" fill="#94a3b8" fontSize="8" textAnchor="end" fontFamily="monospace">
                  0
                </text>

                {/* X-axis Equivalence mark (V = 25 mL) */}
                <line x1="157" y1="10" x2="157" y2="120" stroke="#f59e0b" strokeDasharray="2 2" opacity="0.7" />
                <text x="157" y="128" fill="#f59e0b" fontSize="8" textAnchor="middle" fontFamily="monospace">
                  25 mL
                </text>

                {/* Real-time plotted polyline */}
                {curveData.length > 1 && (
                  <path
                    d={curveData
                      .map((pt, idx) => {
                        // X mapping: 0 to 50 mL -> 25 to 290 px
                        const x = 25 + (Math.min(50, pt.volumeAdded) / 50.0) * (290 - 25);
                        // Y mapping: pH 0 to 14 -> 120 to 10 px
                        const y = 120 - (Math.min(14, Math.max(0, pt.ph)) / 14.0) * (120 - 10);
                        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Current Point Dot */}
                {(() => {
                  const currentX = 25 + (Math.min(50, volumeDispensed) / 50.0) * (290 - 25);
                  const currentY = 120 - (Math.min(14, Math.max(0, currentPh)) / 14.0) * (120 - 10);
                  return (
                    <circle
                      cx={currentX}
                      cy={currentY}
                      r="4"
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="animate-pulse"
                    />
                  );
                })()}
              </svg>
            </div>

            {/* Educational takeaway note */}
            <div className={`border rounded-lg p-2.5 text-[11px] leading-relaxed ${
              isDark ? 'bg-slate-900 border-slate-800/80 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                {t('ملاحظة علمية:', 'Scientific Principle:')}{' '}
              </strong>
              {t(
                'تحدث القفزة المفاجئة في قيمة الرقم الهيدروجيني (الأس الهيدروجيني) عند إضافة 25.0 mL من هيدروكسيد الصوديوم، وهي نقطة التكافؤ التام حيث يتعادل الحمض تماماً مع القاعدة.',
                'The sharp vertical steep jump in pH occurs at exactly 25.0 mL of NaOH added, marking the stoichiometric equivalence point where moles of OH⁻ match moles of H⁺.'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
