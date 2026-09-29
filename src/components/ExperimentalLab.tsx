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
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';

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
    descAr: 'جسيمات معدنية داكنة غير قابلة للذوبان، تستقر في قاع الكأس كمادة راسبة.',
    descEn: 'Insoluble dark metal filings settling at the beaker bottom as sediment.'
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
}

export const ExperimentalLab: React.FC = () => {
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';

  // Mode: Guided Missions vs Open Sandbox
  const [labMode, setLabMode] = useState<'open_sandbox' | 'guided'>('open_sandbox');

  // Interactive Tools Toggles & States
  const [burnerPower, setBurnerPower] = useState<'off' | 'low' | 'med' | 'high'>('off');
  const [isStirring, setIsStirring] = useState<boolean>(false);
  const [isThermometerActive, setIsThermometerActive] = useState<boolean>(true);
  const [isPhMeterActive, setIsPhMeterActive] = useState<boolean>(true);
  const [litmusStripDipped, setLitmusStripDipped] = useState<boolean>(false);
  const [dropperAmount, setDropperAmount] = useState<number>(5); // 1 drop, 5 drops, 15 ml
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
    precipitateG: 0
  });

  // Physical State of the Liquid in Beaker
  const [currentTempC, setCurrentTempC] = useState<number>(23.5); // Room temp
  const [effervescenceBubbles, setEffervescenceBubbles] = useState<number>(0);
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

  // Total Volume calculation (ml)
  const totalVolumeMl = Math.min(
    250,
    content.waterMl + content.acidMl + content.baseMl + content.copperSulfateMl + content.iceCount * 8
  );

  // Total Mass calculation (grams): Beaker empty weight ~85g
  const emptyBeakerWeight = 85.0;
  const rawMassG =
    emptyBeakerWeight +
    totalVolumeMl * 1.0 +
    content.bakingSodaG +
    content.calciumChlorideG +
    content.ironG +
    content.precipitateG;
  const displayedWeightG = Math.max(0, rawMassG - balanceTare);

  // Chemical Calculation: Net Acid/Base moles and pH
  const netMolesAcid = Math.max(0, content.acidMl * 0.1 - content.baseMl * 0.1 - content.bakingSodaG * 0.012);
  const netMolesBase = Math.max(0, content.baseMl * 0.1 - content.acidMl * 0.1);
  const volLiters = Math.max(0.01, totalVolumeMl / 1000);

  let currentPh = 7.0;
  if (totalVolumeMl <= 0) {
    currentPh = 7.0;
  } else if (netMolesAcid > 0.0001) {
    const hConc = netMolesAcid / volLiters;
    currentPh = Math.max(1.0, Math.min(6.8, -Math.log10(Math.max(0.000001, hConc))));
  } else if (netMolesBase > 0.0001) {
    const ohConc = netMolesBase / volLiters;
    const pOH = -Math.log10(Math.max(0.000001, ohConc));
    currentPh = Math.max(7.2, Math.min(13.8, 14.0 - pOH));
  } else if (content.bakingSodaG > 0) {
    currentPh = 8.3; // buffered mildly basic
  } else if (content.copperSulfateMl > 0) {
    currentPh = 5.2; // mildly acidic
  }

  // Determine Appearance / Fluid Color in Beaker
  const getFluidColor = () => {
    if (totalVolumeMl <= 0) return 'transparent';

    // 1. Phenolphthalein indicator effect: Turns bright magenta-pink if pH > 8.2
    if (content.phenolphthaleinDrops > 0 && currentPh >= 8.2) {
      const pinkOpacity = Math.min(0.9, 0.4 + (currentPh - 8.2) * 0.2);
      return `rgba(236, 72, 153, ${pinkOpacity})`;
    }

    // 2. Universal indicator spectrum:
    if (content.universalDrops > 0) {
      if (currentPh < 3) return 'rgba(239, 68, 68, 0.75)'; // Red
      if (currentPh < 5) return 'rgba(249, 115, 22, 0.75)'; // Orange
      if (currentPh < 6.5) return 'rgba(234, 179, 8, 0.75)'; // Yellow
      if (currentPh <= 7.5) return 'rgba(34, 197, 94, 0.75)'; // Green (Neutral)
      if (currentPh < 9) return 'rgba(6, 182, 212, 0.75)'; // Cyan
      if (currentPh < 11) return 'rgba(59, 130, 246, 0.75)'; // Blue
      return 'rgba(168, 85, 247, 0.85)'; // Violet/Purple
    }

    // 3. Copper Sulfate (CuSO4):
    if (content.copperSulfateMl > 0) {
      if (content.precipitateG > 0) {
        // Milky sky-blue suspension
        return 'rgba(125, 211, 252, 0.85)';
      }
      return 'rgba(37, 99, 235, 0.7)'; // Royal Blue
    }

    // 4. Default clear fluid with slight aqua refraction
    return theme === 'dark' ? 'rgba(56, 189, 248, 0.28)' : 'rgba(186, 230, 253, 0.55)';
  };

  // Add reagent to beaker
  const handleAddReagent = (reagentId: string) => {
    const amount = dropperAmount;

    setContent(prev => {
      const next = { ...prev };

      if (reagentId === 'water') {
        next.waterMl = Math.min(220, next.waterMl + (amount <= 5 ? 20 : 50));
        setLastActionMessage(t(`تمت إضافة ${amount <= 5 ? 20 : 50} مل من الماء المقطر.`, `Added ${amount <= 5 ? 20 : 50} mL of distilled water.`));
      } else if (reagentId === 'acid_hcl') {
        next.acidMl = Math.min(80, next.acidMl + amount);
        // If baking soda is present, trigger vigorous effervescence!
        if (next.bakingSodaG > 0.5) {
          setEffervescenceBubbles(prevB => Math.min(45, prevB + 25));
          next.bakingSodaG = Math.max(0, next.bakingSodaG - amount * 0.2);
          setLastActionMessage(t('تفاعل فوران نشط! تفاعل الحمض مع الكربونات وأطلق غاز CO₂ بأمان.', 'Vigorous effervescence! Acid reacted with carbonate releasing CO₂ gas safely.'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${amount} مل من حمض الهيدروكلوريك HCl. انخفضت قيمة pH.`, `Added ${amount} mL dilute HCl. pH decreased.`));
        }
      } else if (reagentId === 'base_naoh') {
        next.baseMl = Math.min(80, next.baseMl + amount);
        // If copper sulfate is present, form copper hydroxide precipitate!
        if (next.copperSulfateMl > 0) {
          next.precipitateG = Math.min(25, next.precipitateG + 3.5);
          setLastActionMessage(t('تفاعل ترسيب! تكوّن راسب أزرق سماوي هلامي من هيدروكسيد النحاس Cu(OH)₂.', 'Precipitation reaction! Sky-blue gelatinous Cu(OH)₂ precipitate formed.'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${amount} مل من هيدروكسيد الصوديوم NaOH. ارتفعت قيمة pH.`, `Added ${amount} mL dilute NaOH. pH increased.`));
        }
      } else if (reagentId === 'copper_sulfate') {
        next.copperSulfateMl = Math.min(80, next.copperSulfateMl + amount);
        setLastActionMessage(t(`تمت إضافة ${amount} مل من كبريتات النحاس الزرقاء CuSO₄.`, `Added ${amount} mL of royal blue CuSO₄ solution.`));
      } else if (reagentId === 'baking_soda') {
        next.bakingSodaG = Math.min(30, next.bakingSodaG + (amount <= 5 ? 3 : 8));
        // If acid present, trigger fizz!
        if (next.acidMl > 0) {
          setEffervescenceBubbles(prevB => Math.min(45, prevB + 30));
          setLastActionMessage(t('فوران فوري وتصاعد فقاعات غاز ثاني أكسيد الكربون (CO₂)!', 'Instant effervescence and CO₂ bubbles streaming upward!'));
        } else {
          setLastActionMessage(t(`تمت إضافة مسحوق بيكربونات الصوديوم إلى الكأس.`, `Added baking soda powder into the beaker.`));
        }
      } else if (reagentId === 'calcium_chloride') {
        next.calciumChlorideG = Math.min(40, next.calciumChlorideG + (amount <= 5 ? 4 : 10));
        // Strongly exothermic dissolution!
        setCurrentTempC(prevT => Math.min(85, prevT + (amount <= 5 ? 12 : 24)));
        setLastActionMessage(t('ذوبان ناشر للحرارة (Exothermic)! ارتفعت درجة حرارة المحلول بسرعة.', 'Exothermic dissolution! Solution temperature surged rapidly.'));
      } else if (reagentId === 'phenolphthalein') {
        next.phenolphthaleinDrops += (amount <= 5 ? 3 : 8);
        setLastActionMessage(t('أُضيفت قطرات كاشف الفينولفثالين. سيتحول للوردي إذا كان الوسط قلوياً (pH > 8.2).', 'Added phenolphthalein indicator drops. Will turn pink in alkaline pH > 8.2.'));
      } else if (reagentId === 'universal_indicator') {
        next.universalDrops += (amount <= 5 ? 3 : 8);
        setLastActionMessage(t('أُضيف كاشف الحموضة الشامل. تلوّن المحلول وفق مقياس pH اللوني.', 'Added universal indicator. Liquid colored to match pH spectrum.'));
      } else if (reagentId === 'ice_cubes') {
        next.iceCount = Math.min(8, next.iceCount + 2);
        setCurrentTempC(prevT => Math.max(1.0, prevT - 7.5));
        setLastActionMessage(t('أُضيفت مكعبات ثلج. انخفضت درجة حرارة الكأس نحو الصفر المئوي.', 'Added ice cubes. Beaker temperature dropped towards 0 °C.'));
      } else if (reagentId === 'iron_filings') {
        next.ironG = Math.min(30, next.ironG + 5);
        setLastActionMessage(t('أُضيفت برادة حديد داكنة استقرت في قاع الكأس كمادة راسبة.', 'Added iron filings settling at the bottom as insoluble sediment.'));
      }

      return next;
    });
  };

  // Stir the mixture with the glass rod
  const handleStir = () => {
    setIsStirring(true);
    setLastActionMessage(t('جاري تحريك ومزج المحلول بساق التحريك الزجاجية لتسريع التجانس والذوبان...', 'Stirring solution with glass rod to accelerate homogenization...'));
    setTimeout(() => {
      setIsStirring(false);
      // Dissolve solids partially
      setContent(prev => ({
        ...prev,
        calciumChlorideG: Math.max(0, prev.calciumChlorideG - 2)
      }));
    }, 1400);
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
      precipitateG: 0
    });
    setBurnerPower('off');
    setCurrentTempC(23.5);
    setEffervescenceBubbles(0);
    setLitmusStripDipped(false);
    setMissionComplete(false);
    setLastActionMessage(t('تم تفريغ الكأس وغسيله بماء مقطر نقي. الكأس نظيف وجاهز لتجربة جديدة.', 'Beaker emptied and flushed with pure distilled water. Ready for fresh experiment.'));
  };

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

      // 2. Effervescence decay
      setEffervescenceBubbles(prev => Math.max(0, prev - 1));

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
  }, [burnerPower, totalVolumeMl, content.iceCount, currentTempC]);

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Beaker Geometry: Centered on bench
      const beakerW = 160;
      const beakerH = 220;
      const beakerX = (w - beakerW) / 2;
      const beakerY = 70;
      const beakerBottomY = beakerY + beakerH;

      // 1. BENCHTOP & STAND
      ctx.fillStyle = theme === 'dark' ? '#0f172a' : '#e2e8f0';
      ctx.fillRect(0, beakerBottomY + 45, w, h - (beakerBottomY + 45));

      ctx.strokeStyle = theme === 'dark' ? '#334155' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, beakerBottomY + 45);
      ctx.lineTo(w, beakerBottomY + 45);
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
      ctx.lineTo(beakerX - 30, beakerBottomY + 45);
      ctx.moveTo(beakerX + beakerW + 10, beakerBottomY + 2);
      ctx.lineTo(beakerX + beakerW + 30, beakerBottomY + 45);
      ctx.stroke();

      // 2. BUNSEN BURNER FLAME
      const burnerX = w / 2;
      const burnerY = beakerBottomY + 45;

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
      // (a) Thermometer Probe
      if (isThermometerActive) {
        const probeX = beakerX + beakerW - 28;
        ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
        ctx.fillRect(probeX - 2, 20, 4, beakerBottomY - 35);

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
        ctx.fillRect(phX - 3, 25, 6, beakerBottomY - 45);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(phX, beakerBottomY - 40, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // (c) Glass Stirring Rod
      if (isStirring) {
        ctx.save();
        ctx.translate(w / 2, beakerY + 60);
        ctx.rotate(Math.sin(Date.now() * 0.015) * 0.15);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(-3, -70, 6, beakerH - 20);
        ctx.restore();
      }

      // (d) Dipped Litmus Paper Strip
      if (litmusStripDipped) {
        const stripX = beakerX + beakerW / 2 + 15;
        // Dry top part
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(stripX, 35, 8, liquidSurfaceY - 35);
        // Wet dipped part colored according to pH
        ctx.fillStyle = currentPh < 6 ? '#ef4444' : currentPh > 8 ? '#3b82f6' : '#22c55e';
        ctx.fillRect(stripX, liquidSurfaceY, 8, beakerBottomY - liquidSurfaceY - 30);
      }

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
    effervescenceBubbles,
    theme
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
          isDark ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
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

          <p className="text-xs text-indigo-300 leading-relaxed font-medium">
            <span className="font-bold text-slate-400">{t('المهمة المطلوبة:', 'Required Task:')} </span>
            {t(currentMission.goalAr, currentMission.goalEn)}
          </p>

          {/* Quick Mission Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {GUIDED_MISSIONS.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setGuidedMissionId(m.id);
                  setMissionComplete(false);
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all whitespace-nowrap ${
                  guidedMissionId === m.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {t(m.titleAr.split(' ')[1] || m.titleAr, m.titleEn.split(' ')[1] || m.titleEn)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN WORKBENCH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Reagents & Safe Chemical Shelf (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <Droplet className="w-4 h-4 text-cyan-400" />
                <span>{t('رف المحاليل والمواد الكيميائية', 'Reagents & Chemical Shelf')}</span>
              </h3>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">10 {t('مواد آمنة', 'Safe Items')}</span>
            </div>

            {/* Dropper / Pipette Dosage Control */}
            <div className={`p-3 rounded-xl border space-y-1.5 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>{t('عيار القطارة / الإضافة:', 'Pipette / Addition Dose:')}</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {dropperAmount === 1 ? t('قطرة واحدة (0.5 مل)', '1 Drop (0.5 mL)') : dropperAmount === 5 ? t('5 قطرات (2.5 مل)', '5 Drops (2.5 mL)') : t('صب مباشر (15 مل)', 'Pour (15 mL)')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 5, 15].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setDropperAmount(amt)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                      dropperAmount === amt
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {amt === 1 ? t('1 قطرة', '1 Drop') : amt === 5 ? t('5 قطرات', '5 Drops') : t('15 مل صب', '15 mL')}
                  </button>
                ))}
              </div>
            </div>

            {/* Chemical Reagents Shelf Buttons */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {REAGENTS.map(r => (
                <div
                  key={r.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                    isDark ? 'bg-slate-950/50 border-slate-800 hover:border-cyan-600/40' : 'bg-slate-50 border-slate-200 hover:border-cyan-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
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
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {t(r.nameAr, r.nameEn)}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold">({r.formula})</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                        {t(r.descAr, r.descEn)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddReagent(r.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('إضافة', 'Add')}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Interactive Beaker Workbench & Real-time Canvas (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4 items-center">
          <div className={`w-full p-4 rounded-2xl border shadow-lg flex flex-col items-center relative ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {/* Top Workbench Status Bar */}
            <div className="w-full flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 font-mono font-bold">
                <span className="text-slate-400">{t('الحجم:', 'Volume:')}</span>
                <span className="text-cyan-400">{totalVolumeMl.toFixed(0)} / 250 mL</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCleanBeaker}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
                  title={t('تفريغ الكأس وغسيله بماء مقطر', 'Flush and clean beaker with pure water')}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('غسيل الكأس', 'Flush Beaker')}</span>
                </button>
              </div>
            </div>

            {/* Central Interactive Laboratory Stage (Canvas) */}
            <div className="relative w-full aspect-[4/3] max-w-[460px] bg-slate-950 border-2 border-slate-700/60 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={460}
                height={345}
                className="w-full h-full relative z-10"
              />

              {/* Action notification floating over beaker */}
              <div className="absolute top-2 left-2 right-2 z-20 pointer-events-none">
                <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-xl p-2 text-center text-xs font-semibold text-slate-300 shadow-md">
                  {lastActionMessage}
                </div>
              </div>
            </div>

            {/* Tools Rack Controls under Beaker */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {/* Bunsen Burner Power Toggle */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold block">{t('موقد بنزن:', 'Bunsen Burner:')}</span>
                <button
                  onClick={() => {
                    const next = burnerPower === 'off' ? 'med' : burnerPower === 'med' ? 'high' : burnerPower === 'high' ? 'low' : 'off';
                    setBurnerPower(next);
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

              {/* Glass Stirring Rod */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold block">{t('ساق زجاجية:', 'Stirring Rod:')}</span>
                <button
                  onClick={handleStir}
                  disabled={isStirring || totalVolumeMl <= 0}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isStirring
                      ? 'bg-cyan-600 text-white shadow-md'
                      : isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isStirring ? 'animate-spin' : ''}`} />
                  <span>{isStirring ? t('تحريك...', 'Stirring...') : t('تحريك الكأس', 'Stir Beaker')}</span>
                </button>
              </div>

              {/* Litmus Paper Test Strip */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-bold block">{t('شريط كاشف تباع الشمس:', 'Litmus Strip:')}</span>
                <button
                  onClick={() => {
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
            </div>
          </div>
        </div>

        {/* Right Column: Precision Instruments (pH Meter, Thermometer, Balance) (Span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
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
  );
};
