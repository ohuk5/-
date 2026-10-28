import React, { useState } from 'react';
import {
  RotateCcw,
  Droplets,
  Droplet,
  ArrowDownToLine,
  Eye,
  Info,
  Sparkles,
  Layers
} from 'lucide-react';
import { playLabSound } from '../utils/soundEffects';
import { useApp } from '../context/AppContext';

interface GraduatedCylinderPipetteProps {
  soundEnabled?: boolean;
  onTransferLiquid?: (reagentId: string, volumeMl: number) => void;
}

interface LiquidReagent {
  id: string;
  nameAr: string;
  nameEn: string;
  formula: string;
  color: string;
}

const STOCK_LIQUIDS: LiquidReagent[] = [
  { id: 'water', nameAr: 'ماء مقطر نقي', nameEn: 'Pure Distilled Water', formula: 'H₂O', color: 'rgba(56, 189, 248, 0.45)' },
  { id: 'acid_hcl', nameAr: 'حمض الهيدروكلوريك (0.1 M)', nameEn: 'Hydrochloric Acid (0.1 M)', formula: 'HCl', color: 'rgba(250, 204, 21, 0.5)' },
  { id: 'base_naoh', nameAr: 'هيدروكسيد الصوديوم (0.1 M)', nameEn: 'Sodium Hydroxide (0.1 M)', formula: 'NaOH', color: 'rgba(45, 212, 191, 0.45)' },
  { id: 'copper_sulfate', nameAr: 'محلول كبريتات النحاس الزرقاء', nameEn: 'Copper(II) Sulfate Solution', formula: 'CuSO₄', color: 'rgba(2, 132, 199, 0.75)' }
];

