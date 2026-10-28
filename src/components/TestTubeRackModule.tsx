import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Droplet,
  Trash2,
  CheckCircle2,
  Layers,
  Thermometer,
  Activity,
  Info
} from 'lucide-react';
import { playLabSound } from '../utils/soundEffects';
import { useApp } from '../context/AppContext';

interface TestTubeData {
  id: number;
  labelAr: string;
  labelEn: string;
  volumeMl: number;
  color: string;
  precipitateAr: string | null;
  precipitateEn: string | null;
  precipitateColor: string | null;
  ph: number;
  tempC: number;
  isBubbling: boolean;
  reagentsAr: string[];
  reagentsEn: string[];
}

const INITIAL_TUBES: TestTubeData[] = [
  {
    id: 1,
    labelAr: 'الأنبوب A',
    labelEn: 'Tube A',
    volumeMl: 5,
    color: 'rgba(224, 242, 254, 0.45)',
    precipitateAr: null,
    precipitateEn: null,
    precipitateColor: null,
    ph: 7.0,
    tempC: 22.0,
    isBubbling: false,
    reagentsAr: ['ماء مقطر (H₂O)'],
    reagentsEn: ['Distilled Water (H₂O)']
  },
  {
    id: 2,
    labelAr: 'الأنبوب B',
    labelEn: 'Tube B',
    volumeMl: 5,
    color: 'rgba(224, 242, 254, 0.45)',
    precipitateAr: null,
    precipitateEn: null,
    precipitateColor: null,
    ph: 7.0,
    tempC: 22.0,
    isBubbling: false,
    reagentsAr: ['ماء مقطر (H₂O)'],
    reagentsEn: ['Distilled Water (H₂O)']
  },
  {
    id: 3,
    labelAr: 'الأنبوب C',
    labelEn: 'Tube C',
    volumeMl: 5,
    color: 'rgba(224, 242, 254, 0.45)',
    precipitateAr: null,
    precipitateEn: null,
    precipitateColor: null,
    ph: 7.0,
    tempC: 22.0,
    isBubbling: false,
    reagentsAr: ['ماء مقطر (H₂O)'],
    reagentsEn: ['Distilled Water (H₂O)']
  },
  {
    id: 4,
    labelAr: 'الأنبوب D',
    labelEn: 'Tube D',
    volumeMl: 5,
    color: 'rgba(224, 242, 254, 0.45)',
    precipitateAr: null,
    precipitateEn: null,
    precipitateColor: null,
    ph: 7.0,
    tempC: 22.0,
    isBubbling: false,
    reagentsAr: ['ماء مقطر (H₂O)'],
    reagentsEn: ['Distilled Water (H₂O)']
  }
];

interface TestTubeRackModuleProps {
  soundEnabled?: boolean;
}

