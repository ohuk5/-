import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Flame,
  Snowflake,
  Gauge,
  Maximize2,
  Minimize2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Volume2,
  Wind,
  Plus,
  Minus,
  RefreshCw,
  Compass,
  Layers,
  Info,
  BookOpen,
  Check
} from 'lucide-react';
import { toEnglishDigits } from '../utils/numberUtils';
import {
  SUBSTANCES,
  calculatePhase,
  MatterPhase,
  SubstanceInfo,
  calculateEffectiveBoilingPoint,
  calculateEffectiveMeltingPoint
} from '../data/substancesData';
import { useApp } from '../context/AppContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetX: number;
  targetY: number;
  angle: number;
  vRot: number;
  mass: number;
}

interface StatesOfMatterProps {
  onOpenGuide?: (category?: 'basics' | 'states' | 'atoms' | 'decay' | 'missions') => void;
}

export const StatesOfMatter: React.FC<StatesOfMatterProps> = ({ onOpenGuide }) => {
  const { lang, theme, t, activeLabPreset, clearLabExperiment } = useApp();
  const [substanceId, setSubstanceId] = useState<string>('water');
  const [targetTemp, setTargetTemp] = useState<number>(300); // 300K default
  const [actualTemp, setActualTemp] = useState<number>(300);
  const [volumeLidPercent, setVolumeLidPercent] = useState<number>(75); // 20-100%
  const [gravityPreset, setGravityPreset] = useState<'earth' | 'moon' | 'jupiter' | 'zero'>('earth');
  const [gravityValue, setGravityValue] = useState<number>(1.0); // 0.0 to 2.5
  const [particleCount, setParticleCount] = useState<number>(45); // 15 to 80 particles
  const [pressureAtm, setPressureAtm] = useState<number>(1.02);
  const [burnerActive, setBurnerActive] = useState<'heat' | 'cool' | null>(null);
  const [isVenting, setIsVenting] = useState<boolean>(false);
  const [isDraggingPiston, setIsDraggingPiston] = useState<boolean>(false);

  // Exact Temperature Input State (as requested by user)
  const [tempUnit, setTempUnit] = useState<'K' | 'C'>('K');
  const [exactTempInput, setExactTempInput] = useState<string>('300');

  // Transition announcement banner state
  const [transitionNotification, setTransitionNotification] = useState<{
    title: string;
    description: string;
    type: 'melting' | 'boiling' | 'condensation' | 'freezing' | 'sublimation' | 'pressure_liquefaction';
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const momentumExchangeRef = useRef<number>(0);
  const rollingPressureRef = useRef<number[]>([]);
  const burnerIntervalRef = useRef<number | null>(null);
  const prevPhaseRef = useRef<string>('liquid');
  const prevPistonYRef = useRef<number>(0);
  const steamJetsRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number }[]>([]);

  const substance: SubstanceInfo = SUBSTANCES[substanceId] || SUBSTANCES['water'];
  const phaseInfo = calculatePhase(actualTemp, substance, pressureAtm, lang);

  // Dynamic Scale bounds for the temperature bar (supports high temp for Iron and Gold!)
  const maxScaleK = Math.max(1200, Math.ceil(substance.boilingPointK * 1.35 / 50) * 50);

  // Sync exact input box when targetTemp or tempUnit changes
  useEffect(() => {
    if (tempUnit === 'K') {
      setExactTempInput(targetTemp.toString());
    } else {
      setExactTempInput(Math.round(targetTemp - 273.15).toString());
    }
  }, [targetTemp, tempUnit]);

  // Apply Exact Temperature numeric value
  const handleApplyExactTemp = (valStr?: string) => {
    const raw = valStr !== undefined ? valStr : exactTempInput;
    const normalized = toEnglishDigits(raw);
    const num = parseFloat(normalized);
    if (!isNaN(num)) {
      const k = tempUnit === 'K' ? num : num + 273.15;
      const clamped = Math.max(5, Math.min(maxScaleK, Math.round(k)));
      setTargetTemp(clamped);
    }
  };

  // Adiabatic volume & pressure physics
  const applyAdiabaticVolumeChange = (newVol: number) => {
    const oldVol = volumeLidPercent;
    if (oldVol !== newVol && oldVol > 0 && newVol > 0) {
      const ratio = oldVol / newVol;
      if (ratio > 1.05) {
        // Adiabatic compression work heats up the gas!
        setTargetTemp(t => Math.min(maxScaleK, Math.round(t * Math.pow(ratio, 0.4))));
      } else if (ratio < 0.95) {
        // Expansion cools the gas down!
        setTargetTemp(t => Math.max(5, Math.round(t * Math.pow(ratio, 0.3))));
      }
    }
    setVolumeLidPercent(newVol);
  };

  // Pressure presets
  const setPressurePreset = (preset: 'vacuum' | 'normal' | 'cooker' | 'extreme') => {
    if (preset === 'vacuum') {
      applyAdiabaticVolumeChange(100);
      setTransitionNotification({
        title: t('🌌 تفريغ الوعاء (حجرة مفرغة 0.2 Atm)', '🌌 Vacuum Chamber (0.2 Atm)'),
        description: t(
          'تمديد الحجم أدى لانخفاض الضغط، مما يقلل درجة الغليان الفعالة ويجعل السائل يغلي ويتبخر فوراً حتى في حرارة الغرفة!',
          'Expanding volume drops pressure to ~0.2 Atm, drastically lowering boiling point and causing liquid to boil at room temp!'
        ),
        type: 'boiling'
      });
    } else if (preset === 'normal') {
      applyAdiabaticVolumeChange(75);
    } else if (preset === 'cooker') {
      applyAdiabaticVolumeChange(35);
      setTransitionNotification({
        title: t('🍲 قدر الضغط والتسييل (~3.5 Atm)', '🍲 High Pressure Cooker (~3.5 Atm)'),
        description: t(
          'الضغط المرتفع يجبر جزيئات البخار على التكاثف لسائل ويرفع نقطة الغليان، مما يمنع التطاير!',
          'High pressure forces vapor to condense into liquid and raises boiling point, preventing escape!'
        ),
        type: 'pressure_liquefaction'
      });
    } else if (preset === 'extreme') {
      applyAdiabaticVolumeChange(22);
      setTransitionNotification({
        title: t('🚨 ضغط هيدروليكي فائق (> 6.0 Atm)', '🚨 Extreme Hydraulic Pressure (> 6.0 Atm)'),
        description: t(
          'ضغط فائق يولّد طاقة حركية وحرارة انضغاط شديدة ويفعل صمام الأمان لتنفيس البخار تلقائياً!',
          'Extreme pressure generates kinetic heat and triggers the safety relief valve to vent steam!'
        ),
        type: 'pressure_liquefaction'
      });
    }
  };

  // React to Lab Presets triggered from Experimental Lab
  useEffect(() => {
    if (activeLabPreset) {
      if (activeLabPreset.substanceId && SUBSTANCES[activeLabPreset.substanceId]) {
        setSubstanceId(activeLabPreset.substanceId);
      }
      if (activeLabPreset.targetTemp !== undefined) {
        setTargetTemp(activeLabPreset.targetTemp);
        setActualTemp(activeLabPreset.targetTemp);
      }
      if (activeLabPreset.volumeLidPercent !== undefined) {
        setVolumeLidPercent(activeLabPreset.volumeLidPercent);
      }
      if (activeLabPreset.gravityPreset) {
        handleSetGravityPreset(activeLabPreset.gravityPreset);
      }
      clearLabExperiment();
    }
  }, [activeLabPreset]);

  // Sync gravity presets with numerical gravity value
  const handleSetGravityPreset = (preset: 'earth' | 'moon' | 'jupiter' | 'zero') => {
    setGravityPreset(preset);
    if (preset === 'earth') setGravityValue(1.0);
    else if (preset === 'moon') setGravityValue(0.16);
    else if (preset === 'jupiter') setGravityValue(2.5);
    else if (preset === 'zero') setGravityValue(0.0);
  };

  // Phase transition detector
  useEffect(() => {
    const currentPhase = phaseInfo.phase;
    const prevPhase = prevPhaseRef.current;

    if (prevPhase !== currentPhase) {
      prevPhaseRef.current = currentPhase;

      if (substance.isSublimating && pressureAtm < 5.1 && (currentPhase === 'gas' || currentPhase === 'melting')) {
        setTransitionNotification({
          title: t('✨ حدوث التسامي المباشر (Sublimation)!', '✨ Direct Sublimation Occurring!'),
          description: t(
            `عند ضغط ${pressureAtm.toFixed(2)} Atm (أقل من النقطة الثلاثية 5.1 Atm)، يتحول ${substance.name} مباشرة من الحالة الصلبة إلى الغاز دون المرور بالحالة السائلة!`,
            `At ${pressureAtm.toFixed(2)} Atm (below 5.1 Atm triple point), ${substance.nameEn} sublimates directly from solid to gas without liquid phase!`
          ),
          type: 'sublimation'
        });
      } else if (
        (prevPhase === 'solid' && (currentPhase === 'melting' || currentPhase === 'liquid')) ||
        (prevPhase === 'melting' && currentPhase === 'liquid')
      ) {
        setTransitionNotification({
          title: t('🔥 حدوث الانصهار (Melting)!', '🔥 Melting Occurring!'),
          description: t(
            `تجاوزت درجة الحرارة نقطة الانصهار (${phaseInfo.effectiveTm.toFixed(1)} K). تكسرت الروابط الشبكية الصلبة وبدأت الجزيئات بالانزلاق كمائع.`,
            `Temperature passed melting point (${phaseInfo.effectiveTm.toFixed(1)} K). Solid lattice bonds broke into fluid state.`
          ),
          type: 'melting'
        });
      } else if (
        (prevPhase === 'liquid' && (currentPhase === 'boiling' || currentPhase === 'gas')) ||
        (prevPhase === 'boiling' && currentPhase === 'gas')
      ) {
        setTransitionNotification({
          title: t('💨 حدوث التبخر والغليان (Boiling)!', '💨 Boiling & Vaporization!'),
          description: t(
            `تجاوزت درجة الحرارة نقطة الغليان الفعالة (${phaseInfo.effectiveTb.toFixed(1)} K). تغلبت الطاقة الحركية على قوى التجاذب البيني، وتمددت المادة كغاز حر.`,
            `Temperature passed effective boiling point (${phaseInfo.effectiveTb.toFixed(1)} K). Kinetic energy dispersed particles into free gas.`
          ),
          type: 'boiling'
        });
      } else if (
        (prevPhase === 'gas' && (currentPhase === 'boiling' || currentPhase === 'liquid')) ||
        (prevPhase === 'boiling' && currentPhase === 'liquid')
      ) {
        const isPressureTriggered = volumeLidPercent < 55 && pressureAtm > 1.8;
        setTransitionNotification({
          title: isPressureTriggered
            ? t('⚡ تكاثف بالضغط (Pressure Liquefaction)!', '⚡ Pressure Liquefaction Occurring!')
            : t('💧 حدوث التكاثف (Condensation)!', '💧 Condensation Occurring!'),
          description: isPressureTriggered
            ? t(
                `أدى انخفاض الحجم وارتفاع الضغط إلى ${pressureAtm.toFixed(2)} Atm لرفع نقطة الغليان وإجبار جزيئات الغاز على التكاثف لسائل!`,
                `Compression raised pressure to ${pressureAtm.toFixed(2)} Atm, elevating boiling point and forcing vapor to condense into liquid!`
              )
            : t(
                `انخفضت الحرارة دون نقطة الغليان (${phaseInfo.effectiveTb.toFixed(1)} K). تقاربت الجزيئات لتشكل قطرات سائلة مائعة.`,
                `Temperature dropped below boiling point (${phaseInfo.effectiveTb.toFixed(1)} K). Particles condensed into liquid drops.`
              ),
          type: isPressureTriggered ? 'pressure_liquefaction' : 'condensation'
        });
      } else if (
        (prevPhase === 'liquid' && (currentPhase === 'melting' || currentPhase === 'solid')) ||
        (prevPhase === 'melting' && currentPhase === 'solid')
      ) {
        setTransitionNotification({
          title: t('❄️ حدوث التجمد والتصلب (Solidification)!', '❄️ Freezing & Solidification!'),
          description: t(
            `انخفضت الحرارة دون نقطة الانصهار (${phaseInfo.effectiveTm.toFixed(1)} K). ترابطت الجسيمات في بنية بلورية منتظمة وثابتة.`,
            `Temperature dropped below melting point (${phaseInfo.effectiveTm.toFixed(1)} K). Particles locked into crystalline lattice.`
          ),
          type: 'freezing'
        });
      }

      const timer = setTimeout(() => {
        setTransitionNotification(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [phaseInfo.phase, substance, pressureAtm, volumeLidPercent, lang]);

  // Initialize or update particles
  const initParticles = useCallback((count = particleCount) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    const left = 24;
    const right = w - 24;
    const bottom = h - 18;

    let pRadius = 7.5;
    if (substance.id === 'argon') pRadius = 9.5;
    if (substance.id === 'helium') pRadius = 5.5;
    if (substance.id === 'mercury') pRadius = 8.5;
    if (substance.id === 'iron') pRadius = 8.0;
    if (substance.id === 'gold') pRadius = 8.5;
    if (substance.id === 'bromine') pRadius = 8.0;

    const currentP = phaseInfo.phase;
    const particles: Particle[] = [];
    const cols = Math.ceil(Math.sqrt(count * 1.3));
    const rows = Math.ceil(count / cols);

    const lidY = 40 + ((100 - volumeLidPercent) * (h - 100)) / 100;

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      let px: number;
      let py: number;

      if (currentP === 'solid') {
        const spacing = pRadius * 2.4;
        px = w / 2 - (cols * spacing) / 2 + col * spacing + spacing / 2;
        py = bottom - rows * spacing + row * spacing + spacing / 2;
      } else if (currentP === 'liquid' || currentP === 'melting') {
        if (gravityValue === 0) {
          // Zero-G: cluster in the middle as a floating droplet
          const rDrop = Math.sqrt(Math.random()) * 42;
          const thDrop = Math.random() * Math.PI * 2;
          px = w / 2 + Math.cos(thDrop) * rDrop;
          py = (bottom + lidY) / 2 + Math.sin(thDrop) * rDrop;
        } else {
          // Settled on floor
          const spacing = pRadius * 2.5;
          px = w / 2 - (cols * spacing) / 2 + col * spacing + (Math.random() - 0.5) * 6;
          py = bottom - rows * (spacing * 0.9) + row * (spacing * 0.9) + (Math.random() - 0.5) * 6;
        }
      } else {
        // Gas: uniformly distributed
        px = left + pRadius + Math.random() * (right - left - pRadius * 2);
        py = lidY + pRadius + Math.random() * (bottom - lidY - pRadius * 2);
      }

      particles.push({
        x: Math.max(left + pRadius, Math.min(right - pRadius, px)),
        y: Math.max(lidY + pRadius, Math.min(bottom - pRadius, py)),
        vx: (Math.random() - 0.5) * (Math.sqrt(targetTemp) * 0.18),
        vy: (Math.random() - 0.5) * (Math.sqrt(targetTemp) * 0.18),
        radius: pRadius,
        targetX: px,
        targetY: py,
        angle: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        mass: substance.mass
      });
    }

    particlesRef.current = particles;
  }, [substance, targetTemp, phaseInfo.phase, volumeLidPercent, gravityValue, particleCount]);

  // Re-init particles on substance switch or particle count change
  useEffect(() => {
    setTargetTemp(substance.defaultTempK);
    setActualTemp(substance.defaultTempK);
    initParticles(particleCount);
  }, [substanceId, particleCount]);

  // UNRESTRICTED BURNER: Heating goes all the way up to maxScaleK (up to 4400K+ for Iron and Gold!)
  const startBurner = (type: 'heat' | 'cool') => {
    setBurnerActive(type);
    if (burnerIntervalRef.current) clearInterval(burnerIntervalRef.current);

    // Dynamic fast step so heating iron/gold to 3500K+ is smooth and responsive
    const heatStep = Math.max(12, Math.round(maxScaleK / 100));

    burnerIntervalRef.current = window.setInterval(() => {
      setTargetTemp(prev => {
        if (type === 'heat') {
          return Math.min(maxScaleK, prev + heatStep);
        } else {
          return Math.max(2, prev - heatStep);
        }
      });
    }, 40);
  };

  const stopBurner = () => {
    if (burnerIntervalRef.current) {
      clearInterval(burnerIntervalRef.current);
      burnerIntervalRef.current = null;
    }
    setBurnerActive(null);
  };

  // Pressure Release Valve Venting
  const triggerVent = () => {
    setIsVenting(true);
    setTargetTemp(t => Math.max(5, t - 15));
    for (let i = 0; i < 20; i++) {
      steamJetsRef.current.push({
        x: 40 + Math.random() * 10,
        y: 45,
        vx: (Math.random() - 0.5) * 3,
        vy: -2 - Math.random() * 4,
        life: 1.0
      });
    }
    setTimeout(() => setIsVenting(false), 900);
  };

  // Add / remove particles
  const changeParticleCount = (delta: number) => {
    setParticleCount(prev => {
      const next = Math.max(15, Math.min(80, prev + delta));
      return next;
    });
  };

  // Main Canvas Physics Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (particlesRef.current.length === 0) {
      initParticles();
    }

    let isRunning = true;
    let animId: number;

    const render = () => {
      if (!isRunning) return;

      const w = canvas.width;
      const h = canvas.height;
      const leftWall = 22;
      const rightWall = w - 22;
      const bottomWall = h - 20;

      // Lid Y based on volume slider (Volume: 20% to 100%)
      const lidY = 40 + ((100 - volumeLidPercent) * (h - 100)) / 100;
      const pistonSpeed = lidY - prevPistonYRef.current;
      prevPistonYRef.current = lidY;

      ctx.clearRect(0, 0, w, h);

      // Background container vessel
      ctx.fillStyle = theme === 'dark' ? 'rgba(10, 15, 29, 0.96)' : 'rgba(241, 245, 249, 0.96)';
      ctx.fillRect(leftWall, lidY, rightWall - leftWall, bottomWall - lidY);

      // Thermal heat / ice background glow
      if (burnerActive === 'heat') {
        const heatGrad = ctx.createLinearGradient(0, bottomWall, 0, bottomWall - 80);
        heatGrad.addColorStop(0, 'rgba(234, 88, 12, 0.45)');
        heatGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = heatGrad;
        ctx.fillRect(leftWall, bottomWall - 80, rightWall - leftWall, 80);
      } else if (burnerActive === 'cool') {
        const coolGrad = ctx.createLinearGradient(0, bottomWall, 0, bottomWall - 80);
        coolGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
        coolGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = coolGrad;
        ctx.fillRect(leftWall, bottomWall - 80, rightWall - leftWall, 80);
      }

      // Container border walls
      ctx.beginPath();
      ctx.strokeStyle = pressureAtm > 4.5 ? '#f43f5e' : theme === 'dark' ? '#334155' : '#94a3b8';
      ctx.lineWidth = pressureAtm > 4.5 ? 5 : 4;
      ctx.moveTo(leftWall, lidY);
      ctx.lineTo(leftWall, bottomWall);
      ctx.lineTo(rightWall, bottomWall);
      ctx.lineTo(rightWall, lidY);
      ctx.stroke();

      // Movable Piston / Lid
      ctx.fillStyle = theme === 'dark' ? '#1e293b' : '#cbd5e1';
      ctx.fillRect(leftWall - 4, lidY - 14, rightWall - leftWall + 8, 14);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(leftWall - 4, lidY - 14, rightWall - leftWall + 8, 14);

      // Piston rod & handle
      ctx.fillStyle = theme === 'dark' ? '#475569' : '#94a3b8';
      ctx.fillRect(w / 2 - 12, 8, 24, lidY - 22);

      // Handle grip
      ctx.fillStyle = theme === 'dark' ? '#334155' : '#64748b';
      ctx.fillRect(w / 2 - 32, 6, 64, 8);
      ctx.strokeStyle = '#06b6d4';
      ctx.strokeRect(w / 2 - 32, 6, 64, 8);

      // Safety Release Valve on Lid
      ctx.fillStyle = isVenting ? '#ef4444' : '#64748b';
      ctx.fillRect(leftWall + 20, lidY - 22, 14, 10);
      if (isVenting) {
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(leftWall + 27, lidY - 24, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Steam Jet Particles when venting
      for (let i = steamJetsRef.current.length - 1; i >= 0; i--) {
        const sj = steamJetsRef.current[i];
        sj.x += sj.vx;
        sj.y += sj.vy;
        sj.life -= 0.04;
        ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0, sj.life * 0.7)})`;
        ctx.beginPath();
        ctx.arc(sj.x, sj.y, (1 - sj.life) * 8 + 3, 0, Math.PI * 2);
        ctx.fill();
        if (sj.life <= 0) steamJetsRef.current.splice(i, 1);
      }

      // Kinetic Temperature scaling
      const particles = particlesRef.current;
      const n = particles.length;

      let totalKE = 0;
      particles.forEach(p => {
        totalKE += 0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy);
      });
      const avgKE = n > 0 ? totalKE / n : 0.001;
      const desiredKE = targetTemp * 0.045;

      const scale = Math.sqrt(desiredKE / (avgKE + 0.001));
      const velocityScale = Math.max(0.7, Math.min(1.3, scale));

      // Gradual convergence of actualTemp towards targetTemp
      setActualTemp(prev => {
        const diff = targetTemp - prev;
        if (Math.abs(diff) < 0.4) return targetTemp;
        return prev + diff * 0.08;
      });

      // Calculate Center of Mass for Zero-G cohesion
      let comX = 0;
      let comY = 0;
      if (n > 0) {
        particles.forEach(p => {
          comX += p.x;
          comY += p.y;
        });
        comX /= n;
        comY /= n;
      }

      // Particle physics update
      const currentP = phaseInfo.phase;
      const gEffect = gravityValue * 0.12;

      particles.forEach(p => {
        // Temperature velocity regulation
        if (targetTemp > 0) {
          p.vx *= 1 + (velocityScale - 1) * 0.1;
          p.vy *= 1 + (velocityScale - 1) * 0.1;
        }

        // REAL GRAVITY & PHASE PHYSICS
        if (currentP === 'solid') {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.vx += dx * 0.09;
          p.vy += dy * 0.09;

          const noise = Math.sqrt(actualTemp) * 0.08;
          p.vx += (Math.random() - 0.5) * noise;
          p.vy += (Math.random() - 0.5) * noise;

          p.vx *= 0.72;
          p.vy *= 0.72;
        } else if (currentP === 'melting') {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.vx += dx * 0.025;
          p.vy += dy * 0.025;

          p.vy += gEffect;
          p.vx *= 0.88;
          p.vy *= 0.88;
        } else if (currentP === 'liquid') {
          if (gravityValue > 0) {
            p.vy += gEffect;
            particles.forEach(other => {
              if (other === p) return;
              const dx = other.x - p.x;
              const dy = other.y - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0 && dist < 38) {
                p.vx += (dx / dist) * 0.035;
                p.vy += (dy / dist) * 0.035;
              }
            });
          } else {
            // ZERO-G EFFECT: Surface tension pulls particles into a floating sphere
            const dx = comX - p.x;
            const dy = comY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 15) {
              p.vx += (dx / dist) * 0.045;
              p.vy += (dy / dist) * 0.045;
            }
          }

          p.vx *= 0.97;
          p.vy *= 0.97;
        } else if (currentP === 'boiling') {
          p.vy += gEffect * 0.35;
          p.vy -= 0.12;
        } else {
          if (gravityValue > 0) {
            p.vy += gEffect * 0.04;
          }
        }

        p.angle += p.vRot;
        p.x += p.vx;
        p.y += p.vy;

        // Wall collisions
        const r = p.radius;
        const bounce = currentP === 'gas' ? 0.98 : 0.55;

        if (p.x < leftWall + r) {
          p.x = leftWall + r;
          momentumExchangeRef.current += Math.abs(p.vx * 2);
          p.vx = -p.vx * bounce;
        }
        if (p.x > rightWall - r) {
          p.x = rightWall - r;
          momentumExchangeRef.current += Math.abs(p.vx * 2);
          p.vx = -p.vx * bounce;
        }
        if (p.y > bottomWall - r) {
          p.y = bottomWall - r;
          momentumExchangeRef.current += Math.abs(p.vy * 2);
          p.vy = -p.vy * bounce;
        }
        if (p.y < lidY + r) {
          p.y = lidY + r;
          momentumExchangeRef.current += Math.abs((p.vy - pistonSpeed) * 2);
          p.vy = -p.vy * bounce + pistonSpeed * 0.8;
          if (Math.abs(pistonSpeed) > 0.5 && currentP === 'gas') {
            setTargetTemp(t => Math.min(maxScaleK, Math.max(10, Math.round(t - pistonSpeed * 0.35))));
          }
        }
      });

      // Elastic circle-to-circle collisions
      for (let i = 0; i < n; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < n; j++) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = p1.radius + p2.radius;

          if (dist < minDist) {
            if (dist === 0) dist = 0.1;
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            p1.x -= nx * overlap * 0.5;
            p1.y -= ny * overlap * 0.5;
            p2.x += nx * overlap * 0.5;
            p2.y += ny * overlap * 0.5;

            const kx = p1.vx - p2.vx;
            const ky = p1.vy - p2.vy;
            const impulse = nx * kx + ny * ky;

            p1.vx -= impulse * nx;
            p1.vy -= impulse * ny;
            p2.vx += impulse * nx;
            p2.vy += impulse * ny;
          }
        }
      }

      // Pressure calculation
      const vesselHeight = bottomWall - lidY;
      const vesselArea = (rightWall - leftWall) * vesselHeight;
      const kineticP = (momentumExchangeRef.current / (vesselArea + 1)) * 11000;
      momentumExchangeRef.current = 0;

      rollingPressureRef.current.push(kineticP);
      if (rollingPressureRef.current.length > 20) {
        const avgKinetic =
          rollingPressureRef.current.reduce((a, b) => a + b, 0) /
          rollingPressureRef.current.length;
        rollingPressureRef.current = [];

        const volFraction = vesselHeight / (bottomWall - 40);
        let baseP = (n * (actualTemp / 300)) / (volFraction * 45);

        if (currentP === 'solid') baseP *= 0.15;
        if (currentP === 'liquid') baseP *= 0.45;

        const calculatedAtm = Math.max(0.08, parseFloat((baseP * 0.7 + avgKinetic * 0.3).toFixed(2)));
        setPressureAtm(calculatedAtm);

        if (calculatedAtm > 7.5 && !isVenting) {
          triggerVent();
        }
      }

      // RENDER MOLECULES & ATOMS (Supporting all 12 substances including Gold and Bromine!)
      particles.forEach(p => {
        const rx = p.x;
        const ry = p.y;
        const theta = p.angle;

        if (substance.particleType === 'water') {
          const hOffset = 6.5;
          const hRadius = 3.2;
          const hAngle1 = theta + ((104.5 * Math.PI) / 180) / 2;
          const hAngle2 = theta - ((104.5 * Math.PI) / 180) / 2;

          const hx1 = rx + Math.cos(hAngle1) * hOffset;
          const hy1 = ry + Math.sin(hAngle1) * hOffset;
          const hx2 = rx + Math.cos(hAngle2) * hOffset;
          const hy2 = ry + Math.sin(hAngle2) * hOffset;

          ctx.beginPath();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.6;
          ctx.moveTo(rx, ry); ctx.lineTo(hx1, hy1);
          ctx.moveTo(rx, ry); ctx.lineTo(hx2, hy2);
          ctx.stroke();

          [ {x: hx1, y: hy1}, {x: hx2, y: hy2} ].forEach(hPos => {
            ctx.beginPath();
            ctx.arc(hPos.x, hPos.y, hRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#f8fafc';
            ctx.fill();
          });

          const oGrad = ctx.createRadialGradient(rx - 2, ry - 2, 1, rx, ry, 6);
          oGrad.addColorStop(0, '#fca5a5');
          oGrad.addColorStop(0.4, '#ef4444');
          oGrad.addColorStop(1, '#991b1b');
          ctx.beginPath();
          ctx.arc(rx, ry, 6, 0, Math.PI * 2);
          ctx.fillStyle = oGrad;
          ctx.fill();
        } else if (substance.particleType === 'co2') {
          const offsetDist = 6.5;
          const ox1 = rx + Math.cos(theta) * offsetDist;
          const oy1 = ry + Math.sin(theta) * offsetDist;
          const ox2 = rx - Math.cos(theta) * offsetDist;
          const oy2 = ry - Math.sin(theta) * offsetDist;

          ctx.beginPath();
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2.4;
          ctx.moveTo(ox1, oy1); ctx.lineTo(ox2, oy2);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#475569';
          ctx.fill();

          [ {x: ox1, y: oy1}, {x: ox2, y: oy2} ].forEach(pos => {
            const grad = ctx.createRadialGradient(pos.x - 1, pos.y - 1, 1, pos.x, pos.y, 4.5);
            grad.addColorStop(0, '#fca5a5');
            grad.addColorStop(0.5, '#ef4444');
            grad.addColorStop(1, '#7f1d1d');
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          });
        } else if (substance.particleType === 'methane') {
          const hDist = 6.5;
          for (let k = 0; k < 4; k++) {
            const hAng = theta + (k * Math.PI) / 2;
            const hx = rx + Math.cos(hAng) * hDist;
            const hy = ry + Math.sin(hAng) * hDist;

            ctx.beginPath();
            ctx.strokeStyle = '#5eead4';
            ctx.lineWidth = 1.2;
            ctx.moveTo(rx, ry); ctx.lineTo(hx, hy);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#f8fafc';
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(rx, ry, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#0d9488';
          ctx.fill();
        } else if (substance.particleType === 'diatomic') {
          // O2, N2, or Bromine (Br2)
          const offsetDist = 5.5;
          const subX1 = rx + Math.cos(theta) * offsetDist;
          const subY1 = ry + Math.sin(theta) * offsetDist;
          const subX2 = rx - Math.cos(theta) * offsetDist;
          const subY2 = ry - Math.sin(theta) * offsetDist;

          ctx.beginPath();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2.5;
          ctx.moveTo(subX1, subY1); ctx.lineTo(subX2, subY2);
          ctx.stroke();

          const color = substance.color;
          [ {x: subX1, y: subY1}, {x: subX2, y: subY2} ].forEach(pos => {
            const grad = ctx.createRadialGradient(pos.x - 2, pos.y - 2, 1, pos.x, pos.y, 5.5);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, color);
            grad.addColorStop(1, '#0f172a');
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 5.5, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          });
        } else if (substance.particleType === 'metallic') {
          // Mercury, Iron, or Gold (Au)
          const grad = ctx.createRadialGradient(rx - 3, ry - 3, 1, rx, ry, p.radius);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.35, substance.color);
          grad.addColorStop(0.8, '#475569');
          grad.addColorStop(1, '#0f172a');

          ctx.beginPath();
          ctx.arc(rx, ry, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = substance.id === 'gold' ? '#fde047' : '#94a3b8';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Monatomic Noble Gas (He, Ne, Ar)
          const color = substance.color;
          const grad = ctx.createRadialGradient(rx - 2, ry - 2, 1, rx, ry, p.radius);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.35, color);
          grad.addColorStop(1, '#090d16');

          ctx.beginPath();
          ctx.arc(rx, ry, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.shadowColor = color;
          ctx.shadowBlur = actualTemp > 200 ? 5 : 2;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
    };
  }, [substance, targetTemp, gravityValue, volumeLidPercent, phaseInfo.phase, burnerActive, isVenting, theme]);

  // Jump to specific state presets
  const jumpToPhase = (phase: 'solid' | 'liquid' | 'gas') => {
    let tVal: number;
    const Tm = phaseInfo.effectiveTm;
    const Tb = phaseInfo.effectiveTb;

    if (phase === 'solid') {
      tVal = Math.max(5, Tm - 35);
    } else if (phase === 'liquid') {
      tVal = (Tm + Tb) / 2;
    } else {
      tVal = Math.min(maxScaleK - 20, Tb + 45);
    }
    setTargetTemp(Math.round(tVal));
  };

  // Interactive Click on the Temperature Ruler
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTemp = Math.round(ratio * maxScaleK);
    setTargetTemp(Math.max(5, newTemp));
  };

  // Dragging the Piston on Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const h = canvas.height;
    const currentLidY = 40 + ((100 - volumeLidPercent) * (h - 100)) / 100;

    if (Math.abs(clickY - currentLidY) < 30 || clickY < currentLidY) {
      setIsDraggingPiston(true);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingPiston) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currentY = e.clientY - rect.top;
    const h = canvas.height;

    const clampedY = Math.max(40, Math.min(h - 60, currentY));
    const newVol = Math.round(100 - ((clampedY - 40) / (h - 100)) * 100);
    applyAdiabaticVolumeChange(Math.max(25, Math.min(100, newVol)));
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingPiston(false);
  };

  // Touch handlers for mobile devices
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const clickY = touch.clientY - rect.top;
    const h = canvas.height;
    const scaleY = h / rect.height;
    const internalY = clickY * scaleY;
    const currentLidY = 40 + ((100 - volumeLidPercent) * (h - 100)) / 100;

    if (Math.abs(internalY - currentLidY) < 50 || internalY < currentLidY) {
      setIsDraggingPiston(true);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingPiston) return;
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const currentY = touch.clientY - rect.top;
    const h = canvas.height;
    const scaleY = h / rect.height;
    const internalY = currentY * scaleY;

    const clampedY = Math.max(40, Math.min(h - 60, internalY));
    const newVol = Math.round(100 - ((clampedY - 40) / (h - 100)) * 100);
    applyAdiabaticVolumeChange(Math.max(25, Math.min(100, newVol)));
  };

  const handleCanvasTouchEnd = () => {
    setIsDraggingPiston(false);
  };

  const runExperiment = (exp: 'space_drop' | 'pressure_cooker' | 'co2_sublime' | 'mercury_liquid' | 'gold_melt' | 'bromine_vapor') => {
    if (exp === 'space_drop') {
      setSubstanceId('water');
      setTargetTemp(295);
      setActualTemp(295);
      setVolumeLidPercent(75);
      handleSetGravityPreset('zero');
      setTransitionNotification({
        title: t('🚀 تجربة قطرة الماء في الفضاء (Zero-G)', '🚀 Zero-G Water Drop Experiment'),
        description: t(
          'في غياب الجاذبية الأرضية، تتغلب قوى التوتر السطحي لتجعل الماء السائل يتجمع في كرة مائية طافية بمنتصف الوعاء تماماً كما في محطة الفضاء الدولية!',
          'In microgravity, surface tension forces water into a floating spherical droplet at the vessel center!'
        ),
        type: 'melting'
      });
    } else if (exp === 'pressure_cooker') {
      setSubstanceId('water');
      setTargetTemp(380);
      setActualTemp(380);
      setVolumeLidPercent(26);
      handleSetGravityPreset('earth');
      setTransitionNotification({
        title: t('🍲 تجربة قدر الضغط وتسييل الغاز (Pressure Liquefaction)', '🍲 Pressure Liquefaction Experiment'),
        description: t(
          'أدى كبس المكبس ورفع الضغط لأكثر من 3 Atm إلى رفع درجة الغليان الفعالة وتكثيف البخار إلى سائل مائع دون الحاجة لتبريد!',
          'Compressing the piston raised pressure above 3 Atm, elevating boiling point and condensing steam into liquid!'
        ),
        type: 'pressure_liquefaction'
      });
    } else if (exp === 'co2_sublime') {
      setSubstanceId('co2');
      setTargetTemp(198);
      setActualTemp(198);
      setVolumeLidPercent(80);
      handleSetGravityPreset('earth');
      setTransitionNotification({
        title: t('❄️ تجربة تسامي الجليد الجاف (CO₂ Sublimation)', '❄️ Dry Ice Sublimation Experiment'),
        description: t(
          'شاهد كيف يتحول ثاني أكسيد الكربون مباشرة من بلورات صلبة إلى غاز طائر دون المرور بالحالة السائلة لأن الضغط أقل من 5.1 ض.ج!',
          'CO₂ sublimates directly from solid to gas without liquid phase because pressure is below 5.1 atm!'
        ),
        type: 'sublimation'
      });
    } else if (exp === 'mercury_liquid') {
      setSubstanceId('mercury');
      setTargetTemp(298);
      setActualTemp(298);
      setVolumeLidPercent(75);
      handleSetGravityPreset('earth');
      setTransitionNotification({
        title: t('🧪 تجربة الزئبق: المعدن السائل الوحيد', '🧪 Liquid Metal Experiment (Mercury)'),
        description: t(
          'المعدن الوحيد السائل في حرارة الغرفة، يتميز بكثافة وتوتر سطحي ولمعان معدني هائل وتماسك جزيئي قوي.',
          'The only metal liquid at room temperature, featuring extreme density and metallic cohesion.'
        ),
        type: 'melting'
      });
    } else if (exp === 'gold_melt') {
      setSubstanceId('gold');
      setTargetTemp(1350);
      setActualTemp(1350);
      setVolumeLidPercent(75);
      handleSetGravityPreset('earth');
      setTransitionNotification({
        title: t('✨ تجربة صهر الذهب النبيل (1337 K)', '✨ Noble Gold Melting Experiment (1337 K)'),
        description: t(
          'شاهد انصهار فلز الذهب النبيل فائق الكثافة عند 1337 K (1064 °C) ليتحول لسائل ذهبي براق.',
          'Watch dense gold melt at 1337 K into a glowing liquid metallic pool.'
        ),
        type: 'melting'
      });
    } else if (exp === 'bromine_vapor') {
      setSubstanceId('bromine');
      setTargetTemp(345);
      setActualTemp(345);
      setVolumeLidPercent(80);
      handleSetGravityPreset('earth');
      setTransitionNotification({
        title: t('💨 تجربة تبخير البروم (اللافلز السائل الوحيد)', '💨 Bromine Evaporation Experiment'),
        description: t(
          'يغلي سائل البروم الأحمر الداكن عند 58.8 °C (332 K) فقط ليتطاير كبخار هالوجيني كثيف.',
          'Dark red bromine liquid boils at only 58.8 °C (332 K) into a dense halogen vapor.'
        ),
        type: 'boiling'
      });
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      {/* Live Phase Transition Alert Banner */}
      {transitionNotification && (
        <div className="bg-gradient-to-l from-cyan-950 via-slate-900 to-slate-950 border-2 border-cyan-500 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 text-2xl shrink-0">
              {transitionNotification.type === 'melting' && '🔥'}
              {transitionNotification.type === 'boiling' && '💨'}
              {transitionNotification.type === 'condensation' && '💧'}
              {transitionNotification.type === 'freezing' && '❄️'}
              {transitionNotification.type === 'sublimation' && '✨'}
              {transitionNotification.type === 'pressure_liquefaction' && '⚡'}
            </div>
            <div>
              <h4 className="text-base font-black text-cyan-300 flex items-center gap-2">
                <span>{transitionNotification.title}</span>
                <span className="text-xs font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 text-white">
                  T = {actualTemp.toFixed(1)} K · P = {pressureAtm.toFixed(2)} Atm
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {transitionNotification.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => setTransitionNotification(null)}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            {t('إغلاق', 'Close')}
          </button>
        </div>
      )}

      {/* Interactive Guided Quick Experiments Bar */}
      <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className={`flex items-center gap-2 text-xs font-bold shrink-0 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{t('تجارب فيزيائية سريعة التطبيق:', 'Quick Physical Experiments:')}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold no-scrollbar flex-1">
          <button
            onClick={() => runExperiment('space_drop')}
            className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-600/50 text-purple-200 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>🚀</span>
            <span>{t('كرة الماء بالفضاء', 'Zero-G Water Drop')}</span>
          </button>

          <button
            onClick={() => runExperiment('pressure_cooker')}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-600/50 text-cyan-200 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>🍲</span>
            <span>{t('قدر الضغط والتسييل', 'Pressure Cooker')}</span>
          </button>

          <button
            onClick={() => runExperiment('co2_sublime')}
            className="px-3 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/50 text-amber-200 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>❄️</span>
            <span>{t('تسامي الجليد الجاف', 'CO₂ Sublimation')}</span>
          </button>

          <button
            onClick={() => runExperiment('gold_melt')}
            className="px-3 py-1.5 rounded-xl bg-yellow-950/70 hover:bg-yellow-900/80 border border-yellow-600/50 text-yellow-200 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>✨</span>
            <span>{t('صهر الذهب (1337 K)', 'Melt Gold (1337 K)')}</span>
          </button>

          <button
            onClick={() => runExperiment('bromine_vapor')}
            className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-600/50 text-rose-200 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>💨</span>
            <span>{t('تبخير البروم السائل', 'Boil Bromine')}</span>
          </button>

          <button
            onClick={() => runExperiment('mercury_liquid')}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-slate-200 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>🧪</span>
            <span>{t('الزئبق السائل', 'Liquid Mercury')}</span>
          </button>
        </div>

        {onOpenGuide && (
          <button
            onClick={() => onOpenGuide('states')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-orange-400" />
            <span>{t('شرح الحالات والتجارب', 'Guide & Concepts')}</span>
          </button>
        )}
      </div>

      <div className="w-full flex flex-col md:flex-row gap-5 items-start overflow-x-hidden">
        {/* Left Column: Substance Selection & Physics Controls */}
        <div className="w-full md:w-[320px] lg:w-[360px] shrink-0 flex flex-col gap-4 order-2 md:order-1">
          {/* Substance Selector Card (Expanded to 12 substances including Gold & Bromine!) */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`font-bold text-base pb-2 border-b flex items-center justify-between ${
              isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'
            }`}>
              <span>{t('المادة الكيميائية (12 عنصراً ومركباً)', 'Chemical Substance (12 Models)')}</span>
              <span className="text-xs font-mono text-cyan-400 font-bold">{substance.formula}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(SUBSTANCES).map(sub => {
                const isSelected = sub.id === substanceId;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSubstanceId(sub.id)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-sm shadow-cyan-500/30 ring-1 ring-cyan-400'
                        : isDark
                        ? 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold">{t(sub.name, sub.nameEn)}</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">({sub.formula})</span>
                  </button>
                );
              })}
            </div>

            {/* Substance Thermal & Physical Constants */}
            <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
              isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center text-slate-400">
                <span>{t('نقطة الانصهار القياسية (Tₘ):', 'Melting Point (Tₘ):')}</span>
                <span className="font-mono font-bold text-blue-400">
                  {substance.meltingPointK.toFixed(1)} K ({(substance.meltingPointK - 273.15).toFixed(1)} °C)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>{t('نقطة الغليان القياسية (T_b):', 'Boiling Point (T_b):')}</span>
                <span className="font-mono font-bold text-orange-400">
                  {substance.boilingPointK.toFixed(1)} K ({(substance.boilingPointK - 273.15).toFixed(1)} °C)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
                <span>{t('الكتلة الجزيئية (Mass):', 'Molecular Mass:')}</span>
                <span className="font-mono text-cyan-300">{substance.mass.toFixed(2)} u</span>
              </div>
            </div>
            <p className={`text-[11px] leading-relaxed p-2.5 rounded-lg border ${
              isDark ? 'text-slate-400 bg-slate-950/40 border-slate-800/40' : 'text-slate-600 bg-slate-50 border-slate-200'
            }`}>
              {t(substance.desc, substance.descEn)}
            </p>
          </div>

          {/* REAL GRAVITY CONTROLS CARD */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`font-bold text-base pb-2 border-b flex items-center justify-between ${
              isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'
            }`}>
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>{t('حقل الجاذبية الأرضية والكونية', 'Gravitational Field')}</span>
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">{gravityValue.toFixed(2)} g</span>
            </h3>

            {/* Gravity Planetary Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                onClick={() => handleSetGravityPreset('earth')}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  gravityPreset === 'earth'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                    : isDark ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span className="text-sm">🌍</span>
                <span className="text-[11px]">{t('الأرض (1.0g)', 'Earth (1.0g)')}</span>
              </button>

              <button
                onClick={() => handleSetGravityPreset('moon')}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  gravityPreset === 'moon'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                    : isDark ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span className="text-sm">🌕</span>
                <span className="text-[11px]">{t('القمر (0.16g)', 'Moon (0.16g)')}</span>
              </button>

              <button
                onClick={() => handleSetGravityPreset('jupiter')}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  gravityPreset === 'jupiter'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                    : isDark ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span className="text-sm">🪐</span>
                <span className="text-[11px]">{t('المشتري (2.5g)', 'Jupiter (2.5g)')}</span>
              </button>

              <button
                onClick={() => handleSetGravityPreset('zero')}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  gravityPreset === 'zero'
                    ? 'bg-purple-950 border-purple-500 text-purple-300 font-bold shadow-sm ring-1 ring-purple-400'
                    : isDark ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span className="text-sm">🚀</span>
                <span className="text-[11px]">{t('انعدام وزن', 'Zero-G')}</span>
              </button>
            </div>

            {/* Continuous Gravity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">{t('تسارع الجاذبية المستمر (g):', 'Continuous Gravity (g):')}</span>
                <span className="font-mono text-cyan-300 font-bold">{(gravityValue * 9.8).toFixed(1)} m/s²</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                value={Math.round(gravityValue * 100)}
                onChange={(e) => {
                  setGravityValue(parseInt(e.target.value) / 100);
                  setGravityPreset('earth');
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.0 g</span>
                <span>1.0 g</span>
                <span>3.0 g</span>
              </div>
            </div>
          </div>

          {/* Particle Pump & Injection Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`font-bold text-base pb-2 border-b flex items-center justify-between ${
              isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'
            }`}>
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{t('مضخة الذرات وكثافة المادة', 'Particle Pump & Density')}</span>
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">{particleCount} {t('جزيء', 'particles')}</span>
            </h3>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => changeParticleCount(-10)}
                disabled={particleCount <= 15}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>{t('تفريغ جزيئات', 'Remove Particles')}</span>
              </button>

              <button
                onClick={() => changeParticleCount(10)}
                disabled={particleCount >= 80}
                className="flex-1 py-2 px-3 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-cyan-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('ضخ جزيئات إضافية', 'Inject Particles')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Simulation Stage & Thermal Controls */}
        <div className="w-full flex-1 min-w-0 flex flex-col lg:flex-row gap-5 order-1 md:order-2">
          {/* Middle Column: Physical Simulation Vessel & Correct Phase Gauge */}
          <div className="w-full lg:flex-1 flex flex-col items-center gap-4">
          <div className={`w-full p-4 rounded-2xl border shadow-lg flex flex-col items-center ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {/* Top State Badge & Manometer */}
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">{t('الحالة:', 'Phase:')}</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${phaseInfo.badgeClass}`}>
                  {phaseInfo.phaseName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${pressureAtm > 4.5 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-950 text-cyan-400 border border-slate-800'}`}>
                  P = {pressureAtm.toFixed(2)} Atm
                </span>
                <button
                  onClick={triggerVent}
                  title="صمام تفريغ الأمان لتخفيف الضغط"
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 font-bold flex items-center gap-1"
                >
                  <Wind className="w-3 h-3 text-cyan-400" />
                  <span>{t('تفريغ', 'Vent')}</span>
                </button>
              </div>
            </div>

            {/* Interactive Canvas Stage */}
            <div className="relative w-full aspect-[4/3] max-w-[460px] bg-slate-950 border-2 border-slate-700/60 rounded-xl overflow-hidden shadow-2xl">
              <canvas
                ref={canvasRef}
                width={460}
                height={345}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onTouchStart={handleCanvasTouchStart}
                onTouchMove={handleCanvasTouchMove}
                onTouchEnd={handleCanvasTouchEnd}
                className="w-full h-full relative z-10 cursor-ns-resize touch-none select-none"
              />
              <div className="absolute top-2 left-2 z-20 pointer-events-none text-[10px] text-slate-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 flex items-center gap-1">
                <span>↕</span>
                <span>{t('اسحب المكبس باللمس أو الماوس', 'Drag piston by touch or mouse')}</span>
              </div>
            </div>

            {/* Direct Piston Controls (For Mobile & Precision) */}
            <div className={`w-full mt-3 p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">{t('المكبس والحجم:', 'Piston & Volume:')}</span>
                <span className="text-xs font-mono font-black text-cyan-400">{volumeLidPercent}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => applyAdiabaticVolumeChange(Math.max(25, volumeLidPercent - 15))}
                  disabled={volumeLidPercent <= 25}
                  className="px-2.5 py-1 rounded-lg bg-orange-950/80 hover:bg-orange-900/80 border border-orange-700/60 text-orange-200 text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-1 shadow-xs active:scale-95"
                  title={t('كبس المكبس للأسفل (رفع الضغط)', 'Compress Piston Down (Raise Pressure)')}
                >
                  <span>⬇</span>
                  <span className="text-[11px]">{t('كبس المكبس', 'Compress')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyAdiabaticVolumeChange(Math.min(100, volumeLidPercent + 15))}
                  disabled={volumeLidPercent >= 100}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-700/60 text-cyan-200 text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-1 shadow-xs active:scale-95"
                  title={t('رفع المكبس للأعلى (تخفيف الضغط)', 'Raise Piston Up (Reduce Pressure)')}
                >
                  <span>⬆</span>
                  <span className="text-[11px]">{t('رفع المكبس', 'Expand')}</span>
                </button>
              </div>
            </div>

            {/* Quick State Presets */}
            <div className="w-full grid grid-cols-3 gap-2 mt-4">
              <button
                onClick={() => jumpToPhase('solid')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  phaseInfo.phase === 'solid'
                    ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-md ring-1 ring-blue-400'
                    : isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {t('🧊 صلب (بلوري)', '🧊 Solid (Crystal)')}
              </button>
              <button
                onClick={() => jumpToPhase('liquid')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  phaseInfo.phase === 'liquid'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-400'
                    : isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {t('💧 سائل (مائع)', '💧 Liquid (Fluid)')}
              </button>
              <button
                onClick={() => jumpToPhase('gas')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  phaseInfo.phase === 'gas'
                    ? 'bg-orange-950/80 border-orange-500 text-orange-300 shadow-md ring-1 ring-orange-400'
                    : isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {t('💨 غاز (حر التمدد)', '💨 Gas (Vapor)')}
              </button>
            </div>
          </div>

          {/* TEMPERATURE PHASE DIAGRAM RULER (ALIGNED!) */}
          <div className={`w-full p-4 rounded-2xl border shadow-lg space-y-2.5 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('مقياس أطوار المادة (انقر لتحديد الحرارة):', 'Phase Diagram Scale (Click to set):')}</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{actualTemp.toFixed(1)} K</span>
            </div>

            {/* Visual Ruler Bar: Always LTR so 0 K is Left and High Temp is Right */}
            <div
              dir="ltr"
              onClick={handleRulerClick}
              className="relative h-8 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center text-[11px] font-bold text-center cursor-pointer select-none"
            >
              {/* Solid Zone (0 K to Tm) */}
              <div
                style={{
                  width: `${Math.min(50, Math.max(12, (phaseInfo.effectiveTm / maxScaleK) * 100))}%`
                }}
                className="h-full bg-blue-950/70 text-blue-300 flex items-center justify-center border-r border-blue-500/50 truncate px-1 transition-all"
              >
                <span>{t('صلب 🧊', 'Solid 🧊')}</span>
              </div>

              {/* Liquid Zone (Tm to Tb) */}
              <div
                style={{
                  width: `${Math.max(14, ((phaseInfo.effectiveTb - phaseInfo.effectiveTm) / maxScaleK) * 100)}%`
                }}
                className="h-full bg-cyan-950/70 text-cyan-200 flex items-center justify-center border-r border-cyan-500/50 truncate px-1 transition-all"
              >
                <span>{t('سائل 💧', 'Liquid 💧')}</span>
              </div>

              {/* Gas Zone (Tb to MaxScale) */}
              <div className="flex-1 h-full bg-orange-950/70 text-orange-300 flex items-center justify-center truncate px-1 transition-all">
                <span>{t('غاز 💨', 'Gas 💨')}</span>
              </div>

              {/* Needle Indicator for current actualTemp */}
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_10px_#ffffff] z-30 transition-all duration-100 pointer-events-none"
                style={{
                  left: `${Math.max(1, Math.min(99, (actualTemp / maxScaleK) * 100))}%`
                }}
              >
                <div className="absolute -top-1 -left-1.5 w-4 h-3 bg-white rounded-t-sm shadow-md" />
              </div>
            </div>

            {/* Scale Axis Labels aligned with LTR physical axis */}
            <div dir="ltr" className="flex justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
              <span className="text-blue-400">0 K ({t('صلب', 'Solid')})</span>
              <span className="text-cyan-300 font-bold">
                Tₘ: {phaseInfo.effectiveTm.toFixed(0)} K
              </span>
              <span className="text-orange-400 font-bold">
                T_b: {phaseInfo.effectiveTb.toFixed(0)} K
              </span>
              <span className="text-amber-400">{maxScaleK} K ({t('غاز', 'Gas')})</span>
            </div>
          </div>
        </div>

          {/* Right Column: Thermal & Pressure Controls + Gauges */}
          <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
          {/* Direct Temperature Input & Thermal Controls Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`font-bold text-base pb-2 border-b flex items-center justify-between ${
              isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'
            }`}>
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>{t('إدخال درجة الحرارة والموقد', 'Temperature & Burner Input')}</span>
              </span>
              <span className="text-xs font-mono font-bold text-orange-400">
                {targetTemp} K
              </span>
            </h3>

            {/* DIRECT NUMERICAL TEMPERATURE INPUT (User requested specific number input!) */}
            <div className={`p-3 sm:p-3.5 rounded-xl border space-y-2.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-400">
                  {t('أدخل قيمة الحرارة برقم محدد:', 'Enter Exact Temperature:')}
                </label>
                <div className="inline-flex rounded-lg border border-slate-700/60 p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setTempUnit('K')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      tempUnit === 'K'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    K
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempUnit('C')}
                    className={`px-2 py-0.5 rounded-md transition-colors ${
                      tempUnit === 'C'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    °C
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    lang="en"
                    value={exactTempInput}
                    onChange={(e) => {
                      const sanitized = toEnglishDigits(e.target.value).replace(/[^0-9.-]/g, '');
                      setExactTempInput(sanitized);
                      handleApplyExactTemp(sanitized);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyExactTemp();
                    }}
                    className={`w-full min-w-0 px-3 py-2 rounded-xl border text-sm font-mono font-black focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                      isDark ? 'bg-slate-900 border-slate-700 text-orange-400' : 'bg-white border-slate-300 text-orange-600'
                    }`}
                    placeholder={tempUnit === 'K' ? '300' : '25'}
                  />
                  <span className="absolute inset-y-0 end-3 flex items-center text-xs font-mono font-bold text-slate-500 pointer-events-none">
                    {tempUnit === 'K' ? 'K' : '°C'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyExactTemp()}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs shrink-0 shadow-sm transition-all flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('تطبيق', 'Apply')}</span>
                </button>
              </div>

              {/* Quick Benchmark Temperature Buttons */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-500 font-bold block">{t('نقاط حرارية قياسية سريعة:', 'Quick Thermal Benchmarks:')}</span>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                  <button
                    onClick={() => setTargetTemp(5)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 truncate"
                    title="الصفر المطلق"
                  >
                    0 K ({t('مطلق', 'Abs Zero')})
                  </button>
                  <button
                    onClick={() => setTargetTemp(77)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 truncate"
                    title="نيتروجين مسال"
                  >
                    77 K (LN₂)
                  </button>
                  <button
                    onClick={() => setTargetTemp(273)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-slate-700 truncate"
                    title="انصهار الجليد 0°C"
                  >
                    273 K (0°C)
                  </button>
                  <button
                    onClick={() => setTargetTemp(298)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 truncate"
                    title="حرارة الغرفة 25°C"
                  >
                    298 K (25°C)
                  </button>
                  <button
                    onClick={() => setTargetTemp(373)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 truncate"
                    title="غليان الماء 100°C"
                  >
                    373 K (100°C)
                  </button>
                  <button
                    onClick={() => setTargetTemp(Math.round(phaseInfo.effectiveTm))}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-orange-300 border border-slate-700 truncate"
                    title="انصهار المادة المحددة"
                  >
                    Tₘ ({Math.round(phaseInfo.effectiveTm)}K)
                  </button>
                </div>
              </div>
            </div>

            {/* Target Temperature Slider (Reaches full maxScaleK for Iron and Gold!) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">{t('شريط الضبط الدقيق:', 'Slider Control:')}</span>
                <span className="font-mono font-extrabold text-orange-400 text-xs">
                  {targetTemp} K ({Math.round(targetTemp - 273.15)} °C)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max={maxScaleK}
                value={targetTemp}
                onChange={(e) => setTargetTemp(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5 K</span>
                <span>{Math.round(maxScaleK / 2)} K</span>
                <span>{maxScaleK} K</span>
              </div>
            </div>

            {/* Continuous Burner Controls (UNRESTRICTED: Allows heating iron and gold to 4000K+) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onMouseDown={() => startBurner('heat')}
                onMouseUp={stopBurner}
                onMouseLeave={stopBurner}
                onTouchStart={() => startBurner('heat')}
                onTouchEnd={stopBurner}
                className={`py-3 px-2 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all select-none ${
                  burnerActive === 'heat'
                    ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-500/40 scale-[0.98]'
                    : isDark ? 'bg-orange-950/40 border-orange-900/50 text-orange-400 hover:bg-orange-900/40' : 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100'
                }`}
              >
                <Flame className={`w-4 h-4 ${burnerActive === 'heat' ? 'animate-bounce' : 'animate-pulse'}`} />
                <span>{t('تسخين مستمر بالموقد 🔥', 'Thermal Burner (Open) 🔥')}</span>
              </button>

              <button
                onMouseDown={() => startBurner('cool')}
                onMouseUp={stopBurner}
                onMouseLeave={stopBurner}
                onTouchStart={() => startBurner('cool')}
                onTouchEnd={stopBurner}
                className={`py-3 px-2 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all select-none ${
                  burnerActive === 'cool'
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/40 scale-[0.98]'
                    : isDark ? 'bg-cyan-950/40 border-cyan-900/50 text-cyan-400 hover:bg-cyan-900/40' : 'bg-cyan-50 border-cyan-300 text-cyan-700 hover:bg-cyan-100'
                }`}
              >
                <Snowflake className={`w-4 h-4 ${burnerActive === 'cool' ? 'animate-spin' : ''}`} />
                <span>{t('تبريد مبرد فائق ❄️', 'Cryo Cooling ❄️')}</span>
              </button>
            </div>
          </div>

          {/* PRESSURE & VOLUME CONTROLS (With Real Palpable Physical Impact!) */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`font-bold text-base pb-2 border-b flex items-center justify-between ${
              isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'
            }`}>
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>{t('عامل الضغط والمكبس الهيدروليكي', 'Pressure & Piston Impact')}</span>
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                pressureAtm > 4.5 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                {pressureAtm.toFixed(2)} Atm
              </span>
            </h3>

            {/* Quick Pressure Presets Bar */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 block">{t('حالات ضغط جاهزة ذات أثر فيزيائي:', 'Pressure Presets with Physical Impact:')}</span>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setPressurePreset('vacuum')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    volumeLidPercent === 100
                      ? 'bg-blue-950/80 border-blue-500 text-blue-300 ring-1 ring-blue-400'
                      : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block text-[11px]">🌌 {t('حجرة مفرغة', 'Vacuum')}</span>
                  <span className="text-[10px] font-mono text-blue-400">~0.2 Atm ({t('غليان سريع', 'Boil')})</span>
                </button>

                <button
                  onClick={() => setPressurePreset('normal')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    volumeLidPercent === 75
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 ring-1 ring-cyan-400'
                      : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block text-[11px]">🌍 {t('ضغط معياري', 'Standard')}</span>
                  <span className="text-[10px] font-mono text-cyan-400">1.0 Atm ({t('معتاد', 'Normal')})</span>
                </button>

                <button
                  onClick={() => setPressurePreset('cooker')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    volumeLidPercent === 35
                      ? 'bg-orange-950/80 border-orange-500 text-orange-300 ring-1 ring-orange-400'
                      : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block text-[11px]">🍲 {t('قدر ضغط', 'Cooker')}</span>
                  <span className="text-[10px] font-mono text-orange-400">~3.5 Atm ({t('إسالة البخار', 'Liquefy')})</span>
                </button>

                <button
                  onClick={() => setPressurePreset('extreme')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    volumeLidPercent === 22
                      ? 'bg-red-950/80 border-red-500 text-red-300 ring-1 ring-red-400'
                      : isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block text-[11px]">🚨 {t('كبس فائق', 'Extreme')}</span>
                  <span className="text-[10px] font-mono text-red-400">&gt;6.0 Atm ({t('تنفيس أمان', 'Vent')})</span>
                </button>
              </div>
            </div>

            {/* Container Volume Lid Slider (Boyle's Law & Adiabatic Compression) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">{t('حجم الوعاء وكبس المكبس (V):', 'Piston Volume (V):')}</span>
                <span className="font-mono font-bold text-cyan-400">{volumeLidPercent}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={volumeLidPercent}
                onChange={(e) => applyAdiabaticVolumeChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{t('كبس أقصى (20%)', 'Max Compression (20%)')}</span>
                <span>{t('حجم كامل (100%)', 'Full Volume (100%)')}</span>
              </div>
            </div>
          </div>

          {/* Precision Gauges & Manometer Dial Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`font-bold text-base pb-2 border-b flex items-center justify-between ${
              isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-200'
            }`}>
              <span>{t('لوحة المانوميتر والحرارة', 'Manometer & Thermometer')}</span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </h3>

            {/* Precision Bourdon Tube Circular Manometer Dial */}
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="relative w-48 h-36 flex items-center justify-center">
                <svg className="w-48 h-36" viewBox="0 0 200 150">
                  <defs>
                    <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={isDark ? '#0f172a' : '#ffffff'} />
                      <stop offset="90%" stopColor={isDark ? '#020617' : '#f8fafc'} />
                      <stop offset="100%" stopColor={isDark ? '#1e293b' : '#cbd5e1'} />
                    </radialGradient>
                    <linearGradient id="metallicRim" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="50%" stopColor="#334155" />
                      <stop offset="100%" stopColor="#64748b" />
                    </linearGradient>
                    <radialGradient id="metallicCap" cx="40%" cy="40%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="60%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#334155" />
                    </radialGradient>
                  </defs>

                  {/* Outer Bezel Rim */}
                  <circle cx="100" cy="78" r="72" fill="url(#metallicRim)" stroke="#1e293b" strokeWidth="2" />
                  {/* Dial Face */}
                  <circle cx="100" cy="78" r="67" fill="url(#dialGrad)" stroke="#334155" strokeWidth="1" />

                  {/* Colored Arc Zones (0 to 8 Atm, angle from -135° to +135°) */}
                  {/* Vacuum Zone: 0 - 0.6 Atm */}
                  <path
                    d="M 52.8 125.2 A 66 66 0 0 1 54.5 44.5"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  {/* Normal Zone: 0.6 - 2.0 Atm */}
                  <path
                    d="M 54.5 44.5 A 66 66 0 0 1 100 12"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    opacity="0.9"
                  />
                  {/* High Zone: 2.0 - 4.5 Atm */}
                  <path
                    d="M 100 12 A 66 66 0 0 1 145.5 44.5"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="4"
                    opacity="0.85"
                  />
                  {/* Danger Zone: 4.5 - 8.0 Atm */}
                  <path
                    d="M 145.5 44.5 A 66 66 0 0 1 147.2 125.2"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.9"
                  />

                  {/* Tick Marks & Numbers (0 to 8 Atm) */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((val) => {
                    const angleDeg = -135 + (val / 8) * 270;
                    const rad = (angleDeg * Math.PI) / 180;
                    const sin = Math.sin(rad);
                    const cos = Math.cos(rad);
                    const x1 = 100 + 58 * sin;
                    const y1 = 78 - 58 * cos;
                    const x2 = 100 + 64 * sin;
                    const y2 = 78 - 64 * cos;
                    const tx = 100 + 48 * sin;
                    const ty = 78 - 48 * cos + 3.5;
                    return (
                      <g key={val}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={val >= 5 ? '#ef4444' : isDark ? '#94a3b8' : '#475569'} strokeWidth={val % 2 === 0 ? 1.8 : 1.2} />
                        <text
                          x={tx}
                          y={ty}
                          textAnchor="middle"
                          className="font-mono text-[9px] font-extrabold"
                          fill={val >= 5 ? '#f87171' : isDark ? '#cbd5e1' : '#334155'}
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Half-unit Minor Ticks */}
                  {[0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5].map((val) => {
                    const angleDeg = -135 + (val / 8) * 270;
                    const rad = (angleDeg * Math.PI) / 180;
                    const sin = Math.sin(rad);
                    const cos = Math.cos(rad);
                    return (
                      <line
                        key={val}
                        x1={100 + 60 * sin}
                        y1={78 - 60 * cos}
                        x2={100 + 64 * sin}
                        y2={78 - 64 * cos}
                        stroke={isDark ? '#64748b' : '#94a3b8'}
                        strokeWidth="0.8"
                      />
                    );
                  })}

                  {/* Inner Label */}
                  <text x="100" y="58" textAnchor="middle" className="text-[7.5px] font-sans font-bold uppercase tracking-wider" fill="#64748b">
                    ATMOSPHERE
                  </text>

                  {/* Dynamic Pointer / Needle */}
                  {(() => {
                    const clampedP = Math.min(8.0, Math.max(0, pressureAtm));
                    const needleAngle = -135 + (clampedP / 8.0) * 270;
                    return (
                      <g transform={`rotate(${needleAngle}, 100, 78)`} className="transition-transform duration-300 ease-out">
                        {/* Shadow */}
                        <polygon points="98,80 100,24 102,80" fill="rgba(0,0,0,0.4)" transform="translate(1, 2)" />
                        {/* Tapered Needle */}
                        <polygon points="98.5,78 100,22 101.5,78" fill="#f43f5e" />
                        {/* Counter-weight tail */}
                        <polygon points="98.5,78 100,92 101.5,78" fill="#be123c" />
                        {/* Central Hub Cap */}
                        <circle cx="100" cy="78" r="7" fill="url(#metallicCap)" stroke="#334155" strokeWidth="1.2" />
                        <circle cx="100" cy="78" r="2.5" fill="#0f172a" />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Digital Readout & Status */}
              <div className="mt-0 space-y-0.5">
                <span className="text-xl font-mono font-black text-cyan-400">
                  {pressureAtm.toFixed(2)} Atm
                </span>
                <span className={`block text-[11px] font-bold ${
                  pressureAtm < 0.6
                    ? 'text-blue-400'
                    : pressureAtm < 2.0
                    ? 'text-emerald-400'
                    : pressureAtm < 4.5
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}>
                  {pressureAtm < 0.6
                    ? t('خلخلة فراغية (غليان سريع)', 'Vacuum (Low-temp boil)')
                    : pressureAtm < 2.0
                    ? t('ضغط اعتيادي مستقر', 'Normal Atmospheric')
                    : pressureAtm < 4.5
                    ? t('ضغط مرتفع (تكاثف بالضغط)', 'High Pressure (Liquefaction)')
                    : t('ضغط حرج فائق (تنفيس أمان!)', 'Critical Overpressure (Venting!)')}
                </span>
              </div>
            </div>

            {/* Temperature Gauge Readout */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">{t('الحرارة الفعلية', 'Actual Temperature')}</span>
                <span className="text-2xl font-mono font-black text-orange-400 block mt-0.5">
                  {actualTemp.toFixed(1)} K
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({(actualTemp - 273.15).toFixed(1)} °C)
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-orange-950/40 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xl">
                🌡️
              </div>
            </div>

            {/* Phase Explanation Note */}
            <div className={`p-3 rounded-xl border space-y-1 text-xs ${
              isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}>
              <h5 className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>{t('التفسير الفيزيائي للحالة:', 'Physical Mechanism:')}</span>
              </h5>
              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {phaseInfo.detail}
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
