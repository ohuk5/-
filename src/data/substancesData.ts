export interface SubstanceInfo {
  id: string;
  name: string;
  formula: string;
  meltingPointK: number; // T_m in Kelvin
  boilingPointK: number; // T_b in Kelvin
  particleType: 'monatomic' | 'diatomic' | 'water' | 'co2' | 'methane' | 'metallic';
  color: string;
  themeColor: string;
  desc: string;
  defaultTempK: number;
  mass: number; // atomic or molecular mass in u
  criticalPressureAtm?: number;
  isSublimating?: boolean;
}

export const SUBSTANCES: Record<string, SubstanceInfo> = {
  water: {
    id: 'water',
    name: 'الماء',
    formula: 'H₂O',
    meltingPointK: 273.15, // 0 °C
    boilingPointK: 373.15, // 100 °C
    particleType: 'water',
    color: '#38bdf8',
    themeColor: 'blue',
    desc: 'مذيب الحياة الكوني، يمتلك روابط هيدروجينية فريدة تجعل الجليد أقل كثافة من الماء السائل ويطفو فوقه، ويحتاج طاقة كامنة عالية للتبخر.',
    defaultTempK: 300, // 27 °C
    mass: 18.015
  },
  mercury: {
    id: 'mercury',
    name: 'الزئبق',
    formula: 'Hg',
    meltingPointK: 234.32, // -38.83 °C
    boilingPointK: 629.88, // 356.73 °C
    particleType: 'metallic',
    color: '#cbd5e1',
    themeColor: 'slate',
    desc: 'المعدن الوحيد الذي يتواجد في الحالة السائلة عند درجة حرارة الغرفة القياسية، يتميز بكثافة وتوتر سطحي هائلين وقوى تماسك معدنية قوية.',
    defaultTempK: 298,
    mass: 200.59
  },
  helium: {
    id: 'helium',
    name: 'الهيليوم',
    formula: 'He',
    meltingPointK: 0.95, // Under 25 atm
    boilingPointK: 4.22, // -268.93 °C
    particleType: 'monatomic',
    color: '#facc15',
    themeColor: 'yellow',
    desc: 'أخف الغازات النبيلة وأقلها نقطة غليان في الكون (4.22 K)، لا يتجمد عند الضغط الجوي العادي حتى عند الصفر المطلق بسبب التأثيرات الميكانيكية الكمومية.',
    defaultTempK: 15,
    mass: 4.0026
  },
  neon: {
    id: 'neon',
    name: 'النيون',
    formula: 'Ne',
    meltingPointK: 24.56, // -248.59 °C
    boilingPointK: 27.07, // -246.08 °C
    particleType: 'monatomic',
    color: '#06b6d4',
    themeColor: 'cyan',
    desc: 'غاز نبيل خامل أحادي الذرة، قوى التجاذب البينية بين ذراته (فان دير فالس) ضعيفة جداً، لذلك يتكثف ويتصلب فقط عند درجات برودة سحيقة قريبة من الصفر المطلق.',
    defaultTempK: 50,
    mass: 20.18
  },
  argon: {
    id: 'argon',
    name: 'الأرغون',
    formula: 'Ar',
    meltingPointK: 83.81, // -189.34 °C
    boilingPointK: 87.30, // -185.85 °C
    particleType: 'monatomic',
    color: '#a855f7',
    themeColor: 'purple',
    desc: 'غاز نبيل كتلته الذرية أكبر (40 u)، يتميز بنطاق سائل ضيق جداً (حوالي 3.5 كلفن فقط بين الانصهار والغليان) قبل أن يتحول لغاز عازل.',
    defaultTempK: 110,
    mass: 39.948
  },
  oxygen: {
    id: 'oxygen',
    name: 'الأكسجين',
    formula: 'O₂',
    meltingPointK: 54.36, // -218.79 °C
    boilingPointK: 90.20, // -182.95 °C
    particleType: 'diatomic',
    color: '#ef4444',
    themeColor: 'red',
    desc: 'جزيء ثنائي الذرة تترابط فيه ذرتا أكسجين برابطة تساهمية ثنائية متينة، الأكسجين السائل له لون أزرق باهت وخاصية مغناطيسية (بارامغناطيسي).',
    defaultTempK: 130,
    mass: 31.998
  },
  nitrogen: {
    id: 'nitrogen',
    name: 'النيتروجين',
    formula: 'N₂',
    meltingPointK: 63.15, // -210.00 °C
    boilingPointK: 77.36, // -195.79 °C
    particleType: 'diatomic',
    color: '#10b981',
    themeColor: 'emerald',
    desc: 'جزيء ثنائي الذرة برابطة تساهمية ثلاثية فائقة القوة، النيتروجين السائل هو المبرد الأكثر شيوعاً في المستشفيات والمختبرات العالمية.',
    defaultTempK: 100,
    mass: 28.014
  },
  co2: {
    id: 'co2',
    name: 'ثاني أكسيد الكربون',
    formula: 'CO₂',
    meltingPointK: 194.65, // -78.5 °C (Sublimation point at 1 atm)
    boilingPointK: 216.58, // Triple point at 5.11 atm is 216.6 K
    particleType: 'co2',
    color: '#94a3b8',
    themeColor: 'slate',
    desc: 'يشتهر بظاهرة التسامي عند الضغط القياسي (الجليد الجاف يتحول مباشرة من صلب إلى غاز دون المرور بالحالة السائلة)، إلا إذا زاد الضغط عن 5.1 ض.ج.',
    defaultTempK: 250,
    mass: 44.01,
    isSublimating: true,
    criticalPressureAtm: 5.11
  },
  methane: {
    id: 'methane',
    name: 'الميثان',
    formula: 'CH₄',
    meltingPointK: 90.7, // -182.45 °C
    boilingPointK: 111.66, // -161.49 °C
    particleType: 'methane',
    color: '#14b8a6',
    themeColor: 'teal',
    desc: 'أبسط مركب هيدروكربوني والمكون الأساسي للغاز الطبيعي، يشكل بحيرات وأنهاراً سائلة على سطح قمر تيتان في كوكب زحل في درجات برودة قاسية.',
    defaultTempK: 140,
    mass: 16.04
  },
  iron: {
    id: 'iron',
    name: 'الحديد',
    formula: 'Fe',
    meltingPointK: 1811, // 1538 °C (Normalized scale in simulator)
    boilingPointK: 3134, // 2862 °C
    particleType: 'metallic',
    color: '#f97316',
    themeColor: 'orange',
    desc: 'فلز انتقالي صلب عند درجة حرارة الغرفة، ترتبط ذراته بروابط فلزية صلبة وشبكة بلورية مكعبة متراصة لا تنصهر إلا تحت درجات حرارة فائقة.',
    defaultTempK: 300,
    mass: 55.845
  }
};