export const GraduatedCylinderPipette: React.FC<GraduatedCylinderPipetteProps> = ({
  soundEnabled = true,
  onTransferLiquid
}) => {
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';
  // Active liquid selected
  const [selectedLiquid, setSelectedLiquid] = useState<LiquidReagent>(STOCK_LIQUIDS[0]);

  // Cylinder capacity & volume
  const [cylinderCapacity, setCylinderCapacity] = useState<50 | 10>(50);
  const [cylinderVolume, setCylinderVolume] = useState<number>(15.0); // mL currently in cylinder

  // Pipette state
  const [pipetteCapacity] = useState<number>(5.0); // 5 mL pipette
  const [pipetteVolume, setPipetteVolume] = useState<number>(0.0); // mL held in pipette

  // Aspirate liquid into pipette
  const handleAspirate = (amount: number) => {
    const newVol = Math.min(pipetteCapacity, Number((pipetteVolume + amount).toFixed(1)));
    setPipetteVolume(newVol);
    if (soundEnabled) {
      playLabSound('pour');
    }
  };

  // Dispense liquid from pipette into cylinder
  const handleDispenseToCylinder = () => {
    if (pipetteVolume <= 0) return;
    const roomInCylinder = cylinderCapacity - cylinderVolume;
    const transfer = Math.min(pipetteVolume, roomInCylinder);

    setCylinderVolume((prev) => Number((prev + transfer).toFixed(1)));
    setPipetteVolume((prev) => Number((prev - transfer).toFixed(1)));
    if (soundEnabled) {
      playLabSound('drop');
    }
  };

  // Direct pour from stock bottle into cylinder
  const handlePourFromBottle = (ml: number) => {
    setCylinderVolume((prev) => Math.min(cylinderCapacity, Number((prev + ml).toFixed(1))));
    if (soundEnabled) {
      playLabSound('pour');
    }
  };

  // Reset cylinder
  const handleResetCylinder = () => {
    setCylinderVolume(0);
    setPipetteVolume(0);
    if (soundEnabled) playLabSound('click');
  };

  // Transfer cylinder liquid to main lab
  const handleTransferToLab = () => {
    if (cylinderVolume <= 0) return;
    if (onTransferLiquid) {
      onTransferLiquid(selectedLiquid.id, cylinderVolume);
    }
    if (soundEnabled) playLabSound('pour');
    setCylinderVolume(0);
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
            <span className="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
            <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('المخبار المدرج والماصة الدقيقة (Graduated Cylinder & Pipette)', 'Graduated Cylinder & Volumetric Pipette')}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {t(
              'قياس حجوم السوائل بالمليلتر (mL) وقراءة السطح الهلالي المقعر (Meniscus) وسحب المحاليل بواسطة الماصة المدرجة.',
              'Precise liquid measurement in milliliters (mL), concave meniscus alignment, and calibrated pipette aspiration.'
            )}
          </p>
        </div>

        <button
          onClick={handleResetCylinder}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-500" />
          {t('تفريغ المخبار', 'Empty Cylinder')}
        </button>
      </div>

      {/* Main Grid: Glassware Stage vs Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Glassware Visual Stage (7 cols) */}
        <div className={`lg:col-span-7 rounded-xl border p-5 flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden ${
          isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Tile Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

          {/* Top Info Bar */}
          <div className="w-full flex items-center justify-between z-10">
            <div className={`border rounded-lg p-2.5 text-xs shadow-xs ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <span className="text-slate-400 block font-medium">
                {t('المحلول المستخدم:', 'Selected Solution:')}
              </span>
              <span className="font-mono text-teal-500 font-bold block text-sm">
                {t(selectedLiquid.nameAr, selectedLiquid.nameEn)}
              </span>
            </div>

            <div className={`border rounded-xl p-3 shadow-lg flex items-center gap-3 ${
              isDark ? 'bg-slate-900/90 border-teal-500/30' : 'bg-white border-teal-400/40'
            }`}>
              <Eye className="w-5 h-5 text-teal-500" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {t('قراءة الحجم الفعلي', 'Measured Volume')}
                </span>
                <span className={`font-mono text-2xl font-bold ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                  {cylinderVolume.toFixed(1)}{' '}
                  <span className="text-xs text-slate-400">/ {cylinderCapacity} mL</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center Stage: Calibrated Pipette hovering over Graduated Cylinder */}
          <div className="relative w-full h-[300px] flex items-end justify-center gap-12 pb-2 z-10">
            {/* 1. Volumetric Pipette on Left */}
            <div className="flex flex-col items-center">
              {/* Rubber Suction Bulb */}
              <div
                onClick={() => handleAspirate(1.0)}
                className="w-8 h-10 bg-rose-600 rounded-t-full border border-rose-700 shadow-md cursor-pointer hover:bg-rose-500 transition-colors flex items-center justify-center text-[9px] font-bold text-white select-none"
                title={t('انقر على الكرة المطاطية لسحب السائل', 'Click bulb to aspirate liquid')}
              >
                {t('سحب', 'Draw')}
              </div>

              {/* Glass Pipette Barrel */}
              <div className="w-4 h-48 border-x-2 border-cyan-400/50 bg-white/5 relative overflow-hidden rounded-b-sm">
                {/* Liquid held inside pipette */}
                <div
                  className="absolute bottom-0 inset-x-0 transition-all duration-300"
                  style={{
                    height: `${(pipetteVolume / pipetteCapacity) * 100}%`,
                    backgroundColor: selectedLiquid.color
                  }}
                />

                {/* Graduation ticks */}
                <div className="absolute inset-y-1 right-0 w-1 flex flex-col justify-between text-[6px] text-cyan-200/60 font-mono select-none">
                  <span>- 5</span>
                  <span>- 4</span>
                  <span>- 3</span>
                  <span>- 2</span>
                  <span>- 1</span>
                  <span>- 0</span>
                </div>
              </div>

              {/* Pipette Fine Nozzle */}
              <div className="w-1.5 h-6 bg-cyan-300/40 border-x border-cyan-400/60 rounded-b-full" />

              <span className="text-[10px] text-slate-400 mt-1 font-medium">
                {t('ماصة مدرجة', 'Pipette')} ({pipetteVolume.toFixed(1)} / {pipetteCapacity} mL)
              </span>

              {/* Dispense Pipette Button */}
              {pipetteVolume > 0 && (
                <button
                  onClick={handleDispenseToCylinder}
                  className="mt-1 px-2.5 py-1 rounded bg-teal-800 hover:bg-teal-700 text-teal-100 text-[10px] font-bold transition-colors flex items-center gap-1"
                >
                  <ArrowDownToLine className="w-3 h-3" />
                  {t('تفريغ في المخبار', 'Dispense to Cylinder')}
                </button>
              )}
            </div>

            {/* 2. Graduated Cylinder on Right */}
            <div className="flex flex-col items-center">
              {/* Spout Lip */}
              <div className="w-16 h-3 border-x-2 border-t-2 border-cyan-400/60 rounded-t-md bg-white/5 relative">
                <div className="absolute -left-1 top-0 w-2 h-2 border-t border-l border-cyan-300 -rotate-45" />
              </div>

              {/* Cylinder Glass Column */}
              <div className="w-16 h-56 border-x-2 border-cyan-400/60 bg-gradient-to-r from-white/10 via-white/5 to-white/10 relative overflow-hidden backdrop-blur-[1px] shadow-xl">
                {/* Liquid in Cylinder */}
                <div
                  className="absolute bottom-0 inset-x-0 transition-all duration-500 border-t"
                  style={{
                    height: `${(cylinderVolume / cylinderCapacity) * 100}%`,
                    backgroundColor: selectedLiquid.color,
                    borderColor: 'rgba(255, 255, 255, 0.4)'
                  }}
                >
                  {/* Concave Meniscus Curve at Liquid Top */}
                  <div className="w-full h-2 bg-white/30 rounded-full blur-[0.4px]" />
                </div>

                {/* Cylinder Milliliter Ticks */}
                <div className="absolute inset-y-2 left-1 flex flex-col justify-between text-[7px] text-cyan-200/80 font-mono select-none">
                  <span>- {cylinderCapacity}</span>
                  <span>- {(cylinderCapacity * 0.8).toFixed(0)}</span>
                  <span>- {(cylinderCapacity * 0.6).toFixed(0)}</span>
                  <span>- {(cylinderCapacity * 0.4).toFixed(0)}</span>
                  <span>- {(cylinderCapacity * 0.2).toFixed(0)}</span>
                  <span>- 0</span>
                </div>
              </div>

              {/* Heavy Hexagonal Glass Base */}
              <div className="w-24 h-4 bg-gradient-to-t from-slate-700 to-slate-600 rounded-md border-t border-cyan-300/40 shadow-lg mt-0.5" />

              <span className="text-[10px] text-slate-400 mt-1 font-medium">
                {t(`مخبار مدرج سعة ${cylinderCapacity} mL`, `${cylinderCapacity} mL Graduated Cylinder`)}
              </span>
            </div>
          </div>

          {/* Action Transfer Button */}
          {cylinderVolume > 0 && (
            <div className={`w-full border rounded-xl p-3 flex items-center justify-between z-10 ${
              isDark ? 'bg-slate-900 border-teal-500/40' : 'bg-teal-50 border-teal-300'
            }`}>
              <div className="text-xs">
                <span className="text-slate-400">{t('الحجم الجاهز:', 'Measured Volume:')} </span>
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                  {cylinderVolume.toFixed(1)} mL {t(`من ${selectedLiquid.nameAr}`, `of ${selectedLiquid.nameEn}`)}
                </strong>
              </div>

              <button
                onClick={handleTransferToLab}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md transition-colors flex items-center gap-1.5"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                {t('سكب المحلول في معمل التفاعلات', 'Pour into Main Reaction Beaker')}
              </button>
            </div>
          )}
        </div>

        {/* Right Controls Column: Reagent Bottles & Pouring Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Reagent Bottle Select */}
          <div className={`rounded-xl border p-4 space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Layers className="w-4 h-4 text-teal-500" />
              {t('زجاجات المحاليل المخبرية', 'Laboratory Stock Solutions')}
            </h4>

            <div className="space-y-1.5">
              {STOCK_LIQUIDS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedLiquid(item);
                    if (soundEnabled) playLabSound('click');
                  }}
                  className={`w-full p-2.5 rounded-lg text-start text-xs border transition-all flex items-center justify-between ${
                    selectedLiquid.id === item.id
                      ? isDark
                        ? 'bg-teal-950/80 border-teal-500 text-teal-200 shadow-sm'
                        : 'bg-teal-100 border-teal-500 text-teal-900 shadow-sm'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div>
                    <strong className={`block font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {t(item.nameAr, item.nameEn)}
                    </strong>
                    <span className="text-[10px] font-mono text-teal-500 font-bold">{item.formula}</span>
                  </div>

                  <span
                    className="w-4 h-4 rounded-full border border-slate-600 shadow-inner"
                    style={{ backgroundColor: item.color }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Pouring and Pipetting Controls */}
          <div className={`rounded-xl border p-4 space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Droplets className="w-4 h-4 text-teal-500" />
              {t('أدوات السكب والسحب', 'Pouring & Pipette Controls')}
            </h4>

            <div className="space-y-2">
              <span className="text-xs text-slate-400 block">
                {t('سكب مباشر من الزجاجة في المخبار:', 'Direct Pour from Bottle:')}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 20].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handlePourFromBottle(amt)}
                    className={`py-1.5 rounded text-xs font-mono font-bold border transition-colors ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-teal-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-400'
                    }`}
                  >
                    +{amt} mL
                  </button>
                ))}
              </div>

              <span className={`text-xs text-slate-400 block pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                {t('سحب السائل بواسطة الماصة الدقيقة:', 'Volumetric Pipette Transfer:')}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAspirate(1.0)}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    isDark
                      ? 'bg-teal-950/70 hover:bg-teal-900 text-teal-200 border-teal-700'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-300'
                  }`}
                >
                  <Droplet className="w-3.5 h-3.5" />
                  {t('سحب 1.0 mL بالماصة', 'Aspirate 1.0 mL')}
                </button>

                <button
                  onClick={() => handleAspirate(5.0)}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    isDark
                      ? 'bg-teal-950/70 hover:bg-teal-900 text-teal-200 border-teal-700'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-300'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5" />
                  {t('ملء الماصة بالكامل (5 mL)', 'Fill Pipette (5.0 mL)')}
                </button>
              </div>
            </div>
          </div>

          {/* Educational Note on Meniscus */}
          <div className={`rounded-xl border p-4 text-xs space-y-1.5 ${
            isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center gap-1.5 text-teal-500 font-bold">
              <Info className="w-3.5 h-3.5" />
              {t('كيف تقرأ سطح السائل المقعر (Meniscus)؟', 'How to Read the Liquid Meniscus')}
            </div>
            <p className="text-[11px] leading-relaxed">
              {t(
                'بسبب قوى التلاصق بين جزيئات الماء وزجاج المخبار، ينحني سطح السائل مشكلاً تقعراً للأسفل. القاعدة العلمية الدقيقة تنص على أن تكون العين على مستوى أفقي مباشر مع قاع التقعر السفلي للحصول على قراءة صحيحة دون خطأ اختلاف زاوية الرؤية (Parallax Error).',
                'Due to adhesive forces between liquid molecules and glass, aqueous solutions form a concave curve. Always align your eye level horizontally with the bottom of the meniscus curve to avoid parallax reading error.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
