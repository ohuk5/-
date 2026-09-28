export interface ElementInfo {
  atomicNumber: number;
  symbol: string;
  name: string;
  englishName: string;
  atomicMass: number;
  group: number;
  period: number;
  category: 
    | 'nonmetal'
    | 'noble-gas'
    | 'alkali-metal'
    | 'alkaline-earth'
    | 'metalloid'
    | 'halogen'
    | 'transition-metal'
    | 'post-transition'
    | 'lanthanide'
    | 'actinide'
    | 'superheavy';
  categoryAr: string;
  electronShells: number[]; // K, L, M, N, O, P, Q
  electronConfig: string;
  stableNeutrons: number[]; // typical stable/longest-lived neutron counts
  isRadioactive: boolean;
  desc: string;
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  'nonmetal': { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/50', badge: 'لا فلز' },
  'noble-gas': { bg: 'bg-indigo-950/40', text: 'text-indigo-400', border: 'border-indigo-800/50', badge: 'غاز نبيل (خامل)' },
  'alkali-metal': { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-800/50', badge: 'فلز قلوي' },
  'alkaline-earth': { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/50', badge: 'فلز قلوي ترابي' },
  'metalloid': { bg: 'bg-teal-950/40', text: 'text-teal-300', border: 'border-teal-800/50', badge: 'شبه فلز' },
  'halogen': { bg: 'bg-cyan-950/40', text: 'text-cyan-400', border: 'border-cyan-800/50', badge: 'هالوجين' },
  'transition-metal': { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-800/50', badge: 'فلز انتقالي' },
  'post-transition': { bg: 'bg-slate-900/60', text: 'text-slate-300', border: 'border-slate-700/50', badge: 'فلز بعد انتقالي' },
  'lanthanide': { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-800/50', badge: 'لانثانيد' },
  'actinide': { bg: 'bg-fuchsia-950/40', text: 'text-fuchsia-400', border: 'border-fuchsia-800/50', badge: 'أكتينيد' },
  'superheavy': { bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-800/50', badge: 'عنصر فائق الثقل' },
};

// Full 118 chemical elements database
export const ALL_ELEMENTS: ElementInfo[] = [
  {
    atomicNumber: 1, symbol: "H", name: "هيدروجين", englishName: "Hydrogen", atomicMass: 1.008,
    group: 1, period: 1, category: "nonmetal", categoryAr: "لا فلز",
    electronShells: [1], electronConfig: "1s¹", stableNeutrons: [0, 1], isRadioactive: false,
    desc: "أخف وأكثر العناصر وفرة في الكون (75% من المادة الباريونية)، وهو وقود النجوم والاندماج النووي، وأساس تكوين الماء."
  },
  {
    atomicNumber: 2, symbol: "He", name: "هيليوم", englishName: "Helium", atomicMass: 4.0026,
    group: 18, period: 1, category: "noble-gas", categoryAr: "غاز نبيل",
    electronShells: [2], electronConfig: "1s²", stableNeutrons: [1, 2], isRadioactive: false,
    desc: "غاز خامل غير قابل للاشتعال، ثاني أكثر العناصر وفرة في الكون، يستخدم في التبريد الفائق للمغناطيسات والمناطيد."
  },
  {
    atomicNumber: 3, symbol: "Li", name: "ليثيوم", englishName: "Lithium", atomicMass: 6.94,
    group: 1, period: 2, category: "alkali-metal", categoryAr: "فلز قلوي",
    electronShells: [2, 1], electronConfig: "[He] 2s¹", stableNeutrons: [3, 4], isRadioactive: false,
    desc: "أخف الفلزات كثافة، نشط كيميائياً، وهو حجر الزاوية في صناعة بطاريات الليثيوم أيون للهواتف والسيارات الكهربائية."
  },
  {
    atomicNumber: 4, symbol: "Be", name: "بيريليوم", englishName: "Beryllium", atomicMass: 9.0122,
    group: 2, period: 2, category: "alkaline-earth", categoryAr: "فلز قلوي ترابي",
    electronShells: [2, 2], electronConfig: "[He] 2s²", stableNeutrons: [5], isRadioactive: false,
    desc: "فلز خفيف وقوي ذو درجة انصهار عالية، يستخدم في تلسكوب جيمس ويب الفضائي والمفاعلات النووية وتطبيقات الفضاء."
  },
  {
    atomicNumber: 5, symbol: "B", name: "بورون", englishName: "Boron", atomicMass: 10.81,
    group: 13, period: 2, category: "metalloid", categoryAr: "شبه فلز",
    electronShells: [2, 3], electronConfig: "[He] 2s² 2p¹", stableNeutrons: [5, 6], isRadioactive: false,
    desc: "شبه فلز صلب، يستخدم في تصنيع زجاج البايركس المقاوم للصدمات الحرارية وفي قضبان التحكم في المفاعلات النووية."
  },
  {
    atomicNumber: 6, symbol: "C", name: "كربون", englishName: "Carbon", atomicMass: 12.011,
    group: 14, period: 2, category: "nonmetal", categoryAr: "لا فلز",
    electronShells: [2, 4], electronConfig: "[He] 2s² 2p²", stableNeutrons: [6, 7], isRadioactive: false,
    desc: "أساس الكيمياء العضوية وكل أشكال الحياة على الأرض. يوجد بأشكال تآصلية متعددة كالغرافيت الموصل للكهرباء والماس الفائق الصلابة."
  },
  {
    atomicNumber: 7, symbol: "N", name: "نيتروجين", englishName: "Nitrogen", atomicMass: 14.007,
    group: 15, period: 2, category: "nonmetal", categoryAr: "لا فلز",
    electronShells: [2, 5], electronConfig: "[He] 2s² 2p³", stableNeutrons: [7, 8], isRadioactive: false,
    desc: "يشكل 78% من الغلاف الجوي للأرض، عنصر حيوي لبناء البروتينات والأحماض النووية (DNA)، ويستخدم النيتروجين السائل في التجميد السريع."
  },
  {
    atomicNumber: 8, symbol: "O", name: "أكسجين", englishName: "Oxygen", atomicMass: 15.999,
    group: 16, period: 2, category: "nonmetal", categoryAr: "لا فلز",
    electronShells: [2, 6], electronConfig: "[He] 2s² 2p⁴", stableNeutrons: [8, 9, 10], isRadioactive: false,
    desc: "ضروري لتنفس الكائنات الحية والاحتراق، يشكل 21% من الهواء ومعظم كتلة الماء وقشرة الأرض الصخرية."
  },
  {
    atomicNumber: 9, symbol: "F", name: "فلور", englishName: "Fluorine", atomicMass: 18.998,
    group: 17, period: 2, category: "halogen", categoryAr: "هالوجين",
    electronShells: [2, 7], electronConfig: "[He] 2s² 2p⁵", stableNeutrons: [10], isRadioactive: false,
    desc: "أعلى العناصر كهروسالبية وأكثرها نشاطاً كيميائياً، يدخل في معاجين الأسنان وتفلون الأواني وغازات التبريد."
  },
  {
    atomicNumber: 10, symbol: "Ne", name: "نيون", englishName: "Neon", atomicMass: 20.180,
    group: 18, period: 2, category: "noble-gas", categoryAr: "غاز نبيل",
    electronShells: [2, 8], electronConfig: "[He] 2s² 2p⁶", stableNeutrons: [10, 11, 12], isRadioactive: false,
    desc: "غاز خامل يطلق وهجاً برتقالياً محمراً ساطعاً عند مرور تيار كهربائي، وهو رمز الإعلانات الضوئية والليزر."
  },
  {
    atomicNumber: 11, symbol: "Na", name: "صوديوم", englishName: "Sodium", atomicMass: 22.990,
    group: 1, period: 3, category: "alkali-metal", categoryAr: "فلز قلوي",
    electronShells: [2, 8, 1], electronConfig: "[Ne] 3s¹", stableNeutrons: [12], isRadioactive: false,
    desc: "فلز فضي لين يتفاعل بشدة مع الماء، وهو مكون ملح الطعام (NaCl) وأيون حاسم لنقل الإشارات العصبية في الجسم."
  },
  {
    atomicNumber: 12, symbol: "Mg", name: "ماغنيسيوم", englishName: "Magnesium", atomicMass: 24.305,
    group: 2, period: 3, category: "alkaline-earth", categoryAr: "فلز قلوي ترابي",
    electronShells: [2, 8, 2], electronConfig: "[Ne] 3s²", stableNeutrons: [12, 13, 14], isRadioactive: false,
    desc: "فلز خفيف يدخل في صناعة سبائك الطائرات، ويشكل الذرة المركزية في جزيء الكلوروفيل المسؤول عن التمثيل الضوئي بالنبات."
  },
  {
    atomicNumber: 13, symbol: "Al", name: "ألومنيوم", englishName: "Aluminium", atomicMass: 26.982,
    group: 13, period: 3, category: "post-transition", categoryAr: "فلز بعد انتقالي",
    electronShells: [2, 8, 3], electronConfig: "[Ne] 3s² 3p¹", stableNeutrons: [14], isRadioactive: false,
    desc: "أكثر الفلزات وفرة في قشرة الأرض، خفيف ومقاوم للتآكل وموصل ممتاز، يدخل في صناعة الطائرات ومواد البناء والعلب."
  },
  {
    atomicNumber: 14, symbol: "Si", name: "سيليكون", englishName: "Silicon", atomicMass: 28.085,
    group: 14, period: 3, category: "metalloid", categoryAr: "شبه فلز",
    electronShells: [2, 8, 4], electronConfig: "[Ne] 3s² 3p²", stableNeutrons: [14, 15, 16], isRadioactive: false,
    desc: "شبه موصل شكل أساس الثورة الرقمية والمعالجات الدقيقة والشرائح الإلكترونية والألواح الشمسية."
  },
  {
    atomicNumber: 15, symbol: "P", name: "فسفور", englishName: "Phosphorus", atomicMass: 30.974,
    group: 15, period: 3, category: "nonmetal", categoryAr: "لا فلز",
    electronShells: [2, 8, 5], electronConfig: "[Ne] 3s² 3p³", stableNeutrons: [16], isRadioactive: false,
    desc: "عنصر لا غنى عنه في بناء العظام والأسنان وحمض الـ DNA وجزيء نقل الطاقة الأدينوسين ثلاثي الفوسفات (ATP)."
  },
  {
    atomicNumber: 16, symbol: "S", name: "كبريت", englishName: "Sulfur", atomicMass: 32.06,
    group: 16, period: 3, category: "nonmetal", categoryAr: "لا فلز",
    electronShells: [2, 8, 6], electronConfig: "[Ne] 3s² 3p⁴", stableNeutrons: [16, 17, 18, 20], isRadioactive: false,
    desc: "مادة صلبة صفراء هشة، أساس تصنيع حمض الكبريتيك (أهم مادة كيميائية صناعية عالمياً) وفي صناعة الأسمدة والبارود والمطاط."
  },
  {
    atomicNumber: 17, symbol: "Cl", name: "كلور", englishName: "Chlorine", atomicMass: 35.45,
    group: 17, period: 3, category: "halogen", categoryAr: "هالوجين",
    electronShells: [2, 8, 7], electronConfig: "[Ne] 3s² 3p⁵", stableNeutrons: [18, 20], isRadioactive: false,
    desc: "غاز أصفر مخضر خانق ومطهر فائق الفعالية لتعقيم مياه الشرب والمسابح وتصنيع المواد البلاستيكية (PVC)."
  },
  {
    atomicNumber: 18, symbol: "Ar", name: "أرغون", englishName: "Argon", atomicMass: 39.948,
    group: 18, period: 3, category: "noble-gas", categoryAr: "غاز نبيل",
    electronShells: [2, 8, 8], electronConfig: "[Ne] 3s² 3p⁶", stableNeutrons: [18, 20, 22], isRadioactive: false,
    desc: "غاز خامل يمثل 0.93% من الغلاف الجوي، يستخدم كغاز واقٍ في لحام المعادن وصناعة المصابيح والنوافذ المزدوجة العازلة."
  },
  {
    atomicNumber: 19, symbol: "K", name: "بوتاسيوم", englishName: "Potassium", atomicMass: 39.098,
    group: 1, period: 4, category: "alkali-metal", categoryAr: "فلز قلوي",
    electronShells: [2, 8, 8, 1], electronConfig: "[Ar] 4s¹", stableNeutrons: [20, 22], isRadioactive: false,
    desc: "فلز قلوي نشط جداً، وهو أيون حيوي للغاية لتنظيم دقات القلب والسيالات العصبية في الكائنات الحية وسماد زراعي رئيسي."
  },
  {
    atomicNumber: 20, symbol: "Ca", name: "كالسيوم", englishName: "Calcium", atomicMass: 40.078,
    group: 2, period: 4, category: "alkaline-earth", categoryAr: "فلز قلوي ترابي",
    electronShells: [2, 8, 8, 2], electronConfig: "[Ar] 4s²", stableNeutrons: [20, 22, 24], isRadioactive: false,
    desc: "المعدن الأكثر وفرة في جسم الإنسان، يبني العظام والأسنان ويسهم في انقباض العضلات وتجلط الدم وصناعة الأسمنت."
  },
  {
    atomicNumber: 21, symbol: "Sc", name: "سكانديوم", englishName: "Scandium", atomicMass: 44.956,
    group: 3, period: 4, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 9, 2], electronConfig: "[Ar] 3d¹ 4s²", stableNeutrons: [24], isRadioactive: false,
    desc: "فلز فضي خفيف يضاف إلى الألومنيوم لإنتاج سبائك قوية وخفيفة تستخدم في هياكل الطائرات المقاتلة ومضارب البيسبول."
  },
  {
    atomicNumber: 22, symbol: "Ti", name: "تيتانيوم", englishName: "Titanium", atomicMass: 47.867,
    group: 4, period: 4, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 10, 2], electronConfig: "[Ar] 3d² 4s²", stableNeutrons: [24, 25, 26, 27, 28], isRadioactive: false,
    desc: "فلز فائق القوة ومقاوم للتآكل وخفيف الوزن ومتوافق حيوياً، يستخدم في زراعة المفاصل والأسنان ومحركات الطائرات النفاثة."
  },
  {
    atomicNumber: 23, symbol: "V", name: "فاناديوم", englishName: "Vanadium", atomicMass: 50.942,
    group: 5, period: 4, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 11, 2], electronConfig: "[Ar] 3d³ 4s²", stableNeutrons: [28], isRadioactive: false,
    desc: "فلز صلب يضاف للصلب لزيادة مقاومته للكسر والحرارة، ويستخدم في تصنيع بطاريات الفاناديوم لتدفق الطاقة المتجددة."
  },
  {
    atomicNumber: 24, symbol: "Cr", name: "كروم", englishName: "Chromium", atomicMass: 51.996,
    group: 6, period: 4, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 13, 1], electronConfig: "[Ar] 3d⁵ 4s¹", stableNeutrons: [26, 28, 29, 30], isRadioactive: false,
    desc: "فلز لامع مقاوم للصدأ، يعطي الفولاذ المقاوم للصدأ (الستانلس ستيل) بريقه ومتانته ويستخدم في طلاء السيارات الفاخر."
  },
  {
    atomicNumber: 25, symbol: "Mn", name: "منغنيز", englishName: "Manganese", atomicMass: 54.938,
    group: 7, period: 4, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 13, 2], electronConfig: "[Ar] 3d⁵ 4s²", stableNeutrons: [30], isRadioactive: false,
    desc: "عنصر حاسم لإنتاج الصلب عالي القوة، يدخل في بطاريات السيارات الكهربائية وتثبيت الكلوروفيل في النباتات."
  },
  {
    atomicNumber: 26, symbol: "Fe", name: "حديد", englishName: "Iron", atomicMass: 55.845,
    group: 8, period: 4, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 14, 2], electronConfig: "[Ar] 3d⁶ 4s²", stableNeutrons: [28, 30, 31, 32], isRadioactive: false,
    desc: "أهم فلز في الحضارة الإنسانية وعمود الصناعة والبناء، والذرة المركزية في الهيموغلوبين المسؤول عن نقل الأكسجين في الدم."
  },
  {
    atomicNumber: 27, symbol: "Co", name: "كوبالت", englishName: "Cobalt", atomicMass: 58.933,
    group: 9, period: 4, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 15, 2], electronConfig: "[Ar] 3d⁷ 4s²", stableNeutrons: [32], isRadioactive: false,
    desc: "فلز مغناطيسي صلب ذو لون أزرق مميز في مركباته، مكون أساسي لبطاريات السيارات الكهربائية وفيتامين B12 والنظير كوبالت-60 للعلاج الإشعاعي."
  },
  {
    atomicNumber: 28, symbol: "Ni", name: "نيكل", englishName: "Nickel", atomicMass: 58.693,
    group: 10, period: 4, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 16, 2], electronConfig: "[Ar] 3d⁸ 4s²", stableNeutrons: [30, 32, 33, 34, 36], isRadioactive: false,
    desc: "فلز فضي لامع مقاوم للتآكل، يدخل في صناعة العملات المعدنية والسبائك الفائقة لمحركات التوربينات وبطاريات السيارات."
  },
  {
    atomicNumber: 29, symbol: "Cu", name: "نحاس", englishName: "Copper", atomicMass: 63.546,
    group: 11, period: 4, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 1], electronConfig: "[Ar] 3d¹⁰ 4s¹", stableNeutrons: [34, 36], isRadioactive: false,
    desc: "أول فلز شكّله الإنسان، موصل ممتاز للكهرباء والحرارة، عصب شبكات الكهرباء ومحركات الطاقة وتمديدات المياه."
  },
  {
    atomicNumber: 30, symbol: "Zn", name: "زنك", englishName: "Zinc", atomicMass: 65.38,
    group: 12, period: 4, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 2], electronConfig: "[Ar] 3d¹⁰ 4s²", stableNeutrons: [34, 36, 37, 38, 40], isRadioactive: false,
    desc: "يستخدم في جلفنة الحديد لحمايته من الصدأ، ويدخل في سبائك النحاس الأصفر (البرونز) ومقويات المناعة لدى البشر."
  },
  {
    atomicNumber: 31, symbol: "Ga", name: "غاليوم", englishName: "Gallium", atomicMass: 69.723,
    group: 13, period: 4, category: "post-transition", categoryAr: "فلز بعد انتقالي",
    electronShells: [2, 8, 18, 3], electronConfig: "[Ar] 3d¹⁰ 4s² 4p¹", stableNeutrons: [38, 40], isRadioactive: false,
    desc: "فلز فريد ينصهر بحرارة راحة اليد (29.7°C)، يدخل في تصنيع أشباه الموصلات المتقدمة (زرنيخيد الغاليوم) وشاشات LED."
  },
  {
    atomicNumber: 32, symbol: "Ge", name: "جرمانيوم", englishName: "Germanium", atomicMass: 72.630,
    group: 14, period: 4, category: "metalloid", categoryAr: "شبه فلز",
    electronShells: [2, 8, 18, 4], electronConfig: "[Ar] 3d¹⁰ 4s² 4p²", stableNeutrons: [38, 40, 41, 42, 44], isRadioactive: false,
    desc: "شبه موصل تاريخي استخدم في أول ترانزستور، ويستخدم حالياً في أنظمة الألياف البصرية وعدسات الرؤية الليلية بالأشعة تحت الحمراء."
  },
  {
    atomicNumber: 33, symbol: "As", name: "زرنيخ", englishName: "Arsenic", atomicMass: 74.922,
    group: 15, period: 4, category: "metalloid", categoryAr: "شبه فلز",
    electronShells: [2, 8, 18, 5], electronConfig: "[Ar] 3d¹⁰ 4s² 4p³", stableNeutrons: [42], isRadioactive: false,
    desc: "شبه فلز اشتهر بسميته العالية عبر التاريخ، ويستخدم في إنتاج أشباه موصلات الليزر ومقويات الرصاص في الذخيرة."
  },
  {
    atomicNumber: 34, symbol: "Se", name: "سيلينيوم", englishName: "Selenium", atomicMass: 78.971,
    group: 16, period: 4, category: "nonmetal", categoryAr: "لا فلز",
    electronShells: [2, 8, 18, 6], electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁴", stableNeutrons: [40, 42, 43, 44, 46], isRadioactive: false,
    desc: "موصليته الكهربائية تزداد عند تعرضه للضوء، مما يجعله مثالياً للخلايا الكهروضوئية وآلات النسخ ومضادات الأكسدة الحيوية."
  },
  {
    atomicNumber: 35, symbol: "Br", name: "بروم", englishName: "Bromine", atomicMass: 79.904,
    group: 17, period: 4, category: "halogen", categoryAr: "هالوجين",
    electronShells: [2, 8, 18, 7], electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁵", stableNeutrons: [44, 46], isRadioactive: false,
    desc: "اللافلز الوحيد الذي يوجد كسائل بني محمر في درجة حرارة الغرفة، يستخدم في مثبطات الحرائق والأدوية والأفلام الفوتوغرافية القديمة."
  },
  {
    atomicNumber: 36, symbol: "Kr", name: "كريبتون", englishName: "Krypton", atomicMass: 83.798,
    group: 18, period: 4, category: "noble-gas", categoryAr: "غاز نبيل",
    electronShells: [2, 8, 18, 8], electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁶", stableNeutrons: [42, 44, 46, 47, 48, 50], isRadioactive: false,
    desc: "غاز نبيل يستخدم في الإضاءة الفلورية المتطورة، وفلاش الكاميرات الاحترافية، وليزرات جراحة العيون بالليزر."
  },
  {
    atomicNumber: 37, symbol: "Rb", name: "روبيديوم", englishName: "Rubidium", atomicMass: 85.468,
    group: 1, period: 5, category: "alkali-metal", categoryAr: "فلز قلوي",
    electronShells: [2, 8, 18, 8, 1], electronConfig: "[Kr] 5s¹", stableNeutrons: [48], isRadioactive: false,
    desc: "فلز قلوي شديد التفاعل يشتعل تلقائياً في الهواء، يستخدم في الساعات الذرية الفائقة الدقة لتوجيه أنظمة GPS والأبحاث الكمية."
  },
  {
    atomicNumber: 38, symbol: "Sr", name: "سترونشيوم", englishName: "Strontium", atomicMass: 87.62,
    group: 2, period: 5, category: "alkaline-earth", categoryAr: "فلز قلوي ترابي",
    electronShells: [2, 8, 18, 8, 2], electronConfig: "[Kr] 5s²", stableNeutrons: [46, 48, 49, 50], isRadioactive: false,
    desc: "يعطي الألعاب النارية لونها الأحمر القرمزي الساطع، وتستخدم الساعات الذرية البصرية للسترونشيوم كأدق مقاييس الزمن في العالم."
  },
  {
    atomicNumber: 39, symbol: "Y", name: "إتريوم", englishName: "Yttrium", atomicMass: 88.906,
    group: 3, period: 5, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 9, 2], electronConfig: "[Kr] 4d¹ 5s²", stableNeutrons: [50], isRadioactive: false,
    desc: "يدخل في تصنيع الموصلات الفائقة عند درجات حرارة مرتفعة وليزرات YAG الطبية ومصابيح الفسفور الفلورية."
  },
  {
    atomicNumber: 40, symbol: "Zr", name: "زركونيوم", englishName: "Zirconium", atomicMass: 91.224,
    group: 4, period: 5, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 10, 2], electronConfig: "[Kr] 4d² 5s²", stableNeutrons: [50, 51, 52, 54, 56], isRadioactive: false,
    desc: "مقاوم ممتاز للتآكل ولا يمتص النيوترونات، مما يجعله مادة التغليف المثالية لقضبان وقود اليورانيوم في المفاعلات النووية."
  },
  {
    atomicNumber: 41, symbol: "Nb", name: "نيوبيوم", englishName: "Niobium", atomicMass: 92.906,
    group: 5, period: 5, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 12, 1], electronConfig: "[Kr] 4d⁴ 5s¹", stableNeutrons: [52], isRadioactive: false,
    desc: "يستخدم في مغناطيسات الرنين المغناطيسي الفائقة التوصيل ومحركات الصواريخ الفضائية وسبائك الفولاذ فائقة المتانة."
  },
  {
    atomicNumber: 42, symbol: "Mo", name: "موليبدنوم", englishName: "Molybdenum", atomicMass: 95.95,
    group: 6, period: 5, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 13, 1], electronConfig: "[Kr] 4d⁵ 5s¹", stableNeutrons: [50, 52, 53, 54, 55, 56, 58], isRadioactive: false,
    desc: "يتحمل درجات حرارة قصوى دون أن يتمدد، ضروري في الفولاذ العسكري، وإنتاج النظير تكنيشيوم-99m للتشخيص الطبي النووي."
  },
  {
    atomicNumber: 43, symbol: "Tc", name: "تكنيشيوم", englishName: "Technetium", atomicMass: 98,
    group: 7, period: 5, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 13, 2], electronConfig: "[Kr] 4d⁵ 5s²", stableNeutrons: [55], isRadioactive: true,
    desc: "أول عنصر يصنع اصطناعياً في التاريخ، جميع نظائره مشعة، ويعد Tc-99m النظير الأكثر استخداماً عالمياً في التصوير الطبي للأعضاء."
  },
  {
    atomicNumber: 44, symbol: "Ru", name: "روثينيوم", englishName: "Ruthenium", atomicMass: 101.07,
    group: 8, period: 5, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 15, 1], electronConfig: "[Kr] 4d⁷ 5s¹", stableNeutrons: [52, 54, 55, 56, 57, 58, 60], isRadioactive: false,
    desc: "فلز نادر من مجموعة البلاتين، يستخدم كعامل حفاز فائق الكفاءة وفي الوصلات الكهربائية المقاومة للاهتراء والألواح الشمسية."
  },
  {
    atomicNumber: 45, symbol: "Rh", name: "روديوم", englishName: "Rhodium", atomicMass: 102.91,
    group: 9, period: 5, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 16, 1], electronConfig: "[Kr] 4d⁸ 5s¹", stableNeutrons: [58], isRadioactive: false,
    desc: "أحد أندر وأغلى الفلزات ثمناً في العالم، يستخدم في المحولات الحفازة للسيارات لتنقية العوادم السامة وطلاء المجوهرات البيضاء الفاخرة."
  },
  {
    atomicNumber: 46, symbol: "Pd", name: "بلاديوم", englishName: "Palladium", atomicMass: 106.42,
    group: 10, period: 5, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 18], electronConfig: "[Kr] 4d¹⁰", stableNeutrons: [56, 58, 59, 60, 62, 64], isRadioactive: false,
    desc: "يمتلك قدرة مذهلة على امتصاص ما يصل إلى 900 ضعف حجمه من غاز الهيدروجين، ويستخدم في معالجة الانبعاثات والالكترونيات الدقيقة."
  },
  {
    atomicNumber: 47, symbol: "Ag", name: "فضة", englishName: "Silver", atomicMass: 107.87,
    group: 11, period: 5, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 18, 1], electronConfig: "[Kr] 4d¹⁰ 5s¹", stableNeutrons: [60, 62], isRadioactive: false,
    desc: "أعلى العناصر توصيلاً للكهرباء والحرارة وأعلاها انعكاساً للضوء المرئي، تستخدم في المجوهرات والخلايا الشمسية ومضادات البكتيريا."
  },
  {
    atomicNumber: 48, symbol: "Cd", name: "كادميوم", englishName: "Cadmium", atomicMass: 112.41,
    group: 12, period: 5, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 18, 2], electronConfig: "[Kr] 4d¹⁰ 5s²", stableNeutrons: [58, 62, 63, 64, 66], isRadioactive: false,
    desc: "فلز يمتص النيوترونات بكفاءة، استخدم في بطاريات النيكل-كادميوم وقضبان التحكم بالمفاعلات النووية، وهو سام بيئياً."
  },
  {
    atomicNumber: 49, symbol: "In", name: "إنديوم", englishName: "Indium", atomicMass: 114.82,
    group: 13, period: 5, category: "post-transition", categoryAr: "فلز بعد انتقالي",
    electronShells: [2, 8, 18, 18, 3], electronConfig: "[Kr] 4d¹⁰ 5s² 5p¹", stableNeutrons: [66], isRadioactive: false,
    desc: "مكون أساسي لأكسيد الإنديوم والقصدير (ITO) وهو الطلاء الشفاف الموصل المستخدم في شاشات اللمس للهواتف الذكية والتلفزيونات."
  },
  {
    atomicNumber: 50, symbol: "Sn", name: "قصدير", englishName: "Tin", atomicMass: 118.71,
    group: 14, period: 5, category: "post-transition", categoryAr: "فلز بعد انتقالي",
    electronShells: [2, 8, 18, 18, 4], electronConfig: "[Kr] 4d¹⁰ 5s² 5p²", stableNeutrons: [62, 64, 65, 66, 67, 68, 69, 70, 72, 74], isRadioactive: false,
    desc: "أكثر العناصر امتلاكاً للنظائر المستقرة (10 نظائر)، شكل مع النحاس العصر البرونزي، ويستخدم في لحام الدوائر الإلكترونية وتعليب الأغذية."
  },
  {
    atomicNumber: 51, symbol: "Sb", name: "إثمد (أنتيمون)", englishName: "Antimony", atomicMass: 121.76,
    group: 15, period: 5, category: "metalloid", categoryAr: "شبه فلز",
    electronShells: [2, 8, 18, 18, 5], electronConfig: "[Kr] 4d¹⁰ 5s² 5p³", stableNeutrons: [70, 72], isRadioactive: false,
    desc: "شبه فلز تاريخي عرف باسم الكحل العربي، يستخدم اليوم في زيادة صلابة الرصاص ومثبطات اللهب وبطاريات التخزين الكهروكيميائي."
  },
  {
    atomicNumber: 52, symbol: "Te", name: "تيلوريوم", englishName: "Tellurium", atomicMass: 127.60,
    group: 16, period: 5, category: "metalloid", categoryAr: "شبه فلز",
    electronShells: [2, 8, 18, 18, 6], electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁴", stableNeutrons: [68, 70, 72, 73, 74, 76], isRadioactive: false,
    desc: "شبه فلز نادر يستخدم في الخلايا الشمسية عالية الكفاءة (CdTe) وأجهزة التبريد الحرارية الكهروحرارية."
  },
  {
    atomicNumber: 53, symbol: "I", name: "يود", englishName: "Iodine", atomicMass: 126.90,
    group: 17, period: 5, category: "halogen", categoryAr: "هالوجين",
    electronShells: [2, 8, 18, 18, 7], electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁵", stableNeutrons: [74], isRadioactive: false,
    desc: "مادة صلبة بنفسجية داكنة تتسامى إلى بخار بنفسجي، ضرورية لعمل الغدة الدرقية، والنظير المشع I-131 هو الركيزة الأساسية لعلاج أورام الغدة الدرقية."
  },
  {
    atomicNumber: 54, symbol: "Xe", name: "زينون", englishName: "Xenon", atomicMass: 131.29,
    group: 18, period: 5, category: "noble-gas", categoryAr: "غاز نبيل",
    electronShells: [2, 8, 18, 18, 8], electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁶", stableNeutrons: [72, 74, 75, 76, 77, 78, 80, 82], isRadioactive: false,
    desc: "غاز نبيل ثقيل، يستخدم في مصابيح السيارات الكاشفة فائقة السطوع، وكمادة دافعة في محركات الدفع الأيوني للمركبات الفضائية في ناسا."
  },
  {
    atomicNumber: 55, symbol: "Cs", name: "سيزيوم", englishName: "Caesium", atomicMass: 132.91,
    group: 1, period: 6, category: "alkali-metal", categoryAr: "فلز قلوي",
    electronShells: [2, 8, 18, 18, 8, 1], electronConfig: "[Xe] 6s¹", stableNeutrons: [78], isRadioactive: false,
    desc: "فلز قلوي ذهبي اللون ينصهر عند 28.5°C، يحدد تردد اهتزاز ذرات السيزيوم-133 التعريف الرسمي للثانية الدولية في الساعات الذرية."
  },
  {
    atomicNumber: 56, symbol: "Ba", name: "باريوم", englishName: "Barium", atomicMass: 137.33,
    group: 2, period: 6, category: "alkaline-earth", categoryAr: "فلز قلوي ترابي",
    electronShells: [2, 8, 18, 18, 8, 2], electronConfig: "[Xe] 6s²", stableNeutrons: [74, 76, 78, 79, 80, 81, 82], isRadioactive: false,
    desc: "يعطي الألعاب النارية اللون الأخضر الزمردي، ويستخدم مركب كبريتات الباريوم كعامل تباين إشعاعي لتصوير الجهاز الهضمي بالأشعة السينية."
  },
  {
    atomicNumber: 57, symbol: "La", name: "لانثانوم", englishName: "Lanthanum", atomicMass: 138.91,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 18, 9, 2], electronConfig: "[Xe] 5d¹ 6s²", stableNeutrons: [82], isRadioactive: false,
    desc: "رأس سلسلة اللانثانيدات، يدخل في صناعة زجاج العدسات البصرية عالية معامل الانكسار وفي أقطاب بطاريات هيدريد النيكل للسيارات الهجينة."
  },
  {
    atomicNumber: 58, symbol: "Ce", name: "سيريوم", englishName: "Cerium", atomicMass: 140.12,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 19, 9, 2], electronConfig: "[Xe] 4f¹ 5d¹ 6s²", stableNeutrons: [80, 82, 84], isRadioactive: false,
    desc: "أكثر العناصر الأرضية النادرة وفرة، يستخدم كحجر قداحة للولاعات وفي تلميع شاشات الزجاج فائقة الدقة والمحولات الحفازة."
  },
  {
    atomicNumber: 59, symbol: "Pr", name: "براسوديميوم", englishName: "Praseodymium", atomicMass: 140.91,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 21, 8, 2], electronConfig: "[Xe] 4f³ 6s²", stableNeutrons: [82], isRadioactive: false,
    desc: "يمنح المغناطيسات الدائمة قوة إضافية، ويستخدم في نظارات حماية عيون عمال اللحام من الأشعة فوق البنفسجية والأشعة تحت الحمراء."
  },
  {
    atomicNumber: 60, symbol: "Nd", name: "نيوديميوم", englishName: "Neodymium", atomicMass: 144.24,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 22, 8, 2], electronConfig: "[Xe] 4f⁴ 6s²", stableNeutrons: [82, 83, 84, 85, 86], isRadioactive: false,
    desc: "ينتج أقوى المغناطيسات الدائمة المعروفة على كوكب الأرض (NdFeB)، والمستخدمة في محركات السيارات الكهربائية، وتوربينات الرياح، ومكبرات الصوت."
  },
  {
    atomicNumber: 61, symbol: "Pm", name: "بروميثيوم", englishName: "Promethium", atomicMass: 145,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 23, 8, 2], electronConfig: "[Xe] 4f⁵ 6s²", stableNeutrons: [84], isRadioactive: true,
    desc: "اللانثانيد المشع الوحيد وغير المستقر في الطبيعة، يستخدم في البطاريات النووية المصغرة للمركبات الفضائية والإشارات الضوئية المضيئة ذاتياً."
  },
  {
    atomicNumber: 62, symbol: "Sm", name: "ساماريوم", englishName: "Samarium", atomicMass: 150.36,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 24, 8, 2], electronConfig: "[Xe] 4f⁶ 6s²", stableNeutrons: [82, 87, 88, 90, 92], isRadioactive: false,
    desc: "يشكل مغناطيسات ساماريوم-كوبالت الفائقة التي تقاوم درجات الحرارة القصوى دون فقدان مغناطيسيتها في تطبيقات الدفاع والفضاء."
  },
  {
    atomicNumber: 63, symbol: "Eu", name: "يوروبيوم", englishName: "Europium", atomicMass: 151.96,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 25, 8, 2], electronConfig: "[Xe] 4f⁷ 6s²", stableNeutrons: [88, 90], isRadioactive: false,
    desc: "أكثر اللانثانيدات تفاعلاً، يستخدم الفسفور الفلوري لليوروبيوم في مكافحة تزييف العملات الورقية كاليورو والشاشات الملونة."
  },
  {
    atomicNumber: 64, symbol: "Gd", name: "غادولينيوم", englishName: "Gadolinium", atomicMass: 157.25,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 25, 9, 2], electronConfig: "[Xe] 4f⁷ 5d¹ 6s²", stableNeutrons: [88, 90, 91, 92, 93, 94, 96], isRadioactive: false,
    desc: "يمتلك خصائص مغناطيسية بارامغناطيسية فريدة، ويستخدم كعامل تباين أساسي في فحوصات الرنين المغناطيسي الطبي (MRI)."
  },
  {
    atomicNumber: 65, symbol: "Tb", name: "تيربيوم", englishName: "Terbium", atomicMass: 158.93,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 27, 8, 2], electronConfig: "[Xe] 4f⁹ 6s²", stableNeutrons: [94], isRadioactive: false,
    desc: "يصدر وميضاً فسفورياً أخضر ساطعاً في الشاشات، ويدخل في سبيكة Terfenol-D التي تتمدد في المجال المغناطيسي لمجسات السونار."
  },
  {
    atomicNumber: 66, symbol: "Dy", name: "ديسبروسيوم", englishName: "Dysprosium", atomicMass: 162.50,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 28, 8, 2], electronConfig: "[Xe] 4f¹⁰ 6s²", stableNeutrons: [90, 94, 95, 96, 97, 98, 100], isRadioactive: false,
    desc: "يضاف لمغناطيسات النيوديميوم لمنعها من فقدان قوتها المغناطيسية عند درجات الحرارة المرتفعة في محركات السيارات الكهربائية."
  },
  {
    atomicNumber: 67, symbol: "Ho", name: "هولميوم", englishName: "Holmium", atomicMass: 164.93,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 29, 8, 2], electronConfig: "[Xe] 4f¹¹ 6s²", stableNeutrons: [98], isRadioactive: false,
    desc: "يمتلك أعلى عزم مغناطيسي بين جميع العناصر الطبيعية، ويستخدم لتركيز خطوط المجال المغناطيسي وفي ليزرات تفتيت حصوات الكلى."
  },
  {
    atomicNumber: 68, symbol: "Er", name: "إربيوم", englishName: "Erbium", atomicMass: 167.26,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 30, 8, 2], electronConfig: "[Xe] 4f¹² 6s²", stableNeutrons: [94, 96, 98, 99, 100, 102], isRadioactive: false,
    desc: "مضخمات الألياف البصرية المطعمة بالإربيوم (EDFA) هي التي تمكن إشارات الإنترنت عبر القارات من السفر لآلاف الكيلومترات دون تلاشي."
  },
  {
    atomicNumber: 69, symbol: "Tm", name: "ثوليوم", englishName: "Thulium", atomicMass: 168.93,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 31, 8, 2], electronConfig: "[Xe] 4f¹³ 6s²", stableNeutrons: [100], isRadioactive: false,
    desc: "أندر اللانثانيدات الطبيعية، يستخدم في أجهزة الأشعة السينية المحمولة خفيفة الوزن للمناطق الميدانية النائية."
  },
  {
    atomicNumber: 70, symbol: "Yb", name: "إيتربيوم", englishName: "Ytterbium", atomicMass: 173.05,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 32, 8, 2], electronConfig: "[Xe] 4f¹⁴ 6s²", stableNeutrons: [98, 100, 101, 102, 103, 104, 106], isRadioactive: false,
    desc: "يستخدم في الساعات الذرية الليزرية الفائقة، وكمصدر للأشعة السينية وفي مقاييس الضغط الأرضي للزلازل والانفجارات تحت الأرض."
  },
  {
    atomicNumber: 71, symbol: "Lu", name: "لوتيتيوم", englishName: "Lutetium", atomicMass: 174.97,
    group: 3, period: 6, category: "lanthanide", categoryAr: "لانثانيد",
    electronShells: [2, 8, 18, 32, 9, 2], electronConfig: "[Xe] 4f¹⁴ 5d¹ 6s²", stableNeutrons: [104], isRadioactive: false,
    desc: "آخر وأكثف وأغلى اللانثانيدات، يستخدم كاشف لوتيتيوم-177 الثوري في استهداف وتدمير خلايا سرطان البروستاتا المتقدم إشعاعياً."
  },
  {
    atomicNumber: 72, symbol: "Hf", name: "هافنيوم", englishName: "Hafnium", atomicMass: 178.49,
    group: 4, period: 6, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 32, 10, 2], electronConfig: "[Xe] 4f¹⁴ 5d² 6s²", stableNeutrons: [104, 105, 106, 107, 108], isRadioactive: false,
    desc: "يمتص النيوترونات بقوة هائلة، ويستخدم في قضبان التحكم بمفاعلات الغواصات النووية وعوازل بوابات المعالجات الدقيقة النانوية."
  },
  {
    atomicNumber: 73, symbol: "Ta", name: "تانتالوم", englishName: "Tantalum", atomicMass: 180.95,
    group: 5, period: 6, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 32, 11, 2], electronConfig: "[Xe] 4f¹⁴ 5d³ 6s²", stableNeutrons: [108], isRadioactive: false,
    desc: "مقاوم للتآكل الكيميائي، أساس مكثفات التانتالوم المصغرة الموجودة في كل هاتف ذكي وحاسوب محمول وغرسات العظام الطبية."
  },
  {
    atomicNumber: 74, symbol: "W", name: "تنجستن (فولفرام)", englishName: "Tungsten", atomicMass: 183.84,
    group: 6, period: 6, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 32, 12, 2], electronConfig: "[Xe] 4f¹⁴ 5d⁴ 6s²", stableNeutrons: [108, 109, 110, 112], isRadioactive: false,
    desc: "صاحب أعلى نقطة انصهار بين جميع العناصر الفلزية على الإطلاق (3422°C)، يستخدم في فتائل المصابيح، والدروع العسكرية، وقواطع الصخور."
  },
  {
    atomicNumber: 75, symbol: "Re", name: "رينيوم", englishName: "Rhenium", atomicMass: 186.21,
    group: 7, period: 6, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 32, 13, 2], electronConfig: "[Xe] 4f¹⁴ 5d⁵ 6s²", stableNeutrons: [110], isRadioactive: false,
    desc: "أحد أندر عناصر قشرة الأرض، يتحمل إجهادات حرارية هائلة في شفرات توربينات محركات الطائرات النفاثة والوقود الخالي من الرصاص."
  },
  {
    atomicNumber: 76, symbol: "Os", name: "أوزميوم", englishName: "Osmium", atomicMass: 190.23,
    group: 8, period: 6, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 32, 14, 2], electronConfig: "[Xe] 4f¹⁴ 5d⁶ 6s²", stableNeutrons: [111, 113, 114, 115, 116], isRadioactive: false,
    desc: "أكثف عنصر كيميائي طبيعي على وجه الأرض (22.59 جم/سم³)، صلب للغاية ويستخدم في رؤوس أقلام الحبر الفاخرة ونقاط الارتكاز الميكانيكية الدقيقة."
  },
  {
    atomicNumber: 77, symbol: "Ir", name: "إيريديوم", englishName: "Iridium", atomicMass: 192.22,
    group: 9, period: 6, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 32, 15, 2], electronConfig: "[Xe] 4f¹⁴ 5d⁷ 6s²", stableNeutrons: [114, 116], isRadioactive: false,
    desc: "أكثر الفلزات مقاومة للتآكل على الإطلاق، وفرته العالية في طبقة جيولوجية محددة كانت الدليل الحاسم على اصطدام الكويكب الذي أنهى عصر الديناصورات."
  },
  {
    atomicNumber: 78, symbol: "Pt", name: "بلاتين", englishName: "Platinum", atomicMass: 195.08,
    group: 10, period: 6, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 32, 17, 1], electronConfig: "[Xe] 4f¹⁴ 5d⁹ 6s¹", stableNeutrons: [116, 117, 118, 120], isRadioactive: false,
    desc: "فلز نفيس غير قابل للأكسدة، يستخدم في خلايا وقود الهيدروجين النظيفة والمجوهرات وعقارات العلاج الكيميائي للسرطان (سيسبلاتين)."
  },
  {
    atomicNumber: 79, symbol: "Au", name: "ذهب", englishName: "Gold", atomicMass: 196.97,
    group: 11, period: 6, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 32, 18, 1], electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", stableNeutrons: [118], isRadioactive: false,
    desc: "سيد المعادن النفيسة منذ فجر التاريخ، لا يصدأ ولا يتآكل أبداً، قابل للسحب والطرق بشكل لا يضاهى وموصل ممتاز في إلكترونيات الفضاء."
  },
  {
    atomicNumber: 80, symbol: "Hg", name: "زئبق", englishName: "Mercury", atomicMass: 200.59,
    group: 12, period: 6, category: "transition-metal", categoryAr: "فلز انتقالي",
    electronShells: [2, 8, 18, 32, 18, 2], electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s²", stableNeutrons: [118, 119, 120, 121, 122, 124], isRadioactive: false,
    desc: "الفلز الوحيد الذي يكون سائلاً في درجة حرارة الغرفة وضغطها، استخدم تاريخياً في موازين الحرارة والضغط والبارومترات، وهو سام للغاية."
  },
  {
    atomicNumber: 81, symbol: "Tl", name: "ثاليوم", englishName: "Thallium", atomicMass: 204.38,
    group: 13, period: 6, category: "post-transition", categoryAr: "فلز بعد انتقالي",
    electronShells: [2, 8, 18, 32, 18, 3], electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹", stableNeutrons: [122, 124], isRadioactive: false,
    desc: "فلز لين وشديد السمية، يستخدم في تصنيع الكواشف تحت الحمراء والزجاج البصري منخفض درجة الانصهار وفي طب القلب النووي (ثاليوم-201)."
  },
  {
    atomicNumber: 82, symbol: "Pb", name: "رصاص", englishName: "Lead", atomicMass: 207.2,
    group: 14, period: 6, category: "post-transition", categoryAr: "فلز بعد انتقالي",
    electronShells: [2, 8, 18, 32, 18, 4], electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", stableNeutrons: [122, 124, 125, 126], isRadioactive: false,
    desc: "أثقل عنصر يمتلك نظائر مستقرة في الطبيعة، درع لا غنى عنه للحماية من الأشعة السينية والإشعاعات النووية وبطاريات السيارات التقليدية."
  },
  {
    atomicNumber: 83, symbol: "Bi", name: "بزموت", englishName: "Bismuth", atomicMass: 208.98,
    group: 15, period: 6, category: "post-transition", categoryAr: "فلز بعد انتقالي",
    electronShells: [2, 8, 18, 32, 18, 5], electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³", stableNeutrons: [126], isRadioactive: true,
    desc: "فلز بلوراته تتميز بألوان قوس قزح البديعة، مشع بنصف عمر يبلغ مليار ضعف عمر الكون (1.9×10¹⁹ سنة)، آمن وغير سام في أدوية المعدة."
  },
  {
    atomicNumber: 84, symbol: "Po", name: "بولونيوم", englishName: "Polonium", atomicMass: 209,
    group: 16, period: 6, category: "post-transition", categoryAr: "فلز بعد انتقالي",
    electronShells: [2, 8, 18, 32, 18, 6], electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴", stableNeutrons: [125], isRadioactive: true,
    desc: "اكتشفته ماري كوري وسمته تيمناً بوطنها بولندا، مصدر حراري ألفا شديد النشاط الإشعاعي استخدم لتسخين مسابير الفضاء القمرية والروسية."
  },
  {
    atomicNumber: 85, symbol: "At", name: "أستاتين", englishName: "Astatine", atomicMass: 210,
    group: 17, period: 6, category: "halogen", categoryAr: "هالوجين",
    electronShells: [2, 8, 18, 32, 18, 7], electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵", stableNeutrons: [125], isRadioactive: true,
    desc: "أندر العناصر الطبيعية على الأرض (أقل من غرام واحد في كامل القشرة الأرضية)، يدرس النظير At-211 لعلاج السرطان بالجسيمات المشعة المستهدفة."
  },
  {
    atomicNumber: 86, symbol: "Rn", name: "رادون", englishName: "Radon", atomicMass: 222,
    group: 18, period: 6, category: "noble-gas", categoryAr: "غاز نبيل",
    electronShells: [2, 8, 18, 32, 18, 8], electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶", stableNeutrons: [136], isRadioactive: true,
    desc: "غاز نبيل مشع عديم الرائحة واللون، ينتج من تحلل اليورانيوم والثوريوم في الصخور والتربة، وهو ثاني مسبب لسرطان الرئة بعد التدخين."
  },
  {
    atomicNumber: 87, symbol: "Fr", name: "فرانسيوم", englishName: "Francium", atomicMass: 223,
    group: 1, period: 7, category: "alkali-metal", categoryAr: "فلز قلوي",
    electronShells: [2, 8, 18, 32, 18, 8, 1], electronConfig: "[Rn] 7s¹", stableNeutrons: [136], isRadioactive: true,
    desc: "أثقل وأندر فلز قلوي، شديد النشاط الإشعاعي وسريع الاضمحلال بنصف عمر 22 دقيقة فقط، لا يوجد منه سوى ذرات قليلة في القشرة الأرضية."
  },
  {
    atomicNumber: 88, symbol: "Ra", name: "راديوم", englishName: "Radium", atomicMass: 226,
    group: 2, period: 7, category: "alkaline-earth", categoryAr: "فلز قلوي ترابي",
    electronShells: [2, 8, 18, 32, 18, 8, 2], electronConfig: "[Rn] 7s²", stableNeutrons: [138], isRadioactive: true,
    desc: "اكتشفته ماري وبيير كوري، يتوهج في الظلام بإشعاع خافت، استخدم قديماً لطلاء عقارب الساعات المضيئة وأسس بداية عصر الفيزياء النووية."
  },
  {
    atomicNumber: 89, symbol: "Ac", name: "أكتينيوم", englishName: "Actinium", atomicMass: 227,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 18, 9, 2], electronConfig: "[Rn] 6d¹ 7s²", stableNeutrons: [138], isRadioactive: true,
    desc: "مفتتح سلسلة الأكتينيدات، فلز فضي شديد النشاط الإشعاعي يتوهج بضوء أزرق باهت في الظلام، ويستخدم كمصدر نيوتروني وعلاج إشعاعي واعد."
  },
  {
    atomicNumber: 90, symbol: "Th", name: "ثوريوم", englishName: "Thorium", atomicMass: 232.04,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 18, 10, 2], electronConfig: "[Rn] 6d² 7s²", stableNeutrons: [142], isRadioactive: true,
    desc: "عنصر مشع طبيعي وفير، يعتبر وقود الجيل القادم لمفاعلات الملح المصهور النووية النظيفة والآمنة التي لا يمكن تحويلها لأسلحة."
  },
  {
    atomicNumber: 91, symbol: "Pa", name: "بروتكتينيوم", englishName: "Protactinium", atomicMass: 231.04,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 20, 9, 2], electronConfig: "[Rn] 5f² 6d¹ 7s²", stableNeutrons: [140], isRadioactive: true,
    desc: "عنصر مشع نادر ومرتفع السمية يتوسط سلسلة اضمحلال اليورانيوم، يستخدم في التأريخ الإشعاعي للرواسب البحرية القديمة."
  },
  {
    atomicNumber: 92, symbol: "U", name: "يورانيوم", englishName: "Uranium", atomicMass: 238.03,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 21, 9, 2], electronConfig: "[Rn] 5f³ 6d¹ 7s²", stableNeutrons: [143, 146], isRadioactive: true,
    desc: "الوقود الأساسي لمحطات الطاقة النووية حول العالم، يمتلك كثافة عالية جداً، ويستخدم نظيره U-238 لتحديد العمر الجيولوجي لكوكب الأرض."
  },
  {
    atomicNumber: 93, symbol: "Np", name: "نبتونيوم", englishName: "Neptunium", atomicMass: 237,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 22, 9, 2], electronConfig: "[Rn] 5f⁴ 6d¹ 7s²", stableNeutrons: [144], isRadioactive: true,
    desc: "أول عنصر مصنع يقع بعد اليورانيوم (ما وراء اليورانيوم)، ينتج في المفاعلات النووية ويستخدم لإنتاج البلوتونيوم-238 لمسابر الفضاء."
  },
  {
    atomicNumber: 94, symbol: "Pu", name: "بلوتونيوم", englishName: "Plutonium", atomicMass: 244,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 24, 8, 2], electronConfig: "[Rn] 5f⁶ 7s²", stableNeutrons: [145, 150], isRadioactive: true,
    desc: "عنصر انشطاري هائل الطاقة، يزود مسبار كوريوسيتي وبرسيفيرنس على المريخ وفوياجر في الفضاء السحيق بالكهرباء والحرارة لعقود."
  },
  {
    atomicNumber: 95, symbol: "Am", name: "أمريسيوم", englishName: "Americium", atomicMass: 243,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 25, 8, 2], electronConfig: "[Rn] 5f⁷ 7s²", stableNeutrons: [146, 148], isRadioactive: true,
    desc: "يوجد كمية مجهرية من نظيره المشع Am-241 في كاشفات الدخان المنزلية في ملايين المنازل لإنقاذ الأرواح بتأيين الهواء للكشف عن الحريق."
  },
  {
    atomicNumber: 96, symbol: "Cm", name: "كوريوم", englishName: "Curium", atomicMass: 247,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 25, 9, 2], electronConfig: "[Rn] 5f⁷ 6d¹ 7s²", stableNeutrons: [151], isRadioactive: true,
    desc: "سمي تكريماً لماري وبيير كوري، شديد الإشعاع لدرجة أنه يتوهج بنفسجياً بحرارته الذاتية، ومصدر لأشعة ألفا في مطياف مركبات المريخ."
  },
  {
    atomicNumber: 97, symbol: "Bk", name: "بركليوم", englishName: "Berkelium", atomicMass: 247,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 27, 8, 2], electronConfig: "[Rn] 5f⁹ 7s²", stableNeutrons: [150], isRadioactive: true,
    desc: "سمي نسبة لمدينة بيركلي بكاليفورنيا، يصنع بكميات مجهرية بالغة الدقة كهدف لقذف الأيونات وتصنيع عناصر أثقل مثل التينيسين."
  },
  {
    atomicNumber: 98, symbol: "Cf", name: "كاليفورنيوم", englishName: "Californium", atomicMass: 251,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 28, 8, 2], electronConfig: "[Rn] 5f¹⁰ 7s²", stableNeutrons: [153], isRadioactive: true,
    desc: "أحد أغلى المواد في العالم، مصدر نيوتروني فائق القوة يستخدم لبدء تشغيل المفاعلات النووية وتفتيش أمتعة الطيران وكشف آبار النفط."
  },
  {
    atomicNumber: 99, symbol: "Es", name: "أينشتاينيوم", englishName: "Einsteinium", atomicMass: 252,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 29, 8, 2], electronConfig: "[Rn] 5f¹¹ 7s²", stableNeutrons: [153], isRadioactive: true,
    desc: "اكتشف في حطام أول تفجير لقنبلة هيدروجينية (إيفي مايك) عام 1952، وسمي تخليداً للعالم ألبرت أينشتاين."
  },
  {
    atomicNumber: 100, symbol: "Fm", name: "فيرميوم", englishName: "Fermium", atomicMass: 257,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 30, 8, 2], electronConfig: "[Rn] 5f¹² 7s²", stableNeutrons: [157], isRadioactive: true,
    desc: "أثقل عنصر يمكن إنتاجه عن طريق قذف النيوترونات المتتالي، سمي تكريماً لإنريكو فيرمي مؤسس أول مفاعل نووي بشري."
  },
  {
    atomicNumber: 101, symbol: "Md", name: "مندليفيوم", englishName: "Mendelevium", atomicMass: 258,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 31, 8, 2], electronConfig: "[Rn] 5f¹³ 7s²", stableNeutrons: [157], isRadioactive: true,
    desc: "سمي تكريماً لديمتري مندلييف واضع أول جدول دوري للعناصر، أنتج لأول مرة بتصنيع ذرة واحدة في كل تجربة قذف."
  },
  {
    atomicNumber: 102, symbol: "No", name: "نوبليوم", englishName: "Nobelium", atomicMass: 259,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 32, 8, 2], electronConfig: "[Rn] 5f¹⁴ 7s²", stableNeutrons: [157], isRadioactive: true,
    desc: "سمي تكريماً لألفريد نوبل مخترع الديناميت ومؤسس جوائز نوبل، عنصر اصطناعي مشع بنصف عمر يبلغ 58 دقيقة."
  },
  {
    atomicNumber: 103, symbol: "Lr", name: "لورنسيوم", englishName: "Lawrencium", atomicMass: 266,
    group: 3, period: 7, category: "actinide", categoryAr: "أكتينيد",
    electronShells: [2, 8, 18, 32, 32, 8, 3], electronConfig: "[Rn] 5f¹⁴ 7s² 7p¹", stableNeutrons: [163], isRadioactive: true,
    desc: "آخر عناصر سلسلة الأكتينيدات، سمي نسبة لإرنست لورنس مخترع السيكلترون لمعجلات الجسيمات الذرية."
  },
  {
    atomicNumber: 104, symbol: "Rf", name: "رذرفورديوم", englishName: "Rutherfordium", atomicMass: 267,
    group: 4, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 10, 2], electronConfig: "[Rn] 5f¹⁴ 6d² 7s²", stableNeutrons: [163], isRadioactive: true,
    desc: "مفتتح العناصر فائقة الثقل في المجموعة 4، سمي تكريماً لإرنست رذرفورد مكتشف نواة الذرة والبروتون."
  },
  {
    atomicNumber: 105, symbol: "Db", name: "دوبنيوم", englishName: "Dubnium", atomicMass: 268,
    group: 5, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 11, 2], electronConfig: "[Rn] 5f¹⁴ 6d³ 7s²", stableNeutrons: [163], isRadioactive: true,
    desc: "سمي تيمناً بمدينة دوبنا الروسية حيث يقع المعهد المشترك للأبحاث النووية الرائد في تصنيع العناصر الثقيلة."
  },
  {
    atomicNumber: 106, symbol: "Sg", name: "سيبورغيوم", englishName: "Seaborgium", atomicMass: 269,
    group: 6, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 12, 2], electronConfig: "[Rn] 5f¹⁴ 6d⁴ 7s²", stableNeutrons: [163], isRadioactive: true,
    desc: "سمي تكريماً لغلين سيبورغ رائد اكتشاف الأكتينيدات، وهو أول عنصر يسمى على اسم عالم بينما كان لا يزال على قيد الحياة."
  },
  {
    atomicNumber: 107, symbol: "Bh", name: "بوريوم", englishName: "Bohrium", atomicMass: 270,
    group: 7, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 13, 2], electronConfig: "[Rn] 5f¹⁴ 6d⁵ 7s²", stableNeutrons: [163], isRadioactive: true,
    desc: "سمي تكريماً لنيلز بور واضع نموذج بور الذري ورائد ميكانيكا الكم الحائز على جائزة نوبل."
  },
  {
    atomicNumber: 108, symbol: "Hs", name: "هاسيوم", englishName: "Hassium", atomicMass: 269,
    group: 8, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 14, 2], electronConfig: "[Rn] 5f¹⁴ 6d⁶ 7s²", stableNeutrons: [161], isRadioactive: true,
    desc: "سمي نسبة لولاية هسن الألمانية مقر مركز أبحاث الأيونات الثقيلة (GSI) في دارمشتات."
  },
  {
    atomicNumber: 109, symbol: "Mt", name: "مايتنريوم", englishName: "Meitnerium", atomicMass: 278,
    group: 9, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 15, 2], electronConfig: "[Rn] 5f¹⁴ 6d⁷ 7s²", stableNeutrons: [169], isRadioactive: true,
    desc: "سمي تكريماً لعالمة الفيزياء ليز مايتنر المشاركة في اكتشاف الانشطار النووي، وهي المرأة الوحيدة المكرمة حصرياً باسم عنصر."
  },
  {
    atomicNumber: 110, symbol: "Ds", name: "دارمشتاتيوم", englishName: "Darmstadtium", atomicMass: 281,
    group: 10, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 17, 1], electronConfig: "[Rn] 5f¹⁴ 6d⁸ 7s²", stableNeutrons: [171], isRadioactive: true,
    desc: "سمي نسبة لمدينة دارمشتات بألمانيا حيث جرى تصنيعه لأول مرة بقذف الرصاص بنيكل مسرع."
  },
  {
    atomicNumber: 111, symbol: "Rg", name: "رونتجينيوم", englishName: "Roentgenium", atomicMass: 282,
    group: 11, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 18, 1], electronConfig: "[Rn] 5f¹⁴ 6d⁹ 7s²", stableNeutrons: [171], isRadioactive: true,
    desc: "سمي تكريماً لفيلهلم رونتغن مكتشف الأشعة السينية (أشعة إكس) الحائز على أول جائزة نوبل في الفيزياء."
  },
  {
    atomicNumber: 112, symbol: "Cn", name: "كوبرنيسيوم", englishName: "Copernicium", atomicMass: 285,
    group: 12, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 18, 2], electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s²", stableNeutrons: [173], isRadioactive: true,
    desc: "سمي تكريماً لعالم الفلك نيكولاس كوبرنيكوس واضع نظرية مركزية الشمس في حركة الكواكب."
  },
  {
    atomicNumber: 113, symbol: "Nh", name: "نيهونيوم", englishName: "Nihonium", atomicMass: 286,
    group: 13, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 18, 3], electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹", stableNeutrons: [173], isRadioactive: true,
    desc: "أول عنصر يكتشف في قارة آسيا في معهد ريكن باليابان، وسمي نسبة لاسم اليابان باللغة اليابانية (نيهون)."
  },
  {
    atomicNumber: 114, symbol: "Fl", name: "فليروفيوم", englishName: "Flerovium", atomicMass: 289,
    group: 14, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 18, 4], electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²", stableNeutrons: [175], isRadioactive: true,
    desc: "سمي تكريماً للفيزيائي غيورغي فليروف ومختبر فليروف للتفاعلات النووية، يقع قرب جزيرة الاستقرار النظرية."
  },
  {
    atomicNumber: 115, symbol: "Mc", name: "موسكوفيوم", englishName: "Moscovium", atomicMass: 290,
    group: 15, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 18, 5], electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³", stableNeutrons: [175], isRadioactive: true,
    desc: "سمي تخليداً لمنطقة موسكو الروسية حيث ساهم العلماء في المعهد النووي باكتشافه وتصنيعه."
  },
  {
    atomicNumber: 116, symbol: "Lv", name: "ليفرموريوم", englishName: "Livermorium", atomicMass: 293,
    group: 16, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 18, 6], electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴", stableNeutrons: [177], isRadioactive: true,
    desc: "سمي تكريماً لمختبر لورانس ليفرمور الوطني في كاليفورنيا تقديراً لجهوده المشتركة في تصنيع العناصر فائقة الثقل."
  },
  {
    atomicNumber: 117, symbol: "Ts", name: "تينيسين", englishName: "Tennessine", atomicMass: 294,
    group: 17, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 18, 7], electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵", stableNeutrons: [177], isRadioactive: true,
    desc: "أثقل هالوجين معروف، سمي نسبة لولاية تينيسي الأمريكية ومختبر أوك ردج الوطني الذي وفر مادة البركليوم النادرة لتصنيعه."
  },
  {
    atomicNumber: 118, symbol: "Og", name: "أوغانيسون", englishName: "Oganesson", atomicMass: 294,
    group: 18, period: 7, category: "superheavy", categoryAr: "عنصر فائق الثقل",
    electronShells: [2, 8, 18, 32, 32, 18, 8], electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶", stableNeutrons: [176], isRadioactive: true,
    desc: "أثقل عنصر كيميائي مكتشف في تاريخ البشرية حتى الآن، يختتم الدورة السابعة في الجدول الدوري، سمي تكريماً للعالم الروسي يوري أوغانيسيان."
  }
];

// Helper lookup map by atomic number
export const ELEMENT_MAP: Record<number, ElementInfo> = ALL_ELEMENTS.reduce((acc, el) => {
  acc[el.atomicNumber] = el;
  return acc;
}, {} as Record<number, ElementInfo>);
