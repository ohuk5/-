import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Flame,
  Thermometer,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Volume2,
  VolumeX,
  Droplet,
  Plus,
  Trash2,
  Download,
  Save,
  ShieldCheck,
  Eye,
  Wind,
  Layers,
  FileText,
  Clock,
  Activity,
  Zap,
  Box
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LabViewer3D } from './LabViewer3D';
import { playLabSound, LabSoundType } from '../utils/soundEffects';

// Reagent definition for safe chemical lab
interface LabReagent {
  id: string;
  nameAr: string;
  nameEn: string;
  formula: string;
  type: 'liquid' | 'powder' | 'indicator' | 'solid';
  defaultColor: string;
  phValue: number;
  descAr: string;
  descEn: string;
}

const REAGENTS: LabReagent[] = [
  {
    id: 'water',
    nameAr: 'ماء مقطر',
    nameEn: 'Distilled Water',
    formula: 'H₂O',
    type: 'liquid',
    defaultColor: 'rgba(224, 242, 254, 0.45)',
    phValue: 7.0,
    descAr: 'مذيب نقي متعادل كيميائياً (pH = 7.0)، آمن تماماً كأساس للمحاليل المخبرية.',
    descEn: 'Pure chemically neutral solvent (pH = 7.0), completely safe base for lab solutions.'
  },
  {
    id: 'acid_hcl',
    nameAr: 'حمض الهيدروكلوريك المخفف',
    nameEn: 'Dilute Hydrochloric Acid',
    formula: 'HCl (0.1M)',
    type: 'liquid',
    defaultColor: 'rgba(254, 240, 138, 0.5)',
    phValue: 1.2,
    descAr: 'حمض مخفف آمن للمحاكاة، غني بأيونات الهيدروجين (+H)، يتفاعل مع القواعد والكربونات.',
    descEn: 'Safe dilute acid for simulation, rich in H+ ions, reacts with bases and carbonates.'
  },
  {
    id: 'base_naoh',
    nameAr: 'هيدروكسيد الصوديوم المخفف',
    nameEn: 'Dilute Sodium Hydroxide',
    formula: 'NaOH (0.1M)',
    type: 'liquid',
    defaultColor: 'rgba(240, 253, 250, 0.5)',
    phValue: 13.0,
    descAr: 'محلول قلوي غني بأيونات الهيدروكسيل (-OH)، يُعادل الأحماض ويُرسّب أملاح النحاس.',
    descEn: 'Alkaline solution rich in OH- ions, neutralizes acids and precipitates copper salts.'
  },
  {
    id: 'copper_sulfate',
    nameAr: 'محلول كبريتات النحاس الزرقاء',
    nameEn: 'Copper(II) Sulfate Solution',
    formula: 'CuSO₄',
    type: 'liquid',
    defaultColor: 'rgba(56, 189, 248, 0.75)',
    phValue: 5.5,
    descAr: 'محلول مائي ذو لون أزرق ملكي مميز، يُشكّل راسباً هلامياً سماوياً مبهراً مع القواعد.',
    descEn: 'Aqueous solution with signature royal blue color, forms sky-blue precipitate with bases.'
  },
  {
    id: 'baking_soda',
    nameAr: 'مسحوق بيكربونات الصوديوم',
    nameEn: 'Baking Soda Powder',
    formula: 'NaHCO₃',
    type: 'powder',
    defaultColor: '#ffffff',
    phValue: 8.4,
    descAr: 'ملح كربوني أبيض آمن، يُحدث فوراناً بركانياً ممتعاً وتصاعداً لفقاعات غاز CO₂ مع الحمض.',
    descEn: 'Safe white carbonate powder, produces effervescence and CO₂ bubbles when mixed with acid.'
  },
  {
    id: 'calcium_chloride',
    nameAr: 'حبيبات كلوريد الكالسيوم',
    nameEn: 'Calcium Chloride Pellets',
    formula: 'CaCl₂',
    type: 'powder',
    defaultColor: '#f1f5f9',
    phValue: 7.2,
    descAr: 'ملح ناشر للحرارة بشدة! ذوبانه في الماء يرفع درجة الحرارة فوراً بمقدار 25-35 درجة مئوية.',
    descEn: 'Highly exothermic salt! Dissolving in water instantly spikes temperature by +25-35 °C.'
  },
  {
    id: 'phenolphthalein',
    nameAr: 'كاشف الفينولفثالين',
    nameEn: 'Phenolphthalein Indicator',
    formula: 'C₂₀H₁₄O₄',
    type: 'indicator',
    defaultColor: 'rgba(244, 114, 182, 0.85)',
    phValue: 7.0,
    descAr: 'كاشف حموضة ساحر: عديم اللون في الوسط الحمضي والمتعادل، ويتحول إلى وردي ساطع في القلويات.',
    descEn: 'Magical indicator: colorless in acid/neutral, turns vivid magenta pink in alkaline.'
  },
  {
    id: 'universal_indicator',
    nameAr: 'كاشف الحموضة الشامل',
    nameEn: 'Universal pH Indicator',
    formula: 'Univ. Ind.',
    type: 'indicator',
    defaultColor: 'rgba(34, 197, 94, 0.8)',
    phValue: 7.0,
    descAr: 'مزيج كواشف يُلوّن المحلول حسب قيمة pH بدقة (أحمر حمضي، أخضر متعادل، بنفسجي قلوي).',
    descEn: 'Indicator blend coloring solution according to pH (red=acid, green=neutral, purple=base).'
  },
  {
    id: 'ice_cubes',
    nameAr: 'مكعبات ثلج نقي',
    nameEn: 'Pure Ice Cubes',
    formula: 'H₂O (صلب)',
    type: 'solid',
    defaultColor: 'rgba(186, 230, 253, 0.9)',
    phValue: 7.0,
    descAr: 'مكعبات جليد لخفض حرارة المحلول تدريجياً نحو 0 مئوية ودراسة أثر التبريد.',
    descEn: 'Ice cubes to cool beaker down towards 0 °C to observe cooling effects.'
  },
  {
    id: 'iron_filings',
    nameAr: 'برادة حديد ناعمة',
    nameEn: 'Iron Filings',
    formula: 'Fe',
    type: 'solid',
    defaultColor: '#475569',
    phValue: 7.0,
    descAr: 'جسيمات معدنية داكنة غير قابلة للذوبان، تستقر في قاع الكأس وتعمل كمحفز لتفكيك البيروكسيد.',
    descEn: 'Insoluble dark metal filings settling at the bottom, acts as catalyst for peroxide breakdown.'
  },
  {
    id: 'potassium_permanganate',
    nameAr: 'بلورات برمنغنات البوتاسيوم',
    nameEn: 'Potassium Permanganate',
    formula: 'KMnO₄',
    type: 'powder',
    defaultColor: '#7e22ce',
    phValue: 7.0,
    descAr: 'مؤكسد فائق وبلورات بنفسجية ملكية تُلوّن الماء بأرجواني مهيب وتفكك ماء الأكسجين بعنف!',
    descEn: 'Potent oxidizer with royal violet crystals coloring water deep purple and vigorously decomposing peroxide!'
  },
  {
    id: 'hydrogen_peroxide',
    nameAr: 'فوق أكسيد الهيدروجين (ماء أكسجين)',
    nameEn: 'Hydrogen Peroxide Solution',
    formula: 'H₂O₂ (6%)',
    type: 'liquid',
    defaultColor: 'rgba(224, 242, 254, 0.65)',
    phValue: 6.2,
    descAr: 'سائل غني بالأكسجين؛ بوجود محفز (برادة حديد أو برمنغنات) يتحلل فوراً برغوة وأكسجين O₂ وحرارة!',
    descEn: 'Oxygen-rich fluid; with catalyst (iron or permanganate) rapidly releases O₂ foam and heat!'
  },
  {
    id: 'silver_nitrate',
    nameAr: 'محلول نترات الفضة',
    nameEn: 'Silver Nitrate Solution',
    formula: 'AgNO₃ (0.1M)',
    type: 'liquid',
    defaultColor: 'rgba(248, 250, 252, 0.7)',
    phValue: 6.0,
    descAr: 'كاشف الكلوريد الحساس؛ عند إضافته لمحلول يحتوي كلوريد (HCl أو CaCl₂) يكوّن راسب كلوريد الفضة الأبيض الحليبي.',
    descEn: 'Chloride analytical reagent; precipitates dense milky white AgCl upon contact with Cl- ions.'
  },
  {
    id: 'ammonia_solution',
    nameAr: 'محلول الأمونيا (هيدروكسيد الأمونيوم)',
    nameEn: 'Ammonia Solution',
    formula: 'NH₄OH',
    type: 'liquid',
    defaultColor: 'rgba(238, 242, 255, 0.65)',
    phValue: 11.5,
    descAr: 'قاعدة مميزة؛ عند إضافتها لمحلول النحاس تحوّله إلى معقد النحاس الأميني الملكي ذو اللون الأزرق النيلي الساحر!',
    descEn: 'Base reagent; reacts with copper to form the stunning deep royal navy tetraamminecopper(II) complex!'
  },
  {
    id: 'sodium_metal',
    nameAr: 'قطعة صوديوم فلزي نشط',
    nameEn: 'Active Sodium Metal (Na)',
    formula: 'Na',
    type: 'solid',
    defaultColor: '#e2e8f0',
    phValue: 14.0,
    descAr: 'فلز قلوي شديد الفعالية؛ يتفاعل بانفجار فوري مع الماء ويطلق غاز الهيدروجين وحرارة تُحدث فرقعة ولهباً أصفر ساطعاً!',
    descEn: 'Highly active alkali metal; violently detonates upon contact with water, creating an explosive H2 pop, flame, and heat!'
  },
  {
    id: 'potassium_metal',
    nameAr: 'قطعة بوتاسيوم فلزي نشط',
    nameEn: 'Active Potassium Metal (K)',
    formula: 'K',
    type: 'solid',
    defaultColor: '#e0e7ff',
    phValue: 14.0,
    descAr: 'فلز قلوي شديد الانفجار! أشد نشاطاً من الصوديوم، ينفجر في الماء فوراً بلهب بنفسجي أرجواني مبهج وموجة ضغط وفرقعة!',
    descEn: 'Highly explosive alkali metal! Detonates violently in water with a signature lilac/violet flame, shockwave, and loud pop!'
  },
  {
    id: 'magnesium_ribbon',
    nameAr: 'شريط مغنيسيوم نقي',
    nameEn: 'Pure Magnesium Ribbon (Mg)',
    formula: 'Mg',
    type: 'solid',
    defaultColor: '#cbd5e1',
    phValue: 7.0,
    descAr: 'فلز مشتعل؛ يحترق بوهج أبيض ناصع باهر وفائق السطوع مطلقاً وميضاً ضوئياً وشرراً متطايراً عند إشعاله أو تسخينه.',
    descEn: 'Combustible metal; burns with an intensely bright blinding white flare emitting radiant sparks and MgO smoke!'
  },
  {
    id: 'ethanol',
    nameAr: 'كحول الإيثانول النقي',
    nameEn: 'Pure Ethanol (Alcohol)',
    formula: 'C₂H₅OH',
    type: 'liquid',
    defaultColor: 'rgba(219, 234, 254, 0.4)',
    phValue: 7.0,
    descAr: 'وقود كحولي شفاف قابل للاشتعال، يشتعل بلهب أزرق وأصفر هادئ وجميل عند إطلاق شرارة الإشعال!',
    descEn: 'Clear flammable alcohol fuel; burns with luminous blue and orange flame when ignited by spark!'
  },
  {
    id: 'acetic_acid',
    nameAr: 'حمض الخليك المخفف (حمض الأسيتيك)',
    nameEn: 'Dilute Acetic Acid (Vinegar)',
    formula: 'CH₃COOH (0.1M)',
    type: 'liquid',
    defaultColor: 'rgba(254, 249, 195, 0.4)',
    phValue: 2.9,
    descAr: 'حمض كربوكسيلي عضوي ضعيف؛ يوضح الفرق بين الأحماض الضعيفة والأحماض القوية في التأين والتوصيل الكهربائي.',
    descEn: 'Weak organic acid demonstrating partial ionization and weak electrical conductivity compared to HCl.'
  },
  {
    id: 'strontium_chloride',
    nameAr: 'مسحوق كلوريد السترونشيوم',
    nameEn: 'Strontium Chloride',
    formula: 'SrCl₂',
    type: 'powder',
    defaultColor: '#f8fafc',
    phValue: 7.0,
    descAr: 'ملح فلزي يعطي اختبار لهب أحمر قرمزي متوهج (Crimson Red)، ويستخدم في الألعاب النارية والإشارات الضوئية.',
    descEn: 'Metal salt giving an intense brilliant crimson-red flame test emission, used in pyrotechnics and flares.'
  },
  {
    id: 'barium_chloride',
    nameAr: 'مسحوق كلوريد الباريوم',
    nameEn: 'Barium Chloride',
    formula: 'BaCl₂',
    type: 'powder',
    defaultColor: '#ffffff',
    phValue: 6.8,
    descAr: 'ملح تحليلي يعطي اختبار لهب أخضر تفاحي باهر (Apple Green)، ويكوّن راسب كبريتات الباريوم غير القابل للذوبان إطلاقاً في الأحماض.',
    descEn: 'Analytical salt producing a distinctive apple-green flame test and insoluble white barium sulfate precipitate.'
  },
  {
    id: 'zinc_granules',
    nameAr: 'حبيبات الخارصين (الزنك) الفلزي',
    nameEn: 'Metallic Zinc Granules (Zn)',
    formula: 'Zn',
    type: 'solid',
    defaultColor: '#94a3b8',
    phValue: 7.0,
    descAr: 'فلز انتقالي نشط! يتفاعل بقوة مع الأحماض القوية مطلقاً غاز الهيدروجين الذي ينفخ البالون، ويزيح النحاس والفضة ليكوّن أشجاراً بلورية!',
    descEn: 'Reactive metal! Vigorously reacts with strong acids inflating the balloon with H₂, and displaces Cu/Ag to grow crystal trees!'
  },
  {
    id: 'sulfuric_acid',
    nameAr: 'حمض الكبريتيك المركز القوي',
    nameEn: 'Concentrated Sulfuric Acid',
    formula: 'H₂SO₄ (98%)',
    type: 'liquid',
    defaultColor: 'rgba(253, 224, 71, 0.78)',
    phValue: 0.3,
    descAr: 'حمض معدني قوي جداً ونازع للماء! يتفاعل بعنف مع الخارصين، ويفحم السكر صانعاً انتفاخ ثعبان الكربون الأسود الشهير!',
    descEn: 'Ultra-strong dehydrating acid! Reacts vigorously with zinc and dehydrates sugar into a giant swelling black Carbon Snake!'
  },
  {
    id: 'nitric_acid',
    nameAr: 'حمض النيتريك المركز المؤكسد',
    nameEn: 'Concentrated Nitric Acid',
    formula: 'HNO₃ (68%)',
    type: 'liquid',
    defaultColor: 'rgba(254, 215, 170, 0.72)',
    phValue: 0.5,
    descAr: 'حمض مؤكسد قوي جداً! يذيب النحاس والخارصين فوراً مطلقاً سحابة كثيفة من غاز ثاني أكسيد النيتروجين البني (NO₂)!',
    descEn: 'Potent oxidizing strong acid! Dissolves copper and zinc while releasing dense reddish-brown NO₂ gas clouds!'
  },
  {
    id: 'sucrose_sugar',
    nameAr: 'بلورات السكروز (سكر القصب)',
    nameEn: 'Sucrose Sugar Crystals',
    formula: 'C₁₂H₂₂O₁₁',
    type: 'powder',
    defaultColor: '#fef9c3',
    phValue: 7.0,
    descAr: 'مركب كربوهيدراتي عضوي؛ عند إضافة حمض الكبريتيك المركز إليه يتفحم وينتفخ مكوناً عمود ثعبان الكربون الأسود المسامي!',
    descEn: 'Organic carbohydrate; mixing with concentrated sulfuric acid triggers dramatic exothermic Carbon Snake foam swelling!'
  },
  {
    id: 'sodium_acetate',
    nameAr: 'خلات الصوديوم فائقة التشبع (الثلج الساخن)',
    nameEn: 'Supersaturated Sodium Acetate (Hot Ice)',
    formula: 'CH₃COONa',
    type: 'powder',
    defaultColor: '#e0f2fe',
    phValue: 8.9,
    descAr: 'ملح التبلور الفوري الساحر! يتبلور لحظياً في الماء مكوناً أبراجاً بلورية إبرية بيضاء دافئة تعرف باسم "الثلج الساخن"!',
    descEn: 'Magical instant crystallization salt! Nucleates rapidly into warm needle-like crystalline towers ("Hot Ice")!'
  },
  {
    id: 'potassium_iodide',
    nameAr: 'مسحوق يوديد البوتاسيوم',
    nameEn: 'Potassium Iodide',
    formula: 'KI',
    type: 'powder',
    defaultColor: '#f8fafc',
    phValue: 7.0,
    descAr: 'يكوّن بلورات "المطر الذهبي" المتلألئة مع نترات الرصاص، ويحفز انتفاخ رغوة معجون أسنان الفيل العملاقة مع ماء الأكسجين!',
    descEn: 'Forms glittering "Golden Rain" PbI₂ crystals with lead nitrate, and triggers giant Elephant Toothpaste foam swelling with H₂O₂!'
  },
  {
    id: 'lead_nitrate',
    nameAr: 'محلول نترات الرصاص',
    nameEn: 'Lead(II) Nitrate Solution',
    formula: 'Pb(NO₃)₂',
    type: 'liquid',
    defaultColor: 'rgba(241, 245, 249, 0.65)',
    phValue: 5.2,
    descAr: 'يتفاعل مع يوديد البوتاسيوم لإنتاج تبلور المطر الذهبي البراق (PbI₂)، ومع الخارصين لتكوين شجرة الرصاص البلورية!',
    descEn: 'Reacts with KI to produce shimmering Golden Rain PbI₂ crystals, and with Zinc to grow a metallic Lead Crystal Tree!'
  },
  {
    id: 'copper_turnings',
    nameAr: 'رقائق وخراطة النحاس الأحمر',
    nameEn: 'Metallic Copper Turnings (Cu)',
    formula: 'Cu',
    type: 'solid',
    defaultColor: '#d97706',
    phValue: 7.0,
    descAr: 'فلز أحمر لامع؛ يتفاعل بشدة مع حمض النيتريك المركز مطلقاً غاز NO₂ البني ومحلولاً زمردياً، ويكوّن شجرة الفضة البلورية مع نترات الفضة!',
    descEn: 'Reddish metal; reacts vigorously with concentrated HNO₃ releasing brown NO₂ gas, and grows a Silver Crystal Tree in AgNO₃!'
  },
  {
    id: 'aluminum_powder',
    nameAr: 'حبيبات الألومنيوم الفلزي النشط',
    nameEn: 'Active Aluminum Granules (Al)',
    formula: 'Al',
    type: 'solid',
    defaultColor: '#cbd5e1',
    phValue: 7.0,
    descAr: 'فلز أمفوتيري مميز! يتفاعل بقوة مع كلٍ من الأحماض القوية والقواعد القوية (NaOH) مطلقاً غاز الهيدروجين الذي ينفخ البالون!',
    descEn: 'Amphoteric metal! Reacts vigorously with both strong acids AND strong bases (NaOH) to inflate the balloon with H₂ gas!'
  },
  {
    id: 'potassium_alum',
    nameAr: 'بلورات شب البوتاسيوم (الشبة)',
    nameEn: 'Potassium Alum Crystals',
    formula: 'KAl(SO₄)₂',
    type: 'powder',
    defaultColor: '#f0f9ff',
    phValue: 4.5,
    descAr: 'الملح الكلاسيكي لنمو البلورات الهندسية الثمانية الأوجه الشفافة والكبيرة عند تشبع المحلول وتبريده!',
    descEn: 'Classic salt for growing large, transparent geometric octahedral crystals upon saturation and cooling!'
  },
  {
    id: 'iodine_solution',
    nameAr: 'محلول اليود الكاشف اللوني',
    nameEn: 'Lugol Iodine Solution',
    formula: 'I₂ / KI',
    type: 'indicator',
    defaultColor: 'rgba(180, 83, 9, 0.9)',
    phValue: 6.5,
    descAr: 'كاشف كهرماني بني؛ يكشف عن النشا فوراً بتحويل المحلول إلى اللون الأزرق الليلي الداكن المعقد!',
    descEn: 'Amber-brown analytical indicator; instantly turns deep midnight blue-black in the presence of starch!'
  },
  {
    id: 'starch_powder',
    nameAr: 'مسحوق النشا الذواب',
    nameEn: 'Soluble Starch Powder',
    formula: '(C₆H₁₀O₅)ₙ',
    type: 'powder',
    defaultColor: '#ffffff',
    phValue: 7.0,
    descAr: 'بوليمر حيوي؛ يتحد مع اليود ليكوّن معقد النشا-اليود الأزرق الداكن الشهير الذي يختفي بالتسخين ويعود بالتبريد!',
    descEn: 'Biopolymer forming the famous deep blue-black starch-iodine complex that reversibly fades upon heating!'
  },
  {
    id: 'luminol',
    nameAr: 'محلول اللومينول المضيء كيميائياً',
    nameEn: 'Chemiluminescent Luminol',
    formula: 'C₈H₇N₃O₂',
    type: 'liquid',
    defaultColor: 'rgba(6, 182, 212, 0.78)',
    phValue: 8.5,
    descAr: 'مادة التوهج الضوئي البارد الشهيرة! عند مزجها مع ماء الأكسجين H₂O₂ ومحفز (حديد أو كلوريد حديد أو نحاس) تضيء بتوهج سيان نيون باهر!',
    descEn: 'Famous chemiluminescent reagent! Mixing with H₂O₂ and iron/copper catalyst emits brilliant cold neon-cyan light!'
  },
  {
    id: 'ferric_chloride',
    nameAr: 'محلول كلوريد الحديد الثلاثي',
    nameEn: 'Iron(III) Ferric Chloride',
    formula: 'FeCl₃',
    type: 'liquid',
    defaultColor: 'rgba(217, 119, 6, 0.85)',
    phValue: 2.0,
    descAr: 'يتفاعل مع ثيوسيانات البوتاسيوم لإنتاج "الدم الكيميائي" الأحمر القاني، ومع حديدو سيانيد البوتاسيوم لإنتاج صبغة "أزرق بروسيا" الملكية، ويحفز توهج اللومينول!',
    descEn: 'Forms dramatic blood-red complex with KSCN, royal Prussian Blue pigment with ferrocyanide, and catalyzes Luminol glow!'
  },
  {
    id: 'potassium_thiocyanate',
    nameAr: 'محلول ثيوسيانات البوتاسيوم (الدم الكيميائي)',
    nameEn: 'Potassium Thiocyanate',
    formula: 'KSCN',
    type: 'liquid',
    defaultColor: 'rgba(248, 250, 252, 0.65)',
    phValue: 7.0,
    descAr: 'كاشف الحديد الثلاثي الفائق؛ قطرات منه مع كلوريد الحديد الثلاثي FeCl₃ تحول المحلول فوراً إلى اللون الأحمر الدموي القاني [Fe(SCN)]²⁺!',
    descEn: 'Ultra-sensitive Fe³⁺ reagent; instantly reacts with FeCl₃ to form the famous dramatic blood-red [Fe(SCN)]²⁺ complex!'
  },
  {
    id: 'potassium_ferrocyanide',
    nameAr: 'بلورات حديدو سيانيد البوتاسيوم (أزرق بروسيا)',
    nameEn: 'Potassium Ferrocyanide',
    formula: 'K₄[Fe(CN)₆]',
    type: 'powder',
    defaultColor: '#fef08a',
    phValue: 7.2,
    descAr: 'ملح بلوري أصفر ليموني؛ يتفاعل فوراً مع الحديد الثلاثي FeCl₃ ليكوّن صبغة "أزرق بروسيا" التاريخية الداكنة، ومع النحاس ليكوّن غشاءً بنياً!',
    descEn: 'Lemon-yellow crystalline salt; reacts instantly with FeCl₃ to precipitate iconic deep Prussian Blue pigment!'
  },
  {
    id: 'ammonium_dichromate',
    nameAr: 'بلورات ثنائي كرومات الأمونيوم (البركان الكيميائي)',
    nameEn: 'Ammonium Dichromate Crystals',
    formula: '(NH₄)₂Cr₂O₇',
    type: 'powder',
    defaultColor: '#ea580c',
    phValue: 4.2,
    descAr: 'بلورات برتقالية متوهجة! عند تسخينها بالموقد أو الشرارة تثور كبركان فيزوف نافثةً شرراً نارياً ورماد أكسيد الكروم الأخضر الداكن المنتفخ!',
    descEn: 'Bright orange crystals! Igniting with burner/spark triggers the famous Vesuvius Volcano eruption with sparks and swelling green Cr₂O₃ ash!'
  },
  {
    id: 'cobalt_chloride',
    nameAr: 'بلورات كلوريد الكوبالت الوردي الحراري',
    nameEn: 'Thermochromic Cobalt(II) Chloride',
    formula: 'CoCl₂·6H₂O',
    type: 'powder',
    defaultColor: '#f43f5e',
    phValue: 5.8,
    descAr: 'ملح ذكي متغير اللون حرارياً وكيميائياً! لونه وردي ياقوتي في الماء البارد، ويتحول للأزرق الكوبالتي العميق بالتسخين أو إضافة حمض HCl!',
    descEn: 'Smart thermochromic salt! Rose-pink in cool water, shifting reversibly to deep cobalt blue upon heating or adding HCl!'
  },
  {
    id: 'sodium_silicate',
    nameAr: 'محلول سيليكات الصوديوم (الزجاج المائي)',
    nameEn: 'Sodium Silicate (Water Glass)',
    formula: 'Na₂SiO₃',
    type: 'liquid',
    defaultColor: 'rgba(226, 232, 240, 0.72)',
    phValue: 11.8,
    descAr: 'صانع "الحديقة الكيميائية البلورية"! عند إضافته لأملاح النحاس أو الكوبالت أو الحديد أو النيكل تنمو أبراج وشعاب بلورية ملونة ساحرة!',
    descEn: 'Creator of the "Magic Chemical Crystal Garden"! Adding metal salts grows colorful coral-like osmotic crystal towers!'
  },
  {
    id: 'iron_oxide_thermite',
    nameAr: 'مسحوق أكسيد الحديد الثلاثي (خليط الثرميت)',
    nameEn: 'Iron(III) Oxide (Thermite Powder)',
    formula: 'Fe₂O₃',
    type: 'powder',
    defaultColor: '#b91c1c',
    phValue: 7.0,
    descAr: 'المكون الأساسي لتفاعل الثرميت الأسطوري! امزجه مع حبيبات الألومنيوم Al ثم أطلق الشرارة أو شريط المغنيسيوم لمشاهدة انصهار الحديد عند 2500°C!',
    descEn: 'Core component of the legendary Thermite reaction! Mix with Aluminum Al and ignite spark/Mg to witness 2500°C incandescent molten iron!'
  },
  {
    id: 'calcium_carbide',
    nameAr: 'أحجار كربيد الكالسيوم (مُولد غاز الأسيتيلين)',
    nameEn: 'Calcium Carbide Stones',
    formula: 'CaC₂',
    type: 'solid',
    defaultColor: '#64748b',
    phValue: 12.2,
    descAr: 'يتفاعل فوراً مع الماء أو مكعبات الثلج مطلقاً غاز الأسيتيلين C₂H₂ بغزارة ينفخ البالون ويشتعل بلهب ناري ساطع فوق الجليد!',
    descEn: 'Reacts instantly with water or ice cubes to evolve flammable Acetylene gas C₂H₂ that inflates the balloon and burns over ice!'
  },
  {
    id: 'sodium_thiosulfate',
    nameAr: 'محلول ثيوكبريتات الصوديوم (الساعة اليودية)',
    nameEn: 'Sodium Thiosulfate Solution',
    formula: 'Na₂S₂O₃',
    type: 'liquid',
    defaultColor: 'rgba(241, 245, 249, 0.6)',
    phValue: 7.4,
    descAr: 'يزيل لون اليود والنشا الداكن لحظياً في "تفاعل الساعة اليودية"، ومع الأحماض يرسب الكبريت الغروي الأصفر في تجربة "غروب الشمس الكيميائي"!',
    descEn: 'Instantly bleaches dark iodine/starch in the Iodine Clock reaction, and precipitates yellow colloidal sulfur with acids!'
  },
  {
    id: 'glucose_sugar',
    nameAr: 'مسحوق الجلوكوز المختزل (سكر العنب)',
    nameEn: 'Reducing D-Glucose Powder',
    formula: 'C₆H₁₂O₆',
    type: 'powder',
    defaultColor: '#ffffff',
    phValue: 7.0,
    descAr: 'محرك تجارب الأكسدة والاختزال الشهيرة: يصنع "مرآة الفضة البراقة" مع نترات الفضة والأمونيا، ويشغل "القارورة الزرقاء" و"إشارة المرور الكيميائية"!',
    descEn: 'Powers iconic redox demos: coats glass with a "Silver Mirror" (Tollens), and drives the "Blue Bottle" & "Chemical Traffic Light"!'
  },
  {
    id: 'methylene_blue',
    nameAr: 'كاشف أزرق الميثيلين (القارورة الزرقاء)',
    nameEn: 'Methylene Blue Redox Indicator',
    formula: 'C₁₆H₁₈ClN₃S',
    type: 'indicator',
    defaultColor: 'rgba(2, 132, 199, 0.92)',
    phValue: 7.0,
    descAr: 'كاشف تجربة "القارورة الزرقاء" السحرية! يختزل مع الجلوكوز والقاعدة ليصبح شفافاً، وعند تحريك الكأس بالعصا يعود أزرق ملكياً بتفاعل الأكسجين!',
    descEn: 'Star of the "Blue Bottle Experiment"! Turns colorless with glucose + NaOH, and turns royal blue whenever stirred with oxygen!'
  },
  {
    id: 'indigo_carmine',
    nameAr: 'كاشف الإنديجو كارمين (إشارة المرور الكيميائية)',
    nameEn: 'Indigo Carmine (Traffic Light)',
    formula: 'C₁₆H₈N₂Na₂O₈S₂',
    type: 'indicator',
    defaultColor: 'rgba(79, 70, 229, 0.9)',
    phValue: 7.0,
    descAr: 'كاشف تجربة "إشارة المرور الكيميائية" الشهيرة! مع الجلوكوز وNaOH يتدرج لونه المذهل بين الأصفر الذهبي والأحمر القرمزي والأخضر الزمردي مع التحريك!',
    descEn: 'Drives the famous "Chemical Traffic Light"! With glucose + NaOH it shifts between Golden Yellow, Crimson Red, and Emerald Green when stirred!'
  },
  {
    id: 'lithium_chloride',
    nameAr: 'بلورات كلوريد الليثيوم (اللهب القرمزي الوردي)',
    nameEn: 'Lithium Chloride Crystals',
    formula: 'LiCl',
    type: 'powder',
    defaultColor: '#ffe4e6',
    phValue: 6.8,
    descAr: 'ملح فلز قلوي يمنح لهب موقد بنزن لوناً وردياً قرمزياً نيونياً ساحراً (Neon Crimson-Magenta)، ويوصل التيار الكهربائي بقوة!',
    descEn: 'Alkali salt producing a breathtaking neon crimson-magenta spectral flame test emission and strong conductivity!'
  },
  {
    id: 'nickel_sulfate',
    nameAr: 'محلول كبريتات النيكل الزمردي',
    nameEn: 'Nickel(II) Sulfate Solution',
    formula: 'NiSO₄',
    type: 'liquid',
    defaultColor: 'rgba(16, 185, 129, 0.82)',
    phValue: 5.5,
    descAr: 'محلول أخضر زمردي لعنصر انتقالي؛ يتحول للأزرق البنفسجي مع الأمونيا، ويكوّن أبراجاً زمردية في الحديقة الكيميائية البلورية مع السيليكات!',
    descEn: 'Emerald-jade transition metal solution; turns violet-blue with ammonia and grows emerald towers in Sodium Silicate!'
  },
  {
    id: 'gold_chloride',
    nameAr: 'محلول كلوريد الذهب الثلاثي (شجرة الذهب والذهب النانوي)',
    nameEn: 'Gold(III) Chloride Solution',
    formula: 'HAuCl₄',
    type: 'liquid',
    defaultColor: 'rgba(250, 204, 21, 0.88)',
    phValue: 2.5,
    descAr: 'محلول الذهب الثمين! يختزل بالخارصين أو النحاس لينبت "شجرة الذهب الخالص 24 قيراط"، ومع الجلوكوز يتحول إلى "الذهب النانوي الغروي الياقوتي"!',
    descEn: 'Precious gold solution! Reduced by Zn/Cu into a dazzling 24K Gold Crystal Tree, and by glucose into ruby-red colloidal gold nanoparticles!'
  },
  {
    id: 'ammonium_chloride',
    nameAr: 'مسحوق كلوريد الأمونيوم (التبريد الماص والدخان الأبيض)',
    nameEn: 'Ammonium Chloride Powder',
    formula: 'NH₄Cl',
    type: 'powder',
    defaultColor: '#f8fafc',
    phValue: 5.2,
    descAr: 'ملح ماص للحرارة بشدة (Endothermic)! ذوبانه في الماء يخفض درجة الحرارة فوراً بـ 18 درجة مكوناً الصقيع، وعند تسخينه يطلق سحابة دخان أبيض كثيفة!',
    descEn: 'Strongly endothermic salt! Dissolving in water plunges temperature by -18°C forming frost, and heating releases dense white NH₄Cl smoke!'
  },
  {
    id: 'tollens_reagent',
    nameAr: 'كاشف تولنز (محلول نترات الفضة الأمونياكي - مرآة الفضة)',
    nameEn: 'Tollens’ Reagent (Silver Mirror Test)',
    formula: '[Ag(NH₃)₂]OH',
    type: 'liquid',
    defaultColor: 'rgba(241, 245, 249, 0.72)',
    phValue: 10.5,
    descAr: 'الكاشف الكلاسيكي الشهير! عند إضافة الجلوكوز إليه تترسب ذرات الفضة النقية على جدار الكأس مكونة مرآة فضية حقيقية عاكسة!',
    descEn: 'Famous analytical reagent! Reacts with reducing glucose to deposit a gleaming reflective Silver Mirror on the glass beaker!'
  },
  {
    id: 'fehling_solution',
    nameAr: 'محلول فهلنج الأزرق (كاشف السكريات المختزلة)',
    nameEn: 'Fehling’s Solution (A+B)',
    formula: 'Cu²⁺ / Tartrate',
    type: 'liquid',
    defaultColor: 'rgba(29, 78, 216, 0.88)',
    phValue: 12.5,
    descAr: 'محلول ياقوتي أزرق عميق؛ يتفاعل مع الجلوكوز عند التسخين ليرسب أكسيد النحاس الأحادي Cu₂O ذا اللون الأحمر الطوبي المميز!',
    descEn: 'Deep sapphire-blue complex; reacts with glucose to precipitate brick-red Copper(I) Oxide (Cu₂O)!'
  },
  {
    id: 'oxalic_acid',
    nameAr: 'حمض الأوكساليك (مزيل الصدأ والبرمنغنات الذاتي)',
    nameEn: 'Oxalic Acid Solution',
    formula: 'H₂C₂O₄',
    type: 'liquid',
    defaultColor: 'rgba(248, 250, 252, 0.6)',
    phValue: 1.8,
    descAr: 'حمض عضوي مختزل؛ يزيل لون برمنغنات البوتاسيوم البنفسجي بتفاعل التحفيز الذاتي الشهير ويرسب الكالسيوم!',
    descEn: 'Reducing dicarboxylic acid; decolorizes purple KMnO₄ via famous autocatalysis and precipitates Calcium Oxalate!'
  }
];

interface BeakerContent {
  waterMl: number;
  acidMl: number;
  baseMl: number;
  copperSulfateMl: number;
  bakingSodaG: number;
  calciumChlorideG: number;
  phenolphthaleinDrops: number;
  universalDrops: number;
  iceCount: number;
  ironG: number;
  precipitateG: number;
  permanganateG: number;
  peroxideMl: number;
  silverNitrateMl: number;
  ammoniaMl: number;
  sodiumG: number;
  potassiumG: number;
  magnesiumG: number;
  ethanolMl: number;
  hydrogenGasMl: number;
  aceticAcidMl: number;
  strontiumG: number;
  bariumG: number;
  zincG: number;
  sulfuricAcidMl: number;
  nitricAcidMl: number;
  sucroseG: number;
  sodiumAcetateG: number;
  potassiumIodideG: number;
  leadNitrateMl: number;
  copperMetalG: number;
  aluminumG: number;
  alumG: number;
  iodineDrops: number;
  starchG: number;
  luminolMl: number;
  luminolG?: number;
  ferricChlorideMl: number;
  thiocyanateMl: number;
  potassiumThiocyanateMl?: number;
  ferrocyanideG: number;
  potassiumFerrocyanideMl?: number;
  dichromateG: number;
  ammoniumDichromateG?: number;
  cobaltChlorideG: number;
  cobaltChlorideMl?: number;
  sodiumSilicateMl: number;
  ironOxideG: number;
  ironOxideThermiteG?: number;
  calciumCarbideG: number;
  thiosulfateMl: number;
  sodiumThiosulfateMl?: number;
  glucoseG: number;
  methyleneBlueDrops: number;
  methyleneBlueMl?: number;
  indigoCarmineDrops: number;
  indigoCarmineMl?: number;
  lithiumG: number;
  nickelSulfateMl: number;
  goldChlorideMl: number;
  ammoniumChlorideG: number;
  tollensReagentMl?: number;
  fehlingMl?: number;
  oxalicAcidMl?: number;
}

export const ExperimentalLab: React.FC = () => {
  const { lang, theme, t, activeLabPreset } = useApp();
  const isDark = theme === 'dark';

  // Mode: Guided Missions vs Open Sandbox
  const [labMode, setLabMode] = useState<'open_sandbox' | 'guided'>('open_sandbox');

  // Viewport Dimension Mode: 2D Canvas (Default) vs 3D Virtual Lab
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('2d');

  // Reagent Shelf Category Filter & Search
  const [reagentCategory, setReagentCategory] = useState<'all' | 'acids_bases' | 'metals' | 'salts_crystals' | 'indicators_oxidizers'>('all');
  const [reagentSearchQuery, setReagentSearchQuery] = useState<string>('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('zinc_strong_acid_balloon');
  const [showOnlyRecipeReagents, setShowOnlyRecipeReagents] = useState<boolean>(false);

  // Interactive Tools Toggles & States
  const [burnerPower, setBurnerPower] = useState<'off' | 'low' | 'med' | 'high'>('off');
  const [isStirring, setIsStirring] = useState<boolean>(false);
  const [isThermometerActive, setIsThermometerActive] = useState<boolean>(true);
  const [isPhMeterActive, setIsPhMeterActive] = useState<boolean>(true);
  const [litmusStripDipped, setLitmusStripDipped] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [isEthanolBurning, setIsEthanolBurning] = useState<boolean>(false);
  const [isConductivityActive, setIsConductivityActive] = useState<boolean>(false);
  const [flameTestMetal, setFlameTestMetal] = useState<string>('none');
  const [isFlameTestSelectorOpen, setIsFlameTestSelectorOpen] = useState<boolean>(false);

  // Balloon Inflation, Volumetric Swelling, Crystallization, Chemiluminescence, Silver Mirror & Thermite States
  const [isBalloonAttached, setIsBalloonAttached] = useState<boolean>(false);
  const [balloonInflation, setBalloonInflation] = useState<number>(0); // 0 to 100 (grows gradually toward target)
  const balloonTargetRef = useRef<number>(0);
  const [balloonColor, setBalloonColor] = useState<string>('#ec4899');

  // Helper to trigger gradual, realistic balloon inflation over time
  const triggerGradualBalloonInflation = (addedAmount: number, color?: string, resetToStart?: boolean) => {
    setIsBalloonAttached(true);
    if (color) setBalloonColor(color);
    if (resetToStart) {
      setBalloonInflation(2);
      balloonTargetRef.current = Math.min(100, addedAmount);
    } else {
      setBalloonInflation(prev => {
        const startVal = prev < 2 ? 2 : prev;
        balloonTargetRef.current = Math.min(100, Math.max(balloonTargetRef.current, startVal) + addedAmount);
        return startVal;
      });
    }
  };
  const [swellingType, setSwellingType] = useState<'none' | 'carbon_snake' | 'elephant_foam' | 'dichromate_volcano'>('none');
  const [swellingLevel, setSwellingLevel] = useState<number>(0); // 0 to 100
  const [crystalType, setCrystalType] = useState<'none' | 'copper_blue' | 'hot_ice' | 'golden_rain' | 'silver_tree' | 'alum_clear' | 'chemical_garden' | 'gold_tree'>('none');
  const [crystalLevel, setCrystalLevel] = useState<number>(0); // 0 to 100
  const [brownGasIntensity, setBrownGasIntensity] = useState<number>(0); // 0 to 100 (NO2 brown gas)
  const [chemiluminescenceLevel, setChemiluminescenceLevel] = useState<number>(0); // 0 to 100 (Luminol cold light)
  const [silverMirrorLevel, setSilverMirrorLevel] = useState<number>(0); // 0 to 100 (Tollens silver mirror)
  const [dichromateVolcanoLevel, setDichromateVolcanoLevel] = useState<number>(0); // 0 to 100 (Cr2O3 volcano cone)
  const [thermiteLevel, setThermiteLevel] = useState<number>(0); // 0 to 100 (2500°C molten iron)
  const [whiteSmokeIntensity, setWhiteSmokeIntensity] = useState<number>(0); // 0 to 100 (NH4Cl white smoke)
  const [hasChemicalGarden, setHasChemicalGarden] = useState<boolean>(false);
  const [hasGoldTree, setHasGoldTree] = useState<boolean>(false);
  const [trafficLightStage, setTrafficLightStage] = useState<'none' | 'yellow' | 'red' | 'green'>('none');
  const [blueBottleStage, setBlueBottleStage] = useState<'none' | 'colorless' | 'blue'>('none');
  const [activeChemicalEquation, setActiveChemicalEquation] = useState<string>('H₂O(l) ⇌ H⁺(aq) + OH⁻(aq)   [pH = 7.00]');
  
  // Precision Dosage & Dispensing Controls (Every single mL controlled freely!)
  const [dispenseMode, setDispenseMode] = useState<'ml' | 'drop' | 'gram'>('ml');
  const [dispenseAmountMl, setDispenseAmountMl] = useState<number>(10); // 1-100 mL
  const [dispenseDrops, setDispenseDrops] = useState<number>(5); // 1-20 drops
  const [dispenseGrams, setDispenseGrams] = useState<number>(2); // 0.5-25 g
  const [balanceTare, setBalanceTare] = useState<number>(0);

  // Beaker Contents State
  const [content, setContent] = useState<BeakerContent>({
    waterMl: 100,
    acidMl: 0,
    baseMl: 0,
    copperSulfateMl: 0,
    bakingSodaG: 0,
    calciumChlorideG: 0,
    phenolphthaleinDrops: 0,
    universalDrops: 0,
    iceCount: 0,
    ironG: 0,
    precipitateG: 0,
    permanganateG: 0,
    peroxideMl: 0,
    silverNitrateMl: 0,
    ammoniaMl: 0,
    sodiumG: 0,
    potassiumG: 0,
    magnesiumG: 0,
    ethanolMl: 0,
    hydrogenGasMl: 0,
    aceticAcidMl: 0,
    strontiumG: 0,
    bariumG: 0,
    zincG: 0,
    sulfuricAcidMl: 0,
    nitricAcidMl: 0,
    sucroseG: 0,
    sodiumAcetateG: 0,
    potassiumIodideG: 0,
    leadNitrateMl: 0,
    copperMetalG: 0,
    aluminumG: 0,
    alumG: 0,
    iodineDrops: 0,
    starchG: 0,
    luminolMl: 0,
    ferricChlorideMl: 0,
    thiocyanateMl: 0,
    ferrocyanideG: 0,
    dichromateG: 0,
    cobaltChlorideG: 0,
    sodiumSilicateMl: 0,
    ironOxideG: 0,
    calciumCarbideG: 0,
    thiosulfateMl: 0,
    glucoseG: 0,
    methyleneBlueDrops: 0,
    indigoCarmineDrops: 0,
    lithiumG: 0,
    nickelSulfateMl: 0,
    goldChlorideMl: 0,
    ammoniumChlorideG: 0
  });

  // Physical State of the Liquid in Beaker
  const [currentTempC, setCurrentTempC] = useState<number>(23.5); // Room temp
  const [effervescenceBubbles, setEffervescenceBubbles] = useState<number>(0);
  const [dispenseAnimCounter, setDispenseAnimCounter] = useState<number>(0);
  const [dispenseInfo, setDispenseInfo] = useState<{
    count: number;
    type: 'liquid' | 'indicator' | 'solid' | 'powder';
    color: string;
  }>({ count: 0, type: 'liquid', color: '#38bdf8' });
  const [explosionEvent3D, setExplosionEvent3D] = useState<{
    id: number;
    type: 'sodium' | 'potassium' | 'magnesium' | 'hydrogen_pop' | 'spark' | 'catalytic_eruption' | 'ethanol_fire';
  } | null>(null);
  const [activeSkitteringMetal, setActiveSkitteringMetal] = useState<'none' | 'sodium' | 'potassium'>('none');
  const skitterTimeoutRef = useRef<number | null>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string>(
    lang === 'ar' ? 'المعمل جاهز للبدء. أضف المواد أو شغّل الأدوات بحرية.' : 'Lab ready. Add reagents or activate tools freely.'
  );

  // Guided missions tracking
  const [guidedMissionId, setGuidedMissionId] = useState<string>('mission_neutralization');
  const [missionComplete, setMissionComplete] = useState<boolean>(false);

  // Canvas ref for beaker rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bubbleParticlesRef = useRef<{ x: number; y: number; vy: number; radius: number; opacity: number }[]>([]);
  const steamParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; radius: number; opacity: number }[]>([]);
  const stirAngleRef = useRef<number>(0);
  const isDraggingRodRef = useRef<boolean>(false);
  const rodDragPosRef = useRef<{ x: number; y: number } | null>(null);
  const stirTimeoutRef = useRef<number | null>(null);
  const skitteringPelletsRef = useRef<Array<{ x: number; y: number; vx: number; type: 'sodium' | 'potassium'; life: number; maxLife: number }>>([]);

  // Total Volume calculation (ml)
  const totalVolumeMl = Math.min(
    250,
    content.waterMl +
      content.acidMl +
      (content.sulfuricAcidMl || 0) +
      (content.nitricAcidMl || 0) +
      content.baseMl +
      content.copperSulfateMl +
      content.peroxideMl +
      content.silverNitrateMl +
      (content.leadNitrateMl || 0) +
      content.ammoniaMl +
      content.ethanolMl +
      (content.aceticAcidMl || 0) +
      (content.luminolMl || 0) +
      (content.ferricChlorideMl || 0) +
      (content.thiocyanateMl || 0) +
      (content.potassiumThiocyanateMl || 0) +
      (content.potassiumFerrocyanideMl || 0) +
      (content.cobaltChlorideMl || 0) +
      (content.sodiumSilicateMl || 0) +
      (content.thiosulfateMl || 0) +
      (content.sodiumThiosulfateMl || 0) +
      (content.tollensReagentMl || 0) +
      (content.fehlingMl || 0) +
      (content.oxalicAcidMl || 0) +
      (content.methyleneBlueMl || 0) +
      (content.indigoCarmineMl || 0) +
      (content.nickelSulfateMl || 0) +
      (content.goldChlorideMl || 0) +
      content.iceCount * 8
  );

  // Total Mass calculation (grams): Beaker empty weight ~85g
  const emptyBeakerWeight = 85.0;
  const rawMassG =
    emptyBeakerWeight +
    totalVolumeMl * 1.0 +
    (content.sulfuricAcidMl || 0) * 0.84 +
    content.bakingSodaG +
    content.calciumChlorideG +
    content.ironG +
    content.precipitateG +
    content.permanganateG +
    content.sodiumG +
    content.potassiumG +
    content.magnesiumG +
    (content.strontiumG || 0) +
    (content.bariumG || 0) +
    (content.zincG || 0) +
    (content.sucroseG || 0) +
    (content.sodiumAcetateG || 0) +
    (content.potassiumIodideG || 0) +
    (content.copperMetalG || 0) +
    (content.aluminumG || 0) +
    (content.alumG || 0) +
    (content.starchG || 0) +
    (content.luminolG || 0) +
    (content.ferrocyanideG || 0) +
    (content.dichromateG || 0) +
    (content.ammoniumDichromateG || 0) +
    (content.cobaltChlorideG || 0) +
    (content.ironOxideG || 0) +
    (content.ironOxideThermiteG || 0) +
    (content.calciumCarbideG || 0) +
    (content.glucoseG || 0) +
    (content.lithiumG || 0) +
    (content.ammoniumChlorideG || 0) +
    content.ethanolMl * 0.79;
  const displayedWeightG = Math.max(0, rawMassG - balanceTare);

  // Electrical Conductivity Evaluation (Electrolyte Ion Dissociation)
  const conductivityGlow = React.useMemo(() => {
    if (!isConductivityActive) return 0;
    // Strong electrolytes
    const strongIons =
      content.acidMl +
      (content.sulfuricAcidMl || 0) * 2.2 +
      (content.nitricAcidMl || 0) * 2.0 +
      content.baseMl +
      content.copperSulfateMl +
      content.silverNitrateMl +
      (content.leadNitrateMl || 0) +
      content.calciumChlorideG +
      (content.potassiumIodideG || 0) +
      (content.sodiumAcetateG || 0) +
      (content.alumG || 0) +
      (content.bariumG || 0) +
      (content.strontiumG || 0) +
      (content.lithiumG || 0) * 1.5 +
      (content.ferricChlorideMl || 0) * 1.6 +
      (content.thiocyanateMl || 0) +
      (content.ferrocyanideG || 0) +
      (content.dichromateG || 0) +
      (content.cobaltChlorideG || 0) +
      (content.sodiumSilicateMl || 0) +
      (content.thiosulfateMl || 0) +
      (content.nickelSulfateMl || 0) +
      (content.goldChlorideMl || 0) +
      (content.ammoniumChlorideG || 0) * 1.4;
    // Weak electrolytes
    const weakIons = (content.aceticAcidMl || 0) + content.bakingSodaG * 0.4 + content.ammoniaMl + (content.luminolMl || 0) * 0.3;

    if (strongIons > 0) {
      return Math.min(1.0, 0.45 + strongIons * 0.04);
    }
    if (weakIons > 0) {
      return Math.min(0.40, 0.15 + weakIons * 0.02);
    }
    return 0; // Pure water, ice, ethanol, sucrose, glucose
  }, [isConductivityActive, content]);

  // Explosion, Combustion & Pour Animation Engine
  const explosionsRef = useRef<Array<{
    x: number;
    y: number;
    type: 'sodium' | 'potassium' | 'magnesium' | 'hydrogen_pop' | 'spark' | 'catalytic_eruption' | 'ethanol_fire';
    particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      radius: number;
      life: number;
      maxLife: number;
    }>;
    shockwaveRadius: number;
    maxShockwaveRadius: number;
    fireballRadius: number;
    maxFireballRadius: number;
    opacity: number;
  }>>([]);
  const screenShakeRef = useRef<number>(0);
  const flashOverlayRef = useRef<{ color: string; opacity: number } | null>(null);
  const pourAnimationRef = useRef<{
    active: boolean;
    color: string;
    sourceX: number;
    drops: Array<{ x: number; y: number; vy: number; radius: number }>;
    progress: number;
  } | null>(null);

  // Web Audio Synthetic Sound Engine (Singleton, Rich Laboratory Effects)
  const playSoundEffect = (type: LabSoundType) => {
    playLabSound(type, isSoundMuted);
  };

  const triggerExplosion = (
    type: 'sodium' | 'potassium' | 'magnesium' | 'hydrogen_pop' | 'spark' | 'catalytic_eruption' | 'ethanol_fire',
    customX?: number,
    customY?: number
  ) => {
    if (type === 'spark') {
      playSoundEffect('spark');
    } else if (type === 'potassium') {
      playSoundEffect('potassium_explosion');
    } else if (type === 'magnesium') {
      playSoundEffect('magnesium_flare');
    } else if (type === 'hydrogen_pop') {
      playSoundEffect('hydrogen_pop');
    } else if (type === 'catalytic_eruption') {
      playSoundEffect('catalytic_eruption');
    } else {
      playSoundEffect('explosion');
    }

    // Trigger 3D explosion event for LabViewer3D!
    setExplosionEvent3D(prev => ({
      id: (prev?.id || 0) + 1,
      type
    }));

    screenShakeRef.current = type === 'magnesium' ? 8 : type === 'potassium' ? 16 : type === 'spark' ? 2 : type === 'catalytic_eruption' ? 6 : 14;
    flashOverlayRef.current = {
      color: type === 'magnesium'
        ? 'rgba(255, 255, 255, 0.95)'
        : type === 'potassium'
        ? 'rgba(216, 180, 254, 0.85)'
        : type === 'catalytic_eruption'
        ? 'rgba(168, 85, 247, 0.65)'
        : 'rgba(251, 146, 60, 0.75)',
      opacity: 1.0
    };

    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 460;
    const h = canvas ? canvas.height : 345;
    const beakerBottomY = 108 + 186;
    const liquidH = Math.min(186 - 25, (totalVolumeMl / 250) * (186 - 35));
    const liquidSurfaceY = beakerBottomY - liquidH;

    const cx = customX ?? (w / 2);
    let cy = customY;
    if (cy === undefined) {
      if (type === 'magnesium') {
        cy = beakerBottomY - 14;
      } else if (type === 'sodium' || type === 'potassium' || type === 'ethanol_fire') {
        cy = totalVolumeMl > 0 ? liquidSurfaceY : beakerBottomY - 10;
      } else if (type === 'catalytic_eruption') {
        cy = totalVolumeMl > 0 ? liquidSurfaceY - 10 : beakerBottomY - 20;
      } else if (type === 'hydrogen_pop') {
        cy = totalVolumeMl > 0 ? (liquidSurfaceY + 70) / 2 : h / 2;
      } else {
        cy = h / 2 + 10;
      }
    }

    const count = type === 'magnesium' ? 75 : type === 'potassium' ? 70 : type === 'sodium' ? 65 : type === 'catalytic_eruption' ? 55 : type === 'spark' ? 25 : 45;
    const palette = type === 'magnesium'
      ? ['#ffffff', '#f8fafc', '#e2e8f0', '#38bdf8', '#fef08a']
      : type === 'potassium'
      ? ['#c084fc', '#a855f7', '#d8b4fe', '#f3e8ff', '#ffffff', '#e879f9']
      : type === 'sodium'
      ? ['#fef08a', '#f59e0b', '#ef4444', '#f97316', '#ffffff']
      : type === 'catalytic_eruption'
      ? ['#7e22ce', '#a855f7', '#ffffff', '#f3e8ff', '#c084fc']
      : type === 'ethanol_fire'
      ? ['#38bdf8', '#60a5fa', '#f59e0b', '#ef4444', '#ffffff']
      : type === 'spark'
      ? ['#38bdf8', '#93c5fd', '#ffffff', '#c084fc']
      : ['#38bdf8', '#67e8f9', '#ffffff', '#fb923c'];

    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (type === 'spark' ? 1.5 : 2.5) + Math.random() * (type === 'magnesium' ? 9.5 : type === 'potassium' ? 10.0 : 8.0);
      particles.push({
        x: cx + (Math.random() - 0.5) * 35,
        y: cy + (Math.random() - 0.5) * 15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'magnesium' ? 2.5 : type === 'catalytic_eruption' ? 4.5 : 1.5),
        color: palette[Math.floor(Math.random() * palette.length)],
        radius: (type === 'spark' ? 1.5 : 2.2) + Math.random() * 3.0,
        life: 0,
        maxLife: (type === 'spark' ? 14 : 28) + Math.random() * 30
      });
    }

    explosionsRef.current.push({
      x: cx,
      y: cy,
      type,
      particles,
      shockwaveRadius: 4,
      maxShockwaveRadius: type === 'magnesium' ? 95 : type === 'potassium' ? 150 : type === 'spark' ? 40 : 135,
      fireballRadius: 8,
      maxFireballRadius: type === 'magnesium' ? 40 : type === 'potassium' ? 85 : type === 'spark' ? 15 : 75,
      opacity: 1.0
    });
  };

  const triggerPourAnimation = (color: string) => {
    playSoundEffect('pour');
    const canvas = canvasRef.current;
    const cx = canvas ? canvas.width / 2 : 230;
    const drops = [];
    for (let i = 0; i < 5; i++) {
      drops.push({
        x: cx - 12 + Math.random() * 24,
        y: 25 + i * 14,
        vy: 4.5 + Math.random() * 2.5,
        radius: 2.5 + Math.random() * 1.5
      });
    }
    pourAnimationRef.current = {
      active: true,
      color,
      sourceX: cx,
      drops,
      progress: 0
    };
  };

  // Chemical Calculation: Unified Continuous Acid/Base Equilibrium & pH
  // Every single drop, mL, or gram of any acidic or alkaline substance dynamically shifts pH
  const totalAcidUnits =
    (content.sulfuricAcidMl || 0) * 6.5 +
    (content.nitricAcidMl || 0) * 5.5 +
    content.acidMl * 2.5 +
    (content.ferricChlorideMl || 0) * 1.8 +
    (content.goldChlorideMl || 0) * 1.6 +
    (content.aceticAcidMl || 0) * 1.2 +
    (content.dichromateG || 0) * 0.8 +
    (content.ammoniumChlorideG || 0) * 0.55 +
    content.copperSulfateMl * 0.45 +
    (content.nickelSulfateMl || 0) * 0.45 +
    (content.cobaltChlorideG || 0) * 0.40 +
    (content.alumG || 0) * 0.55 +
    (content.leadNitrateMl || 0) * 0.35 +
    content.silverNitrateMl * 0.25 +
    content.peroxideMl * 0.18 +
    (content.bariumG || 0) * 0.10;

  const totalBaseUnits =
    content.baseMl * 2.5 +
    (content.sodiumSilicateMl || 0) * 2.0 +
    (content.calciumCarbideG || 0) * 1.8 +
    content.ammoniaMl * 1.4 +
    content.bakingSodaG * 0.65 +
    (content.luminolMl || 0) * 0.55 +
    (content.sodiumAcetateG || 0) * 0.45 +
    (content.thiosulfateMl || 0) * 0.15 +
    content.calciumChlorideG * 0.08;

  const netAcidBase = totalAcidUnits - totalBaseUnits;
  const effectiveSolventScale = Math.max(0.25, content.waterMl / 100);

  let currentPh = 7.0;
  if (totalVolumeMl <= 0) {
    currentPh = 7.0;
  } else if (netAcidBase > 0.001) {
    const acidIntensity = (netAcidBase / effectiveSolventScale) + netAcidBase * 0.15;
    const rawPh = 7.0 - 1.85 * Math.log10(1 + acidIntensity * 2.8) - acidIntensity * 0.03;
    currentPh = Math.max(0.2, Math.min(6.95, rawPh));
  } else if (netAcidBase < -0.001) {
    const baseUnits = -netAcidBase;
    const baseIntensity = (baseUnits / effectiveSolventScale) + baseUnits * 0.15;
    const rawPh = 7.0 + 1.85 * Math.log10(1 + baseIntensity * 2.8) + baseIntensity * 0.03;
    currentPh = Math.max(7.05, Math.min(13.9, rawPh));
  }

  // Determine Appearance / Fluid Color in Beaker (Covers All 50 Materials & Famous Reactions!)
  const getFluidColor = () => {
    if (totalVolumeMl <= 0) return 'transparent';

    // 0a. Luminol Chemiluminescence (Brilliant Neon Cyan-Blue Cold Light Glow!)
    if (chemiluminescenceLevel > 0 || (((content.luminolMl || 0) > 0 || (content.luminolG || 0) > 0) && content.peroxideMl > 0)) {
      return 'rgba(0, 245, 212, 0.94)';
    }

    // 0b. Carbon Snake Dehydration (Black/Dark Brown caramelized sulfuric mixture)
    if (swellingType === 'carbon_snake' || ((content.sulfuricAcidMl || 0) > 0 && (content.sucroseG || 0) > 0)) {
      return 'rgba(24, 24, 27, 0.96)';
    }

    // 0c. Blood-Red Iron(III) Thiocyanate Complex [Fe(SCN)]2+
    if ((content.ferricChlorideMl || 0) > 0 && ((content.thiocyanateMl || 0) > 0 || (content.potassiumThiocyanateMl || 0) > 0)) {
      return 'rgba(153, 27, 27, 0.96)';
    }

    // 0d. Prussian Blue Pigment (FeCl3 + K4[Fe(CN)6])
    if ((content.ferricChlorideMl || 0) > 0 && ((content.ferrocyanideG || 0) > 0 || (content.potassiumFerrocyanideMl || 0) > 0)) {
      return 'rgba(30, 58, 138, 0.97)';
    }

    // 0e. Chemical Traffic Light Reaction (Glucose + NaOH + Indigo Carmine)
    if ((content.indigoCarmineDrops || 0) > 0 || (content.indigoCarmineMl || 0) > 0) {
      if ((content.glucoseG || 0) > 0 && content.baseMl > 0) {
        if (trafficLightStage === 'green') return 'rgba(16, 185, 129, 0.92)'; // Oxidized Green
        if (trafficLightStage === 'red') return 'rgba(220, 38, 38, 0.92)'; // Intermediate Crimson Red
        return 'rgba(250, 204, 21, 0.90)'; // Reduced Golden Yellow
      }
      return content.baseMl > 0 ? 'rgba(16, 185, 129, 0.88)' : 'rgba(79, 70, 229, 0.88)';
    }

    // 0f. The Blue Bottle Experiment (Glucose + NaOH + Methylene Blue)
    if ((content.methyleneBlueDrops || 0) > 0 || (content.methyleneBlueMl || 0) > 0) {
      if ((content.glucoseG || 0) > 0 && content.baseMl > 0 && blueBottleStage === 'colorless' && !isStirring) {
        return 'rgba(226, 232, 240, 0.48)'; // Reduced Colorless Leuco-Methylene Blue!
      }
      return 'rgba(2, 132, 199, 0.93)'; // Oxidized Vibrant Royal Blue!
    }

    // 0g. Faraday's Ruby-Red Colloidal Gold Nanoparticles (HAuCl4 + Glucose / Thiosulfate)
    if ((content.goldChlorideMl || 0) > 0 && ((content.glucoseG || 0) > 0 || (content.thiosulfateMl || 0) > 0 || (content.sodiumThiosulfateMl || 0) > 0)) {
      return 'rgba(190, 18, 60, 0.92)'; // Ruby-Red / Wine-Purple Plasmonic Gold!
    }

    // 0h. Fehling's / Benedict's Brick-Red Cu2O Reaction (CuSO4/Fehling + NaOH + Glucose)
    if (((content.fehlingMl || 0) > 0 || (content.copperSulfateMl > 0 && content.baseMl > 0)) && (content.glucoseG || 0) > 0) {
      return 'rgba(234, 88, 12, 0.93)'; // Brick-Red / Terracotta Cu2O
    }

    // 0i. Starch-Iodine Deep Midnight Blue-Black Complex (Cleared instantly if Thiosulfate is present!)
    if ((content.iodineDrops || 0) > 0 && (content.thiosulfateMl || 0) <= 0 && (content.sodiumThiosulfateMl || 0) <= 0) {
      if ((content.starchG || 0) > 0 && currentTempC < 75) {
        return 'rgba(15, 23, 42, 0.95)';
      }
      return 'rgba(180, 83, 9, 0.85)';
    }

    // 0j. Chemical Sunset Colloidal Sulfur (Thiosulfate + Acid)
    if (((content.thiosulfateMl || 0) > 0 || (content.sodiumThiosulfateMl || 0) > 0) && (content.acidMl > 0 || (content.sulfuricAcidMl || 0) > 0)) {
      return 'rgba(253, 224, 71, 0.90)';
    }

    // 0k. Thermochromic Cobalt(II) Chloride (Rose-Pink in cold water <-> Deep Cobalt Blue when heated or with HCl/KSCN)
    if ((content.cobaltChlorideG || 0) > 0 || (content.cobaltChlorideMl || 0) > 0) {
      if (currentTempC >= 55 || content.acidMl >= 10 || (content.thiocyanateMl || 0) > 0 || (content.potassiumThiocyanateMl || 0) > 0) {
        return 'rgba(29, 78, 216, 0.92)'; // Deep Tetrahedral Cobalt Blue [CoCl4]2-
      }
      return 'rgba(244, 63, 94, 0.85)'; // Octahedral Rose-Pink [Co(H2O)6]2+
    }

    // 0l. Dichromate Breathalyzer Redox (Orange Cr6+ -> Emerald Green Cr3+ with Ethanol)
    if ((content.dichromateG || 0) > 0 || (content.ammoniumDichromateG || 0) > 0) {
      if (content.ethanolMl > 0 || swellingType === 'dichromate_volcano' || dichromateVolcanoLevel > 0) {
        return 'rgba(21, 128, 61, 0.92)'; // Reduced Cr3+ Deep Green
      }
      return 'rgba(234, 88, 12, 0.90)'; // Dichromate Vivid Orange
    }

    // 0m. Golden Rain Lead Iodide (PbI2) Shimmering Gold Suspension
    if ((content.leadNitrateMl || 0) > 0 && (content.potassiumIodideG || 0) > 0) {
      return 'rgba(250, 204, 21, 0.88)';
    }

    // 0n. Copper + Concentrated Nitric Acid -> Emerald Green / Deep Turquoise Cu(NO3)2
    if ((content.nitricAcidMl || 0) > 0 && (content.copperMetalG || 0) > 0) {
      return 'rgba(16, 185, 129, 0.88)';
    }

    // 0o. Aqua Regia (Royal Water: Concentrated HNO3 + HCl) -> Fuming Golden-Orange
    if ((content.nitricAcidMl || 0) > 0 && content.acidMl > 0) {
      return 'rgba(245, 158, 11, 0.88)';
    }

    // 0p. Nickel Sulfate (Emerald Green, or Violet-Blue with Ammonia)
    if ((content.nickelSulfateMl || 0) > 0) {
      if (content.ammoniaMl > 0) return 'rgba(99, 102, 241, 0.90)'; // [Ni(NH3)6]2+ Violet-Blue
      return 'rgba(16, 185, 129, 0.84)'; // Emerald Green Ni2+
    }

    // 0q. Gold(III) Chloride (Royal 24K Golden Yellow)
    if ((content.goldChlorideMl || 0) > 0) {
      return 'rgba(234, 179, 8, 0.86)';
    }

    // 0r. Ferric Chloride (Warm Amber-Rust Brown)
    if ((content.ferricChlorideMl || 0) > 0) {
      return 'rgba(217, 119, 6, 0.86)';
    }

    // 0. Potassium Permanganate (Royal Deep Violet/Purple)
    if (content.permanganateG > 0) {
      return 'rgba(126, 34, 206, 0.90)';
    }

    // 0.1 Tetraamminecopper(II) Complex (Royal Deep Navy Blue)
    if (content.copperSulfateMl > 0 && content.ammoniaMl > 0) {
      return 'rgba(30, 58, 138, 0.92)';
    }

    // 0.2 Silver Chloride or Barium Sulfate or Silica Gel Precipitate (Dense Milky White Suspension)
    if (
      (content.silverNitrateMl > 0 && (content.acidMl > 0 || content.calciumChlorideG > 0 || (content.lithiumG || 0) > 0 || (content.ammoniumChlorideG || 0) > 0)) ||
      ((content.bariumG || 0) > 0 && ((content.sulfuricAcidMl || 0) > 0 || content.copperSulfateMl > 0)) ||
      ((content.sodiumSilicateMl || 0) > 0 && (content.acidMl > 0 || (content.sulfuricAcidMl || 0) > 0))
    ) {
      return 'rgba(248, 250, 252, 0.94)';
    }

    // 1. Phenolphthalein indicator effect: Turns bright magenta-pink if pH > 8.2
    if (content.phenolphthaleinDrops > 0 && currentPh >= 8.2) {
      const pinkOpacity = Math.min(0.95, 0.6 + (currentPh - 8.2) * 0.2);
      return `rgba(236, 72, 153, ${pinkOpacity})`;
    }

    // 2. Universal indicator spectrum:
    if (content.universalDrops > 0) {
      if (currentPh < 3) return 'rgba(239, 68, 68, 0.85)'; // Red
      if (currentPh < 5) return 'rgba(249, 115, 22, 0.85)'; // Orange
      if (currentPh < 6.5) return 'rgba(234, 179, 8, 0.85)'; // Yellow
      if (currentPh <= 7.5) return 'rgba(34, 197, 94, 0.85)'; // Green (Neutral)
      if (currentPh < 9) return 'rgba(6, 182, 212, 0.85)'; // Cyan
      if (currentPh < 11) return 'rgba(59, 130, 246, 0.85)'; // Blue
      return 'rgba(168, 85, 247, 0.90)'; // Violet/Purple
    }

    // 3. Copper Sulfate (CuSO4) - fades when Zinc displaces Cu2+!
    if (content.copperSulfateMl > 0) {
      if ((content.zincG || 0) > 0) {
        return 'rgba(148, 163, 184, 0.55)'; // Decolorized ZnSO4 solution after Zinc displacement
      }
      if (content.precipitateG > 0) {
        // Milky sky-blue suspension
        return 'rgba(125, 211, 252, 0.88)';
      }
      return 'rgba(37, 99, 235, 0.85)'; // Royal Blue
    }

    // 4. Distinct chemical hues for clear reagents so user clearly sees liquid state changes:
    if ((content.sulfuricAcidMl || 0) > 0) {
      return 'rgba(250, 204, 21, 0.72)'; // Oily golden concentrated sulfuric acid hue
    }
    if ((content.nitricAcidMl || 0) > 0) {
      return 'rgba(251, 146, 60, 0.68)'; // Warm amber fuming nitric acid hue
    }
    if (content.acidMl > 0 || (content.aceticAcidMl || 0) > 0) {
      return 'rgba(253, 224, 71, 0.65)'; // Warm luminous citrus/acid hue
    }
    if (content.baseMl > 0 || content.ammoniaMl > 0) {
      return 'rgba(147, 197, 253, 0.70)'; // Soft azure alkaline hue
    }
    if (content.ethanolMl > 0) {
      return 'rgba(224, 242, 254, 0.65)'; // Crisp crystal alcohol hue
    }

    // 5. Default pure water: bright crystal-clear aqua with glistening refraction
    return 'rgba(56, 189, 248, 0.70)';
  };

  // Add reagent to beaker with precise user-controlled volume/dose
  const handleAddReagent = (reagentId: string, customAmount?: number) => {
    const reg = REAGENTS.find(r => r.id === reagentId);
    if (!reg) return;

    setDispenseAnimCounter(prev => prev + 1);
    setDispenseInfo(prev => ({
      count: prev.count + 1,
      type: reg.type,
      color: reg.defaultColor.startsWith('rgba') ? '#38bdf8' : reg.defaultColor
    }));

    const isSingleDrop =
      (reg.type === 'liquid' && (customAmount === 0.6 || (customAmount === undefined && dispenseMode === 'drop'))) ||
      reg.type === 'indicator';

    if (reg.id === 'ice_cubes') {
      playSoundEffect('ice');
    } else if (isSingleDrop) {
      triggerPourAnimation(reg.defaultColor);
      playSoundEffect('drop');
    } else if (reg.type === 'liquid') {
      triggerPourAnimation(reg.defaultColor);
    } else {
      playSoundEffect('solid');
    }

    const isDropDispense = reg.type === 'liquid' && customAmount === undefined && dispenseMode === 'drop';
    const amountMl =
      customAmount !== undefined && reg.type === 'liquid'
        ? customAmount
        : isDropDispense
        ? Number((dispenseDrops * 0.6).toFixed(2))
        : dispenseAmountMl;
    const drops = customAmount !== undefined && reg.type === 'indicator' ? customAmount : dispenseDrops;
    const grams = customAmount !== undefined && (reg.type === 'solid' || reg.type === 'powder') ? customAmount : dispenseGrams;
    const doseLabelAr = isDropDispense
      ? `${dispenseDrops} ${dispenseDrops === 1 ? 'قطرة' : 'قطرات'} (${amountMl} مل)`
      : customAmount === 0.6
      ? `قطرة واحدة (0.6 مل)`
      : `${amountMl} مل`;
    const doseLabelEn = isDropDispense
      ? `${dispenseDrops} drop(s) (${amountMl} mL)`
      : customAmount === 0.6
      ? `1 drop (0.6 mL)`
      : `${amountMl} mL`;

    setContent(prev => {
      const next = { ...prev };

      if (reagentId === 'water') {
        next.waterMl = Math.min(240, next.waterMl + amountMl);
        // Check if dry alkali metals are already present in the beaker!
        if (next.potassiumG > 0) {
          triggerExplosion('potassium');
          next.potassiumG = 0;
          next.baseMl = Math.min(500, next.baseMl + 25);
          next.hydrogenGasMl = Math.min(80, next.hydrogenGasMl + 30);
          setCurrentTempC(prevT => Math.min(99, prevT + 48));
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 50));
          setLastActionMessage(t(`💥 انفجار أرجواني مذهل! لامس الماء البوتاسيوم الجاف فانفجر بلهب بنفسجي ساطع وصدمة انفجارية عنيفة!`, `💥 Spectacular violet detonation! Water touched dry potassium, exploding with vivid lilac fire & shockwave!`));
        } else if (next.sodiumG > 0) {
          triggerExplosion('sodium');
          next.sodiumG = 0;
          next.baseMl = Math.min(500, next.baseMl + 20);
          next.hydrogenGasMl = Math.min(80, next.hydrogenGasMl + 25);
          setCurrentTempC(prevT => Math.min(99, prevT + 40));
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 45));
          setActiveChemicalEquation('2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂↑ + ΔH');
          setLastActionMessage(t(`💥 انفجار عنيف! لامس الماء الصوديوم فانفجر بلهب أصفر ساطع، وصدمة انفجارية وغاز هيدروجين!`, `💥 Violent explosion! Water touched sodium, detonating with brilliant yellow flame, shockwave, and H2 gas!`));
        } else if ((next.calciumCarbideG || 0) > 0) {
          playSoundEffect('fizz');
          playSoundEffect('inflate');
          next.hydrogenGasMl = Math.min(100, next.hydrogenGasMl + 45);
          triggerGradualBalloonInflation(65, '#f97316');
          setEffervescenceBubbles(58);
          setCurrentTempC(prevT => Math.min(92, prevT + 24));
          setActiveChemicalEquation('CaC₂(s) + 2H₂O(l) → C₂H₂↑ (Acetylene Gas) + Ca(OH)₂(aq)');
          setLastActionMessage(t('🔥🫧 فوران غاز الأسيتيلين! تفاعل الماء مع كربيد الكالسيوم مطلقاً غاز الأسيتيلين القابل للاشتعال ونفخ البالون تدريجياً!', '🔥🫧 Acetylene gas evolution! Water reacted with Calcium Carbide releasing flammable C₂H₂ gas and gradually inflating the balloon!'));
        } else if ((next.cobaltChlorideMl || 0) > 0 && (next.acidMl > 0 || currentTempC > 45)) {
          setActiveChemicalEquation('[CoCl₄]²⁻(Blue) + 6H₂O(l) ⇌ [Co(H₂O)₆]²⁺(Pink) + 4Cl⁻');
          setLastActionMessage(t('🌸 إزاحة اتزان لوشاتيليه بالماء! أعاد الماء المقطر معقد الكوبالت الأزرق [CoCl₄]²⁻ إلى المعقد المائي الوردي [Co(H₂O)₆]²⁺!', '🌸 Le Chatelier Equilibrium Shift! Adding water shifted blue [CoCl₄]²⁻ back to pink [Co(H₂O)₆]²⁺!'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${doseLabelAr} من الماء المقطر بدقة.`, `Added precisely ${doseLabelEn} of distilled water.`));
        }
      } else if (reagentId === 'acid_hcl') {
        next.acidMl = Math.min(500, next.acidMl + amountMl);
        if (next.ammoniaMl > 0) {
          playSoundEffect('sizzle');
          setActiveChemicalEquation('HCl(g) + NH₃(g) → NH₄Cl(s, Dense White Smoke Cloud)');
          setLastActionMessage(t('☁️ سحابة الدخان الأبيض الكثيف الشهيرة! اتحدت أبخرة حمض الهيدروكلوريك مع الأمونيا لتكوين سحابة بيضاء من كلوريد الأمونيوم NH₄Cl!', '☁️ Iconic White Smoke Reaction! HCl and NH₃ vapors combined to form a dense white cloud of Ammonium Chloride (NH₄Cl)!'));
        } else if ((next.nitricAcidMl || 0) > 0 && ((next.goldChlorideMl || 0) > 0 || (next.copperMetalG || 0) > 0)) {
          playSoundEffect('fizz');
          setEffervescenceBubbles(55);
          setCurrentTempC(prevT => Math.min(95, prevT + 26));
          setActiveChemicalEquation('Au(s) + HNO₃ + 4HCl (Aqua Regia 1:3) → HAuCl₄(aq) + NO↑ + 2H₂O');
          setLastActionMessage(t('👑 تكوّن الماء الملكي (Aqua Regia)! مزيج حمض الهيدروكلوريك وحمض النيتريك (3:1) يذيب الذهب والمعادن النبيلة!', '👑 Aqua Regia (Royal Water) formed! The 3:1 HCl + HNO₃ mixture dissolves noble metals and gold!'));
        } else if ((next.sodiumThiosulfateMl || 0) > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 6.5);
          setEffervescenceBubbles(35);
          setActiveChemicalEquation('Na₂S₂O₃(aq) + 2HCl(aq) → S↓ (Colloidal Yellow Sunset) + SO₂↑ + 2NaCl + H₂O');
          setLastActionMessage(t('🌅 تجربة الغروب الكيميائي (تشتت تيندال)! تفاعل الحمض مع ثيوكبريتات الصوديوم مرسّباً الكبريت الغروي الأصفر الحليبي S↓!', '🌅 Famous Chemical Sunset (Disappearing Cross)! Acid reacted with Sodium Thiosulfate to precipitate milky-yellow colloidal Sulfur (S↓)!'));
        } else if ((next.cobaltChlorideMl || 0) > 0) {
          setActiveChemicalEquation('[Co(H₂O)₆]²⁺(Pink) + 4Cl⁻(HCl) ⇌ [CoCl₄]²⁻(Deep Sapphire Blue) + 6H₂O');
          setLastActionMessage(t('💙 اتزان لوشاتيليه الكيميائي! أدت زيادة أيونات الكلوريد Cl⁻ من حمض HCl إلى تحويل محلول الكوبالت الوردي إلى الأزرق الياقوتي العميق [CoCl₄]²⁻!', '💙 Le Chatelier Shift! Excess Cl⁻ ions from HCl shifted pink Cobalt(II) to deep sapphire-blue [CoCl₄]²⁻!'));
        } else if ((next.zincG || 0) > 0) {
          playSoundEffect('fizz');
          playSoundEffect('inflate');
          next.hydrogenGasMl = Math.min(100, next.hydrogenGasMl + 35);
          triggerGradualBalloonInflation(65, '#ec4899');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 45));
          setCurrentTempC(prevT => Math.min(92, prevT + 24));
          next.zincG = Math.max(0.2, (next.zincG || 0) - 1.2);
          setLastActionMessage(t(`🎈 فوران وانتفاخ تدريجي! تفاعل الخارصين Zn مع الحمض القوي مطلقاً غاز الهيدروجين H₂ الذي ينفخ البالون المطاطي تدريجياً!`, `🎈 Vigorous reaction & Gradual Balloon Inflation! Zinc reacted with acid releasing H₂ gas and inflating the balloon!`));
        } else if ((next.aluminumG || 0) > 0) {
          playSoundEffect('fizz');
          playSoundEffect('inflate');
          next.hydrogenGasMl = Math.min(100, next.hydrogenGasMl + 40);
          triggerGradualBalloonInflation(70, '#38bdf8');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 48));
          setCurrentTempC(prevT => Math.min(95, prevT + 28));
          setLastActionMessage(t(`🎈 تفاعل الألومنيوم النشط مع الحمض مطلقاً غاز الهيدروجين بغزارة فانتفخ البالون تدريجياً وارتفعت الحرارة!`, `🎈 Active Aluminum reacted with acid, evolving abundant H₂ gas and gradually inflating the balloon!`));
        } else if (next.magnesiumG > 0) {
          playSoundEffect('fizz');
          playSoundEffect('inflate');
          next.hydrogenGasMl = Math.min(80, next.hydrogenGasMl + 30);
          triggerGradualBalloonInflation(55, '#ec4899');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 40));
          setCurrentTempC(prevT => Math.min(92, prevT + 22));
          next.magnesiumG = Math.max(0, next.magnesiumG - 2);
          setLastActionMessage(t(`تفاعل شريط المغنيسيوم مع الحمض بفوران عنيف وتصاعد كثيف لغاز الهيدروجين H₂ وانتفاخ البالون تدريجياً!`, `Magnesium reacted vigorously with acid releasing abundant flammable H2 gas and gradually inflating the balloon!`));
        } else if (next.bakingSodaG > 0.5) {
          playSoundEffect('fizz');
          playSoundEffect('inflate');
          triggerGradualBalloonInflation(55, '#10b981');
          setEffervescenceBubbles(prevB => Math.min(45, prevB + 25));
          next.bakingSodaG = Math.max(0, next.bakingSodaG - amountMl * 0.2);
          setLastActionMessage(t('🎈 تفاعل فوران نشط! تفاعل الحمض مع الكربونات وأطلق غاز CO₂ الذي ينفخ البالون تدريجياً!', '🎈 Vigorous effervescence! Acid reacted with carbonate releasing CO₂ gas and gradually inflating the balloon.'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${doseLabelAr} من حمض الهيدروكلوريك HCl. زادت الحموضة وانخفضت قيمة pH.`, `Added ${doseLabelEn} dilute HCl. Acidity increased and pH decreased.`));
        }
      } else if (reagentId === 'base_naoh') {
        next.baseMl = Math.min(500, next.baseMl + amountMl);
        if ((next.indigoCarmineMl || 0) > 0 && (next.glucoseG || 0) > 0) {
          setTrafficLightStage('yellow');
          setActiveChemicalEquation('Indigo Carmine + Glucose + OH⁻ → Reduced Yellow ⇌ Red ⇌ Green (with O₂)');
          setLastActionMessage(t('🚦 تفعلت تجربة إشارة المرور الكيميائية (اللون الأصفر)! حرّك المحلول بالعصا الزجاجية ليتحول إلى الأحمر القرمزي ثم الأخضر الزمردي!', '🚦 Chemical Traffic Light activated (Yellow)! Stir with the Glass Rod to oxidize it to Crimson Red and Emerald Green!'));
        } else if ((next.methyleneBlueMl || 0) > 0 && (next.glucoseG || 0) > 0) {
          setBlueBottleStage('colorless');
          setActiveChemicalEquation('Methylene Blue (Blue) + Glucose + OH⁻ → Leucomethylene Blue (Colorless)');
          setLastActionMessage(t('🧪 تفعلت تجربة القارورة الزرقاء السحرية (Blue Bottle)! اختفى اللون الأزرق وأصبح المحلول شفافاً — حرّك بالعصا الزجاجية لإعادة اللون الأزرق الملكي!', '🧪 Blue Bottle Magic activated! Solution turned colorless — stir with the Glass Rod to turn it Royal Blue again!'));
        } else if ((next.ferricChlorideMl || 0) > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 5.5);
          setActiveChemicalEquation('FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃↓ (Reddish-Brown Precipitate) + 3NaCl');
          setLastActionMessage(t('تفاعل ترسيب! تكوّن راسب هيدروكسيد الحديديك Fe(OH)₃ الجيلاتيني البني المحمر!', 'Precipitation reaction! Formed reddish-brown gelatinous Iron(III) Hydroxide Fe(OH)₃ precipitate!'));
        } else if ((next.aluminumG || 0) > 0) {
          playSoundEffect('fizz');
          playSoundEffect('inflate');
          next.hydrogenGasMl = Math.min(100, next.hydrogenGasMl + 35);
          triggerGradualBalloonInflation(65, '#f59e0b');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 42));
          setCurrentTempC(prevT => Math.min(92, prevT + 25));
          setLastActionMessage(t('🎈 تفاعل أمفوتيري مذهل! تفاعل الألومنيوم مع هيدروكسيد الصوديوم القوي مطلقاً غاز الهيدروجين الذي ينفخ البالون تدريجياً!', '🎈 Amphoteric reaction! Aluminum reacted with strong NaOH base releasing H₂ gas and gradually inflating the balloon!'));
        } else if (next.copperSulfateMl > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 4.5);
          setLastActionMessage(t('تفاعل ترسيب! تكوّن راسب أزرق سماوي هلامي من هيدروكسيد النحاس Cu(OH)₂.', 'Precipitation reaction! Sky-blue gelatinous Cu(OH)₂ precipitate formed.'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${doseLabelAr} من هيدروكسيد الصوديوم NaOH. ارتفعت قيمة pH.`, `Added ${doseLabelEn} dilute NaOH. pH increased.`));
        }
      } else if (reagentId === 'copper_sulfate') {
        next.copperSulfateMl = Math.min(500, next.copperSulfateMl + amountMl);
        if ((next.sodiumSilicateMl || 0) > 0) {
          playSoundEffect('crystallize');
          setHasChemicalGarden(true);
          setCrystalType('copper_blue');
          setCrystalLevel(100);
          setActiveChemicalEquation('CuSO₄(s) + Na₂SiO₃(aq) → CuSiO₃ (Blue Osmotic Silicate Crystal Towers)');
          setLastActionMessage(t('🌿 نمت أبراج وصواعد بلورية زرقاء ساحرة من سيليكات النحاس داخل الحديقة الكيميائية!', '🌿 Magical blue copper silicate osmotic towers sprouted inside the Chemical Crystal Garden!'));
        } else if ((next.potassiumFerrocyanideMl || 0) > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 6.0);
          setActiveChemicalEquation('2CuSO₄(aq) + K₄[Fe(CN)₆](aq) → Cu₂[Fe(CN)₆]↓ (Hatchett’s Brown) + 2K₂SO₄');
          setLastActionMessage(t('تكوّن راسب حديدو سيانيد النحاس Cu₂[Fe(CN)₆] البني الشوكولاتي (صبغة هاتشيت الشهيرة للأغشية شبه المنفذة)!', 'Formed chocolate-brown Copper(II) Ferrocyanide Cu₂[Fe(CN)₆] precipitate!'));
        } else if ((next.zincG || 0) > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 5.0);
          setCurrentTempC(prevT => Math.min(85, prevT + 14));
          setLastActionMessage(t('🔄 تفاعل إزاحة أحادية (أكسدة واختزال)! أزاح الخارصين Zn أيونات النحاس فترسّب النحاس الأحمر واختفى اللون الأزرق تدريجياً!', '🔄 Single Displacement Redox! Zinc displaced Cu²⁺ ions, precipitating reddish copper metal and fading the blue solution!'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${doseLabelAr} من كبريتات النحاس الزرقاء CuSO₄ (يمكنك تبلورها بالتبريد أو مفاعلتها مع الخارصين!).`, `Added ${doseLabelEn} of royal blue CuSO₄ solution (crystallize by cooling or react with Zinc!).`));
        }
      } else if (reagentId === 'baking_soda') {
        next.bakingSodaG = Math.min(40, next.bakingSodaG + grams);
        if (next.acidMl > 0 || (next.sulfuricAcidMl || 0) > 0 || (next.nitricAcidMl || 0) > 0 || (next.aceticAcidMl || 0) > 0) {
          playSoundEffect('fizz');
          playSoundEffect('inflate');
          triggerGradualBalloonInflation(60, '#10b981');
          setEffervescenceBubbles(prevB => Math.min(55, prevB + 35));
          setLastActionMessage(t('🎈 فوران فوري وتصاعد فقاعات غاز ثاني أكسيد الكربون (CO₂) وانتفاخ البالون تدريجياً!', '🎈 Instant effervescence, CO₂ bubbles streaming upward, and gradual balloon inflation!'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${grams} جم مسحوق بيكربونات الصوديوم إلى الكأس.`, `Added ${grams} g baking soda powder into the beaker.`));
        }
      } else if (reagentId === 'calcium_chloride') {
        next.calciumChlorideG = Math.min(40, next.calciumChlorideG + grams);
        playSoundEffect('sizzle');
        setCurrentTempC(prevT => Math.min(88, prevT + grams * 3.5));
        setLastActionMessage(t(`ذوبان ناشر للحرارة (Exothermic)! أُضيف ${grams} جم CaCl₂ وارتفعت الحرارة.`, `Exothermic dissolution! Added ${grams} g CaCl₂ and temperature rose.`));
      } else if (reagentId === 'phenolphthalein') {
        next.phenolphthaleinDrops += drops;
        setLastActionMessage(t(`أُضيفت ${drops} قطرات من كاشف الفينولفثالين. سيتحول للوردي في القلويات (pH > 8.2).`, `Added ${drops} drops of phenolphthalein indicator. Will turn pink in alkaline pH > 8.2.`));
      } else if (reagentId === 'universal_indicator') {
        next.universalDrops += drops;
        setLastActionMessage(t(`أُضيفت ${drops} قطرات من كاشف الحموضة الشامل. تلوّن المحلول وفق مقياس pH.`, `Added ${drops} drops of universal indicator. Colored according to pH.`));
      } else if (reagentId === 'ice_cubes') {
        next.iceCount = Math.min(8, next.iceCount + 2);
        setCurrentTempC(prevT => Math.max(1.0, prevT - 7.5));
        if ((next.sodiumAcetateG || 0) > 0) {
          playSoundEffect('crystallize');
          setCrystalType('hot_ice');
          setCrystalLevel(prevC => Math.min(100, prevC + 65));
          setLastActionMessage(t('💎 تبلور فوري مذهل! حفّز التبريد تبلور خلات الصوديوم وتشكلت أبراج بلورية إبرية بيضاء!', '💎 Instant Crystallization! Cooling nucleated sodium acetate into tall crystalline needle towers!'));
        } else if (next.copperSulfateMl >= 15) {
          playSoundEffect('crystallize');
          setCrystalType('copper_blue');
          setCrystalLevel(prevC => Math.min(100, prevC + 55));
          setLastActionMessage(t('💎 تبلور كبريتات النحاس! مع انخفاض الحرارة بالثلج بدأت البلورات الهندسية الزرقاء اللامعة بالنمو في قاع الكأس!', '💎 Copper Sulfate Crystallization! Cooling triggered geometric royal-blue crystal growth at the bottom!'));
        } else if ((next.alumG || 0) > 0) {
          playSoundEffect('crystallize');
          setCrystalType('alum_clear');
          setCrystalLevel(prevC => Math.min(100, prevC + 60));
          setLastActionMessage(t('💎 تبلور شب البوتاسيوم! نمت بلورات ثمانية الأوجه شفافة وكبيرة بفعل التبريد والتشبع!', '💎 Potassium Alum Crystallization! Large transparent octahedral crystals grew upon cooling!'));
        } else {
          setLastActionMessage(t('أُضيفت مكعبات ثلج. انخفضت درجة حرارة الكأس نحو الصفر المئوي.', 'Added ice cubes. Beaker temperature dropped towards 0 °C.'));
        }
      } else if (reagentId === 'iron_filings') {
        next.ironG = Math.min(30, next.ironG + grams);
        if (next.peroxideMl > 0) {
          playSoundEffect('fizz');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 30));
          setCurrentTempC(prevT => Math.min(88, prevT + 18));
          setLastActionMessage(t('تحفيز حديدي! قامت برادة الحديد بتفكيك H₂O₂ وتصاعدت فقاعات الأكسجين الساخن.', 'Iron catalysis! Iron filings rapidly catalyzed H₂O₂ into hot oxygen bubbles.'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم برادة حديد داكنة استقرت في قاع الكأس كمادة راسبة.`, `Added ${grams} g iron filings settling at the bottom as sediment.`));
        }
      } else if (reagentId === 'potassium_permanganate') {
        next.permanganateG = Math.min(25, next.permanganateG + grams);
        if ((next.oxalicAcidMl || 0) > 0) {
          playSoundEffect('fizz');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 45));
          setCurrentTempC(prevT => Math.min(88, prevT + 16));
          setActiveChemicalEquation('2MnO₄⁻(Purple) + 5H₂C₂O₄ + 6H⁺ --(Mn²⁺ Autocatalysis)--> 2Mn²⁺(Colorless) + 10CO₂↑ + 8H₂O');
          setLastActionMessage(t('⚡ تفاعل التحفيز الذاتي الشهير (Autocatalysis)! اختزل حمض الأوكساليك برمنغنات البوتاسيوم البنفسجية إلى أيونات المنغنيز عديمة اللون مع فوران CO₂!', '⚡ Famous Autocatalytic Redox! Oxalic acid reduced purple KMnO₄ into colorless Mn²⁺ ions with brisk CO₂ fizzing!'));
        } else if ((next.glucoseG || 0) > 0 && next.baseMl > 0) {
          setActiveChemicalEquation('MnO₄⁻(Purple) --(e⁻)--> MnO₄²⁻(Green) --(e⁻)--> MnO₂(Yellow/Brown)');
          setLastActionMessage(t('🦎 تجربة الحرباء الكيميائية الشهيرة (Chemical Chameleon)! اختزل الجلوكوز القلوي البرمنغنات البنفسجية مروراً بالأخضر الزمردي (MnO₄²⁻) حتى الأصفر الذهبي!', '🦎 Famous Chemical Chameleon! Alkaline glucose reduced purple Permanganate through emerald-green Manganate (MnO₄²⁻) to golden-amber!'));
        } else if (next.peroxideMl > 0) {
          triggerExplosion('catalytic_eruption');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 50));
          setCurrentTempC(prevT => Math.min(98, prevT + 38));
          setActiveChemicalEquation('2KMnO₄ + 3H₂O₂ → 2MnO₂↓ + 3O₂↑ + 2KOH + 2H₂O');
          setLastActionMessage(t('🔮 ثوران بركاني تحفيزي فائق! برمنغنات البوتاسيوم فككت ماء الأكسجين بعنف مع سحابة أكسجين ساخنة ورغوة بركانية أرجوانية!', '🔮 Dramatic catalytic eruption! KMnO₄ decomposed peroxide with hot oxygen smoke and surging purple foam!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم بلورات برمنغنات البوتاسيوم KMnO₄ وتلوّن المحلول بالأرجواني الملكي.`, `Added ${grams} g royal purple potassium permanganate crystals.`));
        }
      } else if (reagentId === 'hydrogen_peroxide') {
        next.peroxideMl = Math.min(100, next.peroxideMl + amountMl);
        if ((next.luminolG || 0) > 0) {
          playSoundEffect('spark');
          setChemiluminescenceLevel(100);
          setActiveChemicalEquation('C₈H₇N₃O₂ (Luminol) + 2H₂O₂ → 3-APA*²⁻ → N₂↑ + ℏω (425 nm Blue Glow)');
          setLastActionMessage(t('✨ توهج اللومينول الجنائي الساحر (Chemiluminescence)! أضاء المحلول بوهج أزرق نيوني بارد ساطع فور ملامسة بيروكسيد الهيدروجين للومينول!', '✨ Magical Luminol Chemiluminescence! Solution lit up with a brilliant 425nm neon-blue glow upon adding H₂O₂!'));
        } else if ((next.potassiumIodideG || 0) > 0) {
          triggerExplosion('catalytic_eruption');
          playSoundEffect('inflate');
          setSwellingType('elephant_foam');
          setSwellingLevel(prevS => Math.min(100, prevS + 85));
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 55));
          setCurrentTempC(prevT => Math.min(96, prevT + 35));
          setLastActionMessage(t('🌋 انتفاخ رغوة معجون أسنان الفيل العملاقة! حفّز يوديد البوتاسيوم تفكك ماء الأكسجين فانتفخت الرغوة الملونة وملأت الكأس!', '🌋 Giant Elephant Toothpaste Foam Inflation! KI catalyzed H₂O₂ into a massive swelling foam tower!'));
        } else if (next.permanganateG > 0) {
          triggerExplosion('catalytic_eruption');
          setSwellingType('elephant_foam');
          setSwellingLevel(prevS => Math.min(100, prevS + 75));
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 50));
          setCurrentTempC(prevT => Math.min(98, prevT + 38));
          setLastActionMessage(t('🔮 ثوران بركاني تحفيزي فائق! برمنغنات البوتاسيوم فككت ماء الأكسجين بعنف مع سحابة أكسجين ساخنة ورغوة بركانية أرجوانية منتفخة!', '🔮 Dramatic catalytic eruption! KMnO₄ decomposed peroxide with hot oxygen smoke and surging purple foam!'));
        } else if (next.ironG > 0) {
          playSoundEffect('fizz');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 35));
          setCurrentTempC(prevT => Math.min(92, prevT + 25));
          setLastActionMessage(t('تفاعل تفكك فوري لماء الأكسجين بفعل المحفز! فقاعات غاز الأكسجين النقي وارتفاع الحرارة.', 'Immediate catalytic peroxide breakdown! Pure O₂ gas foaming and heat surge.'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${amountMl} مل من فوق أكسيد الهيدروجين H₂O₂ (ماء الأكسجين).`, `Added ${amountMl} mL of hydrogen peroxide H₂O₂ solution.`));
        }
      } else if (reagentId === 'silver_nitrate') {
        next.silverNitrateMl = Math.min(100, next.silverNitrateMl + amountMl);
        if ((next.zincG || 0) > 0 || (next.copperMetalG || 0) > 0) {
          playSoundEffect('crystallize');
          setCrystalType('silver_tree');
          setCrystalLevel(prevC => Math.min(100, prevC + 75));
          next.precipitateG = Math.min(35, next.precipitateG + 5.5);
          setLastActionMessage(t('🌲💎 تبلور شجرة الفضة المعدنية! اختُزلت أيونات الفضة على سطح الفلز ونمت بلورات فضية متفرعة براقة!', '🌲💎 Metallic Silver Crystal Tree! Silver ions reduced onto the metal, growing glittering dendritic silver crystals!'));
        } else if (next.acidMl > 0 || next.calciumChlorideG > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 4.5);
          setLastActionMessage(t('كشف إيجابي عن أيونات الكلوريد! تكوّن راسب كلوريد الفضة AgCl الأبيض الحليبي.', 'Positive chloride test! Dense milky white silver chloride AgCl precipitate formed.'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${amountMl} مل من نترات الفضة AgNO₃.`, `Added ${amountMl} mL of silver nitrate AgNO₃.`));
        }
      } else if (reagentId === 'ammonia_solution') {
        next.ammoniaMl = Math.min(100, next.ammoniaMl + amountMl);
        if (next.copperSulfateMl > 0) {
          playSoundEffect('precipitate');
          setLastActionMessage(t('تكوّن معقد النحاس الرباعي الأميني الملكي [Cu(NH₃)₄]²⁺ بلون أزرق نيلي ساحر!', 'Formed royal dark navy tetraamminecopper(II) complex [Cu(NH₃)₄]²⁺!'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${amountMl} مل من محلول الأمونيا NH₄OH (ارتفعت قلوية المحلول pH).`, `Added ${amountMl} mL of ammonia solution NH₄OH (pH increased).`));
        }
      } else if (reagentId === 'sodium_metal') {
        // Metallic Sodium Addition
        if (next.waterMl > 0) {
          // Instant violent detonation and skittering on water in both 3D and 2D!
          playSoundEffect('sizzle');
          triggerExplosion('sodium');
          setActiveSkitteringMetal('sodium');
          if (skitterTimeoutRef.current) clearTimeout(skitterTimeoutRef.current);
          skitterTimeoutRef.current = window.setTimeout(() => {
            triggerExplosion('sodium');
            setActiveSkitteringMetal('none');
          }, 1600);

          const canvas = canvasRef.current;
          const w = canvas ? canvas.width : 460;
          skitteringPelletsRef.current.push({
            x: w / 2 + (Math.random() - 0.5) * 40,
            y: 0,
            vx: (Math.random() > 0.5 ? 1 : -1) * (2.2 + Math.random() * 2.0),
            type: 'sodium',
            life: 0,
            maxLife: 80
          });
          next.baseMl = Math.min(100, next.baseMl + grams * 5); // strong NaOH production
          next.hydrogenGasMl = Math.min(80, next.hydrogenGasMl + grams * 6); // H2 gas release
          setCurrentTempC(prevT => Math.min(99, prevT + grams * 18));
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 45));
          setLastActionMessage(t('💥 قطعة الصوديوم تجري بعنف فوق سطح الماء وتشتعل بلهب أصفر متطاير وتطلق فقاعات الهيدروجين!', '💥 Sodium pellet skitters violently across water surface, blazing with yellow fire and releasing H2!'));
        } else {
          next.sodiumG = Math.min(20, next.sodiumG + grams);
          setLastActionMessage(t(`أُضيفت ${grams} جم قطعة صوديوم فلزي نقية استقرت في الكأس الجاف. أضف الماء لمشاهدة الانفجار الفوري!`, `Added ${grams} g active sodium metal to dry beaker. Add water to trigger detonation!`));
        }
      } else if (reagentId === 'potassium_metal') {
        // Metallic Potassium Addition (Even more violent than sodium!)
        if (next.waterMl > 0) {
          playSoundEffect('sizzle');
          triggerExplosion('potassium');
          setActiveSkitteringMetal('potassium');
          if (skitterTimeoutRef.current) clearTimeout(skitterTimeoutRef.current);
          skitterTimeoutRef.current = window.setTimeout(() => {
            triggerExplosion('potassium');
            setActiveSkitteringMetal('none');
          }, 1400);

          const canvas = canvasRef.current;
          const w = canvas ? canvas.width : 460;
          skitteringPelletsRef.current.push({
            x: w / 2 + (Math.random() - 0.5) * 30,
            y: 0,
            vx: (Math.random() > 0.5 ? 1 : -1) * (3.0 + Math.random() * 2.5),
            type: 'potassium',
            life: 0,
            maxLife: 60
          });
          next.baseMl = Math.min(100, next.baseMl + grams * 6);
          next.hydrogenGasMl = Math.min(80, next.hydrogenGasMl + grams * 8);
          setCurrentTempC(prevT => Math.min(99, prevT + grams * 24));
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 50));
          setLastActionMessage(t('💥 انفجار أرجواني عنيف! البوتاسيوم يتفاعل بشراسة فائقة مع الماء مطلِقاً لهباً بنفسجياً مهيباً وفرقعة!', '💥 Violent Lilac Detonation! Potassium explodes fiercely with signature violet flames and loud pops!'));
        } else {
          next.potassiumG = Math.min(20, next.potassiumG + grams);
          setLastActionMessage(t(`أُضيفت ${grams} جم قطعة بوتاسيوم فلزي نشط في الكأس الجاف. أضف الماء لمشاهدة الانفجار الأرجواني الفوري!`, `Added ${grams} g active potassium metal to dry beaker. Add water to trigger violet explosion!`));
        }
      } else if (reagentId === 'magnesium_ribbon') {
        // Magnesium Ribbon Addition
        next.magnesiumG = Math.min(25, next.magnesiumG + grams);
        if (burnerPower !== 'off' || currentTempC >= 70) {
          // Intense combustion flare!
          triggerExplosion('magnesium');
          next.magnesiumG = 0;
          next.precipitateG = Math.min(40, next.precipitateG + grams * 2.5); // MgO white ash
          setCurrentTempC(prevT => Math.min(99, prevT + 38));
          setLastActionMessage(t('🔥 وميض ساطع مهيب! اشتعل شريط المغنيسيوم بوهج أبيض فائق السطوع يحاكي احتراق الألعاب النارية!', '🔥 Blinding white magnesium combustion flare! Emitted radiant sparks and white MgO ash!'));
        } else if (next.acidMl > 0) {
          playSoundEffect('fizz');
          next.hydrogenGasMl = Math.min(80, next.hydrogenGasMl + grams * 7);
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 40));
          setCurrentTempC(prevT => Math.min(90, prevT + 18));
          setLastActionMessage(t('تفاعل شريط المغنيسيوم مع الحمض بفوران سريع وتصاعد كثيف لغاز الهيدروجين H₂ القابل للاشتعال!', 'Magnesium reacted with acid releasing rapid fizzing and flammable hydrogen H2 gas!'));
        } else {
          setLastActionMessage(t(`أُضيف ${grams} جم شريط مغنيسيوم نقي إلى الكأس. أشعل موقد بنزن أو أطلق الشرارة الكهربائية لإشعاله بوهج أبيض!`, `Added ${grams} g magnesium ribbon. Ignite burner or electric spark to trigger white flare!`));
        }
      } else if (reagentId === 'ethanol') {
        next.ethanolMl = Math.min(100, next.ethanolMl + amountMl);
        setLastActionMessage(t(`تمت إضافة ${amountMl} مل من الإيثانول النقي القابل للاشتعال. استخدم قادح الشرارة أو الموقد لإشعاله!`, `Added ${amountMl} mL flammable pure ethanol. Strike spark to ignite!`));
      } else if (reagentId === 'acetic_acid') {
        next.aceticAcidMl = Math.min(500, (next.aceticAcidMl || 0) + amountMl);
        if (next.bakingSodaG > 0.5) {
          playSoundEffect('fizz');
          setEffervescenceBubbles(prevB => Math.min(45, prevB + 22));
          next.bakingSodaG = Math.max(0, next.bakingSodaG - amountMl * 0.15);
          setLastActionMessage(t('تفاعل بركاني كلاسيكي ممتع! تفاعل حمض الخليك مع كربونات الصوديوم وتصاعد غاز CO₂.', 'Classic effervescent reaction! Acetic acid effervesced with baking soda releasing CO₂ gas.'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من حمض الخليك CH₃COOH. زادت حموضة المحلول وانخفضت قيمة pH.`, `Added ${doseLabelEn} dilute acetic acid CH3COOH. Acidity increased and pH decreased.`));
        }
      } else if (reagentId === 'strontium_chloride') {
        next.strontiumG = (next.strontiumG || 0) + grams;
        setFlameTestMetal('strontium');
        setLastActionMessage(t(`أُضيف ${grams} جم كلوريد السترونشيوم SrCl₂. تم تفعيل اختبار اللهب القرمزي المتوهج (Crimson Red)!`, `Added ${grams} g SrCl2. Enabled brilliant crimson-red flame test!`));
      } else if (reagentId === 'barium_chloride') {
        next.bariumG = (next.bariumG || 0) + grams;
        setFlameTestMetal('barium');
        if (next.copperSulfateMl > 0 || (next.sulfuricAcidMl || 0) > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 6.0);
          setLastActionMessage(t('تفاعل ترسيب تحليلي! تكوّن راسب كبريتات الباريوم BaSO₄ الأبيض غير الذواب، مع انبعاث لهب أخضر تفاحي!', 'Precipitation test! Formed dense white BaSO4 precipitate and enabled apple-green flame!'));
        } else {
          setLastActionMessage(t(`أُضيف ${grams} جم كلوريد الباريوم BaCl₂ (يُعطي اختبار لهب أخضر تفاحي باهر).`, `Added ${grams} g BaCl2 (gives distinctive apple-green flame).`));
        }
      } else if (reagentId === 'zinc_granules') {
        next.zincG = Math.min(40, (next.zincG || 0) + grams);
        if ((next.nitricAcidMl || 0) > 0) {
          playSoundEffect('fizz');
          playSoundEffect('sizzle');
          setBrownGasIntensity(prevG => Math.min(100, prevG + 85));
          triggerGradualBalloonInflation(70, '#d97706');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 50));
          setCurrentTempC(prevT => Math.min(98, prevT + 34));
          setLastActionMessage(t('☁️🎈 تفاعل عنيف للخارصين مع حمض النيتريك المركز! تصاعدت سحابة كثيفة من غاز NO₂ البني الساخن وانتفخ البالون تدريجياً!', '☁️🎈 Vigorous Zinc + Concentrated HNO₃ reaction! Dense reddish-brown NO₂ gas clouds erupted and gradually inflated the balloon!'));
        } else if ((next.sulfuricAcidMl || 0) > 0 || next.acidMl > 0) {
          playSoundEffect('fizz');
          playSoundEffect('inflate');
          next.hydrogenGasMl = Math.min(100, next.hydrogenGasMl + grams * 12);
          triggerGradualBalloonInflation(70, '#ec4899');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 50));
          setCurrentTempC(prevT => Math.min(95, prevT + 26));
          setLastActionMessage(t('🎈 فوران وانتفاخ تدريجي! تفاعل الخارصين Zn بقوة مع الحمض مطلقاً غاز الهيدروجين H₂ الذي ينفخ البالون المطاطي تدريجياً!', '🎈 Instant effervescence & Gradual Balloon Inflation! Zinc reacted with acid releasing abundant H₂ gas and inflating the balloon!'));
        } else if (next.copperSulfateMl > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 5.0);
          setCurrentTempC(prevT => Math.min(82, prevT + 12));
          setLastActionMessage(t('🔄 إزاحة النحاس بالخارصين (Zn + CuSO₄ → ZnSO₄ + Cu↓)! ترسّب النحاس الأحمر على حبيبات الخارصين وبهت لون المحلول الأزرق!', '🔄 Zinc-Copper Displacement! Reddish metallic copper plated onto the zinc granules while the blue CuSO₄ faded!'));
        } else if (next.silverNitrateMl > 0 || (next.leadNitrateMl || 0) > 0) {
          playSoundEffect('crystallize');
          setCrystalType('silver_tree');
          setCrystalLevel(prevC => Math.min(100, prevC + 80));
          next.precipitateG = Math.min(35, next.precipitateG + 5.0);
          setLastActionMessage(t('🌲💎 نمو شجرة البلورات الفلزية! قام الخارصين باختزال أيونات الفلز لتنمو بلورات إبرية فضية براقة في المحلول!', '🌲💎 Metallic Crystal Tree Growth! Zinc reduced metal ions into shimmering dendritic crystal needles!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم حبيبات الخارصين (الزنك Zn). أضف حمض الكبريتيك أو الهيدروكلوريك لنفخ البالون بغاز الهيدروجين، أو كبريتات النحاس للإزاحة!`, `Added ${grams} g Zinc granules (Zn). Add strong acid to inflate balloon with H₂, or CuSO₄ for redox displacement!`));
        }
      } else if (reagentId === 'sulfuric_acid') {
        next.sulfuricAcidMl = Math.min(200, (next.sulfuricAcidMl || 0) + amountMl);
        if ((next.sucroseG || 0) > 0) {
          playSoundEffect('sizzle');
          playSoundEffect('inflate');
          triggerExplosion('catalytic_eruption');
          setSwellingType('carbon_snake');
          setSwellingLevel(95);
          next.precipitateG = Math.min(40, next.precipitateG + 18);
          setEffervescenceBubbles(55);
          setCurrentTempC(98.5);
          setLastActionMessage(t('🐍🔥 انتفاخ ثعبان الكربون الأسود الشهير! قام حمض الكبريتيك المركز بنزع الماء من السكر فتفحم وانتفخ عمود الكربون المسامي عالياً مع البخار!', '🐍🔥 Famous Carbon Snake Swelling! Concentrated H₂SO₄ dehydrated sucrose into a giant rising black porous carbon column!'));
        } else if ((next.zincG || 0) > 0 || (next.aluminumG || 0) > 0 || next.magnesiumG > 0 || next.ironG > 0) {
          playSoundEffect('fizz');
          playSoundEffect('inflate');
          next.hydrogenGasMl = Math.min(100, next.hydrogenGasMl + 45);
          triggerGradualBalloonInflation(75, '#ec4899');
          setEffervescenceBubbles(55);
          setCurrentTempC(prevT => Math.min(98, prevT + 35));
          setLastActionMessage(t('🎈🔥 تفاعل شديد للحمض القوي H₂SO₄ مع الفلز! انطلق غاز الهيدروجين بغزارة عالية فانتفخ البالون تدريجياً وارتفعت الحرارة بشدة!', '🎈🔥 Intense strong H₂SO₄ + metal reaction! Rapid H₂ gas evolution gradually inflated the balloon with strong exothermic heat!'));
        } else if ((next.bariumG || 0) > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 8.0);
          setLastActionMessage(t('تكوّن فوري لراسب كبريتات الباريوم BaSO₄ الأبيض الكثيف الذي لا يذوب في الأحماض القوية!', 'Instant dense white Barium Sulfate BaSO₄ precipitate formed!'));
        } else {
          setCurrentTempC(prevT => Math.min(90, prevT + amountMl * 1.2)); // Exothermic dilution of H2SO4 in water!
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من حمض الكبريتيك المركز القوي H₂SO₄ (ذوبان ناشر للحرارة وانخفاض حاد في pH إلى حمضي قوي جداً!).`, `Added ${doseLabelEn} concentrated H₂SO₄ (exothermic dilution & sharp drop to ultra-strong acidic pH!).`));
        }
      } else if (reagentId === 'nitric_acid') {
        next.nitricAcidMl = Math.min(200, (next.nitricAcidMl || 0) + amountMl);
        if ((next.copperMetalG || 0) > 0 || (next.zincG || 0) > 0 || next.ironG > 0) {
          playSoundEffect('fizz');
          playSoundEffect('sizzle');
          setBrownGasIntensity(90);
          triggerGradualBalloonInflation(65, '#d97706');
          setEffervescenceBubbles(55);
          setCurrentTempC(prevT => Math.min(98, prevT + 36));
          setLastActionMessage(t('☁️🔥 تفاعل أكسدة قوي جداً! أذاب حمض النيتريك المركز الفلز وتصاعدت سحب كثيفة من غاز ثاني أكسيد النيتروجين البني (NO₂) وتلوّن المحلول بالأخضر الزمردي!', '☁️🔥 Powerful oxidizing reaction! Concentrated HNO₃ dissolved the metal, erupting dense reddish-brown NO₂ gas clouds and turning emerald green!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من حمض النيتريك المركز المؤكسد HNO₃. أضف النحاس أو الخارصين لمشاهدة سحب غاز NO₂ البنية!`, `Added ${doseLabelEn} concentrated HNO₃. Add Copper or Zinc to witness dense brown NO₂ gas clouds!`));
        }
      } else if (reagentId === 'sucrose_sugar') {
        next.sucroseG = Math.min(50, (next.sucroseG || 0) + grams);
        if ((next.sulfuricAcidMl || 0) > 0) {
          playSoundEffect('sizzle');
          playSoundEffect('inflate');
          triggerExplosion('catalytic_eruption');
          setSwellingType('carbon_snake');
          setSwellingLevel(95);
          next.precipitateG = Math.min(40, next.precipitateG + 18);
          setEffervescenceBubbles(55);
          setCurrentTempC(98.5);
          setLastActionMessage(t('🐍🔥 انتفاخ ثعبان الكربون الأسود! قام حمض الكبريتيك المركز بنزع جزيئات الماء من السكر فتفحم وانتفخ عمود الكربون الأسود عالياً!', '🐍🔥 Carbon Snake Swelling! Concentrated H₂SO₄ dehydrated sucrose sugar into a towering porous black carbon column!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم بلورات السكروز (السكر). أضف حمض الكبريتيك المركز H₂SO₄ لمشاهدة تجربة انتفاخ ثعبان الكربون الأسود!`, `Added ${grams} g Sucrose sugar crystals. Add Concentrated Sulfuric Acid H₂SO₄ to trigger the Carbon Snake swelling!`));
        }
      } else if (reagentId === 'sodium_acetate') {
        next.sodiumAcetateG = Math.min(50, (next.sodiumAcetateG || 0) + grams);
        playSoundEffect('crystallize');
        setCrystalType('hot_ice');
        setCrystalLevel(prevC => Math.min(100, prevC + 80));
        setCurrentTempC(prevT => Math.min(58, prevT + 18)); // Exothermic crystallization ("Hot Ice")
        setLastActionMessage(t('❄️💎 تبلور فوري مذهل (الثلج الساخن)! تبلورت خلات الصوديوم فائقة التشبع لحظياً إلى أبراج بلورية بيضاء مع انبعاث حرارة دافئة!', '❄️💎 Instant "Hot Ice" Crystallization! Supersaturated sodium acetate rapidly crystallized into needle towers while releasing exothermic warmth!'));
      } else if (reagentId === 'potassium_iodide') {
        next.potassiumIodideG = Math.min(40, (next.potassiumIodideG || 0) + grams);
        if ((next.leadNitrateMl || 0) > 0) {
          playSoundEffect('crystallize');
          setCrystalType('golden_rain');
          setCrystalLevel(95);
          next.precipitateG = Math.min(35, next.precipitateG + 6.5);
          setLastActionMessage(t('✨💎 تبلور المطر الذهبي الساحر (Golden Rain)! تفاعل يوديد البوتاسيوم مع نترات الرصاص مكوناً بلورات يوديد الرصاص PbI₂ الذهبية المتلألئة!', '✨💎 Shimmering "Golden Rain" Crystallization! KI reacted with Pb(NO₃)₂ to form glittering golden hexagonal PbI₂ crystals!'));
        } else if (next.peroxideMl > 0) {
          triggerExplosion('catalytic_eruption');
          playSoundEffect('inflate');
          setSwellingType('elephant_foam');
          setSwellingLevel(95);
          setEffervescenceBubbles(60);
          setCurrentTempC(prevT => Math.min(96, prevT + 34));
          setLastActionMessage(t('🌋🎈 انتفاخ رغوة معجون أسنان الفيل العملاقة! حفّز يوديد البوتاسيوم تفكك H₂O₂ فانتفخت الرغوة الكثيفة وملأت الكأس!', '🌋🎈 Giant Elephant Toothpaste Foam Swelling! KI catalyzed peroxide breakdown into a massive expanding foam tower!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم يوديد البوتاسيوم KI. أضف نترات الرصاص لمشاهدة تبلور المطر الذهبي، أو ماء الأكسجين لانتفاخ رغوة الفيل!`, `Added ${grams} g Potassium Iodide KI. Add Lead Nitrate for Golden Rain crystals, or H₂O₂ for Elephant Toothpaste foam!`));
        }
      } else if (reagentId === 'lead_nitrate') {
        next.leadNitrateMl = Math.min(150, (next.leadNitrateMl || 0) + amountMl);
        if ((next.potassiumIodideG || 0) > 0) {
          playSoundEffect('crystallize');
          setCrystalType('golden_rain');
          setCrystalLevel(95);
          next.precipitateG = Math.min(35, next.precipitateG + 6.5);
          setLastActionMessage(t('✨💎 تبلور المطر الذهبي الساحر! تشكلت رقائق وبلورات يوديد الرصاص PbI₂ الذهبية البراقة تتساقط داخل الكأس!', '✨💎 Shimmering Golden Rain Crystallization! Glittering golden PbI₂ crystal flakes formed and drifted through the beaker!'));
        } else if ((next.zincG || 0) > 0) {
          playSoundEffect('crystallize');
          setCrystalType('silver_tree');
          setCrystalLevel(85);
          next.precipitateG = Math.min(35, next.precipitateG + 5.5);
          setLastActionMessage(t('🌲💎 نمو شجرة الرصاص البلورية! أزاح الخارصين أيونات الرصاص فتشكلت بلورات معدنية متفرعة!', '🌲💎 Metallic Lead Crystal Tree! Zinc displaced Pb²⁺ ions into branching metallic crystal needles!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من نترات الرصاص Pb(NO₃)₂. أضف يوديد البوتاسيوم KI لمشاهدة تبلور المطر الذهبي!`, `Added ${doseLabelEn} Lead(II) Nitrate. Add KI to trigger Golden Rain crystallization!`));
        }
      } else if (reagentId === 'copper_turnings') {
        next.copperMetalG = Math.min(40, (next.copperMetalG || 0) + grams);
        if ((next.nitricAcidMl || 0) > 0) {
          playSoundEffect('fizz');
          playSoundEffect('sizzle');
          setBrownGasIntensity(95);
          triggerGradualBalloonInflation(65, '#d97706');
          setEffervescenceBubbles(55);
          setCurrentTempC(prevT => Math.min(96, prevT + 32));
          setLastActionMessage(t('☁️🔥 تفاعل النحاس مع حمض النيتريك المركز! تحول المحلول للأخضر الزمردي وتصاعدت سحب غاز NO₂ البنية الكثيفة!', '☁️🔥 Copper + Concentrated HNO₃! Solution turned deep emerald green while dense brown NO₂ gas clouds billowed upward!'));
        } else if (next.silverNitrateMl > 0) {
          playSoundEffect('crystallize');
          setCrystalType('silver_tree');
          setCrystalLevel(85);
          next.copperSulfateMl = Math.min(100, next.copperSulfateMl + 15);
          setLastActionMessage(t('🌲💎 تبلور شجرة الفضة على النحاس! نمت بلورات الفضة البراقة وتلوّن المحلول بالأزرق نتيجة تكون أيونات النحاس!', '🌲💎 Silver Crystal Tree on Copper! Glittering silver crystals grew while the solution turned blue!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم رقائق النحاس الفلزي Cu. أضف حمض النيتريك المركز HNO₃ لمشاهدة تفاعل الغاز البني NO₂!`, `Added ${grams} g Copper turnings Cu. Add Concentrated Nitric Acid HNO₃ to witness brown NO₂ gas evolution!`));
        }
      } else if (reagentId === 'aluminum_powder') {
        next.aluminumG = Math.min(40, (next.aluminumG || 0) + grams);
        if ((next.ironOxideThermiteG || 0) > 0 && (burnerPower !== 'off' || next.magnesiumG > 0 || currentTempC >= 70)) {
          triggerExplosion('sodium');
          setThermiteLevel(100);
          next.precipitateG = Math.min(40, next.precipitateG + 16);
          setCurrentTempC(99.5);
          setActiveChemicalEquation('Fe₂O₃(s) + 2Al(s) --(2500°C)--> 2Fe(l, Molten Iron) + Al₂O₃(s) + 851.5 kJ');
          setLastActionMessage(t('🔥🌋 تفاعل الثرميت الأسطوري (2500°C)! اختزل الألومنيوم أكسيد الحديديك منتجاً حديداً منصهراً متوهجاً وشلالاً من الشرر!', '🔥🌋 2500°C Thermite Reaction! Aluminum reduced Iron(III) Oxide into white-hot molten iron!'));
        } else if ((next.ironOxideThermiteG || 0) > 0) {
          setLastActionMessage(t('أُضيفت حبيبات الألومنيوم (Al) إلى أكسيد الحديديك! اضغط الآن زر (شرارة إشعال ⚡) أو شغّل الموقد لإطلاق تفاعل الثرميت المنصهر (2500°C)!', 'Added Aluminum granules to Iron(III) Oxide! Now click Spark ⚡ or turn on the Burner to ignite the 2500°C Thermite Reaction!'));
        } else if ((next.sulfuricAcidMl || 0) > 0 || next.acidMl > 0 || next.baseMl > 0) {
          playSoundEffect('fizz');
          playSoundEffect('inflate');
          next.hydrogenGasMl = Math.min(100, next.hydrogenGasMl + 45);
          triggerGradualBalloonInflation(70, '#38bdf8');
          setEffervescenceBubbles(55);
          setCurrentTempC(prevT => Math.min(96, prevT + 30));
          setLastActionMessage(t('🎈🔥 فوران وانتفاخ تدريجي! تفاعل الألومنيوم النشط وأطلق غاز الهيدروجين H₂ الذي ينفخ البالون المطاطي تدريجياً!', '🎈🔥 Vigorous reaction & Gradual Balloon Inflation! Active aluminum released abundant H₂ gas inflating the balloon!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم حبيبات الألومنيوم Al. يتفاعل مع الأحماض القوية والقواعد القوية (NaOH) لينفخ البالون بغاز الهيدروجين، أو مع أكسيد الحديديك والشرارة لتفاعل الثرميت!`, `Added ${grams} g Aluminum granules Al. Reacts with strong acids/bases to inflate balloon, or with Fe₂O₃ + Spark for Thermite!`));
        }
      } else if (reagentId === 'potassium_alum') {
        next.alumG = Math.min(50, (next.alumG || 0) + grams);
        playSoundEffect('crystallize');
        setCrystalType('alum_clear');
        setCrystalLevel(prevC => Math.min(100, prevC + 65));
        setLastActionMessage(t('💎 بدأ تشكل ونمو بلورات شب البوتاسيوم الثمانية الأوجه الشفافة! أضف مكعبات الثلج أو اضغط زر "تحفيز التبلور" لتكبير البلورات!', '💎 Octahedral Potassium Alum crystals started growing! Add ice cubes or click "Crystallize" to maximize crystal size!'));
      } else if (reagentId === 'iodine_solution') {
        next.iodineDrops = (next.iodineDrops || 0) + drops;
        if ((next.starchG || 0) > 0) {
          playSoundEffect('precipitate');
          setLastActionMessage(t('🧪 كشف اليود والنشا الإيجابي! تحول لون المحلول فوراً إلى الأزرق الليلي الداكن المعقد!', '🧪 Positive Iodine-Starch Test! Solution instantly turned deep midnight blue-black!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${drops} قطرات من محلول اليود الكهرماني. أضف مسحوق النشا لمشاهدة تفاعل اللون الأزرق الليلي الداكن!`, `Added ${drops} drops of amber Iodine solution. Add Starch powder to trigger the deep blue-black complex!`));
        }
      } else if (reagentId === 'starch_powder') {
        next.starchG = Math.min(30, (next.starchG || 0) + grams);
        if ((next.iodineDrops || 0) > 0) {
          playSoundEffect('precipitate');
          setActiveChemicalEquation('I₂(aq) + I⁻ + Starch Helix → [Starch-I₃⁻] (Deep Blue-Black Complex)');
          setLastActionMessage(t('🧪 تكوّن معقد النشا-اليود الأزرق الليلي الداكن الشهير! (جرب تسخينه بالموقد أو إضافة ثيوكبريتات الصوديوم لإزالة اللون فجأة!).', '🧪 Formed the famous deep blue-black Starch-Iodine complex! (Try heating or adding Sodium Thiosulfate to decolorize it!).'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم مسحوق النشا الذواب. أضف قطرات اليود للكشف اللوني!`, `Added ${grams} g soluble starch powder. Add Iodine drops for colorimetric detection!`));
        }
      } else if (reagentId === 'luminol') {
        next.luminolG = Math.min(30, (next.luminolG || 0) + grams);
        if (next.peroxideMl > 0 || (next.ferricChlorideMl || 0) > 0) {
          playSoundEffect('spark');
          setChemiluminescenceLevel(100);
          setActiveChemicalEquation('C₈H₇N₃O₂ + 2H₂O₂ --(Fe³⁺)--> 3-APA*²⁻ → 3-APA²⁻ + N₂↑ + ℏω (425nm Blue Light)');
          setLastActionMessage(t('✨ ضيائية كيميائية باهرة (Chemiluminescence)! تأكسد اللومينول بوجود البيروكسيد والحفاز مطلقاً توهجاً ضوئياً أزرق ساطعاً في الظلام بدون حرارة!', '✨ Brilliant Chemiluminescence! Luminol oxidized with peroxide and catalyst, emitting dazzling 425nm neon-blue light without heat!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم من مسحوق اللومينول الجنائي (C₈H₇N₃O₂). أضف ماء الأكسجين (H₂O₂) وكلوريد الحديديك (FeCl₃) لإطلاق التوهج الضوئي الأزرق الساحر!`, `Added ${grams} g Luminol powder. Add Hydrogen Peroxide (H₂O₂) & Ferric Chloride (FeCl₃) to trigger brilliant blue chemiluminescence!`));
        }
      } else if (reagentId === 'ferric_chloride') {
        next.ferricChlorideMl = Math.min(200, (next.ferricChlorideMl || 0) + amountMl);
        if ((next.luminolG || 0) > 0 && next.peroxideMl > 0) {
          playSoundEffect('spark');
          setChemiluminescenceLevel(100);
          setActiveChemicalEquation('C₈H₇N₃O₂ + 2H₂O₂ --(FeCl₃)--> 3-APA*²⁻ → N₂↑ + ℏω (425nm Neon-Blue Glow)');
          setLastActionMessage(t('✨ حفّز كلوريد الحديديك تفاعل اللومينول مع ماء الأكسجين فأنار الكأس بوهج أزرق نيوني مبهر!', '✨ Ferric Chloride catalyzed the Luminol + H₂O₂ reaction into a dazzling neon-blue glow!'));
        } else if ((next.potassiumThiocyanateMl || 0) > 0) {
          playSoundEffect('precipitate');
          setActiveChemicalEquation('FeCl₃(aq) + KSCN(aq) ⇌ [Fe(SCN)]²⁺(aq, Deep Blood-Red) + KCl(aq)');
          setLastActionMessage(t('🩸 تفاعل الدم الكيميائي الشهير! اتحدت أيونات الحديديك (Fe³⁺) مع الثيوسيانات (SCN⁻) لتكوين معقد ثيوسيانات الحديديك ذي اللون الأحمر الدموي القاتم!', '🩸 Famous Fake Blood Reaction! Fe³⁺ ions complexed with Thiocyanate (SCN⁻) to form deep blood-red [Fe(SCN)]²⁺!'));
        } else if ((next.potassiumFerrocyanideMl || 0) > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 7.0);
          setActiveChemicalEquation('4FeCl₃(aq) + 3K₄[Fe(CN)₆](aq) → Fe₄[Fe(CN)₆]₃↓ (Prussian Blue) + 12KCl');
          setLastActionMessage(t('🎨 تفاعل أزرق بروسيا الشهير (Prussian Blue)! تفاعل كلوريد الحديديك مع حديدو سيانيد البوتاسيوم مكوّناً الصبغة الملكية الزرقاء الداكنة!', '🎨 Famous Prussian Blue Synthesis! Ferric chloride reacted with Potassium Ferrocyanide to form deep Prussian Blue pigment!'));
        } else if ((next.sodiumSilicateMl || 0) > 0) {
          playSoundEffect('crystallize');
          setHasChemicalGarden(true);
          setCrystalType('copper_blue');
          setCrystalLevel(100);
          setActiveChemicalEquation('FeCl₃(s) + Na₂SiO₃(aq) → Fe₂(SiO₃)₃ (Amber-Brown Osmotic Crystal Towers)');
          setLastActionMessage(t('🌿 نمت أبراج بلورية كهرمانية وبنية ساحرة لسيليكات الحديد داخل الحديقة الكيميائية ثلاثية الأبعاد!', '🌿 Magical amber-brown iron silicate crystal towers sprouted inside the 3D Chemical Garden!'));
        } else if (next.baseMl > 0 || next.ammoniaMl > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 5.5);
          setActiveChemicalEquation('FeCl₃(aq) + 3OH⁻(aq) → Fe(OH)₃↓ (Reddish-Brown Gel) + 3Cl⁻');
          setLastActionMessage(t('تكوّن راسب هيدروكسيد الحديديك Fe(OH)₃ الجيلاتيني البني المحمر في الوسط القاعدي!', 'Formed reddish-brown gelatinous Iron(III) Hydroxide Fe(OH)₃ precipitate!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من كلوريد الحديديك الأصفر الكهرماني FeCl₃. جربه مع ثيوسيانات البوتاسيوم (الدم الكيميائي) أو حديدو سيانيد البوتاسيوم (أزرق بروسيا) أو اللومينول!`, `Added ${doseLabelEn} Ferric Chloride (FeCl₃). Combine with KSCN (Fake Blood), K₄[Fe(CN)₆] (Prussian Blue), or Luminol!`));
        }
      } else if (reagentId === 'potassium_thiocyanate') {
        next.potassiumThiocyanateMl = Math.min(200, (next.potassiumThiocyanateMl || 0) + amountMl);
        if ((next.ferricChlorideMl || 0) > 0) {
          playSoundEffect('precipitate');
          setActiveChemicalEquation('Fe³⁺(aq) + SCN⁻(aq) ⇌ [Fe(SCN)]²⁺(aq, Deep Blood-Red Complex)');
          setLastActionMessage(t('🩸 تفاعل الدم الكيميائي الشهير! تحول المحلول فوراً إلى اللون الأحمر الدموي القاتم نتيجة تكون معقد ثيوسيانات الحديديك [Fe(SCN)]²⁺!', '🩸 Iconic Blood-Red Complex! Solution immediately turned intense blood-red due to [Fe(SCN)]²⁺ formation!'));
        } else if ((next.cobaltChlorideMl || 0) > 0) {
          setActiveChemicalEquation('Co²⁺(aq) + 4SCN⁻(aq) → [Co(SCN)₄]²⁻(aq, Deep Cobalt Blue)');
          setLastActionMessage(t('تكوّن معقد رباعي ثيوسيانات الكوبالت [Co(SCN)₄]²⁻ ذو اللون الأزرق الياقوتي العميق!', 'Formed deep sapphire-blue Tetrathiocyanatocobaltate(II) complex [Co(SCN)₄]²⁻!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من ثيوسيانات البوتاسيوم (KSCN). أضف كلوريد الحديديك FeCl₃ لمشاهدة تفاعل الدم الكيميائي الشهير!`, `Added ${doseLabelEn} Potassium Thiocyanate (KSCN). Add Ferric Chloride for the famous Fake Blood reaction!`));
        }
      } else if (reagentId === 'potassium_ferrocyanide') {
        next.potassiumFerrocyanideMl = Math.min(200, (next.potassiumFerrocyanideMl || 0) + amountMl);
        if ((next.ferricChlorideMl || 0) > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 7.5);
          setActiveChemicalEquation('4FeCl₃ + 3K₄[Fe(CN)₆] → Fe₄[Fe(CN)₆]₃↓ (Prussian Blue) + 12KCl');
          setLastActionMessage(t('🎨 تفاعل أزرق بروسيا الشهير! تكوّن راسب غروي كثيف بلون أزرق بروسيا الملكي الداكن Fe₄[Fe(CN)₆]₃!', '🎨 Famous Prussian Blue Reaction! Formed rich royal Prussian Blue Fe₄[Fe(CN)₆]₃ precipitate!'));
        } else if (next.copperSulfateMl > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 6.0);
          setActiveChemicalEquation('2CuSO₄ + K₄[Fe(CN)₆] → Cu₂[Fe(CN)₆]↓ (Hatchett’s Brown) + 2K₂SO₄');
          setLastActionMessage(t('تكوّن راسب حديدو سيانيد النحاس Cu₂[Fe(CN)₆] البني الشوكولاتي (صبغة هاتشيت الشهيرة)!', 'Formed chocolate-brown Copper(II) Ferrocyanide Cu₂[Fe(CN)₆] precipitate!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من حديدو سيانيد البوتاسيوم K₄[Fe(CN)₆]. أضف كلوريد الحديديك لتصنيع صبغة أزرق بروسيا التاريخية!`, `Added ${doseLabelEn} Potassium Ferrocyanide. Add Ferric Chloride to synthesize Prussian Blue!`));
        }
      } else if (reagentId === 'ammonium_dichromate') {
        next.ammoniumDichromateG = Math.min(50, (next.ammoniumDichromateG || 0) + grams);
        if (burnerPower !== 'off' || currentTempC >= 60) {
          triggerExplosion('magnesium');
          setDichromateVolcanoLevel(100);
          next.precipitateG = Math.min(40, next.precipitateG + 14);
          setCurrentTempC(98.0);
          setActiveChemicalEquation('(NH₄)₂Cr₂O₇(s) --(Δ)--> Cr₂O₃(s, Green Volcanic Cone) + N₂↑ + 4H₂O(g) + ΔH');
          setLastActionMessage(t('🌋 ثوران بركان ثنائي كرومات الأمونيوم الشهير! تفككت البلورات البرتقالية حرارياً بقوة مطلقةً شرارات متوهجة وغاز النيتروجين ومخروطاً بركانياً من رماد أكسيد الكروم الأخضر Cr₂O₃!', '🌋 Famous Ammonium Dichromate Volcano Eruption! Orange crystals thermally decomposed with glowing sparks and a green Cr₂O₃ volcanic cone!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم بلورات ثنائي كرومات الأمونيوم البرتقالية (NH₄)₂Cr₂O₇. شغّل الموقد أو اضغط (شرارة إشعال ⚡) لإطلاق بركان فيزوف الكيميائي!`, `Added ${grams} g orange Ammonium Dichromate crystals. Turn on the burner or click Spark ⚡ to erupt the Chemical Volcano!`));
        }
      } else if (reagentId === 'cobalt_chloride') {
        next.cobaltChlorideMl = Math.min(200, (next.cobaltChlorideMl || 0) + amountMl);
        if ((next.sodiumSilicateMl || 0) > 0) {
          playSoundEffect('crystallize');
          setHasChemicalGarden(true);
          setCrystalType('copper_blue');
          setCrystalLevel(100);
          setActiveChemicalEquation('CoCl₂(aq) + Na₂SiO₃(aq) → CoSiO₃ (Cobalt-Blue/Violet Osmotic Crystal Corals)');
          setLastActionMessage(t('🌿 نمت شعب مرجانية بلورية زرقاء وبنفسجية خلابة من سيليكات الكوبالت داخل الحديقة الكيميائية!', '🌿 Stunning cobalt-blue and violet osmotic crystal corals grew inside the Chemical Garden!'));
        } else if (next.acidMl > 0 || currentTempC >= 55) {
          setActiveChemicalEquation('[Co(H₂O)₆]²⁺(Pink) + 4Cl⁻ + Heat ⇌ [CoCl₄]²⁻(Deep Blue) + 6H₂O');
          setLastActionMessage(t('🌡️ اتزان لوشاتيليه الحراري اللوني! بوجود الكلوريد أو التسخين تحول معقد الكوبالت الوردي [Co(H₂O)₆]²⁺ إلى المعقد الأزرق الداكن [CoCl₄]²⁻ (أضف ثلجاً أو ماءً لإعادته للوردي)!', '🌡️ Le Chatelier Thermochromic Shift! Heat/Chloride shifted pink [Co(H₂O)₆]²⁺ to deep blue [CoCl₄]²⁻ (add Ice or Water to shift back to pink)!'));
        } else {
          setActiveChemicalEquation('[Co(H₂O)₆]²⁺(Pink, Cold) + 4Cl⁻ ⇌ [CoCl₄]²⁻(Blue, Hot) + 6H₂O');
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من كلوريد الكوبالت الوردي CoCl₂. سخّن المحلول بالموقد أو أضف حمض HCl لتحويله للأزرق الياقوتي وفق مبدأ لوشاتيليه!`, `Added ${doseLabelEn} pink Cobalt(II) Chloride. Heat with the burner or add HCl to shift the equilibrium to deep blue!`));
        }
      } else if (reagentId === 'tollens_reagent') {
        next.tollensReagentMl = Math.min(200, (next.tollensReagentMl || 0) + amountMl);
        if ((next.glucoseG || 0) > 0) {
          playSoundEffect('crystallize');
          setSilverMirrorLevel(100);
          setActiveChemicalEquation('CH₂OH(CHOH)₄CHO + 2[Ag(NH₃)₂]OH → 2Ag⁰↓ (Silver Mirror) + RCOONH₄ + 3NH₃ + H₂O');
          setLastActionMessage(t('🪞 تفاعل مرآة الفضة الشهير (Tollens’ Silver Mirror)! اختزل الجلوكوز أيونات الفضة الأمونياكية فترسبت طبقة فضية عاكسة كالمرآة الحقيقية على جدار الكأس الزجاجي!', '🪞 Famous Tollens’ Silver Mirror Reaction! Glucose reduced ammoniacal silver ions, depositing a dazzling reflective metallic silver mirror across the glass beaker!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من كاشف تولنز [Ag(NH₃)₂]OH. أضف سكر الجلوكوز (C₆H₁₂O₆) لترسيب مرآة الفضة الحقيقية اللامعة على جدران الكأس!`, `Added ${doseLabelEn} Tollens’ Reagent. Add Glucose sugar to coat the inside of the glass beaker with a reflective Silver Mirror!`));
        }
      } else if (reagentId === 'glucose_sugar') {
        next.glucoseG = Math.min(50, (next.glucoseG || 0) + grams);
        if ((next.tollensReagentMl || 0) > 0) {
          playSoundEffect('crystallize');
          setSilverMirrorLevel(100);
          setActiveChemicalEquation('C₅H₁₁O₅CHO + 2[Ag(NH₃)₂]OH → 2Ag⁰↓ (Reflective Silver Mirror) + RCOONH₄ + 3NH₃ + H₂O');
          setLastActionMessage(t('🪞 تفاعل مرآة الفضة الشهير! اختزل الجلوكوز كاشف تولنز فتشكلت مرآة فضية معدنية عاكسة مبهرة على زجاج الكأس!', '🪞 Iconic Silver Mirror Test! Glucose reduced Tollens’ reagent into a gleaming metallic silver mirror on the glass walls!'));
        } else if ((next.indigoCarmineMl || 0) > 0 && next.baseMl > 0) {
          setTrafficLightStage('yellow');
          setActiveChemicalEquation('Indigo Carmine (Reduced Yellow) + O₂ (Stirring) ⇌ Red Intermediate ⇌ Green Oxidized');
          setLastActionMessage(t('🚦 تجربة إشارة المرور الكيميائية (Chemical Traffic Light)! اختزل الجلوكوز القلوي صبغة الإنديجو كارمين إلى الأصفر الذهبي — حرّك المحلول بالعصا الزجاجية ليتحول إلى الأحمر ثم الأخضر الزمردي!', '🚦 Chemical Traffic Light initialized (Yellow reduced state)! Stir the solution with the Glass Rod to oxidize it to Crimson Red and Emerald Green!'));
        } else if ((next.methyleneBlueMl || 0) > 0 && next.baseMl > 0) {
          setBlueBottleStage('colorless');
          setActiveChemicalEquation('Methylene Blue (Oxidized Blue) + Glucose + OH⁻ → Leucomethylene Blue (Colorless)');
          setLastActionMessage(t('🧪 تجربة القارورة الزرقاء الشهيرة (Blue Bottle)! اختزل الجلوكوز القلوي أزرق الميثيلين فاختفى اللون تماماً وأصبح شفافاً — حرّك بالعصا الزجاجية لإدخال الأكسجين وإعادة اللون الأزرق الملكي!', '🧪 Famous Blue Bottle Experiment! Alkaline glucose reduced Methylene Blue to colorless Leucomethylene Blue — stir with the Glass Rod to turn it Royal Blue again!'));
        } else if ((next.fehlingMl || 0) > 0 || (next.copperSulfateMl > 0 && next.baseMl > 0)) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 6.5);
          setCurrentTempC(prevT => Math.min(92, prevT + 22));
          setActiveChemicalEquation('R-CHO + 2Cu²⁺(Fehling) + 5OH⁻ → R-COO⁻ + Cu₂O↓ (Brick-Red Precipitate) + 3H₂O');
          setLastActionMessage(t('🧱 اختبار فهلنج الإيجابي للكشف عن السكريات المختزلة! اختزل الجلوكوز أيونات النحاس الثنائية الزرقاء إلى راسب أكسيد النحاس الأحادي Cu₂O الأحمر الطوبي!', '🧱 Positive Fehling’s Test! Glucose reduced blue Cu²⁺ ions into brick-red Copper(I) Oxide (Cu₂O) precipitate!'));
        } else if (next.permanganateG > 0 && next.baseMl > 0) {
          setActiveChemicalEquation('MnO₄⁻(Purple) --(Glucose/OH⁻)--> MnO₄²⁻(Emerald Green) → MnO₂(Amber Yellow)');
          setLastActionMessage(t('🦎 تجربة الحرباء الكيميائية الشهيرة! اختزل الجلوكوز القلوي برمنغنات البوتاسيوم البنفسجية عبر الأخضر الزمردي حتى الأصفر الكهرماني!', '🦎 Famous Chemical Chameleon! Alkaline glucose reduced purple Permanganate through emerald-green to amber-yellow!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم من سكر الجلوكوز المختزل (C₆H₁₂O₆). جربه مع كاشف تولنز (مرآة الفضة) أو أزرق الميثيلين + NaOH (القارورة الزرقاء) أو الإنديجو كارمين + NaOH (إشارة المرور) أو فهلنج!`, `Added ${grams} g reducing D-Glucose. Combine with Tollens’ Reagent (Silver Mirror), Methylene Blue + NaOH (Blue Bottle), Indigo Carmine + NaOH (Traffic Light), or Fehling’s!`));
        }
      } else if (reagentId === 'methylene_blue') {
        next.methyleneBlueMl = Math.min(100, (next.methyleneBlueMl || 0) + (dispenseMode === 'drop' ? drops * 2 : amountMl));
        if ((next.glucoseG || 0) > 0 && next.baseMl > 0) {
          setBlueBottleStage('colorless');
          setActiveChemicalEquation('Methylene Blue (Blue) + D-Glucose + OH⁻ ⇌ Leucomethylene Blue (Colorless)');
          setLastActionMessage(t('🧪 تجربة القارورة الزرقاء (Blue Bottle)! تحول المحلول إلى شفاف عديم اللون بفعل الجلوكوز القلوي. اضغط على (خلط بالعصا الزجاجية) لمشاهدته يتحول للأزرق الملكي ثم يعود شفافاً تلقائياً!', '🧪 Blue Bottle Reaction active! Solution turned colorless. Click "Stir with Rod" to oxygenate it into Royal Blue and watch it fade back!'));
        } else {
          setBlueBottleStage('blue');
          setLastActionMessage(t('أُضيف كاشف أزرق الميثيلين. أضف الجلوكوز وهيدروكسيد الصوديوم (NaOH) لتجربة القارورة الزرقاء السحرية!', 'Added Methylene Blue redox indicator. Add Glucose + NaOH for the famous Blue Bottle experiment!'));
        }
      } else if (reagentId === 'indigo_carmine') {
        next.indigoCarmineMl = Math.min(100, (next.indigoCarmineMl || 0) + (dispenseMode === 'drop' ? drops * 2 : amountMl));
        if ((next.glucoseG || 0) > 0 && next.baseMl > 0) {
          setTrafficLightStage('yellow');
          setActiveChemicalEquation('Indigo Carmine (Yellow, Reduced) + O₂ (Stir) → Crimson Red → Emerald Green');
          setLastActionMessage(t('🚦 تجربة إشارة المرور الكيميائية جاهزة (اللون الأصفر)! اضغط على (خلط بالعصا الزجاجية) لتحويل المحلول إلى الأحمر القرمزي ثم الأخضر الزمردي مع دخول الأكسجين!', '🚦 Chemical Traffic Light ready (Yellow stage)! Stir the solution to shift it through Crimson Red to Emerald Green!'));
        } else {
          setLastActionMessage(t('أُضيفت صبغة الإنديجو كارمين. أضف الجلوكوز وهيدروكسيد الصوديوم (NaOH) لتجربة إشارة المرور الكيميائية الشهيرة!', 'Added Indigo Carmine indicator. Add Glucose + NaOH for the Chemical Traffic Light reaction!'));
        }
      } else if (reagentId === 'sodium_silicate') {
        next.sodiumSilicateMl = Math.min(200, (next.sodiumSilicateMl || 0) + amountMl);
        if (next.copperSulfateMl > 0 || (next.cobaltChlorideMl || 0) > 0 || (next.ferricChlorideMl || 0) > 0 || next.calciumChlorideG > 0 || next.ironG > 0) {
          playSoundEffect('crystallize');
          setHasChemicalGarden(true);
          setCrystalType('copper_blue');
          setCrystalLevel(100);
          setActiveChemicalEquation('M²⁺/M³⁺(s) + Na₂SiO₃(aq) → MSiO₃ (Colloidal Osmotic Crystal Stalagmites)');
          setLastActionMessage(t('🌿 تجربة الحديقة الكيميائية البلورية الشهيرة (3D Chemical Crystal Garden)! نمت صواعد وأبراج بلورية ملونة مذهلة عبر الأغشية السيليكاتية شبه المنفذة بفعل الضغط الأسموزي!', '🌿 Famous 3D Chemical Crystal Garden! Colorful osmotic silicate crystal towers and stalagmites sprouted upward through semi-permeable membranes!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من سيليكات الصوديوم (الزجاج المائي Na₂SiO₃). أضف أملاح المعادن الملونة (كبريتات النحاس، كلوريد الكوبالت، كلوريد الحديديك، كلوريد الكالسيوم) لإنبات الحديقة البلورية ثلاثية الأبعاد!`, `Added ${doseLabelEn} Sodium Silicate (Water Glass). Add metal salts (CuSO₄, CoCl₂, FeCl₃, CaCl₂) to grow a 3D Chemical Crystal Garden!`));
        }
      } else if (reagentId === 'calcium_carbide') {
        next.calciumCarbideG = Math.min(50, (next.calciumCarbideG || 0) + grams);
        if (next.waterMl > 0 || next.iceCount > 0) {
          playSoundEffect('fizz');
          playSoundEffect('inflate');
          next.hydrogenGasMl = Math.min(100, next.hydrogenGasMl + 50);
          triggerGradualBalloonInflation(75, '#f97316');
          setEffervescenceBubbles(60);
          setCurrentTempC(prevT => Math.min(95, prevT + 28));
          setActiveChemicalEquation('CaC₂(s) + 2H₂O(l) → C₂H₂↑ (Acetylene Gas) + Ca(OH)₂(aq) + ΔH');
          if (burnerPower !== 'off') {
            triggerExplosion('hydrogen_pop');
            setIsEthanolBurning(true);
            setLastActionMessage(t('🔥 تجربة الجليد المشتعل ومصباح الأسيتيلين! تفاعل كربيد الكالسيوم مع الماء/الثلج مطلقاً غاز الأسيتيلين C₂H₂ الذي اشتعل فوراً بلهب ساطع فوق سطح الماء!', '🔥 Flaming Ice & Carbide Lamp Reaction! Calcium carbide reacted with water/ice releasing Acetylene gas (C₂H₂) which ignited into a roaring flame!'));
          } else {
            setLastActionMessage(t('🫧🎈 فوران غاز الأسيتيلين القابل للاشتعال (C₂H₂)! تفاعل كربيد الكالسيوم بقوة مع الماء ونفخ البالون — اضغط (شرارة إشعال ⚡) لإشعال لهب الأسيتيلين الساطع!', '🫧🎈 Vigorous Acetylene Gas (C₂H₂) evolution! Calcium carbide reacted with water and inflated the balloon — click Spark ⚡ to ignite the acetylene flame!'));
          }
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم أحجار كربيد الكالسيوم (CaC₂). أضف الماء أو مكعبات الثلج لتوليد غاز الأسيتيلين المشتعل!`, `Added ${grams} g Calcium Carbide stones. Add Water or Ice Cubes to generate flammable Acetylene gas!`));
        }
      } else if (reagentId === 'iron_oxide_thermite') {
        next.ironOxideThermiteG = Math.min(50, (next.ironOxideThermiteG || 0) + grams);
        if ((next.aluminumG || 0) > 0 && (burnerPower !== 'off' || next.magnesiumG > 0 || currentTempC >= 70)) {
          triggerExplosion('sodium');
          setThermiteLevel(100);
          next.precipitateG = Math.min(40, next.precipitateG + 16);
          setCurrentTempC(99.5);
          setActiveChemicalEquation('Fe₂O₃(s) + 2Al(s) --(Mg Spark)--> 2Fe(l, 2500°C Molten Iron) + Al₂O₃(s) + 851.5 kJ');
          setLastActionMessage(t('🔥🌋 تفاعل الثرميت الأسطوري (Thermite Reaction 2500°C)! اختزل الألومنيوم أكسيد الحديديك في تفاعل طارد للحرارة هائل منتجاً حديداً منصهراً متوهجاً وشلالاً من الشرر الأبيض والأصفر!', '🔥🌋 Legendary Thermite Reaction (2500°C)! Aluminum reduced Iron(III) Oxide in an extreme exothermic reaction, producing white-hot molten iron and a shower of sparks!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم مسحوق أكسيد الحديديك (Fe₂O₃). أضف حبيبات الألومنيوم (Al) واضغط (شرارة إشعال ⚡) لإطلاق تفاعل الثرميت المنصهر (2500°C)!`, `Added ${grams} g Iron(III) Oxide (Fe₂O₃). Add Aluminum Powder and click Spark ⚡ to ignite the 2500°C Thermite Reaction!`));
        }
      } else if (reagentId === 'sodium_thiosulfate') {
        next.sodiumThiosulfateMl = Math.min(200, (next.sodiumThiosulfateMl || 0) + amountMl);
        if ((next.iodineDrops || 0) > 0) {
          setActiveChemicalEquation('I₂(aq, Brown/Blue-Black) + 2Na₂S₂O₃(aq) → 2NaI(aq, Colorless) + Na₂S₄O₆(aq)');
          setLastActionMessage(t('⏱️ اختزال اليود وتفاعل الساعة الكيميائية! اختزلت ثيوكبريتات الصوديوم اليود الحر I₂ إلى أيونات يوديد عديمة اللون (I⁻) فاختفى اللون الداكن فوراً وأصبح المحلول شفافاً كالماء!', '⏱️ Iodine Clock & Redox Decolorization! Sodium Thiosulfate reduced free Iodine (I₂) into colorless Iodide ions (I⁻), turning the dark solution crystal clear!'));
        } else if (next.acidMl > 0 || (next.sulfuricAcidMl || 0) > 0 || (next.nitricAcidMl || 0) > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 6.5);
          setEffervescenceBubbles(38);
          setActiveChemicalEquation('Na₂S₂O₃(aq) + 2HCl(aq) → S↓ (Colloidal Yellow Sunset) + SO₂↑ + 2NaCl + H₂O');
          setLastActionMessage(t('🌅 تجربة الغروب الكيميائي وتشتت تيندال (Chemical Sunset)! تفاعلت ثيوكبريتات الصوديوم مع الحمض مرسّبةً الكبريت الغروي الأصفر الحليبي S↓ تدريجياً في المحلول!', '🌅 Famous Disappearing Cross / Chemical Sunset! Acidified Sodium Thiosulfate precipitated milky-yellow colloidal Sulfur (S↓) exhibiting Tyndall light scattering!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من ثيوكبريتات الصوديوم (Na₂S₂O₃). أضف اليود لإزالة لونه فوراً (ساعة اليود)، أو أضف حمض HCl لمشاهدة ترسب الكبريت الغروي (تجربة الغروب الكيميائي)!`, `Added ${doseLabelEn} Sodium Thiosulfate. Add Iodine to decolorize it, or add HCl for colloidal sulfur precipitation!`));
        }
      } else if (reagentId === 'fehling_solution') {
        next.fehlingMl = Math.min(200, (next.fehlingMl || 0) + amountMl);
        if ((next.glucoseG || 0) > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 6.5);
          setCurrentTempC(prevT => Math.min(92, prevT + 24));
          setActiveChemicalEquation('C₅H₁₁O₅CHO + 2Cu²⁺(Fehling) + 5OH⁻ → Cu₂O↓ (Brick-Red) + C₅H₁₁O₅COO⁻ + 3H₂O');
          setLastActionMessage(t('🧱 اختبار فهلنج الإيجابي! اختزل سكر الجلوكوز محلول فهلنج الأزرق الياقوتي مكوناً راسب أكسيد النحاس الأحادي Cu₂O الأحمر الطوبي المميز!', '🧱 Positive Fehling’s Test! Glucose reduced deep-blue Fehling’s solution into a brick-red Copper(I) Oxide (Cu₂O) precipitate!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من محلول فهلنج الأزرق الياقوتي. أضف سكر الجلوكوز للكشف عن مجموعة الألدهيد وترسيب أكسيد النحاس الأحمر الطوبي!`, `Added ${doseLabelEn} deep-blue Fehling’s Solution. Add Glucose sugar to precipitate brick-red Cu₂O!`));
        }
      } else if (reagentId === 'gold_chloride') {
        next.goldChlorideMl = Math.min(200, (next.goldChlorideMl || 0) + amountMl);
        if ((next.zincG || 0) > 0 || next.ironG > 0 || (next.copperMetalG || 0) > 0 || next.magnesiumG > 0 || (next.aluminumG || 0) > 0) {
          playSoundEffect('crystallize');
          setHasGoldTree(true);
          setCrystalType('golden_rain');
          setCrystalLevel(100);
          next.precipitateG = Math.min(35, next.precipitateG + 7.5);
          setActiveChemicalEquation('2AuCl₄⁻(aq) + 3Zn(s) → 2Au⁰↓ (24K Gold Dendritic Tree) + 3Zn²⁺(aq) + 8Cl⁻');
          setLastActionMessage(t('👑 ترسيب شجرة الذهب الخالص عيار 24 قيراطاً! أزاح الفلز النشط أيونات الذهب الثلاثية Au³⁺ فترسبت بلورات وتغصنات ذهبية براقة ثلاثية الأبعاد في قاع الكأس!', '👑 24K Pure Gold Dendritic Tree Precipitation! Active metal displaced Au³⁺ ions into shimmering 3D metallic gold crystals!'));
        } else if ((next.glucoseG || 0) > 0 || (next.sodiumThiosulfateMl || 0) > 0) {
          setActiveChemicalEquation('2HAuCl₄ + 3C₆H₁₂O₆ → 2Au⁰ (Ruby Colloidal Gold Nanoparticles / Faraday Gold)');
          setLastActionMessage(t('💎 ذهب فاراداي النانوي الغروي (Colloidal Gold Nanoparticles)! اختُزلت أيونات الذهب لتكوين جسيمات الذهب النانوية ذات الرنين البلازموني الأحمر الياقوتي!', '💎 Faraday’s Ruby Colloidal Gold! Au³⁺ ions reduced into plasmonic ruby-red gold nanoparticles!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من محلول حمض كلوريد الذهب الثلاثي (HAuCl₄). أضف حبيبات الخارصين أو النحاس لترسيب شجرة الذهب الخالص عيار 24 قيراطاً!`, `Added ${doseLabelEn} Chloroauric Acid (HAuCl₄). Add Zinc or Copper metal to grow a 24K Pure Gold Crystal Tree!`));
        }
      } else if (reagentId === 'oxalic_acid') {
        next.oxalicAcidMl = Math.min(200, (next.oxalicAcidMl || 0) + amountMl);
        if (next.permanganateG > 0) {
          playSoundEffect('fizz');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 48));
          setCurrentTempC(prevT => Math.min(88, prevT + 16));
          setActiveChemicalEquation('2MnO₄⁻(Purple) + 5H₂C₂O₄ + 6H⁺ --(Mn²⁺ Autocatalysis)--> 2Mn²⁺(Colorless) + 10CO₂↑ + 8H₂O');
          setLastActionMessage(t('⚡ التحفيز الذاتي الشهير (Autocatalysis)! اختزل حمض الأوكساليك برمنغنات البوتاسيوم البنفسجية إلى أيونات المنغنيز الثنائية عديمة اللون مع فوران فقاعات غاز CO₂!', '⚡ Famous Autocatalytic Redox! Oxalic acid reduced purple Permanganate into colorless Mn²⁺ ions with brisk CO₂ effervescence!'));
        } else if (next.calciumChlorideG > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 5.5);
          setActiveChemicalEquation('CaCl₂(aq) + H₂C₂O₄(aq) → CaC₂O₄↓ (White Crystalline Precipitate) + 2HCl');
          setLastActionMessage(t('تكوّن راسب أوكسالات الكالسيوم الأبيض البلوري الدقيق CaC₂O₄↓ فور التقاء حمض الأوكساليك بأيونات الكالسيوم!', 'Formed fine white crystalline Calcium Oxalate (CaC₂O₄↓) precipitate!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من حمض الأوكساليك (H₂C₂O₄). أضف برمنغنات البوتاسيوم البنفسجية لمشاهدة تفاعل التحفيز الذاتي وإزالة اللون الفورية!`, `Added ${doseLabelEn} Oxalic Acid (H₂C₂O₄). Add purple Potassium Permanganate to witness autocatalytic decolorization!`));
        }
      } else if (reagentId === 'lithium_chloride') {
        next.lithiumG = Math.min(40, (next.lithiumG || 0) + grams);
        setFlameTestMetal('lithium');
        if (next.silverNitrateMl > 0) {
          playSoundEffect('precipitate');
          next.precipitateG = Math.min(35, next.precipitateG + 4.5);
          setActiveChemicalEquation('LiCl(aq) + AgNO₃(aq) → AgCl↓ (White Precipitate) + LiNO₃(aq)');
          setLastActionMessage(t('تكوّن راسب كلوريد الفضة الأبيض AgCl مع تفعيل اللهب القرمزي الوردي الساحر لعنصر الليثيوم (Li⁺)!', 'Formed white AgCl precipitate and activated neon crimson-magenta Lithium flame test!'));
        } else {
          setActiveChemicalEquation('LiCl(s) --(H₂O)--> Li⁺(aq, 670nm Crimson Flame) + Cl⁻(aq)');
          setLastActionMessage(t(`أُضيفت ${grams} جم بلورات كلوريد الليثيوم LiCl. شغّل موقد بنزن لمشاهدة اللهب القرمزي الوردي النيوني (670 nm)!`, `Added ${grams} g Lithium Chloride (LiCl). Turn on the Bunsen burner to see the neon crimson-magenta flame!`));
        }
      } else if (reagentId === 'nickel_sulfate') {
        next.nickelSulfateMl = Math.min(200, (next.nickelSulfateMl || 0) + amountMl);
        if ((next.sodiumSilicateMl || 0) > 0) {
          playSoundEffect('crystallize');
          setHasChemicalGarden(true);
          setCrystalType('copper_blue');
          setCrystalLevel(100);
          setActiveChemicalEquation('NiSO₄(aq) + Na₂SiO₃(aq) → NiSiO₃ (Emerald-Jade Osmotic Crystal Towers)');
          setLastActionMessage(t('🌿 نمت أبراج بلورية خضراء زمردية من سيليكات النيكل داخل الحديقة الكيميائية ثلاثية الأبعاد!', '🌿 Emerald-green Nickel Silicate crystal towers grew inside the 3D Chemical Garden!'));
        } else if (next.ammoniaMl > 0) {
          setActiveChemicalEquation('Ni²⁺(Green) + 6NH₃(aq) → [Ni(NH₃)₆]²⁺(Violet-Blue Complex)');
          setLastActionMessage(t('تكوّن معقد سداسي أمين النيكل الثنائي [Ni(NH₃)₆]²⁺ ذو اللون الأزرق البنفسجي الساحر!', 'Formed royal violet-blue Hexaamminenickel(II) complex [Ni(NH₃)₆]²⁺!'));
        } else {
          setLastActionMessage(t(`أُضيف ${doseLabelAr} من كبريتات النيكل الخضراء الزمردية NiSO₄. جربها مع سيليكات الصوديوم (الحديقة البلورية) أو الأمونيا!`, `Added ${doseLabelEn} emerald-green Nickel(II) Sulfate (NiSO₄). Try with Sodium Silicate or Ammonia!`));
        }
      } else if (reagentId === 'ammonium_chloride') {
        next.ammoniumChlorideG = Math.min(50, (next.ammoniumChlorideG || 0) + grams);
        setCurrentTempC(prevT => Math.max(-5.0, prevT - grams * 3.5));
        if (burnerPower !== 'off' || currentTempC >= 60) {
          setWhiteSmokeIntensity(100);
          setActiveChemicalEquation('NH₄Cl(s) ⇌ NH₃(g) + HCl(g) (Dense White Smoke Sublimation)');
          setLastActionMessage(t('☁️ تسامي كلوريد الأمونيوم وتصاعد سحابة الدخان الأبيض الكثيف (NH₄Cl)!', '☁️ Ammonium Chloride sublimation releasing dense white NH₄Cl smoke clouds!'));
        } else {
          setActiveChemicalEquation('NH₄Cl(s) + ΔH(Endothermic) → NH₄⁺(aq) + Cl⁻(aq)   [ΔT = -18°C]');
          setLastActionMessage(t(`❄️ ذوبان ماص للحرارة بشدة (Endothermic)! أُضيفت ${grams} جم كلوريد الأمونيوم NH₄Cl فانخفضت حرارة المحلول وتكون الصقيع على جدار الكأس!`, `❄️ Strongly Endothermic Dissolution! Added ${grams} g Ammonium Chloride (NH₄Cl), plunging the temperature and frosting the beaker!`));
        }
      }

      return next;
    });
  };

  // Withdraw liquid using pipette
  const handleWithdrawLiquid = (amount: number = 10) => {
    if (totalVolumeMl <= 0) {
      setLastActionMessage(t('الكأس فارغ بالفعل، لا يوجد سائل لسحبه!', 'Beaker is already empty!'));
      return;
    }
    setDispenseAnimCounter(prev => prev + 1);
    const ratio = Math.max(0, (totalVolumeMl - amount) / totalVolumeMl);
    setContent(prev => ({
      ...prev,
      waterMl: Math.max(0, prev.waterMl * ratio),
      acidMl: Math.max(0, prev.acidMl * ratio),
      baseMl: Math.max(0, prev.baseMl * ratio),
      copperSulfateMl: Math.max(0, prev.copperSulfateMl * ratio),
      peroxideMl: Math.max(0, prev.peroxideMl * ratio),
      silverNitrateMl: Math.max(0, prev.silverNitrateMl * ratio),
      ammoniaMl: Math.max(0, prev.ammoniaMl * ratio),
      ethanolMl: Math.max(0, prev.ethanolMl * ratio),
    }));
    playSoundEffect('pour');
    setLastActionMessage(t(`تم سحب ${amount} مل من المحلول بواسطة الماصة المخبرية.`, `Withdrew ${amount} mL from beaker using pipette.`));
  };

  // Set completely dry beaker (0 mL) for dry metal reactions
  const handleSetDryBeaker = () => {
    setContent({
      waterMl: 0,
      acidMl: 0,
      baseMl: 0,
      copperSulfateMl: 0,
      bakingSodaG: 0,
      calciumChlorideG: 0,
      phenolphthaleinDrops: 0,
      universalDrops: 0,
      iceCount: 0,
      ironG: 0,
      precipitateG: 0,
      permanganateG: 0,
      peroxideMl: 0,
      silverNitrateMl: 0,
      ammoniaMl: 0,
      sodiumG: 0,
      potassiumG: 0,
      magnesiumG: 0,
      ethanolMl: 0,
      hydrogenGasMl: 0,
      aceticAcidMl: 0,
      strontiumG: 0,
      bariumG: 0,
      zincG: 0,
      sulfuricAcidMl: 0,
      nitricAcidMl: 0,
      sucroseG: 0,
      sodiumAcetateG: 0,
      potassiumIodideG: 0,
      leadNitrateMl: 0,
      copperMetalG: 0,
      aluminumG: 0,
      alumG: 0,
      iodineDrops: 0,
      starchG: 0,
      luminolMl: 0,
      luminolG: 0,
      ferricChlorideMl: 0,
      thiocyanateMl: 0,
      potassiumThiocyanateMl: 0,
      ferrocyanideG: 0,
      potassiumFerrocyanideMl: 0,
      dichromateG: 0,
      ammoniumDichromateG: 0,
      cobaltChlorideG: 0,
      cobaltChlorideMl: 0,
      sodiumSilicateMl: 0,
      ironOxideG: 0,
      ironOxideThermiteG: 0,
      calciumCarbideG: 0,
      thiosulfateMl: 0,
      sodiumThiosulfateMl: 0,
      glucoseG: 0,
      methyleneBlueDrops: 0,
      methyleneBlueMl: 0,
      indigoCarmineDrops: 0,
      indigoCarmineMl: 0,
      lithiumG: 0,
      nickelSulfateMl: 0,
      goldChlorideMl: 0,
      ammoniumChlorideG: 0,
      tollensReagentMl: 0,
      fehlingMl: 0,
      oxalicAcidMl: 0
    });
    explosionsRef.current = [];
    skitteringPelletsRef.current = [];
    pourAnimationRef.current = null;
    flashOverlayRef.current = null;
    setIsEthanolBurning(false);
    setBurnerPower('off');
    setCurrentTempC(23.5);
    setEffervescenceBubbles(0);
    setLitmusStripDipped(false);
    balloonTargetRef.current = 0;
    setBalloonInflation(0);
    setIsBalloonAttached(false);
    setSwellingType('none');
    setSwellingLevel(0);
    setCrystalType('none');
    setCrystalLevel(0);
    setBrownGasIntensity(0);
    setChemiluminescenceLevel(0);
    setSilverMirrorLevel(0);
    setDichromateVolcanoLevel(0);
    setThermiteLevel(0);
    setWhiteSmokeIntensity(0);
    setHasChemicalGarden(false);
    setHasGoldTree(false);
    setTrafficLightStage('none');
    setBlueBottleStage('none');
    setActiveChemicalEquation('');
    setMissionComplete(false);
    setLastActionMessage(t('تم تفريغ وتجفيف الكأس تماماً (0 مل). يمكنك الآن وضع قطع الفلزات الجافة أو مسحوق الثرميت وبركان الكرومات!', 'Beaker completely dried (0 mL). Place dry metals, Thermite, or Dichromate Volcano crystals!'));
  };

  // Electric Spark / Igniter Tool
  const handleIgniteSpark = () => {
    triggerExplosion('spark');

    // 0a. Thermite Reaction (Fe2O3 + Al)
    if ((content.ironOxideThermiteG || 0) > 0 && (content.aluminumG || 0) > 0) {
      setTimeout(() => {
        triggerExplosion('sodium');
        setThermiteLevel(100);
        setContent(prev => ({ ...prev, precipitateG: Math.min(40, prev.precipitateG + 16) }));
        setCurrentTempC(99.5);
        setActiveChemicalEquation('Fe₂O₃(s) + 2Al(s) --(2500°C Spark)--> 2Fe(l, Molten Iron) + Al₂O₃(s) + 851.5 kJ');
        setLastActionMessage(t('🔥🌋 اشتعال الثرميت الأسطوري (2500°C)! أطلقت الشرارة تفاعل الألومنيوم الحراري مع أكسيد الحديديك، فانصهر الحديد الخام بوهج أبيض وبرتقالي ساطع مع تطاير شرارات المعدن المنصهر!', '🔥🌋 2500°C Thermite Ignition! The spark triggered the aluminothermic reduction of Fe₂O₃ into a glowing pool of white-hot molten iron!'));
      }, 100);
      return;
    }

    // 0b. Ammonium Dichromate Chemical Volcano
    if ((content.ammoniumDichromateG || 0) > 0) {
      setTimeout(() => {
        triggerExplosion('magnesium');
        setDichromateVolcanoLevel(100);
        setContent(prev => ({ ...prev, precipitateG: Math.min(40, prev.precipitateG + 14) }));
        setCurrentTempC(98.0);
        setActiveChemicalEquation('(NH₄)₂Cr₂O₇(s) --(Δ)--> Cr₂O₃(s, Volcanic Green Cone) + N₂↑ + 4H₂O(g)');
        setLastActionMessage(t('🌋 ثوران بركان ثنائي كرومات الأمونيوم الشهير! اشتعلت البلورات البرتقالية مطلقةً شرارات بركانية ساطعة ومخروطاً ثلاثي الأبعاد من رماد أكسيد الكروم الأخضر Cr₂O₃!', '🌋 Chemical Volcano Erupted! Ammonium dichromate thermally decomposed with fiery sparks into a 3D green Cr₂O₃ volcanic cone!'));
      }, 100);
      return;
    }

    // If magnesium is present in the beaker, ignite it with blinding flare!
    if (content.magnesiumG > 0) {
      setTimeout(() => {
        triggerExplosion('magnesium');
        setContent(prev => ({
          ...prev,
          magnesiumG: 0,
          precipitateG: Math.min(35, prev.precipitateG + 4.0)
        }));
        setCurrentTempC(prevT => Math.min(99, prevT + 36));
        setActiveChemicalEquation('2Mg(s) + O₂(g) → 2MgO(s) + Blinding White Light');
        setLastActionMessage(t('🔥 وميض أبيض ناصع باهر! أطلقت الشرارة اشتعال شريط المغنيسيوم بالوهج الشمسي الأبيض الناصع!', '🔥 Blinding white flare! Electric spark ignited magnesium ribbon into radiant sparks and white MgO ash!'));
      }, 120);
      return;
    }

    // If flammable hydrogen or acetylene gas has accumulated, trigger explosive pop detonation!
    if (content.hydrogenGasMl > 0) {
      setTimeout(() => {
        triggerExplosion('hydrogen_pop');
        const wasCarbide = (content.calciumCarbideG || 0) > 0;
        setContent(prev => ({
          ...prev,
          hydrogenGasMl: 0,
          waterMl: Math.min(240, prev.waterMl + 2)
        }));
        setCurrentTempC(prevT => Math.min(95, prevT + 20));
        setEffervescenceBubbles(0);
        if (wasCarbide) {
          setIsEthanolBurning(true);
          setActiveChemicalEquation('2C₂H₂(g) + 5O₂(g) → 4CO₂(g) + 2H₂O(g) + Roaring Flame');
          setLastActionMessage(t('🔥💥 اشتعال غاز الأسيتيلين الساطع! انفجر غاز الأسيتيلين المتصاعد من كربيد الكالسيوم واشتعل بلهب حراري ساطع!', '🔥💥 Acetylene Gas Ignition! Acetylene evolved from Calcium Carbide ignited into a bright roaring flame!'));
        } else {
          setActiveChemicalEquation('2H₂(g) + O₂(g) --(Spark)--> 2H₂O(g) + Pop Detonation');
          setLastActionMessage(t('⚡ فرقعة انفجارية سريعة لغاز الهيدروجين (Pop Test)! تفاعل الهيدروجين مع الأكسجين مكوناً بخار ماء مع صوت فرقعة ممتع!', '⚡ Explosive Hydrogen Pop Test! Flammable H2 detonated with O2 forming water vapor and a loud exciting pop!'));
        }
      }, 120);
      return;
    }

    // If ethanol is present and not burning, ignite it!
    if (content.ethanolMl > 0 && !isEthanolBurning) {
      setTimeout(() => {
        triggerExplosion('ethanol_fire');
        setIsEthanolBurning(true);
        setCurrentTempC(prevT => Math.min(99, prevT + 25));
        setActiveChemicalEquation('C₂H₅OH(l) + 3O₂(g) → 2CO₂(g) + 3H₂O(g) + ΔH');
        setLastActionMessage(t('🔥 اشتعل الإيثانول بلهب أزرق وأصفر هادئ ومستمر يحاكي شعلة الكحول المخبرية!', '🔥 Ignited ethanol into a beautiful steady blue-orange alcohol combustion flame!'));
      }, 120);
      return;
    }

    setLastActionMessage(t('⚡ انطلقت شرارة كهربائية تجريبية داخل الكأس. لا توجد غازات أو أشرطة قابلة للاشتعال حالياً.', '⚡ Electric test spark struck inside beaker. No combustible gases or metals present currently.'));
  };

  // Stir the mixture with the authentic glass rod
  const handleStir = () => {
    playSoundEffect('stir');
    setIsStirring(true);

    // 1. Chemical Traffic Light Oxidation on Stirring (Indigo Carmine + Glucose + NaOH)
    if ((content.indigoCarmineMl || 0) > 0 && (content.glucoseG || 0) > 0 && content.baseMl > 0) {
      const nextStage = trafficLightStage === 'yellow' || trafficLightStage === 'none'
        ? 'red'
        : trafficLightStage === 'red'
        ? 'green'
        : 'yellow';
      setTrafficLightStage(nextStage);
      setActiveChemicalEquation('Indigo Carmine (Yellow) + O₂ (Stirring) → Crimson Red → Emerald Green');
      setLastActionMessage(
        nextStage === 'red'
          ? t('🚦 إشارة المرور الكيميائية: أدخل التحريك الأكسجين فتحول المحلول من الأصفر إلى الأحمر القرمزي! حرّك مرة أخرى لتحويله إلى الأخضر الزمردي!', '🚦 Traffic Light shifted to CRIMSON RED via dissolved oxygen! Stir once more to reach EMERALD GREEN!')
          : nextStage === 'green'
          ? t('🚦 إشارة المرور الكيميائية: اكتملت أكسدة الإنديجو كارمين فتحول المحلول إلى الأخضر الزمردي الساحر!', '🚦 Traffic Light reached EMERALD GREEN! Stir again to cycle back through the redox stages!')
          : t('🚦 عاد محلول إشارة المرور إلى الطور الأصفر المختزل! حرّك المحلول لإعادة دورة الألوان!', '🚦 Traffic Light returned to reduced Yellow state! Stir again to cycle the colors!')
      );
      setTimeout(() => setIsStirring(false), 1800);
      return;
    }

    // 2. Blue Bottle Experiment Oxidation on Stirring (Methylene Blue + Glucose + NaOH)
    if ((content.methyleneBlueMl || 0) > 0 && (content.glucoseG || 0) > 0 && content.baseMl > 0) {
      setBlueBottleStage('blue');
      setActiveChemicalEquation('Leucomethylene Blue (Colorless) + ½O₂ (Stirring) → Methylene Blue (Royal Blue)');
      setLastActionMessage(
        t(
          '🧪 القارورة الزرقاء السحرية (Blue Bottle): أدخل التحريك الأكسجين الجوي فتحول المحلول الشفاف فوراً إلى الأزرق الملكي، وسيعود شفافاً تلقائياً بعد ثوانٍ بفعل الجلوكوز!',
          '🧪 Blue Bottle Magic: Stirring dissolved atmospheric O₂, turning the colorless liquid Royal Blue (fades back to clear automatically)!'
        )
      );
      setTimeout(() => {
        setBlueBottleStage('colorless');
      }, 6000);
      setTimeout(() => setIsStirring(false), 1800);
      return;
    }

    setLastActionMessage(
      t(
        'جاري تحريك ومزج المحلول بالعصا الزجاجية بحركة دائرية مستمرة لتسريع التجانس والذوبان...',
        'Stirring solution in continuous circular motion with the glass rod to accelerate homogenization...'
      )
    );
    setTimeout(() => {
      setIsStirring(false);
      // Dissolve undissolved salts and homogenize
      setContent(prev => ({
        ...prev,
        calciumChlorideG: Math.max(0, prev.calciumChlorideG - 6),
        bakingSodaG: Math.max(0, prev.bakingSodaG - 6),
        ironG: Math.max(0, prev.ironG - 3),
        precipitateG: Math.max(0, prev.precipitateG - 4)
      }));
      setLastActionMessage(
        t(
          '✨ تم خلط وتجانس المحلول بنجاح عبر تحريك العصا الزجاجية المخبرية!',
          '✨ Solution successfully stirred and homogenized using the laboratory glass rod!'
        )
      );
    }, 2400);
  };

  // Direct interactive dragging of the glass stirring rod on the canvas
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if pointer is inside the beaker area
    const beakerX = 140;
    const beakerW = 180;
    const beakerY = 110;
    const beakerH = 200;
    if (x >= beakerX - 25 && x <= beakerX + beakerW + 35 && y >= beakerY - 55 && y <= beakerY + beakerH + 10) {
      isDraggingRodRef.current = true;
      rodDragPosRef.current = { x, y };
      setIsStirring(true);
      try {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRodRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    rodDragPosRef.current = { x, y };
    stirAngleRef.current += 0.32;

    if (!isStirring) {
      setIsStirring(true);
    }

    // Incremental dissolution as the user keeps moving the rod
    if (stirTimeoutRef.current) clearTimeout(stirTimeoutRef.current);
    stirTimeoutRef.current = window.setTimeout(() => {
      if (isDraggingRodRef.current) {
        setContent(prev => ({
          ...prev,
          calciumChlorideG: Math.max(0, prev.calciumChlorideG - 1.2),
          bakingSodaG: Math.max(0, prev.bakingSodaG - 1.2),
          precipitateG: Math.max(0, prev.precipitateG - 1)
        }));
      }
    }, 180);
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRodRef.current) return;
    isDraggingRodRef.current = false;
    rodDragPosRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    setTimeout(() => {
      setIsStirring(false);
      setContent(prev => ({
        ...prev,
        calciumChlorideG: Math.max(0, prev.calciumChlorideG - 4),
        bakingSodaG: Math.max(0, prev.bakingSodaG - 4),
        precipitateG: Math.max(0, prev.precipitateG - 3)
      }));
      setLastActionMessage(
        t(
          '✨ تم خلط وتجانس المحلول بنجاح عبر تحريك العصا الزجاجية باليد!',
          '✨ Solution stirred and mixed with the glass rod!'
        )
      );
    }, 600);
  };

  // Empty and rinse the beaker with pure distilled water
  const handleCleanBeaker = () => {
    setContent({
      waterMl: 100,
      acidMl: 0,
      baseMl: 0,
      copperSulfateMl: 0,
      bakingSodaG: 0,
      calciumChlorideG: 0,
      phenolphthaleinDrops: 0,
      universalDrops: 0,
      iceCount: 0,
      ironG: 0,
      precipitateG: 0,
      permanganateG: 0,
      peroxideMl: 0,
      silverNitrateMl: 0,
      ammoniaMl: 0,
      sodiumG: 0,
      potassiumG: 0,
      magnesiumG: 0,
      ethanolMl: 0,
      hydrogenGasMl: 0,
      aceticAcidMl: 0,
      strontiumG: 0,
      bariumG: 0,
      zincG: 0,
      sulfuricAcidMl: 0,
      nitricAcidMl: 0,
      sucroseG: 0,
      sodiumAcetateG: 0,
      potassiumIodideG: 0,
      leadNitrateMl: 0,
      copperMetalG: 0,
      aluminumG: 0,
      alumG: 0,
      iodineDrops: 0,
      starchG: 0,
      luminolMl: 0,
      luminolG: 0,
      ferricChlorideMl: 0,
      thiocyanateMl: 0,
      potassiumThiocyanateMl: 0,
      ferrocyanideG: 0,
      potassiumFerrocyanideMl: 0,
      dichromateG: 0,
      ammoniumDichromateG: 0,
      cobaltChlorideG: 0,
      cobaltChlorideMl: 0,
      sodiumSilicateMl: 0,
      ironOxideG: 0,
      ironOxideThermiteG: 0,
      calciumCarbideG: 0,
      thiosulfateMl: 0,
      sodiumThiosulfateMl: 0,
      glucoseG: 0,
      methyleneBlueDrops: 0,
      methyleneBlueMl: 0,
      indigoCarmineDrops: 0,
      indigoCarmineMl: 0,
      lithiumG: 0,
      nickelSulfateMl: 0,
      goldChlorideMl: 0,
      ammoniumChlorideG: 0,
      tollensReagentMl: 0,
      fehlingMl: 0,
      oxalicAcidMl: 0
    });
    explosionsRef.current = [];
    skitteringPelletsRef.current = [];
    pourAnimationRef.current = null;
    flashOverlayRef.current = null;
    setIsEthanolBurning(false);
    setBurnerPower('off');
    setCurrentTempC(23.5);
    setEffervescenceBubbles(0);
    setLitmusStripDipped(false);
    balloonTargetRef.current = 0;
    setBalloonInflation(0);
    setIsBalloonAttached(false);
    setSwellingType('none');
    setSwellingLevel(0);
    setCrystalType('none');
    setCrystalLevel(0);
    setBrownGasIntensity(0);
    setChemiluminescenceLevel(0);
    setSilverMirrorLevel(0);
    setDichromateVolcanoLevel(0);
    setThermiteLevel(0);
    setWhiteSmokeIntensity(0);
    setHasChemicalGarden(false);
    setHasGoldTree(false);
    setTrafficLightStage('none');
    setBlueBottleStage('none');
    setActiveChemicalEquation('H₂O(l) ⇌ H⁺(aq) + OH⁻(aq)   [pH = 7.00]');
    setMissionComplete(false);
    setLastActionMessage(t('تم تفريغ الكأس وغسيله بـ 100 مل ماء مقطر نقي. الكأس جاهز لتجربة جديدة.', 'Beaker emptied and flushed with 100 mL pure distilled water. Ready for fresh experiment.'));
  };

  // Trigger or nucleate geometric crystallization in the beaker (only when the user has added the appropriate salt!)
  const handleTriggerCrystallization = () => {
    if ((content.leadNitrateMl || 0) > 0 && (content.potassiumIodideG || 0) > 0) {
      playSoundEffect('crystallize');
      setCrystalType('golden_rain');
      setCrystalLevel(100);
      setLastActionMessage(t('✨💎 اكتمل تبلور المطر الذهبي (PbI₂)! بلورات سداسية ذهبية متلألئة تسبح وتترسب في المحلول!', '✨💎 Golden Rain Crystallization (PbI₂) complete! Glittering hexagonal golden crystals drifting in solution!'));
    } else if ((content.sodiumAcetateG || 0) > 0) {
      playSoundEffect('crystallize');
      setCrystalType('hot_ice');
      setCrystalLevel(96);
      setCurrentTempC(prev => Math.min(56, prev + 16));
      setLastActionMessage(t('❄️💎 تبلور الثلج الساخن الفوري (CH₃COONa)! تشكلت أبراج بلورية إبرية بيضاء كثيفة مع انبعاث حرارة التبلور!', '❄️💎 Instant Hot Ice Crystallization (CH₃COONa)! Dense white crystalline needle towers formed exothermically!'));
    } else if (content.copperSulfateMl > 0) {
      playSoundEffect('crystallize');
      setCrystalType('copper_blue');
      setCrystalLevel(prev => Math.min(100, Math.max(75, prev + 35)));
      setCurrentTempC(prev => Math.max(8, prev - 6));
      setLastActionMessage(t('🔷💎 تبلور كبريتات النحاس الزرقاء (CuSO₄·5H₂O)! نمت البلورات الهندسية الزرقاء اللامعة في قاع وجوانب الكأس!', '🔷💎 Blue Copper Sulfate Crystallization! Geometric royal-blue crystals grew across the beaker floor!'));
    } else if (((content.zincG || 0) > 0 || (content.copperMetalG || 0) > 0) && (content.silverNitrateMl > 0 || (content.leadNitrateMl || 0) > 0)) {
      playSoundEffect('crystallize');
      setCrystalType('silver_tree');
      setCrystalLevel(95);
      setLastActionMessage(t('🌲💎 تبلورت شجرة الفضة/الرصاص المعدنية المتفرعة! إبر بلورية معدنية براقة نمت بالاختزال الكيميائي!', '🌲💎 Metallic Dendritic Crystal Tree grown! Shimmering metallic crystal needles formed!'));
    } else if ((content.alumG || 0) > 0) {
      playSoundEffect('crystallize');
      setCrystalType('alum_clear');
      setCrystalLevel(95);
      setLastActionMessage(t('💎 تبلورت بلورات شب البوتاسيوم الثمانية الأوجه الشفافة بنقاء عالٍ!', '💎 Large transparent octahedral Potassium Alum crystals formed!'));
    } else {
      playSoundEffect('click');
      setLastActionMessage(t('💡 لتحضير التبلور بنفسك: أضف أولاً من رف المواد الكيميائية (خلات الصوديوم CH₃COONa) للثلج الساخن، أو (كبريتات النحاس CuSO₄)، أو (شب البوتاسيوم)، ثم اضغط زر تحفيز التبلور أو أضف مكعبات الثلج!', '💡 To crystallize manually: First add Sodium Acetate (Hot Ice), Copper Sulfate, or Potassium Alum from the shelf, then click Crystallize or add Ice!'));
    }
  };

  // Interactive Step-by-Step Reaction Recipes Guide (Teaches the user HOW to do every reaction manually without auto-running it!)
  const REACTION_RECIPES: {
    id: string;
    icon: string;
    labelAr: string;
    labelEn: string;
    badge: string;
    equation: string;
    requiredReagents: string[];
    stepsAr: string[];
    stepsEn: string[];
    resultAr: string;
    resultEn: string;
    isCompleted: (c: BeakerContent) => boolean;
  }[] = [
    {
      id: 'zinc_strong_acid_balloon',
      icon: '🎈',
      labelAr: 'الخارصين + حمض الكبريتيك القوي (انتفاخ البالون)',
      labelEn: 'Zinc + Strong H₂SO₄ (Balloon Inflation)',
      badge: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑',
      equation: 'Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂↑ (Gradual Balloon Inflation)',
      requiredReagents: ['sulfuric_acid', 'zinc_granules'],
      stepsAr: [
        '1️⃣ اضغط على زر (تركيب البالون 🎈) أسفل الكأس ليغطي فوهة الكأس بالكامل.',
        '2️⃣ من رف المواد الكيميائية، أضف (حمض الكبريتيك المركز H₂SO₄) إلى الكأس.',
        '3️⃣ أضف (حبيبات الخارصين Zn) من قسم الفلزات، وراقب الفوران وتصاعد غاز الهيدروجين وانتفاخ البالون تدريجياً!'
      ],
      stepsEn: [
        '1️⃣ Click "Attach Balloon 🎈" below the beaker to seal the beaker rim.',
        '2️⃣ From the chemical shelf, add Concentrated Sulfuric Acid (H₂SO₄).',
        '3️⃣ Add Zinc Granules (Zn) and watch H₂ gas evolve and gradually inflate the balloon!'
      ],
      resultAr: 'يتفاعل الخارصين مع الحمض القوي مطلقاً فقاعات غاز الهيدروجين H₂ مع ارتفاع الحرارة وانتفاخ البالون تدريجياً.',
      resultEn: 'Zinc reacts vigorously with strong acid, releasing H₂ gas bubbles, exothermic heat, and gradually inflating the balloon.',
      isCompleted: c => (c.zincG || 0) > 0 && ((c.sulfuricAcidMl || 0) > 0 || c.acidMl > 0) && balloonInflation > 5
    },
    {
      id: 'carbon_snake_swelling',
      icon: '🐍',
      labelAr: 'انتفاخ ثعبان الكربون الأسود (سكر + H₂SO₄ مركز)',
      labelEn: 'Carbon Snake Swelling (Sugar + Conc. H₂SO₄)',
      badge: 'C₁₂H₂₂O₁₁ + H₂SO₄',
      equation: 'C₁₂H₂₂O₁₁(s) --(Conc. H₂SO₄)--> 12C(s, Rising Black Column) + 11H₂O(g)',
      requiredReagents: ['sucrose_sugar', 'sulfuric_acid'],
      stepsAr: [
        '1️⃣ من رف المواد الكيميائية، أضف (سكروز / سكر المائدة C₁₂H₂₂O₁₁) إلى الكأس.',
        '2️⃣ أضف (حمض الكبريتيك المركز القوي H₂SO₄) فوق السكر.',
        '3️⃣ شاهد كيف ينزع الحمض الماء من السكر فينتفخ عمود الكربون المسامي الأسود عالياً مع البخار الساخن!'
      ],
      stepsEn: [
        '1️⃣ From the chemical shelf, add Sucrose Sugar (C₁₂H₂₂O₁₁) into the beaker.',
        '2️⃣ Add Concentrated Sulfuric Acid (H₂SO₄) onto the sugar.',
        '3️⃣ Watch the acid dehydrate the sugar into a rising porous black carbon column!'
      ],
      resultAr: 'تفحم السكر وانتفاخ عمود أسود مسامي من الكربون النقي (ثعبان الكربون) مع انبعاث حرارة وبخار.',
      resultEn: 'Dehydration of sucrose into a tall, porous black carbon foam column with steam and heat.',
      isCompleted: () => swellingType === 'carbon_snake' && swellingLevel > 0
    },
    {
      id: 'hot_ice_crystallization',
      icon: '❄️',
      labelAr: 'التبلور الفوري: الثلج الساخن (خلات الصوديوم)',
      labelEn: 'Instant Crystallization: Hot Ice (CH₃COONa)',
      badge: 'CH₃COONa·3H₂O',
      equation: 'CH₃COONa(aq, Supersaturated) → CH₃COONa·3H₂O(s, Needle Crystals) + ΔH',
      requiredReagents: ['sodium_acetate', 'ice_cubes'],
      stepsAr: [
        '1️⃣ تأكد من وجود ماء في الكأس (أو اضغط غسيل مقطر).',
        '2️⃣ من رف المواد، أضف (خلات الصوديوم فائقة التشبع CH₃COONa).',
        '3️⃣ يمكنك أيضاً إضافة (مكعبات ثلج) أو الضغط على زر (تبلور المحلول 💎) أسفل الكأس لزيادة نمو الأبراج البلورية الإبرية الدافئة!'
      ],
      stepsEn: [
        '1️⃣ Start with water in the beaker.',
        '2️⃣ Add Supersaturated Sodium Acetate (CH₃COONa) from the shelf.',
        '3️⃣ Watch instant exothermic needle crystal towers form (add Ice or click Crystallize 💎 for more)!'
      ],
      resultAr: 'تبلور فوري ناشر للحرارة يشكل أبراجاً بلورية إبرية بيضاء دافئة تعرف بالثلج الساخن.',
      resultEn: 'Instant exothermic crystallization forming warm white crystalline needle towers.',
      isCompleted: () => crystalType === 'hot_ice' && crystalLevel > 0
    },
    {
      id: 'golden_rain_crystals',
      icon: '✨',
      labelAr: 'تبلور المطر الذهبي المتلألئ (PbI₂)',
      labelEn: 'Golden Rain Crystallization (PbI₂)',
      badge: 'Pb(NO₃)₂ + 2KI → PbI₂↓',
      equation: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂↓ (Shimmering Golden Hexagonal Crystals) + 2KNO₃',
      requiredReagents: ['lead_nitrate', 'potassium_iodide'],
      stepsAr: [
        '1️⃣ من رف المواد الكيميائية، أضف محلول (نترات الرصاص Pb(NO₃)₂) إلى الكأس.',
        '2️⃣ أضف مسحوق (يوديد البوتاسيوم KI) من الرف.',
        '3️⃣ شاهد تساقط وتلألؤ رقائق وبلورات يوديد الرصاص الذهبية السداسية كالمطر الذهبي!'
      ],
      stepsEn: [
        '1️⃣ Add Lead(II) Nitrate solution Pb(NO₃)₂ from the shelf.',
        '2️⃣ Add Potassium Iodide powder (KI).',
        '3️⃣ Watch glittering golden hexagonal PbI₂ crystals precipitate like golden rain!'
      ],
      resultAr: 'تكون بلورات سداسية ذهبية براقة من يوديد الرصاص الثنائي PbI₂ تسبح وتترسب في المحلول.',
      resultEn: 'Glittering golden hexagonal flakes of Lead(II) Iodide (PbI₂) drifting through the solution.',
      isCompleted: () => crystalType === 'golden_rain' && (content.leadNitrateMl || 0) > 0 && (content.potassiumIodideG || 0) > 0
    },
    {
      id: 'elephant_toothpaste_foam',
      icon: '🌋',
      labelAr: 'انتفاخ رغوة معجون أسنان الفيل العملاقة',
      labelEn: 'Elephant Toothpaste Giant Foam Inflation',
      badge: '2H₂O₂ --(KI)--> 2H₂O + O₂↑',
      equation: '2H₂O₂(aq) --(KI Catalyst)--> 2H₂O(l) + O₂↑ (Giant Exothermic Foam Tower)',
      requiredReagents: ['hydrogen_peroxide', 'potassium_iodide'],
      stepsAr: [
        '1️⃣ من رف المواد، أضف (فوق أكسيد الهيدروجين / ماء الأكسجين H₂O₂) إلى الكأس.',
        '2️⃣ أضف الحفاز (يوديد البوتاسيوم KI) أو (برمنغنات البوتاسيوم KMnO₄).',
        '3️⃣ شاهد التفكك الحفزي السريع وانتفاخ برج الرغوة الكثيفة الساخنة!'
      ],
      stepsEn: [
        '1️⃣ Add Hydrogen Peroxide (H₂O₂) from the shelf.',
        '2️⃣ Add Potassium Iodide (KI) or Potassium Permanganate (KMnO₄) as a catalyst.',
        '3️⃣ Watch rapid O₂ gas evolution swell into a giant exothermic foam tower!'
      ],
      resultAr: 'يتفكك ماء الأكسجين بسرعة هائلة مطلقاً غاز الأكسجين الذي يحبس في رغوة عملاقة منتفخة مع حرارة.',
      resultEn: 'Rapid catalytic decomposition of H₂O₂ traps oxygen gas inside a massive rising foam column.',
      isCompleted: () => swellingType === 'elephant_foam' && swellingLevel > 0
    },
    {
      id: 'nitric_acid_copper_no2',
      icon: '☁️',
      labelAr: 'حمض النيتريك القوي + النحاس (سحب NO₂ البنية)',
      labelEn: 'Conc. Nitric Acid + Copper (Brown NO₂ Gas)',
      badge: 'Cu + 4HNO₃ → Cu(NO₃)₂ + 2NO₂↑',
      equation: 'Cu(s) + 4HNO₃(conc) → Cu(NO₃)₂(aq, Green) + 2NO₂↑(Brown Gas) + 2H₂O',
      requiredReagents: ['nitric_acid', 'copper_turnings'],
      stepsAr: [
        '1️⃣ اختياري: اضغط (تركيب البالون 🎈) إذا أردت حبس الغاز ونفخ البالون.',
        '2️⃣ من رف المواد، أضف (حمض النيتريك المركز HNO₃) إلى الكأس.',
        '3️⃣ أضف (رقائق النحاس الفلزي Cu) وشاهد تحول المحلول للأخضر الزمردي وتصاعد سحب غاز NO₂ البنية الكثيفة!'
      ],
      stepsEn: [
        '1️⃣ Optional: Click "Attach Balloon 🎈" to capture the evolved gas.',
        '2️⃣ Add Concentrated Nitric Acid (HNO₃) from the shelf.',
        '3️⃣ Add Copper Turnings (Cu) and observe the emerald-green solution and dense brown NO₂ gas clouds!'
      ],
      resultAr: 'يؤكسد حمض النيتريك المركز النحاس فיתحول المحلول للأخضر الزمردي وتتصاعد أبخرة بنية حمراء من NO₂.',
      resultEn: 'Concentrated nitric acid oxidizes copper, turning the solution emerald green and releasing reddish-brown NO₂ gas.',
      isCompleted: () => brownGasIntensity > 0
    },
    {
      id: 'silver_crystal_tree',
      icon: '🌲',
      labelAr: 'تبلور شجرة الفضة بالخارصين (إزاحة وتبلور)',
      labelEn: 'Silver Crystal Tree by Zinc Displacement',
      badge: 'Zn + 2AgNO₃ → 2Ag↓ + Zn(NO₃)₂',
      equation: 'Zn(s) + 2Ag⁺(aq) → Zn²⁺(aq) + 2Ag⁰↓ (Dendritic Silver Crystal Tree)',
      requiredReagents: ['silver_nitrate', 'zinc_granules'],
      stepsAr: [
        '1️⃣ من رف المواد، أضف محلول (نترات الفضة AgNO₃) إلى الكأس.',
        '2️⃣ أضف (حبيبات الخارصين Zn) أو (رقائق النحاس Cu) من قسم الفلزات.',
        '3️⃣ شاهد اختزال أيونات الفضة ونمو شجرة بلورات الفضة المعدنية المتفرعة في الكأس!'
      ],
      stepsEn: [
        '1️⃣ Add Silver Nitrate solution (AgNO₃) from the shelf.',
        '2️⃣ Add Zinc Granules (Zn) or Copper Turnings (Cu).',
        '3️⃣ Watch silver ions reduce into glittering dendritic silver crystal needles!'
      ],
      resultAr: 'يزيح الفلز النشط أيونات الفضة فتنمو إبر وتفرعات بلورية فضية براقة في قاع الكأس.',
      resultEn: 'Active metal displaces silver ions, growing shimmering dendritic silver crystal branches.',
      isCompleted: () => crystalType === 'silver_tree' && crystalLevel > 0
    },
    {
      id: 'copper_sulfate_crystals',
      icon: '🔷',
      labelAr: 'تبلور كبريتات النحاس الزرقاء بالتبريد',
      labelEn: 'Blue Copper Sulfate Cooling Crystallization',
      badge: 'CuSO₄·5H₂O',
      equation: 'Cu²⁺(aq) + SO₄²⁻(aq) + 5H₂O(l) --(Cooling)--> CuSO₄·5H₂O(s, Blue Crystals)',
      requiredReagents: ['copper_sulfate', 'ice_cubes'],
      stepsAr: [
        '1️⃣ من رف المواد، أضف محلول (كبريتات النحاس الزرقاء CuSO₄) بكمية كافية (مثلاً 25 مل).',
        '2️⃣ أضف (مكعبات ثلج نقية) من الرف لتبريد المحلول وخفض ذائبيته (أو اضغط زر تبلور المحلول 💎).',
        '3️⃣ شاهد نمو البلورات الهندسية الزرقاء الملكية الكبيرة في قاع الكأس!'
      ],
      stepsEn: [
        '1️⃣ Add Blue Copper Sulfate solution (CuSO₄) from the shelf.',
        '2️⃣ Add Ice Cubes to cool the solution and lower solubility (or click Crystallize 💎).',
        '3️⃣ Watch geometric royal-blue triclinic crystals grow at the bottom of the beaker!'
      ],
      resultAr: 'مع انخفاض درجة الحرارة تقل ذائبية كبريتات النحاس فتنمو بلورات ثلاثية الميل زرقاء لامعة.',
      resultEn: 'Cooling reduces solubility, nucleating large royal-blue copper sulfate pentahydrate crystals.',
      isCompleted: () => crystalType === 'copper_blue' && crystalLevel > 0 && !hasChemicalGarden
    },
    {
      id: 'luminol_glow',
      icon: '✨',
      labelAr: 'الضيائية الكيميائية للومينول (توهج أزرق)',
      labelEn: 'Luminol Chemiluminescence (425nm Glow)',
      badge: 'Luminol + H₂O₂ + FeCl₃',
      equation: 'C₈H₇N₃O₂ + 2H₂O₂ --(FeCl₃)--> 3-APA*²⁻ → N₂↑ + ℏω (425 nm Blue Glow)',
      requiredReagents: ['luminol', 'hydrogen_peroxide', 'ferric_chloride'],
      stepsAr: [
        '1️⃣ من رف المواد، أضف مسحوق (اللومينول الجنائي المضيء C₈H₇N₃O₂) إلى الكأس.',
        '2️⃣ أضف (فوق أكسيد الهيدروجين / ماء الأكسجين H₂O₂).',
        '3️⃣ أضف قطرات من الحفاز (كلوريد الحديديك FeCl₃) وشاهد التوهج الأزرق النيوني الساطع بدون حرارة!'
      ],
      stepsEn: [
        '1️⃣ Add Luminol powder (C₈H₇N₃O₂) from the shelf.',
        '2️⃣ Add Hydrogen Peroxide (H₂O₂).',
        '3️⃣ Add Ferric Chloride (FeCl₃) as catalyst to trigger bright 425nm neon-blue chemiluminescence!'
      ],
      resultAr: 'يتأكسد اللومينول منتجاً جزيئات مثارة تطلق فوتونات ضوئية زرقاء ساطعة (425 نانومتر) كضوء بارد.',
      resultEn: 'Luminol oxidizes into an excited state that emits bright 425nm blue photons without heat.',
      isCompleted: () => chemiluminescenceLevel > 0
    },
    {
      id: 'tollens_silver_mirror',
      icon: '🪞',
      labelAr: 'مرآة الفضة الحقيقية (اختبار تولنز + الجلوكوز)',
      labelEn: 'Tollens’ Silver Mirror (Ag⁰ Reflection)',
      badge: '[Ag(NH₃)₂]⁺ + Glucose',
      equation: 'CH₂OH(CHOH)₄CHO + 2[Ag(NH₃)₂]OH → 2Ag⁰↓ (Silver Mirror) + RCOONH₄ + 3NH₃ + H₂O',
      requiredReagents: ['tollens_reagent', 'glucose_sugar'],
      stepsAr: [
        '1️⃣ من رف المواد، أضف (كاشف تولنز - نترات الفضة الأمونياكية [Ag(NH₃)₂]OH) إلى الكأس.',
        '2️⃣ أضف (سكر الجلوكوز المختزل C₆H₁₂O₆) من الرف.',
        '3️⃣ شاهد كيف يختزل الجلوكوز أيونات الفضة فتترسب طبقة فضية عاكسة كالمرآة على جدار الكأس!'
      ],
      stepsEn: [
        '1️⃣ Add Tollens’ Reagent ([Ag(NH₃)₂]OH) from the shelf.',
        '2️⃣ Add reducing D-Glucose sugar (C₆H₁₂O₆).',
        '3️⃣ Watch silver ions reduce into a reflective metallic silver mirror coating the beaker walls!'
      ],
      resultAr: 'تختزل مجموعة الألدهيد في الجلوكوز معقد الفضة الأمونياكي لترسب الفضة النقية العاكسة على الزجاج.',
      resultEn: 'Aldehyde group in glucose reduces ammoniacal silver ions into a mirror-like metallic silver coating.',
      isCompleted: () => silverMirrorLevel > 0
    },
    {
      id: 'chemical_traffic_light',
      icon: '🚦',
      labelAr: 'إشارة المرور الكيميائية (أصفر ⇌ أحمر ⇌ أخضر)',
      labelEn: 'Chemical Traffic Light (Yellow ⇌ Red ⇌ Green)',
      badge: 'Indigo Carmine + Glucose + NaOH',
      equation: 'Indigo Carmine (Yellow, Reduced) + O₂ (Stirring) ⇌ Crimson Red ⇌ Emerald Green',
      requiredReagents: ['glucose_sugar', 'base_naoh', 'indigo_carmine'],
      stepsAr: [
        '1️⃣ أضف (سكر الجلوكوز C₆H₁₂O₆) ثم أضف (هيدروكسيد الصوديوم NaOH) لجعل الوسط قلوياً مختزلاً.',
        '2️⃣ أضف كاشف (الإنديجو كارمين Indigo Carmine) فيصبح المحلول باللون الأصفر الذهبي.',
        '3️⃣ اضغط على زر (خلط بالعصا الزجاجية) أسفل الكأس لإدخال الأكسجين ومشاهدة التحول إلى الأحمر القرمزي ثم الأخضر الزمردي!'
      ],
      stepsEn: [
        '1️⃣ Add D-Glucose sugar and Sodium Hydroxide (NaOH) to create an alkaline reducing solution.',
        '2️⃣ Add Indigo Carmine indicator — the solution turns golden yellow.',
        '3️⃣ Click "Stir with Glass Rod" below the beaker to dissolve O₂ and shift colors to Red then Green!'
      ],
      resultAr: 'تفاعل أكسدة واختزال عكوس يتغير لونه مثل إشارة المرور (أصفر ⇌ أحمر ⇌ أخضر) عند التحريك بالعصا.',
      resultEn: 'Reversible redox clock reaction shifting from Yellow to Red to Green upon stirring in oxygen.',
      isCompleted: () => trafficLightStage !== 'none'
    },
    {
      id: 'blue_bottle_experiment',
      icon: '🧪',
      labelAr: 'تجربة القارورة الزرقاء السحرية (Blue Bottle)',
      labelEn: 'Famous Blue Bottle Redox Experiment',
      badge: 'Methylene Blue + Glucose + NaOH',
      equation: 'Leucomethylene Blue (Colorless) + ½O₂ (Stirring) ⇌ Methylene Blue (Royal Blue)',
      requiredReagents: ['glucose_sugar', 'base_naoh', 'methylene_blue'],
      stepsAr: [
        '1️⃣ أضف (سكر الجلوكوز C₆H₁₂O₆) ثم أضف (هيدروكسيد الصوديوم NaOH) إلى الماء في الكأس.',
        '2️⃣ أضف كاشف (أزرق الميثيلين Methylene Blue) — سيختزله الجلوكوز ليصبح شفافاً عديم اللون.',
        '3️⃣ اضغط زر (خلط بالعصا الزجاجية) ليتحول المحلول فوراً إلى الأزرق الملكي بفعل الأكسجين ثم يعود شفافاً تلقائياً!'
      ],
      stepsEn: [
        '1️⃣ Add D-Glucose sugar and Sodium Hydroxide (NaOH) to water in the beaker.',
        '2️⃣ Add Methylene Blue indicator — alkaline glucose reduces it to colorless Leucomethylene Blue.',
        '3️⃣ Click "Stir with Glass Rod" to oxygenate the liquid into Royal Blue, then watch it fade back to clear!'
      ],
      resultAr: 'يتأكسد ليوكوميثيلين الأزرق عديم اللون عند التحريك إلى الأزرق الملكي ثم يختزله الجلوكوز مجدداً لشفاف.',
      resultEn: 'Colorless leucomethylene blue oxidizes to royal blue when stirred, then slowly reduces back to clear.',
      isCompleted: () => blueBottleStage !== 'none'
    },
    {
      id: 'chemical_crystal_garden',
      icon: '🌿',
      labelAr: 'الحديقة الكيميائية البلورية ثلاثية الأبعاد',
      labelEn: '3D Osmotic Chemical Crystal Garden',
      badge: 'Na₂SiO₃ + Metal Salts',
      equation: 'M²⁺/M³⁺(s) + Na₂SiO₃(aq) → MSiO₃ (3D Osmotic Silicate Crystal Towers)',
      requiredReagents: ['sodium_silicate', 'copper_sulfate', 'cobalt_chloride', 'ferric_chloride'],
      stepsAr: [
        '1️⃣ من رف المواد، أضف محلول (سيليكات الصوديوم / الزجاج المائي Na₂SiO₃) إلى الكأس.',
        '2️⃣ أضف واحداً أو أكثر من أملاح المعادن الملونة: (كبريتات النحاس CuSO₄) أو (كلوريد الكوبالت CoCl₂) أو (كلوريد الحديديك FeCl₃).',
        '3️⃣ شاهد نمو الأبراج والصواعد البلورية الأسموزية الملونة داخل الكأس!'
      ],
      stepsEn: [
        '1️⃣ Add Sodium Silicate (Water Glass, Na₂SiO₃) from the shelf.',
        '2️⃣ Add colored metal salts: Copper Sulfate (CuSO₄), Cobalt Chloride (CoCl₂), or Ferric Chloride (FeCl₃).',
        '3️⃣ Watch colorful osmotic silicate crystal towers sprout upward inside the beaker!'
      ],
      resultAr: 'تتشكل أغشية سيليكاتية شبه منفذة حول أملاح المعادن وتنمو صواعد بلورية ملونة بفعل الضغط الأسموزي.',
      resultEn: 'Semi-permeable silicate membranes form around metal salts, growing upward via osmotic pressure.',
      isCompleted: () => hasChemicalGarden
    },
    {
      id: 'thermite_2500',
      icon: '🔥',
      labelAr: 'تفاعل الثرميت المنصهر (حديد منصهر 2500°C)',
      labelEn: '2500°C Molten Iron Thermite Reaction',
      badge: 'Fe₂O₃ + 2Al → 2Fe(l) + Al₂O₃',
      equation: 'Fe₂O₃(s) + 2Al(s) --(2500°C Spark)--> 2Fe(l, Molten Iron) + Al₂O₃(s) + 851.5 kJ',
      requiredReagents: ['iron_oxide_thermite', 'aluminum_powder'],
      stepsAr: [
        '1️⃣ اضغط زر (كأس جاف 0 ml) أعلى الكأس لتفريغ الماء، ثم أضف (أكسيد الحديديك - مسحوق الثرميت Fe₂O₃).',
        '2️⃣ أضف (حبيبات ومسحوق الألومنيوم Al) من الرف.',
        '3️⃣ اضغط زر (شرارة إشعال ⚡) أو شغّل (موقد بنزن 🔥) لإطلاق تفاعل الثرميت الهائل وانصهار الحديد عند 2500°C!'
      ],
      stepsEn: [
        '1️⃣ Click "Dry Beaker (0 ml)", then add Iron(III) Oxide Thermite powder (Fe₂O₃).',
        '2️⃣ Add Aluminum Powder (Al) from the shelf.',
        '3️⃣ Click "Spark ⚡" or turn on the "Bunsen Burner 🔥" to ignite the 2500°C molten iron reaction!'
      ],
      resultAr: 'يختزل الألومنيوم أكسيد الحديديك في تفاعل طارد للحرارة هائل ينتج حديداً منصهراً متوهجاً وشرارات ساطعة.',
      resultEn: 'Aluminum reduces iron(III) oxide exothermically at 2500°C, producing glowing white-hot molten iron.',
      isCompleted: () => thermiteLevel > 0
    },
    {
      id: 'dichromate_volcano',
      icon: '🌋',
      labelAr: 'بركان ثنائي كرومات الأمونيوم (رماد Cr₂O₃ الأخضر)',
      labelEn: 'Ammonium Dichromate Chemical Volcano',
      badge: '(NH₄)₂Cr₂O₇ --(Δ)--> Cr₂O₃',
      equation: '(NH₄)₂Cr₂O₇(s) --(Δ)--> Cr₂O₃(s, Green Volcanic Cone) + N₂↑ + 4H₂O(g)',
      requiredReagents: ['ammonium_dichromate'],
      stepsAr: [
        '1️⃣ يمكنك الضغط على (كأس جاف 0 ml) ثم إضافة بلورات (ثنائي كرومات الأمونيوم البرتقالية (NH₄)₂Cr₂O₇) من الرف.',
        '2️⃣ اضغط على زر (شرارة إشعال ⚡) أو شغّل (موقد بنزن 🔥) أسفل الكأس.',
        '3️⃣ شاهد ثوران البركان الكيميائي وتطاير الشرر وتشكل مخروط الرماد البركاني الأخضر Cr₂O₃!'
      ],
      stepsEn: [
        '1️⃣ Add orange Ammonium Dichromate crystals ((NH₄)₂Cr₂O₇) from the shelf.',
        '2️⃣ Click "Spark ⚡" or turn on the "Bunsen Burner 🔥" below the beaker.',
        '3️⃣ Watch the chemical volcano erupt with glowing sparks and build a green Cr₂O₃ ash cone!'
      ],
      resultAr: 'تتفكك ثنائي كرومات الأمونيوم حرارياً مطلقةً شرارات نارية وغاز النيتروجين ومخروطاً بركانياً أخضر.',
      resultEn: 'Thermal decomposition of ammonium dichromate produces fiery sparks, N₂ gas, and green Cr₂O₃ ash.',
      isCompleted: () => dichromateVolcanoLevel > 0
    },
    {
      id: 'fake_blood_complex',
      icon: '🩸',
      labelAr: 'تفاعل الدم الكيميائي السينمائي [Fe(SCN)]²⁺',
      labelEn: 'Cinematic Fake Blood Complex [Fe(SCN)]²⁺',
      badge: 'FeCl₃ + KSCN → [Fe(SCN)]²⁺',
      equation: 'FeCl₃(aq) + KSCN(aq) ⇌ [Fe(SCN)]²⁺(aq, Deep Blood-Red Complex) + KCl',
      requiredReagents: ['ferric_chloride', 'potassium_thiocyanate'],
      stepsAr: [
        '1️⃣ من رف المواد، أضف محلول (كلوريد الحديديك الأصفر الكهرماني FeCl₃) إلى الكأس.',
        '2️⃣ أضف محلول (ثيوسيانات البوتاسيوم KSCN) الشفاف من الرف.',
        '3️⃣ شاهد التحول الفوري للمحلول إلى اللون الأحمر الدموي القاتم!'
      ],
      stepsEn: [
        '1️⃣ Add amber Ferric Chloride solution (FeCl₃) from the shelf.',
        '2️⃣ Add colorless Potassium Thiocyanate solution (KSCN).',
        '3️⃣ Watch the solution instantly turn deep blood-red as the [Fe(SCN)]²⁺ complex forms!'
      ],
      resultAr: 'تتحد أيونات الحديديك الثلاثية مع أيونات الثيوسيانات لتكوين معقد أحمر دموي فائق الكثافة اللونية.',
      resultEn: 'Fe³⁺ ions coordinate with SCN⁻ ions to form the intensely blood-red thiocyanatoiron(III) complex.',
      isCompleted: c => (c.ferricChlorideMl || 0) > 0 && (c.potassiumThiocyanateMl || 0) > 0
    },
    {
      id: 'prussian_blue_pigment',
      icon: '🎨',
      labelAr: 'تصنيع صبغة أزرق بروسيا الملكية',
      labelEn: 'Prussian Blue Royal Pigment Synthesis',
      badge: '4FeCl₃ + 3K₄[Fe(CN)₆]',
      equation: '4FeCl₃ + 3K₄[Fe(CN)₆] → Fe₄[Fe(CN)₆]₃↓ (Prussian Blue) + 12KCl',
      requiredReagents: ['ferric_chloride', 'potassium_ferrocyanide'],
      stepsAr: [
        '1️⃣ من رف المواد، أضف محلول (كلوريد الحديديك FeCl₃) إلى الكأس.',
        '2️⃣ أضف محلول (حديدو سيانيد البوتاسيوم K₄[Fe(CN)₆]) من الرف.',
        '3️⃣ شاهد تكون راسب وصبغة أزرق بروسيا الملكية الداكنة فوراً!'
      ],
      stepsEn: [
        '1️⃣ Add Ferric Chloride solution (FeCl₃) from the shelf.',
        '2️⃣ Add Potassium Ferrocyanide solution (K₄[Fe(CN)₆]).',
        '3️⃣ Watch rich royal Prussian Blue pigment (Fe₄[Fe(CN)₆]₃) precipitate!'
      ],
      resultAr: 'تفاعل ترسيب معقد ينتج أول صبغة زرقاء صناعية في التاريخ (أزرق بروسيا Fe₄[Fe(CN)₆]₃).',
      resultEn: 'Coordination precipitation producing historic royal Prussian Blue pigment.',
      isCompleted: c => (c.ferricChlorideMl || 0) > 0 && (c.potassiumFerrocyanideMl || 0) > 0
    },
    {
      id: 'gold_tree_24k',
      icon: '👑',
      labelAr: 'ترسيب شجرة الذهب الخالص عيار 24 قيراطاً',
      labelEn: '24K Pure Gold Dendritic Crystal Tree',
      badge: '2HAuCl₄ + 3Zn → 2Au⁰↓',
      equation: '2AuCl₄⁻(aq) + 3Zn(s) → 2Au⁰↓ (24K Gold Dendritic Tree) + 3Zn²⁺ + 8Cl⁻',
      requiredReagents: ['gold_chloride', 'zinc_granules'],
      stepsAr: [
        '1️⃣ من رف المواد، أضف محلول (حمض كلوريد الذهب الثلاثي HAuCl₄) الأصفر الذهبي إلى الكأس.',
        '2️⃣ أضف (حبيبات الخارصين Zn) من قسم الفلزات.',
        '3️⃣ شاهد اختزال أيونات الذهب وترسب شجرة بلورات الذهب الخالص عيار 24 قيراطاً في قاع الكأس!'
      ],
      stepsEn: [
        '1️⃣ Add golden Chloroauric Acid solution (HAuCl₄) from the shelf.',
        '2️⃣ Add Zinc Granules (Zn) from the metals category.',
        '3️⃣ Watch active zinc reduce Au³⁺ ions into a glittering 3D 24K Gold Crystal Tree!'
      ],
      resultAr: 'يزيح الخارصين أيونات الذهب الثلاثية فتترسب بلورات وتفرعات شجرية من الذهب المعدني الخالص Au⁰.',
      resultEn: 'Zinc metal reduces Au³⁺ ions into shimmering dendritic crystals of pure 24K metallic gold.',
      isCompleted: () => hasGoldTree
    }
  ];

  const activeRecipe = REACTION_RECIPES.find(r => r.id === selectedRecipeId) || REACTION_RECIPES[0];

  // Listen for cross-module lab preset triggers (selects the recipe guide instead of auto-running!)
  useEffect(() => {
    if (!activeLabPreset) return;
    const presetKey = activeLabPreset.labPresetId || activeLabPreset.substanceId;
    if (!presetKey) return;
    if (presetKey.startsWith('mission_')) {
      setLabMode('guided');
      setGuidedMissionId(presetKey);
      setMissionComplete(false);
    } else {
      const matchedRecipe = REACTION_RECIPES.find(r => r.id === presetKey);
      if (matchedRecipe) {
        setSelectedRecipeId(matchedRecipe.id);
      }
    }
  }, [activeLabPreset]);

  // Burner heating / cooling loop
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Heating by Bunsen burner
      if (burnerPower !== 'off' && totalVolumeMl > 0) {
        const heatRate = burnerPower === 'high' ? 2.5 : burnerPower === 'med' ? 1.4 : 0.7;
        setCurrentTempC(prev => {
          const next = prev + heatRate;
          if (next >= 100.0) {
            // Boiling! Evaporate liquid slowly
            setContent(c => ({
              ...c,
              waterMl: Math.max(0, c.waterMl - 0.4),
              acidMl: Math.max(0, c.acidMl - 0.1)
            }));
            return 100.0;
          }
          return next;
        });
      } else {
        // Natural heat dissipation towards room temp (23.5°C)
        setCurrentTempC(prev => {
          if (Math.abs(prev - 23.5) < 0.2) return 23.5;
          return prev + (23.5 - prev) * 0.025;
        });
      }

      // 2. Effervescence decay & continuous gradual gas feed to balloon
      setEffervescenceBubbles(prev => {
        if (prev > 4 && isBalloonAttached && balloonTargetRef.current > 0 && balloonTargetRef.current < 100) {
          balloonTargetRef.current = Math.min(100, balloonTargetRef.current + 0.8);
        }
        return Math.max(0, prev - 1);
      });

      // 3. Ice melting
      if (content.iceCount > 0 && currentTempC > 2.0) {
        setContent(c => ({
          ...c,
          iceCount: Math.max(0, c.iceCount - 0.2),
          waterMl: Math.min(220, c.waterMl + 1.2)
        }));
      }
    }, 250);

    return () => clearInterval(timer);
  }, [burnerPower, totalVolumeMl, content.iceCount, currentTempC, isBalloonAttached]);

  // Smooth Gradual Balloon Inflation Loop (يجعل البلونة تكبر تدريجياً بسلاسة)
  useEffect(() => {
    if (!isBalloonAttached) return;
    const inflTimer = window.setInterval(() => {
      setBalloonInflation(prev => {
        const target = balloonTargetRef.current;
        if (prev < target - 0.2) {
          const step = Math.max(0.42, Math.min(1.15, (target - prev) * 0.042 + 0.32));
          return Math.min(100, prev + step);
        }
        return prev;
      });
    }, 40);
    return () => clearInterval(inflTimer);
  }, [isBalloonAttached]);

  // Guided missions configuration
  const GUIDED_MISSIONS = [
    {
      id: 'mission_neutralization',
      titleAr: '🎯 معايرة وتعادل حمض وقاعدة مع كاشف الفينولفثالين',
      titleEn: '🎯 Acid-Base Neutralization with Phenolphthalein',
      goalAr: 'أضف حمض HCl ثم قطرات فينولفثالين، ثم أضف قاعدة NaOH حتى يصبح وردياً، ثم عادله بالحمض ليعود شفافاً!',
      goalEn: 'Add dilute HCl + phenolphthalein drops, add NaOH till bright pink, then add HCl back till clear neutral!',
      isSatisfied: (c: BeakerContent, ph: number) => c.phenolphthaleinDrops > 0 && c.baseMl > 5 && Math.abs(ph - 7.0) < 1.0 && c.acidMl > 5
    },
    {
      id: 'mission_effervescence',
      titleAr: '🌋 الفوران البركاني وانطلاق غاز CO₂',
      titleEn: '🌋 Volcano Effervescence & Safe CO₂ Gas',
      goalAr: 'أضف حمض الهيدروكلوريك HCl ثم أضف مسحوق بيكربونات الصوديوم NaHCO₃ لتشاهد انطلاق غاز CO₂ وفوران المحلول!',
      goalEn: 'Add dilute HCl then add Baking Soda powder NaHCO₃ to trigger foaming and release CO₂ gas!',
      isSatisfied: (c: BeakerContent) => c.acidMl > 0 && c.bakingSodaG > 0 && effervescenceBubbles > 5
    },
    {
      id: 'mission_precipitation',
      titleAr: '💎 تفاعل الترسيب: تكوين هيدروكسيد النحاس الأزرق السماوي',
      titleEn: '💎 Precipitation Reaction: Sky-Blue Cu(OH)₂',
      goalAr: 'أضف كبريتات النحاس الزرقاء CuSO₄ ثم أضف هيدروكسيد الصوديوم NaOH لترى تكوّن راسب أزرق هلامي رائع!',
      goalEn: 'Add blue CuSO₄ solution then add NaOH base to precipitate beautiful sky-blue solid Cu(OH)₂!',
      isSatisfied: (c: BeakerContent) => c.copperSulfateMl > 5 && c.baseMl > 5 && c.precipitateG > 2
    },
    {
      id: 'mission_exothermic',
      titleAr: '🔥 الذوبان الناشر للحرارة لكلوريد الكالسيوم',
      titleEn: '🔥 Exothermic Heat of Dissolution (CaCl₂)',
      goalAr: 'أضف حبيبات CaCl₂ إلى الماء ولاحظ ارتفاع مؤشر ميزان الحرارة لأكثر من 45 درجة مئوية بدون أي موقد!',
      goalEn: 'Add CaCl₂ pellets to water and watch the thermometer soar past 45 °C without any burner!',
      isSatisfied: (c: BeakerContent) => c.calciumChlorideG > 4 && currentTempC >= 45.0
    },
    {
      id: 'mission_boiling',
      titleAr: '💨 الغليان وتبخير المحلول بموقد بنزن',
      titleEn: '💨 Bunsen Burner Boiling & Steam Emission',
      goalAr: 'شغّل موقد بنزن على الطاقة العالية حتى تصل الحرارة إلى 100 مئوية وتتصاعد سحب البخار الأبيض!',
      goalEn: 'Turn the Bunsen burner to High power until temperature hits 100 °C and steam clouds rise!',
      isSatisfied: (_c: BeakerContent) => burnerPower !== 'off' && currentTempC >= 99.5
    },
    {
      id: 'mission_peroxide_catalysis',
      titleAr: '🔮 بركان الأكسجين وتفكيك ماء الأكسجين الحفزي',
      titleEn: '🔮 Catalytic Oxygen Volcano & Peroxide Breakdown',
      goalAr: 'أضف ماء الأكسجين H₂O₂ ثم أضف بلورات برمنغنات البوتاسيوم KMnO₄ أو برادة الحديد لتشاهد تفككاً سريعاً وانطلاق فقاعات الأكسجين وحرارة دافئة!',
      goalEn: 'Add H₂O₂ solution then add potassium permanganate KMnO₄ or iron to trigger rapid catalytic O₂ effervescence & heat!',
      isSatisfied: (c: BeakerContent) => c.peroxideMl > 0 && (c.permanganateG > 0 || c.ironG > 0) && effervescenceBubbles > 3
    },
    {
      id: 'mission_silver_chloride',
      titleAr: '✨ كشف الكلوريد الكيميائي الدقيق براسب نترات الفضة',
      titleEn: '✨ Qualitative Chloride Test with Silver Nitrate',
      goalAr: 'أضف حمض HCl أو ملح CaCl₂، ثم أضف محلول نترات الفضة AgNO₃ لتشاهد تشكل راسب كلوريد الفضة AgCl الأبيض الحليبي الشهير!',
      goalEn: 'Add dilute HCl or CaCl₂ salt, then add AgNO₃ solution to precipitate dense milky white silver chloride AgCl!',
      isSatisfied: (c: BeakerContent) => c.silverNitrateMl > 0 && (c.acidMl > 0 || c.calciumChlorideG > 0) && c.precipitateG > 1
    },
    {
      id: 'mission_copper_ammonia',
      titleAr: '🌌 معقد النحاس الرباعي الأميني الأزرق النيلي الملكي',
      titleEn: '🌌 Royal Navy Copper-Ammonia Complex',
      goalAr: 'أضف كبريتات النحاس الزرقاء CuSO₄ ثم أضف محلول الأمونيا NH₄OH لتشاهد تحول اللون إلى الأزرق النيلي الساحر لمعقد النحاس الملكي!',
      goalEn: 'Add blue CuSO₄ then add ammonia NH₄OH to watch the liquid turn into an intense deep royal navy blue complex!',
      isSatisfied: (c: BeakerContent) => c.copperSulfateMl > 5 && c.ammoniaMl > 5
    },
    {
      id: 'mission_sodium_explosion',
      titleAr: '💥 انفجار وتفاعل الصوديوم الفلزي مع الماء',
      titleEn: '💥 Violent Sodium Metal Water Detonation',
      goalAr: 'ضع 100 مل ماء مقطر، ثم أضف قطعة من الصوديوم الفلزي النشط Na لمشاهدة الانفجار الفوري وتطاير الشرر واللهب الأصفر وتصاعد غاز الهيدروجين!',
      goalEn: 'Add 100 mL water, then drop active sodium metal Na to witness the explosive detonation, sparks, and brilliant flame!',
      isSatisfied: (c: BeakerContent, ph: number) => c.waterMl > 20 && ph > 11.0 && effervescenceBubbles > 5
    },
    {
      id: 'mission_magnesium_flare',
      titleAr: '🔥 احتراق شريط المغنيسيوم بالوهج الأبيض الساطع',
      titleEn: '🔥 Blinding White Magnesium Ribbon Flare',
      goalAr: 'أضف شريط المغنيسيوم Mg وشغّل موقد بنزن أو أطلق الشرارة الكهربائية لمشاهدة الوميض الأبيض فائق التوهج وتصاعد دخان أكسيد المغنيسيوم الأبيض!',
      goalEn: 'Add magnesium ribbon Mg then ignite burner or electric spark to trigger the blinding white fireworks-like combustion flare!',
      isSatisfied: (c: BeakerContent) => (c.precipitateG > 0 || c.magnesiumG > 0) && currentTempC > 50
    },
    {
      id: 'mission_hydrogen_pop',
      titleAr: '⚡ اختبار فرقعة غاز الهيدروجين النقي (Pop Test)',
      titleEn: '⚡ Pure Hydrogen Gas Pop Detonation Test',
      goalAr: 'أنتج غاز الهيدروجين بتفاعل الصوديوم مع الماء أو المغنيسيوم مع الحمض، ثم أطلق شرارة الإشعال الكهربائية لسماع فرقعة انفجار الهيدروجين الشهيرة!',
      goalEn: 'Produce hydrogen gas from sodium or magnesium, then strike the electric spark to trigger the famous explosive Pop detonation!',
      isSatisfied: (c: BeakerContent) => (c.waterMl > 0 || c.acidMl > 0) && effervescenceBubbles > 0
    },
    {
      id: 'mission_potassium_explosion',
      titleAr: '💥 انفجار البوتاسيوم فائق النشاط مع لهب بنفسجي ليلكي',
      titleEn: '💥 Ultra-Reactive Potassium Metal Detonation with Lilac Flame',
      goalAr: 'ضع ماء في الكأس ثم أضف قطعة بوتاسيوم K وشاهد الدوران السريع الفوري والانفجار القوي المميز بلهب أرجواني بنفسجي ليلكي مدهش!',
      goalEn: 'Add water to the beaker, then drop potassium K metal to witness its instantaneous violent detonation with the characteristic bright lilac flame!',
      isSatisfied: (c: BeakerContent) => c.waterMl > 0 && currentTempC > 60
    },
    {
      id: 'mission_ethanol_combustion',
      titleAr: '🔥 احتراق كحول الإيثانول النقي بالكامل',
      titleEn: '🔥 Complete Combustion of Pure Ethanol Fuel',
      goalAr: 'أضف إيثانول C₂H₅OH إلى الكأس (في كأس جاف أو قليل الماء) ثم أشعل الشعلة بالشرارة أو موقد بنزن لمشاهدة لهب الاحتراق الأزرق الصافي مع تولد حرارة عالية وبخار ماء!',
      goalEn: 'Add pure ethanol C₂H₅OH to the beaker, then ignite with spark or burner to observe the clean blue laminar combustion flame with exothermic heat!',
      isSatisfied: (c: BeakerContent) => c.ethanolMl > 0 && isEthanolBurning
    }
  ];

  const currentMission = GUIDED_MISSIONS.find(m => m.id === guidedMissionId) || GUIDED_MISSIONS[0];

  // Check mission satisfaction
  useEffect(() => {
    if (labMode === 'guided') {
      if (currentMission.isSatisfied(content, currentPh)) {
        setMissionComplete(true);
      }
    }
  }, [content, currentPh, currentTempC, burnerPower, effervescenceBubbles, labMode, currentMission]);

  // CANVAS ANIMATION LOOP: Render realistic Beaker, Burner, Liquid, Steam, Bubbles
  useEffect(() => {
    if (viewMode === '3d') return; // Only run 2D canvas animation when 2D or split mode is active!
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Screen shake translation on detonation
      if (screenShakeRef.current > 0) {
        const sx = (Math.random() - 0.5) * screenShakeRef.current;
        const sy = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(sx, sy);
        screenShakeRef.current = Math.max(0, screenShakeRef.current - 0.7);
      }

      const w = canvas.width;
      const h = canvas.height;

      // Beaker Geometry: Centered on bench with extra top clearance for full-beaker balloon inflation
      const beakerW = 160;
      const beakerH = 186;
      const beakerX = (w - beakerW) / 2;
      const beakerY = 108;
      const beakerBottomY = beakerY + beakerH;

      // 1. BENCHTOP & STAND
      ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#e2e8f0';
      ctx.fillRect(0, beakerBottomY + 42, w, h - (beakerBottomY + 42));

      ctx.strokeStyle = theme === 'dark' ? '#334155' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, beakerBottomY + 42);
      ctx.lineTo(w, beakerBottomY + 42);
      ctx.stroke();

      // Tripod / Wire Gauze under beaker
      ctx.strokeStyle = theme === 'dark' ? '#64748b' : '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(beakerX - 15, beakerBottomY + 2);
      ctx.lineTo(beakerX + beakerW + 15, beakerBottomY + 2);
      ctx.stroke();

      // Tripod Legs
      ctx.beginPath();
      ctx.moveTo(beakerX - 10, beakerBottomY + 2);
      ctx.lineTo(beakerX - 30, beakerBottomY + 42);
      ctx.moveTo(beakerX + beakerW + 10, beakerBottomY + 2);
      ctx.lineTo(beakerX + beakerW + 30, beakerBottomY + 42);
      ctx.stroke();

      // 2. BUNSEN BURNER FLAME
      const burnerX = w / 2;
      const burnerY = beakerBottomY + 42;

      // Burner metal base & tube
      ctx.fillStyle = theme === 'dark' ? '#475569' : '#64748b';
      ctx.fillRect(burnerX - 22, burnerY - 8, 44, 8);
      ctx.fillRect(burnerX - 8, burnerY - 36, 16, 28);

      if (burnerPower !== 'off') {
        const flameHeight = burnerPower === 'high' ? 38 : burnerPower === 'med' ? 26 : 16;
        const flameFlicker = Math.sin(Date.now() * 0.02) * 3;

        // Outer Flame (Blue/Amber)
        const outerFlameGrad = ctx.createLinearGradient(burnerX, burnerY - 36, burnerX, burnerY - 36 - flameHeight);
        outerFlameGrad.addColorStop(0, 'rgba(6, 182, 212, 0.95)');
        outerFlameGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.85)');
        outerFlameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.beginPath();
        ctx.moveTo(burnerX - 9, burnerY - 36);
        ctx.quadraticCurveTo(burnerX - 14, burnerY - 36 - flameHeight * 0.6, burnerX + flameFlicker, burnerY - 36 - flameHeight);
        ctx.quadraticCurveTo(burnerX + 14, burnerY - 36 - flameHeight * 0.6, burnerX + 9, burnerY - 36);
        ctx.fillStyle = outerFlameGrad;
        ctx.fill();

        // Inner Cone (Cyan)
        const innerFlameGrad = ctx.createLinearGradient(burnerX, burnerY - 36, burnerX, burnerY - 36 - flameHeight * 0.5);
        innerFlameGrad.addColorStop(0, '#ffffff');
        innerFlameGrad.addColorStop(0.7, '#06b6d4');
        innerFlameGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.beginPath();
        ctx.moveTo(burnerX - 5, burnerY - 36);
        ctx.lineTo(burnerX, burnerY - 36 - flameHeight * 0.5);
        ctx.lineTo(burnerX + 5, burnerY - 36);
        ctx.fillStyle = innerFlameGrad;
        ctx.fill();
      }

      // 3. LIQUID LEVEL CALCULATION
      const liquidHeight = Math.min(beakerH - 25, (totalVolumeMl / 250) * (beakerH - 35));
      const liquidSurfaceY = beakerBottomY - liquidHeight;

      if (totalVolumeMl > 0) {
        // Draw liquid body
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(beakerX + 4, liquidSurfaceY, beakerW - 8, liquidHeight - 2, [0, 0, 10, 10]);
        ctx.clip();

        // Liquid background fill
        ctx.fillStyle = getFluidColor();
        ctx.fillRect(beakerX, liquidSurfaceY, beakerW, liquidHeight);

        // Stirring swirl vortex animation
        if (isStirring) {
          stirAngleRef.current += 0.25;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(w / 2, liquidSurfaceY + 8, beakerW * 0.35, 6, stirAngleRef.current, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Sediment on the bottom (Precipitate or Iron filings or Undissolved powder)
        const totalSolidG = content.precipitateG + content.ironG + content.bakingSodaG * 0.4;
        if (totalSolidG > 0) {
          const sedH = Math.min(22, (totalSolidG / 40) * 22 + 4);
          ctx.fillStyle = content.precipitateG > 0
            ? 'rgba(56, 189, 248, 0.95)' // sky blue copper hydroxide solid
            : content.ironG > 0
            ? '#334155' // dark iron filings
            : '#ffffff'; // white carbonate powder
          ctx.fillRect(beakerX + 6, beakerBottomY - sedH, beakerW - 12, sedH);
        }

        // Floating Ice Cubes
        if (content.iceCount > 0) {
          const iceX = w / 2 - 25;
          const iceY = liquidSurfaceY - 4;
          ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.fillRect(iceX, iceY, 18, 14);
          ctx.strokeRect(iceX, iceY, 18, 14);
          if (content.iceCount > 2) {
            ctx.fillRect(iceX + 26, iceY + 2, 16, 12);
            ctx.strokeRect(iceX + 26, iceY + 2, 16, 12);
          }
        }

        // Effervescence & Boiling Bubbles
        const bubbleDemand = effervescenceBubbles > 0 ? effervescenceBubbles : currentTempC >= 95 ? 18 : 0;
        if (bubbleDemand > 0 && Math.random() < 0.6) {
          bubbleParticlesRef.current.push({
            x: beakerX + 15 + Math.random() * (beakerW - 30),
            y: beakerBottomY - 5,
            vy: -(1.8 + Math.random() * 2.5),
            radius: 2 + Math.random() * 3.5,
            opacity: 0.85
          });
        }

        // Update and draw bubbles
        for (let i = bubbleParticlesRef.current.length - 1; i >= 0; i--) {
          const b = bubbleParticlesRef.current[i];
          b.y += b.vy;
          b.opacity -= 0.015;

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, b.opacity)})`;
          ctx.fill();

          if (b.y <= liquidSurfaceY || b.opacity <= 0) {
            bubbleParticlesRef.current.splice(i, 1);
          }
        }

        // Meniscus surface curve
        ctx.beginPath();
        ctx.ellipse(w / 2, liquidSurfaceY, (beakerW - 8) / 2, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fill();

        ctx.restore();

        // Skittering Alkali Metal Pellets (Sodium & Potassium) on Liquid Surface
        for (let skIdx = skitteringPelletsRef.current.length - 1; skIdx >= 0; skIdx--) {
          const pellet = skitteringPelletsRef.current[skIdx];
          pellet.life++;
          pellet.x += pellet.vx;

          // Wall bounce inside beaker
          if (pellet.x < beakerX + 16) {
            pellet.x = beakerX + 16;
            pellet.vx = Math.abs(pellet.vx);
          } else if (pellet.x > beakerX + beakerW - 16) {
            pellet.x = beakerX + beakerW - 16;
            pellet.vx = -Math.abs(pellet.vx);
          }

          const py = liquidSurfaceY;

          // Glowing Aura around skittering pellet
          const auraRadius = 14 + Math.sin(Date.now() * 0.03) * 4;
          const auraGrad = ctx.createRadialGradient(pellet.x, py, 2, pellet.x, py, auraRadius);
          if (pellet.type === 'potassium') {
            auraGrad.addColorStop(0, 'rgba(216, 180, 254, 0.95)');
            auraGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.6)');
            auraGrad.addColorStop(1, 'rgba(126, 34, 206, 0)');
          } else {
            auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
            auraGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.6)');
            auraGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          }

          ctx.beginPath();
          ctx.arc(pellet.x, py, auraRadius, 0, Math.PI * 2);
          ctx.fillStyle = auraGrad;
          ctx.fill();

          // Smoke and spark emissions
          if (Math.random() < 0.6) {
            steamParticlesRef.current.push({
              x: pellet.x + (Math.random() - 0.5) * 6,
              y: py - 4,
              vx: (Math.random() - 0.5) * 1.2,
              vy: -(1.8 + Math.random() * 2),
              radius: 3 + Math.random() * 4,
              opacity: 0.75
            });
          }

          // Metallic Sphere Core
          ctx.beginPath();
          ctx.arc(pellet.x, py - 2, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = pellet.type === 'potassium' ? '#e9d5ff' : '#ffffff';
          ctx.strokeStyle = pellet.type === 'potassium' ? '#9333ea' : '#d97706';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Detonation when life ends
          if (pellet.life >= pellet.maxLife) {
            triggerExplosion(pellet.type, pellet.x, py);
            skitteringPelletsRef.current.splice(skIdx, 1);
          }
        }

        // Render steady Ethanol flame on surface if burning
        if (isEthanolBurning) {
          const flameY = liquidSurfaceY;
          const flameFlicker = Math.sin(Date.now() * 0.02) * 3;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(beakerX + 14, flameY);
          ctx.quadraticCurveTo(w / 2 + flameFlicker, flameY - 32, beakerX + beakerW - 14, flameY);
          const ethanolFlameGrad = ctx.createLinearGradient(w / 2, flameY, w / 2, flameY - 35);
          ethanolFlameGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
          ethanolFlameGrad.addColorStop(0.4, 'rgba(251, 146, 60, 0.75)');
          ethanolFlameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = ethanolFlameGrad;
          ctx.fill();
          ctx.restore();
        }
      } else {
        // Dry Solids sitting on beaker floor when beaker is completely dry (0 mL)
        if (content.sodiumG > 0) {
          ctx.beginPath();
          ctx.arc(beakerX + 45, beakerBottomY - 6, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 7px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Na', beakerX + 45, beakerBottomY - 4);
        }
        if (content.potassiumG > 0) {
          ctx.beginPath();
          ctx.arc(beakerX + 75, beakerBottomY - 6, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#e0e7ff';
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#4f46e5';
          ctx.font = 'bold 7px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('K', beakerX + 75, beakerBottomY - 4);
        }
        if (content.magnesiumG > 0) {
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(beakerX + 95, beakerBottomY - 5);
          ctx.bezierCurveTo(beakerX + 110, beakerBottomY - 14, beakerX + 125, beakerBottomY - 2, beakerX + 138, beakerBottomY - 6);
          ctx.stroke();
          ctx.fillStyle = '#475569';
          ctx.font = 'bold 7px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Mg', beakerX + 115, beakerBottomY - 14);
        }
      }

      // 4. STEAM CLOUDS (When Heated to High Temperature > 80°C)
      if (currentTempC >= 80 && totalVolumeMl > 0) {
        if (Math.random() < (currentTempC >= 98 ? 0.75 : 0.35)) {
          steamParticlesRef.current.push({
            x: beakerX + 20 + Math.random() * (beakerW - 40),
            y: liquidSurfaceY - 4,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -(1.5 + Math.random() * 2.0),
            radius: 5 + Math.random() * 8,
            opacity: 0.65
          });
        }
      }

      for (let i = steamParticlesRef.current.length - 1; i >= 0; i--) {
        const s = steamParticlesRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.radius += 0.35;
        s.opacity -= 0.016;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0, s.opacity)})`;
        ctx.fill();

        if (s.opacity <= 0) {
          steamParticlesRef.current.splice(i, 1);
        }
      }

      // 5. BEAKER GLASS VESSEL (Walls, Spout, Graduations)
      ctx.strokeStyle = theme === 'dark' ? 'rgba(148, 163, 184, 0.75)' : 'rgba(71, 85, 105, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();

      // Top Lip & Spout
      ctx.moveTo(beakerX - 12, beakerY); // spout tip
      ctx.lineTo(beakerX, beakerY + 8);
      ctx.lineTo(beakerX, beakerBottomY - 10);
      // Curved bottom corner
      ctx.arcTo(beakerX, beakerBottomY, beakerX + 10, beakerBottomY, 10);
      ctx.lineTo(beakerX + beakerW - 10, beakerBottomY);
      ctx.arcTo(beakerX + beakerW, beakerBottomY, beakerX + beakerW, beakerBottomY - 10, 10);
      ctx.lineTo(beakerX + beakerW, beakerY);
      ctx.stroke();

      // Volume Graduations on Glass (50mL, 100mL, 150mL, 200mL, 250mL)
      ctx.strokeStyle = theme === 'dark' ? 'rgba(203, 213, 225, 0.5)' : 'rgba(100, 116, 139, 0.6)';
      ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';

      [50, 100, 150, 200, 250].forEach(vol => {
        const markY = beakerBottomY - (vol / 250) * (beakerH - 35);
        ctx.beginPath();
        ctx.moveTo(beakerX + 4, markY);
        ctx.lineTo(beakerX + 16, markY);
        ctx.stroke();
        ctx.fillText(`${vol}ml`, beakerX + 44, markY + 3);
      });

      // 6. TOOLS DIPPED INTO BEAKER
      const hasBalloonCover = isBalloonAttached || balloonInflation > 0;
      const toolTopLimitY = hasBalloonCover ? beakerY + 10 : beakerY - 35;

      // (a) Thermometer Probe
      if (isThermometerActive) {
        const probeX = beakerX + beakerW - 28;
        ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
        ctx.fillRect(probeX - 2, toolTopLimitY, 4, beakerBottomY - 30 - toolTopLimitY);

        // Sensing Tip
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(probeX, beakerBottomY - 30, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // (b) pH Glass Probe
      if (isPhMeterActive) {
        const phX = beakerX + 35;
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(phX - 3, toolTopLimitY + 4, 6, beakerBottomY - 40 - (toolTopLimitY + 4));
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(phX, beakerBottomY - 40, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // (c) Authentic Laboratory Glass Stirring Rod (عصا التحريك الزجاجية المخبرية)
      let rodTipX: number;
      let rodTipY: number;
      let rodTopX: number;
      let rodTopY: number;

      if (rodDragPosRef.current && isDraggingRodRef.current) {
        // Direct tracking of the user's cursor / finger dragging
        rodTipX = Math.max(beakerX + 25, Math.min(beakerX + beakerW - 25, rodDragPosRef.current.x));
        rodTipY = Math.max(liquidSurfaceY + 12, Math.min(beakerBottomY - 10, rodDragPosRef.current.y));
        rodTopX = rodTipX + 28;
        rodTopY = hasBalloonCover ? beakerY + 8 : beakerY - 42;
      } else if (isStirring) {
        // Automatic animated circular stirring motion through the liquid
        stirAngleRef.current += 0.22;
        const stirR = beakerW * 0.28;
        rodTipX = beakerX + beakerW / 2 + Math.cos(stirAngleRef.current) * stirR;
        rodTipY = beakerBottomY - 16 + Math.sin(stirAngleRef.current * 2) * 5;
        rodTopX = beakerX + beakerW / 2 + Math.cos(stirAngleRef.current * 0.5) * 16 + 22;
        rodTopY = hasBalloonCover ? beakerY + 8 : beakerY - 40;
      } else {
        // Natural resting position slanted against beaker rim
        rodTopX = beakerX + beakerW - 18;
        rodTopY = hasBalloonCover ? beakerY + 8 : beakerY - 38;
        rodTipX = beakerX + 42;
        rodTipY = beakerBottomY - 14;
      }

      // Draw stirring liquid whirlpool / wake around rod tip when stirring
      if (isStirring && totalVolumeMl > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.ellipse(rodTipX, rodTipY - 2, 22, 7, stirAngleRef.current, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(rodTipX, rodTipY + 4, 14, 4, -stirAngleRef.current, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Glass Stirring Rod Cylinder Body
      ctx.save();
      const rodAngle = Math.atan2(rodTipY - rodTopY, rodTipX - rodTopX);
      const rodLength = Math.hypot(rodTipX - rodTopX, rodTipY - rodTopY);

      ctx.translate(rodTopX, rodTopY);
      ctx.rotate(rodAngle - Math.PI / 2);

      // Glass rod linear gradient
      const rodGrad = ctx.createLinearGradient(-4, 0, 4, 0);
      rodGrad.addColorStop(0, 'rgba(224, 242, 254, 0.7)');
      rodGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.95)');
      rodGrad.addColorStop(0.7, 'rgba(186, 230, 253, 0.65)');
      rodGrad.addColorStop(1, 'rgba(125, 211, 252, 0.8)');

      ctx.fillStyle = rodGrad;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 1.2;

      // Rounded rect rod
      ctx.beginPath();
      ctx.roundRect(-4, 0, 8, rodLength, [4, 4, 4, 4]);
      ctx.fill();
      ctx.stroke();

      // Specular highlight line along rod center
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(-1.2, 4);
      ctx.lineTo(-1.2, rodLength - 6);
      ctx.stroke();

      ctx.restore();

      // (d) Dipped Litmus Paper Strip
      if (litmusStripDipped) {
        const stripX = beakerX + beakerW / 2 + 28;
        // Top holder clip
        ctx.fillStyle = '#334155';
        ctx.fillRect(stripX - 2, 42, 12, 6);
        // Dry top part
        ctx.fillStyle = '#fef08a';
        const dryH = Math.max(10, (totalVolumeMl > 0 ? liquidSurfaceY : beakerBottomY - 40) - 48);
        ctx.fillRect(stripX, 48, 8, dryH);
        // Wet dipped part colored according to pH
        if (totalVolumeMl > 0) {
          ctx.fillStyle = currentPh < 3.5 ? '#ef4444' : currentPh < 6.5 ? '#f97316' : currentPh > 11.0 ? '#7c3aed' : currentPh > 7.5 ? '#2563eb' : '#10b981';
          ctx.fillRect(stripX, liquidSurfaceY, 8, Math.max(8, beakerBottomY - liquidSurfaceY - 24));
        }
      }

      // (e) Electrical Conductivity Tester: Wires, Iron Electrodes & Indicator Bulb (مسبار التوصيل الكهربائي: الأسلاك وقطبا الحديد والمصباح)
      if (isConductivityActive) {
        const elec1X = beakerX + 58; // Left Iron Anode (+)
        const elec2X = beakerX + 96; // Right Iron Cathode (-)
        const bridgeY = 64;
        const elecBottomY = beakerBottomY - 20;
        const bulbX = (elec1X + elec2X) / 2;
        const bulbY = 30;
        const activeGlow = totalVolumeMl > 0 ? conductivityGlow : 0;

        ctx.save();

        // 1. Two Iron/Carbon Metallic Electrodes (قطبا الحديد) dipped into the beaker
        [elec1X, elec2X].forEach((ex, idx) => {
          const ironGrad = ctx.createLinearGradient(ex - 3, 0, ex + 3, 0);
          ironGrad.addColorStop(0, '#334155');
          ironGrad.addColorStop(0.4, '#cbd5e1');
          ironGrad.addColorStop(0.8, '#475569');
          ironGrad.addColorStop(1, '#1e293b');

          ctx.fillStyle = ironGrad;
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(ex - 3.5, bridgeY + 6, 7, elecBottomY - (bridgeY + 6), [2, 2, 3, 3]);
          ctx.fill();
          ctx.stroke();

          // Copper terminal cap at top of each iron rod
          ctx.fillStyle = idx === 0 ? '#ef4444' : '#3b82f6';
          ctx.fillRect(ex - 4.5, bridgeY - 4, 9, 6);
        });

        // 2. Ion flow & electric current arcs between the iron electrodes in conductive solution
        if (activeGlow > 0.05 && totalVolumeMl > 15) {
          const arcStartY = Math.max(liquidSurfaceY + 10, bridgeY + 25);
          const nowTime = Date.now() * 0.008;

          // Glowing current path lines between the two iron rods
          for (let row = 0; row < 3; row++) {
            const ay = arcStartY + ((elecBottomY - arcStartY - 8) * (row + 0.5)) / 3;
            if (ay > liquidSurfaceY + 4 && ay < elecBottomY) {
              ctx.strokeStyle = `rgba(250, 204, 21, ${Math.min(0.9, activeGlow * 0.85)})`;
              ctx.lineWidth = 1.6;
              ctx.beginPath();
              ctx.moveTo(elec1X + 4, ay);
              ctx.quadraticCurveTo(
                (elec1X + elec2X) / 2,
                ay + Math.sin(nowTime + row * 2) * 5,
                elec2X - 4,
                ay
              );
              ctx.stroke();
            }
          }

          // Micro electrolysis bubbles rising on the iron electrodes
          for (let b = 0; b < 4; b++) {
            const by = elecBottomY - ((Date.now() * 0.04 + b * 25) % Math.max(15, elecBottomY - liquidSurfaceY));
            if (by > liquidSurfaceY) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
              ctx.beginPath();
              ctx.arc(elec1X - 4, by, 1.8, 0, Math.PI * 2);
              ctx.arc(elec2X + 4, by, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // 3. Insulated Holder Crossbar Bridge
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(elec1X - 12, bridgeY, elec2X - elec1X + 24, 9, 4);
        ctx.fill();
        ctx.stroke();

        // 4. Insulated Electrical Copper Wires (سلك أحمر موجب وسلك أزرق سالب) connecting rods to bulb
        // Red wire (+) from left iron electrode to bulb base
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(elec1X, bridgeY - 4);
        ctx.bezierCurveTo(elec1X - 14, bridgeY - 18, bulbX - 16, bulbY + 18, bulbX - 4, bulbY + 12);
        ctx.stroke();

        // Blue wire (-) from right iron electrode to bulb base
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(elec2X, bridgeY - 4);
        ctx.bezierCurveTo(elec2X + 14, bridgeY - 18, bulbX + 16, bulbY + 18, bulbX + 4, bulbY + 12);
        ctx.stroke();

        // 5. Indicator Light Bulb Socket & Glass Bulb
        // Metallic screw base
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bulbX - 6, bulbY + 7, 12, 7);

        // Glowing Aura if solution conducts electricity
        if (activeGlow > 0.05) {
          const glowRadius = 18 + activeGlow * 22 + Math.sin(Date.now() * 0.02) * 2;
          const bulbAura = ctx.createRadialGradient(bulbX, bulbY, 2, bulbX, bulbY, glowRadius);
          bulbAura.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, activeGlow * 1.2)})`);
          bulbAura.addColorStop(0.35, `rgba(250, 204, 21, ${Math.min(0.95, activeGlow)})`);
          bulbAura.addColorStop(0.7, `rgba(245, 158, 11, ${activeGlow * 0.45})`);
          bulbAura.addColorStop(1, 'rgba(245, 158, 11, 0)');

          ctx.fillStyle = bulbAura;
          ctx.beginPath();
          ctx.arc(bulbX, bulbY, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bulb glass sphere
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, 10, 0, Math.PI * 2);
        ctx.fillStyle = activeGlow > 0.05
          ? `rgba(254, 240, 138, ${0.65 + activeGlow * 0.35})`
          : 'rgba(148, 163, 184, 0.25)';
        ctx.strokeStyle = activeGlow > 0.05 ? '#facc15' : '#94a3b8';
        ctx.lineWidth = 1.6;
        ctx.fill();
        ctx.stroke();

        // Tungsten Filament inside bulb
        ctx.strokeStyle = activeGlow > 0.05 ? '#ffffff' : '#64748b';
        ctx.lineWidth = activeGlow > 0.05 ? 2.0 : 1.2;
        ctx.beginPath();
        ctx.moveTo(bulbX - 3, bulbY + 7);
        ctx.lineTo(bulbX - 3, bulbY - 2);
        ctx.lineTo(bulbX, bulbY - 5);
        ctx.lineTo(bulbX + 3, bulbY - 2);
        ctx.lineTo(bulbX + 3, bulbY + 7);
        ctx.stroke();

        // Polarity labels (+ / -)
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#f87171';
        ctx.textAlign = 'center';
        ctx.fillText('+', elec1X - 10, bridgeY - 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('-', elec2X + 10, bridgeY - 2);

        ctx.restore();
      }

      // (f) Platinum Flame Test Wire Loop in 2D (سلك البلاتين لاختبار اللهب الطيفي)
      if (flameTestMetal !== 'none') {
        const flameColors: Record<string, { core: string; outer: string }> = {
          sodium: { core: '#fef08a', outer: '#f59e0b' },
          potassium: { core: '#f3e8ff', outer: '#a855f7' },
          copper: { core: '#bbf7d0', outer: '#10b981' },
          strontium: { core: '#fecdd3', outer: '#e11d48' },
          calcium: { core: '#fed7aa', outer: '#ea580c' },
          barium: { core: '#d9f99d', outer: '#84cc16' },
          lithium: { core: '#fecdd3', outer: '#f43f5e' }
        };
        const spec = flameColors[flameTestMetal] || { core: '#fef08a', outer: '#f59e0b' };

        ctx.save();
        // Platinum wire rod coming from right into the burner flame zone
        const loopX = burnerX + 2;
        const loopY = burnerY - 48;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(burnerX + 95, burnerY - 22);
        ctx.lineTo(loopX + 4, loopY);
        ctx.stroke();

        // Insulated handle
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(burnerX + 95, burnerY - 22);
        ctx.lineTo(burnerX + 60, burnerY - 32);
        ctx.stroke();

        // Glowing wire loop tip
        ctx.strokeStyle = spec.outer;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(loopX, loopY, 4.5, 0, Math.PI * 2);
        ctx.stroke();

        // Spectral colored flame aura if burner is on
        if (burnerPower !== 'off') {
          const specFlicker = Math.sin(Date.now() * 0.025) * 3;
          const specGrad = ctx.createRadialGradient(loopX, loopY - 8, 2, loopX, loopY - 8, 26);
          specGrad.addColorStop(0, spec.core);
          specGrad.addColorStop(0.5, spec.outer);
          specGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = specGrad;
          ctx.beginPath();
          ctx.ellipse(loopX + specFlicker * 0.4, loopY - 8, 16, 24, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 7. POURING STREAM & FALLING DROPLETS ANIMATION
      if (pourAnimationRef.current && pourAnimationRef.current.active) {
        const pour = pourAnimationRef.current;
        pour.progress += 0.05;

        // Pipette tip at beaker top
        ctx.fillStyle = theme === 'dark' ? '#64748b' : '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(pour.sourceX - 8, 8);
        ctx.lineTo(pour.sourceX + 8, 8);
        ctx.lineTo(pour.sourceX + 3.5, 34);
        ctx.lineTo(pour.sourceX - 3.5, 34);
        ctx.closePath();
        ctx.fill();

        // Droplets
        ctx.fillStyle = pour.color;
        for (const drop of pour.drops) {
          drop.y += drop.vy;
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Ripple upon striking fluid
        if (totalVolumeMl > 0) {
          ctx.strokeStyle = pour.color;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.ellipse(pour.sourceX, liquidSurfaceY, 15 * Math.min(1, pour.progress * 1.5), 4 * Math.min(1, pour.progress * 1.5), 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (pour.progress >= 1.0) {
          pourAnimationRef.current = null;
        }
      }

      // 8. ACTIVE EXPLOSIONS, COMBUSTION FLARES & SPARKS
      for (let eIdx = explosionsRef.current.length - 1; eIdx >= 0; eIdx--) {
        const exp = explosionsRef.current[eIdx];

        // Expanding Shockwave Ring
        if (exp.shockwaveRadius < exp.maxShockwaveRadius) {
          exp.shockwaveRadius += 4.5;
          const swAlpha = Math.max(0, 1 - exp.shockwaveRadius / exp.maxShockwaveRadius);
          ctx.beginPath();
          ctx.arc(exp.x, exp.y, exp.shockwaveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = exp.type === 'magnesium'
            ? `rgba(255, 255, 255, ${swAlpha * 0.95})`
            : exp.type === 'potassium'
            ? `rgba(216, 180, 254, ${swAlpha * 0.9})`
            : exp.type === 'catalytic_eruption'
            ? `rgba(192, 132, 252, ${swAlpha * 0.85})`
            : `rgba(251, 146, 60, ${swAlpha * 0.85})`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Expanding Fireball Plasma Puff
        if (exp.fireballRadius < exp.maxFireballRadius) {
          exp.fireballRadius += 2.8;
          const fbAlpha = Math.max(0, 1 - exp.fireballRadius / exp.maxFireballRadius);
          const fireGrad = ctx.createRadialGradient(
            exp.x, exp.y, 2,
            exp.x, exp.y, exp.fireballRadius
          );
          if (exp.type === 'magnesium') {
            fireGrad.addColorStop(0, `rgba(255, 255, 255, ${fbAlpha})`);
            fireGrad.addColorStop(0.4, `rgba(224, 242, 254, ${fbAlpha * 0.8})`);
            fireGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          } else if (exp.type === 'potassium') {
            fireGrad.addColorStop(0, `rgba(255, 255, 255, ${fbAlpha})`);
            fireGrad.addColorStop(0.3, `rgba(233, 213, 255, ${fbAlpha * 0.9})`);
            fireGrad.addColorStop(0.7, `rgba(168, 85, 247, ${fbAlpha * 0.7})`);
            fireGrad.addColorStop(1, 'rgba(126, 34, 206, 0)');
          } else if (exp.type === 'catalytic_eruption') {
            fireGrad.addColorStop(0, `rgba(243, 232, 255, ${fbAlpha})`);
            fireGrad.addColorStop(0.4, `rgba(147, 51, 234, ${fbAlpha * 0.8})`);
            fireGrad.addColorStop(1, 'rgba(88, 28, 135, 0)');
          } else {
            fireGrad.addColorStop(0, `rgba(255, 255, 255, ${fbAlpha})`);
            fireGrad.addColorStop(0.3, `rgba(254, 240, 138, ${fbAlpha * 0.9})`);
            fireGrad.addColorStop(0.7, `rgba(249, 115, 22, ${fbAlpha * 0.7})`);
            fireGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          }
          ctx.beginPath();
          ctx.arc(exp.x, exp.y, exp.fireballRadius, 0, Math.PI * 2);
          ctx.fillStyle = fireGrad;
          ctx.fill();
        }

        // Flying Incandescent Spark Particles
        for (let pIdx = exp.particles.length - 1; pIdx >= 0; pIdx--) {
          const p = exp.particles[pIdx];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.16; // gravity
          p.life++;

          // Wall bounce inside beaker
          if (p.x < beakerX + 8 || p.x > beakerX + beakerW - 8) {
            p.vx = -p.vx * 0.55;
          }

          const pAlpha = Math.max(0, 1 - p.life / p.maxLife);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = pAlpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = exp.type === 'magnesium' ? 10 : 6;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;

          if (p.life >= p.maxLife) {
            exp.particles.splice(pIdx, 1);
          }
        }

        if (exp.particles.length === 0 && exp.shockwaveRadius >= exp.maxShockwaveRadius && exp.fireballRadius >= exp.maxFireballRadius) {
          explosionsRef.current.splice(eIdx, 1);
        }
      }

      // 9. FLASH OVERLAY (Camera Flash on Detonation)
      if (flashOverlayRef.current && flashOverlayRef.current.opacity > 0) {
        ctx.fillStyle = flashOverlayRef.current.color;
        ctx.globalAlpha = flashOverlayRef.current.opacity;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1.0;
        flashOverlayRef.current.opacity -= 0.08;
        if (flashOverlayRef.current.opacity <= 0) {
          flashOverlayRef.current = null;
        }
      }

      // 10. 2D CRYSTALLIZATION CLUSTERS (CuSO4, Hot Ice, Golden Rain, Silver Tree, Alum)
      if (crystalType !== 'none' && crystalLevel > 0) {
        const cRatio = Math.min(1, crystalLevel / 100);
        const cColor =
          crystalType === 'copper_blue'
            ? '#0284c7'
            : crystalType === 'golden_rain'
            ? '#facc15'
            : crystalType === 'silver_tree'
            ? '#e2e8f0'
            : crystalType === 'hot_ice'
            ? '#e0f2fe'
            : '#bae6fd';
        ctx.save();
        for (let ci = 0; ci < 14; ci++) {
          const cxPos = beakerX + 18 + (ci / 13) * (beakerW - 36);
          const ch = (12 + (ci % 4) * 9) * cRatio * (crystalType === 'hot_ice' ? 1.8 : 1.1);
          const cyBase = beakerBottomY - 3;
          ctx.fillStyle = cColor;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(cxPos - 5 * cRatio, cyBase);
          ctx.lineTo(cxPos, cyBase - ch);
          ctx.lineTo(cxPos + 5 * cRatio, cyBase);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }

      // 11. 2D SWELLING CARBON SNAKE OR ELEPHANT TOOTHPASTE FOAM
      if (swellingType !== 'none' && swellingLevel > 0) {
        const sRatio = Math.min(1, swellingLevel / 100);
        ctx.save();
        if (swellingType === 'carbon_snake') {
          const snakeH = sRatio * 185;
          for (let seg = 0; seg < 18; seg++) {
            const segY = beakerBottomY - 15 - (seg / 18) * snakeH;
            const segX = w / 2 + Math.sin(seg * 0.45) * 14;
            const segR = 24 - (seg / 18) * 6;
            ctx.fillStyle = seg % 2 === 0 ? '#18181b' : '#27272a';
            ctx.beginPath();
            ctx.arc(segX, segY, segR * sRatio, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (swellingType === 'elephant_foam') {
          const foamH = sRatio * 175;
          for (let fb = 0; fb < 22; fb++) {
            const fy = beakerBottomY - 15 - (fb / 22) * foamH;
            const fx = w / 2 + Math.sin(fb * 1.1) * (18 + (fb % 3) * 10);
            const fr = (16 + (fb % 4) * 5) * sRatio;
            ctx.fillStyle = fb % 3 === 0 ? 'rgba(253, 224, 71, 0.9)' : fb % 3 === 1 ? 'rgba(56, 189, 248, 0.9)' : 'rgba(244, 114, 182, 0.9)';
            ctx.beginPath();
            ctx.arc(fx, fy, fr, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // 12. 2D BROWN NO2 GAS PLUME (Nitric Acid + Copper/Zinc)
      if (brownGasIntensity > 0) {
        ctx.save();
        for (let bg = 0; bg < 12; bg++) {
          const gy = beakerBottomY - 40 - ((Date.now() * 0.04 + bg * 22) % 210);
          const gx = w / 2 + Math.sin(Date.now() * 0.004 + bg) * 38;
          ctx.fillStyle = 'rgba(180, 83, 9, 0.42)';
          ctx.beginPath();
          ctx.arc(gx, gy, 16 + (bg % 4) * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 13. 2D INFLATABLE RUBBER GAS BALLOON COVERING THE ENTIRE BEAKER RIM & GROWING GRADUALLY
      if (isBalloonAttached || balloonInflation > 0) {
        const infRatio = Math.max(0, Math.min(1, balloonInflation / 100));
        const rimLeftX = beakerX - 13; // Includes the beaker spout on the left
        const rimRightX = beakerX + beakerW + 3; // Includes the right glass wall
        const rimWidth = rimRightX - rimLeftX;
        const rimCenterX = (rimLeftX + rimRightX) / 2;

        // Subtle breathing pulse as gas fills the balloon
        const pulse = infRatio > 0.03 ? Math.sin(Date.now() * 0.006) * 2.2 * infRatio : 0;
        const domeHeight = 12 + infRatio * 84 + pulse;
        const bellySpread = infRatio * 34 + pulse * 0.7;
        const apexY = beakerY - domeHeight;
        const cuffBottomY = beakerY + 14;

        ctx.save();

        // Base color & translucent 3D latex gradient
        const baseCol = balloonColor || '#ec4899';
        const balGrad = ctx.createRadialGradient(
          rimCenterX - rimWidth * 0.18,
          beakerY - domeHeight * 0.55,
          6,
          rimCenterX,
          beakerY - domeHeight * 0.3,
          Math.max(rimWidth * 0.7, domeHeight + 30)
        );
        balGrad.addColorStop(0, '#ffffff');
        balGrad.addColorStop(0.18, baseCol);
        balGrad.addColorStop(0.82, baseCol);
        balGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');

        // 1. Main Balloon Dome + Stretched Cuff sealing 100% of the beaker top
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = balGrad;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Start at bottom-left of the rubber cuff gripping the beaker wall
        ctx.moveTo(rimLeftX - 2, cuffBottomY);
        ctx.lineTo(rimLeftX - 2, beakerY + 2);
        // Curve outward and upward over the balloon dome
        ctx.bezierCurveTo(
          rimLeftX - 6 - bellySpread,
          beakerY - domeHeight * 0.45,
          rimCenterX - (rimWidth * 0.46 + bellySpread * 0.65),
          apexY,
          rimCenterX,
          apexY
        );
        ctx.bezierCurveTo(
          rimCenterX + (rimWidth * 0.46 + bellySpread * 0.65),
          apexY,
          rimRightX + 6 + bellySpread,
          beakerY - domeHeight * 0.45,
          rimRightX + 2,
          beakerY + 2
        );
        // Down to bottom-right of the rubber cuff
        ctx.lineTo(rimRightX + 2, cuffBottomY);
        // Across the tight rubber collar gripping the beaker
        ctx.quadraticCurveTo(rimCenterX, cuffBottomY + 4, rimLeftX - 2, cuffBottomY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Rolled Rubber Lip Ring gripping around the entire beaker mouth
        ctx.globalAlpha = 0.96;
        ctx.fillStyle = baseCol;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(rimLeftX - 4, cuffBottomY - 4, rimWidth + 8, 6, 3);
        ctx.fill();
        ctx.stroke();

        // 3. Subtle Beaker Rim Line visible through the stretched latex cuff
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(rimLeftX + 2, beakerY + 1);
        ctx.lineTo(rimRightX - 2, beakerY + 1);
        ctx.stroke();
        ctx.setLineDash([]);

        // 4. Glossy Specular Highlight on Balloon Dome
        if (domeHeight > 18) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
          ctx.beginPath();
          ctx.ellipse(
            rimCenterX - rimWidth * 0.24 - bellySpread * 0.2,
            beakerY - domeHeight * 0.58,
            10 + infRatio * 14,
            4 + infRatio * 18,
            -0.42,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // 5. Rising Gas Molecules inside the inflating balloon & Live Percentage Badge
        if (balloonInflation > 2) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          const gasDots = Math.min(10, Math.ceil(infRatio * 10));
          for (let gd = 0; gd < gasDots; gd++) {
            const gx = rimCenterX + Math.sin(Date.now() * 0.003 + gd * 1.7) * (rimWidth * 0.32 + bellySpread * 0.3);
            const gy = beakerY - 8 - ((Date.now() * 0.03 + gd * 14) % Math.max(12, domeHeight - 14));
            ctx.beginPath();
            ctx.arc(gx, gy, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.globalAlpha = 1.0;
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
          ctx.shadowBlur = 4;
          ctx.fillText(`🎈 ${balloonInflation.toFixed(0)}%`, rimCenterX, beakerY - domeHeight * 0.42);
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }

      // 14. 2D ENHANCED EFFECTS: LUMINOL CHEMILUMINESCENCE, TOLLENS SILVER MIRROR, CHEMICAL GARDEN, GOLD TREE, VOLCANO & THERMITE
      if (chemiluminescenceLevel > 0) {
        ctx.save();
        const pulse = 0.6 + 0.25 * Math.sin(Date.now() * 0.006);
        const lumGrad = ctx.createRadialGradient(w / 2, beakerBottomY - 60, 8, w / 2, beakerBottomY - 60, 125);
        lumGrad.addColorStop(0, `rgba(56, 189, 248, ${pulse})`);
        lumGrad.addColorStop(0.55, `rgba(14, 165, 233, ${pulse * 0.5})`);
        lumGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = lumGrad;
        ctx.fillRect(beakerX - 25, beakerY, beakerW + 50, beakerH + 20);
        ctx.restore();
      }

      if (silverMirrorLevel > 0) {
        ctx.save();
        const agGrad = ctx.createLinearGradient(beakerX + 6, beakerY + 40, beakerX + beakerW - 6, beakerY + 40);
        agGrad.addColorStop(0, 'rgba(148, 163, 184, 0.88)');
        agGrad.addColorStop(0.25, 'rgba(248, 250, 252, 0.95)');
        agGrad.addColorStop(0.5, 'rgba(203, 213, 225, 0.85)');
        agGrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.98)');
        agGrad.addColorStop(1, 'rgba(148, 163, 184, 0.88)');
        ctx.fillStyle = agGrad;
        ctx.fillRect(beakerX + 6, beakerY + 55, beakerW - 12, beakerH - 62);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🪞 Ag⁰ SILVER MIRROR', w / 2, beakerBottomY - 40);
        ctx.restore();
      }

      if (hasChemicalGarden) {
        ctx.save();
        const towers = [
          { x: beakerX + 32, h: 85, c: '#0284c7' },
          { x: beakerX + 62, h: 112, c: '#7c3aed' },
          { x: beakerX + 92, h: 96, c: '#10b981' },
          { x: beakerX + 122, h: 118, c: '#d97706' },
          { x: beakerX + 150, h: 88, c: '#ec4899' }
        ];
        towers.forEach((tw, idx) => {
          ctx.fillStyle = tw.c;
          ctx.beginPath();
          ctx.moveTo(tw.x - 7, beakerBottomY - 5);
          ctx.lineTo(tw.x + Math.sin(idx) * 4, beakerBottomY - 5 - tw.h);
          ctx.lineTo(tw.x + 7, beakerBottomY - 5);
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();
      }

      if (hasGoldTree) {
        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.8;
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 10;
        for (let b = 0; b < 9; b++) {
          const ang = -Math.PI / 2 + (b - 4) * 0.24;
          const len = 38 + (b % 3) * 14;
          ctx.beginPath();
          ctx.moveTo(w / 2, beakerBottomY - 6);
          ctx.lineTo(w / 2 + Math.cos(ang) * len, beakerBottomY - 6 + Math.sin(ang) * len);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (dichromateVolcanoLevel > 0) {
        ctx.save();
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 62, beakerBottomY - 4);
        ctx.lineTo(w / 2 - 14, beakerBottomY - 64);
        ctx.lineTo(w / 2 + 14, beakerBottomY - 64);
        ctx.lineTo(w / 2 + 62, beakerBottomY - 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(w / 2, beakerBottomY - 64, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (thermiteLevel > 0) {
        ctx.save();
        const thGrad = ctx.createRadialGradient(w / 2, beakerBottomY - 10, 4, w / 2, beakerBottomY - 10, 58);
        thGrad.addColorStop(0, '#ffffff');
        thGrad.addColorStop(0.4, '#fef08a');
        thGrad.addColorStop(0.75, '#f97316');
        thGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
        ctx.fillStyle = thGrad;
        ctx.beginPath();
        ctx.arc(w / 2, beakerBottomY - 10, 58, Math.PI, 0);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore(); // ends screen shake translation

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [
    content,
    totalVolumeMl,
    currentTempC,
    currentPh,
    burnerPower,
    isStirring,
    isThermometerActive,
    isPhMeterActive,
    litmusStripDipped,
    isConductivityActive,
    conductivityGlow,
    flameTestMetal,
    isEthanolBurning,
    effervescenceBubbles,
    isBalloonAttached,
    balloonInflation,
    balloonColor,
    swellingType,
    swellingLevel,
    crystalType,
    crystalLevel,
    brownGasIntensity,
    theme,
    viewMode
  ]);

  return (
    <div className="space-y-6">
      {/* 100% Zero-Harm Safety Assurance Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md ${
        isDark ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm flex items-center gap-1.5">
              <span>{t('معمل تجارب افتراضي آمن بنسبة 100%', '100% Safe Virtual Chemistry & Physics Workbench')}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 font-bold">
                {t('بدون أي أذى أو مخاطر', 'Zero Harm & No Hazards')}
              </span>
            </h4>
            <p className="text-xs text-emerald-300/90 mt-0.5 leading-relaxed">
              {t(
                'استكشف التفاعلات الكيميائية والفيزيائية، وتغيرات الألوان، والفوران، والترسيب، والحرارة بكل حرية واطمئنان.',
                'Freely experiment with reactions, color changes, gas evolution, precipitation, and heat in total safety.'
              )}
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex rounded-xl p-1 border border-emerald-700/40 bg-emerald-950/60 text-xs font-bold shrink-0">
          <button
            onClick={() => setLabMode('open_sandbox')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              labMode === 'open_sandbox'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            {t('المعمل الحر الطليق 🧪', 'Open Sandbox Lab 🧪')}
          </button>
          <button
            onClick={() => setLabMode('guided')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              labMode === 'guided'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            {t('تجارب إرشادية آمنة 📋', 'Guided Missions 📋')}
          </button>
        </div>
      </div>

      {/* Guided Mission Banner when in Guided Mode */}
      {labMode === 'guided' && (
        <div className={`p-4 rounded-2xl border space-y-3 shadow-md ${
          isDark ? 'bg-slate-900 border-cyan-500/40' : 'bg-white border-cyan-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t(currentMission.titleAr, currentMission.titleEn)}
              </h3>
            </div>
            {missionComplete && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('اكتملت التجربة بنجاح ممتاز!', 'Mission Completed Successfully!')}</span>
              </span>
            )}
          </div>

          <p className="text-xs text-cyan-300 leading-relaxed font-medium">
            <span className="font-bold text-slate-400">{t('المهمة المطلوبة:', 'Required Task:')} </span>
            {t(currentMission.goalAr, currentMission.goalEn)}
          </p>

          {/* Quick Mission Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {GUIDED_MISSIONS.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  playLabSound('click');
                  setGuidedMissionId(m.id);
                  setMissionComplete(false);
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all whitespace-nowrap ${
                  guidedMissionId === m.id
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                    : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {t(m.titleAr.split(' ')[1] || m.titleAr, m.titleEn.split(' ')[1] || m.titleEn)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Step-by-Step Reaction Recipes Guide (Teaches HOW to perform reactions manually without auto-running them!) */}
      <div className={`p-4 rounded-2xl border shadow-md space-y-3.5 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className={`text-xs sm:text-sm font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {t('📖 دليل كيف تصنع التفاعلات بنفسك خطوة بخطوة (بدون تفاعلات جاهزة):', '📖 Step-by-Step Guide: How to Mix Reactions Yourself:')}
            </span>
          </div>
          <span className="text-[11px] font-bold text-cyan-400">
            {t('اختر أي تفاعل لمعرفة مواده وخطوات تحضيره يدوياً من الرف', 'Select any reaction to view its required reagents & manual steps')}
          </span>
        </div>

        {/* Reaction Recipe Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {REACTION_RECIPES.map(item => {
            const isSelected = selectedRecipeId === item.id;
            const done = item.isCompleted(content);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  playLabSound('click');
                  setSelectedRecipeId(item.id);
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                  isSelected
                    ? 'bg-cyan-950 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/60'
                    : isDark
                    ? 'bg-slate-950/90 border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:bg-slate-900'
                    : 'bg-slate-50 border-slate-200 hover:border-cyan-500 text-slate-800 hover:bg-cyan-50/40'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <div className="text-right">
                  <div className="leading-tight flex items-center gap-1.5">
                    <span>{t(item.labelAr, item.labelEn)}</span>
                    {done && <span className="text-emerald-400 text-xs">✅</span>}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400">{item.badge}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Reaction Step-by-Step Instruction Card */}
        <div className={`p-3.5 sm:p-4 rounded-xl border space-y-3 transition-all ${
          isDark ? 'bg-slate-950/85 border-cyan-500/40' : 'bg-cyan-50/50 border-cyan-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeRecipe.icon}</span>
              <div>
                <h4 className={`text-xs sm:text-sm font-black flex items-center gap-2 flex-wrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span>{t('طريقة تحضير:', 'How to Prepare:')} {t(activeRecipe.labelAr, activeRecipe.labelEn)}</span>
                  {activeRecipe.isCompleted(content) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[11px] font-extrabold">
                      {t('✅ أحسنت! نجحت في تطبيق التفاعل بنفسك!', '✅ Great job! You mixed this reaction yourself!')}
                    </span>
                  )}
                </h4>
                <div dir="ltr" className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5">
                  {activeRecipe.equation}
                </div>
              </div>
            </div>

            {/* Filter Shelf to Required Reagents Toggle */}
            <button
              type="button"
              onClick={() => {
                playLabSound('click');
                setShowOnlyRecipeReagents(prev => !prev);
                setReagentSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                showOnlyRecipeReagents
                  ? 'bg-amber-600 border-amber-400 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-900 border-cyan-500/50 text-cyan-300 hover:bg-slate-800'
                  : 'bg-white border-cyan-400 text-cyan-800 hover:bg-cyan-50'
              }`}
            >
              <span>🔍</span>
              <span>
                {showOnlyRecipeReagents
                  ? t('عرض كل المواد في الرف (50 مادة)', 'Show All 50 Shelf Reagents')
                  : t('فلترة الرف على مواد هذه التجربة فقط', 'Filter Shelf to Needed Reagents Only')}
              </span>
            </button>
          </div>

          {/* Required Shelf Reagents Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-extrabold text-cyan-400 shrink-0">
              {t('🧪 المواد المطلوبة من الرف:', '🧪 Required Reagents from Shelf:')}
            </span>
            {activeRecipe.requiredReagents.map(reqId => {
              const found = REAGENTS.find(r => r.id === reqId);
              if (!found) return null;
              return (
                <span
                  key={reqId}
                  className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] flex items-center gap-1.5 ${
                    isDark ? 'bg-slate-900 border-amber-500/50 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <span>⭐</span>
                  <span>{t(found.nameAr, found.nameEn)}</span>
                  <span className="font-mono text-cyan-400">({found.formula})</span>
                </span>
              );
            })}
          </div>

          {/* Numbered Step-by-Step Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {(lang === 'ar' ? activeRecipe.stepsAr : activeRecipe.stepsEn).map((stepText, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs leading-relaxed font-semibold ${
                  isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {stepText}
              </div>
            ))}
          </div>

          {/* Expected Scientific Observation */}
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
            <span className="font-extrabold text-cyan-400 shrink-0">{t('🔬 النتيجة العلمية المتوقعة:', '🔬 Expected Observation:')}</span>
            <span>{t(activeRecipe.resultAr, activeRecipe.resultEn)}</span>
          </div>
        </div>
      </div>

      {/* MAIN WORKBENCH RESPONSIVE CONTAINER */}
      <div className="w-full flex flex-col md:flex-row gap-5 items-start overflow-x-hidden">
        {/* Left Column: Reagents & Safe Chemical Shelf */}
        <div className="w-full md:w-[300px] lg:w-[330px] xl:w-[350px] shrink-0 min-w-0 flex flex-col gap-4 order-2 md:order-1">
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <Droplet className="w-4 h-4 text-cyan-400" />
                <span>{t('رف المحاليل والمواد الكيميائية', 'Reagents & Chemical Shelf')}</span>
              </h3>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">{REAGENTS.length} {t('مواد آمنة', 'Safe Items')}</span>
            </div>

            {/* Precision Volume & Dosage Dispenser Deck (Full Freedom per mL) */}
            <div className={`p-3.5 rounded-xl border space-y-3 ${
              isDark ? 'bg-slate-950/70 border-cyan-900/50' : 'bg-cyan-50/50 border-cyan-200'
            }`}>
              {/* Header and Mode Selector */}
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{t('وحدة التحكم الدقيق بالحجم والجرعات', 'Precision Dosage Station')}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 font-mono font-bold">
                  {dispenseMode === 'ml' ? `${dispenseAmountMl} mL` : dispenseMode === 'drop' ? `${dispenseDrops} drops` : `${dispenseGrams} g`}
                </span>
              </div>

              {/* Dispense Mode Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => setDispenseMode('ml')}
                  className={`py-1 rounded transition-all ${
                    dispenseMode === 'ml' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💧 {t('مليلتر (mL)', 'mL Mode')}
                </button>
                <button
                  onClick={() => setDispenseMode('drop')}
                  className={`py-1 rounded transition-all ${
                    dispenseMode === 'drop' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🧪 {t('قطرات', 'Drops')}
                </button>
                <button
                  onClick={() => setDispenseMode('gram')}
                  className={`py-1 rounded transition-all ${
                    dispenseMode === 'gram' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚖️ {t('غرامات (g)', 'Grams')}
                </button>
              </div>

              {/* Mode-Specific Precise Inputs */}
              {dispenseMode === 'ml' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400">{t('تحكم بكل مليلتر (1 - 100 مل):', 'Control every mL (1-100 mL):')}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setDispenseAmountMl(m => Math.max(1, m - 5))}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-[10px]"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => setDispenseAmountMl(m => Math.max(1, m - 1))}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-[10px]"
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={dispenseAmountMl}
                        onChange={(e) => setDispenseAmountMl(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                        className="w-14 text-center font-mono font-black text-cyan-400 bg-slate-900 border border-cyan-500/50 rounded py-0.5 text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        onClick={() => setDispenseAmountMl(m => Math.min(100, m + 1))}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-[10px]"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => setDispenseAmountMl(m => Math.min(100, m + 5))}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-[10px]"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Free Range Slider for ML */}
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={dispenseAmountMl}
                    onChange={(e) => setDispenseAmountMl(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-500"
                  />

                  {/* Quick ML Presets & Single mL Trigger */}
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <div className="grid grid-cols-6 gap-1">
                      {[1, 2, 5, 10, 25, 50].map(amt => (
                        <button
                          key={amt}
                          onClick={() => setDispenseAmountMl(amt)}
                          className={`py-1 rounded text-[10px] font-mono font-bold border transition-all ${
                            dispenseAmountMl === amt
                              ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                              : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {amt}ml
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setDispenseAmountMl(1);
                        setDispenseMode('ml');
                      }}
                      className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        dispenseAmountMl === 1
                          ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                          : isDark ? 'bg-slate-900/90 border-cyan-800/50 text-cyan-300 hover:bg-slate-800' : 'bg-white border-cyan-300 text-cyan-700 hover:bg-cyan-50'
                      }`}
                    >
                      <span>💧</span>
                      <span>{t('تحديد الجرعة: 1 مليلتر حر دقيق (+1 mL)', 'Set Dosage: Single Free mL (+1 mL)')}</span>
                    </button>
                  </div>
                </div>
              )}

              {dispenseMode === 'drop' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{t('عدد القطرات الدقيقة:', 'Drop count:')}</span>
                    <span className="font-mono text-cyan-400 font-bold">{dispenseDrops} {t('قطرات', 'drops')}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 5, 10].map(d => (
                      <button
                        key={d}
                        onClick={() => setDispenseDrops(d)}
                        className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          dispenseDrops === d
                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                            : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {d} {d === 1 ? t('قطرة', 'drop') : t('قطرات', 'drops')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {dispenseMode === 'gram' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{t('كتلة المسحوق / الفلز:', 'Powder / Metal Mass:')}</span>
                    <span className="font-mono text-cyan-400 font-bold">{dispenseGrams} {t('جرام', 'g')}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[0.5, 1, 2, 5, 10].map(g => (
                      <button
                        key={g}
                        onClick={() => setDispenseGrams(g)}
                        className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          dispenseGrams === g
                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                            : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {g}g
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Input for the 50 Chemical Reagents */}
            <div className="relative">
              <input
                type="text"
                value={reagentSearchQuery}
                onChange={e => setReagentSearchQuery(e.target.value)}
                placeholder={t('🔍 ابحث في 50 مادة بالاسم أو الصيغة (لومينول، ذهب، تولنز، ثرميت)...', '🔍 Search 50 reagents by name or formula (Luminol, Gold, Tollens)...')}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none transition-all ${
                  isDark
                    ? 'bg-slate-950/90 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-cyan-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-600'
                }`}
              />
              {reagentSearchQuery && (
                <button
                  onClick={() => setReagentSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Tabs for the 50 Chemical Reagents */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold no-scrollbar">
              {[
                { id: 'all', labelAr: `الكل (${REAGENTS.length})`, labelEn: `All (${REAGENTS.length})` },
                { id: 'acids_bases', labelAr: 'أحماض قوية وقواعد', labelEn: 'Acids & Bases' },
                { id: 'metals', labelAr: 'فلزات وثرميت وذهب', labelEn: 'Metals & Thermite' },
                { id: 'salts_crystals', labelAr: 'أملاح وتبلور وحديقة بلورية', labelEn: 'Crystals & Garden' },
                { id: 'indicators_oxidizers', labelAr: 'لومينول وكواشف ومؤكسدات', labelEn: 'Luminol & Indicators' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setReagentCategory(cat.id as typeof reagentCategory)}
                  className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all ${
                    reagentCategory === cat.id
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                      : isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {t(cat.labelAr, cat.labelEn)}
                </button>
              ))}
            </div>

            {/* Chemical Reagents Shelf Buttons */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto overflow-x-hidden pr-1">
              {REAGENTS.filter(r => {
                if (showOnlyRecipeReagents) {
                  return activeRecipe.requiredReagents.includes(r.id);
                }
                if (reagentSearchQuery.trim() !== '') {
                  const q = reagentSearchQuery.toLowerCase();
                  return (
                    r.nameAr.toLowerCase().includes(q) ||
                    r.nameEn.toLowerCase().includes(q) ||
                    r.formula.toLowerCase().includes(q) ||
                    r.id.toLowerCase().includes(q)
                  );
                }
                if (reagentCategory === 'all') return true;
                if (reagentCategory === 'acids_bases') {
                  return ['water', 'sulfuric_acid', 'nitric_acid', 'acid_hcl', 'acetic_acid', 'oxalic_acid', 'base_naoh', 'ammonia_solution'].includes(r.id);
                }
                if (reagentCategory === 'metals') {
                  return ['zinc_granules', 'copper_turnings', 'aluminum_powder', 'sodium_metal', 'potassium_metal', 'magnesium_ribbon', 'iron_filings', 'iron_oxide_thermite', 'calcium_carbide', 'gold_chloride'].includes(r.id);
                }
                if (reagentCategory === 'salts_crystals') {
                  return ['sodium_acetate', 'potassium_alum', 'sucrose_sugar', 'glucose_sugar', 'potassium_iodide', 'lead_nitrate', 'copper_sulfate', 'silver_nitrate', 'baking_soda', 'calcium_chloride', 'strontium_chloride', 'barium_chloride', 'ice_cubes', 'ferric_chloride', 'potassium_thiocyanate', 'potassium_ferrocyanide', 'ammonium_dichromate', 'cobalt_chloride', 'sodium_silicate', 'sodium_thiosulfate', 'lithium_chloride', 'nickel_sulfate', 'ammonium_chloride'].includes(r.id);
                }
                return ['hydrogen_peroxide', 'potassium_permanganate', 'iodine_solution', 'starch_powder', 'phenolphthalein', 'universal_indicator', 'ethanol', 'luminol', 'tollens_reagent', 'methylene_blue', 'indigo_carmine', 'fehling_solution'].includes(r.id);
              }).map(r => {
                const isNeededForSelectedRecipe = activeRecipe.requiredReagents.includes(r.id);
                return (
                <div
                  key={r.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all min-w-0 ${
                    isNeededForSelectedRecipe
                      ? isDark
                        ? 'bg-amber-950/25 border-amber-500/60 hover:border-amber-400'
                        : 'bg-amber-50/70 border-amber-400'
                      : isDark
                      ? 'bg-slate-950/50 border-slate-800 hover:border-cyan-600/40'
                      : 'bg-slate-50 border-slate-200 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-black border shrink-0"
                      style={{
                        backgroundColor: r.defaultColor,
                        color: r.type === 'powder' || r.type === 'solid' ? '#0f172a' : '#ffffff',
                        borderColor: 'rgba(255,255,255,0.2)'
                      }}
                    >
                      {r.formula.split(' ')[0].substring(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {t(r.nameAr, r.nameEn)}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold shrink-0">({r.formula})</span>
                        {isNeededForSelectedRecipe && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold shrink-0">
                            ⭐ {t('مطلوب للتجربة', 'Needed')}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                        {t(r.descAr, r.descEn)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {r.type === 'liquid' && (
                      <button
                        onClick={() => handleAddReagent(r.id, dispenseMode === 'drop' ? 0.6 : 1)}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-bold shrink-0 transition-all hover:border-cyan-500/50"
                        title={dispenseMode === 'drop' ? t('إضافة قطرة واحدة (0.6 مل)', 'Add 1 drop (0.6 mL)') : t('إضافة 1 مليلتر بالضبط', 'Add exactly 1 mL')}
                      >
                        {dispenseMode === 'drop' ? `+1 ${t('قطرة', 'drop')}` : '+1 ml'}
                      </button>
                    )}
                    {r.type === 'indicator' && (
                      <button
                        onClick={() => handleAddReagent(r.id, 1)}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-bold shrink-0 transition-all hover:border-amber-500/50"
                        title={t('إضافة قطرة واحدة', 'Add 1 drop')}
                      >
                        +1 {t('قطرة', 'drop')}
                      </button>
                    )}
                    {(r.type === 'solid' || r.type === 'powder') && (
                      <button
                        onClick={() => handleAddReagent(r.id, 0.2)}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-[11px] font-bold shrink-0 transition-all hover:border-emerald-500/50"
                        title={t('إضافة قطعة صغيرة (0.2 جم)', 'Add small piece (0.2 g)')}
                      >
                        +0.2g
                      </button>
                    )}
                    <button
                      onClick={() => handleAddReagent(r.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t('إضافة', 'Add')}</span>
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Simulation Stage & Instruments */}
        <div className="w-full flex-1 min-w-0 flex flex-col xl:flex-row gap-5 order-1 md:order-2">
          {/* Middle Column: Interactive Beaker Workbench & Real-time Canvas */}
          <div className="w-full xl:flex-1 min-w-0 flex flex-col gap-4 items-center">
          <div className={`w-full min-w-0 p-4 rounded-2xl border shadow-lg flex flex-col items-center relative ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {/* Viewport Dimension Mode Selector (3D / 2D / Split View) */}
            <div className="w-full flex items-center justify-between pb-2 mb-3 border-b border-slate-800 gap-2 flex-wrap">
              <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl shadow-inner">
                <button
                  onClick={() => {
                    playLabSound('click');
                    setViewMode('2d');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === '2d'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{t('مخطط 2D', '2D View')}</span>
                </button>
                <button
                  onClick={() => {
                    playLabSound('click');
                    setViewMode('3d');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === '3d'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{t('مجسم 3D', '3D Model')}</span>
                </button>
              </div>

              {/* Gas Syringe / Volume Indicator */}
              {content.hydrogenGasMl > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-mono font-bold animate-pulse">
                  <Wind className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('غاز H₂ متصاعد:', 'Evolved H₂:')} {content.hydrogenGasMl.toFixed(0)} mL</span>
                </div>
              )}
            </div>

            {/* Top Workbench Status Bar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
              <div className="flex items-center gap-2 font-mono font-bold">
                <span className="text-slate-400">{t('الحجم:', 'Volume:')}</span>
                <span className="text-cyan-400">{totalVolumeMl.toFixed(0)} / 250 mL</span>
              </div>

              <div className="flex items-center flex-wrap gap-1.5">
                {/* Sound Toggle */}
                <button
                  onClick={() => setIsSoundMuted(prev => !prev)}
                  className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                    isSoundMuted
                      ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                  title={isSoundMuted ? t('تشغيل المؤثرات الصوتية', 'Unmute sound effects') : t('كتم المؤثرات الصوتية', 'Mute sound effects')}
                >
                  {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>

                {/* Withdraw Pipette */}
                <button
                  onClick={() => handleWithdrawLiquid(10)}
                  disabled={totalVolumeMl <= 0}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
                  title={t('سحب 10 مل بالمصة', 'Withdraw 10 mL using pipette')}
                >
                  <Droplet className="w-3 h-3" />
                  <span>{t('مصة (-10ml)', 'Pipette (-10ml)')}</span>
                </button>

                {/* Dry Beaker */}
                <button
                  onClick={handleSetDryBeaker}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1 transition-all hover:text-rose-300"
                  title={t('تفريغ الكأس تماماً وتجفيفه من أي سوائل', 'Completely empty and dry beaker')}
                >
                  <Trash2 className="w-3 h-3 text-rose-400" />
                  <span>{t('كأس جاف (0 ml)', 'Dry Beaker (0 ml)')}</span>
                </button>

                {/* Flush Beaker */}
                <button
                  onClick={handleCleanBeaker}
                  className="px-2.5 py-1 rounded-lg bg-cyan-900/60 hover:bg-cyan-800/70 text-cyan-200 text-xs font-bold flex items-center gap-1 border border-cyan-700/60 transition-all"
                  title={t('تفريغ الكأس وغسيله بماء مقطر', 'Flush and clean beaker with pure water')}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('غسيل مقطر', 'Flush 100ml')}</span>
                </button>
              </div>
            </div>

            {/* Viewport Rendering Area (3D or 2D) */}
            <div className="w-full flex flex-col items-center justify-center animate-fadeIn">
              {viewMode === '3d' ? (
                <div className="w-full flex flex-col items-center">
                  <LabViewer3D
                    key="lab-3d-main"
                    totalVolumeMl={totalVolumeMl}
                    fluidColor={getFluidColor()}
                    currentTempC={currentTempC}
                    phValue={currentPh}
                    burnerPower={burnerPower}
                    isStirring={isStirring}
                    isThermometerActive={isThermometerActive}
                    precipitateG={
                      content.precipitateG +
                      content.ironG +
                      content.bakingSodaG * 0.6 +
                      content.calciumChlorideG * 0.5 +
                      content.permanganateG * 0.4 +
                      (content.strontiumG || 0) * 0.5 +
                      (content.bariumG || 0) * 0.5
                    }
                    effervescenceBubbles={effervescenceBubbles}
                    isConductivityActive={isConductivityActive}
                    conductivityGlow={conductivityGlow}
                    flameTestMetal={flameTestMetal}
                    isEthanolBurning={isEthanolBurning}
                    displayedWeightG={displayedWeightG}
                    litmusStripDipped={litmusStripDipped}
                    hydrogenGasMl={content.hydrogenGasMl}
                    dispenseTrigger={dispenseAnimCounter}
                    dispenseInfo={dispenseInfo}
                    explosionEvent={explosionEvent3D}
                    iceCount={content.iceCount}
                    hasActiveMetal={
                      activeSkitteringMetal !== 'none'
                        ? activeSkitteringMetal
                        : content.sodiumG > 0
                        ? 'sodium'
                        : content.potassiumG > 0
                        ? 'potassium'
                        : 'none'
                    }
                    hasMagnesiumRibbon={content.magnesiumG > 0}
                    precipitateType={
                      hasGoldTree
                        ? 'golden_lead_iodide'
                        : thermiteLevel > 0
                        ? 'molten_iron'
                        : dichromateVolcanoLevel > 0
                        ? 'dichromate_green'
                        : (content.ferricChlorideMl || 0) > 0 && ((content.potassiumFerrocyanideMl || 0) > 0 || (content.ferrocyanideG || 0) > 0)
                        ? 'prussian_blue'
                        : ((content.fehlingMl || 0) > 0 || (content.copperSulfateMl > 0 && content.baseMl > 0)) && (content.glucoseG || 0) > 0
                        ? 'cuprous_oxide'
                        : (content.ferricChlorideMl || 0) > 0 && (content.baseMl > 0 || content.ammoniaMl > 0)
                        ? 'ferric_hydroxide'
                        : ((content.sodiumThiosulfateMl || 0) > 0 || (content.thiosulfateMl || 0) > 0) && (content.acidMl > 0 || (content.sulfuricAcidMl || 0) > 0)
                        ? 'sulfur_yellow'
                        : swellingType === 'carbon_snake'
                        ? 'carbon_black'
                        : (content.leadNitrateMl || 0) > 0 && (content.potassiumIodideG || 0) > 0
                        ? 'golden_lead_iodide'
                        : (content.zincG || 0) > 0 && content.copperSulfateMl > 0
                        ? 'copper_metal'
                        : content.silverNitrateMl > 0 && (content.acidMl > 0 || content.calciumChlorideG > 0)
                        ? 'silver_chloride'
                        : content.copperSulfateMl > 0 && (content.baseMl > 0 || content.ammoniaMl > 0)
                        ? 'copper_hydroxide'
                        : content.bariumG > 0 && (content.copperSulfateMl > 0 || (content.sulfuricAcidMl || 0) > 0)
                        ? 'barium_sulfate'
                        : content.ironG > 0
                        ? 'iron'
                        : content.permanganateG > 0
                        ? 'permanganate'
                        : content.bakingSodaG > 0 || content.calciumChlorideG > 0 || content.strontiumG > 0 || content.bariumG > 0
                        ? 'white_salt'
                        : 'none'
                    }
                    lastActionMessage={lastActionMessage}
                    isBalloonAttached={isBalloonAttached}
                    balloonInflation={balloonInflation}
                    balloonColor={balloonColor}
                    swellingType={dichromateVolcanoLevel > 0 ? 'dichromate_volcano' : swellingType}
                    swellingLevel={dichromateVolcanoLevel > 0 ? dichromateVolcanoLevel : swellingLevel}
                    crystalType={
                      hasGoldTree
                        ? 'gold_tree'
                        : hasChemicalGarden
                        ? 'chemical_garden'
                        : crystalType
                    }
                    crystalLevel={hasGoldTree || hasChemicalGarden ? 100 : crystalLevel}
                    hasZincGranules={(content.zincG || 0) > 0 || (content.aluminumG || 0) > 0}
                    hasCopperTurnings={(content.copperMetalG || 0) > 0}
                    brownGasIntensity={brownGasIntensity}
                    chemiluminescenceLevel={chemiluminescenceLevel}
                    silverMirrorLevel={silverMirrorLevel}
                    thermiteGlow={thermiteLevel}
                    whiteSmokeIntensity={whiteSmokeIntensity}
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-[4/3] max-w-[460px] bg-slate-950 border-2 border-slate-700/60 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center touch-none">
                  <canvas
                    key="lab-canvas-2d-main"
                    ref={canvasRef}
                    width={460}
                    height={345}
                    className="w-full h-full relative z-10 cursor-grab active:cursor-grabbing select-none"
                    onPointerDown={handleCanvasPointerDown}
                    onPointerMove={handleCanvasPointerMove}
                    onPointerUp={handleCanvasPointerUp}
                    onPointerCancel={handleCanvasPointerUp}
                  />
                </div>
              )}
            </div>

            {/* Experiment Description & Observation Banner (Placed AFTER the experiment canvas so it never covers the balloon or beaker) */}
            {lastActionMessage && (
              <div
                className={`w-full mt-3 px-3.5 py-2.5 rounded-xl border flex items-start gap-2.5 shadow-md transition-all ${
                  isDark
                    ? 'bg-slate-950/90 border-cyan-500/40 text-slate-200'
                    : 'bg-cyan-50/80 border-cyan-300 text-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 text-xs font-bold leading-relaxed">
                  <span className="text-cyan-400 font-extrabold ml-1.5">
                    {t('وصف التجربة:', 'Experiment Description:')}
                  </span>
                  <span>{lastActionMessage}</span>
                </div>
              </div>
            )}

            {/* Live Balanced Chemical Equation Banner */}
            {activeChemicalEquation && (
              <div
                dir="ltr"
                className="w-full mt-2.5 px-3.5 py-2 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex items-center justify-between gap-2 shadow-inner"
              >
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400 shrink-0">
                  {lang === 'ar' ? 'المعادلة الكيميائية:' : 'REACTION EQUATION:'}
                </span>
                <code className="text-xs font-mono font-bold text-emerald-300 truncate">
                  {activeChemicalEquation}
                </code>
              </div>
            )}

            {/* User Stirring & Interaction Guidance Tip */}
            <div className="w-full mt-2.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-cyan-300 flex items-center justify-between gap-2 shadow-inner">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{t('💡 الخلط يتم بتحريك العصا الزجاجية: انقر زر "خلط بالعصا الزجاجية" أدناه أو اسحب العصا داخل الكأس مباشرة لمزج المحلول وتذويب الرواسب.', '💡 Mixing is done by moving the rod: click "Stir with Glass Rod" below or drag the rod inside the beaker to mix and dissolve solids.')}</span>
              </span>
              {isStirring && (
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold animate-pulse">
                  {t('جاري الخلط...', 'Stirring...')}
                </span>
              )}
            </div>

            {/* Tools Rack Controls under Beaker */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3">
              {/* Bunsen Burner Power Toggle */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold block">{t('موقد بنزن:', 'Bunsen Burner:')}</span>
                <button
                  onClick={() => {
                    const next = burnerPower === 'off' ? 'med' : burnerPower === 'med' ? 'high' : burnerPower === 'high' ? 'low' : 'off';
                    setBurnerPower(next);
                    if (next !== 'off') {
                      playSoundEffect('burner_on');
                      if ((content.ironOxideThermiteG || 0) > 0 && (content.aluminumG || 0) > 0) {
                        setTimeout(() => {
                          triggerExplosion('sodium');
                          setThermiteLevel(100);
                          setContent(prev => ({ ...prev, precipitateG: Math.min(40, prev.precipitateG + 16) }));
                          setCurrentTempC(99.5);
                          setActiveChemicalEquation('Fe₂O₃(s) + 2Al(s) --(2500°C)--> 2Fe(l, Molten Iron) + Al₂O₃(s) + 851.5 kJ');
                          setLastActionMessage(t('🔥🌋 اشتعال الثرميت الأسطوري (2500°C)! أشعلت حرارة الموقد تفاعل الألومنيوم مع أكسيد الحديديك فانصهر الحديد بوهج أبيض وبرتقالي ساطع!', '🔥🌋 2500°C Thermite Ignition! Burner heat triggered the aluminothermic reduction of Fe₂O₃ into glowing molten iron!'));
                        }, 200);
                        return;
                      }
                      if ((content.ammoniumDichromateG || 0) > 0) {
                        setTimeout(() => {
                          triggerExplosion('magnesium');
                          setDichromateVolcanoLevel(100);
                          setContent(prev => ({ ...prev, precipitateG: Math.min(40, prev.precipitateG + 14) }));
                          setCurrentTempC(98.0);
                          setActiveChemicalEquation('(NH₄)₂Cr₂O₇(s) --(Δ)--> Cr₂O₃(s, Volcanic Green Cone) + N₂↑ + 4H₂O(g)');
                          setLastActionMessage(t('🌋 ثوران بركان ثنائي كرومات الأمونيوم الشهير! تفككت البلورات البرتقالية بالحرارة مطلقةً شرارات بركانية ومخروطاً من رماد Cr₂O₃ الأخضر!', '🌋 Chemical Volcano Erupted! Ammonium dichromate thermally decomposed with fiery sparks into a green Cr₂O₃ volcanic cone!'));
                        }, 200);
                        return;
                      }
                      if (content.magnesiumG > 0) {
                        setTimeout(() => {
                          triggerExplosion('magnesium');
                          setContent(prev => ({
                            ...prev,
                            magnesiumG: 0,
                            precipitateG: Math.min(35, prev.precipitateG + 4.0)
                          }));
                          setCurrentTempC(prevT => Math.min(99, prevT + 36));
                          setLastActionMessage(t('🔥 وميض أبيض ناصع باهر! أشعل موقد بنزن شريط المغنيسيوم بالوهج الشمسي الأبيض الناصع!', '🔥 Blinding white flare! Bunsen burner ignited magnesium ribbon into radiant sparks and white MgO ash!'));
                        }, 200);
                        return;
                      }
                      if (content.ethanolMl > 0 && !isEthanolBurning) {
                        setTimeout(() => {
                          triggerExplosion('ethanol_fire');
                          setIsEthanolBurning(true);
                          setCurrentTempC(prevT => Math.min(99, prevT + 25));
                          setLastActionMessage(t('🔥 اشتعل الإيثانول بفعل حرارة الموقد بلهب أزرق وأصفر مستمر!', '🔥 Burner ignited ethanol into a steady blue-orange alcohol combustion flame!'));
                        }, 200);
                        return;
                      }
                    } else {
                      playSoundEffect('click');
                    }
                    setLastActionMessage(t(`تم ضبط الموقد على: ${next === 'off' ? 'مغلق' : next}`, `Burner set to: ${next}`));
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    burnerPower !== 'off'
                      ? 'bg-orange-600 border-orange-400 text-white shadow-md shadow-orange-500/30'
                      : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${burnerPower !== 'off' ? 'animate-bounce' : ''}`} />
                  <span>{burnerPower === 'off' ? t('تشغيل الموقد', 'Burner Off') : `${burnerPower.toUpperCase()} 🔥`}</span>
                </button>
              </div>

              {/* Electric Spark / Combustion Igniter */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold block">{t('قادح الإشعال:', 'Spark Igniter:')}</span>
                <button
                  onClick={handleIgniteSpark}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    content.hydrogenGasMl > 0 || content.magnesiumG > 0
                      ? 'bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-500/30 animate-pulse'
                      : isDark ? 'bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-900' : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  }`}
                  title={t('إطلاق شرارة كهربائية لاختبار الاشتعال وتفجير الغازات', 'Strike spark to ignite combustible gas or magnesium')}
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span>{t('شرارة إشعال ⚡', 'Spark ⚡')}</span>
                </button>
              </div>

              {/* Glass Stirring Rod */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold block">{t('عصا التحريك الزجاجية:', 'Stirring Rod:')}</span>
                <button
                  onClick={handleStir}
                  disabled={isStirring || totalVolumeMl <= 0}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isStirring
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-md shadow-cyan-500/30 animate-pulse'
                      : isDark ? 'bg-slate-950 border-slate-800 text-cyan-300 hover:bg-slate-900' : 'bg-slate-100 border-slate-200 text-cyan-800 hover:bg-slate-200'
                  }`}
                  title={t('تحريك وخلط المحلول بالعصا الزجاجية بحركة دائرية لتسريع التفاعل والذوبان (يمكنك أيضاً السحب بالماوس مباشرة داخل الكأس)', 'Stir solution in circular motion with glass rod (you can also drag directly in beaker)')}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isStirring ? 'animate-spin' : ''}`} />
                  <span>{isStirring ? t('جاري الخلط بالعصا...', 'Stirring with Rod...') : t('خلط بالعصا الزجاجية', 'Stir with Rod')}</span>
                </button>
              </div>

              {/* Electrical Conductivity Tester */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold block">{t('التوصيل الكهربائي:', 'Conductivity Probe:')}</span>
                <button
                  onClick={() => {
                    playSoundEffect(!isConductivityActive ? 'spark' : 'click');
                    setIsConductivityActive(!isConductivityActive);
                    setLastActionMessage(
                      !isConductivityActive
                        ? t('تم غمس مسبار التوصيل الكهربائي في المحلول لمعاينة توهج المصباح وتفكك الأيونات.', 'Immersed conductivity probe to evaluate electrolyte ion dissociation.')
                        : t('تم رفع مسبار التوصيل الكهربائي.', 'Removed conductivity probe.')
                    );
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isConductivityActive
                      ? 'bg-yellow-600 border-yellow-400 text-white shadow-md shadow-yellow-500/30'
                      : isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${isConductivityActive && conductivityGlow > 0 ? 'text-yellow-300 animate-pulse' : ''}`} />
                  <span>{isConductivityActive ? t('المسبار نشط ⚡', 'Probe Active ⚡') : t('فحص التوصيل', 'Test Conductivity')}</span>
                </button>
              </div>

              {/* Flame Emission Test Wire Loop */}
              <div className="flex flex-col gap-1 relative">
                <span className="text-[10px] text-slate-400 font-bold block">{t('اختبار اللهب الطيفي:', 'Flame Test Loop:')}</span>
                <button
                  onClick={() => setIsFlameTestSelectorOpen(!isFlameTestSelectorOpen)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    flameTestMetal !== 'none'
                      ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                      : isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-purple-300" />
                  <span>{flameTestMetal !== 'none' ? `${flameTestMetal}` : t('سلك البلاتين', 'Flame Loop')}</span>
                </button>

                {isFlameTestSelectorOpen && (
                  <div className="absolute bottom-full mb-2 left-0 w-64 bg-slate-900 border border-slate-700 rounded-xl p-2.5 shadow-2xl z-30 space-y-1.5 text-xs">
                    <span className="font-bold text-[11px] text-slate-300 block pb-1 border-b border-slate-800">
                      {t('اختر فلزاً لغمسه في سلك البلاتين وتقريبه من اللهب:', 'Pick metal salt to test emission color:')}
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-bold">
                      {[
                        { id: 'copper', label: 'نحاس (أخضر زمردي)', en: 'Copper (Green)', color: '#10b981' },
                        { id: 'sodium', label: 'صوديوم (أصفر ذهبي)', en: 'Sodium (Yellow)', color: '#f59e0b' },
                        { id: 'potassium', label: 'بوتاسيوم (بنفسجي)', en: 'Potassium (Lilac)', color: '#a855f7' },
                        { id: 'calcium', label: 'كالسيوم (برتقالي)', en: 'Calcium (Brick Red)', color: '#ea580c' },
                        { id: 'strontium', label: 'سترونشيوم (قرمزي)', en: 'Strontium (Crimson)', color: '#e11d48' },
                        { id: 'barium', label: 'باريوم (أخضر تفاحي)', en: 'Barium (Apple Green)', color: '#84cc16' }
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            playSoundEffect('burner_on');
                            setFlameTestMetal(m.id);
                            if (burnerPower === 'off') setBurnerPower('med');
                            setIsFlameTestSelectorOpen(false);
                            setLastActionMessage(t(`تم غمس سلك البلاتين في ${m.label}. لاحظ تغير لون اللهب الطيفي!`, `Dipped wire in ${m.en}. Observe spectral emission flame!`));
                          }}
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-600 flex items-center gap-1.5 transition-all text-right"
                          style={{ color: m.color }}
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                          <span className="truncate">{lang === 'ar' ? m.label : m.en}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setFlameTestMetal('none');
                        setIsFlameTestSelectorOpen(false);
                      }}
                      className="w-full py-1 text-center text-slate-400 hover:text-white text-[10px] bg-slate-800 rounded mt-1 font-bold"
                    >
                      {t('تنظيف سلك البلاتين (إيقاف)', 'Clean Loop (Off)')}
                    </button>
                  </div>
                )}
              </div>

              {/* Litmus Paper Test Strip */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold block">{t('شريط كاشف تباع الشمس:', 'Litmus Strip:')}</span>
                <button
                  onClick={() => {
                    playSoundEffect('drop');
                    setLitmusStripDipped(!litmusStripDipped);
                    setLastActionMessage(t('تم غمس شريط كاشف تباع الشمس لمعاينة تغير اللون الكيميائي.', 'Dipped litmus strip to observe color change.'));
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    litmusStripDipped
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{litmusStripDipped ? t('إخراج الشريط', 'Remove Strip') : t('غمس شريط pH', 'Dip Litmus')}</span>
                </button>
              </div>

              {/* Precision Balance Tare */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold block">{t('الميزان الرقمي:', 'Electronic Scale:')}</span>
                <button
                  onClick={() => {
                    playSoundEffect('click');
                    setBalanceTare(rawMassG);
                    setLastActionMessage(t('تم تصفير الميزان الرقمي (Tare) لقياس المادة المضافة بدقة.', 'Scale tared to zero to measure added substances precisely.'));
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    balanceTare > 0
                      ? 'bg-amber-600 text-white'
                      : isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>⚖️</span>
                  <span>{t('تصفير (Tare)', 'Tare Scale')}</span>
                </button>
              </div>

              {/* Gas Balloon Attachment & Inflation Control */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold block">{t('بالون الغاز (الانتفاخ):', 'Gas Balloon:')}</span>
                <button
                  onClick={() => {
                    playSoundEffect('inflate');
                    if (!isBalloonAttached) {
                      setIsBalloonAttached(true);
                      if (content.hydrogenGasMl > 0 || effervescenceBubbles > 0) {
                        triggerGradualBalloonInflation(65, balloonColor);
                      } else {
                        balloonTargetRef.current = 0;
                        setBalloonInflation(0);
                      }
                      setLastActionMessage(t('🎈 تم تركيب بالون الغاز المطاطي ليغطي فوهة الكأس بالكامل! أضف الخارصين مع حمض قوي أو الكربونات لمشاهدة انتفاخه تدريجياً!', '🎈 Attached rubber gas balloon covering the entire beaker rim! Add Zinc + Strong Acid to watch it inflate gradually!'));
                    } else {
                      setIsBalloonAttached(false);
                      balloonTargetRef.current = 0;
                      setBalloonInflation(0);
                      setLastActionMessage(t('تمت إزالة بالون الغاز وتفريغه.', 'Removed and deflated gas balloon.'));
                    }
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isBalloonAttached || balloonInflation > 0
                      ? 'bg-pink-600 border-pink-400 text-white shadow-md shadow-pink-500/30'
                      : isDark ? 'bg-slate-950 border-slate-800 text-pink-300 hover:bg-slate-900' : 'bg-pink-50 border-pink-200 text-pink-800'
                  }`}
                >
                  <span>🎈</span>
                  <span>
                    {isBalloonAttached || balloonInflation > 0
                      ? `${t('منتفخ', 'Inflated')} (${balloonInflation.toFixed(0)}%)`
                      : t('تركيب البالون', 'Attach Balloon')}
                  </span>
                </button>
              </div>

              {/* Instant Crystallization Nucleation Tool */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold block">{t('تحفيز التبلور:', 'Crystallization:')}</span>
                <button
                  onClick={handleTriggerCrystallization}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    crystalType !== 'none' && crystalLevel > 0
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-md shadow-cyan-500/30'
                      : isDark ? 'bg-slate-950 border-slate-800 text-cyan-300 hover:bg-slate-900' : 'bg-cyan-50 border-cyan-200 text-cyan-800'
                  }`}
                >
                  <span>💎</span>
                  <span>
                    {crystalType !== 'none' && crystalLevel > 0
                      ? `${t('تبلور نشط', 'Crystals')} (${crystalLevel.toFixed(0)}%)`
                      : t('تبلور المحلول 💎', 'Crystallize 💎')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

          {/* Right Column: Precision Instruments (pH Meter, Thermometer, Balance) */}
          <div className="w-full xl:w-[300px] shrink-0 min-w-0 grid grid-cols-1 sm:grid-cols-3 xl:flex xl:flex-col gap-4">
          {/* Digital pH Meter Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className={`font-bold text-base flex items-center gap-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>{t('مقياس الحموضة الرقمي (pH)', 'Digital pH Meter')}</span>
              </h3>
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            <div className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] text-slate-400 font-semibold block">{t('قيمة الأس الهيدروجيني', 'pH Value')}</span>
              <span className="text-3xl font-mono font-black text-cyan-400 my-0.5">
                {currentPh.toFixed(1)}
              </span>

              {/* pH Color Scale Spectrum (Always Left-to-Right: 0 acidic to 14 alkaline) */}
              <div className="w-full mt-2" dir="ltr">
                <div className="w-full h-2.5 rounded-full overflow-hidden bg-gradient-to-r from-red-500 via-green-500 to-purple-600 relative">
                  {/* Pointer marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_6px_#ffffff]"
                    style={{ left: `${Math.min(98, Math.max(2, (currentPh / 14) * 100))}%` }}
                  />
                </div>

                <div className="flex justify-between w-full text-[9px] font-mono mt-1 select-none">
                  <span className="text-red-400 font-bold">0 ({t('حمضي', 'Acidic')})</span>
                  <span className="text-green-400 font-bold">7 ({t('متعادل', 'Neutral')})</span>
                  <span className="text-purple-400 font-bold">14 ({t('قلوي', 'Alkaline')})</span>
                </div>
              </div>

              <span className={`block text-xs font-bold mt-2 px-2 py-0.5 rounded border ${
                currentPh < 6.5
                  ? 'bg-red-950/60 border-red-500/40 text-red-300'
                  : currentPh > 7.5
                  ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                  : 'bg-green-950/60 border-green-500/40 text-green-300'
              }`}>
                {currentPh < 3
                  ? t('حمضي قوي جداً', 'Strong Acid')
                  : currentPh < 6.5
                  ? t('حمضي ضعيف', 'Weak Acid')
                  : currentPh <= 7.5
                  ? t('متعادل كيميائياً', 'Chemically Neutral')
                  : currentPh < 11
                  ? t('قلوي / قاعدي', 'Alkaline Base')
                  : t('قلوي قوي جداً', 'Strong Alkali')}
              </span>
            </div>
          </div>

          {/* Immersion Thermometer Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className={`font-bold text-base flex items-center gap-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span>{t('ميزان الحرارة الغاطس', 'Digital Thermometer')}</span>
              </h3>
              <span className="text-xs font-mono text-orange-400 font-bold">
                {currentTempC.toFixed(1)} °C
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">{t('حرارة السائل الفعلية', 'Liquid Temperature')}</span>
                <span className="text-2xl font-mono font-black text-orange-400 block mt-0.5">
                  {currentTempC.toFixed(1)} °C
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({(currentTempC + 273.15).toFixed(1)} K)
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-950/40 border border-orange-500/40 flex items-center justify-center text-2xl">
                {currentTempC >= 95 ? '💨' : currentTempC > 40 ? '🔥' : currentTempC < 10 ? '❄️' : '🌡️'}
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>{t('حالة الغليان / التبخر:', 'Boiling / Vapor Status:')}</span>
              <span className={`font-bold ${currentTempC >= 99 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                {currentTempC >= 99 ? t('غليان كامل (100°C)', 'Boiling at 100°C') : currentTempC > 60 ? t('حار جداً', 'Very Hot') : t('سائل مستقر', 'Stable Fluid')}
              </span>
            </div>
          </div>

          {/* Precision Electronic Balance Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className={`font-bold text-base flex items-center gap-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <span>⚖️</span>
                <span>{t('الميزان الحساس (الكتلة)', 'Precision Balance')}</span>
              </h3>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {displayedWeightG.toFixed(2)} g
              </span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between font-mono ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">{t('الكتلة المعروضة', 'Net Weight')}</span>
                <span className="text-2xl font-black text-amber-400">
                  {displayedWeightG.toFixed(2)} <span className="text-xs">g</span>
                </span>
              </div>
              <button
                onClick={() => setBalanceTare(rawMassG)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all"
              >
                {t('تصفير Tare', 'Tare')}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
