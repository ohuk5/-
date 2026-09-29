export interface SubstanceInfo {
  id: string;
  name: string;
  nameEn: string;
  formula: string;
  meltingPointK: number; // T_m in Kelvin
  boilingPointK: number; // T_b in Kelvin
  particleType: 'monatomic' | 'diatomic' | 'water' | 'co2' | 'methane' | 'metallic';
  color: string;
  themeColor: string;
  desc: string;
  descEn: string;
  defaultTempK: number;
  mass: number; // atomic or molecular mass in u
  criticalPressureAtm?: number;
  isSublimating?: boolean;
}

export const SUBSTANCES: Record<string, SubstanceInfo> = {
  water: {
    id: 'water',
    name: 'الماء',
    nameEn: 'Water',
    formula: 'H₂O',
    meltingPointK: 273.15, // 0 °C
    boilingPointK: 373.15, // 100 °C
    particleType: 'water',
    color: '#38bdf8',
    themeColor: 'blue',
    desc: 'مذيب الحياة الكوني، يمتلك روابط هيدروجينية فريدة تجعل الجليد أقل كثافة من الماء السائل ويطفو فوقه، ويحتاج طاقة كامنة عالية للتبخر.',
    descEn: 'Universal solvent of life with unique hydrogen bonds causing ice to float over liquid water and requiring high latent heat of vaporization.',
    defaultTempK: 300, // 27 °C
    mass: 18.015
  },
  mercury: {
    id: 'mercury',
    name: 'الزئبق',
    nameEn: 'Mercury',
    formula: 'Hg',
    meltingPointK: 234.32, // -38.83 °C
    boilingPointK: 629.88, // 356.73 °C
    particleType: 'metallic',
    color: '#cbd5e1',
    themeColor: 'slate',
    desc: 'المعدن الوحيد الذي يتواجد في الحالة السائلة عند درجة حرارة الغرفة القياسية، يتميز بكثافة وتوتر سطحي هائلين وقوى تماسك معدنية قوية.',
    descEn: 'The only metal that is liquid at standard room temperature, featuring extreme density, high surface tension, and strong metallic bonds.',
    defaultTempK: 298,
    mass: 200.59
  },
  helium: {
    id: 'helium',
    name: 'الهيليوم',
    nameEn: 'Helium',
    formula: 'He',
    meltingPointK: 0.95, // Under 25 atm
    boilingPointK: 4.22, // -268.93 °C
    particleType: 'monatomic',
    color: '#facc15',
    themeColor: 'yellow',
    desc: 'أخف الغازات النبيلة وأقلها نقطة غليان في الكون (4.22 K)، لا يتجمد عند الضغط الجوي العادي حتى عند الصفر المطلق بسبب التأثيرات الميكانيكية الكمومية.',
    descEn: 'Lightest noble gas with the lowest boiling point in the universe (4.22 K). Stays liquid down to absolute zero under normal pressure due to quantum effects.',
    defaultTempK: 15,
    mass: 4.0026
  },
  neon: {
    id: 'neon',
    name: 'النيون',
    nameEn: 'Neon',
    formula: 'Ne',
    meltingPointK: 24.56, // -248.59 °C
    boilingPointK: 27.07, // -246.08 °C
    particleType: 'monatomic',
    color: '#06b6d4',
    themeColor: 'cyan',
    desc: 'غاز نبيل خامل أحادي الذرة، قوى التجاذب البينية بين ذراته (فان دير فالس) ضعيفة جداً، لذلك يتكثف ويتصلب فقط عند درجات برودة سحيقة قريبة من الصفر المطلق.',
    descEn: 'Inert monoatomic noble gas with very weak van der Waals forces, condensing and solidifying only at cryogenic temperatures close to absolute zero.',
    defaultTempK: 50,
    mass: 20.18
  },
  argon: {
    id: 'argon',
    name: 'الأرغون',
    nameEn: 'Argon',
    formula: 'Ar',
    meltingPointK: 83.81, // -189.34 °C
    boilingPointK: 87.30, // -185.85 °C
    particleType: 'monatomic',
    color: '#a855f7',
    themeColor: 'purple',
    desc: 'غاز نبيل كتلته الذرية أكبر (40 u)، يتميز بنطاق سائل ضيق جداً (حوالي 3.5 كلفن فقط بين الانصهار والغليان) قبل أن يتحول لغاز عازل.',
    descEn: 'Noble gas with a narrow liquid range (only ~3.5 K between melting and boiling) before expanding into an insulating shielding gas.',
    defaultTempK: 110,
    mass: 39.948
  },
  oxygen: {
    id: 'oxygen',
    name: 'الأكسجين',
    nameEn: 'Oxygen',
    formula: 'O₂',
    meltingPointK: 54.36, // -218.79 °C
    boilingPointK: 90.20, // -182.95 °C
    particleType: 'diatomic',
    color: '#ef4444',
    themeColor: 'red',
    desc: 'جزيء ثنائي الذرة تترابط فيه ذرتا أكسجين برابطة تساهمية ثنائية متينة، الأكسجين السائل له لون أزرق باهت وخاصية مغناطيسية (بارامغناطيسي).',
    descEn: 'Diatomic molecule with a strong double covalent bond. Liquid oxygen has a pale blue color and paramagnetic properties.',
    defaultTempK: 130,
    mass: 31.998
  },
  nitrogen: {
    id: 'nitrogen',
    name: 'النيتروجين',
    nameEn: 'Nitrogen',
    formula: 'N₂',
    meltingPointK: 63.15, // -210.00 °C
    boilingPointK: 77.36, // -195.79 °C
    particleType: 'diatomic',
    color: '#10b981',
    themeColor: 'emerald',
    desc: 'جزيء ثنائي الذرة برابطة تساهمية ثلاثية فائقة القوة، النيتروجين السائل هو المبرد الأكثر شيوعاً في المستشفيات والمختبرات العالمية.',
    descEn: 'Diatomic molecule with an ultra-strong triple covalent bond. Liquid nitrogen is the most widely used cryogenic coolant worldwide.',
    defaultTempK: 100,
    mass: 28.014
  },
  co2: {
    id: 'co2',
    name: 'ثاني أكسيد الكربون',
    nameEn: 'Carbon Dioxide',
    formula: 'CO₂',
    meltingPointK: 194.65, // -78.5 °C (Sublimation point at 1 atm)
    boilingPointK: 216.58, // Triple point at 5.11 atm is 216.6 K
    particleType: 'co2',
    color: '#94a3b8',
    themeColor: 'slate',
    desc: 'يشتهر بظاهرة التسامي عند الضغط القياسي (الجليد الجاف يتحول مباشرة من صلب إلى غاز دون المرور بالحالة السائلة)، إلا إذا زاد الضغط عن 5.1 ض.ج.',
    descEn: 'Famous for sublimation at 1 atm (dry ice turns directly from solid to gas without liquid phase), unless pressure exceeds the triple point of 5.11 atm.',
    defaultTempK: 250,
    mass: 44.01,
    isSublimating: true,
    criticalPressureAtm: 5.11
  },
  methane: {
    id: 'methane',
    name: 'الميثان',
    nameEn: 'Methane',
    formula: 'CH₄',
    meltingPointK: 90.7, // -182.45 °C
    boilingPointK: 111.66, // -161.49 °C
    particleType: 'methane',
    color: '#14b8a6',
    themeColor: 'teal',
    desc: 'أبسط مركب هيدروكربوني والمكون الأساسي للغاز الطبيعي، يشكل بحيرات وأنهاراً سائلة على سطح قمر تيتان في كوكب زحل في درجات برودة قاسية.',
    descEn: 'Simplest hydrocarbon and main component of natural gas, forming extraterrestrial liquid lakes and rain on Saturn’s moon Titan.',
    defaultTempK: 140,
    mass: 16.04
  },
  iron: {
    id: 'iron',
    name: 'الحديد',
    nameEn: 'Iron',
    formula: 'Fe',
    meltingPointK: 1811, // 1538 °C
    boilingPointK: 3134, // 2862 °C
    particleType: 'metallic',
    color: '#f97316',
    themeColor: 'orange',
    desc: 'فلز انتقالي صلب عند درجة حرارة الغرفة، ترتبط ذراته بروابط فلزية صلبة وشبكة بلورية مكعبة متراصة لا تنصهر إلا تحت درجات حرارة فائقة.',
    descEn: 'Solid transition metal at room temperature with high melting point (1811 K) and boiling point (3134 K) driven by intense metallic bonding.',
    defaultTempK: 300,
    mass: 55.845
  },
  gold: {
    id: 'gold',
    name: 'الذهب',
    nameEn: 'Gold',
    formula: 'Au',
    meltingPointK: 1337.33, // 1064.18 °C
    boilingPointK: 3243, // 2970 °C
    particleType: 'metallic',
    color: '#eab308',
    themeColor: 'yellow',
    desc: 'فلز نبيل براق وفائق الكثافة ومقاوم للتآكل، تتجمع ذراته في شبكة بلورية مكعبة ذات بريق ذهبي لامع ينصهر عند 1337 K ويغلي عند 3243 K.',
    descEn: 'Dense, corrosion-resistant noble metal with a luminous golden luster. Melts into a liquid at 1337 K and boils at an extreme 3243 K.',
    defaultTempK: 300,
    mass: 196.97
  },
  bromine: {
    id: 'bromine',
    name: 'البروم',
    nameEn: 'Bromine',
    formula: 'Br₂',
    meltingPointK: 265.8, // -7.35 °C
    boilingPointK: 332.0, // 58.85 °C
    particleType: 'diatomic',
    color: '#b91c1c',
    themeColor: 'red',
    desc: 'العنصر اللافلزي الوحيد السائل في درجة حرارة الغرفة القياسية، سائل هالوجيني أحمر داكن ثقيل وسريع التطاير لبخار بني كثيف عند 58.8 °C.',
    descEn: 'The only non-metallic element that is liquid at standard room temperature. A heavy, volatile reddish-brown halogen boiling at only 58.8 °C.',
    defaultTempK: 295,
    mass: 159.808
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
  pressureAtm: number = 1.0,
  lang: 'ar' | 'en' = 'ar'
): {
  phase: MatterPhase;
  phaseName: string;
  badgeClass: string;
  detail: string;
  effectiveTm: number;
  effectiveTb: number;
} {
  const Tm = calculateEffectiveMeltingPoint(substance, pressureAtm);
  const Tb = calculateEffectiveBoilingPoint(substance, pressureAtm);
  const tolerance = Math.max(1.5, Math.abs(Tb - Tm) * 0.06);

  const isAr = lang === 'ar';

  // Special CO2 sublimation check at normal atmospheric pressure (< 5.1 atm)
  if (substance.isSublimating && pressureAtm < 5.1) {
    if (Math.abs(tempK - Tm) <= tolerance) {
      return {
        phase: 'melting',
        phaseName: isAr ? 'تحول طوري: تسامي / ترسب' : 'Phase Transition: Sublimation / Deposition',
        badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
        detail: isAr
          ? `الحرارة عند نقطة التسامي (${Tm.toFixed(1)} K). عند ضغط أقل من 5.1 ض.ج، يتحول الجليد الجاف مباشرة من الحالة الصلبة إلى الغاز دون المرور بالسائل.`
          : `Temperature at sublimation point (${Tm.toFixed(1)} K). Below 5.1 atm, dry ice sublimates directly between solid and gas without liquid phase.`,
        effectiveTm: Tm,
        effectiveTb: Tb
      };
    }
    if (tempK < Tm) {
      return {
        phase: 'solid',
        phaseName: isAr ? 'الحالة الصلبة (جليد جاف)' : 'Solid Phase (Dry Ice)',
        badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-500/60',
        detail: isAr
          ? `درجة الحرارة (${tempK.toFixed(1)} K) دون نقطة التسامي. جزيئات CO₂ متراصة في بلورات صلبة.`
          : `Temperature (${tempK.toFixed(1)} K) is below sublimation point. CO₂ molecules are locked in crystalline lattice.`,
        effectiveTm: Tm,
        effectiveTb: Tb
      };
    }
    return {
      phase: 'gas',
      phaseName: isAr ? 'الحالة الغازية' : 'Gas Phase',
      badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-500/60',
      detail: isAr
        ? `درجة الحرارة (${tempK.toFixed(1)} K) أعلى من نقطة التسامي (${Tm.toFixed(1)} K). يتطاير غاز CO₂ بحرية كاملة دون سائل لأن الضغط أقل من النقطة الثلاثية (5.1 Atm).`
        : `Temperature (${tempK.toFixed(1)} K) exceeds sublimation point (${Tm.toFixed(1)} K). CO₂ disperses freely as a gas since pressure is below 5.11 atm.`,
      effectiveTm: Tm,
      effectiveTb: Tb
    };
  }

  if (Math.abs(tempK - Tm) <= tolerance) {
    return {
      phase: 'melting',
      phaseName: isAr ? 'تحول طوري: انصهار / تجمد' : 'Phase Transition: Melting / Freezing',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
      detail: isAr
        ? `الحرارة عند نقطة الانصهار الفعالة (${Tm.toFixed(1)} K تحت ضغط ${pressureAtm.toFixed(2)} Atm). الجسيمات تكتسب الطاقة الكامنة لتفكيك الشبكة.`
        : `At effective melting point (${Tm.toFixed(1)} K under ${pressureAtm.toFixed(2)} Atm). Particles absorb latent heat to break crystalline bonds.`,
      effectiveTm: Tm,
      effectiveTb: Tb
    };
  }

  if (Math.abs(tempK - Tb) <= tolerance) {
    return {
      phase: 'boiling',
      phaseName: isAr ? 'تحول طوري: غليان / تكاثف' : 'Phase Transition: Boiling / Condensation',
      badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-500/60',
      detail: isAr
        ? `الحرارة عند نقطة الغليان الفعالة (${Tb.toFixed(1)} K تحت ضغط ${pressureAtm.toFixed(2)} Atm). ضغط بخار السائل يعادل الضغط المحيط.`
        : `At effective boiling point (${Tb.toFixed(1)} K under ${pressureAtm.toFixed(2)} Atm). Vapor pressure balances container pressure.`,
      effectiveTm: Tm,
      effectiveTb: Tb
    };
  }

  if (tempK < Tm) {
    return {
      phase: 'solid',
      phaseName: isAr ? 'الحالة الصلبة (Solid)' : 'Solid State (Crystal)',
      badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-500/60',
      detail: isAr
        ? `الحرارة (${tempK.toFixed(1)} K) أقل من نقطة الانصهار (${Tm.toFixed(1)} K). الجزيئات مقيدة وتهتز فقط حول مراكز اتزانها.`
        : `Temperature (${tempK.toFixed(1)} K) is below melting point (${Tm.toFixed(1)} K). Particles vibrate tightly around lattice sites.`,
      effectiveTm: Tm,
      effectiveTb: Tb
    };
  }

  if (tempK > Tb) {
    return {
      phase: 'gas',
      phaseName: isAr ? 'الحالة الغازية (Gas)' : 'Gas State (Vapor)',
      badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-500/60',
      detail: isAr
        ? `الحرارة (${tempK.toFixed(1)} K) تفوق نقطة الغليان الفعالة (${Tb.toFixed(1)} K). الجزيئات تتباعد وتملأ كامل الحجم بطاقة حركية عالية.`
        : `Temperature (${tempK.toFixed(1)} K) exceeds boiling point (${Tb.toFixed(1)} K). High kinetic energy overcomes intermolecular attractions.`,
      effectiveTm: Tm,
      effectiveTb: Tb
    };
  }

  return {
    phase: 'liquid',
    phaseName: isAr ? 'الحالة السائلة (Liquid)' : 'Liquid State (Fluid)',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60',
    detail: isAr
      ? `الحرارة (${tempK.toFixed(1)} K) بين الانصهار (${Tm.toFixed(1)} K) والغليان (${Tb.toFixed(1)} K). السائل مائع يأخذ شكل الوعاء بحجم ثابت نسبياً.`
      : `Temperature (${tempK.toFixed(1)} K) lies between melting (${Tm.toFixed(1)} K) and boiling (${Tb.toFixed(1)} K). Fluid conforms to vessel bottom.`,
    effectiveTm: Tm,
    effectiveTb: Tb
  };
}
