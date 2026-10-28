import React, { useState } from 'react';
import {
  RotateCcw,
  Scale,
  Sparkles,
  Layers,
  ArrowDownToLine,
  CheckCircle2,
  Trash2,
  Info
} from 'lucide-react';
import { playLabSound } from '../utils/soundEffects';
import { useApp } from '../context/AppContext';

interface DigitalLabScaleProps {
  soundEnabled?: boolean;
  onTransferSample?: (reagentId: string, massG: number) => void;
}

interface PowderItem {
  id: string;
  nameAr: string;
  nameEn: string;
  formula: string;
  color: string;
  density: number; // relative pile volume factor
}

const POWDER_REAGENTS: PowderItem[] = [
  {
    id: 'zinc_powder',
    nameAr: 'مسحوق الخارصين / الزنك',
    nameEn: 'Zinc Powder (Zn)',
    formula: 'Zn (صلب / s)',
    color: '#94a3b8',
    density: 1.0
  },
  {
    id: 'baking_soda',
    nameAr: 'بيكربونات الصوديوم',
    nameEn: 'Sodium Bicarbonate',
    formula: 'NaHCO₃',
    color: '#f8fafc',
    density: 1.2
  },
  {
    id: 'calcium_chloride',
    nameAr: 'حبيبات كلوريد الكالسيوم',
    nameEn: 'Calcium Chloride Pellets',
    formula: 'CaCl₂',
    color: '#e2e8f0',
    density: 1.1
  },
  {
    id: 'copper_sulfate',
    nameAr: 'بلورات كبريتات النحاس الزرقاء',
    nameEn: 'Copper(II) Sulfate Pentahydrate',
    formula: 'CuSO₄·5H₂O',
    color: '#0284c7',
    density: 0.9
  },
  {
    id: 'iron_filings',
    nameAr: 'برادة الحديد الناعمة',
    nameEn: 'Fine Iron Filings',
    formula: 'Fe (صلب / s)',
    color: '#475569',
    density: 1.4
  }
];