export const TestTubeRackModule: React.FC<TestTubeRackModuleProps> = ({ soundEnabled = true }) => {
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';

  const [tubes, setTubes] = useState<TestTubeData[]>(INITIAL_TUBES);
  const [activeTubeId, setActiveTubeId] = useState<number>(1);

  const activeTube = tubes.find((t) => t.id === activeTubeId) || tubes[0];

  // Reagent Dropper Options for Test Tubes
  const DROPPER_REAGENTS = [
    {
      id: 'copper_sulfate',
      nameAr: 'كبريتات النحاس (CuSO₄)',
      nameEn: 'Copper(II) Sulfate (CuSO₄)',
      color: 'rgba(2, 132, 199, 0.75)',
      action: (tube: TestTubeData): Partial<TestTubeData> => ({
        color: 'rgba(2, 132, 199, 0.75)',
        volumeMl: Math.min(15, tube.volumeMl + 2),
        ph: 5.5,
        reagentsAr: [...tube.reagentsAr, 'كبريتات النحاس (CuSO₄)'],
        reagentsEn: [...tube.reagentsEn, 'Copper Sulfate (CuSO₄)']
      })
    },
    {
      id: 'sodium_hydroxide',
      nameAr: 'هيدروكسيد الصوديوم (NaOH)',
      nameEn: 'Sodium Hydroxide (NaOH)',
      color: 'rgba(45, 212, 191, 0.45)',
      action: (tube: TestTubeData): Partial<TestTubeData> => {
        // If copper sulfate is already present, form sky blue gelatinous Cu(OH)2 precipitate!
        const hasCopper = tube.reagentsAr.some((r) => r.includes('كبريتات النحاس')) || tube.reagentsEn.some((r) => r.includes('Copper'));
        const hasIron = tube.reagentsAr.some((r) => r.includes('كلوريد الحديد')) || tube.reagentsEn.some((r) => r.includes('Iron'));
        let precipAr = tube.precipitateAr;
        let precipEn = tube.precipitateEn;
        let precipColor = tube.precipitateColor;

        if (hasCopper) {
          precipAr = 'راسب هلامي أزرق سماوي: Cu(OH)₂↓';
          precipEn = 'Sky-blue gelatinous precipitate: Cu(OH)₂↓';
          precipColor = '#38bdf8';
        } else if (hasIron) {
          precipAr = 'راسب بني صدئ محمر: Fe(OH)₃↓';
          precipEn = 'Rust-red brown precipitate: Fe(OH)₃↓';
          precipColor = '#9a3412';
        }

        return {
          volumeMl: Math.min(15, tube.volumeMl + 2),
          ph: 13.0,
          precipitateAr: precipAr,
          precipitateEn: precipEn,
          precipitateColor: precipColor,
          reagentsAr: [...tube.reagentsAr, 'هيدروكسيد الصوديوم (NaOH)'],
          reagentsEn: [...tube.reagentsEn, 'Sodium Hydroxide (NaOH)']
        };
      }
    },
    {
      id: 'iron_chloride',
      nameAr: 'كلوريد الحديد الثلاثي (FeCl₃)',
      nameEn: 'Iron(III) Chloride (FeCl₃)',
      color: 'rgba(217, 119, 6, 0.8)',
      action: (tube: TestTubeData): Partial<TestTubeData> => ({
        color: 'rgba(217, 119, 6, 0.8)',
        volumeMl: Math.min(15, tube.volumeMl + 2),
        ph: 3.0,
        reagentsAr: [...tube.reagentsAr, 'كلوريد الحديد (FeCl₃)'],
        reagentsEn: [...tube.reagentsEn, 'Iron(III) Chloride (FeCl₃)']
      })
    },
    {
      id: 'silver_nitrate',
      nameAr: 'نترات الفضة (AgNO₃)',
      nameEn: 'Silver Nitrate (AgNO₃)',
      color: 'rgba(224, 242, 254, 0.6)',
      action: (tube: TestTubeData): Partial<TestTubeData> => ({
        volumeMl: Math.min(15, tube.volumeMl + 2),
        reagentsAr: [...tube.reagentsAr, 'نترات الفضة (AgNO₃)'],
        reagentsEn: [...tube.reagentsEn, 'Silver Nitrate (AgNO₃)']
      })
    },
    {
      id: 'sodium_chloride',
      nameAr: 'كلوريد الصوديوم (NaCl)',
      nameEn: 'Sodium Chloride (NaCl)',
      color: 'rgba(248, 250, 252, 0.7)',
      action: (tube: TestTubeData): Partial<TestTubeData> => {
        const hasSilver = tube.reagentsAr.some((r) => r.includes('نترات الفضة')) || tube.reagentsEn.some((r) => r.includes('Silver'));
        return {
          volumeMl: Math.min(15, tube.volumeMl + 2),
          precipitateAr: hasSilver ? 'راسب أبيض حليبي جبني: AgCl↓' : tube.precipitateAr,
          precipitateEn: hasSilver ? 'Curdy white precipitate: AgCl↓' : tube.precipitateEn,
          precipitateColor: hasSilver ? '#ffffff' : tube.precipitateColor,
          reagentsAr: [...tube.reagentsAr, 'كلوريد الصوديوم (NaCl)'],
          reagentsEn: [...tube.reagentsEn, 'Sodium Chloride (NaCl)']
        };
      }
    },
    {
      id: 'acid_hcl',
      nameAr: 'حمض الهيدروكلوريك (HCl)',
      nameEn: 'Hydrochloric Acid (HCl)',
      color: 'rgba(250, 204, 21, 0.5)',
      action: (tube: TestTubeData): Partial<TestTubeData> => ({
        color: 'rgba(250, 204, 21, 0.4)',
        volumeMl: Math.min(15, tube.volumeMl + 2),
        ph: 1.2,
        reagentsAr: [...tube.reagentsAr, 'حمض الهيدروكلوريك (HCl)'],
        reagentsEn: [...tube.reagentsEn, 'Hydrochloric Acid (HCl)']
      })
    },
    {
      id: 'phenolphthalein',
      nameAr: 'كاشف الفينولفثالين',
      nameEn: 'Phenolphthalein Indicator',
      color: 'rgba(244, 114, 182, 0.85)',
      action: (tube: TestTubeData): Partial<TestTubeData> => ({
        color: tube.ph >= 8.5 ? 'rgba(236, 72, 153, 0.85)' : tube.color,
        reagentsAr: [...tube.reagentsAr, 'كاشف الفينولفثالين'],
        reagentsEn: [...tube.reagentsEn, 'Phenolphthalein Indicator']
      })
    }
  ];

  // Apply reagent drops to active tube
  const handleAddDropper = (dropperId: string) => {
    const dropper = DROPPER_REAGENTS.find((d) => d.id === dropperId);
    if (!dropper) return;

    setTubes((prevTubes) =>
      prevTubes.map((tube) => {
        if (tube.id === activeTubeId) {
          const updates = dropper.action(tube);
          return { ...tube, ...updates };
        }
        return tube;
      })
    );

    if (soundEnabled) {
      playLabSound('drop');
    }
  };

  // Clear specific tube
  // Clear specific tube
  const handleClearTube = (id: number) => {
    setTubes((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              volumeMl: 5,
              color: 'rgba(224, 242, 254, 0.45)',
              precipitateAr: null,
              precipitateEn: null,
              precipitateColor: null,
              ph: 7.0,
              tempC: 22.0,
              isBubbling: false,
              reagentsAr: ['ماء مقطر (H₂O)'],
              reagentsEn: ['Distilled Water (H₂O)']
            }
          : t
      )
    );
    if (soundEnabled) playLabSound('click');
  };

  // Reset entire rack
  const handleResetRack = () => {
    setTubes(INITIAL_TUBES);
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
            <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('حامل أنابيب الاختبار المتعدد (Test Tube Rack Suite)', 'Multi-Tube Test Rack & Precipitate Analysis')}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {t(
              'إجراء تجارب متزامنة ومقارنة الرواسب الكيميائية وتغيرات الألوان بين 4 أنابيب اختبار جنباً إلى جنب.',
              'Run simultaneous side-by-side experiments, compare precipitate formations, and analyze chemical color changes.'
            )}
          </p>
        </div>

        <button
          onClick={handleResetRack}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
          {t('تفريغ جميع الأنابيب', 'Empty All Tubes')}
        </button>
      </div>

      {/* Main Grid: Multi-Tube Rack Stage vs Droppers & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rack Visual Stage (7 cols) */}
        <div className={`lg:col-span-7 rounded-xl border p-5 flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden ${
          isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Tile Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

          {/* Active Tube Banner */}
          <div className="w-full flex items-center justify-between z-10">
            <div className={`border rounded-lg p-2.5 text-xs flex items-center gap-2 ${
              isDark ? 'bg-slate-900/90 border-indigo-500/30' : 'bg-white border-indigo-200 shadow-xs'
            }`}>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
              <span>
                {t('الأنبوب النشط حالياً:', 'Active Selected Tube:')}{' '}
                <strong className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t(activeTube.labelAr, activeTube.labelEn)}
                </strong>
              </span>
            </div>

            <button
              onClick={() => handleClearTube(activeTube.id)}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/40 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3 text-rose-400" />
              {t('تفريغ هذا الأنبوب', 'Clear Active Tube')}
            </button>
          </div>

          {/* Center Stage: Wooden Lab Rack Holding 4 Test Tubes */}
          <div className="relative w-full max-w-lg h-[280px] flex items-end justify-center pb-2 z-10">
            {/* The 4 Test Tubes */}
            <div className="w-full flex items-end justify-around px-8 relative z-20">
              {tubes.map((tube) => {
                const isSelected = tube.id === activeTubeId;
                const fillPercent = Math.min(85, (tube.volumeMl / 15.0) * 100);

                return (
                  <div
                    key={tube.id}
                    onClick={() => {
                      setActiveTubeId(tube.id);
                      if (soundEnabled) playLabSound('click');
                    }}
                    className={`flex flex-col items-center cursor-pointer transition-transform duration-200 ${
                      isSelected ? '-translate-y-2' : 'hover:-translate-y-1'
                    }`}
                  >
                    {/* Test Tube Glass Column */}
                    <div
                      className={`w-10 h-44 rounded-b-full border-2 bg-white/5 relative overflow-hidden shadow-lg backdrop-blur-[1px] transition-colors ${
                        isSelected ? 'border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]' : 'border-slate-500/60'
                      }`}
                    >
                      {/* Tube Rim Flare */}
                      <div className="absolute top-0 inset-x-0 h-1.5 border-b border-white/30 bg-white/10" />

                      {/* Liquid Inside Test Tube */}
                      <div
                        className="absolute bottom-0 inset-x-0 transition-all duration-500 rounded-b-full border-t border-white/20"
                        style={{
                          height: `${fillPercent}%`,
                          backgroundColor: tube.color
                        }}
                      >
                        {/* Precipitate settling at bottom */}
                        {(tube.precipitateAr || tube.precipitateEn) && (
                          <div
                            className="absolute bottom-0 inset-x-0 h-5 rounded-b-full shadow-inner animate-pulse"
                            style={{ backgroundColor: tube.precipitateColor || '#ffffff' }}
                          />
                        )}
                      </div>

                      {/* Reflection highlight */}
                      <div className="absolute top-2 left-1 w-1 h-36 bg-white/20 rounded-full pointer-events-none" />
                    </div>

                    {/* Tube Label Tag */}
                    <div
                      className={`mt-2 px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {t(tube.labelAr, tube.labelEn)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wooden / Acrylic Lab Rack Stand */}
            <div className="absolute bottom-2 inset-x-2 h-14 bg-gradient-to-b from-amber-900 to-amber-950 rounded-lg border border-amber-800 shadow-2xl z-10 flex flex-col justify-between p-2">
              <div className="w-full h-2 bg-amber-800/80 rounded-full" />
              <div className="w-full flex justify-around px-4">
                <span className="w-8 h-2 bg-amber-950 rounded-full" />
                <span className="w-8 h-2 bg-amber-950 rounded-full" />
                <span className="w-8 h-2 bg-amber-950 rounded-full" />
                <span className="w-8 h-2 bg-amber-950 rounded-full" />
              </div>
            </div>
          </div>

          {/* Active Tube Telemetry Bar */}
          <div className={`w-full border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 z-10 text-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">
                pH:{' '}
                <strong className="text-indigo-400 font-mono text-sm">{activeTube.ph.toFixed(1)}</strong>
              </span>
              <span className="text-slate-400">
                {t('الحجم:', 'Volume:')}{' '}
                <strong className={`font-mono text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeTube.volumeMl.toFixed(0)} mL</strong>
              </span>
            </div>

            {(activeTube.precipitateAr || activeTube.precipitateEn) ? (
              <span className="px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-700 text-indigo-200 font-bold text-[11px]">
                {t(activeTube.precipitateAr || '', activeTube.precipitateEn || '')}
              </span>
            ) : (
              <span className="text-slate-400">{t('محلول متجانس بدون رواسب', 'Homogeneous solution (No precipitate)')}</span>
            )}
          </div>
        </div>

        {/* Right Column: Dropper Shelf & Side-by-Side Comparison (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Reagent Dropper Palette */}
          <div className={`rounded-xl border p-4 space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Droplet className="w-4 h-4 text-indigo-500" />
              {t(`قطارات المواد الكيميائية (إضافة إلى ${activeTube.labelAr})`, `Chemical Droppers (Add to ${activeTube.labelEn})`)}
            </h4>

            <div className="grid grid-cols-1 gap-1.5">
              {DROPPER_REAGENTS.map((reagent) => (
                <button
                  key={reagent.id}
                  onClick={() => handleAddDropper(reagent.id)}
                  className={`w-full p-2 rounded-lg border text-xs text-start transition-all flex items-center justify-between group ${
                    isDark
                      ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-indigo-500'
                      : 'bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-slate-600 shadow-sm"
                      style={{ backgroundColor: reagent.color }}
                    />
                    <span className={`font-medium ${isDark ? 'text-slate-200 group-hover:text-white' : 'text-slate-800'}`}>
                      {t(reagent.nameAr, reagent.nameEn)}
                    </span>
                  </div>

                  <span className="text-[10px] text-indigo-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    +{t('قطرة', 'Drop')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Comparative Matrix of All 4 Tubes */}
          <div className={`rounded-xl border p-4 space-y-2 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Activity className="w-4 h-4 text-indigo-500" />
              {t('جدول المقارنة بين الأنابيب الأربعة', '4-Tube Comparative Analysis Matrix')}
            </h4>

            <div className="space-y-1.5 text-[11px]">
              {tubes.map((tube) => {
                const latestContent = lang === 'ar'
                  ? (tube.precipitateAr || tube.reagentsAr[tube.reagentsAr.length - 1])
                  : (tube.precipitateEn || tube.reagentsEn[tube.reagentsEn.length - 1]);

                return (
                  <div
                    key={tube.id}
                    onClick={() => setActiveTubeId(tube.id)}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                      tube.id === activeTubeId
                        ? isDark
                          ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-xs'
                          : 'bg-indigo-100 border-indigo-400 text-indigo-950 shadow-xs'
                        : isDark
                        ? 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{t(tube.labelAr, tube.labelEn)}:</span>
                      <span className={`truncate max-w-[170px] ${isDark ? 'text-slate-300' : 'text-slate-800 font-medium'}`}>
                        {latestContent}
                      </span>
                    </div>

                    <span className="font-mono text-indigo-500 font-bold">pH {tube.ph.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Educational Note */}
          <div className={`rounded-xl border p-4 text-xs space-y-1.5 ${
            isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-1.5 text-indigo-500 font-bold">
              <Info className="w-3.5 h-3.5" />
              {t('تفاعلات الترسيب (Precipitation Reactions)', 'Chemical Precipitation Reactions')}
            </div>
            <p className="text-[11px] leading-relaxed">
              {t(
                'عند مزج محلولين شارديين ذائبين يحتويان على أيونات يمكن أن تتحد معاً لتكوين مركب شحيح الذوبان في الماء، ينفصل هذا المركب على شكل راسب صلب معلق ويهبط تدريجياً إلى قاع أنبوب الاختبار.',
                'When two aqueous solutions are combined and certain cations and anions bond to form an insoluble solid, that compound precipitates out of solution and settles at the bottom of the test tube.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
