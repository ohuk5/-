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
}

export const ExperimentalLab: React.FC = () => {
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';

  // Mode: Guided Missions vs Open Sandbox
  const [labMode, setLabMode] = useState<'open_sandbox' | 'guided'>('open_sandbox');

  // Viewport Dimension Mode: 3D Virtual Lab vs 2D Canvas
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

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
    bariumG: 0
  });

  // Physical State of the Liquid in Beaker
  const [currentTempC, setCurrentTempC] = useState<number>(23.5); // Room temp
  const [effervescenceBubbles, setEffervescenceBubbles] = useState<number>(0);
  const [dispenseAnimCounter, setDispenseAnimCounter] = useState<number>(0);
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
      content.baseMl +
      content.copperSulfateMl +
      content.peroxideMl +
      content.silverNitrateMl +
      content.ammoniaMl +
      content.ethanolMl +
      (content.aceticAcidMl || 0) +
      content.iceCount * 8
  );

  // Total Mass calculation (grams): Beaker empty weight ~85g
  const emptyBeakerWeight = 85.0;
  const rawMassG =
    emptyBeakerWeight +
    totalVolumeMl * 1.0 +
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
    content.ethanolMl * 0.79;
  const displayedWeightG = Math.max(0, rawMassG - balanceTare);

  // Electrical Conductivity Evaluation (Electrolyte Ion Dissociation)
  const conductivityGlow = React.useMemo(() => {
    if (!isConductivityActive) return 0;
    // Strong electrolytes
    const strongIons =
      content.acidMl +
      content.baseMl +
      content.copperSulfateMl +
      content.silverNitrateMl +
      content.calciumChlorideG +
      (content.bariumG || 0) +
      (content.strontiumG || 0);
    // Weak electrolytes
    const weakIons = (content.aceticAcidMl || 0) + content.bakingSodaG * 0.4 + content.ammoniaMl;

    if (strongIons > 0) {
      return Math.min(1.0, 0.45 + strongIons * 0.04);
    }
    if (weakIons > 0) {
      return Math.min(0.40, 0.15 + weakIons * 0.02);
    }
    return 0; // Pure water, ice, ethanol
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

  // Web Audio Synthetic Sound Engine (Client-side, Safe)
  const playSoundEffect = (type: 'explosion' | 'spark' | 'pour') => {
    if (isSoundMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (type === 'explosion') {
        const bufferSize = Math.floor(ctx.sampleRate * 0.45);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.44);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.55, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.44);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === 'spark') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'pour') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(820, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      // Audio playback blocked or unsupported
    }
  };

  const triggerExplosion = (
    type: 'sodium' | 'potassium' | 'magnesium' | 'hydrogen_pop' | 'spark' | 'catalytic_eruption' | 'ethanol_fire',
    customX?: number,
    customY?: number
  ) => {
    playSoundEffect(type === 'spark' ? 'spark' : 'explosion');
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
    const beakerBottomY = 70 + 220;
    const liquidH = Math.min(220 - 25, (totalVolumeMl / 250) * (220 - 35));
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

  // Chemical Calculation: Net Acid/Base moles and pH
  const netMolesAcid = Math.max(0, content.acidMl * 0.1 - content.baseMl * 0.1 - content.ammoniaMl * 0.06 - content.bakingSodaG * 0.012);
  const netMolesBase = Math.max(0, content.baseMl * 0.1 + content.ammoniaMl * 0.06 - content.acidMl * 0.1);
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

    // 0. Potassium Permanganate (Royal Deep Violet/Purple)
    if (content.permanganateG > 0) {
      return 'rgba(126, 34, 206, 0.90)';
    }

    // 0.1 Tetraamminecopper(II) Complex (Royal Deep Navy Blue)
    if (content.copperSulfateMl > 0 && content.ammoniaMl > 0) {
      return 'rgba(30, 58, 138, 0.92)';
    }

    // 0.2 Silver Chloride Precipitate (Dense Milky White Suspension)
    if (content.silverNitrateMl > 0 && (content.acidMl > 0 || content.calciumChlorideG > 0)) {
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

    // 3. Copper Sulfate (CuSO4):
    if (content.copperSulfateMl > 0) {
      if (content.precipitateG > 0) {
        // Milky sky-blue suspension
        return 'rgba(125, 211, 252, 0.88)';
      }
      return 'rgba(37, 99, 235, 0.85)'; // Royal Blue
    }

    // 4. Distinct chemical hues for clear reagents so user clearly sees liquid state changes:
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

    if (reg.type === 'liquid' || reg.type === 'indicator') {
      triggerPourAnimation(reg.defaultColor);
    } else {
      playSoundEffect('pour');
    }

    const amountMl = customAmount !== undefined && reg.type === 'liquid' ? customAmount : dispenseAmountMl;
    const drops = customAmount !== undefined && reg.type === 'indicator' ? customAmount : dispenseDrops;
    const grams = customAmount !== undefined && (reg.type === 'solid' || reg.type === 'powder') ? customAmount : dispenseGrams;

    setContent(prev => {
      const next = { ...prev };

      if (reagentId === 'water') {
        next.waterMl = Math.min(240, next.waterMl + amountMl);
        // Check if dry alkali metals are already present in the beaker!
        if (next.potassiumG > 0) {
          triggerExplosion('potassium');
          next.potassiumG = 0;
          next.baseMl = Math.min(100, next.baseMl + 25);
          next.hydrogenGasMl = Math.min(80, next.hydrogenGasMl + 30);
          setCurrentTempC(prevT => Math.min(99, prevT + 48));
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 50));
          setLastActionMessage(t(`💥 انفجار أرجواني مذهل! لامس الماء البوتاسيوم الجاف فانفجر بلهب بنفسجي ساطع وصدمة انفجارية عنيفة!`, `💥 Spectacular violet detonation! Water touched dry potassium, exploding with vivid lilac fire & shockwave!`));
        } else if (next.sodiumG > 0) {
          triggerExplosion('sodium');
          next.sodiumG = 0;
          next.baseMl = Math.min(100, next.baseMl + 20);
          next.hydrogenGasMl = Math.min(80, next.hydrogenGasMl + 25);
          setCurrentTempC(prevT => Math.min(99, prevT + 40));
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 45));
          setLastActionMessage(t(`💥 انفجار عنيف! لامس الماء الصوديوم فانفجر بلهب أصفر ساطع، وصدمة انفجارية وغاز هيدروجين!`, `💥 Violent explosion! Water touched sodium, detonating with brilliant yellow flame, shockwave, and H2 gas!`));
        } else {
          setLastActionMessage(t(`تمت إضافة ${amountMl} مل من الماء المقطر بدقة.`, `Added precisely ${amountMl} mL of distilled water.`));
        }
      } else if (reagentId === 'acid_hcl') {
        next.acidMl = Math.min(100, next.acidMl + amountMl);
        // If magnesium is present, rapid exothermic reaction with H2 gas!
        if (next.magnesiumG > 0) {
          next.hydrogenGasMl = Math.min(80, next.hydrogenGasMl + 30);
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 40));
          setCurrentTempC(prevT => Math.min(92, prevT + 22));
          next.magnesiumG = Math.max(0, next.magnesiumG - 2);
          setLastActionMessage(t(`تفاعل شريط المغنيسيوم مع الحمض بفوران عنيف وتصاعد كثيف لغاز الهيدروجين H₂ القابل للاشتعال!`, `Magnesium reacted vigorously with acid releasing abundant flammable H2 gas!`));
        } else if (next.bakingSodaG > 0.5) {
          setEffervescenceBubbles(prevB => Math.min(45, prevB + 25));
          next.bakingSodaG = Math.max(0, next.bakingSodaG - amountMl * 0.2);
          setLastActionMessage(t('تفاعل فوران نشط! تفاعل الحمض مع الكربونات وأطلق غاز CO₂ بأمان.', 'Vigorous effervescence! Acid reacted with carbonate releasing CO₂ gas safely.'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${amountMl} مل من حمض الهيدروكلوريك HCl. انخفضت قيمة pH.`, `Added precisely ${amountMl} mL dilute HCl. pH decreased.`));
        }
      } else if (reagentId === 'base_naoh') {
        next.baseMl = Math.min(100, next.baseMl + amountMl);
        if (next.copperSulfateMl > 0) {
          next.precipitateG = Math.min(35, next.precipitateG + 4.5);
          setLastActionMessage(t('تفاعل ترسيب! تكوّن راسب أزرق سماوي هلامي من هيدروكسيد النحاس Cu(OH)₂.', 'Precipitation reaction! Sky-blue gelatinous Cu(OH)₂ precipitate formed.'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${amountMl} مل من هيدروكسيد الصوديوم NaOH. ارتفعت قيمة pH.`, `Added precisely ${amountMl} mL dilute NaOH. pH increased.`));
        }
      } else if (reagentId === 'copper_sulfate') {
        next.copperSulfateMl = Math.min(100, next.copperSulfateMl + amountMl);
        setLastActionMessage(t(`تمت إضافة ${amountMl} مل من كبريتات النحاس الزرقاء CuSO₄.`, `Added precisely ${amountMl} mL of royal blue CuSO₄ solution.`));
      } else if (reagentId === 'baking_soda') {
        next.bakingSodaG = Math.min(40, next.bakingSodaG + grams);
        if (next.acidMl > 0) {
          setEffervescenceBubbles(prevB => Math.min(45, prevB + 30));
          setLastActionMessage(t('فوران فوري وتصاعد فقاعات غاز ثاني أكسيد الكربون (CO₂)!', 'Instant effervescence and CO₂ bubbles streaming upward!'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${grams} جم مسحوق بيكربونات الصوديوم إلى الكأس.`, `Added ${grams} g baking soda powder into the beaker.`));
        }
      } else if (reagentId === 'calcium_chloride') {
        next.calciumChlorideG = Math.min(40, next.calciumChlorideG + grams);
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
        setLastActionMessage(t('أُضيفت مكعبات ثلج. انخفضت درجة حرارة الكأس نحو الصفر المئوي.', 'Added ice cubes. Beaker temperature dropped towards 0 °C.'));
      } else if (reagentId === 'iron_filings') {
        next.ironG = Math.min(30, next.ironG + grams);
        if (next.peroxideMl > 0) {
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 30));
          setCurrentTempC(prevT => Math.min(88, prevT + 18));
          setLastActionMessage(t('تحفيز حديدي! قامت برادة الحديد بتفكيك H₂O₂ وتصاعدت فقاعات الأكسجين الساخن.', 'Iron catalysis! Iron filings rapidly catalyzed H₂O₂ into hot oxygen bubbles.'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم برادة حديد داكنة استقرت في قاع الكأس كمادة راسبة.`, `Added ${grams} g iron filings settling at the bottom as sediment.`));
        }
      } else if (reagentId === 'potassium_permanganate') {
        next.permanganateG = Math.min(25, next.permanganateG + grams);
        if (next.peroxideMl > 0) {
          triggerExplosion('catalytic_eruption');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 50));
          setCurrentTempC(prevT => Math.min(98, prevT + 38));
          setLastActionMessage(t('🔮 ثوران بركاني تحفيزي فائق! برمنغنات البوتاسيوم فككت ماء الأكسجين بعنف مع سحابة أكسجين ساخنة ورغوة بركانية أرجوانية!', '🔮 Dramatic catalytic eruption! KMnO₄ decomposed peroxide with hot oxygen smoke and surging purple foam!'));
        } else {
          setLastActionMessage(t(`أُضيفت ${grams} جم بلورات برمنغنات البوتاسيوم KMnO₄ وتلوّن المحلول بالأرجواني الملكي.`, `Added ${grams} g royal purple potassium permanganate crystals.`));
        }
      } else if (reagentId === 'hydrogen_peroxide') {
        next.peroxideMl = Math.min(100, next.peroxideMl + amountMl);
        if (next.permanganateG > 0) {
          triggerExplosion('catalytic_eruption');
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 50));
          setCurrentTempC(prevT => Math.min(98, prevT + 38));
          setLastActionMessage(t('🔮 ثوران بركاني تحفيزي فائق! برمنغنات البوتاسيوم فككت ماء الأكسجين بعنف مع سحابة أكسجين ساخنة ورغوة بركانية أرجوانية!', '🔮 Dramatic catalytic eruption! KMnO₄ decomposed peroxide with hot oxygen smoke and surging purple foam!'));
        } else if (next.ironG > 0) {
          setEffervescenceBubbles(prevB => Math.min(60, prevB + 35));
          setCurrentTempC(prevT => Math.min(92, prevT + 25));
          setLastActionMessage(t('تفاعل تفكك فوري لماء الأكسجين بفعل المحفز! فقاعات غاز الأكسجين النقي وارتفاع الحرارة.', 'Immediate catalytic peroxide breakdown! Pure O₂ gas foaming and heat surge.'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${amountMl} مل من فوق أكسيد الهيدروجين H₂O₂ (ماء الأكسجين).`, `Added ${amountMl} mL of hydrogen peroxide H₂O₂ solution.`));
        }
      } else if (reagentId === 'silver_nitrate') {
        next.silverNitrateMl = Math.min(100, next.silverNitrateMl + amountMl);
        if (next.acidMl > 0 || next.calciumChlorideG > 0) {
          next.precipitateG = Math.min(35, next.precipitateG + 4.5);
          setLastActionMessage(t('كشف إيجابي عن أيونات الكلوريد! تكوّن راسب كلوريد الفضة AgCl الأبيض الحليبي.', 'Positive chloride test! Dense milky white silver chloride AgCl precipitate formed.'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${amountMl} مل من نترات الفضة AgNO₃.`, `Added ${amountMl} mL of silver nitrate AgNO₃.`));
        }
      } else if (reagentId === 'ammonia_solution') {
        next.ammoniaMl = Math.min(100, next.ammoniaMl + amountMl);
        if (next.copperSulfateMl > 0) {
          setLastActionMessage(t('تكوّن معقد النحاس الرباعي الأميني الملكي [Cu(NH₃)₄]²⁺ بلون أزرق نيلي ساحر!', 'Formed royal dark navy tetraamminecopper(II) complex [Cu(NH₃)₄]²⁺!'));
        } else {
          setLastActionMessage(t(`تمت إضافة ${amountMl} مل من محلول الأمونيا NH₄OH (ارتفعت قلوية المحلول pH).`, `Added ${amountMl} mL of ammonia solution NH₄OH (pH increased).`));
        }
      } else if (reagentId === 'sodium_metal') {
        // Metallic Sodium Addition
        if (next.waterMl > 0) {
          // Instant violent detonation and skittering on water!
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
        next.aceticAcidMl = (next.aceticAcidMl || 0) + amountMl;
        if (next.bakingSodaG > 0.5) {
          setEffervescenceBubbles(prevB => Math.min(45, prevB + 22));
          next.bakingSodaG = Math.max(0, next.bakingSodaG - amountMl * 0.15);
          setLastActionMessage(t('تفاعل بركاني كلاسيكي ممتع! تفاعل حمض الخليك مع كربونات الصوديوم وتصاعد غاز CO₂.', 'Classic effervescent reaction! Acetic acid effervesced with baking soda releasing CO₂ gas.'));
        } else {
          setLastActionMessage(t(`أُضيف ${amountMl} مل من حمض الخليك CH₃COOH (حمض ضعيف جزئي التأين).`, `Added ${amountMl} mL dilute acetic acid CH3COOH (weak electrolyte).`));
        }
      } else if (reagentId === 'strontium_chloride') {
        next.strontiumG = (next.strontiumG || 0) + grams;
        setFlameTestMetal('strontium');
        setLastActionMessage(t(`أُضيف ${grams} جم كلوريد السترونشيوم SrCl₂. تم تفعيل اختبار اللهب القرمزي المتوهج (Crimson Red)!`, `Added ${grams} g SrCl2. Enabled brilliant crimson-red flame test!`));
      } else if (reagentId === 'barium_chloride') {
        next.bariumG = (next.bariumG || 0) + grams;
        setFlameTestMetal('barium');
        if (next.copperSulfateMl > 0) {
          next.precipitateG = Math.min(35, next.precipitateG + 6.0);
          setLastActionMessage(t('تفاعل ترسيب تحليلي! تكوّن راسب كبريتات الباريوم BaSO₄ الأبيض غير الذواب، مع انبعاث لهب أخضر تفاحي!', 'Precipitation test! Formed dense white BaSO4 precipitate and enabled apple-green flame!'));
        } else {
          setLastActionMessage(t(`أُضيف ${grams} جم كلوريد الباريوم BaCl₂ (يُعطي اختبار لهب أخضر تفاحي باهر).`, `Added ${grams} g BaCl2 (gives distinctive apple-green flame).`));
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
      bariumG: 0
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
    setMissionComplete(false);
    setLastActionMessage(t('تم تفريغ وتجفيف الكأس تماماً (0 مل). يمكنك الآن وضع قطع الفلزات الجافة ثم صب الماء لدراسة الانفجار!', 'Beaker completely dried (0 mL). Place dry metals then pour water to test detonation!'));
  };

  // Electric Spark / Igniter Tool
  const handleIgniteSpark = () => {
    triggerExplosion('spark');

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
        setLastActionMessage(t('🔥 وميض أبيض ناصع باهر! أطلقت الشرارة اشتعال شريط المغنيسيوم بالوهج الشمسي الأبيض الناصع!', '🔥 Blinding white flare! Electric spark ignited magnesium ribbon into radiant sparks and white MgO ash!'));
      }, 120);
      return;
    }

    // If flammable hydrogen gas has accumulated, trigger explosive pop detonation!
    if (content.hydrogenGasMl > 0) {
      setTimeout(() => {
        triggerExplosion('hydrogen_pop');
        setContent(prev => ({
          ...prev,
          hydrogenGasMl: 0,
          waterMl: Math.min(240, prev.waterMl + 2)
        }));
        setCurrentTempC(prevT => Math.min(95, prevT + 20));
        setEffervescenceBubbles(0);
        setLastActionMessage(t('⚡ فرقعة انفجارية سريعة لغاز الهيدروجين (Pop Test)! تفاعل الهيدروجين مع الأكسجين مكوناً بخار ماء مع صوت فرقعة ممتع!', '⚡ Explosive Hydrogen Pop Test! Flammable H2 detonated with O2 forming water vapor and a loud exciting pop!'));
      }, 120);
      return;
    }

    // If ethanol is present and not burning, ignite it!
    if (content.ethanolMl > 0 && !isEthanolBurning) {
      setTimeout(() => {
        triggerExplosion('ethanol_fire');
        setIsEthanolBurning(true);
        setCurrentTempC(prevT => Math.min(99, prevT + 25));
        setLastActionMessage(t('🔥 اشتعل الإيثانول بلهب أزرق وأصفر هادئ ومستمر يحاكي شعلة الكحول المخبرية!', '🔥 Ignited ethanol into a beautiful steady blue-orange alcohol combustion flame!'));
      }, 120);
      return;
    }

    setLastActionMessage(t('⚡ انطلقت شرارة كهربائية تجريبية داخل الكأس. لا توجد غازات أو أشرطة قابلة للاشتعال حالياً.', '⚡ Electric test spark struck inside beaker. No combustible gases or metals present currently.'));
  };

  // Stir the mixture with the authentic glass rod
  const handleStir = () => {
    setIsStirring(true);
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
      bariumG: 0
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
    setMissionComplete(false);
    setLastActionMessage(t('تم تفريغ الكأس وغسيله بـ 100 مل ماء مقطر نقي. الكأس جاهز لتجربة جديدة.', 'Beaker emptied and flushed with 100 mL pure distilled water. Ready for fresh experiment.'));
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

      // (c) Authentic Laboratory Glass Stirring Rod (عصا التحريك الزجاجية المخبرية)
      let rodTipX: number;
      let rodTipY: number;
      let rodTopX: number;
      let rodTopY: number;

      if (rodDragPosRef.current && isDraggingRodRef.current) {
        // Direct tracking of the user's cursor / finger dragging
        rodTipX = Math.max(beakerX + 25, Math.min(beakerX + beakerW - 25, rodDragPosRef.current.x));
        rodTipY = Math.max(liquidSurfaceY + 12, Math.min(beakerBottomY - 10, rodDragPosRef.current.y));
        rodTopX = rodTipX + 38;
        rodTopY = beakerY - 55;
      } else if (isStirring) {
        // Automatic animated circular stirring motion through the liquid
        stirAngleRef.current += 0.22;
        const stirR = beakerW * 0.28;
        rodTipX = beakerX + beakerW / 2 + Math.cos(stirAngleRef.current) * stirR;
        rodTipY = beakerBottomY - 16 + Math.sin(stirAngleRef.current * 2) * 5;
        rodTopX = beakerX + beakerW / 2 + Math.cos(stirAngleRef.current * 0.5) * 16 + 26;
        rodTopY = beakerY - 52;
      } else {
        // Natural resting position slanted against beaker rim
        rodTopX = beakerX + beakerW - 18;
        rodTopY = beakerY - 48;
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
        const stripX = beakerX + beakerW / 2 + 15;
        // Dry top part
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(stripX, 35, 8, liquidSurfaceY - 35);
        // Wet dipped part colored according to pH
        ctx.fillStyle = currentPh < 6 ? '#ef4444' : currentPh > 8 ? '#3b82f6' : '#22c55e';
        ctx.fillRect(stripX, liquidSurfaceY, 8, beakerBottomY - liquidSurfaceY - 30);
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
    effervescenceBubbles,
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

      {/* MAIN WORKBENCH RESPONSIVE CONTAINER */}
      <div className="w-full flex flex-col md:flex-row gap-5 items-start overflow-x-hidden">
        {/* Left Column: Reagents & Safe Chemical Shelf */}
        <div className="w-full md:w-[320px] lg:w-[360px] shrink-0 flex flex-col gap-4 order-2 md:order-1">
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

                  <div className="flex items-center gap-1 shrink-0">
                    {r.type === 'liquid' && (
                      <button
                        onClick={() => handleAddReagent(r.id, 1)}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-bold shrink-0 transition-all hover:border-cyan-500/50"
                        title={t('إضافة 1 مليلتر بالضبط', 'Add exactly 1 mL')}
                      >
                        +1 ml
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
              ))}
            </div>
          </div>
        </div>

        {/* Main Simulation Stage & Instruments */}
        <div className="w-full flex-1 min-w-0 flex flex-col lg:flex-row gap-5 order-1 md:order-2">
          {/* Middle Column: Interactive Beaker Workbench & Real-time Canvas */}
          <div className="w-full lg:flex-1 flex flex-col gap-4 items-center">
          <div className={`w-full p-4 rounded-2xl border shadow-lg flex flex-col items-center relative ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {/* Viewport Dimension Mode Selector (3D / 2D / Split View) */}
            <div className="w-full flex items-center justify-between pb-2 mb-3 border-b border-slate-800 gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === '3d'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>{t('معمل ثلاثي الأبعاد (3D)', '3D Virtual Lab')}</span>
                </button>
                <button
                  onClick={() => setViewMode('2d')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === '2d'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>{t('المخطط المخبري (2D)', '2D Canvas')}</span>
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
                    precipitateG={content.precipitateG}
                    effervescenceBubbles={effervescenceBubbles}
                    isConductivityActive={isConductivityActive}
                    conductivityGlow={conductivityGlow}
                    flameTestMetal={flameTestMetal}
                    isEthanolBurning={isEthanolBurning}
                    displayedWeightG={displayedWeightG}
                    litmusStripDipped={litmusStripDipped}
                    hydrogenGasMl={content.hydrogenGasMl}
                    dispenseTrigger={dispenseAnimCounter}
                    iceCount={content.iceCount}
                    hasActiveMetal={content.sodiumG > 0 ? 'sodium' : content.potassiumG > 0 ? 'potassium' : 'none'}
                    hasMagnesiumRibbon={content.magnesiumG > 0}
                    precipitateType={
                      content.silverNitrateMl > 0 && (content.acidMl > 0 || content.calciumChlorideG > 0)
                        ? 'silver_chloride'
                        : content.copperSulfateMl > 0 && (content.baseMl > 0 || content.ammoniaMl > 0)
                        ? 'copper_hydroxide'
                        : content.bariumG > 0 && content.copperSulfateMl > 0
                        ? 'barium_sulfate'
                        : content.ironG > 0
                        ? 'iron'
                        : 'none'
                    }
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
                  {/* Action notification floating over beaker */}
                  <div className="absolute top-2 left-2 right-2 z-20 pointer-events-none">
                    <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-xl p-2 text-center text-xs font-semibold text-slate-300 shadow-md">
                      {lastActionMessage}
                    </div>
                  </div>
                </div>
              )}
            </div>

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

          {/* Right Column: Precision Instruments (pH Meter, Thermometer, Balance) */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
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
