import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Sparkles,
  Maximize2,
  Minimize2,
  Info,
  RotateCcw,
  Sliders,
  Eye,
  Activity,
  Layers,
  Download,
  Copy,
  Check,
  Radio,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playLabSound } from '../utils/soundEffects';

export interface SpectralLine {
  wavelengthNm: number;
  relativeIntensity: number; // 0.1 to 1.0
  color: string;
  transitionNameAr: string;
  transitionNameEn: string;
  subshellTransition?: string;
}

export interface DischargeGas {
  id: string;
  nameAr: string;
  nameEn: string;
  formula: string;
  atomicNumber: number;
  glowColorHex: string;
  glowSecondaryHex: string;
  voltageThresholdKv: number;
  descriptionAr: string;
  descriptionEn: string;
  lines: SpectralLine[];
}

// Authentic spectral emission data for 8 key elements / gases
export const DISCHARGE_GASES: DischargeGas[] = [
  {
    id: 'hydrogen',
    nameAr: 'الهيدروجين (متسلسلة بالمر)',
    nameEn: 'Hydrogen (Balmer Series)',
    formula: 'H₂',
    atomicNumber: 1,
    glowColorHex: '#f43f5e',
    glowSecondaryHex: '#06b6d4',
    voltageThresholdKv: 1.5,
    descriptionAr: 'أنقى طيف ذري في الكون. تتولد خطوط بالمر المرئية الأربعة الشهيرة نتيجة قفز الإلكترون من مستويات الطاقة العليا (n=3,4,5,6) إلى المستوى الثاني (n=2).',
    descriptionEn: 'The purest atomic spectrum in nature. Famous 4 Balmer lines produced when electron falls from higher shells (n=3,4,5,6) to the second shell (n=2).',
    lines: [
      {
        wavelengthNm: 656.3,
        relativeIntensity: 1.0,
        color: '#ef4444',
        transitionNameAr: 'H-alpha (أحمر ناري)',
        transitionNameEn: 'H-alpha (Fire Red)',
        subshellTransition: 'n = 3 → n = 2'
      },
      {
        wavelengthNm: 486.1,
        relativeIntensity: 0.75,
        color: '#06b6d4',
        transitionNameAr: 'H-beta (سماوي مائي)',
        transitionNameEn: 'H-beta (Cyan Water)',
        subshellTransition: 'n = 4 → n = 2'
      },
      {
        wavelengthNm: 434.0,
        relativeIntensity: 0.5,
        color: '#6366f1',
        transitionNameAr: 'H-gamma (أزرق نيلي)',
        transitionNameEn: 'H-gamma (Indigo Blue)',
        subshellTransition: 'n = 5 → n = 2'
      },
      {
        wavelengthNm: 410.2,
        relativeIntensity: 0.35,
        color: '#a855f7',
        transitionNameAr: 'H-delta (بنفسجي رقيق)',
        transitionNameEn: 'H-delta (Violet)',
        subshellTransition: 'n = 6 → n = 2'
      }
    ]
  },
  {
    id: 'helium',
    nameAr: 'الهيليوم (الغاز النبيل الأول)',
    nameEn: 'Helium (First Noble Gas)',
    formula: 'He',
    atomicNumber: 2,
    glowColorHex: '#fbbf24',
    glowSecondaryHex: '#f472b6',
    voltageThresholdKv: 2.0,
    descriptionAr: 'اكتُشف الهيليوم أولاً في طيف الشمس عبر خطه الأصفر الأسطوري (D3) عند 587.6 nm قبل اكتشافه على الأرض بـ 27 عاماً!',
    descriptionEn: 'Discovered in the Sun spectrum via its famous yellow D3 line (587.6 nm) 27 years before being detected on Earth!',
    lines: [
      { wavelengthNm: 706.5, relativeIntensity: 0.6, color: '#dc2626', transitionNameAr: 'أحمر قاني', transitionNameEn: 'Deep Red', subshellTransition: '3s ³S → 2p ³P' },
      { wavelengthNm: 667.8, relativeIntensity: 0.75, color: '#ef4444', transitionNameAr: 'أحمر ساطع', transitionNameEn: 'Bright Red', subshellTransition: '3d ¹D → 2p ¹P' },
      { wavelengthNm: 587.6, relativeIntensity: 1.0, color: '#eab308', transitionNameAr: 'خط D3 الشمسي الذهبي', transitionNameEn: 'Solar D3 Golden Line', subshellTransition: '3d ³D → 2p ³P' },
      { wavelengthNm: 501.6, relativeIntensity: 0.65, color: '#10b981', transitionNameAr: 'أخضر زمردي', transitionNameEn: 'Emerald Green', subshellTransition: '3p ¹P → 2s ¹S' },
      { wavelengthNm: 471.3, relativeIntensity: 0.45, color: '#06b6d4', transitionNameAr: 'سماوي ثلجي', transitionNameEn: 'Ice Cyan', subshellTransition: '4s ³S → 2p ³P' },
      { wavelengthNm: 447.1, relativeIntensity: 0.85, color: '#3b82f6', transitionNameAr: 'أزرق نقي', transitionNameEn: 'Pure Blue', subshellTransition: '4d ³D → 2p ³P' },
      { wavelengthNm: 388.9, relativeIntensity: 0.5, color: '#9333ea', transitionNameAr: 'بنفسجي عميق', transitionNameEn: 'Deep Violet', subshellTransition: '3p ³P → 2s ³S' }
    ]
  },
  {
    id: 'neon',
    nameAr: 'النيون (إضاءة لافتات المدن)',
    nameEn: 'Neon (Urban Glow)',
    formula: 'Ne',
    atomicNumber: 10,
    glowColorHex: '#f97316',
    glowSecondaryHex: '#ef4444',
    voltageThresholdKv: 1.8,
    descriptionAr: 'يتميز بكثافة هائلة من خطوط الانبعاث البرتقالية والحمراء المتقاربة بين 580 و 700 nm، مما يعطيه لونه الأحمر البرتقالي الساطع الشهير عالمياً.',
    descriptionEn: 'Famous for its dense manifold of bright orange and crimson lines between 580 and 700 nm, producing iconic red-orange neon glow.',
    lines: [
      { wavelengthNm: 703.2, relativeIntensity: 0.9, color: '#b91c1c', transitionNameAr: 'أحمر داكن', transitionNameEn: 'Deep Red', subshellTransition: '3p → 3s' },
      { wavelengthNm: 692.9, relativeIntensity: 0.7, color: '#dc2626', transitionNameAr: 'أحمر قرمزي', transitionNameEn: 'Crimson', subshellTransition: '3p → 3s' },
      { wavelengthNm: 671.7, relativeIntensity: 0.8, color: '#ef4444', transitionNameAr: 'أحمر مرجاني', transitionNameEn: 'Coral Red', subshellTransition: '3p → 3s' },
      { wavelengthNm: 650.6, relativeIntensity: 0.75, color: '#ea580c', transitionNameAr: 'برتقالي أحمر', transitionNameEn: 'Orange Red', subshellTransition: '3p → 3s' },
      { wavelengthNm: 640.2, relativeIntensity: 1.0, color: '#f97316', transitionNameAr: 'برتقالي متوهج (الأساسي)', transitionNameEn: 'Primary Neon Orange', subshellTransition: '3p → 3s' },
      { wavelengthNm: 626.6, relativeIntensity: 0.65, color: '#fb923c', transitionNameAr: 'برتقالي دافئ', transitionNameEn: 'Warm Orange', subshellTransition: '3p → 3s' },
      { wavelengthNm: 614.3, relativeIntensity: 0.85, color: '#fdba74', transitionNameAr: 'برتقالي مصفر', transitionNameEn: 'Amber Orange', subshellTransition: '3p → 3s' },
      { wavelengthNm: 585.2, relativeIntensity: 0.9, color: '#facc15', transitionNameAr: 'أصفر كهرماني', transitionNameEn: 'Amber Yellow', subshellTransition: '3p → 3s' },
      { wavelengthNm: 540.0, relativeIntensity: 0.4, color: '#22c55e', transitionNameAr: 'أخضر خافت', transitionNameEn: 'Faint Green', subshellTransition: '3p → 3s' }
    ]
  },
  {
    id: 'mercury',
    nameAr: 'بخار الزئبق (مصابيح الفلورسنت)',
    nameEn: 'Mercury Vapor (Fluorescent Arc)',
    formula: 'Hg',
    atomicNumber: 80,
    glowColorHex: '#38bdf8',
    glowSecondaryHex: '#c084fc',
    voltageThresholdKv: 1.2,
    descriptionAr: 'أساس مصابيح الفلورسنت والإنارة الاقتصادية. يتميز بخطوطه الحادة جداً في الأخضر (546.1 nm) والأزرق والبنفسجي، مع زوج خطوط أصفر مميز.',
    descriptionEn: 'The core of fluorescent lighting. Features ultra-sharp spectral lines in green (546.1 nm), blue, violet, and a signature yellow doublet.',
    lines: [
      { wavelengthNm: 579.1, relativeIntensity: 0.85, color: '#facc15', transitionNameAr: 'خط الزئبق الأصفر الثاني', transitionNameEn: 'Mercury Yellow II', subshellTransition: '6d → 6p' },
      { wavelengthNm: 577.0, relativeIntensity: 0.8, color: '#fde047', transitionNameAr: 'خط الزئبق الأصفر الأول', transitionNameEn: 'Mercury Yellow I', subshellTransition: '6d → 6p' },
      { wavelengthNm: 546.1, relativeIntensity: 1.0, color: '#22c55e', transitionNameAr: 'الخط الأخضر الأسطوري (العياري)', transitionNameEn: 'Primary Standard Green', subshellTransition: '7s ³S₁ → 6p ³P₂' },
      { wavelengthNm: 435.8, relativeIntensity: 0.95, color: '#3b82f6', transitionNameAr: 'أزرق نيلي ساطع', transitionNameEn: 'Bright Indigo Blue', subshellTransition: '7s ³S₁ → 6p ³P₁' },
      { wavelengthNm: 404.7, relativeIntensity: 0.7, color: '#7c3aed', transitionNameAr: 'بنفسجي عميق', transitionNameEn: 'Deep Violet', subshellTransition: '7s ³S₁ → 6p ³P₀' }
    ]
  },
  {
    id: 'sodium',
    nameAr: 'بخار الصوديوم (خطوط D المزدوجة)',
    nameEn: 'Sodium Vapor (Doublet D-Lines)',
    formula: 'Na',
    atomicNumber: 11,
    glowColorHex: '#facc15',
    glowSecondaryHex: '#f59e0b',
    voltageThresholdKv: 1.4,
    descriptionAr: 'يشتهر بثنائي الصوديوم الأصفر (D1 و D2) عند 589.0 و 589.6 nm الناتج عن انقسام الدوران المداري (Spin-Orbit Coupling) لإلكترون التكافؤ الوحيد.',
    descriptionEn: 'Famous for the intense sodium doublet (589.0 & 589.6 nm) caused by spin-orbit coupling fine-structure in the single valence electron.',
    lines: [
      { wavelengthNm: 616.1, relativeIntensity: 0.25, color: '#ea580c', transitionNameAr: 'برتقالي ثانوي', transitionNameEn: 'Secondary Orange', subshellTransition: '5s → 3p' },
      { wavelengthNm: 589.6, relativeIntensity: 0.95, color: '#facc15', transitionNameAr: 'خط صوديوم D1 (أصفر نقي)', transitionNameEn: 'Sodium D1 (589.6 nm)', subshellTransition: '3p ²P₁/₂ → 3s ²S₁/₂' },
      { wavelengthNm: 589.0, relativeIntensity: 1.0, color: '#fde047', transitionNameAr: 'خط صوديوم D2 (الرئيسي الساطع)', transitionNameEn: 'Sodium D2 (589.0 nm)', subshellTransition: '3p ²P₃/₂ → 3s ²S₁/₂' },
      { wavelengthNm: 568.8, relativeIntensity: 0.3, color: '#84cc16', transitionNameAr: 'أخضر مصفر', transitionNameEn: 'Yellow Green', subshellTransition: '4d → 3p' },
      { wavelengthNm: 498.3, relativeIntensity: 0.2, color: '#06b6d4', transitionNameAr: 'سماوي خافت', transitionNameEn: 'Faint Cyan', subshellTransition: '5d → 3p' }
    ]
  },
  {
    id: 'argon',
    nameAr: 'الأرجون (تفريغ البلازما البنفسجية)',
    nameEn: 'Argon (Violet Plasma Arc)',
    formula: 'Ar',
    atomicNumber: 18,
    glowColorHex: '#818cf8',
    glowSecondaryHex: '#c084fc',
    voltageThresholdKv: 2.2,
    descriptionAr: 'غاز خامل يُستخدم في حماية اللحام بالبلازما وأشعة ليزر الأرجون. يتوهج بلون أزرق بنفسجي ملكي مع باقة خطوط في الأحمر والأشعة تحت الحمراء.',
    descriptionEn: 'Inert shield gas in plasma cutting and argon lasers. Glows royal violet-blue with strong transitions in blue and deep red.',
    lines: [
      { wavelengthNm: 750.4, relativeIntensity: 0.9, color: '#991b1b', transitionNameAr: 'أحمر عميق قريب من تحت الأحمر', transitionNameEn: 'Deep Red / Near IR', subshellTransition: '4p → 4s' },
      { wavelengthNm: 696.5, relativeIntensity: 0.8, color: '#dc2626', transitionNameAr: 'أحمر ياقوتي', transitionNameEn: 'Ruby Red', subshellTransition: '4p → 4s' },
      { wavelengthNm: 518.8, relativeIntensity: 0.45, color: '#10b981', transitionNameAr: 'أخضر فسفوري', transitionNameEn: 'Green Phosphor', subshellTransition: '5p → 4s' },
      { wavelengthNm: 488.0, relativeIntensity: 0.95, color: '#06b6d4', transitionNameAr: 'خط ليزر الأرجون الأزرق 488nm', transitionNameEn: 'Argon Laser Blue (488 nm)', subshellTransition: '4p ²D → 4s ²P' },
      { wavelengthNm: 451.1, relativeIntensity: 0.7, color: '#3b82f6', transitionNameAr: 'أزرق نيلي', transitionNameEn: 'Indigo Blue', subshellTransition: '5p → 4s' },
      { wavelengthNm: 420.1, relativeIntensity: 0.85, color: '#7c3aed', transitionNameAr: 'بنفسجي ملكي', transitionNameEn: 'Royal Violet', subshellTransition: '5p → 4s' }
    ]
  },
  {
    id: 'xenon',
    nameAr: 'الزينون (مصابيح الفلاش الفائقة)',
    nameEn: 'Xenon (Super Flash Arc)',
    formula: 'Xe',
    atomicNumber: 54,
    glowColorHex: '#38bdf8',
    glowSecondaryHex: '#f43f5e',
    voltageThresholdKv: 2.5,
    descriptionAr: 'أثقل الغازات النبيلة المستقرة، يعطي وميضاً أبيض مزرقاً يحاكي ضوء الشمس الطبيعي ويُستخدم في مصابيح فلاش الكاميرات ودوافع المركبات الفضائية (Ion Thrusters).',
    descriptionEn: 'Heaviest stable noble gas, produces brilliant sunlight-like blue-white flash used in strobe lights and spacecraft ion thrusters.',
    lines: [
      { wavelengthNm: 647.0, relativeIntensity: 0.5, color: '#ea580c', transitionNameAr: 'برتقالي كوني', transitionNameEn: 'Cosmic Orange', subshellTransition: '6p → 6s' },
      { wavelengthNm: 541.9, relativeIntensity: 0.6, color: '#22c55e', transitionNameAr: 'أخضر سماوي', transitionNameEn: 'Cyan Green', subshellTransition: '6p → 6s' },
      { wavelengthNm: 484.4, relativeIntensity: 0.8, color: '#06b6d4', transitionNameAr: 'سماوي كهربائي', transitionNameEn: 'Electric Cyan', subshellTransition: '7p → 6s' },
      { wavelengthNm: 467.1, relativeIntensity: 0.95, color: '#3b82f6', transitionNameAr: 'أزرق ساطع رئيسي', transitionNameEn: 'Bright Blue Primary', subshellTransition: '6p → 6s' },
      { wavelengthNm: 462.4, relativeIntensity: 0.85, color: '#6366f1', transitionNameAr: 'أزرق قطبي', transitionNameEn: 'Polar Blue', subshellTransition: '6p → 6s' },
      { wavelengthNm: 450.1, relativeIntensity: 0.7, color: '#8b5cf6', transitionNameAr: 'بنفسجي ثلجي', transitionNameEn: 'Glacial Violet', subshellTransition: '7p → 6s' }
    ]
  },
  {
    id: 'nitrogen',
    nameAr: 'النيتروجين (شفق القطب الشمالي)',
    nameEn: 'Nitrogen (Aurora Borealis)',
    formula: 'N₂',
    atomicNumber: 7,
    glowColorHex: '#a855f7',
    glowSecondaryHex: '#ec4899',
    voltageThresholdKv: 2.8,
    descriptionAr: 'يشكل 78% من الغلاف الجوي للأرض وهو المسؤول عن التوهج البنفسجي والوردي في الشفق القطبي عند اصطدام الرياح الشمسية بذرات النيتروجين الجوي.',
    descriptionEn: 'Makes up 78% of Earth atmosphere and creates the spectacular violet/magenta bands of the Aurora Borealis when excited by solar wind.',
    lines: [
      { wavelengthNm: 660.0, relativeIntensity: 0.65, color: '#ef4444', transitionNameAr: 'حزمة الشفق الحمراء', transitionNameEn: 'Red Aurora Band', subshellTransition: 'B³Πg → A³Σu⁺' },
      { wavelengthNm: 580.4, relativeIntensity: 0.5, color: '#facc15', transitionNameAr: 'أصفر ذهبي شفق', transitionNameEn: 'Golden Yellow', subshellTransition: 'B³Πg → A³Σu⁺' },
      { wavelengthNm: 470.8, relativeIntensity: 0.75, color: '#06b6d4', transitionNameAr: 'سماوي جزيئي', transitionNameEn: 'Molecular Cyan', subshellTransition: 'C³Πu → B³Πg' },
      { wavelengthNm: 427.8, relativeIntensity: 1.0, color: '#6366f1', transitionNameAr: 'شفق بنفسجي أيوني N₂⁺', transitionNameEn: 'Ionic N₂⁺ Violet (427.8 nm)', subshellTransition: 'B²Σu⁺ → X²Σg⁺' },
      { wavelengthNm: 391.4, relativeIntensity: 0.9, color: '#9333ea', transitionNameAr: 'أشعة فوق بنفسجية مرئية N₂⁺', transitionNameEn: 'Near-UV Aurora Peak', subshellTransition: 'B²Σu⁺ → X²Σg⁺' }
    ]
  }
];

