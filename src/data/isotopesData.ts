export interface IsotopeInfo {
  id: string;
  name: string;
  nameEn: string;
  symbol: string;
  atomicNumber: number;
  massNumber: number;
  halfLifeStr: string;
  halfLifeStrEn: string;
  realHalfLife: number; // numeric value for scaling
  timeUnit: string; // 'أيام' | 'سنة' | 'مليار سنة'
  timeUnitEn: string;
  displayTimeFactor: number; // to scale display time
  decayMode: 'alpha' | 'beta' | 'beta-gamma';
  decayModeAr: string;
  decayModeEn: string;
  equation: string;
  parentName: string;
  parentNameEn: string;
  daughterName: string;
  daughterNameEn: string;
  daughterSymbol: string;
  daughterAtomic: number;
  daughterMass: number;
  emittedParticleDesc: string;
  emittedParticleDescEn: string;
  category: string;
  categoryEn: string;
  practicalUse: string;
  practicalUseEn: string;
  scienceDesc: string;
  scienceDescEn: string;
}

export const ISOTOPES: Record<string, IsotopeInfo> = {
  carbon14: {
    id: 'carbon14',
    name: 'الكربون-14',
    nameEn: 'Carbon-14',
    symbol: '¹⁴₆C',
    atomicNumber: 6,
    massNumber: 14,
    halfLifeStr: '5,730 سنة',
    halfLifeStrEn: '5,730 years',
    realHalfLife: 5730,
    timeUnit: 'سنة',
    timeUnitEn: 'years',
    displayTimeFactor: 5730,
    decayMode: 'beta',
    decayModeAr: 'اضمحلال بيتا سالبة (β⁻)',
    decayModeEn: 'Beta-minus Decay (β⁻)',
    equation: '¹⁴₆C → ¹⁴₇N + e⁻ + ν̄',
    parentName: 'كربون-14',
    parentNameEn: 'Carbon-14',
    daughterName: 'نيتروجين-14',
    daughterNameEn: 'Nitrogen-14',
    daughterSymbol: '¹⁴₇N',
    daughterAtomic: 7,
    daughterMass: 14,
    emittedParticleDesc: 'إلكترون فائق السرعة (جسيم بيتا) ومضاد نيوترينو إلكتروني (ν̄)',
    emittedParticleDescEn: 'High-speed electron (beta particle) and electron antineutrino (ν̄)',
    category: 'علم الآثار والجيولوجيا',
    categoryEn: 'Archeology & Geological Dating',
    practicalUse: 'تحديد الأعمار الإشعاعية للمستحاثات والمخطوطات وبقايا الكائنات الحية القديمة بدقة حتى 50,000 سنة.',
    practicalUseEn: 'Radiocarbon dating of fossils, ancient manuscripts, and organic artifacts up to 50,000 years old.',
    scienceDesc: 'ينتج الكربون-14 في طبقات الجو العليا بفعل قصف الأشعة الكونية لذرات النيتروجين. تمتصه النباتات أثناء التمثيل الضوئي ويتوقف التجدد عند موت الكائن لتبدأ ساعة التحلل الأسي.',
    scienceDescEn: 'Carbon-14 is continuously produced in the upper atmosphere by cosmic rays colliding with nitrogen. Living organisms assimilate it until death, when radioactive decay begins ticking like a geological clock.'
  },
  iodine131: {
    id: 'iodine131',
    name: 'اليود-131',
    nameEn: 'Iodine-131',
    symbol: '¹³¹₅₃I',
    atomicNumber: 53,
    massNumber: 131,
    halfLifeStr: '8.02 أيام',
    halfLifeStrEn: '8.02 days',
    realHalfLife: 8.02,
    timeUnit: 'أيام',
    timeUnitEn: 'days',
    displayTimeFactor: 8.02,
    decayMode: 'beta-gamma',
    decayModeAr: 'اضمحلال بيتا وغاما (β⁻ + γ)',
    decayModeEn: 'Beta & Gamma Decay (β⁻ + γ)',
    equation: '¹³¹₅₃I → ¹³¹₅₄Xe + e⁻ + ν̄ + γ',
    parentName: 'يود-131',
    parentNameEn: 'Iodine-131',
    daughterName: 'زينون-131',
    daughterNameEn: 'Xenon-131',
    daughterSymbol: '¹³¹₅₄Xe',
    daughterAtomic: 54,
    daughterMass: 131,
    emittedParticleDesc: 'إلكترون بيتا عالي الطاقة مع فوتونات أشعة غاما الكهرومغناطيسية المخترقة',
    emittedParticleDescEn: 'High-energy beta electron accompanied by penetrating electromagnetic gamma photons',
    category: 'الطب النووي والأورام',
    categoryEn: 'Nuclear Medicine & Oncology',
    practicalUse: 'العلاج الإشعاعي المستهدف الأكثر نجاحاً لسرطان الغدة الدرقية وفرط نشاطها، حيث تمتصه الغدة حصراً.',
    practicalUseEn: 'Targeted radiotherapy for thyroid cancer and hyperthyroidism, selectively concentrated by thyroid tissue.',
    scienceDesc: 'نظير مشع حاسم في الطب؛ تمتصه خلايا الغدة الدرقية بشراهة طبيعية، فتقوم جسيمات بيتا المنبعثة قصيرة المدى (حوالي 1 ملم) بتدمير الخلايا السرطانية المستهدفة دون إيذاء باقي الأنسجة السليمة.',
    scienceDescEn: 'Crucial in nuclear medicine; avidly absorbed by thyroid cells, short-range beta particles (~1 mm) destroy tumor cells without harming surrounding healthy tissue.'
  },
  radon222: {
    id: 'radon222',
    name: 'الرادون-222',
    nameEn: 'Radon-222',
    symbol: '²²²₈₆Rn',
    atomicNumber: 86,
    massNumber: 222,
    halfLifeStr: '3.82 أيام',
    halfLifeStrEn: '3.82 days',
    realHalfLife: 3.82,
    timeUnit: 'أيام',
    timeUnitEn: 'days',
    displayTimeFactor: 3.82,
    decayMode: 'alpha',
    decayModeAr: 'اضمحلال ألفا عالي الطاقة (α)',
    decayModeEn: 'High-Energy Alpha Decay (α)',
    equation: '²²²₈₆Rn → ²¹⁸₈₄Po + ⁴₂He²⁺',
    parentName: 'رادون-222',
    parentNameEn: 'Radon-222',
    daughterName: 'بولونيوم-218',
    daughterNameEn: 'Polonium-218',
    daughterSymbol: '²¹⁸₈₄Po',
    daughterAtomic: 84,
    daughterMass: 218,
    emittedParticleDesc: 'جسيم ألفا ثقيل (نواة هيليوم مكونة من بروتونين ونيوترونين ⁴₂He²⁺)',
    emittedParticleDescEn: 'Heavy alpha particle (helium-4 nucleus containing 2 protons and 2 neutrons ⁴₂He²⁺)',
    category: 'السلامة والبيئة الإشعاعية',
    categoryEn: 'Environmental & Radiation Safety',
    practicalUse: 'رصد النشاط الزلزالي في المياه الجوفية وفحص التهوية البيئية للمباني والمناجم لحماية الرئتين.',
    practicalUseEn: 'Monitoring seismic activity in groundwater and assessing indoor ventilation in basements and mines.',
    scienceDesc: 'غاز نبيل مشع ثقيل ناتج عن تحلل الراديوم واليورانيوم في صخور القشرة الأرضية والغرانيت. لكونه غازاً، يتسرب إلى أقبية المنازل ويعد السبب الرئيسي الثاني لسرطان الرئة بعد التدخين عالمياً.',
    scienceDescEn: 'Heavy radioactive noble gas produced from the decay of uranium and radium in bedrock. As an odorless gas, it seeps into buildings and represents the second leading cause of lung cancer.'
  },
  cesium137: {
    id: 'cesium137',
    name: 'السيزيوم-137',
    nameEn: 'Cesium-137',
    symbol: '¹³⁷₅₅Cs',
    atomicNumber: 55,
    massNumber: 137,
    halfLifeStr: '30.17 سنة',
    halfLifeStrEn: '30.17 years',
    realHalfLife: 30.17,
    timeUnit: 'سنة',
    timeUnitEn: 'years',
    displayTimeFactor: 30.17,
    decayMode: 'beta-gamma',
    decayModeAr: 'اضمحلال بيتا وغاما (β⁻ + γ)',
    decayModeEn: 'Beta & Gamma Decay (β⁻ + γ)',
    equation: '¹³⁷₅₅Cs → ¹³⁷₅₆Ba + e⁻ + ν̄ + γ',
    parentName: 'سيزيوم-137',
    parentNameEn: 'Cesium-137',
    daughterName: 'باريوم-137',
    daughterNameEn: 'Barium-137',
    daughterSymbol: '¹³⁷₅₆Ba',
    daughterAtomic: 56,
    daughterMass: 137,
    emittedParticleDesc: 'جسيم بيتا يتبعه فوتون غاما بطاقة 661.7 كيلو إلكترون فولت (keV)',
    emittedParticleDescEn: 'Beta particle followed by 661.7 keV gamma photon from metastable barium',
    category: 'التطبيقات الصناعية والنووية',
    categoryEn: 'Industrial & Nuclear Technology',
    practicalUse: 'معايرة أجهزة الكشف الإشعاعي، ومقاييس قياس سماكة الفولاذ والورق، وقياس رطوبة وكثافة التربة في مشاريع السدود.',
    practicalUseEn: 'Calibrating radiation detectors, industrial thickness gauges for steel sheets, and soil moisture meters.',
    scienceDesc: 'أحد أهم وأخطر نواتج الانشطار النووي في مفاعلات الطاقة الذرية، يتميز بقابليته العالية للذوبان كأملاح، ويستخدم نصف عمره (30 سنة) كمؤشر لمراقبة التلوث الإشعاعي بعد حوادث المفاعلات.',
    scienceDescEn: 'A major fission product in nuclear reactors with a 30-year half-life; readily forms soluble salts and serves as a key radiological marker for environmental contamination.'
  },
  cobalt60: {
    id: 'cobalt60',
    name: 'الكوبالت-60',
    nameEn: 'Cobalt-60',
    symbol: '⁶⁰₂₇Co',
    atomicNumber: 27,
    massNumber: 60,
    halfLifeStr: '5.27 سنة',
    halfLifeStrEn: '5.27 years',
    realHalfLife: 5.27,
    timeUnit: 'سنة',
    timeUnitEn: 'years',
    displayTimeFactor: 5.27,
    decayMode: 'beta-gamma',
    decayModeAr: 'اضمحلال بيتا وأشعة غاما قوية (β⁻, γ)',
    decayModeEn: 'Beta & Energetic Gamma Decay (β⁻, γ)',
    equation: '⁶⁰₂₇Co → ⁶⁰₂₈Ni + e⁻ + ν̄ + 2γ',
    parentName: 'كوبالت-60',
    parentNameEn: 'Cobalt-60',
    daughterName: 'نيكل-60',
    daughterNameEn: 'Nickel-60',
    daughterSymbol: '⁶⁰₂₈Ni',
    daughterAtomic: 28,
    daughterMass: 60,
    emittedParticleDesc: 'فوتونا غاما متزامنان فائقَا الطاقة (1.17 و 1.33 ميغا إلكترون فولت MeV)',
    emittedParticleDescEn: 'Two coincident high-energy gamma rays at 1.17 and 1.33 MeV',
    category: 'الطب والتعقيم الصناعي',
    categoryEn: 'Medical Radiosurgery & Sterilization',
    practicalUse: 'أجهزة سكين غاما (Gamma Knife) لجراحة أورام المخ الدقيقة، وتعقيم المعدات الطبية ذات الاستخدام الواحد والأغذية.',
    practicalUseEn: 'Gamma Knife stereotactic radiosurgery for brain tumors and industrial sterilization of medical equipment.',
    scienceDesc: 'نظير اصطناعي مشع يصنع بتنشيط الكوبالت-59 الطبيعي داخل المفاعلات النيوترونية، يوفر طاقة إشعاعية عالية ومستمرة ومثالية لإتلاف الحمض النووي للجراثيم والخلايا الضارة.',
    scienceDescEn: 'Synthesized by neutron activation of cobalt-59 in nuclear reactors; delivers intense, reliable gamma radiation ideal for microbial sterilization and targeted tumor ablation.'
  },
  uranium238: {
    id: 'uranium238',
    name: 'اليورانيوم-238',
    nameEn: 'Uranium-238',
    symbol: '²³⁸₉₂U',
    atomicNumber: 92,
    massNumber: 238,
    halfLifeStr: '4.468 مليار سنة',
    halfLifeStrEn: '4.468 billion years',
    realHalfLife: 4.468,
    timeUnit: 'مليار سنة',
    timeUnitEn: 'billion years',
    displayTimeFactor: 4.468,
    decayMode: 'alpha',
    decayModeAr: 'اضمحلال ألفا الثقيل (α)',
    decayModeEn: 'Heavy Alpha Decay (α)',
    equation: '²³⁸₉₂U → ²³⁴₉₀Th + ⁴₂He²⁺',
    parentName: 'يورانيوم-238',
    parentNameEn: 'Uranium-238',
    daughterName: 'ثوريوم-234',
    daughterNameEn: 'Thorium-234',
    daughterSymbol: '²³⁴₉₀Th',
    daughterAtomic: 90,
    daughterMass: 234,
    emittedParticleDesc: 'جسيم ألفا ثقيل يحمل طاقة حركية قدرها 4.27 ميغا إلكترون فولت',
    emittedParticleDescEn: 'Heavy alpha particle carrying 4.27 MeV kinetic energy',
    category: 'الجيولوجيا وتأريخ الأرض',
    categoryEn: 'Geology & Age of the Earth',
    practicalUse: 'تحديد العمر الجيولوجي المطلق لكوكب الأرض وتكون صخور القمر والنيازك الفضائية (تأريخ اليورانيوم-الرصاص).',
    practicalUseEn: 'Determining the absolute age of planet Earth, lunar rock samples, and meteorites via Uranium-Lead dating.',
    scienceDesc: 'يشكل 99.27% من اليورانيوم الطبيعي في كوكب الأرض، يماثل نصف عمره تقريباً عمر النظام الشمسي والأرض (4.5 مليار سنة)، وهو رأس سلسلة الاضمحلال النووي الشهيرة التي تنتهي بالرصاص-206 المستقر.',
    scienceDescEn: 'Comprises 99.27% of all natural uranium on Earth; its 4.5 billion-year half-life matches the age of the solar system, initiating the primordial decay chain leading to stable lead-206.'
  }
};
