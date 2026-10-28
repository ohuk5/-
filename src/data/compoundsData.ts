export interface Compound3DAtom {
  element: string;
  position: [number, number, number];
  color?: string;
  radius?: number;
}

export interface Compound3DBond {
  from: number;
  to: number;
  order: 1 | 2 | 3;
}

export interface CompoundInfo {
  id: string;
  formula: string;
  elementCounts: Record<string, number>;
  nameAr: string;
  nameEn: string;
  iupacAr: string;
  iupacEn: string;
  category: 'water_oxide' | 'acid' | 'base' | 'salt' | 'organic' | 'hydride' | 'halide' | 'elementary';
  categoryAr: string;
  categoryEn: string;
  molarMass: number; // g/mol
  bondingType: 'covalent' | 'polar_covalent' | 'ionic' | 'coordinate' | 'network';
  bondingTypeAr: string;
  bondingTypeEn: string;
  stateAtRoomTemp: 'solid' | 'liquid' | 'gas';
  stateAtRoomTempAr: string;
  stateAtRoomTempEn: string;
  colorHex: string;
  descriptionAr: string;
  descriptionEn: string;
  applicationsAr: string[];
  applicationsEn: string[];
  safetyAr: string;
  safetyEn: string;
  structure3D: {
    atoms: Compound3DAtom[];
    bonds: Compound3DBond[];
  };
  lewisInfo: {
    geometryAr: string;
    geometryEn: string;
    bondsDescAr: string;
    bondsDescEn: string;
    polarityAr: string;
    polarityEn: string;
  };
}

export interface BuilderElement {
  symbol: string;
  nameAr: string;
  nameEn: string;
  atomicNumber: number;
  valenceElectrons: number;
  primaryValence: number;
  colorHex: string;
  radius: number;
  electronegativity: number;
  group: number;
  period: number;
}

export const BUILDER_ELEMENTS: BuilderElement[] = [
  { symbol: 'H', nameAr: 'هيدروجين', nameEn: 'Hydrogen', atomicNumber: 1, valenceElectrons: 1, primaryValence: 1, colorHex: '#FFFFFF', radius: 0.35, electronegativity: 2.20, group: 1, period: 1 },
  { symbol: 'C', nameAr: 'كربون', nameEn: 'Carbon', atomicNumber: 6, valenceElectrons: 4, primaryValence: 4, colorHex: '#475569', radius: 0.6, electronegativity: 2.55, group: 14, period: 2 },
  { symbol: 'N', nameAr: 'نيتروجين', nameEn: 'Nitrogen', atomicNumber: 7, valenceElectrons: 5, primaryValence: 3, colorHex: '#3B82F6', radius: 0.55, electronegativity: 3.04, group: 15, period: 2 },
  { symbol: 'O', nameAr: 'أكسجين', nameEn: 'Oxygen', atomicNumber: 8, valenceElectrons: 6, primaryValence: 2, colorHex: '#EF4444', radius: 0.55, electronegativity: 3.44, group: 16, period: 2 },
  { symbol: 'F', nameAr: 'فلور', nameEn: 'Fluorine', atomicNumber: 9, valenceElectrons: 7, primaryValence: 1, colorHex: '#22C55E', radius: 0.5, electronegativity: 3.98, group: 17, period: 2 },
  { symbol: 'Na', nameAr: 'صوديوم', nameEn: 'Sodium', atomicNumber: 11, valenceElectrons: 1, primaryValence: 1, colorHex: '#A855F7', radius: 0.8, electronegativity: 0.93, group: 1, period: 3 },
  { symbol: 'Mg', nameAr: 'مغنيسيوم', nameEn: 'Magnesium', atomicNumber: 12, valenceElectrons: 2, primaryValence: 2, colorHex: '#10B981', radius: 0.75, electronegativity: 1.31, group: 2, period: 3 },
  { symbol: 'Al', nameAr: 'ألومنيوم', nameEn: 'Aluminum', atomicNumber: 13, valenceElectrons: 3, primaryValence: 3, colorHex: '#94A3B8', radius: 0.7, electronegativity: 1.61, group: 13, period: 3 },
  { symbol: 'Si', nameAr: 'سيليكون', nameEn: 'Silicon', atomicNumber: 14, valenceElectrons: 4, primaryValence: 4, colorHex: '#EAB308', radius: 0.65, electronegativity: 1.90, group: 14, period: 3 },
  { symbol: 'P', nameAr: 'فوسفور', nameEn: 'Phosphorus', atomicNumber: 15, valenceElectrons: 5, primaryValence: 3, colorHex: '#F97316', radius: 0.65, electronegativity: 2.19, group: 15, period: 3 },
  { symbol: 'S', nameAr: 'كبريت', nameEn: 'Sulfur', atomicNumber: 16, valenceElectrons: 6, primaryValence: 2, colorHex: '#FACC15', radius: 0.65, electronegativity: 2.58, group: 16, period: 3 },
  { symbol: 'Cl', nameAr: 'كلور', nameEn: 'Chlorine', atomicNumber: 17, valenceElectrons: 7, primaryValence: 1, colorHex: '#14B8A6', radius: 0.65, electronegativity: 3.16, group: 17, period: 3 },
  { symbol: 'K', nameAr: 'بوتاسيوم', nameEn: 'Potassium', atomicNumber: 19, valenceElectrons: 1, primaryValence: 1, colorHex: '#8B5CF6', radius: 0.9, electronegativity: 0.82, group: 1, period: 4 },
  { symbol: 'Ca', nameAr: 'كالسيوم', nameEn: 'Calcium', atomicNumber: 20, valenceElectrons: 2, primaryValence: 2, colorHex: '#06B6D4', radius: 0.85, electronegativity: 1.00, group: 2, period: 4 },
  { symbol: 'Fe', nameAr: 'حديد', nameEn: 'Iron', atomicNumber: 26, valenceElectrons: 2, primaryValence: 3, colorHex: '#EA580C', radius: 0.8, electronegativity: 1.83, group: 8, period: 4 },
  { symbol: 'Cu', nameAr: 'نحاس', nameEn: 'Copper', atomicNumber: 29, valenceElectrons: 2, primaryValence: 2, colorHex: '#B45309', radius: 0.8, electronegativity: 1.90, group: 11, period: 4 },
  { symbol: 'Br', nameAr: 'بروم', nameEn: 'Bromine', atomicNumber: 35, valenceElectrons: 7, primaryValence: 1, colorHex: '#991B1B', radius: 0.7, electronegativity: 2.96, group: 17, period: 4 },
  { symbol: 'I', nameAr: 'يود', nameEn: 'Iodine', atomicNumber: 53, valenceElectrons: 7, primaryValence: 1, colorHex: '#6B21A8', radius: 0.75, electronegativity: 2.66, group: 17, period: 5 }
];

export const BUILDER_ELEMENTS_MAP = new Map<string, BuilderElement>(
  BUILDER_ELEMENTS.map(el => [el.symbol, el])
);

