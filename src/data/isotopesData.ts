export interface IsotopeInfo {
  id: string;
  name: string;
  symbol: string;
  atomicNumber: number;
  massNumber: number;
  halfLifeStr: string;
  realHalfLife: number; // numeric value for scaling
  timeUnit: string; // 'أيام' | 'سنة' | 'مليار سنة'
  displayTimeFactor: number; // to scale display time
  decayMode: 'alpha' | 'beta' | 'beta-gamma';
  decayModeAr: string;
  equation: string;
  parentName: string;
  daughterName: string;
  daughterSymbol: string;
  daughterAtomic: number;
  daughterMass: number;
  emittedParticleDesc: string;
  category: string;
  practicalUse: string;
  scienceDesc: string;
}

export const ISOTOPES: Record<string, IsotopeInfo> = {
  carbon14: {
    id: 'carbon14',
    name: 'الكربون-14',
    symbol: '¹⁴₆C',
    atomicNumber: 6,
    massNumber: 14,
    halfLifeStr: '5,730 سنة',
    realHalfLife: 5730,
    timeUnit: 'سنة',
    displayTimeFactor: 5730,
    decayMode: 'beta',
    decayModeAr: 'اضمحلال بيتا سالبة (β⁻)',
    equation: '¹⁴₆C → ¹⁴₇N + e⁻ + ν̄',
    parentName: 'كربون-14',
    daughterName: 'نيتروجين-14',
    daughterSymbol: '¹⁴₇N',
    daughterAtomic: 7,
    daughterMass: 14,
    emittedParticleDesc: 'إلكترون فائق السرعة (جسيم بيتا) ومضاد نيوترينو إلكتروني (ν̄)',
    category: 'علم الآثار والجيولوجيا',
    practicalUse: 'تحديد الأعمار الإشعاعية للمستحاثات والمخطوطات وبقايا الكائنات الحية القديمة بدقة حتى 50,000 سنة.',
    scienceDesc: 'ينتج الكربون-14 في طبقات الجو العليا بفعل قصف الأشعة الكونية لذرات النيتروجين. تمتصه النباتات أثناء التمثيل الضوئي ويتوقف التجدد عند موت الكائن لتبدأ ساعة التحلل الأسي.'
  },
  iodine131: {
    id: 'iodine131',
    name: 'اليود-131',
    symbol: '¹³¹₅₃I',
    atomicNumber: 53,
    massNumber: 131,
    halfLifeStr: '8.02 أيام',
    realHalfLife: 8.02,
    timeUnit: 'أيام',
    displayTimeFactor: 8.02,
    decayMode: 'beta-gamma',
    decayModeAr: 'اضمحلال بيتا وغاما (β⁻ + γ)',
    equation: '¹³¹₅₃I → ¹³¹₅₄Xe + e⁻ + ν̄ + γ',
    parentName: 'يود-131',
    daughterName: 'زينون-131',
    daughterSymbol: '¹³¹₅₄Xe',
    daughterAtomic: 54,
    daughterMass: 131,
    emittedParticleDesc: 'إلكترون بيتا عالي الطاقة مع فوتونات أشعة غاما الكهرومغناطيسية المخترقة',
    category: 'الطب النووي والأورام',
    practicalUse: 'العلاج الإشعاعي المستهدف الأكثر نجاحاً لسرطان الغدة الدرقية وفرط نشاطها، حيث تمتصه الغدة حصراً.',
    scienceDesc: 'نظير مشع حاسم في الطب؛ تمتصه خلايا الغدة الدرقية بشراهة طبيعية، فتقوم جسيمات بيتا المنبعثة قصيرة المدى (حوالي 1 ملم) بتدمير الخلايا السرطانية المستهدفة دون إيذاء باقي الأنسجة السليمة.'
  },
  radon222: {
    id: 'radon222',
    name: 'الرادون-222',
    symbol: '²²²₈₆Rn',
    atomicNumber: 86,
    massNumber: 222,
    halfLifeStr: '3.82 أيام',
    realHalfLife: 3.82,
    timeUnit: 'أيام',
    displayTimeFactor: 3.82,
    decayMode: 'alpha',
    decayModeAr: 'اضمحلال ألفا عالي الطاقة (α)',
    equation: '²²²₈₆Rn → ²¹⁸₈₄Po + ⁴₂He²⁺',
    parentName: 'رادون-222',
    daughterName: 'بولونيوم-218',
    daughterSymbol: '²¹⁸₈₄Po',
    daughterAtomic: 84,
    daughterMass: 218,
    emittedParticleDesc: 'جسيم ألفا ثقيل (نواة هيليوم مكونة من بروتونين ونيوترونين ⁴₂He²⁺)',
    category: 'السلامة والبيئة الإشعاعية',
    practicalUse: 'رصد النشاط الزلزالي في المياه الجوفية وفحص التهوية البيئية للمباني والمناجم لحماية الرئتين.',
    scienceDesc: 'غاز نبيل مشع ثقيل ناتج عن تحلل الراديوم واليورانيوم في صخور القشرة الأرضية والغرانيت. لكونه غازاً، يتسرب إلى أقبية المنازل ويعد السبب الرئيسي الثاني لسرطان الرئة بعد التدخين عالمياً.'
  },
  cesium137: {
    id: 'cesium137',
    name: 'السيزيوم-137',
    symbol: '¹³⁷₅₅Cs',
    atomicNumber: 55,
    massNumber: 137,
    halfLifeStr: '30.17 سنة',
    realHalfLife: 30.17,
    timeUnit: 'سنة',
    displayTimeFactor: 30.17,
    decayMode: 'beta-gamma',
    decayModeAr: 'اضمحلال بيتا وغاما (β⁻ + γ)',
    equation: '¹³⁷₅₅Cs → ¹³⁷₅₆Ba + e⁻ + ν̄ + γ',
    parentName: 'سيزيوم-137',
    daughterName: 'باريوم-137',
    daughterSymbol: '¹³⁷₅₆Ba',
    daughterAtomic: 56,
    daughterMass: 137,
    emittedParticleDesc: 'جسيم بيتا يتبعه فوتون غاما بطاقة 661.7 كيلو إلكترون فولت (keV)',
    category: 'التطبيقات الصناعية والنووية',
    practicalUse: 'معايرة أجهزة الكشف الإشعاعي، ومقاييس قياس سماكة الفولاذ والورق، وقياس رطوبة وكثافة التربة في مشاريع السدود.',
    scienceDesc: 'أحد أهم وأخطر نواتج الانشطار النووي في مفاعلات الطاقة الذرية، يتميز بقابليته العالية للذوبان كأملاح، ويستخدم نصف عمره (30 سنة) كمؤشر لمراقبة التلوث الإشعاعي بعد حوادث المفاعلات.'
  },
  cobalt60: {
    id: 'cobalt60',
    name: 'الكوبالت-60',
    symbol: '⁶⁰₂₇Co',
    atomicNumber: 27,
    massNumber: 60,
    halfLifeStr: '5.27 سنة',
    realHalfLife: 5.27,
    timeUnit: 'سنة',
    displayTimeFactor: 5.27,
    decayMode: 'beta-gamma',
    decayModeAr: 'اضمحلال بيتا وأشعة غاما قوية (β⁻, γ)',
    equation: '⁶⁰₂₇Co → ⁶⁰₂₈Ni + e⁻ + ν̄ + 2γ',
    parentName: 'كوبالت-60',
    daughterName: 'نيكل-60',
    daughterSymbol: '⁶⁰₂₈Ni',
    daughterAtomic: 28,
    daughterMass: 60,
    emittedParticleDesc: 'فوتونا غاما متزامنان فائقَا الطاقة (1.17 و 1.33 ميغا إلكترون فولت MeV)',
    category: 'الطب والتعقيم الصناعي',
    practicalUse: 'أجهزة سكين غاما (Gamma Knife) لجراحة أورام المخ الدقيقة، وتعقيم المعدات الطبية ذات الاستخدام الواحد والأغذية.',
    scienceDesc: 'نظير اصطناعي مشع يصنع بتنشيط الكوبالت-59 الطبيعي داخل المفاعلات النيوترونية، يوفر طاقة إشعاعية عالية ومستمرة ومثالية لإتلاف الحمض النووي للجراثيم والخلايا الضارة.'
  },
  uranium238: {
    id: 'uranium238',
    name: 'اليورانيوم-238',
    symbol: '²³⁸₉₂U',
    atomicNumber: 92,
    massNumber: 238,
    halfLifeStr: '4.468 مليار سنة',
    realHalfLife: 4.468,
    timeUnit: 'مليار سنة',
    displayTimeFactor: 4.468,
    decayMode: 'alpha',
    decayModeAr: 'اضمحلال ألفا الثقيل (α)',
    equation: '²³⁸₉₂U → ²³⁴₉₀Th + ⁴₂He²⁺',
    parentName: 'يورانيوم-238',
    daughterName: 'ثوريوم-234',
    daughterSymbol: '²³⁴₉₀Th',
    daughterAtomic: 90,
    daughterMass: 234,
    emittedParticleDesc: 'جسيم ألفا ثقيل يحمل طاقة حركية قدرها 4.27 ميغا إلكترون فولت',
    category: 'الجيولوجيا وتأريخ الأرض',
    practicalUse: 'تحديد العمر الجيولوجي المطلق لكوكب الأرض وتكون صخور القمر والنيازك الفضائية (تأريخ اليورانيوم-الرصاص).',
    scienceDesc: 'يشكل 99.27% من اليورانيوم الطبيعي في كوكب الأرض، يماثل نصف عمره تقريباً عمر النظام الشمسي والأرض (4.5 مليار سنة)، وهو رأس سلسلة الاضمحلال النووي الشهيرة التي تنتهي بالرصاص-206 المستقر.'
  }
};