export const DigitalLabScale: React.FC<DigitalLabScaleProps> = ({
  soundEnabled = true,
  onTransferSample
}) => {
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';

  // Balance hardware state
  const [hasWeighBoat, setHasWeighBoat] = useState<boolean>(true);
  const weighBoatMass = 2.45; // grams of plastic weigh boat

  // Tare offset
  const [tareOffset, setTareOffset] = useState<number>(weighBoatMass); // tare initialized with boat
  const [isTared, setIsTared] = useState<boolean>(true);

  // Active powder being scooped
  const [selectedPowder, setSelectedPowder] = useState<PowderItem>(POWDER_REAGENTS[0]);
  const [powderMass, setPowderMass] = useState<number>(0.0); // grams of powder on pan
  const [scoopAmount, setScoopAmount] = useState<number>(1.0); // 0.5g, 1.0g, 5.0g

  // Draft shield glass enclosure state
  const [draftShieldClosed, setDraftShieldClosed] = useState<boolean>(false);

  // Total gross mass on the pan
  const grossMass = (hasWeighBoat ? weighBoatMass : 0) + powderMass;
  // Net readout on the digital display
  const netMass = Math.max(0, grossMass - tareOffset);

  // Handle scoop addition
  const handleAddScoop = () => {
    if (!hasWeighBoat) {
      // Must place a weigh boat or watch glass first
      if (soundEnabled) playLabSound('click');
      return;
    }
    const newMass = Number((powderMass + scoopAmount).toFixed(2));
    setPowderMass(newMass);
    if (soundEnabled) {
      playLabSound('solid');
    }
  };

  // Handle Tare button
  const handleTare = () => {
    setTareOffset(grossMass);
    setIsTared(true);
    if (soundEnabled) {
      playLabSound('click');
    }
  };

  // Handle toggle weigh boat
  const handleToggleWeighBoat = () => {
    setHasWeighBoat(!hasWeighBoat);
    setPowderMass(0);
    setTareOffset(0);
    setIsTared(false);
    if (soundEnabled) playLabSound('click');
  };

  // Reset / Clear scale
  const handleClearPan = () => {
    setPowderMass(0);
    if (soundEnabled) playLabSound('click');
  };

  // Transfer sample to beaker/workbench
  const handleTransfer = () => {
    if (powderMass <= 0) return;
    if (onTransferSample) {
      onTransferSample(selectedPowder.id, powderMass);
    }
    if (soundEnabled) playLabSound('pour');
    setPowderMass(0);
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
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('الميزان الإلكتروني التحليلي الدقيق (Analytical Balance)', 'Precision Analytical Electronic Balance (0.01g)')}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {t(
              'دقة قياس حتى 0.01 جرام: تدرب على وزن المساحيق الكيميائية باستخدام زورق الوزن، وتصفير الميزان (Tare)، ونقل العينات.',
              'Precision weighing to 0.01 grams: practice tare offset with weighing boats, spatula scooping, draft shield, and mass transfer.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearPan}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            {t('تفريغ الكفة', 'Clear Pan')}
          </button>
        </div>
      </div>

      {/* Main Grid: Analytical Scale Stage vs Powders and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scale Hardware Stage (7 cols) */}
        <div className={`lg:col-span-7 rounded-xl border p-5 flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden ${
          isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Tile Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

          {/* Top Controls: Draft Shield Toggle & Spirit Level */}
          <div className="w-full flex items-center justify-between z-10">
            <button
              onClick={() => setDraftShieldClosed(!draftShieldClosed)}
              className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                draftShieldClosed
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : isDark ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
              }`}
            >
              {draftShieldClosed ? t('الواقي الزجاجي: مغلق ✓', 'Draft Shield: Closed ✓') : t('إغلاق الواقي الزجاجي ضد التيارات', 'Close Glass Draft Shield')}
            </button>

            {/* Bubble Level Indicator */}
            <div className={`flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-[11px] ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <span>{t('ميزان التسوية:', 'Spirit Level:')}</span>
              <span className="w-3 h-3 rounded-full border border-emerald-500 flex items-center justify-center bg-emerald-950">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
            </div>
          </div>

          {/* Center Stage: The Physical Analytical Balance Body */}
          <div className="relative w-80 h-72 flex flex-col items-center justify-end z-10">
            {/* Draft Shield Glass Box (Optional overlay) */}
            <div
              className={`absolute top-0 inset-x-4 bottom-24 border-2 rounded-t-xl transition-all duration-300 pointer-events-none ${
                draftShieldClosed
                  ? 'border-cyan-400/50 bg-cyan-500/5 backdrop-blur-[1px]'
                  : 'border-slate-700/30 bg-transparent'
              }`}
            />

            {/* Stainless Steel Weighing Pan */}
            <div className="relative z-20 flex flex-col items-center">
              {/* Weigh Boat / Watch Glass */}
              {hasWeighBoat ? (
                <div className="relative w-36 h-12 flex items-center justify-center">
                  {/* Plastic weigh boat geometry */}
                  <div className="w-32 h-10 border border-slate-400/60 rounded-b-xl bg-gradient-to-b from-white/20 to-white/10 shadow-md relative flex items-center justify-center overflow-hidden">
                    {/* Powder Pile Accumulation */}
                    {powderMass > 0 && (
                      <div
                        className="transition-all duration-300 rounded-full blur-[0.3px]"
                        style={{
                          width: `${Math.min(90, 20 + powderMass * 7)}px`,
                          height: `${Math.min(24, 6 + powderMass * 2.2)}px`,
                          backgroundColor: selectedPowder.color
                        }}
                      />
                    )}
                  </div>
                  <span className="absolute -top-3 text-[9px] text-slate-400 font-mono">
                    {t('زورق الوزن (2.45 g)', 'Weigh Boat (2.45 g)')}
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-amber-500 mb-2 font-medium">
                  {t('الكفة فارغة (يرجى وضع زورق وزن)', 'Pan is Empty (Place a weigh boat)')}
                </div>
              )}

              {/* Steel Pan Disc */}
              <div className="w-48 h-3.5 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-full border-t border-white shadow-lg mt-1" />
              {/* Pan Stem */}
              <div className="w-5 h-6 bg-slate-500 border-x border-slate-600" />
            </div>

            {/* Scale Main Housing Base */}
            <div className="w-full h-32 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 rounded-2xl p-3 flex flex-col justify-between shadow-2xl relative">
              {/* Glowing LCD / 7-Segment Digital Readout */}
              <div className="bg-black/90 border border-emerald-500/40 rounded-lg p-2.5 flex items-center justify-between shadow-inner">
                <span className="text-[10px] uppercase font-mono text-emerald-600 font-bold tracking-wider">
                  {isTared ? 'TARE' : 'GROSS'}
                </span>

                <div className="flex items-baseline gap-1 text-emerald-400 font-mono tracking-widest text-3xl font-bold">
                  <span>{netMass.toFixed(2)}</span>
                  <span className="text-sm font-sans font-medium text-emerald-500">g</span>
                </div>
              </div>

              {/* Scale Physical Buttons Bar */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={handleTare}
                  className="py-1.5 px-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600 font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  {t('تصفير الميزان (TARE)', 'Tare (Zero Scale)')}
                </button>

                <button
                  onClick={handleToggleWeighBoat}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs font-medium transition-colors"
                >
                  {hasWeighBoat ? t('إزالة زورق الوزن', 'Remove Boat') : t('وضع زورق وزن', 'Add Weigh Boat')}
                </button>
              </div>
            </div>
          </div>

          {/* Sample Transfer Action Bar */}
          {powderMass > 0 && (
            <div className={`w-full border rounded-xl p-3 flex items-center justify-between z-10 ${
              isDark ? 'bg-slate-900 border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
            }`}>
              <div className="text-xs">
                <span className="text-slate-400">{t('العينة الجاهزة:', 'Weighed Sample:')} </span>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                  {powderMass.toFixed(2)} g {t(`من ${selectedPowder.nameAr}`, `of ${selectedPowder.nameEn}`)}
                </strong>
              </div>

              <button
                onClick={handleTransfer}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors flex items-center gap-1.5"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                {t('نقل العينة إلى المعمل', 'Transfer to Reaction Beaker')}
              </button>
            </div>
          )}
        </div>

        {/* Right Controls Column: Reagent Shelf & Scooping Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Powder Shelf Selector */}
          <div className={`rounded-xl border p-4 space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Layers className="w-4 h-4 text-emerald-500" />
              {t('اختر المادة المراد وزنها', 'Select Powder / Reagent to Weigh')}
            </h4>

            <div className="space-y-1.5">
              {POWDER_REAGENTS.map((powder) => (
                <button
                  key={powder.id}
                  onClick={() => {
                    setSelectedPowder(powder);
                    setPowderMass(0);
                    if (soundEnabled) playLabSound('click');
                  }}
                  className={`w-full p-2.5 rounded-lg text-start text-xs border transition-all flex items-center justify-between ${
                    selectedPowder.id === powder.id
                      ? isDark
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm'
                        : 'bg-emerald-100 border-emerald-500 text-emerald-900 shadow-sm'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div>
                    <strong className={`block font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {t(powder.nameAr, powder.nameEn)}
                    </strong>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">{powder.formula}</span>
                  </div>

                  <span
                    className="w-4 h-4 rounded-full border border-slate-600 shadow-inner"
                    style={{ backgroundColor: powder.color }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Spatula / Scoop Increment Controls */}
          <div className={`rounded-xl border p-4 space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-4 h-4 text-emerald-500" />
              {t('ملعقة الوزن (Lab Spatula)', 'Lab Spatula & Scoop Increments')}
            </h4>

            <div className="space-y-2">
              <span className="text-xs text-slate-400 block">
                {t('مقدار الملعقة الواحدة:', 'Single Scoop Dose:')}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[0.5, 1.0, 5.0].map((val) => (
                  <button
                    key={val}
                    onClick={() => setScoopAmount(val)}
                    className={`py-1.5 rounded text-xs font-mono font-bold transition-colors border ${
                      scoopAmount === val
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    +{val.toFixed(1)} g
                  </button>
                ))}
              </div>

              {/* Add Scoop Button */}
              <button
                onClick={handleAddScoop}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
                {t(`إضافة ملعقة (${scoopAmount.toFixed(1)} g) إلى زورق الوزن`, `Add Scoop (+${scoopAmount.toFixed(1)} g) to Weigh Boat`)}
              </button>
            </div>
          </div>

          {/* Scientific Info Box */}
          <div className={`rounded-xl border p-4 text-xs space-y-1.5 ${
            isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
              <Info className="w-3.5 h-3.5" />
              {t('ما هي وظيفة زر التصفير (Tare)؟', 'Why is the Tare Function Essential?')}
            </div>
            <p className="text-[11px] leading-relaxed">
              {t(
                'يُستخدم زر Tare في الموازين المخبرية لخصم كتلة الوعاء الحامل للمادة (زورق الوزن أو زجاجة الساعة)، بحيث تبدأ القراءة من الصفر وتُعبر القيمة المسجلة بدقة عن كتلة المسحوق النقية فقط دون احتساب وزن الوعاء.',
                'The Tare button resets the display to 0.00g with the container on the pan, allowing you to measure the exact net mass of the reagent powder without adding the weight of the weighing boat.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