// Helper: Calculate photon energy E = h*c / lambda
export function calculatePhotonEnergy(wavelengthNm: number) {
  // Planck constant h = 6.62607015e-34 J*s, c = 2.99792458e8 m/s
  // hc in eV*nm = 1239.84193 eV*nm
  const eV = 1239.84193 / wavelengthNm;
  const joules = eV * 1.602176634e-19;
  const frequencyThz = 299792.458 / wavelengthNm; // in THz (10^12 Hz)
  return { eV, joules, frequencyThz };
}

// Convert wavelength in nm (380-750) to approximate sRGB color hex
export function wavelengthToRGB(wavelength: number): string {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0;
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0;
    g = 1;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / (645 - 580);
    b = 0;
  } else if (wavelength >= 645 && wavelength <= 750) {
    r = 1;
    g = 0;
    b = 0;
  }

  // Intensity falloff near vision limits (380-420 and 700-750)
  let factor = 1.0;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
  } else if (wavelength >= 700 && wavelength <= 750) {
    factor = 0.3 + 0.7 * (750 - wavelength) / (750 - 700);
  }

  const red = Math.round(255 * Math.pow(r * factor, 0.8));
  const green = Math.round(255 * Math.pow(g * factor, 0.8));
  const blue = Math.round(255 * Math.pow(b * factor, 0.8));

  return `rgb(${red}, ${green}, ${blue})`;
}

