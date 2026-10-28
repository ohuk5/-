import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Flame,
  Wind,
  Droplet,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { playLabSound } from '../utils/soundEffects';
import { useApp } from '../context/AppContext';

interface PneumaticGasTroughProps {
  soundEnabled?: boolean;
}

export const PneumaticGasTrough: React.FC<PneumaticGasTroughProps> = ({ soundEnabled = true }) => {
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';

  // Gas generation reaction type
  const [gasType, setGasType] = useState<'hydrogen' | 'oxygen' | 'carbondioxide'>('hydrogen');

  // Reaction execution state
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [gasVolumeMl, setGasVolumeMl] = useState<number>(0); // 0 to 100 mL collected
  const [bubbleTick, setBubbleTick] = useState<number>(0);

  // Splint test state
  const [splintResult, setSplintResult] = useState<string | null>(null);
  const [isTestingSplint, setIsTestingSplint] = useState<boolean>(false);

  // Gas reactions catalog
  const GAS_REACTIONS = {
    hydrogen: {
      name: t('غاز الهيدروجين (H₂)', 'Hydrogen Gas (H₂)'),
      formula: 'Zn + 2HCl → ZnCl₂ + H₂↑',
      description: t(
        'ينتج غاز الهيدروجين قليل الكثافة وشديد الاشتعال، ويحدث صوت فرقعة خفيفة عند تقريب شظية مشتعلة.',
        'Produces highly flammable low-density H₂; gives a characteristic "squeaky pop" test with a burning splint.'
      ),
      bubbleColor: 'rgba(255, 255, 255, 0.85)',
      splintEffect: 'pop'
    },
    oxygen: {
      name: t('غاز الأكسجين (O₂)', 'Oxygen Gas (O₂)'),
      formula: '2H₂O₂ (MnO₂) → 2H₂O + O₂↑',
      description: t(
        'ينتج غاز الأكسجين عديم اللون والداعم للاشتعال، وتتوهج الشظية الخافتة بشدة وتشتعل بلهب ساطع.',
        'Produces oxidizing O₂ gas; relights a glowing ember splint into a brilliant flame.'
      ),
      bubbleColor: 'rgba(224, 242, 254, 0.9)',
      splintEffect: 'rekindle'
    },
    carbondioxide: {
      name: t('ثاني أكسيد الكربون (CO₂)', 'Carbon Dioxide (CO₂)'),
      formula: 'NaHCO₃ + HCl → NaCl + H₂O + CO₂↑',
      description: t(
        'ينتج غاز ثاني أكسيد الكربون الكثيف غير القابل للاشتعال، ويُخمد لهب الشظية المشتعلة على الفور.',
        'Produces dense non-flammable CO₂; instantly extinguishes any lighted splint flame.'
      ),
      bubbleColor: 'rgba(241, 245, 249, 0.85)',
      splintEffect: 'extinguish'
    }
  };

  const activeReaction = GAS_REACTIONS[gasType];

  // Gas production simulation loop
  useEffect(() => {
    if (!isReacting) return;

    const interval = setInterval(() => {
      setGasVolumeMl((prev) => {
        if (prev >= 100) {
          setIsReacting(false);
          return 100;
        }
        setBubbleTick((t) => t + 1);

        if (soundEnabled && Math.random() > 0.4) {
          playLabSound('fizz');
        }

        return Math.min(100, prev + 2.5);
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isReacting, soundEnabled]);

  // Start reaction
  const handleStartReaction = () => {
    if (gasVolumeMl >= 100) {
      setGasVolumeMl(0);
    }
    setIsReacting(true);
    setSplintResult(null);
    if (soundEnabled) {
      playLabSound('pour');
    }
  };

  // Perform glowing splint test
  const handleSplintTest = () => {
    if (gasVolumeMl < 10) {
      setSplintResult(t('لا يوجد حجم كافٍ من الغاز في القارورة بعد لإجراء الاختبار!', 'Not enough gas collected yet in the jar to perform the test!'));
      return;
    }

    setIsTestingSplint(true);

    if (gasType === 'hydrogen') {
      if (soundEnabled) playLabSound('hydrogen_pop');
      setSplintResult(t(
        '🔥 حدثت فرقعة صوتية سريعة مميزة (Pop Sound) مع وميض أزرق خاطف! أثبت ذلك وجود غاز الهيدروجين (H₂).',
        '🔥 Characteristic squeaky "Pop" sound with a quick pale blue flash! Confirms pure Hydrogen gas (H₂).'
      ));
    } else if (gasType === 'oxygen') {
      if (soundEnabled) playLabSound('magnesium_flare');
      setSplintResult(t(
        '✨ اشتعلت الشظية الخافتة بشدة وتحولت إلى لهب ساطع مبهر! أثبت ذلك وجود غاز الأكسجين النقي (O₂) الداعم للاشتعال.',
        '✨ Glowing ember splint bursts into a brilliant flame! Confirms pure Oxygen gas (O₂).'
      ));
    } else {
      if (soundEnabled) playLabSound('sizzle');
      setSplintResult(t(
        '💨 انطفأت الشظية المشتعلة وتصاعد دخان أبيض خفيف فور إدخالها! أثبت ذلك وجود ثاني أكسيد الكربون (CO₂) الخانق للهب.',
        '💨 Burning splint is extinguished immediately upon entering the jar! Confirms Carbon Dioxide (CO₂).'
      ));
    }

    setTimeout(() => {
      setIsTestingSplint(false);
    }, 1800);
  };

  // Reset module
  const handleReset = () => {
    setIsReacting(false);
    setGasVolumeMl(0);
    setSplintResult(null);
    if (soundEnabled) playLabSound('click');
  };

  return (
    <div className={`rounded-2xl p-4 md:p-6 shadow-xl space-y-6 border transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('حوض وقارورة تجميع الغازات بإزاحة الماء (Pneumatic Gas Trough)', 'Pneumatic Water Displacement Gas Collection Trough')}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {t(
              'التجربة الكلاسيكية لتجميع الغازات شحيحة الذوبان في الماء، مع مراقبة حركة الفقاعات وإزاحة الماء واختبار الشظية المشتعلة.',
              'Classic water displacement method for collecting insoluble gases with animated bubbling, calibrated jar, and splint tests.'
            )}
          </p>
        </div>

        <button
          onClick={handleReset}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
          {t('إعادة ملء الحوض بالماء', 'Reset Water Level')}
        </button>
      </div>

      {/* Main Grid: Visual Simulation Stage vs Controls & Reaction Choice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Stage (7 cols) */}
        <div className={`lg:col-span-7 rounded-xl border p-5 flex flex-col items-center justify-between min-h-[480px] relative overflow-hidden ${
          isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Subtle laboratory tile grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

          {/* Top Status & Measured Volume Badge */}
          <div className="w-full flex items-center justify-between z-10">
            <div className={`border rounded-lg p-2.5 text-xs shadow-xs ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <span className="text-slate-400 block font-medium">
                {t('الغاز المجمع:', 'Target Gas:')}
              </span>
              <span className="font-mono text-blue-500 font-bold block text-sm">
                {activeReaction.name}
              </span>
            </div>

            <div className={`border rounded-xl p-3 shadow-lg flex items-center gap-3 ${
              isDark ? 'bg-slate-900/90 border-blue-500/30' : 'bg-white border-blue-400/40'
            }`}>
              <Wind className="w-5 h-5 text-blue-500 animate-pulse" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {t('حجم الغاز في القارورة', 'Gas Volume Collected')}
                </span>
                <span className={`font-mono text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  {gasVolumeMl.toFixed(1)} <span className="text-xs text-slate-400">mL</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center Stage: Reaction Flask -> Delivery Tube -> Water Trough & Inverted Jar */}
          <div className="relative w-full h-[320px] flex items-end justify-center gap-6 pb-2 z-10">
            {/* 1. Reaction Flask on Left */}
            <div className="flex flex-col items-center relative">
              {/* Stopper and Delivery Tube Outflow */}
              <div className="w-8 h-4 bg-amber-900 rounded-t-sm border border-amber-950 relative z-20">
                {/* Glass Tube exiting rubber bung */}
                <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 w-2 h-4 bg-cyan-200/50 border-x border-cyan-400" />
              </div>

              {/* Erlenmeyer Reaction Flask */}
              <div className="w-24 h-28 border-2 border-slate-400/60 rounded-b-xl relative bg-white/5 overflow-hidden backdrop-blur-[2px] shadow-lg">
                {/* Reacting Liquid inside Flask */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-cyan-500/30 border-t border-cyan-300">
                  {/* Reacting solid particles at bottom */}
                  <div className="absolute bottom-1 inset-x-2 flex justify-around">
                    <span className="w-3 h-2 bg-slate-300 rounded-sm" />
                    <span className="w-3 h-2 bg-slate-400 rounded-sm" />
                    <span className="w-4 h-2 bg-slate-300 rounded-sm" />
                  </div>

                  {/* Bubbling animation inside reaction flask */}
                  {isReacting && (
                    <div className="absolute inset-0 flex justify-around items-end overflow-hidden pb-1">
                      <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-2 h-2 bg-white/80 rounded-full animate-bounce [animation-delay:0.3s]" />
                      <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-medium">دورق التوليد</span>
            </div>

            {/* 2. Glass Delivery Tube (SVG Arching Path into Water Basin) */}
            <svg
              className="absolute left-[20%] right-[38%] bottom-16 h-28 pointer-events-none z-20 overflow-visible"
              viewBox="0 0 160 80"
            >
              {/* Delivery Tubing outline */}
              <path
                d="M 10 0 L 10 -20 Q 80 -40 130 50 L 140 70"
                fill="none"
                stroke="#67e8f9"
                strokeWidth="4"
                strokeOpacity="0.75"
              />
              <path
                d="M 10 0 L 10 -20 Q 80 -40 130 50 L 140 70"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeOpacity="0.4"
              />
            </svg>

            {/* 3. Water Trough Basin (Pneumatic Trough) & Inverted Gas Jar */}
            <div className="relative w-72 h-44 flex flex-col items-center justify-end">
              {/* Splint Animation over Gas Jar Top */}
              {isTestingSplint && (
                <div className="absolute top-[-36px] left-[52%] -translate-x-1/2 flex flex-col items-center z-30 animate-pulse">
                  <div className="w-1.5 h-10 bg-amber-700 rounded-t-sm" />
                  {gasType === 'hydrogen' ? (
                    <div className="w-6 h-6 rounded-full bg-cyan-400 blur-[2px] animate-ping" />
                  ) : gasType === 'oxygen' ? (
                    <div className="w-7 h-7 rounded-full bg-amber-400 shadow-[0_0_15px_#f59e0b] animate-bounce" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-slate-500 blur-[3px]" />
                  )}
                </div>
              )}

              {/* Inverted Gas Jar (Glass Cylinder) */}
              <div className="absolute bottom-10 left-[48%] -translate-x-1/2 w-16 h-48 border-2 border-cyan-400/60 rounded-t-lg bg-gradient-to-b from-white/10 to-white/5 overflow-hidden z-20 backdrop-blur-[1px] shadow-lg">
                {/* Displaced Water Level inside Inverted Jar */}
                {/* 100 mL gas = 0% water; 0 mL gas = 100% water */}
                <div
                  className="absolute bottom-0 inset-x-0 bg-blue-500/40 border-t border-cyan-300 transition-all duration-300"
                  style={{ height: `${Math.max(0, 100 - gasVolumeMl)}%` }}
                >
                  <div className="w-full h-1 bg-cyan-200/60 rounded-full" />
                </div>

                {/* Gas Pocket Formed at the Top */}
                <div
                  className="absolute top-0 inset-x-0 bg-cyan-100/10 transition-all duration-300 flex items-center justify-center text-[10px] font-mono font-bold text-cyan-200 select-none"
                  style={{ height: `${gasVolumeMl}%` }}
                >
                  {gasVolumeMl >= 15 && `${gasVolumeMl.toFixed(0)} mL`}
                </div>

                {/* Rising Gas Bubbles into Inverted Jar */}
                {isReacting && (
                  <div className="absolute inset-0 flex justify-center items-end pb-2 overflow-hidden pointer-events-none">
                    <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce [animation-delay:0.1s] mb-1" />
                    <span className="w-2.5 h-2.5 bg-white/80 rounded-full animate-bounce [animation-delay:0.25s] mx-1" />
                    <span className="w-2 h-2 bg-white/90 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}

                {/* Jar Milliliter Scale */}
                <div className="absolute left-1 inset-y-2 flex flex-col justify-between text-[7px] text-cyan-200/70 font-mono select-none">
                  <span>- 0 mL</span>
                  <span>- 25 mL</span>
                  <span>- 50 mL</span>
                  <span>- 75 mL</span>
                  <span>- 100 mL</span>
                </div>
              </div>

              {/* Beehive Shelf (Submerged Platform supporting Jar) */}
              <div className="absolute bottom-4 left-[48%] -translate-x-1/2 w-24 h-8 bg-slate-700 border border-slate-600 rounded-t-lg shadow-md z-10 flex items-center justify-center">
                <span className="w-5 h-2 bg-slate-900 rounded-full" />
              </div>

              {/* Outer Water Basin (Pneumatic Trough) */}
              <div className="w-full h-28 border-2 border-blue-400/50 rounded-b-xl bg-gradient-to-b from-blue-500/20 to-blue-600/30 overflow-hidden relative shadow-2xl backdrop-blur-[2px]">
                {/* Surface Water Line */}
                <div className="w-full h-2 bg-blue-400/40 border-b border-blue-300/60" />
                {/* Underwater Water Glow */}
                <div className="absolute inset-0 bg-blue-500/20" />
              </div>

              <span className="text-[10px] text-slate-400 mt-1 font-medium">
                حوض الماء والمنصة الخلوية
              </span>
            </div>
          </div>

          {/* Splint Result Notification Banner */}
          {splintResult && (
            <div className={`w-full border rounded-xl p-3 z-10 text-xs flex items-center gap-2 ${
              isDark ? 'bg-slate-900 border-blue-500/40 text-blue-200' : 'bg-blue-50 border-blue-300 text-blue-900 font-medium'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{splintResult}</span>
            </div>
          )}
        </div>

        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Reaction Type Chooser */}
          <div className={`rounded-xl border p-4 space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-4 h-4 text-blue-500" />
              {t('اختيار نوع التفاعل لإنتاج الغاز', 'Select Gas Generation Reaction')}
            </h4>

            <div className="space-y-2">
              {(['hydrogen', 'oxygen', 'carbondioxide'] as const).map((key) => {
                const rx = GAS_REACTIONS[key];
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setGasType(key);
                      handleReset();
                    }}
                    className={`w-full p-2.5 rounded-lg text-start text-xs border transition-all ${
                      gasType === key
                        ? isDark
                          ? 'bg-blue-950/80 border-blue-500 text-blue-200 shadow-sm'
                          : 'bg-blue-100 border-blue-500 text-blue-900 shadow-sm'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{rx.name}</strong>
                      <span className="text-[10px] font-mono text-blue-500 font-bold">{key.toUpperCase()}</span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-500 block mt-0.5">
                      {rx.formula}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{rx.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Execution Deck */}
          <div className={`rounded-xl border p-4 space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Flame className="w-4 h-4 text-amber-500" />
              {t('تشغيل التفاعل واختبار الكشف', 'Reaction Execution & Splint Flame Test')}
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleStartReaction}
                disabled={isReacting}
                className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isReacting
                    ? 'bg-blue-900 text-blue-300 cursor-not-allowed opacity-75'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                {isReacting ? t('التفاعل مستمر...', 'Reacting...') : t('بدء توليد الغاز', 'Start Reaction')}
              </button>

              <button
                onClick={() => setIsReacting(false)}
                disabled={!isReacting}
                className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <Pause className="w-3.5 h-3.5 text-slate-400" />
                {t('إيقاف مؤقت', 'Pause')}
              </button>
            </div>

            {/* Glowing Splint Test Button */}
            <button
              onClick={handleSplintTest}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border-amber-500'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-400'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              {t('اختبار الشظية المشتعلة (Glowing Splint Test)', 'Glowing Splint Confirmation Test')}
            </button>
          </div>

          {/* Scientific Concept Explainer Box */}
          <div className={`rounded-xl border p-4 text-xs space-y-2 ${
            isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center gap-1.5 text-blue-500 font-bold">
              <Info className="w-3.5 h-3.5" />
              {t('كيف يعمل مبدأ إزاحة الماء؟', 'How Does Water Displacement Work?')}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t(
                'عند إنتاج غاز شحيح الذوبان في الماء (مثل الهيدروجين أو الأكسجين)، ينتقل الغاز عبر أنبوب التوصيل الزجاجي ويخرج كفقاعات تحت فتحة القارورة المغمورة والمقلوبة المليئة بالماء. نظراً لأن كثافة الغاز أقل بكثير من كثافة الماء، يصعد الغاز للأعلى ويدفع سطح الماء للأسفل مفسحاً المجال لحجم الغاز الصافي.',
                'When producing an insoluble or poorly soluble gas (like Hydrogen or Oxygen), the gas travels through the delivery tube and bubbles up into the inverted water-filled jar. Because the gas is far less dense than liquid water, buoyant bubbles rise to the top, pushing water downward out of the cylinder.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