export const COMPOUNDS_DATABASE: CompoundInfo[] = [
  // 1. H2O - Water
  {
    id: 'H2O',
    formula: 'H₂O',
    elementCounts: { H: 2, O: 1 },
    nameAr: 'الماء',
    nameEn: 'Water',
    iupacAr: 'أكسيد ثنائي الهيدروجين',
    iupacEn: 'Oxidane',
    category: 'water_oxide',
    categoryAr: 'أكسيد قطبي / ماء',
    categoryEn: 'Polar Oxide / Water',
    molarMass: 18.015,
    bondingType: 'polar_covalent',
    bondingTypeAr: 'تساهمية قطبية وروابط هيدروجينية',
    bondingTypeEn: 'Polar Covalent & Hydrogen Bonds',
    stateAtRoomTemp: 'liquid',
    stateAtRoomTempAr: 'سائل شفاف',
    stateAtRoomTempEn: 'Transparent Liquid',
    colorHex: '#38BDF8',
    descriptionAr: 'المذيب الكوني الأساسي لكافة أشكال الحياة، يتميز بزاوية رابطة انحنائية قدرها 104.5 درجات بسبب زوجي الإلكترونات الحرة على ذرة الأكسجين.',
    descriptionEn: 'The universal solvent essential to all known life, featuring a bent molecular geometry (104.5°) driven by two lone pairs on oxygen.',
    applicationsAr: ['مذيب شامل في التفاعلات الكيميائية والحيوية', 'تنظيم درجة الحرارة والتبريد الصناعي', 'شريان الحياة البيولوجية'],
    applicationsEn: ['Universal solvent in chemical & biological systems', 'Thermal regulation and cooling', 'Biological sustenance'],
    safetyAr: 'آمن وغير سام، وهو المكون الرئيسي للأجسام الحية.',
    safetyEn: 'Non-toxic, vital constituent of living organisms.',
    structure3D: {
      atoms: [
        { element: 'O', position: [0, 0.2, 0], color: '#EF4444', radius: 0.55 },
        { element: 'H', position: [-0.85, -0.4, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [0.85, -0.4, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 0, to: 2, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'منحنية (Bent / V-shaped)',
      geometryEn: 'Bent / V-shaped (104.5°)',
      bondsDescAr: 'رابطتان تساهميتان أحاديتان وزوجان من الإلكترونات الحرة',
      bondsDescEn: '2 single covalent bonds, 2 lone pairs on Oxygen',
      polarityAr: 'شديد القطبية (عزم ثنائي القطب 1.85 ديباي)',
      polarityEn: 'Highly Polar (1.85 D dipole moment)'
    }
  },

  // 2. CO2 - Carbon Dioxide
  {
    id: 'CO2',
    formula: 'CO₂',
    elementCounts: { C: 1, O: 2 },
    nameAr: 'ثاني أكسيد الكربون',
    nameEn: 'Carbon Dioxide',
    iupacAr: 'ثاني أكسيد الكربون',
    iupacEn: 'Carbon dioxide',
    category: 'water_oxide',
    categoryAr: 'أكسيد لا فلزي',
    categoryEn: 'Nonmetal Oxide',
    molarMass: 44.01,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية ثنائية غير قطبية كلياً (جزيء خطي)',
    bondingTypeEn: 'Double Covalent Linear (Nonpolar overall)',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز عديم اللون',
    stateAtRoomTempEn: 'Colorless Gas',
    colorHex: '#94A3B8',
    descriptionAr: 'غاز دفيء طبيعي ينتج عن تنفس الكائنات الحية والاحتراق، يستخدمه النبات في البناء الضوئي. جزيئه خطي متناظر بزاوية 180 درجة مما يلغي عزم القطبية.',
    descriptionEn: 'Major greenhouse gas produced by respiration and combustion, utilized in photosynthesis. Linear symmetrical geometry cancels dipole moments.',
    applicationsAr: ['مطفآت الحرائق والتبريد الفائق (الجليد الجاف)', 'صناعة المشروبات الغازية الفوارة', 'التمثيل الضوئي النباتي'],
    applicationsEn: ['Fire extinguishers & dry ice refrigeration', 'Carbonated beverages carbonation', 'Photosynthesis photosynthesis feedstock'],
    safetyAr: 'خانق بتركيزات عالية، يسبب النعاس وفقدان الوعي إذا تجاوز 5%.',
    safetyEn: 'Asphyxiant at high concentrations; causes dizziness above 5%.',
    structure3D: {
      atoms: [
        { element: 'C', position: [0, 0, 0], color: '#475569', radius: 0.6 },
        { element: 'O', position: [-1.2, 0, 0], color: '#EF4444', radius: 0.55 },
        { element: 'O', position: [1.2, 0, 0], color: '#EF4444', radius: 0.55 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 0, to: 2, order: 2 }
      ]
    },
    lewisInfo: {
      geometryAr: 'خطية (Linear 180°)',
      geometryEn: 'Linear (180°)',
      bondsDescAr: 'رابطتان تساهميتان ثنائيتان مع ذرتي الأكسجين (O=C=O)',
      bondsDescEn: 'Two double covalent bonds (O=C=O)',
      polarityAr: 'غير قطبي نتيجة التناظر الخطي التام',
      polarityEn: 'Nonpolar due to symmetrical cancellation'
    }
  },

  // 3. NaCl - Sodium Chloride
  {
    id: 'NaCl',
    formula: 'NaCl',
    elementCounts: { Na: 1, Cl: 1 },
    nameAr: 'كلوريد الصوديوم (ملح الطعام)',
    nameEn: 'Sodium Chloride (Table Salt)',
    iupacAr: 'كلوريد الصوديوم',
    iupacEn: 'Sodium chloride',
    category: 'salt',
    categoryAr: 'ملح أيوني قياسي',
    categoryEn: 'Standard Ionic Salt',
    molarMass: 58.44,
    bondingType: 'ionic',
    bondingTypeAr: 'رابطة أيونية قوية (Na⁺ + Cl⁻)',
    bondingTypeEn: 'Strong Ionic Bond (Na⁺ + Cl⁻)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'بلورات صلبة بيضاء',
    stateAtRoomTempEn: 'White Crystalline Solid',
    colorHex: '#CBD5E1',
    descriptionAr: 'الملح الأكثر شهرة في الطبيعة. يتشكل بنقل إلكترون تكافؤ من الصوديوم إلى الكلور، مكوّناً شبكة بلورية مكعبة عالية الصلابة ودرجة الانصهار (801°C).',
    descriptionEn: 'The most ubiquitous ionic salt. Formed by total electron transfer from sodium to chlorine, forming a rigid face-centered cubic lattice.',
    applicationsAr: ['حفظ وتنكيه الأطعمة', 'صناعة الكلور وهيدروكسيد الصوديوم بالتحليل الكهربائي', 'إذابة الجليد عن الطرقات'],
    applicationsEn: ['Food preservation & seasoning', 'Chlor-alkali electrolysis precursor', 'Highway de-icing'],
    safetyAr: 'آمن عند الاستهلاك الطبيعي، الجرعات المفرطة ترفع ضغط الدم.',
    safetyEn: 'Safe in normal dietary amounts; excess causes hypertension.',
    structure3D: {
      atoms: [
        { element: 'Na', position: [-0.9, 0, 0], color: '#A855F7', radius: 0.75 },
        { element: 'Cl', position: [0.9, 0, 0], color: '#14B8A6', radius: 0.75 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'شبكة بلورية مكعبة (Face-Centered Cubic)',
      geometryEn: 'Cubic crystal lattice',
      bondsDescAr: 'رابطة تجاذب كهروستاتيكي أيوني كامل',
      bondsDescEn: 'Electrostatic ionic bond (cation Na+ and anion Cl-)',
      polarityAr: 'أيوني شديد القطبية (يذوب في الماء ليعطي أيونات حرة ناقلة للكهرباء)',
      polarityEn: 'Extremely polar ionic; conducts electricity when dissolved'
    }
  },

  // 4. CH4 - Methane
  {
    id: 'CH4',
    formula: 'CH₄',
    elementCounts: { C: 1, H: 4 },
    nameAr: 'الميثان (الغاز الطبيعي)',
    nameEn: 'Methane (Natural Gas)',
    iupacAr: 'ميثان',
    iupacEn: 'Methane',
    category: 'organic',
    categoryAr: 'هيدروكربون ألكاني',
    categoryEn: 'Alkane Hydrocarbon',
    molarMass: 16.04,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية أحادية متناظرة (رباعي الأوجه)',
    bondingTypeEn: 'Single Covalent (Tetrahedral 109.5°)',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز عديم الرائحة واللون',
    stateAtRoomTempEn: 'Colorless, Odorless Gas',
    colorHex: '#64748B',
    descriptionAr: 'أبسط الهيدروكربونات العضوية، المكون الرئيسي للغاز الطبيعي (أكثر من 85%). جزيئه رباعي الأوجه متناظر بنسبة تهجين sp³.',
    descriptionEn: 'The simplest alkane hydrocarbon and primary constituent of natural gas. Symmetrical tetrahedral sp³ hybridization.',
    applicationsAr: ['وقود رئيسي لتوليد الكهرباء والتدفئة والطهي', 'إنتاج الهيدروجين وغاز التخليق بالبخار', 'صناعة الميثانول والأسمدة النيتروجينية'],
    applicationsEn: ['Primary fuel for power generation & heating', 'Steam methane reforming for hydrogen', 'Methanol & fertilizer manufacturing'],
    safetyAr: 'شديد الاشتعال وقابل للانفجار عند اختلاطه بالهواء (5-15%).',
    safetyEn: 'Extremely flammable; explosive air mixtures (5-15%).',
    structure3D: {
      atoms: [
        { element: 'C', position: [0, 0, 0], color: '#475569', radius: 0.6 },
        { element: 'H', position: [0, 1.0, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [0.94, -0.33, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-0.47, -0.33, 0.81], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-0.47, -0.33, -0.81], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 0, to: 2, order: 1 },
        { from: 0, to: 3, order: 1 },
        { from: 0, to: 4, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'رباعي الأوجه منتظم (Tetrahedral 109.5°)',
      geometryEn: 'Regular Tetrahedral (109.5°)',
      bondsDescAr: '4 روابط تساهمية أحادية سيجما (C-H)',
      bondsDescEn: '4 single sigma C-H bonds',
      polarityAr: 'غير قطبي متماثل',
      polarityEn: 'Nonpolar due to symmetry'
    }
  },

  // 5. NH3 - Ammonia
  {
    id: 'NH3',
    formula: 'NH₃',
    elementCounts: { N: 1, H: 3 },
    nameAr: 'الأمونيا (النشادر)',
    nameEn: 'Ammonia',
    iupacAr: 'أزان',
    iupacEn: 'Azane',
    category: 'base',
    categoryAr: 'قاعدة ضعيفة / هيدريد نيتروجيني',
    categoryEn: 'Weak Base / Nitrogen Hydride',
    molarMass: 17.031,
    bondingType: 'polar_covalent',
    bondingTypeAr: 'تساهمية قطبية وهرمية ثلاثية',
    bondingTypeEn: 'Trigonal Pyramidal Polar Covalent',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز ذو رائحة نفاذة لاذعة',
    stateAtRoomTempEn: 'Gas with Pungent Odor',
    colorHex: '#38BDF8',
    descriptionAr: 'قاعدة لويس شهيرة بسبب امتلاك النيتروجين زوجاً غير رابط من الإلكترونات. ينتج عالمياً بطريقة هابر-بوش ويشكل أساس صناعة الأسمدة الزراعية.',
    descriptionEn: 'Renowned Lewis base with a lone pair on nitrogen. Produced via the Haber-Bosch process, serving as the foundation for global agriculture.',
    applicationsAr: ['تصنيع الأسمدة النيتروجينية الزراعية (اليوريا ونترات الأمونيوم)', 'سوائل التبريد الصناعي الضخمة', 'منظفات الزجاج المنزلية'],
    applicationsEn: ['Nitrogen fertilizers synthesis (urea, ammonium nitrate)', 'Industrial refrigeration refrigerant', 'Household glass cleaners'],
    safetyAr: 'غاز كاوٍ ومهيج للأغشية المخاطية والجهاز التنفسي والعيون.',
    safetyEn: 'Corrosive and severely irritating to respiratory tract and eyes.',
    structure3D: {
      atoms: [
        { element: 'N', position: [0, 0.3, 0], color: '#3B82F6', radius: 0.55 },
        { element: 'H', position: [0.8, -0.2, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-0.4, -0.2, 0.7], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-0.4, -0.2, -0.7], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 0, to: 2, order: 1 },
        { from: 0, to: 3, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'هرمي ثلاثي القاعدة (Trigonal Pyramidal 107.8°)',
      geometryEn: 'Trigonal Pyramidal (107.8°)',
      bondsDescAr: '3 روابط تساهمية وزوج حر من الإلكترونات فوق النيتروجين',
      bondsDescEn: '3 single N-H bonds, 1 lone pair on Nitrogen',
      polarityAr: 'قطبي عالي القطبية (عزم 1.42 ديباي)',
      polarityEn: 'Highly Polar (1.42 D dipole moment)'
    }
  },

  // 6. HCl - Hydrochloric Acid
  {
    id: 'HCl',
    formula: 'HCl',
    elementCounts: { H: 1, Cl: 1 },
    nameAr: 'حمض الهيدروكلوريك (حمض كلور الماء)',
    nameEn: 'Hydrochloric Acid (Hydrogen Chloride)',
    iupacAr: 'كلوران',
    iupacEn: 'Chlorane',
    category: 'acid',
    categoryAr: 'حمض معدني قوي',
    categoryEn: 'Strong Mineral Acid',
    molarMass: 36.46,
    bondingType: 'polar_covalent',
    bondingTypeAr: 'تساهمية قطبية تتأين كلياً في الماء',
    bondingTypeEn: 'Polar Covalent (fully ionizes in water)',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز (ومحلوله المائي سائل كاوٍ)',
    stateAtRoomTempEn: 'Gas (aqueous solution is corrosive liquid)',
    colorHex: '#2DD4BF',
    descriptionAr: 'حمض المعدة الطبيعي المسؤول عن هضم البروتينات، وهو أحد أهم الأحماض في الكيمياء الصناعية. يتأين بنسبة 100% في المحاليل المائية.',
    descriptionEn: 'The natural gastric acid aiding digestion and an essential heavy industrial chemical. Ionizes completely in aqueous solutions.',
    applicationsAr: ['معالجة وتخليل الصلب والمعادن لإزالة الصدأ', 'إنتاج الجيلاتين والمضافات الغذائية', 'تنظيم درجة الحموضة الصناعية'],
    applicationsEn: ['Steel pickling and rust removal', 'Gelatin & food additives processing', 'Industrial pH adjustment'],
    safetyAr: 'كاوٍ شديد للجلد، وتصاعد أبخرته يسبب حروقاً تنفسية حادة.',
    safetyEn: 'Severely corrosive; fumes cause severe respiratory injury.',
    structure3D: {
      atoms: [
        { element: 'Cl', position: [0.5, 0, 0], color: '#14B8A6', radius: 0.65 },
        { element: 'H', position: [-0.65, 0, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'خطي ثنائي الذرة (Linear)',
      geometryEn: 'Linear Diatomic',
      bondsDescAr: 'رابطة تساهمية أحادية مع 3 أزواج حرة على الكلور',
      bondsDescEn: '1 polar covalent bond, 3 lone pairs on Chlorine',
      polarityAr: 'قطبي قوي (فرق كهروسالبية 0.96)',
      polarityEn: 'Strongly polar (electronegativity diff 0.96)'
    }
  },

  // 7. H2SO4 - Sulfuric Acid
  {
    id: 'H2SO4',
    formula: 'H₂SO₄',
    elementCounts: { H: 2, S: 1, O: 4 },
    nameAr: 'حمض الكبريتيك (زيت الزاج)',
    nameEn: 'Sulfuric Acid (Oil of Vitriol)',
    iupacAr: 'حمض الكبريتيك',
    iupacEn: 'Sulfuric acid',
    category: 'acid',
    categoryAr: 'حمض ثنائي البروتون قوي فائق',
    categoryEn: 'Strong Diprotic Mineral Acid',
    molarMass: 98.079,
    bondingType: 'polar_covalent',
    bondingTypeAr: 'تساهمية قطبية مع روابط كبريتية متعددة',
    bondingTypeEn: 'Polar Covalent / Oxyacid',
    stateAtRoomTemp: 'liquid',
    stateAtRoomTempAr: 'سائل زيتي كثيف عديم اللون',
    stateAtRoomTempEn: 'Dense Oily Colorless Liquid',
    colorHex: '#FBBF24',
    descriptionAr: '"ملك المواد الكيميائية" ومقياس القوة الصناعية للدول، مركب شديد الشغف بالماء (مجفف عنيف) يولد حرارة هائلة عند تخفيفه.',
    descriptionEn: 'The "King of Chemicals" whose production volume reflects industrial capability. Powerful dehydrating agent with extreme exothermic dilution.',
    applicationsAr: ['سائل بطاريات الرصاص الحمضية للسيارات', 'تصنيع أسمدة الفوسفات السوبر', 'تكرير البترول وصناعة المتفجرات والأصباغ'],
    applicationsEn: ['Lead-acid car batteries electrolyte', 'Superphosphate fertilizers manufacturing', 'Petroleum refining & chemical synthesis'],
    safetyAr: 'شديد التآكل والاحتراق الكيميائي، يسحب عناصر الماء من الأنسجة فوراً.',
    safetyEn: 'Extremely corrosive; violently dehydrates organic tissue on contact.',
    structure3D: {
      atoms: [
        { element: 'S', position: [0, 0, 0], color: '#FACC15', radius: 0.65 },
        { element: 'O', position: [0, 1.2, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [0, -1.2, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [-1.1, 0, 0.4], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [1.1, 0, -0.4], color: '#EF4444', radius: 0.5 },
        { element: 'H', position: [-1.7, 0, 0.8], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [1.7, 0, -0.8], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 0, to: 2, order: 2 },
        { from: 0, to: 3, order: 1 },
        { from: 0, to: 4, order: 1 },
        { from: 3, to: 5, order: 1 },
        { from: 4, to: 6, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'رباعي الأوجه حول ذرة الكبريت (Tetrahedral around S)',
      geometryEn: 'Tetrahedral around S atom',
      bondsDescAr: 'رابطتان ثنائيتان S=O ورابطتان أحاديتان S-O-H',
      bondsDescEn: 'Two S=O double bonds, two S-O-H single bonds',
      polarityAr: 'قطبي عالي الأيونية عند التفكك',
      polarityEn: 'Strongly polar & highly ionizable'
    }
  },

  // 8. NaOH - Sodium Hydroxide
  {
    id: 'NaOH',
    formula: 'NaOH',
    elementCounts: { Na: 1, O: 1, H: 1 },
    nameAr: 'هيدروكسيد الصوديوم (الصودا الكاوية)',
    nameEn: 'Sodium Hydroxide (Caustic Soda)',
    iupacAr: 'هيدروكسيد الصوديوم',
    iupacEn: 'Sodium hydroxide',
    category: 'base',
    categoryAr: 'قاعدة قوية قلوية',
    categoryEn: 'Strong Alkali Base',
    molarMass: 39.997,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية بين Na⁺ ومجموعة الهيدروكسيل ⁻OH',
    bondingTypeEn: 'Ionic (Na⁺ cation and OH⁻ anion)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'قشور أو حبيبات بيضاء متميعة',
    stateAtRoomTempEn: 'White Deliquescent Pellets',
    colorHex: '#C084FC',
    descriptionAr: 'قاعدة قلوية شهيرة تذوب بشراهة ناشرة للحرارة. تستخدم في تصبين الدهون وتحويل الزيوت إلى صابون وفي صناعة الورق وتنظيف المصارف المسدودة.',
    descriptionEn: 'Major alkaline base that dissolves exothermically in water. Essential in saponification (soap-making), papermaking, and drain opening.',
    applicationsAr: ['صناعة الصابون والمنظفات الكيميائية', 'معالجة لب الخشب وإنتاج الورق', 'تسليك وتنظيف البالوعات والمجاري'],
    applicationsEn: ['Soap & detergent saponification', 'Pulp and papermaking', 'Drain clearing and industrial cleaning'],
    safetyAr: 'كاوٍ شديد يذيب البروتينات والأنسجة ويسبب العمى الفوري عند ملامسة العين.',
    safetyEn: 'Extremely caustic; causes severe tissue damage and blindness.',
    structure3D: {
      atoms: [
        { element: 'Na', position: [-0.9, 0, 0], color: '#A855F7', radius: 0.75 },
        { element: 'O', position: [0.6, 0, 0], color: '#EF4444', radius: 0.55 },
        { element: 'H', position: [1.35, 0, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'أيونية مستوية (Ionic Lattice)',
      geometryEn: 'Ionic pair / Lattice',
      bondsDescAr: 'رابطة أيونية Na⁺ مع رابطة تساهمية O-H في أيون الهيدروكسيل',
      bondsDescEn: 'Ionic bond to OH⁻ anion with covalent O-H bond',
      polarityAr: 'أيوني قطبي جداً في المحاليل المائية',
      polarityEn: 'Fully ionic in aqueous medium'
    }
  },

  // 9. C2H5OH - Ethanol
  {
    id: 'C2H5OH',
    formula: 'C₂H₅OH',
    elementCounts: { C: 2, H: 6, O: 1 },
    nameAr: 'الإيثانول (كحول الحبوب)',
    nameEn: 'Ethanol (Grain Alcohol)',
    iupacAr: 'إيثانول',
    iupacEn: 'Ethanol',
    category: 'organic',
    categoryAr: 'كحول أليفاتي أولي',
    categoryEn: 'Primary Aliphatic Alcohol',
    molarMass: 46.069,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية مع رابطة هيدروجينية قطبية (O-H)',
    bondingTypeEn: 'Covalent with polar O-H hydrogen bonding',
    stateAtRoomTemp: 'liquid',
    stateAtRoomTempAr: 'سائل متطاير ذو رائحة مميزة',
    stateAtRoomTempEn: 'Volatile Clear Liquid',
    colorHex: '#38BDF8',
    descriptionAr: 'الكحول الأكثر شهرة، يستخدم كوقود حيوي متجدد ومعقم طبي واسع المدى ضد البكتيريا والفيروسات، ومذيب صناعي ممتاز للمواد العطرية.',
    descriptionEn: 'The primary alcohol used as a renewable biofuel, broad-spectrum medical antiseptic, and vital organic solvent for pharmaceuticals.',
    applicationsAr: ['معقمات الأيدي والمطهرات الطبية 70%', 'وقود حيوي يخلط مع البنزين (E10/E85)', 'مذيب للأدوية والعطور والطلاء'],
    applicationsEn: ['Hand sanitizers & medical disinfectants', 'Biofuel blended in gasolines (E10)', 'Solvent for pharmaceuticals and scents'],
    safetyAr: 'قابل للاشتعال، ومادة مثبطة للجهاز العصبي عند الاستنشاق المفرط.',
    safetyEn: 'Flammable; CNS depressant upon heavy inhalation.',
    structure3D: {
      atoms: [
        { element: 'C', position: [-0.8, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [0.6, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'O', position: [1.4, 0.9, 0], color: '#EF4444', radius: 0.5 },
        { element: 'H', position: [2.2, 0.7, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.2, 0.9, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.2, -0.6, 0.7], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.2, -0.6, -0.7], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [0.7, -0.7, 0.7], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [0.7, -0.7, -0.7], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 },
        { from: 2, to: 3, order: 1 },
        { from: 0, to: 4, order: 1 },
        { from: 0, to: 5, order: 1 },
        { from: 0, to: 6, order: 1 },
        { from: 1, to: 7, order: 1 },
        { from: 1, to: 8, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'رباعي الأوجه حول ذرتي الكربون ومنحني حول الأكسجين',
      geometryEn: 'Tetrahedral around C, bent around O',
      bondsDescAr: 'روابط C-C و C-H أحادية ورابطة قطبية O-H قابلة للارتباط الهيدروجيني',
      bondsDescEn: 'C-C, C-H single bonds with hydrogen-bonding O-H group',
      polarityAr: 'قطبي ممتزج بالماء بفضل مجموعة الهيدروكسيل',
      polarityEn: 'Polar & fully miscible with water'
    }
  },

  // 10. CH3COOH - Acetic Acid (Vinegar)
  {
    id: 'CH3COOH',
    formula: 'CH₃COOH',
    elementCounts: { C: 2, H: 4, O: 2 },
    nameAr: 'حمض الخليك (حمض الأسيتيك / الخل)',
    nameEn: 'Acetic Acid (Vinegar)',
    iupacAr: 'حمض الإيثانويك',
    iupacEn: 'Ethanoic acid',
    category: 'acid',
    categoryAr: 'حمض كربوكسيلي عضوي',
    categoryEn: 'Carboxylic Organic Acid',
    molarMass: 60.052,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية مع مجموعة كربوكسيل قطبية (-COOH)',
    bondingTypeEn: 'Covalent with polar carboxyl (-COOH) group',
    stateAtRoomTemp: 'liquid',
    stateAtRoomTempAr: 'سائل حامضي نفاذ',
    stateAtRoomTempEn: 'Pungent Acidic Liquid',
    colorHex: '#38BDF8',
    descriptionAr: 'المكون الفعال للخل المنزلي بنسبة 4-8%. حمض عضوي ضعيف يتجمد عند 16.6°C ليسمى حمض الخليك الثلجي النقي.',
    descriptionEn: 'The active constituent of culinary vinegar (4-8%). Weak organic acid forming ice-like glacial crystals below 16.6°C.',
    applicationsAr: ['الخل الغذائي وحفظ المخللات', 'صناعة مونومر أسيتات الفينيل ومواد اللصق', 'إنتاج الحرير الصناعي وألياف الأسيتات'],
    applicationsEn: ['Culinary vinegar & food preservation', 'Vinyl acetate monomer & adhesives production', 'Cellulose acetate synthetic fibers'],
    safetyAr: 'المحلول المركز (الثلجي) يسبب حروقاً وتقرحات كيميائية.',
    safetyEn: 'Glacial form is corrosive and causes severe skin burns.',
    structure3D: {
      atoms: [
        { element: 'C', position: [-0.8, -0.2, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [0.6, 0.2, 0], color: '#475569', radius: 0.55 },
        { element: 'O', position: [1.0, 1.3, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [1.4, -0.8, 0], color: '#EF4444', radius: 0.5 },
        { element: 'H', position: [2.3, -0.6, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-0.9, -1.2, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.3, 0.2, 0.8], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.3, 0.2, -0.8], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 2 },
        { from: 1, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 },
        { from: 0, to: 5, order: 1 },
        { from: 0, to: 6, order: 1 },
        { from: 0, to: 7, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'مستوٍ مثلثي حول كربون الكربوكسيل',
      geometryEn: 'Trigonal planar around carbonyl C',
      bondsDescAr: 'رابطة كربونيل ثنائية C=O ورابطة أحادية C-OH',
      bondsDescEn: 'C=O double bond and C-OH single bond in carboxyl group',
      polarityAr: 'قطبي ويكون روابط هيدروجينية ثنائية الجزيئات',
      polarityEn: 'Polar, forms hydrogen-bonded dimers'
    }
  },

  // 11. O2 - Molecular Oxygen
  {
    id: 'O2',
    formula: 'O₂',
    elementCounts: { O: 2 },
    nameAr: 'الأكسجين الجزيئي',
    nameEn: 'Molecular Oxygen',
    iupacAr: 'ثنائي الأكسجين',
    iupacEn: 'Dioxygen',
    category: 'elementary',
    categoryAr: 'عنصر ثنائي الذرة لا فلزي',
    categoryEn: 'Diatomic Elemental Gas',
    molarMass: 31.998,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية ثنائية متناظرة (مغناطيسية مسايرة Paramagnetic)',
    bondingTypeEn: 'Double Covalent (Paramagnetic ground triplet state)',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز عديم اللون والرائحة',
    stateAtRoomTempEn: 'Colorless, Odorless Gas',
    colorHex: '#EF4444',
    descriptionAr: 'يشكل 21% من الغلاف الجوي للأرض. ضروري لتنفس الكائنات الهوائية واشتعال الوقود. يملك إلكترونين غير مزدوجين في مدارات مضادة للترابط، مما يجعله بارامغناطيسياً!',
    descriptionEn: 'Makes up 21% of Earth atmosphere. Crucial for aerobic respiration and combustion. Features two unpaired electrons in pi* orbitals making it paramagnetic!',
    applicationsAr: ['التنفس الاصطناعي الطبي ودعم الحياة', 'صناعة الصلب ومواقد اللحام بالأكسي-أسيتيلين', 'مؤكسد لوقود الصواريخ في الفضاء (LOX)'],
    applicationsEn: ['Medical respiratory therapy & life support', 'Steelmaking & oxy-acetylene welding torches', 'Liquid rocket propellant oxidizer (LOX)'],
    safetyAr: 'يدعم الاشتعال بعنف ويسبب انفجار المواد العضوية بتركيزات عالية.',
    safetyEn: 'Vigorously accelerates combustion; fire hazard with combustibles.',
    structure3D: {
      atoms: [
        { element: 'O', position: [-0.6, 0, 0], color: '#EF4444', radius: 0.55 },
        { element: 'O', position: [0.6, 0, 0], color: '#EF4444', radius: 0.55 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 }
      ]
    },
    lewisInfo: {
      geometryAr: 'خطي ثنائي الذرة (Linear)',
      geometryEn: 'Linear Diatomic',
      bondsDescAr: 'رابطة تساهمية ثنائية (رابطة سيجما ورابطة باي)',
      bondsDescEn: 'Double covalent bond (one sigma, one pi)',
      polarityAr: 'غير قطبي تماماً',
      polarityEn: 'Purely Nonpolar'
    }
  },

  // 12. N2 - Molecular Nitrogen
  {
    id: 'N2',
    formula: 'N₂',
    elementCounts: { N: 2 },
    nameAr: 'النيتروجين الجزيئي',
    nameEn: 'Molecular Nitrogen',
    iupacAr: 'ثنائي النيتروجين',
    iupacEn: 'Dinitrogen',
    category: 'elementary',
    categoryAr: 'عنصر ثنائي الذرة خامل',
    categoryEn: 'Diatomic Elemental Gas',
    molarMass: 28.014,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية ثلاثية فائقة القوة (N≡N)',
    bondingTypeEn: 'Triple Covalent Bond (N≡N, 945 kJ/mol)',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز خامل عديم اللون',
    stateAtRoomTempEn: 'Colorless Inert Gas',
    colorHex: '#3B82F6',
    descriptionAr: 'يشكل 78% من الغلاف الجوي لكوكب الأرض. يتميز برابطة ثلاثية هائلة القوة (945 kJ/mol) تجعله خاملاً كيميائياً في الظروف المعتادة ويحتاج طاقة هائلة لكسرها.',
    descriptionEn: 'Comprises 78% of Earth atmosphere. Its incredibly strong triple bond (945 kJ/mol) renders it chemically inert under standard conditions.',
    applicationsAr: ['حماية الأغذية المعبأة (جو خامل داخل أكياس الرقائق)', 'التبريد بالنيتروجين السائل (-196°C)', 'إنتاج الأمونيا والأسمدة'],
    applicationsEn: ['Modified atmosphere food packaging', 'Cryogenic freezing with liquid N2 (-196°C)', 'Ammonia synthesis raw material'],
    safetyAr: 'خامل وغير سام، لكنه يسبب الاختناق السريع بإزاحة الأكسجين في الأماكن المغلقة.',
    safetyEn: 'Non-toxic asphyxiant by oxygen displacement in confined areas.',
    structure3D: {
      atoms: [
        { element: 'N', position: [-0.55, 0, 0], color: '#3B82F6', radius: 0.55 },
        { element: 'N', position: [0.55, 0, 0], color: '#3B82F6', radius: 0.55 }
      ],
      bonds: [
        { from: 0, to: 1, order: 3 }
      ]
    },
    lewisInfo: {
      geometryAr: 'خطي ثنائي الذرة (Linear)',
      geometryEn: 'Linear Diatomic',
      bondsDescAr: 'رابطة ثلاثية قوية وزوج حر على كل ذرة ( :N≡N: )',
      bondsDescEn: 'One triple bond (one sigma, two pi), 1 lone pair per N',
      polarityAr: 'غير قطبي تماماً',
      polarityEn: 'Purely Nonpolar'
    }
  },

  // 13. H2 - Molecular Hydrogen
  {
    id: 'H2',
    formula: 'H₂',
    elementCounts: { H: 2 },
    nameAr: 'الهيدروجين الجزيئي',
    nameEn: 'Molecular Hydrogen',
    iupacAr: 'ثنائي الهيدروجين',
    iupacEn: 'Dihydrogen',
    category: 'elementary',
    categoryAr: 'غاز عنصري أخف جزيء',
    categoryEn: 'Lightest Elemental Gas',
    molarMass: 2.016,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية أحادية نقية بسيطة',
    bondingTypeEn: 'Pure Single Covalent Bond',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز شديد الخفة عديم اللون',
    stateAtRoomTempEn: 'Ultra-light Colorless Gas',
    colorHex: '#E2E8F0',
    descriptionAr: 'أخف وأبسط جزيء في الكون، يتكون من بروتونين وإلكترونين مشتركين. يعتبر وقود المستقبل النظيف لأن ناتج احتراقه الوحيد هو بخار الماء.',
    descriptionEn: 'The lightest and most abundant molecule in the universe. Considered the clean green fuel of the future, releasing only water vapor upon combustion.',
    applicationsAr: ['خلايا وقود الهيدروجين للسيارات النظيفة', 'وقود دفع محركات الصواريخ الفضائية', 'هدرجة الزيوت النباتية وتكرير البترول'],
    applicationsEn: ['Clean fuel cell vehicles power', 'Rocket propulsion engines propellant', 'Vegetable oils hydrogenation and hydrocracking'],
    safetyAr: 'شديد الاشتعال وسريع التسرب والانفجار في نطاق واسع (4-75%).',
    safetyEn: 'Extremely flammable; broad flammability range (4-75%).',
    structure3D: {
      atoms: [
        { element: 'H', position: [-0.4, 0, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [0.4, 0, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'خطي ثنائي الذرة (Linear)',
      geometryEn: 'Linear Diatomic',
      bondsDescAr: 'رابطة سيجما أحادية تحقق قاعدة الثنائيات (Duet Rule)',
      bondsDescEn: '1 single sigma bond satisfying the duet rule',
      polarityAr: 'غير قطبي تماماً',
      polarityEn: 'Purely Nonpolar'
    }
  },

  // 14. CaCO3 - Calcium Carbonate
  {
    id: 'CaCO3',
    formula: 'CaCO₃',
    elementCounts: { Ca: 1, C: 1, O: 3 },
    nameAr: 'كربونات الكالسيوم (الحجر الجيري / الرخام)',
    nameEn: 'Calcium Carbonate (Limestone / Marble)',
    iupacAr: 'كربونات الكالسيوم',
    iupacEn: 'Calcium carbonate',
    category: 'salt',
    categoryAr: 'ملح كربونات كلسي',
    categoryEn: 'Calcareous Carbonate Salt',
    molarMass: 100.086,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية بين Ca²⁺ وأيون الكربونات ⁻²CO₃',
    bondingTypeEn: 'Ionic (Ca²⁺ cation and CO₃²⁻ anion)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'مسحوق أبيض غير قابل للذوبان بالماء',
    stateAtRoomTempEn: 'White Insoluble Solid Powder',
    colorHex: '#CBD5E1',
    descriptionAr: 'المكون الرئيسي للحجر الجيري، والرخام، وقشور البيض، وأصداف الرخويات، والشعاب المرجانية. يتفاعل مع الأحماض ليطلق غاز ثاني أكسيد الكربون بفوران ملحوظ.',
    descriptionEn: 'The primary mineral in limestone, marble, chalk, seashells, and eggshells. Reacts with acids with vigorous effervescence releasing CO2.',
    applicationsAr: ['صناعة الأسمنت ومواد البناء والخرسانة', 'مكمل غذائي للكالسيوم ومضاد لحموضة المعدة', 'إنتاج الطباشير وتعديل حموضة التربة الزراعية'],
    applicationsEn: ['Cement and construction materials', 'Dietary calcium supplement & antacid', 'Chalk production & agricultural soil liming'],
    safetyAr: 'آمن وغير سام، مسموح باستخدامه في التغذية والطب.',
    safetyEn: 'Safe and non-toxic; widely consumed as calcium supplement.',
    structure3D: {
      atoms: [
        { element: 'Ca', position: [-1.2, 0, 0], color: '#06B6D4', radius: 0.8 },
        { element: 'C', position: [0.6, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'O', position: [0.6, 1.1, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [1.6, -0.55, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [-0.4, -0.55, 0], color: '#EF4444', radius: 0.5 }
      ],
      bonds: [
        { from: 1, to: 2, order: 2 },
        { from: 1, to: 3, order: 1 },
        { from: 1, to: 4, order: 1 },
        { from: 0, to: 4, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'مستوٍ مثلثي لأيون الكربونات (Trigonal Planar CO3²⁻)',
      geometryEn: 'Trigonal Planar for CO3²⁻ anion',
      bondsDescAr: 'روابط تساهمية رنينية داخل أيون الكربونات ورابطة أيونية مع الكالسيوم',
      bondsDescEn: 'Resonant covalent bonds in carbonate anion with Ca²⁺ counter-ion',
      polarityAr: 'أيوني شبكي صلب',
      polarityEn: 'Insoluble ionic mineral lattice'
    }
  },

  // 15. CuSO4 - Copper(II) Sulfate
  {
    id: 'CuSO4',
    formula: 'CuSO₄',
    elementCounts: { Cu: 1, S: 1, O: 4 },
    nameAr: 'كبريتات النحاس الثنائي (الزاج الأزرق)',
    nameEn: 'Copper(II) Sulfate (Blue Vitriol)',
    iupacAr: 'كبريتات النحاس الثنائي',
    iupacEn: 'Copper(II) sulfate',
    category: 'salt',
    categoryAr: 'ملح معدني ملون',
    categoryEn: 'Colored Transition Metal Salt',
    molarMass: 159.609,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية وتناسقية (Cu²⁺ + ⁻²SO₄)',
    bondingTypeEn: 'Ionic / Coordination (Cu²⁺ + SO₄²⁻)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'بلورات زرقاء زاهية (عند التميؤ) أو رمادي جاف',
    stateAtRoomTempEn: 'Vibrant Blue Crystals (hydrated)',
    colorHex: '#2563EB',
    descriptionAr: 'ملح مشهور ببلوراته الزرقاء الفاتنة (خماسي الهيدرات)، يتحول إلى الأبيض الرمادي عند التسخين بفقدان ماء التبلور، ويستخدم للكشف عن الرطوبة.',
    descriptionEn: 'Renowned for its striking blue pentahydrate crystals. Turns white-grey when dehydrated by heat, commonly used as a sensitive moisture test.',
    applicationsAr: ['مبيد فطري زراعي (مزيج بوردو لحماية الكروم)', 'الطلاء الكهربائي بالنحاس وتنقية المعادن', 'تجارب نمو البلورات المدرسية المدهشة'],
    applicationsEn: ['Agricultural fungicide (Bordeaux mixture)', 'Copper electroplating and electro-refining', 'Crystal growing demonstrations in education'],
    safetyAr: 'ضار إذا تم ابتلاعه وسام للكائنات المائية.',
    safetyEn: 'Harmful if swallowed; toxic to aquatic organisms.',
    structure3D: {
      atoms: [
        { element: 'Cu', position: [-1.1, 0, 0], color: '#B45309', radius: 0.75 },
        { element: 'S', position: [0.7, 0, 0], color: '#FACC15', radius: 0.65 },
        { element: 'O', position: [0.7, 1.1, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [0.7, -1.1, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [1.7, 0, 0.4], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [-0.3, 0, -0.4], color: '#EF4444', radius: 0.5 }
      ],
      bonds: [
        { from: 1, to: 2, order: 2 },
        { from: 1, to: 3, order: 2 },
        { from: 1, to: 4, order: 1 },
        { from: 1, to: 5, order: 1 },
        { from: 0, to: 5, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'رباعي الأوجه لأيون الكبريتات SO4²⁻',
      geometryEn: 'Tetrahedral sulfate anion',
      bondsDescAr: 'رابطة أيونية بين كاتيون النحاس وأنيون الكبريتات',
      bondsDescEn: 'Ionic coordination between Cu²⁺ and SO₄²⁻',
      polarityAr: 'أيوني متبلور يذوب في الماء معطياً محلولاً أزرق براقاً',
      polarityEn: 'Ionic; produces characteristic blue aqueous ions'
    }
  },

  // 16. H2O2 - Hydrogen Peroxide
  {
    id: 'H2O2',
    formula: 'H₂O₂',
    elementCounts: { H: 2, O: 2 },
    nameAr: 'بيروكسيد الهيدروجين (ماء الأكسجين)',
    nameEn: 'Hydrogen Peroxide',
    iupacAr: 'ثنائي أكسيدان',
    iupacEn: 'Dioxidane',
    category: 'water_oxide',
    categoryAr: 'بيروكسيد مؤكسد قوي',
    categoryEn: 'Reactive Peroxide Oxidizer',
    molarMass: 34.014,
    bondingType: 'polar_covalent',
    bondingTypeAr: 'تساهمية قطبية برابطة بيروكسيدية O-O أحادية نشطة',
    bondingTypeEn: 'Polar covalent with reactive O-O single bond',
    stateAtRoomTemp: 'liquid',
    stateAtRoomTempAr: 'سائل لزج شفاف باهت الزرقة',
    stateAtRoomTempEn: 'Pale Blue Viscous Liquid',
    colorHex: '#67E8F9',
    descriptionAr: 'مركب مؤكسد شهير يمتلك رابطة بيروكسيد غير مستقرة (-O-O-). يتحلل إلى ماء وأكسجين تلقائياً، ويتسارع بفعل الإنزيمات أو ثاني أكسيد المنجنيز (تجربة معجون أسنان الفيل).',
    descriptionEn: 'Powerful oxidizer featuring an unstable O-O peroxide bond. Decomposes into water and oxygen gas, accelerated by catalysts (Elephant Toothpaste demo).',
    applicationsAr: ['تطهير الجروح والمطهرات المنزلية (تركيز 3%)', 'تبييض لب الورق والشعر', 'وقود دفع للصواريخ (تركيز 90% عالي النقاوة)'],
    applicationsEn: ['Wound disinfection & mouthwash (3%)', 'Pulp and hair bleaching agent', 'High-test peroxide monopropellant for rocketry'],
    safetyAr: 'المحاليل المركزة كاوية ومؤكسدة وتسبب تبييضاً مؤلماً وحروقاً للجلد.',
    safetyEn: 'Concentrated forms cause severe chemical burns and fire risk.',
    structure3D: {
      atoms: [
        { element: 'O', position: [-0.6, 0.2, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [0.6, -0.2, 0], color: '#EF4444', radius: 0.5 },
        { element: 'H', position: [-1.2, -0.5, 0.4], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [1.2, 0.5, -0.4], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 0, to: 2, order: 1 },
        { from: 1, to: 3, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'غير مستوية بزاوية ثنائية التوجه (Skewed / Open-Book)',
      geometryEn: 'Non-planar dihedral (open-book geometry ~111°)',
      bondsDescAr: 'رابطة بيروكسيد أحادية O-O ورابطتان O-H',
      bondsDescEn: 'Single O-O peroxide linkage with two O-H bonds',
      polarityAr: 'قطبي عالي القطبية (عزم 2.26 ديباي)',
      polarityEn: 'Highly polar (2.26 D dipole moment)'
    }
  },

  // 17. Fe2O3 - Iron(III) Oxide (Rust)
  {
    id: 'Fe2O3',
    formula: 'Fe₂O₃',
    elementCounts: { Fe: 2, O: 3 },
    nameAr: 'أكسيد الحديد الثلاثي (الصدأ / الهيماتيت)',
    nameEn: 'Iron(III) Oxide (Rust / Hematite)',
    iupacAr: 'ثلاثي أكسيد ثنائي الحديد',
    iupacEn: 'Diiron trioxide',
    category: 'salt',
    categoryAr: 'أكسيد فلزي انتقالي',
    categoryEn: 'Transition Metal Oxide',
    molarMass: 159.69,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية شبكية قوية (Fe³⁺ + O²⁻)',
    bondingTypeEn: 'Network Ionic (Fe³⁺ & O²⁻ lattice)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'مسحوق صلب بني محمر',
    stateAtRoomTempEn: 'Reddish-brown Solid',
    colorHex: '#B91C1C',
    descriptionAr: 'المعدن الرئيسي لخام الحديد (الهيماتيت) والمكون الأساسي لصدأ الحديد المتآكل. يستخدم في تفاعل الثرميت الحراري لصهر ولحام قضبان السكك الحديدية.',
    descriptionEn: 'The primary iron ore mineral (hematite) and core constituent of rust. Used in thermite welding mixtures for railway tracks.',
    applicationsAr: ['استخلاص الحديد في الفرن اللافح (Blast Furnace)', 'صبغات الطلاء والمكياج (أحمر المغرة)', 'تفاعل الثرميت الشديد للحرارة مع الألومنيوم'],
    applicationsEn: ['Blast furnace iron smelting raw ore', 'Red ochre mineral pigments and cosmetics', 'Thermite incendiary welding with aluminum'],
    safetyAr: 'غير سام ومستقر، لكن استنشاق غباره قد يسبب تهيجاً للرئتين.',
    safetyEn: 'Non-toxic stable solid; dust causes mechanical irritation.',
    structure3D: {
      atoms: [
        { element: 'Fe', position: [-0.9, 0, 0], color: '#EA580C', radius: 0.75 },
        { element: 'Fe', position: [0.9, 0, 0], color: '#EA580C', radius: 0.75 },
        { element: 'O', position: [0, 0.9, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [-0.7, -0.9, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [0.7, -0.9, 0], color: '#EF4444', radius: 0.5 }
      ],
      bonds: [
        { from: 0, to: 2, order: 1 },
        { from: 1, to: 2, order: 1 },
        { from: 0, to: 3, order: 1 },
        { from: 1, to: 4, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'شبكة بلورية سداسية متراصة (Corundum structure)',
      geometryEn: 'Corundum-type crystal structure',
      bondsDescAr: 'روابط أيونية وشبه تساهمية في شبكة ثلاثية الأبعاد',
      bondsDescEn: '3D ionic lattice with octahedral Fe coordination',
      polarityAr: 'مركب غير قابل للذوبان في الماء',
      polarityEn: 'Insoluble inorganic network'
    }
  },

  // 18. Al2O3 - Aluminum Oxide (Alumina)
  {
    id: 'Al2O3',
    formula: 'Al₂O₃',
    elementCounts: { Al: 2, O: 3 },
    nameAr: 'أكسيد الألومنيوم (الألومينا / الياقوت)',
    nameEn: 'Aluminum Oxide (Alumina / Corundum)',
    iupacAr: 'ثلاثي أكسيد ثنائي الألومنيوم',
    iupacEn: 'Dialuminum trioxide',
    category: 'salt',
    categoryAr: 'أكسيد مذبذب (أمفوتيري)',
    categoryEn: 'Amphoteric Oxide',
    molarMass: 101.96,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية شبكية شديدة الصلابة (مقياس موس 9)',
    bondingTypeEn: 'Extremely hard ionic network (Mohs 9)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'مسحوق أبيض بلوري فائق الصلابة',
    stateAtRoomTempEn: 'White Ultra-hard Crystalline Solid',
    colorHex: '#E2E8F0',
    descriptionAr: 'يشكل معدن الكوروندوم، وهو أصل أحجار الياقوت والزفير الكريمة. مادة مذبذبة (أمفوتيرية) تتفاعل مع الأحماض والقواعد على حد سواء.',
    descriptionEn: 'Forms the mineral corundum, comprising precious rubies and sapphires. Amphoteric material capable of reacting with both acids and bases.',
    applicationsAr: ['مادة كاشطة وشحذ فائقة الصلابة (أحجار الجلخ)', 'إنتاج فلز الألومنيوم بالتحليل الكهربائي (طريقة هول-هيرولت)', 'طبقة الحماية الطبيعية التي تمنع تآكل الألومنيوم'],
    applicationsEn: ['Ultra-hard abrasives and grinding wheels', 'Electrolytic aluminum smelting (Hall-Héroult)', 'Passivation protective layer preventing corrosion'],
    safetyAr: 'خامل وغير سام، مسحوقه قد يسبب حساسية تنفسية كالغبار.',
    safetyEn: 'Inert and biocompatible; dust is an inhalation nuisance.',
    structure3D: {
      atoms: [
        { element: 'Al', position: [-0.9, 0, 0], color: '#94A3B8', radius: 0.7 },
        { element: 'Al', position: [0.9, 0, 0], color: '#94A3B8', radius: 0.7 },
        { element: 'O', position: [0, 0.9, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [-0.7, -0.9, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [0.7, -0.9, 0], color: '#EF4444', radius: 0.5 }
      ],
      bonds: [
        { from: 0, to: 2, order: 1 },
        { from: 1, to: 2, order: 1 },
        { from: 0, to: 3, order: 1 },
        { from: 1, to: 4, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'شبكة ثمانية الأوجه (Corundum Hexagonal)',
      geometryEn: 'Trigonal hexagonal network lattice',
      bondsDescAr: 'ترابط أيوني قوي مع تناسق ثماني الأوجه لذرات الألومنيوم',
      bondsDescEn: 'Octahedral Al coordination with high lattice energy',
      polarityAr: 'صلب غير قطبي غير قابل للذوبان',
      polarityEn: 'Insoluble refractory ceramic'
    }
  },

  // 19. SiO2 - Silicon Dioxide (Quartz / Sand)
  {
    id: 'SiO2',
    formula: 'SiO₂',
    elementCounts: { Si: 1, O: 2 },
    nameAr: 'ثاني أكسيد السيليكون (السيليكا / الكوارتز والرمل)',
    nameEn: 'Silicon Dioxide (Silica / Quartz)',
    iupacAr: 'ثاني أكسيد السيليكون',
    iupacEn: 'Silicon dioxide',
    category: 'water_oxide',
    categoryAr: 'شبكة تساهمية عملاقة',
    categoryEn: 'Giant Covalent Network',
    molarMass: 60.084,
    bondingType: 'network',
    bondingTypeAr: 'تساهمية شبكية عملاقة شديدة التماسك',
    bondingTypeEn: 'Giant 3D Covalent Network',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'بلورات كوارتز صلبة أو رمل شاطئي',
    stateAtRoomTempEn: 'Crystalline Solid Quartz / Sand',
    colorHex: '#FDE047',
    descriptionAr: 'المكون الرئيسي للرمل الزجاجي والكوارتز وأغلب صخور قشرة الأرض (59%). ترتبط كل ذرة سيليكون بأربع ذرات أكسجين بروابط تساهمية متصلة.',
    descriptionEn: 'The dominant mineral in beach sand, quartz, and Earth crust (59%). Every silicon atom is covalently bonded to four oxygens in a continuous mesh.',
    applicationsAr: ['صناعة الزجاج الشفاف والأواني الزجاجية المخبرية', 'تصنيع رقائق السيليكون للإلكترونيات والمعالجات الدقيقة', 'ألياف الاتصالات البصرية فائقة السرعة'],
    applicationsEn: ['Glassmaking and laboratory glassware', 'High-purity silicon wafers for microchips', 'Fiber optic telecommunication cables'],
    safetyAr: 'خامل كيميائياً تماماً، لكن استنشاق غباره الدقيق جداً يسبب السحار السيليسي (Silicosis).',
    safetyEn: 'Chemically inert; fine respirable dust causes silicosis.',
    structure3D: {
      atoms: [
        { element: 'Si', position: [0, 0, 0], color: '#EAB308', radius: 0.65 },
        { element: 'O', position: [-0.9, 0.6, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [0.9, -0.6, 0], color: '#EF4444', radius: 0.5 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 0, to: 2, order: 2 }
      ]
    },
    lewisInfo: {
      geometryAr: 'شبكة رباعية الأوجه متواصلة',
      geometryEn: 'Continuous tetrahedral network',
      bondsDescAr: 'روابط تساهمية Si-O أحادية تكرارية بدرجة انصهار فائقة (1710°C)',
      bondsDescEn: 'Covalent Si-O bonds forming tetrahedral SiO4 units',
      polarityAr: 'غير قطبي ومقاوم للأحماض (باستثناء حمض الهيدروفلوريك HF)',
      polarityEn: 'Insoluble inert network resistant to all acids except HF'
    }
  },

  // 20. C6H12O6 - Glucose
  {
    id: 'C6H12O6',
    formula: 'C₆H₁₂O₆',
    elementCounts: { C: 6, H: 12, O: 6 },
    nameAr: 'الجلوكوز (سكر الدم والعنب)',
    nameEn: 'Glucose (Blood Sugar / Dextrose)',
    iupacAr: 'دي-جلوكوز',
    iupacEn: 'D-Glucose',
    category: 'organic',
    categoryAr: 'كربوهيدرات / سكر أحادي',
    categoryEn: 'Monosaccharide Carbohydrate',
    molarMass: 180.156,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية عضوية مع 5 مجموعات هيدروكسيل قطبية',
    bondingTypeEn: 'Covalent with five polar hydroxyl groups',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'مسحوق بلوري أبيض حلو المذاق',
    stateAtRoomTempEn: 'White Sweet Crystalline Solid',
    colorHex: '#F8FAFC',
    descriptionAr: 'مصدر الطاقة الكيميائية الحيوي الأول لجميع الكائنات الحية وخلايا الدماغ. ينتج عن التمثيل الضوئي النباتي ويحترق داخل الميتوكوندريا لإنتاج ATP.',
    descriptionEn: 'The primary chemical fuel for all cellular respiration and brain activity. Synthesized by photosynthesis and metabolized to produce ATP energy.',
    applicationsAr: ['المصدر الحيوي للطاقة الخلوية في جسم الإنسان', 'المحاليل الوريدية المغذية في المستشفيات (محلول الدكستروز)', 'الصناعات الغذائية والتخمير الحيوي لإنتاج الإيثانول'],
    applicationsEn: ['Primary cellular energy substrate in organisms', 'Hospital intravenous nutrient drips (dextrose)', 'Food sweetening & microbial fermentation for bioethanol'],
    safetyAr: 'آمن وغذائي، وارتفاعه المزمن في الدم يرتبط بمرض السكري.',
    safetyEn: 'Nutritional food component; excess linked to diabetes.',
    structure3D: {
      atoms: [
        { element: 'C', position: [0.8, 0.7, 0], color: '#475569', radius: 0.5 },
        { element: 'C', position: [1.2, -0.6, 0.3], color: '#475569', radius: 0.5 },
        { element: 'C', position: [0.2, -1.4, -0.4], color: '#475569', radius: 0.5 },
        { element: 'C', position: [-1.1, -0.8, -0.1], color: '#475569', radius: 0.5 },
        { element: 'C', position: [-1.2, 0.6, 0.4], color: '#475569', radius: 0.5 },
        { element: 'O', position: [-0.2, 1.3, -0.3], color: '#EF4444', radius: 0.45 },
        { element: 'C', position: [-2.5, 1.2, 0], color: '#475569', radius: 0.5 },
        { element: 'O', position: [1.8, 1.5, 0], color: '#EF4444', radius: 0.45 },
        { element: 'O', position: [2.5, -0.7, 0.1], color: '#EF4444', radius: 0.45 },
        { element: 'O', position: [0.3, -2.7, 0], color: '#EF4444', radius: 0.45 },
        { element: 'O', position: [-2.1, -1.5, 0.4], color: '#EF4444', radius: 0.45 },
        { element: 'O', position: [-3.4, 0.4, 0.6], color: '#EF4444', radius: 0.45 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 },
        { from: 2, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 },
        { from: 4, to: 5, order: 1 },
        { from: 5, to: 0, order: 1 },
        { from: 4, to: 6, order: 1 },
        { from: 0, to: 7, order: 1 },
        { from: 1, to: 8, order: 1 },
        { from: 2, to: 9, order: 1 },
        { from: 3, to: 10, order: 1 },
        { from: 6, to: 11, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'حلقة سداسية كرسية (Chair conformation Pyranose)',
      geometryEn: 'Chair conformation pyranose ring',
      bondsDescAr: 'حلقة كربونية مؤكسجة غنية بمجموعات الهيدروكسيل القابلة للذوبان الفائق',
      bondsDescEn: 'Six-membered pyranose ring with 5 polar -OH groups',
      polarityAr: 'شديد القطبية وسريع الذوبان في الماء',
      polarityEn: 'Highly polar & highly soluble in water'
    }
  },

  // 21. C2H2 - Acetylene (Ethyne)
  {
    id: 'C2H2',
    formula: 'C₂H₂',
    elementCounts: { C: 2, H: 2 },
    nameAr: 'الأسيتيلين (الإيثاين)',
    nameEn: 'Acetylene (Ethyne)',
    iupacAr: 'إيثاين',
    iupacEn: 'Ethyne',
    category: 'organic',
    categoryAr: 'ألكاين هيدروكربوني',
    categoryEn: 'Alkyne Hydrocarbon',
    molarMass: 26.038,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية ثلاثية خطية (H-C≡C-H)',
    bondingTypeEn: 'Linear Triple Covalent (H-C≡C-H)',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز عديم اللون ذو رائحة مميزة',
    stateAtRoomTempEn: 'Colorless Gas with Garlic-like Odor',
    colorHex: '#38BDF8',
    descriptionAr: 'هيدروكربون يحتوي على رابطة كربون-كربون ثلاثية فائقة الطاقة. ينتج لهباً تتجاوز حرارته 3300 درجة مئوية عند احتراقه بالأكسجين النقي.',
    descriptionEn: 'Hydrocarbon with a high-energy carbon-carbon triple bond. Generates an oxy-acetylene flame exceeding 3,300°C for metal cutting.',
    applicationsAr: ['مشاعل اللحام والقطع الصهري للمعادن والصلب', 'المادة الأولية لتصنيع اللدائن وبوليمرات الأسيتيلين', 'إنتاج الكيماويات العضوية المتنوعة'],
    applicationsEn: ['Oxy-acetylene cutting & welding torches', 'Precursor for plastics & vinyl compounds', 'Synthesis of fine organic chemicals'],
    safetyAr: 'شديد القابلية للانفجار والاشتعال تحت الضغط، يحفظ مذاباً في الأسيتون.',
    safetyEn: 'Extremely explosive when pressurized; stored dissolved in acetone.',
    structure3D: {
      atoms: [
        { element: 'C', position: [-0.6, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [0.6, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'H', position: [-1.65, 0, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [1.65, 0, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 3 },
        { from: 0, to: 2, order: 1 },
        { from: 1, to: 3, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'خطية تماماً (Linear 180°)',
      geometryEn: 'Completely Linear (180°)',
      bondsDescAr: 'رابطة ثلاثية C≡C ورابطتان أحاديتان C-H (تهجين sp)',
      bondsDescEn: 'C≡C triple bond (one sigma, two pi) with sp hybridization',
      polarityAr: 'غير قطبي متناظر',
      polarityEn: 'Symmetrical Nonpolar'
    }
  },

  // 22. C2H4 - Ethylene (Ethene)
  {
    id: 'C2H4',
    formula: 'C₂H₄',
    elementCounts: { C: 2, H: 4 },
    nameAr: 'الإيثيلين (الإيثين)',
    nameEn: 'Ethylene (Ethene)',
    iupacAr: 'إيثين',
    iupacEn: 'Ethene',
    category: 'organic',
    categoryAr: 'ألكين هيدروكربوني',
    categoryEn: 'Alkene Hydrocarbon',
    molarMass: 28.054,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية ثنائية مستوية (C=C)',
    bondingTypeEn: 'Planar Double Covalent (C=C)',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز عديم اللون حلو الرائحة',
    stateAtRoomTempEn: 'Sweet-smelling Colorless Gas',
    colorHex: '#38BDF8',
    descriptionAr: 'المركب العضوي الأكثر إنتاجاً في العالم بلا منازع (أكثر من 200 مليون طن سنوياً). هرمون نباتي طبيعي يسرع إنضاج الفواكه والثمار.',
    descriptionEn: 'The most manufactured organic compound globally (>200M tons/yr). Serves as a natural plant hormone triggering fruit ripening.',
    applicationsAr: ['إنتاج البولي إيثيلين (البلاستيك الأكثر انتشاراً في العالم)', 'تسريع إنضاج الموز والطماطم في غرف الإنضاج الزراعي', 'تصنيع مضادات التجمد وأكسيد الإيثيلين'],
    applicationsEn: ['Polyethylene manufacturing (world most common plastic)', 'Agricultural fruit ripening agent for bananas', 'Precursor for antifreeze ethylene glycol'],
    safetyAr: 'شديد الاشتعال وخانق عند التراكيز العالية.',
    safetyEn: 'Highly flammable; simple asphyxiant at high levels.',
    structure3D: {
      atoms: [
        { element: 'C', position: [-0.65, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [0.65, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'H', position: [-1.2, 0.9, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.2, -0.9, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [1.2, 0.9, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [1.2, -0.9, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 0, to: 2, order: 1 },
        { from: 0, to: 3, order: 1 },
        { from: 1, to: 4, order: 1 },
        { from: 1, to: 5, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'مستوٍ مثلثي حول كل كربون (Trigonal Planar 120°)',
      geometryEn: 'Trigonal Planar (120° around both carbons)',
      bondsDescAr: 'رابطة ثنائية C=C وأربع روابط أحادية C-H (تهجين sp²)',
      bondsDescEn: 'C=C double bond (1 sigma + 1 pi) with sp² hybridization',
      polarityAr: 'غير قطبي متماثل',
      polarityEn: 'Nonpolar symmetrical'
    }
  },

  // 23. NaHCO3 - Sodium Bicarbonate (Baking Soda)
  {
    id: 'NaHCO3',
    formula: 'NaHCO₃',
    elementCounts: { Na: 1, H: 1, C: 1, O: 3 },
    nameAr: 'بيكربونات الصوديوم (صودا الخبز)',
    nameEn: 'Sodium Bicarbonate (Baking Soda)',
    iupacAr: 'كربونات الصوديوم الهيدروجينية',
    iupacEn: 'Sodium hydrogen carbonate',
    category: 'salt',
    categoryAr: 'ملح هيدروجيني قلوي خفيف',
    categoryEn: 'Hydrogen Carbonate Salt',
    molarMass: 84.007,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية بين كاتيون الصوديوم Na⁺ وأنيون البيكربونات',
    bondingTypeEn: 'Ionic (Na⁺ cation and HCO₃⁻ anion)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'مسحوق أبيض ناعم',
    stateAtRoomTempEn: 'Fine White Crystalline Powder',
    colorHex: '#F1F5F9',
    descriptionAr: 'صودا الخبز الشهيرة، تتفكك بالحرارة فوق 50°C أو بالتفاعل مع الأحماض لتعطي غاز ثاني أكسيد الكربون، مما يسبب انتفاخ العجائن في المخابز.',
    descriptionEn: 'Culinary baking soda; decomposes thermally or with acids to release CO2 gas, leavening bread dough and cakes.',
    applicationsAr: ['مادة رافعة للمخبوزات والكعك في المطبخ', 'مضاد للحموضة وتخفيف حرقة المعدة', 'مطفآت الحريق الجافة وإزالة الروائح الكريهة'],
    applicationsEn: ['Baking leavening agent for cakes & breads', 'Antacid for relieving indigestion & heartburn', 'Dry chemical fire extinguishers & deodorizing'],
    safetyAr: 'آمن تماماً للاستخدام الغذائي والصيدلاني.',
    safetyEn: 'Safe for food and pharmaceutical consumption.',
    structure3D: {
      atoms: [
        { element: 'Na', position: [-1.2, 0, 0], color: '#A855F7', radius: 0.75 },
        { element: 'C', position: [0.6, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'O', position: [0.6, 1.1, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [1.6, -0.55, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [-0.4, -0.55, 0], color: '#EF4444', radius: 0.5 },
        { element: 'H', position: [2.3, -0.2, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 1, to: 2, order: 2 },
        { from: 1, to: 3, order: 1 },
        { from: 1, to: 4, order: 1 },
        { from: 3, to: 5, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'مستوٍ مثلثي حول الكربون',
      geometryEn: 'Trigonal planar around C',
      bondsDescAr: 'رابطة أيونية Na⁺ مع أنيون HCO₃⁻ الحاوي على رابطة O-H',
      bondsDescEn: 'Ionic pairing with HCO₃⁻ anion containing O-H bond',
      polarityAr: 'أيوني قابل للذوبان في الماء',
      polarityEn: 'Water-soluble ionic salt'
    }
  },

  // 24. SO2 - Sulfur Dioxide
  {
    id: 'SO2',
    formula: 'SO₂',
    elementCounts: { S: 1, O: 2 },
    nameAr: 'ثاني أكسيد الكبريت',
    nameEn: 'Sulfur Dioxide',
    iupacAr: 'ثاني أكسيد الكبريت',
    iupacEn: 'Sulfur dioxide',
    category: 'water_oxide',
    categoryAr: 'أكسيد حامضي ملوث',
    categoryEn: 'Acidic Gas / Pollutant',
    molarMass: 64.066,
    bondingType: 'polar_covalent',
    bondingTypeAr: 'تساهمية قطبية منحنية (بسبب الزوج الإلكتروني الحر على الكبريت)',
    bondingTypeEn: 'Bent Polar Covalent (lone pair on S)',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز خانق ذو رائحة كبريت محترق لاذعة',
    stateAtRoomTempEn: 'Choking Pungent Gas',
    colorHex: '#FACC15',
    descriptionAr: 'غاز ينتج طبيعياً من البراكين وصناعياً من حرق الفحم والنفط المحتوي على كبريت. يتفاعل مع بخار الماء في الغلاف الجوي مسبباً الأمطار الحمضية.',
    descriptionEn: 'Volcanic gas emitted from fossil fuels combustion. Combines with atmospheric moisture to form acid rain.',
    applicationsAr: ['المادة الأساسية لإنتاج حمض الكبريتيك بالتلامس', 'مادة حافظة ومضادة للأكسدة في تعليب الفواكه المجففة', 'تبييض الورق وصناعة الصوف'],
    applicationsEn: ['Sulfuric acid contact process raw gas', 'Antioxidant & antimicrobial preservative in dried fruits', 'Pulp bleaching and wool processing'],
    safetyAr: 'سام ومهيج للجهاز التنفسي ويسبب تآكل الأغشية المخاطية.',
    safetyEn: 'Toxic, severely irritates bronchial tubes; triggers asthma.',
    structure3D: {
      atoms: [
        { element: 'S', position: [0, 0.3, 0], color: '#FACC15', radius: 0.65 },
        { element: 'O', position: [-1.0, -0.4, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [1.0, -0.4, 0], color: '#EF4444', radius: 0.5 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 0, to: 2, order: 2 }
      ]
    },
    lewisInfo: {
      geometryAr: 'منحنية بزاوية 119 درجة',
      geometryEn: 'Bent V-shaped (119°)',
      bondsDescAr: 'رابطتان تساهميتان رنينيتان مع زوج إلكتروني حر على الكبريت',
      bondsDescEn: 'Resonant S=O bonds with a lone pair on Sulfur',
      polarityAr: 'قطبي (عزم 1.63 ديباي)',
      polarityEn: 'Polar (1.63 D dipole moment)'
    }
  },

  // 25. NO2 - Nitrogen Dioxide
  {
    id: 'NO2',
    formula: 'NO₂',
    elementCounts: { N: 1, O: 2 },
    nameAr: 'ثاني أكسيد النيتروجين (الغاز البني المحمر)',
    nameEn: 'Nitrogen Dioxide',
    iupacAr: 'ثاني أكسيد النيتروجين',
    iupacEn: 'Nitrogen dioxide',
    category: 'water_oxide',
    categoryAr: 'أكسيد جذري بني ملوث',
    categoryEn: 'Radical Toxic Oxide',
    molarMass: 46.006,
    bondingType: 'polar_covalent',
    bondingTypeAr: 'تساهمية قطبية مع إلكترون مفرد (جذر حر كيميائي)',
    bondingTypeEn: 'Polar Covalent with odd unpaired electron (free radical)',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز بني محمر ذو رائحة مخرشة حادة',
    stateAtRoomTempEn: 'Reddish-brown Gas with Acrid Odor',
    colorHex: '#991B1B',
    descriptionAr: 'غاز سام ذو لون بني محمر واضح، يحتوي على إلكترون تكافؤ مفرد غير مقترن (جذر حر نشط). مسؤول عن الضباب الدخاني الكيميائي الضوئي في المدن.',
    descriptionEn: 'Prominent reddish-brown toxic gas possessing an odd unpaired electron (paramagnetic radical). Prime culprit in urban photochemical smog.',
    applicationsAr: ['وسيط كيميائي رئيسي في تصنيع حمض النيتريك والمتفجرات', 'مؤكسد قوي في صواريخ الفضاء عند تبريده إلى N2O4', 'مقياس جودة الهواء الحضري'],
    applicationsEn: ['Intermediate in nitric acid & explosives production', 'Storable rocket propellant oxidizer (as N2O4)', 'Urban air pollution monitor metric'],
    safetyAr: 'شديد السمية ويسبب وذمة رئوية مميتة بعد استنشاقه بعدة ساعات.',
    safetyEn: 'Highly toxic; induces fatal delayed pulmonary edema.',
    structure3D: {
      atoms: [
        { element: 'N', position: [0, 0.3, 0], color: '#3B82F6', radius: 0.55 },
        { element: 'O', position: [-0.95, -0.35, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [0.95, -0.35, 0], color: '#EF4444', radius: 0.5 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 0, to: 2, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'منحنية بزاوية 134.3 درجة',
      geometryEn: 'Bent (134.3°)',
      bondsDescAr: 'روابط رنينية مع إلكترون وحيد مفرد على النيتروجين',
      bondsDescEn: 'Resonant bonds with a single unpaired electron on Nitrogen',
      polarityAr: 'قطبي ومغناطيسي مساير (Paramagnetic radical)',
      polarityEn: 'Polar and paramagnetic radical'
    }
  },

  // 26. C6H6 - Benzene
  {
    id: 'C6H6',
    formula: 'C₆H₆',
    elementCounts: { C: 6, H: 6 },
    nameAr: 'البنزين العطري (بنزول)',
    nameEn: 'Benzene',
    iupacAr: 'بنزين',
    iupacEn: 'Benzene',
    category: 'organic',
    categoryAr: 'هيدروكربون أروماتي عطري',
    categoryEn: 'Aromatic Hydrocarbon',
    molarMass: 78.114,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية أروماتية مع سحابة رنينية دائرية غير متمركزة',
    bondingTypeEn: 'Delocalized Aromatic Pi-System Ring',
    stateAtRoomTemp: 'liquid',
    stateAtRoomTempAr: 'سائل عديم اللون متطاير ذو رائحة عطرية',
    stateAtRoomTempEn: 'Colorless Volatile Liquid with Sweet Odor',
    colorHex: '#38BDF8',
    descriptionAr: 'حجر الزاوية في الكيمياء العضوية الأروماتية. حلقته السداسية المستوية المتناظرة تحتوي على 6 إلكترونات باي غير متمركزة تمنحه استقراراً فائقاً يسمى الأروماتية.',
    descriptionEn: 'The archetypal aromatic hydrocarbon. Its planar hexagonal ring features 6 delocalized pi electrons providing remarkable aromatic stability.',
    applicationsAr: ['المادة الخام لتصنيع البوليسترين والمطاط الصناعي والنايلون', 'إنتاج الأدوية والعقاقير والأصباغ العضوية', 'مذيب عضوي عالي الفعالية في الأبحاث'],
    applicationsEn: ['Feedstock for polystyrene, synthetic rubber, and nylon', 'Pharmaceuticals, dyes, and detergent synthesis', 'Historical organic solvent in laboratories'],
    safetyAr: 'مسرطن مؤكد (يسبب سرطان الدم واللوكيميا)، سام وسريع الاشتعال.',
    safetyEn: 'Known human carcinogen (leukemia); highly flammable.',
    structure3D: {
      atoms: [
        { element: 'C', position: [1.2, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [0.6, 1.04, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [-0.6, 1.04, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [-1.2, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [-0.6, -1.04, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [0.6, -1.04, 0], color: '#475569', radius: 0.55 },
        { element: 'H', position: [2.15, 0, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [1.08, 1.86, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.08, 1.86, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-2.15, 0, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.08, -1.86, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [1.08, -1.86, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 1, to: 2, order: 1 },
        { from: 2, to: 3, order: 2 },
        { from: 3, to: 4, order: 1 },
        { from: 4, to: 5, order: 2 },
        { from: 5, to: 0, order: 1 },
        { from: 0, to: 6, order: 1 },
        { from: 1, to: 7, order: 1 },
        { from: 2, to: 8, order: 1 },
        { from: 3, to: 9, order: 1 },
        { from: 4, to: 10, order: 1 },
        { from: 5, to: 11, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'حلقة سداسية مستوية تماماً (Planar Hexagonal D6h)',
      geometryEn: 'Planar Hexagonal (D6h symmetry)',
      bondsDescAr: 'روابط هجينة بين الأحادية والثنائية (رتبة رابطة 1.5 متساوية)',
      bondsDescEn: 'Aromatic resonant bonds of equal 1.5 order',
      polarityAr: 'غير قطبي تماماً بفضل التناظر الدائري التام',
      polarityEn: 'Purely Nonpolar'
    }
  },

  // 27. HNO3 - Nitric Acid
  {
    id: 'HNO3',
    formula: 'HNO₃',
    elementCounts: { H: 1, N: 1, O: 3 },
    nameAr: 'حمض النيتريك (ماء النار)',
    nameEn: 'Nitric Acid (Aqua Fortis)',
    iupacAr: 'حمض النيتريك',
    iupacEn: 'Nitric acid',
    category: 'acid',
    categoryAr: 'حمض معدني مؤكسد عنيف',
    categoryEn: 'Strong Oxidizing Mineral Acid',
    molarMass: 63.012,
    bondingType: 'polar_covalent',
    bondingTypeAr: 'تساهمية قطبية مؤكسدة',
    bondingTypeEn: 'Polar Covalent Oxyacid',
    stateAtRoomTemp: 'liquid',
    stateAtRoomTempAr: 'سائل مدخن مصفر ذو رائحة خانقة',
    stateAtRoomTempEn: 'Fuming Yellowish Corrosive Liquid',
    colorHex: '#FBBF24',
    descriptionAr: '"ماء النار" التاريخي، حمض مؤكسد فائق القدرة يذيب معظم الفلزات بما فيها النحاس والفضة، ويشكل مع حمض الهيدروكلوريك "الماء الملكي" الذي يذيب الذهب!',
    descriptionEn: 'The historical "Aqua Fortis". Dissolves most metals including copper and silver; combined with HCl, it forms Aqua Regia which dissolves gold!',
    applicationsAr: ['تصنيع أسمدة نترات الأمونيوم للزراعة', 'إنتاج المتفجرات العسكرية والمدنية (TNT والديناميت والنيتروجليسرين)', 'حفر ونقش الدوائر الإلكترونية المطبوعة'],
    applicationsEn: ['Ammonium nitrate agricultural fertilizers', 'Explosives manufacturing (TNT, nitroglycerin)', 'PCB electronic circuit board etching'],
    safetyAr: 'شديد التآكل يسبب اصفرار وحروقاً شديدة للجلد، وأبخرته تدمر الرئتين.',
    safetyEn: 'Extremely corrosive; stains skin bright yellow, fuming vapors destroy lungs.',
    structure3D: {
      atoms: [
        { element: 'N', position: [0, 0.2, 0], color: '#3B82F6', radius: 0.55 },
        { element: 'O', position: [0, 1.3, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [1.1, -0.4, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [-1.1, -0.4, 0], color: '#EF4444', radius: 0.5 },
        { element: 'H', position: [-1.7, 0.2, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 0, to: 2, order: 1 },
        { from: 0, to: 3, order: 1 },
        { from: 3, to: 4, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'مستوٍ مثلثي حول النيتروجين (Trigonal Planar)',
      geometryEn: 'Trigonal planar around Nitrogen',
      bondsDescAr: 'رابطة رنينية N=O ورابطة أحادية N-OH',
      bondsDescEn: 'Resonant N=O bonds with single N-OH bond',
      polarityAr: 'قطبي عالي التأين',
      polarityEn: 'Strongly polar & fully ionized in water'
    }
  },

  // 28. Cl2 - Molecular Chlorine
  {
    id: 'Cl2',
    formula: 'Cl₂',
    elementCounts: { Cl: 2 },
    nameAr: 'غاز الكلور الجزيئي',
    nameEn: 'Molecular Chlorine',
    iupacAr: 'ثنائي الكلور',
    iupacEn: 'Dichlorine',
    category: 'elementary',
    categoryAr: 'هالوجين عنصري غازي',
    categoryEn: 'Diatomic Halogen Gas',
    molarMass: 70.90,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية أحادية نقية غير قطبية',
    bondingTypeEn: 'Pure Single Covalent Bond',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز أصفر مخضر ذو رائحة مبيضة خانقة',
    stateAtRoomTempEn: 'Greenish-yellow Choking Gas',
    colorHex: '#14B8A6',
    descriptionAr: 'غاز هالوجيني أصفر مخضر سام ذو كثافة تفوق الهواء بمرتين ونصف. مؤكسد فعال ومطهر واسع النطاق استخدم تاريخياً في الحرب العالمية الأولى.',
    descriptionEn: 'Dense, suffocating greenish-yellow halogen gas. Potent oxidizer and disinfectant historically used as a chemical weapon in WWI.',
    applicationsAr: ['تعقيم وتطهير مياه الشرب وأحواض السباحة', 'إنتاج مبيضات الغسيل (هيبوكلوريت الصوديوم)', 'صناعة البوليمرات وبلاستيك PVC'],
    applicationsEn: ['Drinking water & swimming pools disinfection', 'Household bleach production (sodium hypochlorite)', 'Polyvinyl chloride (PVC plastic) synthesis'],
    safetyAr: 'سام للغاية عند الاستنشاق، يتفاعل مع ماء الرئتين مكوناً حمض الهيدروكلوريك.',
    safetyEn: 'Extremely toxic by inhalation; forms hydrochloric acid in lungs.',
    structure3D: {
      atoms: [
        { element: 'Cl', position: [-0.7, 0, 0], color: '#14B8A6', radius: 0.65 },
        { element: 'Cl', position: [0.7, 0, 0], color: '#14B8A6', radius: 0.65 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'خطي ثنائي الذرة (Linear)',
      geometryEn: 'Linear Diatomic',
      bondsDescAr: 'رابطة سيجما أحادية مع 3 أزواج حرة على كل ذرة كلور',
      bondsDescEn: '1 single covalent bond, 3 lone pairs on each Cl',
      polarityAr: 'غير قطبي',
      polarityEn: 'Purely Nonpolar'
    }
  },

  // 29. CO - Carbon Monoxide
  {
    id: 'CO',
    formula: 'CO',
    elementCounts: { C: 1, O: 1 },
    nameAr: 'أول أكسيد الكربون (القاتل الصامت)',
    nameEn: 'Carbon Monoxide (Silent Killer)',
    iupacAr: 'أول أكسيد الكربون',
    iupacEn: 'Carbon monoxide',
    category: 'water_oxide',
    categoryAr: 'أكسيد كربوني سام',
    categoryEn: 'Toxic Carbon Oxide',
    molarMass: 28.01,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية وتناسقية ثلاثية (C≡O)',
    bondingTypeEn: 'Triple Covalent / Coordinate Bond (C≡O)',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز عديم اللون والرائحة والطعم',
    stateAtRoomTempEn: 'Colorless, Odorless, Tasteless Gas',
    colorHex: '#64748B',
    descriptionAr: '"القاتل الصامت" الذي ينتج عن الاحتراق غير التام للوقود. يرتبط بالهيموجلوبين بقوة تفوق الأكسجين بـ 250 ضعفاً، مانعاً وصول الأكسجين إلى خلايا الجسم والدماغ.',
    descriptionEn: 'The "Silent Killer" produced by incomplete hydrocarbon combustion. Binds to blood hemoglobin 250 times more tightly than oxygen, causing fatal asphyxiation.',
    applicationsAr: ['غاز التخليق (Syngas) لإنتاج الميثانول والهيدروكربونات', 'عامل اختزال قوي لخامات المعادن في أفران التعدين', 'الأبحاث الطبية المتقدمة للإشارات الحيوية'],
    applicationsEn: ['Syngas component for chemical fuel synthesis', 'Industrial reducing agent for extracting metals', 'Biomedical signaling research at trace levels'],
    safetyAr: 'قاتل فتاك وغير محسوس، يسبب الصداع ثم الغيبوبة والوفاة السريعة.',
    safetyEn: 'Extremely lethal; causes rapid carbon monoxide poisoning.',
    structure3D: {
      atoms: [
        { element: 'C', position: [-0.55, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'O', position: [0.55, 0, 0], color: '#EF4444', radius: 0.55 }
      ],
      bonds: [
        { from: 0, to: 1, order: 3 }
      ]
    },
    lewisInfo: {
      geometryAr: 'خطي ثنائي الذرة (Linear)',
      geometryEn: 'Linear Diatomic',
      bondsDescAr: 'رابطة ثلاثية تشمل رابطة تناسقية مانحة من الأكسجين مع شحنة شكلية -1 على C و +1 على O',
      bondsDescEn: 'Triple bond with coordinate covalent bond; formal charges C(-1), O(+1)',
      polarityAr: 'ضعيف القطبية (عزم 0.12 ديباي)',
      polarityEn: 'Weakly polar (0.12 D dipole moment)'
    }
  },

  // 30. O3 - Ozone
  {
    id: 'O3',
    formula: 'O₃',
    elementCounts: { O: 3 },
    nameAr: 'الأوزون (درع الأرض)',
    nameEn: 'Ozone',
    iupacAr: 'ثلاثي الأكسجين',
    iupacEn: 'Trioxygen',
    category: 'elementary',
    categoryAr: 'متآصل أكسجيني مؤكسد',
    categoryEn: 'Allotrope of Oxygen',
    molarMass: 47.997,
    bondingType: 'polar_covalent',
    bondingTypeAr: 'تساهمية رنينية منحنية غير مستقرة',
    bondingTypeEn: 'Bent Resonant Polar Covalent',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز أزرق شاحب ذو رائحة كهربائية مميزة',
    stateAtRoomTempEn: 'Pale Blue Gas with Electrical Odor',
    colorHex: '#38BDF8',
    descriptionAr: 'درع الحياة في طبقة الستراتوسفير الذي يمتص الأشعة فوق البنفسجية الضارة (UV-B). مؤكسد فائق القوة ينتج أيضاً عن الصواعق ومكائن النسخ الكهربائية.',
    descriptionEn: 'Earth planetary sunscreen in the stratosphere shielding UV-B radiation. Highly reactive oxidizer generated by lightning strikes.',
    applicationsAr: ['حماية الغلاف الجوي للأرض من الأشعة الشمسية القاتلة', 'تعقيم مياه الشرب دون ترك طعم الكلور', 'إزالة الروائح والدخان من المباني المتضررة بالحرائق'],
    applicationsEn: ['Stratospheric shield against lethal solar UV rays', 'Advanced water purification without chlorination taste', 'Industrial smoke and odor remediation'],
    safetyAr: 'مؤكسد سام ومهيج جداً للجهاز التنفسي عند مستوى سطح الأرض.',
    safetyEn: 'Toxic ground-level pollutant; severely irritates lungs.',
    structure3D: {
      atoms: [
        { element: 'O', position: [0, 0.35, 0], color: '#EF4444', radius: 0.55 },
        { element: 'O', position: [-0.95, -0.3, 0], color: '#EF4444', radius: 0.55 },
        { element: 'O', position: [0.95, -0.3, 0], color: '#EF4444', radius: 0.55 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 0, to: 2, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'منحنية بزاوية 116.8 درجة',
      geometryEn: 'Bent (116.8°)',
      bondsDescAr: 'رابطتان رنينيتان بمتوسط رتبة رابطة 1.5 وشحنات رنينية',
      bondsDescEn: 'Resonance hybrid of bond order 1.5 with delocalized pi electrons',
      polarityAr: 'قطبي (عزم 0.53 ديباي)',
      polarityEn: 'Polar (0.53 D dipole moment)'
    }
  },

  // 31. MgCl2 - Magnesium Chloride
  {
    id: 'MgCl2',
    formula: 'MgCl₂',
    elementCounts: { Mg: 1, Cl: 2 },
    nameAr: 'كلوريد المغنيسيوم',
    nameEn: 'Magnesium Chloride',
    iupacAr: 'كلوريد المغنيسيوم',
    iupacEn: 'Magnesium chloride',
    category: 'salt',
    categoryAr: 'ملح أيوني بحري',
    categoryEn: 'Marine Ionic Salt',
    molarMass: 95.211,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية كاملة (Mg²⁺ + 2Cl⁻)',
    bondingTypeEn: 'Ionic (Mg²⁺ + 2Cl⁻)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'حبيبات بلورية بيضاء شرهة للرطوبة',
    stateAtRoomTempEn: 'White Hygroscopic Crystals',
    colorHex: '#10B981',
    descriptionAr: 'ملح رئيسي مستخرج من مياه البحر الميت والبحار المالحة، شديد الامتصاص للرطوبة من الهواء. يستخدم لإذابة الجليد على الطرقات عند درجات حرارة أبرد بكثير من ملح الطعام.',
    descriptionEn: 'Major salt extracted from seawater and the Dead Sea. Strongly hygroscopic, melts road ice down to -15°C much lower than ordinary salt.',
    applicationsAr: ['إذابة الثلوج وتثبيت الغبار على الطرقات غير المعبدة', 'إنتاج معدن المغنيسيوم النقي بالتحليل الكهربائي', 'تخثير بروتين الصويا لصناعة التوفو (Nigari)'],
    applicationsEn: ['Highway de-icing & road dust suppression', 'Electrolytic precursor for pure magnesium metal', 'Soybean curd coagulant for making traditional tofu'],
    safetyAr: 'آمن وغير سام، مفرطه يسبب تأثيراً مليناً للمعدة.',
    safetyEn: 'Non-toxic; high dietary doses exert a laxative effect.',
    structure3D: {
      atoms: [
        { element: 'Mg', position: [0, 0, 0], color: '#10B981', radius: 0.75 },
        { element: 'Cl', position: [-1.2, 0, 0], color: '#14B8A6', radius: 0.65 },
        { element: 'Cl', position: [1.2, 0, 0], color: '#14B8A6', radius: 0.65 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 0, to: 2, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'خطي أيوني (CdCl2 type layer lattice)',
      geometryEn: 'Linear ionic in gas phase / Layered lattice',
      bondsDescAr: 'روابط أيونية كهروستاتيكية مزدوجة',
      bondsDescEn: 'Ionic attraction with two chloride counter-anions',
      polarityAr: 'أيوني شديد الذوبان في الماء',
      polarityEn: 'Highly soluble ionic electrolyte'
    }
  },

  // 32. CaCl2 - Calcium Chloride
  {
    id: 'CaCl2',
    formula: 'CaCl₂',
    elementCounts: { Ca: 1, Cl: 2 },
    nameAr: 'كلوريد الكالسيوم',
    nameEn: 'Calcium Chloride',
    iupacAr: 'كلوريد الكالسيوم',
    iupacEn: 'Calcium chloride',
    category: 'salt',
    categoryAr: 'ملح أيوني مجفف فائق',
    categoryEn: 'Desiccant Ionic Salt',
    molarMass: 110.98,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية تامة (Ca²⁺ + 2Cl⁻)',
    bondingTypeEn: 'Ionic (Ca²⁺ + 2Cl⁻)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'حبيبات بيضاء متميعة بشدة',
    stateAtRoomTempEn: 'White Highly Deliquescent Pellets',
    colorHex: '#06B6D4',
    descriptionAr: 'عامل تجفيف خارق يمتص الرطوبة من الجو حتى يذوب في مائه الممتص ليتحول إلى محلول سائل. تفاعله مع الماء ناشر للحرارة بشدة.',
    descriptionEn: 'Remarkable desiccant absorbing so much ambient moisture that it dissolves into its own water. Dissolves exothermically with high heat release.',
    applicationsAr: ['حبيبات إزالة الرطوبة في الخزائن والمباني الرطبة', 'إذابة الجليد الشديد في درجات حرارة تصل إلى -30°C', 'تسريع تصلب الخرسانة في الإنشاءات ومضاف غذائي للجبن'],
    applicationsEn: ['Moisture absorbing packs in damp closets', 'Extreme low-temperature de-icing (down to -30°C)', 'Concrete setting accelerator and cheese firming additive'],
    safetyAr: 'مهيج للأغشية والجلد الجاف بسبب سحبه السريع للماء والحرارة.',
    safetyEn: 'Skin irritant due to powerful exothermic dehydration.',
    structure3D: {
      atoms: [
        { element: 'Ca', position: [0, 0, 0], color: '#06B6D4', radius: 0.8 },
        { element: 'Cl', position: [-1.25, 0, 0], color: '#14B8A6', radius: 0.65 },
        { element: 'Cl', position: [1.25, 0, 0], color: '#14B8A6', radius: 0.65 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 0, to: 2, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'شبكة أيونية (Rutile-related lattice)',
      geometryEn: 'Ionic crystal lattice',
      bondsDescAr: 'رابطتان أيونيتان مع أيوني الكلوريد',
      bondsDescEn: 'Two ionic bonds balancing Ca²⁺ charge',
      polarityAr: 'أيوني شديد الذوبان والحرارة',
      polarityEn: 'Exothermic water-soluble ionic salt'
    }
  },

  // 33. KCl - Potassium Chloride
  {
    id: 'KCl',
    formula: 'KCl',
    elementCounts: { K: 1, Cl: 1 },
    nameAr: 'كلوريد البوتاسيوم',
    nameEn: 'Potassium Chloride',
    iupacAr: 'كلوريد البوتاسيوم',
    iupacEn: 'Potassium chloride',
    category: 'salt',
    categoryAr: 'ملح بوتاسي زراعي وطبي',
    categoryEn: 'Potassium Mineral Salt',
    molarMass: 74.551,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية مكعبة (K⁺ + Cl⁻)',
    bondingTypeEn: 'Ionic Cubic Lattice (K⁺ + Cl⁻)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'بلورات بيضاء أو وردية شبيهة بملح الطعام',
    stateAtRoomTempEn: 'White/Pinkish Crystalline Salt',
    colorHex: '#8B5CF6',
    descriptionAr: 'المصدر الأساسي لعنصر البوتاسيوم الحيوي للنبات والإنسان. يستخدم كبديل لملح الصوديوم لمرضى ارتفاع ضغط الدم، وفي الحقن الطبية لتنظيم ضربات القلب.',
    descriptionEn: 'The primary mineral fertilizer source of potassium for global crops. Serves as a sodium-free table salt substitute for hypertension patients.',
    applicationsAr: ['أسمدة البوتاس الزراعية (Potash) لتغذية المحاصيل', 'بديل صحي لملح الطعام خالي من الصوديوم', 'المحاليل الطبية الوريدية لعلاج نقص البوتاسيوم'],
    applicationsEn: ['Agricultural potash fertilizer for crops', 'Sodium-free dietary table salt substitute', 'Medical electrolyte replacement therapies'],
    safetyAr: 'آمن غذائياً، لكن حقنه بجرعات عالية في الوريد يوقف القلب فوراً.',
    safetyEn: 'Safe in food; rapid intravenous overdose induces cardiac arrest.',
    structure3D: {
      atoms: [
        { element: 'K', position: [-0.95, 0, 0], color: '#8B5CF6', radius: 0.85 },
        { element: 'Cl', position: [0.95, 0, 0], color: '#14B8A6', radius: 0.65 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'مكعب متمركز الأوجه (Halite crystal structure)',
      geometryEn: 'Face-centered cubic (Halite)',
      bondsDescAr: 'رابطة أيونية تامة بين K⁺ و Cl⁻',
      bondsDescEn: 'Classic 1:1 ionic bond pair',
      polarityAr: 'أيوني قطبي يذوب بسهولة',
      polarityEn: 'Water soluble ionic electrolyte'
    }
  },

  // 34. CH3OH - Methanol (Wood Alcohol)
  {
    id: 'CH3OH',
    formula: 'CH₃OH',
    elementCounts: { C: 1, H: 4, O: 1 },
    nameAr: 'الميثانول (كحول الخشب)',
    nameEn: 'Methanol (Wood Alcohol)',
    iupacAr: 'ميثانول',
    iupacEn: 'Methanol',
    category: 'organic',
    categoryAr: 'كحول عضوي سام',
    categoryEn: 'Simplest Alcohol',
    molarMass: 32.042,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية قطبية هيدروجينية',
    bondingTypeEn: 'Polar Covalent with Hydrogen Bonding',
    stateAtRoomTemp: 'liquid',
    stateAtRoomTempAr: 'سائل شفاف متطاير',
    stateAtRoomTempEn: 'Colorless Volatile Liquid',
    colorHex: '#38BDF8',
    descriptionAr: 'أبسط الكحولات إطلاقاً، كان يستخرج قديماً بتقطير الخشب. مركب كيميائي أساسي ووقود عالي الأوكتان، لكنه شديد السمية على الإنسان.',
    descriptionEn: 'The simplest alcohol, historically obtained by wood distillation. Vital petrochemical building block and racing fuel, but highly toxic to ingest.',
    applicationsAr: ['إنتاج الفورمالديهايد وراتنجات الخشب واللدائن', 'وقود سيارات السباق الاحترافية (IndyCar)', 'وقود لخلايا الميثانول المباشرة (DMFC) ومضاد للتجمد'],
    applicationsEn: ['Formaldehyde & plastics chemical feedstock', 'High-octane racing fuel (IndyCar)', 'Direct methanol fuel cells & windshield washer antifreeze'],
    safetyAr: 'شديد السمية! شرب 10 مل منه يسبب العمى الدائم، و 30 مل تسبب الوفاة.',
    safetyEn: 'Extremely toxic: metabolizes to formic acid causing permanent blindness or death.',
    structure3D: {
      atoms: [
        { element: 'C', position: [-0.4, 0, 0], color: '#475569', radius: 0.55 },
        { element: 'O', position: [0.8, 0.4, 0], color: '#EF4444', radius: 0.5 },
        { element: 'H', position: [1.4, -0.2, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-0.8, -0.9, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-0.6, 0.6, 0.8], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-0.6, 0.6, -0.8], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 },
        { from: 0, to: 3, order: 1 },
        { from: 0, to: 4, order: 1 },
        { from: 0, to: 5, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'رباعي الأوجه حول الكربون ومنحني حول الأكسجين',
      geometryEn: 'Tetrahedral around C, bent around O',
      bondsDescAr: '3 روابط C-H ورابطة C-O ورابطة O-H',
      bondsDescEn: 'Three C-H bonds, one C-O bond, and one polar O-H bond',
      polarityAr: 'قطبي ممتزج بالماء تماماً',
      polarityEn: 'Polar & fully miscible with water'
    }
  },

  // 35. FeO - Iron(II) Oxide
  {
    id: 'FeO',
    formula: 'FeO',
    elementCounts: { Fe: 1, O: 1 },
    nameAr: 'أكسيد الحديد الثنائي (الوستيت)',
    nameEn: 'Iron(II) Oxide (Wüstite)',
    iupacAr: 'أكسيد الحديد الثنائي',
    iupacEn: 'Iron(II) oxide',
    category: 'salt',
    categoryAr: 'أكسيد فلزي أسود',
    categoryEn: 'Black Transition Metal Oxide',
    molarMass: 71.844,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية شبكية (Fe²⁺ + O²⁻)',
    bondingTypeEn: 'Ionic Lattice (Fe²⁺ + O²⁻)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'مسحوق أسود غير قابل للذوبان',
    stateAtRoomTempEn: 'Black Insoluble Solid',
    colorHex: '#334155',
    descriptionAr: 'مسحوق أسود ينتج عند تسخين مركبات الحديد في غياب الأكسجين، يشكل معدن الوستيت في وشاح الأرض ومكوناً في الصخور النيزكية والوشاح البركاني.',
    descriptionEn: 'Black mineral powder forming wüstite, widespread in Earth mantle and meteorites. Formed in oxygen-depleted reducing conditions.',
    applicationsAr: ['صبغات سوداء في السيراميك والوشم ومستحضرات التجميل', 'وسيط كيميائي في صهر وتعدين الحديد', 'محفزات كيميائية صناعية'],
    applicationsEn: ['Black pigments in ceramics and cosmetics', 'Intermediate in iron smelting metallurgy', 'Industrial heterogeneous catalysts'],
    safetyAr: 'مستقر عموماً، لكن مسحوقه فائق النعومة قد يشتعل تلقائياً في الهواء.',
    safetyEn: 'Fine pyrophoric dust can spontaneously ignite in air.',
    structure3D: {
      atoms: [
        { element: 'Fe', position: [-0.65, 0, 0], color: '#EA580C', radius: 0.75 },
        { element: 'O', position: [0.65, 0, 0], color: '#EF4444', radius: 0.55 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 }
      ]
    },
    lewisInfo: {
      geometryAr: 'مكعب شبيه بملح الطعام (Rocksalt structure)',
      geometryEn: 'Rocksalt (NaCl) cubic structure',
      bondsDescAr: 'رابطة أيونية قوية بين Fe²⁺ و O²⁻',
      bondsDescEn: '1:1 ionic bonding in crystalline lattice',
      polarityAr: 'أيوني صلب غير ذواب',
      polarityEn: 'Insoluble ionic solid'
    }
  },

  // 36. H2S - Hydrogen Sulfide (Rotten Egg Gas)
  {
    id: 'H2S',
    formula: 'H₂S',
    elementCounts: { H: 2, S: 1 },
    nameAr: 'كبريتيد الهيدروجين (غاز البيض الفاسد)',
    nameEn: 'Hydrogen Sulfide (Sewer Gas)',
    iupacAr: 'سلفان',
    iupacEn: 'Sulfane',
    category: 'hydride',
    categoryAr: 'هيدريد حامضي كريه الرائحة',
    categoryEn: 'Pungent Acidic Hydride Gas',
    molarMass: 34.08,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية منحنية قليلة القطبية',
    bondingTypeEn: 'Bent Weakly Polar Covalent',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز عديم اللون برائحة بيض فاسد مقرفة',
    stateAtRoomTempEn: 'Colorless Gas with Rotten Egg Odor',
    colorHex: '#FACC15',
    descriptionAr: 'غاز كريه الرائحة ينتج عن تحلل المواد العضوية بفعل البكتيريا اللاهوائية في المجاري والمستنقعات وآبار النفط الحامض. يسبب فقدان حاسة الشم السريع!',
    descriptionEn: 'Infamous for its sickening rotten-egg odor produced by anaerobic decomposition in sewers and sour gas wells. Quickly paralyzes the olfactory nerve!',
    applicationsAr: ['المصدر الرئيسي لإنتاج الكبريت العنصري بطريقة كلاوس', 'كاشف تحليلي لترسيب كاتيونات المعادن الثقيلة', 'الأبحاث البيولوجية كجزيء ناقل عصبي غازي'],
    applicationsEn: ['Claus process elemental sulfur extraction', 'Analytical reagent for precipitating heavy metals', 'Gasotransmitter biological signaling research'],
    safetyAr: 'شديد السمية ويكافئ سيانيد الهيدروجين في فتكها؛ يشل حاسة الشم ثم يسبب الموت الفوري.',
    safetyEn: 'Extremely lethal comparable to cyanide; deadens smell then halts breathing.',
    structure3D: {
      atoms: [
        { element: 'S', position: [0, 0.25, 0], color: '#FACC15', radius: 0.65 },
        { element: 'H', position: [-0.95, -0.4, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [0.95, -0.4, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 0, to: 2, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'منحنية بزاوية 92.1 درجة (أكثر حدة من الماء)',
      geometryEn: 'Bent (92.1° - sharper angle than water)',
      bondsDescAr: 'رابطتان تساهميتان أحاديتان وزوجان من الإلكترونات الحرة على الكبريت',
      bondsDescEn: 'Two S-H single bonds and two lone pairs on Sulfur',
      polarityAr: 'ضعيف القطبية (عزم 0.97 ديباي)',
      polarityEn: 'Weakly polar (0.97 D dipole moment)'
    }
  },

  // 37. NH4+ / NH4Cl - Ammonium Chloride (Sal Ammoniac)
  {
    id: 'NH4Cl',
    formula: 'NH₄Cl',
    elementCounts: { N: 1, H: 4, Cl: 1 },
    nameAr: 'كلوريد الأمونيوم (ملح النشادر)',
    nameEn: 'Ammonium Chloride (Sal Ammoniac)',
    iupacAr: 'كلوريد الأمونيوم',
    iupacEn: 'Ammonium chloride',
    category: 'salt',
    categoryAr: 'ملح نشادري متسامٍ',
    categoryEn: 'Sublimable Ammonium Salt',
    molarMass: 53.491,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية بين كاتيون الأمونيوم NH₄⁺ وأنيون Cl⁻',
    bondingTypeEn: 'Ionic (NH₄⁺ and Cl⁻)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'مسحوق بلوري أبيض يتسامى بالحرارة',
    stateAtRoomTempEn: 'White Crystalline Sublimable Solid',
    colorHex: '#38BDF8',
    descriptionAr: 'ملح يتسامى مباشرة بالحرارة (يتحول من صلب إلى غاز الأمونيا وكلوريد الهيدروجين ثم يعود للتكاثف). يستخدم تاريخياً في صهر ولحام المعادن ومساعد لحام.',
    descriptionEn: 'Salt that sublimes on heating into NH3 and HCl vapor and recombines. Historically prized as soldering flux and in fireworks smoke screens.',
    applicationsAr: ['مساعد لحام (Flux) لتنظيف وتجهيز سطوح المعادن', 'إلكتروليت في البطاريات الجافة التقليدية (بطاريات زنك-كربون)', 'نكهة تقليدية للحلوى المالحة الاسكندنافية (Salmiakki)'],
    applicationsEn: ['Soldering flux for cleaning metal surfaces', 'Electrolyte in dry-cell zinc-carbon batteries', 'Flavoring in traditional salty licorice (Salmiakki)'],
    safetyAr: 'آمن بجرعات قليلة، مهيج خفيف للعيون والجهاز التنفسي.',
    safetyEn: 'Low toxicity; mild eye and respiratory tract irritant.',
    structure3D: {
      atoms: [
        { element: 'N', position: [-0.6, 0, 0], color: '#3B82F6', radius: 0.55 },
        { element: 'H', position: [-0.6, 0.8, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-0.6, -0.8, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.3, 0, 0.5], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.3, 0, -0.5], color: '#FFFFFF', radius: 0.35 },
        { element: 'Cl', position: [1.2, 0, 0], color: '#14B8A6', radius: 0.65 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 0, to: 2, order: 1 },
        { from: 0, to: 3, order: 1 },
        { from: 0, to: 4, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'رباعي الأوجه لكاتيون NH4⁺ وشبكة أيونية',
      geometryEn: 'Tetrahedral NH4⁺ cation in cubic lattice',
      bondsDescAr: '4 روابط تساهمية (إحداها تناسقية) في كاتيون الأمونيوم مع أيون الكلوريد',
      bondsDescEn: '4 covalent bonds (one coordinate) in NH4⁺ plus Cl⁻ ion',
      polarityAr: 'أيوني شديد الذوبان بالماء ببرودة ماصة للحرارة',
      polarityEn: 'Highly soluble with strong endothermic cooling'
    }
  },

  // 38. C3H8 - Propane
  {
    id: 'C3H8',
    formula: 'C₃H₈',
    elementCounts: { C: 3, H: 8 },
    nameAr: 'البروبان (غاز الطهي والتدفئة)',
    nameEn: 'Propane',
    iupacAr: 'بروبان',
    iupacEn: 'Propane',
    category: 'organic',
    categoryAr: 'ألكان غازي مسال',
    categoryEn: 'Liquefied Alkane Gas',
    molarMass: 44.097,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية مشبعة أحادية متسلسلة',
    bondingTypeEn: 'Saturated Single Covalent Chain',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز عديم اللون يسيل بسهولة تحت الضغط (LPG)',
    stateAtRoomTempEn: 'Colorless Gas (easily liquefied as LPG)',
    colorHex: '#64748B',
    descriptionAr: 'غاز بترولي مسال شهير (LPG) يسيل بسهولة عند ضغوط معتدلة، مما يجعله مثالياً للنقل في أسطوانات الغاز لرحلات التخييم وتدفئة المنازل والطهي.',
    descriptionEn: 'Widely used liquefied petroleum gas (LPG). Compresses to liquid at moderate pressures, ideal for portable fuel tanks and home heating.',
    applicationsAr: ['أسطوانات غاز الطهي المنزلي وشوايات الباربكيو', 'وقود مركبات الأوتوجاز النظيف الصديق للبيئة', 'غاز دافع في عبوات الرذاذ والتبريد البيئي'],
    applicationsEn: ['Barbecue grills and domestic cooking cylinders', 'Autogas alternative automotive fuel', 'Aerosol propellant and eco-friendly refrigerant'],
    safetyAr: 'شديد الاشتعال، أثقل من الهواء فيتجمع في الحفر والأقبية مسبباً الانفجار.',
    safetyEn: 'Extremely flammable; heavier than air, pools in low basements.',
    structure3D: {
      atoms: [
        { element: 'C', position: [0, 0.4, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [-1.2, -0.3, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [1.2, -0.3, 0], color: '#475569', radius: 0.55 },
        { element: 'H', position: [0, 1.4, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.2, -1.3, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [1.2, -1.3, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-1.9, 0.3, 0.6], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [1.9, 0.3, -0.6], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 0, to: 2, order: 1 },
        { from: 0, to: 3, order: 1 },
        { from: 1, to: 4, order: 1 },
        { from: 2, to: 5, order: 1 },
        { from: 1, to: 6, order: 1 },
        { from: 2, to: 7, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'سلسلة متعرجة بروابط رباعية الأوجه (109.5°)',
      geometryEn: 'Zigzag tetrahedral chain (109.5°)',
      bondsDescAr: 'روابط C-C و C-H أحادية سيجما مشبعة بالكامل',
      bondsDescEn: 'Two C-C sigma single bonds, 8 C-H bonds',
      polarityAr: 'غير قطبي',
      polarityEn: 'Nonpolar'
    }
  },

  // 39. C4H10 - Butane
  {
    id: 'C4H10',
    formula: 'C₄H₁₀',
    elementCounts: { C: 4, H: 10 },
    nameAr: 'البيوتان (غاز الولاعات)',
    nameEn: 'Butane',
    iupacAr: 'بيوتان',
    iupacEn: 'Butane',
    category: 'organic',
    categoryAr: 'ألكان هيدروكربوني غازي',
    categoryEn: 'Alkane Hydrocarbon',
    molarMass: 58.124,
    bondingType: 'covalent',
    bondingTypeAr: 'تساهمية مشبعة أحادية متسلسلة',
    bondingTypeEn: 'Saturated Single Covalent Chain',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز عديم اللون يسيل بضغطة زر بسيطة',
    stateAtRoomTempEn: 'Gas that liquefies under very light pressure',
    colorHex: '#64748B',
    descriptionAr: 'غاز وقود ولاعات السجائر ومواقد الطهي الميدانية الصغيرة. يغلي عند -0.5 درجة مئوية فقط، لذا يكفي ضغط خفيف جداً لإبقائه سائلاً شفافاً داخل الولاعة.',
    descriptionEn: 'The fuel in pocket cigarette lighters and camping canister stoves. Boils at -0.5°C, requiring only minimal pressure to remain a liquid inside clear plastic.',
    applicationsAr: ['وقود ولاعات الجيب الشفافة ومواقد الغاز المحمولة', 'مزائج غاز البترول المسال LPG للتدفئة', 'استخلاص الزيوت العطرية والمستخلصات النباتية'],
    applicationsEn: ['Pocket lighter fuel & portable camping stoves', 'LPG blend component for winter heating', 'Botanical oil extraction solvent'],
    safetyAr: 'شديد الاشتعال، واستنشاقه المتعمد يسبب الوفاة القلبية المفاجئة.',
    safetyEn: 'Highly flammable; recreational sniffing causes sudden sniffing death.',
    structure3D: {
      atoms: [
        { element: 'C', position: [-1.8, -0.2, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [-0.6, 0.4, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [0.6, -0.4, 0], color: '#475569', radius: 0.55 },
        { element: 'C', position: [1.8, 0.2, 0], color: '#475569', radius: 0.55 },
        { element: 'H', position: [-2.4, 0.5, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [2.4, -0.5, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [-0.6, 1.4, 0], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [0.6, -1.4, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 },
        { from: 2, to: 3, order: 1 },
        { from: 0, to: 4, order: 1 },
        { from: 3, to: 5, order: 1 },
        { from: 1, to: 6, order: 1 },
        { from: 2, to: 7, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'سلسلة متعرجة رباعية الأوجه من 4 ذرات كربون',
      geometryEn: 'Zigzag 4-carbon tetrahedral chain',
      bondsDescAr: '3 روابط C-C أحادية و 10 روابط C-H',
      bondsDescEn: '3 C-C single bonds, 10 C-H single bonds',
      polarityAr: 'غير قطبي',
      polarityEn: 'Nonpolar'
    }
  },

  // 40. H3PO4 - Phosphoric Acid
  {
    id: 'H3PO4',
    formula: 'H₃PO₄',
    elementCounts: { H: 3, P: 1, O: 4 },
    nameAr: 'حمض الفوسفوريك (حمض الكولا)',
    nameEn: 'Phosphoric Acid',
    iupacAr: 'حمض الفوسفوريك',
    iupacEn: 'Phosphoric acid',
    category: 'acid',
    categoryAr: 'حمض ثلاثي البروتون مضاف غذائي',
    categoryEn: 'Triprotic Oxyacid',
    molarMass: 97.994,
    bondingType: 'polar_covalent',
    bondingTypeAr: 'تساهمية قطبية ثلاثية التفكك',
    bondingTypeEn: 'Triprotic Polar Covalent',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'سائل لزج كثيف أو بلورات بيضاء',
    stateAtRoomTempEn: 'Dense Viscous Liquid / White Solid',
    colorHex: '#F97316',
    descriptionAr: 'حمض ثلاثي البروتون يعطي مشروبات الكولا الغازية نكهتها اللاذعة الحادة ويمنع فسادها. يستخدم صناعياً أيضاً لإزالة الصدأ وتحويله إلى فوسفات حديد سوداء واقية.',
    descriptionEn: 'Triprotic mineral acid providing cola soft drinks their tangy acidity. Industrially converts rust on iron into protective black iron phosphate.',
    applicationsAr: ['إضفاء النكهة اللاذعة في مشروبات الكولا الغازية (E338)', 'إنتاج أسمدة الفوسفات الفائقة للزراعة', 'محاليل إزالة الصدأ وتخريش مينا الأسنان عند طبيب الأسنان'],
    applicationsEn: ['Tangy flavoring agent in cola beverages (E338)', 'Agricultural phosphate fertilizers manufacture', 'Rust conversion primer and dental enamel etching'],
    safetyAr: 'كاوٍ للأنسجة بتركيزاته العالية، والاستهلاك المفرط للكولا يضعف العظام والأسنان.',
    safetyEn: 'Corrosive in concentrated form; heavy cola intake leaches bone calcium.',
    structure3D: {
      atoms: [
        { element: 'P', position: [0, 0, 0], color: '#F97316', radius: 0.65 },
        { element: 'O', position: [0, 1.2, 0], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [-1.1, -0.4, 0.4], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [1.1, -0.4, 0.4], color: '#EF4444', radius: 0.5 },
        { element: 'O', position: [0, -0.4, -1.1], color: '#EF4444', radius: 0.5 },
        { element: 'H', position: [-1.7, -0.8, 0.6], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [1.7, -0.8, 0.6], color: '#FFFFFF', radius: 0.35 },
        { element: 'H', position: [0, -0.8, -1.7], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 2 },
        { from: 0, to: 2, order: 1 },
        { from: 0, to: 3, order: 1 },
        { from: 0, to: 4, order: 1 },
        { from: 2, to: 5, order: 1 },
        { from: 3, to: 6, order: 1 },
        { from: 4, to: 7, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'رباعي الأوجه حول الفوسفور',
      geometryEn: 'Tetrahedral around P',
      bondsDescAr: 'رابطة ثنائية P=O وثلاث روابط أحادية P-OH',
      bondsDescEn: 'One P=O double bond, three P-OH single bonds',
      polarityAr: 'قطبي عالي الروابط الهيدروجينية',
      polarityEn: 'Strongly polar with extensive H-bonding'
    }
  },

  // 41. HF - Hydrofluoric Acid
  {
    id: 'HF',
    formula: 'HF',
    elementCounts: { H: 1, F: 1 },
    nameAr: 'حمض الهيدروفلوريك (حافر الزجاج)',
    nameEn: 'Hydrofluoric Acid',
    iupacAr: 'فلوران',
    iupacEn: 'Fluorane',
    category: 'acid',
    categoryAr: 'حمض خطير حافر للزجاج',
    categoryEn: 'Glass-Etching Contact Poison',
    molarMass: 20.006,
    bondingType: 'polar_covalent',
    bondingTypeAr: 'تساهمية قطبية فائقة القطبية (أعلى فرق كهروسالبية 1.78)',
    bondingTypeEn: 'Extremely Polar Covalent (electronegativity diff 1.78)',
    stateAtRoomTemp: 'gas',
    stateAtRoomTempAr: 'غاز أو محلول سائل مدخن كاوٍ',
    stateAtRoomTempEn: 'Fuming Highly Toxic Corrosive Gas/Liquid',
    colorHex: '#22C55E',
    descriptionAr: 'حمض فريد يذيب الزجاج والسيليكا بسهولة، لذا لا يمكن حفظه في زجاجات بل في أوعية بلاستيكية تفلون خاصة. سم ملامس خطير جداً يخترق الجلد ويسحب الكالسيوم من العظام.',
    descriptionEn: 'Unique acid that attacks glass and silica, requiring storage in specialized Teflon bottles. Extremely dangerous contact poison that leaches bone calcium.',
    applicationsAr: ['حفر ونقش الزجاج الفني والمخبري', 'تنظيف ومعالجة رقائق السيليكون في صناعة أشباه الموصلات', 'إنتاج مركبات الفلوروكربون وبوليمر التفلون المقاوم للالتصاق'],
    applicationsEn: ['Artistic & lab glass etching', 'Semiconductor silicon wafer surface cleaning', 'Fluorochemicals & Teflon non-stick polymers manufacture'],
    safetyAr: 'خطر مميت! يخترق الجلد دون ألم فوري ويسحب الكالسيوم ويسبب توقف القلب الحتمي دون علاج بمراهم الجلوكونات.',
    safetyEn: 'Lethal contact poison; penetrates skin painlessly and causes cardiac arrest.',
    structure3D: {
      atoms: [
        { element: 'F', position: [0.45, 0, 0], color: '#22C55E', radius: 0.5 },
        { element: 'H', position: [-0.65, 0, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'خطي ثنائي الذرة (Linear)',
      geometryEn: 'Linear Diatomic',
      bondsDescAr: 'رابطة تساهمية أحادية ذات استقطاب كهروستاتيكي هائل',
      bondsDescEn: '1 intensely polar single covalent bond',
      polarityAr: 'فائق القطبية مع روابط هيدروجينية سلسلة قوية جداً',
      polarityEn: 'Extremely polar with strong chain H-bonding'
    }
  },

  // 42. KOH - Potassium Hydroxide (Caustic Potash)
  {
    id: 'KOH',
    formula: 'KOH',
    elementCounts: { K: 1, O: 1, H: 1 },
    nameAr: 'هيدروكسيد البوتاسيوم (البوتاس الكاوي)',
    nameEn: 'Potassium Hydroxide (Caustic Potash)',
    iupacAr: 'هيدروكسيد البوتاسيوم',
    iupacEn: 'Potassium hydroxide',
    category: 'base',
    categoryAr: 'قاعدة قلوية قوية فائقة',
    categoryEn: 'Strong Alkali Base',
    molarMass: 56.106,
    bondingType: 'ionic',
    bondingTypeAr: 'أيونية كاملة (K⁺ + ⁻OH)',
    bondingTypeEn: 'Ionic (K⁺ + OH⁻)',
    stateAtRoomTemp: 'solid',
    stateAtRoomTempAr: 'حبيبات بيضاء متميعة تسحب الرطوبة فوراً',
    stateAtRoomTempEn: 'White Deliquescent Flakes',
    colorHex: '#8B5CF6',
    descriptionAr: 'قاعدة قلوية كاوية فائقة النشاط. تستخدم في صناعة الصابون السائل الناعم، وإلكتروليت رئيسي في البطاريات القلوية وبطاريات النيكل-كادميوم.',
    descriptionEn: 'Profoundly strong caustic base. Used to produce soft liquid soaps and serves as the conductive alkaline electrolyte in standard AA batteries.',
    applicationsAr: ['إلكتروليت موصل في البطاريات القلوية التجارية (Alkaline Batteries)', 'صناعة الصابون السائل الناعم والشامبو', 'إنتاج وقود الديزل الحيوي ومعالجة التربة'],
    applicationsEn: ['Conductive electrolyte in standard alkaline batteries', 'Soft liquid soap and surfactant manufacture', 'Biodiesel transesterification catalyst'],
    safetyAr: 'شديد الكي والتآكل للأنسجة، يسبب حروقاً كيميائية عميقة أشد من الأحماض.',
    safetyEn: 'Extremely caustic; produces severe liquefactive necrosis in tissues.',
    structure3D: {
      atoms: [
        { element: 'K', position: [-1.0, 0, 0], color: '#8B5CF6', radius: 0.85 },
        { element: 'O', position: [0.6, 0, 0], color: '#EF4444', radius: 0.55 },
        { element: 'H', position: [1.35, 0, 0], color: '#FFFFFF', radius: 0.35 }
      ],
      bonds: [
        { from: 0, to: 1, order: 1 },
        { from: 1, to: 2, order: 1 }
      ]
    },
    lewisInfo: {
      geometryAr: 'شبكة بلورية أيونية',
      geometryEn: 'Ionic crystal lattice',
      bondsDescAr: 'رابطة أيونية بين K⁺ وأيون الهيدروكسيل OH⁻',
      bondsDescEn: 'Ionic pairing between K⁺ and covalent OH⁻',
      polarityAr: 'أيوني شديد القلوية والتأين 100%',
      polarityEn: 'Fully dissociated 100% alkaline ionic'
    }
  }
];

export interface CompositionAnalysisResult {
  status: 'stable_known' | 'theoretical_stable' | 'radical' | 'polyatomic_ion' | 'unstable_valency' | 'empty';
  statusAr: string;
  statusEn: string;
  statusColor: 'emerald' | 'amber' | 'rose' | 'slate';
  compound?: CompoundInfo;
  empiricalFormula: string;
  hillFormula: string;
  totalMass: number;
  totalAtoms: number;
  totalValenceElectrons: number;
  octetsFulfilled: boolean;
  unpairedElectrons: number;
  explanationAr: string;
  explanationEn: string;
  possibleBonds: number;
}

// Helper to normalize element counts into canonical chemical formulas
export function formatChemicalFormula(counts: Record<string, number>): string {
  const elements = Object.keys(counts).filter(el => (counts[el] || 0) > 0);
  if (elements.length === 0) return '';

  // Hill system: C first, then H, then alphabetical
  const hasC = elements.includes('C');
  const hasH = elements.includes('H');

  let sorted: string[] = [];
  if (hasC) {
    sorted.push('C');
    if (hasH) sorted.push('H');
    const remaining = elements.filter(e => e !== 'C' && e !== 'H').sort();
    sorted = sorted.concat(remaining);
  } else {
    // For inorganics, sort by electronegativity (positive electropositive first)
    sorted = elements.sort((a, b) => {
      const ea = BUILDER_ELEMENTS_MAP.get(a)?.electronegativity ?? 2.0;
      const eb = BUILDER_ELEMENTS_MAP.get(b)?.electronegativity ?? 2.0;
      return ea - eb;
    });
  }

  const subMap: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };

  const toSubscript = (num: number) => {
    if (num <= 1) return '';
    return String(num).split('').map(d => subMap[d] || d).join('');
  };

  return sorted.map(el => `${el}${toSubscript(counts[el])}`).join('');
}

// Compare two element count objects
export function matchesElementCounts(a: Record<string, number>, b: Record<string, number>): boolean {
  const keysA = Object.keys(a).filter(k => (a[k] || 0) > 0);
  const keysB = Object.keys(b).filter(k => (b[k] || 0) > 0);

  if (keysA.length !== keysB.length) return false;

  for (const k of keysA) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

// Dynamic valence, octet, and stability evaluator
export function evaluateMoleculeComposition(counts: Record<string, number>): CompositionAnalysisResult {
  const activeEntries = Object.entries(counts).filter(([_, count]) => count > 0);
  const totalAtoms = activeEntries.reduce((sum, [_, count]) => sum + count, 0);

  if (totalAtoms === 0) {
    return {
      status: 'empty',
      statusAr: 'المنصة فارغة',
      statusEn: 'Platform Empty',
      statusColor: 'slate',
      empiricalFormula: '',
      hillFormula: '',
      totalMass: 0,
      totalAtoms: 0,
      totalValenceElectrons: 0,
      octetsFulfilled: false,
      unpairedElectrons: 0,
      explanationAr: 'اسحب العناصر من الشريط السفلي أو انقر عليها لإضافتها إلى منصة التفاعل وتوليف المركب.',
      explanationEn: 'Drag or click elements from the palette below to place them onto the reaction canvas and form molecules.',
      possibleBonds: 0
    };
  }

  // Calculate mass & total valence electrons
  let totalMass = 0;
  let totalValenceElectrons = 0;
  let totalValenceCapacity = 0; // Total bonding capacity sum (e.g. H needs 1, C needs 4, O needs 2)
  let maxSingleAtomCapacity = 0;

  for (const [sym, count] of activeEntries) {
    const el = BUILDER_ELEMENTS_MAP.get(sym);
    if (el) {
      totalMass += el.atomicNumber * 2 * count; // approx or standard
      totalValenceElectrons += el.valenceElectrons * count;
      totalValenceCapacity += el.primaryValence * count;
      if (el.primaryValence > maxSingleAtomCapacity) {
        maxSingleAtomCapacity = el.primaryValence;
      }
    }
  }

  const formula = formatChemicalFormula(counts);

  // 1. Check exact match in knowledge database
  const known = COMPOUNDS_DATABASE.find(c => matchesElementCounts(c.elementCounts, counts));

  if (known) {
    return {
      status: 'stable_known',
      statusAr: 'مركب كيميائي مستقر ومثبت علمياً',
      statusEn: 'Stable, Verified Chemical Compound',
      statusColor: 'emerald',
      compound: known,
      empiricalFormula: known.formula,
      hillFormula: formula,
      totalMass: known.molarMass,
      totalAtoms,
      totalValenceElectrons,
      octetsFulfilled: true,
      unpairedElectrons: 0,
      explanationAr: `تم التعرف على هذا المركب بنجاح: (${known.nameAr} - ${known.nameEn}). يتمتع بتكافؤات كيميائية مكتملة تلبي قاعدة الثمانيات/الثنائيات وهو متواجد بكثرة في الطبيعة.`,
      explanationEn: `Successfully recognized as (${known.nameEn} - ${known.nameAr}). It satisfies chemical octet/duet valence rules and is abundantly stable.`,
      possibleBonds: known.structure3D.bonds.length
    };
  }

  // 2. Total electrons is odd? -> Free Radical
  const isOddElectrons = totalValenceElectrons % 2 !== 0;

  if (isOddElectrons) {
    return {
      status: 'radical',
      statusAr: 'شق جذري حر (شديد النشاط الكيميائي)',
      statusEn: 'Free Radical (Highly Reactive)',
      statusColor: 'amber',
      empiricalFormula: formula,
      hillFormula: formula,
      totalMass: Math.round(totalMass * 100) / 100,
      totalAtoms,
      totalValenceElectrons,
      octetsFulfilled: false,
      unpairedElectrons: 1,
      explanationAr: `يحتوي هذا التشكيل على عدد فردي من إلكترونات التكافؤ (${totalValenceElectrons} إلكترون)، مما يعني وجود إلكترون مفرد غير مزدوج (Free Radical). الجذور الحرة غير مستقرة وتتفاعل بشراسة في أجزاء من المليون من الثانية.`,
      explanationEn: `This configuration has an odd number of valence electrons (${totalValenceElectrons}), leaving an unpaired electron (Free Radical). Radicals are extremely reactive and short-lived.`,
      possibleBonds: Math.floor(totalValenceCapacity / 2)
    };
  }

  // 3. Check valence capacity balance:
  // For a molecule to be fully connected without unsatisfied valence or impossible hypervalence:
  // E.g., H3 is unstable, CH5 is impossible (hypervalent carbon).
  // A single atom cannot hold more bonds than its primary capacity.
  // In a connected graph of n atoms, min edges is n - 1, each bond consumes 2 capacity.
  const otherCapacitySum = totalValenceCapacity - maxSingleAtomCapacity;
  const isHypervalentUnfeasible = maxSingleAtomCapacity > otherCapacitySum && totalAtoms > 1;

  if (isHypervalentUnfeasible) {
    return {
      status: 'unstable_valency',
      statusAr: 'تشكيل غير مستقر / تكافؤ غير مكتمل',
      statusEn: 'Unstable / Unsatisfied Valence',
      statusColor: 'rose',
      empiricalFormula: formula,
      hillFormula: formula,
      totalMass: Math.round(totalMass * 100) / 100,
      totalAtoms,
      totalValenceElectrons,
      octetsFulfilled: false,
      unpairedElectrons: 2,
      explanationAr: `روابط التكافؤ بين هذه الذرات غير متوازنة؛ توجد ذرات تمتلك إلكترونات تكافؤ شاغرة لم تجد ذرات مقابلة للارتباط معها لتكوين أزواج مستقرة. أضف ذرات هيدروجين أو فلزات لتشبيع التكافؤ.`,
      explanationEn: `Valence bonding between these atoms is unbalanced. Atoms have unfilled valence sites that require matching bonds to achieve octet satisfaction. Add H or ligands to satisfy open valencies.`,
      possibleBonds: Math.floor(totalValenceCapacity / 2)
    };
  }

  // 4. Even valence electrons, reasonable capacity balance -> theoretical isomer or reactive intermediate
  return {
    status: 'theoretical_stable',
    statusAr: 'مركب افتراضي متوازن التكافؤ',
    statusEn: 'Theoretical Neutral Molecule',
    statusColor: 'emerald',
    empiricalFormula: formula,
    hillFormula: formula,
    totalMass: Math.round(totalMass * 100) / 100,
    totalAtoms,
    totalValenceElectrons,
    octetsFulfilled: true,
    unpairedElectrons: 0,
    explanationAr: `يمتلك هذا التشكيل تكافؤاً كيميائياً زوجياً متوازناً (${totalValenceElectrons} إلكترون تكافؤ). قد يمثل متصاوغاً كيميائياً (Isomer) أو جزيئاً تخليقياً نادراً في الكيمياء العضوية أو غير العضوية.`,
    explanationEn: `This configuration possesses balanced even valence electrons (${totalValenceElectrons}). It represents a possible theoretical isomer or novel synthetic intermediate in chemistry.`,
    possibleBonds: Math.floor(totalValenceCapacity / 2)
  };
}