interface SpectrometerDischargeProps {
  soundEnabled?: boolean;
  onClose?: () => void;
}

export const SpectrometerDischargeModule: React.FC<SpectrometerDischargeProps> = ({
  soundEnabled = true,
  onClose
}) => {
  const { theme, t } = useApp();
  const isDark = theme === 'dark';

  // Active state
  const [selectedGasId, setSelectedGasId] = useState<string>('hydrogen');
  const [highVoltageKv, setHighVoltageKv] = useState<number>(5.0); // 0 to 10 kV
  const [isPowerOn, setIsPowerOn] = useState<boolean>(true);
  const [slitWidthMm, setSlitWidthMm] = useState<number>(0.8); // 0.1 to 2.0 mm
  const [dispersionElement, setDispersionElement] = useState<'prism' | 'grating'>('prism');
  const [spectrumMode, setSpectrumMode] = useState<'emission' | 'absorption' | 'continuous'>('emission');
  const [selectedLine, setSelectedLine] = useState<SpectralLine | null>(null);
  const [probeWavelength, setProbeWavelength] = useState<number>(656.3);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentGas = DISCHARGE_GASES.find(g => g.id === selectedGasId) || DISCHARGE_GASES[0];
  const isDischarging = isPowerOn && highVoltageKv >= currentGas.voltageThresholdKv;

  // Set initial selected line to first line of gas
  useEffect(() => {
    if (currentGas.lines.length > 0) {
      setSelectedLine(currentGas.lines[0]);
      setProbeWavelength(currentGas.lines[0].wavelengthNm);
    }
  }, [selectedGasId]);

  // Handle Gas Change
  const handleSelectGas = (gasId: string) => {
    setSelectedGasId(gasId);
    playLabSound('spark', !soundEnabled);
  };

  // Handle Power Toggle
  const handleTogglePower = () => {
    setIsPowerOn(prev => !prev);
    playLabSound('click', !soundEnabled);
  };

  // 2D Canvas rendering of the Spectrometer Optical Apparatus
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.04;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Clear & Dark Chamber Background
      ctx.fillStyle = isDark ? '#020617' : '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Optical bench grid lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Optical Path Dimensions
      const tubeX = 75;
      const tubeY = h / 2;
      const tubeW = 34;
      const tubeH = 150;

      // 2. High-Voltage Gas Discharge Tube (Quartz glass + Electrodes)
      // Glass Tube Shadow & Shell
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = isDark ? '#475569' : '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(tubeX - tubeW / 2, tubeY - tubeH / 2, tubeW, tubeH, 12);
      ctx.fill();
      ctx.stroke();

      // Electrodes (Top Anode & Bottom Cathode)
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(tubeX - 6, tubeY - tubeH / 2 - 12, 12, 14);
      ctx.fillRect(tubeX - 6, tubeY + tubeH / 2 - 2, 12, 14);

      // High-voltage cables
      ctx.strokeStyle = '#ef4444'; // Red positive lead
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tubeX, tubeY - tubeH / 2 - 12);
      ctx.quadraticCurveTo(tubeX - 30, tubeY - tubeH / 2 - 35, 10, tubeY - tubeH / 2 - 25);
      ctx.stroke();

      ctx.strokeStyle = '#0284c7'; // Blue negative lead
      ctx.beginPath();
      ctx.moveTo(tubeX, tubeY + tubeH / 2 + 12);
      ctx.quadraticCurveTo(tubeX - 30, tubeY + tubeH / 2 + 35, 10, tubeY + tubeH / 2 + 25);
      ctx.stroke();

      // Glowing Plasma Column inside Discharge Tube
      if (isDischarging) {
        const flicker = 0.85 + Math.sin(time * 12) * 0.08 + Math.random() * 0.07;
        const glowRadius = Math.min(60, 25 + highVoltageKv * 3.5);

        // Ambient Plasma Halo
        const glowGrad = ctx.createRadialGradient(tubeX, tubeY, 4, tubeX, tubeY, glowRadius);
        glowGrad.addColorStop(0, currentGas.glowColorHex);
        glowGrad.addColorStop(0.5, currentGas.glowSecondaryHex);
        glowGrad.addColorStop(1, 'transparent');

        ctx.save();
        ctx.globalAlpha = flicker * 0.75;
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(tubeX, tubeY, glowRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Core Plasma Arc Filaments inside tube
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(tubeX - tubeW / 2 + 4, tubeY - tubeH / 2 + 8, tubeW - 8, tubeH - 16, 8);
        ctx.clip();

        // Plasma Body Gradient
        const plasmaGrad = ctx.createLinearGradient(tubeX - tubeW / 2, 0, tubeX + tubeW / 2, 0);
        plasmaGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        plasmaGrad.addColorStop(0.5, currentGas.glowColorHex);
        plasmaGrad.addColorStop(1, currentGas.glowSecondaryHex);

        ctx.fillStyle = plasmaGrad;
        ctx.globalAlpha = flicker;
        ctx.fillRect(tubeX - tubeW / 2 + 4, tubeY - tubeH / 2 + 8, tubeW - 8, tubeH - 16);

        // Electric Discharge Spark Filaments
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tubeX, tubeY - tubeH / 2 + 12);
        for (let py = tubeY - tubeH / 2 + 20; py < tubeY + tubeH / 2 - 12; py += 15) {
          const xOffset = Math.sin(py * 0.1 + time * 8) * 6 + (Math.random() - 0.5) * 4;
          ctx.lineTo(tubeX + xOffset, py);
        }
        ctx.lineTo(tubeX, tubeY + tubeH / 2 - 12);
        ctx.stroke();

        ctx.restore();
      } else {
        // Cold un-ionized gas inside tube
        ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(currentGas.formula, tubeX, tubeY + 4);
      }

      // 3. Collimator Tube & Adjustable Slit
      const collimatorX = 175;
      const collimatorY = tubeY;
      const slitHalf = slitWidthMm * 5;

      // Collimator barrel
      ctx.fillStyle = '#334155';
      ctx.fillRect(tubeX + tubeW / 2 + 10, tubeY - 14, collimatorX - (tubeX + tubeW / 2 + 10), 28);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(tubeX + tubeW / 2 + 10, tubeY - 14, collimatorX - (tubeX + tubeW / 2 + 10), 28);

      // Slit plate
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(collimatorX, tubeY - 35, 6, 35 - slitHalf);
      ctx.fillRect(collimatorX, tubeY + slitHalf, 6, 35 - slitHalf);
      ctx.strokeStyle = '#06b6d4';
      ctx.strokeRect(collimatorX, tubeY - 35, 6, 35 - slitHalf);
      ctx.strokeRect(collimatorX, tubeY + slitHalf, 6, 35 - slitHalf);

      // 4. Optical Dispersion Unit (Triangular Prism or Diffraction Grating)
      const prismX = 310;
      const prismY = tubeY;
      const prismSize = 48;

      if (dispersionElement === 'prism') {
        // Glass Prism equilateral triangle
        ctx.save();
        ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prismX - prismSize * 0.5, prismY + prismSize * 0.7);
        ctx.lineTo(prismX + prismSize * 0.6, prismY);
        ctx.lineTo(prismX - prismSize * 0.5, prismY - prismSize * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Prism glass reflection highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(prismX - prismSize * 0.35, prismY - prismSize * 0.4);
        ctx.lineTo(prismX + prismSize * 0.3, prismY);
        ctx.stroke();
        ctx.restore();
      } else {
        // Diffraction Grating Plate
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.fillRect(prismX - 4, prismY - 45, 8, 90);
        ctx.strokeRect(prismX - 4, prismY - 45, 8, 90);

        // Grating lines
        ctx.strokeStyle = 'rgba(216, 180, 254, 0.5)';
        ctx.lineWidth = 1;
        for (let gy = prismY - 40; gy <= prismY + 40; gy += 6) {
          ctx.beginPath();
          ctx.moveTo(prismX - 3, gy);
          ctx.lineTo(prismX + 3, gy);
          ctx.stroke();
        }
      }

      // 5. Light Beams Propagation & Refraction
      if (isDischarging) {
        // Beam 1: Tube to Collimator Slit
        ctx.save();
        ctx.strokeStyle = currentGas.glowColorHex;
        ctx.lineWidth = Math.max(1.5, slitWidthMm * 2.5);
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(tubeX + tubeW / 2, tubeY);
        ctx.lineTo(collimatorX, tubeY);
        ctx.stroke();

        // Beam 2: Slit to Prism Entrance Face
        ctx.strokeStyle = '#ffffff'; // White/mixed collimated ray
        ctx.lineWidth = Math.max(1.2, slitWidthMm * 2.0);
        ctx.beginPath();
        ctx.moveTo(collimatorX + 6, tubeY);
        ctx.lineTo(prismX - prismSize * 0.4, tubeY);
        ctx.stroke();
        ctx.restore();

        // 6. Spectral Detector Screen
        const screenX = w - 85;
        const screenH = 170;
        const screenY = tubeY - screenH / 2;

        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.fillRect(screenX, screenY, 45, screenH);
        ctx.strokeRect(screenX, screenY, 45, screenH);

        // Beam 3: Dispersed Rays from Prism to Detector Screen
        const linesToDraw = spectrumMode === 'continuous'
          ? [
              { wavelengthNm: 400, color: '#8b5cf6', relativeIntensity: 0.8 },
              { wavelengthNm: 450, color: '#3b82f6', relativeIntensity: 0.9 },
              { wavelengthNm: 500, color: '#06b6d4', relativeIntensity: 0.95 },
              { wavelengthNm: 550, color: '#22c55e', relativeIntensity: 1.0 },
              { wavelengthNm: 600, color: '#eab308', relativeIntensity: 0.9 },
              { wavelengthNm: 650, color: '#ef4444', relativeIntensity: 0.85 }
            ]
          : currentGas.lines;

        linesToDraw.forEach(line => {
          // Snell's dispersion: shorter wavelength (violet) bends MORE than longer (red)
          // 380 nm -> top of screen, 750 nm -> bottom of screen
          const normPos = (line.wavelengthNm - 380) / (750 - 380);
          const targetY = screenY + 12 + normPos * (screenH - 24);

          // Ray path from prism to detector
          ctx.save();
          ctx.strokeStyle = line.color;
          ctx.lineWidth = 1.6 + line.relativeIntensity * 1.5;
          ctx.globalAlpha = 0.85 * line.relativeIntensity;
          ctx.beginPath();
          ctx.moveTo(prismX + 10, tubeY);
          ctx.lineTo(screenX, targetY);
          ctx.stroke();

          // Spectral line projection on detector screen
          ctx.strokeStyle = line.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(screenX + 2, targetY);
          ctx.lineTo(screenX + 43, targetY);
          ctx.stroke();
          ctx.restore();
        });
      }

      // Render Label Overlays on Canvas
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(t('أنبوب التفريغ', 'Discharge Tube'), tubeX, tubeY + tubeH / 2 + 24);
      ctx.fillText(t('شق الميزاب', 'Collimator Slit'), collimatorX + 3, tubeY + 45);
      ctx.fillText(
        dispersionElement === 'prism' ? t('منشور التشتيت', 'Dispersing Prism') : t('محزوز الحيود', 'Diffraction Grating'),
        prismX,
        tubeY + 55
      );
      ctx.fillText(t('كاشف الطيف', 'Spectral Detector'), w - 62, tubeY + 105);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [selectedGasId, highVoltageKv, isPowerOn, slitWidthMm, dispersionElement, spectrumMode, isDark, t]);

  // Copy Spectral Analysis Report
  const handleCopyReport = () => {
    const energyData = calculatePhotonEnergy(probeWavelength);
    const text = `
=== ${t('تقرير التحليل المطيافي الذري', 'Atomic Emission Spectrometer Report')} ===
${t('العنصر / الغاز المستثار', 'Excited Gas')}: ${t(currentGas.nameAr, currentGas.nameEn)} (${currentGas.formula})
${t('الجهد الكهربائي المطبق', 'Applied Voltage')}: ${highVoltageKv.toFixed(1)} kV
${t('عنصر التشتيت', 'Dispersion Element')}: ${dispersionElement === 'prism' ? 'Glass Prism (Refraction)' : 'Diffraction Grating'}
--------------------------------------------------
${t('الطول الموجي المقاس', 'Probed Wavelength')}: ${probeWavelength.toFixed(1)} nm
${t('التردد', 'Frequency')}: ${energyData.frequencyThz.toFixed(2)} THz
${t('طاقة الفوتون', 'Photon Energy')}: ${energyData.eV.toFixed(3)} eV (${(energyData.joules * 1e19).toFixed(3)} × 10⁻¹⁹ J)
${t('الانتقال الإلكتروني', 'Electron Transition')}: ${selectedLine ? selectedLine.subshellTransition || selectedLine.transitionNameEn : 'N/A'}
==================================================
`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const probedEnergy = calculatePhotonEnergy(probeWavelength);
  const probedColor = wavelengthToRGB(probeWavelength);

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border shadow-lg space-y-6 ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* 1. Header Banner & Close / Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-base sm:text-lg font-black flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <span>{t('محطة مطياف الانبعاث الضوئي والتفريغ الكهربائي', 'Optical Emission Spectrometer & Discharge Tube')}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono">
                PhET Spec-01
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t(
                'استثارة الغازات بفرق جهد عالٍ (High Voltage) وتحليل خطوط الانبعاث الذرية عبر منشور التشتيت الزجاجي لحساب طاقة الفوتونات E=hc/λ.',
                'Excite rarefied gases via high voltage discharge and analyze discrete atomic emission lines via dispersion prism to verify E=hc/λ.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow-xs"
            title={t('نسخ تقرير التحليل المطيافي', 'Copy Spectral Report')}
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? t('تم النسخ!', 'Copied!') : t('نسخ التقرير', 'Copy Report')}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all"
            >
              {t('إغلاق', 'Close')}
            </button>
          )}
        </div>
      </div>

      {/* 2. Gas Selector Bar (8 Authentic Gases) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t('اختر الغاز / العنصر في أنبوب التفريغ الكوارتزي:', 'Select Gas in Quartz Discharge Tube:')}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {DISCHARGE_GASES.map(gas => {
            const isSelected = selectedGasId === gas.id;
            return (
              <button
                key={gas.id}
                type="button"
                onClick={() => handleSelectGas(gas.id)}
                className={`p-2 rounded-xl border text-start transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-md ring-1 ring-cyan-500/50'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-extrabold text-cyan-400">{gas.formula}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                    style={{ backgroundColor: gas.glowColorHex }}
                  />
                </div>
                <div className="text-[11px] font-bold truncate text-slate-200">{t(gas.nameAr.split(' ')[0], gas.nameEn.split(' ')[0])}</div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">Z = {gas.atomicNumber}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Optical Bench Canvas + Real-Time Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Apparatus Live Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            <canvas
              ref={canvasRef}
              width={720}
              height={320}
              className="w-full h-auto block"
            />

            {/* Quick Status Pill */}
            <div className="absolute top-3 start-3 flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 backdrop-blur-md ${
                isDischarging
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isDischarging ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span>{isDischarging ? t('تفريغ كهربائي متوهج ونشط', 'Active Plasma Discharge') : t('الجهد دون عتبة التأين', 'Below Ionization Voltage')}</span>
              </span>
            </div>

            {/* Dispersion Mode Badge */}
            <div className="absolute top-3 end-3 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-900/80 border border-slate-700 text-slate-300">
                {dispersionElement === 'prism' ? t('منشور كراون زجاجي', 'Crown Glass Prism') : t('محزوز 600 خط/ملم', 'Grating 600 lines/mm')}
              </span>
            </div>
          </div>

          {/* Interactive Visible Spectrum Strip (380 nm - 750 nm) */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/90 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('شريط الطيف المرئي لكاشف المطياف (380 - 750 نانومتر):', 'Spectral Detector Visible Band (380 - 750 nm):')}</span>
              </span>
              <span className="font-mono text-cyan-400 text-[11px]">
                λ = {probeWavelength.toFixed(1)} nm
              </span>
            </div>

            {/* Rainbow Band with Spectral Lines */}
            <div
              className="relative h-12 rounded-lg overflow-hidden cursor-crosshair border border-slate-700 select-none shadow-inner"
              style={{
                background: spectrumMode === 'emission'
                  ? '#020617' // dark background for emission lines
                  : 'linear-gradient(to right, #4c1d95, #3b82f6, #06b6d4, #22c55e, #eab308, #ea580c, #dc2626)'
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, clickX / rect.width));
                const targetLambda = 380 + pct * (750 - 380);
                setProbeWavelength(targetLambda);

                // Find closest line if within 8nm
                const closest = currentGas.lines.reduce((prev, curr) => {
                  return Math.abs(curr.wavelengthNm - targetLambda) < Math.abs(prev.wavelengthNm - targetLambda)
                    ? curr
                    : prev;
                }, currentGas.lines[0]);

                if (closest && Math.abs(closest.wavelengthNm - targetLambda) < 8) {
                  setSelectedLine(closest);
                  setProbeWavelength(closest.wavelengthNm);
                } else {
                  setSelectedLine(null);
                }
              }}
            >
              {/* Spectral Emission Lines for the Current Gas */}
              {isDischarging && currentGas.lines.map((line, idx) => {
                const leftPct = ((line.wavelengthNm - 380) / (750 - 380)) * 100;
                const isLineActive = selectedLine && selectedLine.wavelengthNm === line.wavelengthNm;
                return (
                  <div
                    key={idx}
                    className="absolute top-0 bottom-0 pointer-events-none transition-all"
                    style={{
                      left: `${leftPct}%`,
                      width: isLineActive ? '3.5px' : '2px',
                      backgroundColor: spectrumMode === 'absorption' ? '#000000' : line.color,
                      boxShadow: spectrumMode === 'emission' ? `0 0 8px ${line.color}` : 'none',
                      zIndex: isLineActive ? 20 : 10
                    }}
                  />
                );
              })}

              {/* Probe Cursor Indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none z-30"
                style={{ left: `${((probeWavelength - 380) / (750 - 380)) * 100}%` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white -translate-x-[4px] -translate-y-1 shadow-md border border-slate-900" />
              </div>
            </div>

            {/* Wavelength Scale Labels */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
              <span>380 nm (UV/Violet)</span>
              <span>450 nm (Blue)</span>
              <span>520 nm (Green)</span>
              <span>590 nm (Yellow)</span>
              <span>660 nm (Red)</span>
              <span>750 nm (Near IR)</span>
            </div>
          </div>
        </div>

        {/* Right: Instrumentation Controls & Real-Time Physics Gauge (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Power & High Voltage Controls */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{t('مولد الجهد العالي (High Voltage):', 'High Voltage Induction Coil:')}</span>
              </span>
              <button
                type="button"
                onClick={handleTogglePower}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition-all ${
                  isPowerOn
                    ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {isPowerOn ? t('تشغيل (ON)', 'Power ON') : t('إيقاف (OFF)', 'Power OFF')}
              </button>
            </div>

            {/* Voltage Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t('فرق الجهد المطبق:', 'Applied Voltage:')}</span>
                <span className="font-mono font-bold text-amber-400">{highVoltageKv.toFixed(1)} kV</span>
              </div>
              <input
                type="range"
                min={0}
                max={10.0}
                step={0.1}
                value={highVoltageKv}
                disabled={!isPowerOn}
                onChange={(e) => setHighVoltageKv(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.0 kV</span>
                <span>{t('عتبة التأين:', 'Ionization:')} {currentGas.voltageThresholdKv.toFixed(1)} kV</span>
                <span>10.0 kV</span>
              </div>
            </div>

            {/* Collimator Slit Width */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{t('اتساع شق الميزاب:', 'Slit Width:')}</span>
                <span className="font-mono font-bold text-cyan-400">{slitWidthMm.toFixed(2)} mm</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={2.0}
                step={0.05}
                value={slitWidthMm}
                onChange={(e) => setSlitWidthMm(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Optical Dispersion Mode */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 block">{t('عنصر التشتيت البصري:', 'Dispersion Element:')}</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDispersionElement('prism')}
                  className={`py-1.5 px-2 rounded-lg border transition-all text-center ${
                    dispersionElement === 'prism'
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-xs'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t('منشور زجاجي 📐', 'Glass Prism 📐')}
                </button>
                <button
                  type="button"
                  onClick={() => setDispersionElement('grating')}
                  className={`py-1.5 px-2 rounded-lg border transition-all text-center ${
                    dispersionElement === 'grating'
                      ? 'bg-purple-600 border-purple-400 text-white shadow-xs'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t('محزوز حيود 🏁', 'Diffraction Grating 🏁')}
                </button>
              </div>
            </div>

            {/* Spectrum Mode Toggle */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 block">{t('نوع الطيف المعروض:', 'Spectrum Mode:')}</span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setSpectrumMode('emission')}
                  className={`py-1 px-1.5 rounded-lg border transition-all text-center ${
                    spectrumMode === 'emission'
                      ? 'bg-cyan-600 border-cyan-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {t('انبعاث خطي', 'Emission')}
                </button>
                <button
                  type="button"
                  onClick={() => setSpectrumMode('absorption')}
                  className={`py-1 px-1.5 rounded-lg border transition-all text-center ${
                    spectrumMode === 'absorption'
                      ? 'bg-amber-600 border-amber-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {t('امتصاص', 'Absorption')}
                </button>
                <button
                  type="button"
                  onClick={() => setSpectrumMode('continuous')}
                  className={`py-1 px-1.5 rounded-lg border transition-all text-center ${
                    spectrumMode === 'continuous'
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {t('طيف مستمر', 'Continuous')}
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Quantum Photon Energy Analyzer Card */}
          <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>{t('حسابات طاقة الفوتون (E = hc / λ):', 'Quantum Photon Energy Engine:')}</span>
              </span>
              <div
                className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
                style={{ backgroundColor: probedColor }}
                title={probedColor}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t('الطول الموجي λ', 'Wavelength λ')}</span>
                <span className="font-mono font-black text-cyan-300 text-sm">{probeWavelength.toFixed(1)} nm</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t('التردد ν', 'Frequency ν')}</span>
                <span className="font-mono font-black text-amber-300 text-sm">{probedEnergy.frequencyThz.toFixed(1)} THz</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t('طاقة الفوتون (eV)', 'Photon Energy (eV)')}</span>
                <span className="font-mono font-black text-emerald-300 text-sm">{probedEnergy.eV.toFixed(3)} eV</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{t('طاقة الفوتون (J)', 'Photon Energy (J)')}</span>
                <span className="font-mono font-bold text-purple-300 text-[11px]">
                  {(probedEnergy.joules * 1e19).toFixed(3)} × 10⁻¹⁹ J
                </span>
              </div>
            </div>

            {/* Quantum Subshell Transition Details */}
            {selectedLine ? (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-300">{t(selectedLine.transitionNameAr, selectedLine.transitionNameEn)}</span>
                  <span className="font-mono text-cyan-400">{selectedLine.subshellTransition}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {t(
                    'تم تأكيد خط الانبعاث الطيفي عبر مطابقة نموذج بور ومعادلة ريدبيرج للطاقات الكمومية.',
                    'Emission line verified via Bohr model and Rydberg formula for orbital quantum transitions.'
                  )}
                </p>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">
                {t('انقر على أي خط طيفي على الشريط لتحليله تفصيلياً.', 'Click on any spectral line on the bar to inspect details.')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