export type MatterPhase = 'solid' | 'melting' | 'liquid' | 'boiling' | 'gas';

export function calculateEffectiveBoilingPoint(substance: SubstanceInfo, pressureAtm: number): number {
  // Clausius-Clapeyron approx: higher pressure raises boiling point
  const pressureFactor = Math.pow(Math.max(0.08, pressureAtm), 0.11);
  return substance.boilingPointK * pressureFactor;
}

export function calculateEffectiveMeltingPoint(substance: SubstanceInfo, pressureAtm: number): number {
  // Pressure has slight effect on melting point
  return substance.meltingPointK * (1 + (pressureAtm - 1) * 0.002);
}

export function calculatePhase(
  tempK: number,
  substance: SubstanceInfo,
  pressureAtm: number = 1.0
): {
  phase: MatterPhase;
  phaseAr: string;
  badgeClass: string;
  detail: string;
  effectiveTm: number;
  effectiveTb: number;
} {
  const Tm = calculateEffectiveMeltingPoint(substance, pressureAtm);
  const Tb = calculateEffectiveBoilingPoint(substance, pressureAtm);
  const tolerance = Math.max(1.5, Math.abs(Tb - Tm) * 0.06);

  // Special CO2 sublimation check at normal atmospheric pressure (< 5.1 atm)
  if (substance.isSublimating && pressureAtm < 5.1) {
    if (Math.abs(tempK - Tm) <= tolerance) {
      return {
        phase: 'melting',
        phaseAr: 'تحول طوري: تسامي / ترسب',
        badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
        detail: `الحرارة عند نقطة التسامي (${Tm.toFixed(1)} K). عند ضغط أقل من 5.1 ض.ج، يتحول الجليد الجاف مباشرة من الحالة الصلبة إلى الغاز دون المرور بالسائل.`,
        effectiveTm: Tm,
        effectiveTb: Tb
      };
    }
    if (tempK < Tm) {
      return {
        phase: 'solid',
        phaseAr: 'الحالة الصلبة (Solid - جليد جاف)',
        badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-500/60',
        detail: `درجة الحرارة (${tempK.toFixed(1)} K) دون نقطة التسامي. جزيئات CO₂ متراصة في بلورات صلبة.`,
        effectiveTm: Tm,
        effectiveTb: Tb
      };
    }
    return {
      phase: 'gas',
      phaseAr: 'الحالة الغازية (Gas)',
      badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-500/60',
      detail: `درجة الحرارة (${tempK.toFixed(1)} K) أعلى من نقطة التسامي (${Tm.toFixed(1)} K). يتطاير غاز CO₂ بحرية كاملة دون سائل لأن الضغط أقل من النقطة الثلاثية (5.1 Atm).`,
      effectiveTm: Tm,
      effectiveTb: Tb
    };
  }

  if (Math.abs(tempK - Tm) <= tolerance) {
    return {
      phase: 'melting',
      phaseAr: 'تحول طوري: انصهار / تجمد',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
      detail: `الحرارة عند نقطة الانصهار الفعالة (${Tm.toFixed(1)} K تحت ضغط ${pressureAtm.toFixed(2)} Atm). الجسيمات تكتسب الطاقة الكامنة اللازمة لتفكيك الشبكة البلورية.`,
      effectiveTm: Tm,
      effectiveTb: Tb
    };
  }

  if (Math.abs(tempK - Tb) <= tolerance) {
    return {
      phase: 'boiling',
      phaseAr: 'تحول طوري: غليان / تكاثف',
      badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-500/60',
      detail: `الحرارة عند نقطة الغليان الفعالة (${Tb.toFixed(1)} K تحت ضغط ${pressureAtm.toFixed(2)} Atm). ضغط بخار السائل يعادل الضغط المحيط وتهرب الجزيئات كغاز.`,
      effectiveTm: Tm,
      effectiveTb: Tb
    };
  }

  if (tempK < Tm) {
    return {
      phase: 'solid',
      phaseAr: 'الحالة الصلبة (Solid)',
      badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-500/60',
      detail: `الحرارة (${tempK.toFixed(1)} K) أقل من نقطة الانصهار (${Tm.toFixed(1)} K). الجزيئات مقيدة في مواضع شبكية وتهتز فقط حول مراكز اتزانها.`,
      effectiveTm: Tm,
      effectiveTb: Tb
    };
  }

  if (tempK > Tb) {
    return {
      phase: 'gas',
      phaseAr: 'الحالة الغازية (Gas)',
      badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-500/60',
      detail: `الحرارة (${tempK.toFixed(1)} K) تفوق نقطة الغليان الفعالة (${Tb.toFixed(1)} K). قوى التجاذب البيني لا تقوى على حجز الجزيئات فتتباعد وتملأ كامل الحجم.`,
      effectiveTm: Tm,
      effectiveTb: Tb
    };
  }

  return {
    phase: 'liquid',
    phaseAr: 'الحالة السائلة (Liquid)',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60',
    detail: `الحرارة (${tempK.toFixed(1)} K) تقع بين درجتي الانصهار (${Tm.toFixed(1)} K) والغليان (${Tb.toFixed(1)} K). السائل مائع يأخذ شكل الوعاء مع احتفاظه بحجم ثابت نسبياً.`,
    effectiveTm: Tm,
    effectiveTb: Tb
  };
}
