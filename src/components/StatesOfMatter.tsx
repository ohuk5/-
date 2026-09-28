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
  BookOpen
} from 'lucide-react';
import {
  SUBSTANCES,
  calculatePhase,
  MatterPhase,
  SubstanceInfo,
  calculateEffectiveBoilingPoint,
  calculateEffectiveMeltingPoint
} from '../data/substancesData';

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
  const phaseInfo = calculatePhase(actualTemp, substance, pressureAtm);

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
          title: '✨ حدوث التسامي المباشر (Sublimation)!',
          description: `عند ضغط ${pressureAtm.toFixed(2)} Atm (أقل من النقطة الثلاثية 5.1 Atm)، يتحول ${substance.name} مباشرة من الحالة الصلبة إلى الغاز دون المرور بالحالة السائلة!`,
          type: 'sublimation'
        });
      } else if (
        (prevPhase === 'solid' && (currentPhase === 'melting' || currentPhase === 'liquid')) ||
        (prevPhase === 'melting' && currentPhase === 'liquid')
      ) {
        setTransitionNotification({
          title: '🔥 حدوث الانصهار (Melting)!',
          description: `تجاوزت درجة الحرارة نقطة الانصهار (${phaseInfo.effectiveTm.toFixed(1)} K). تكسرت الروابط الشبكية الصلبة وبدأت الجزيئات بالانزلاق كمائع.`,
          type: 'melting'
        });
      } else if (
        (prevPhase === 'liquid' && (currentPhase === 'boiling' || currentPhase === 'gas')) ||
        (prevPhase === 'boiling' && currentPhase === 'gas')
      ) {
        setTransitionNotification({
          title: '💨 حدوث التبخر والغليان (Boiling)!',
          description: `تجاوزت درجة الحرارة نقطة الغليان الفعالة (${phaseInfo.effectiveTb.toFixed(1)} K). تغلبت الطاقة الحركية على قوى التجاذب البيني، وتمددت المادة كغاز حر.`,
          type: 'boiling'
        });
      } else if (
        (prevPhase === 'gas' && (currentPhase === 'boiling' || currentPhase === 'liquid')) ||
        (prevPhase === 'boiling' && currentPhase === 'liquid')
      ) {
        const isPressureTriggered = volumeLidPercent < 55 && pressureAtm > 1.8;
        setTransitionNotification({
          title: isPressureTriggered ? '⚡ تكاثف بالضغط (Pressure Liquefaction)!' : '💧 حدوث التكاثف (Condensation)!',
          description: isPressureTriggered
            ? `أدى انخفاض الحجم وارتفاع الضغط إلى ${pressureAtm.toFixed(2)} Atm لرفع نقطة الغليان وإجبار جزيئات الغاز على التكاثف لسائل!`
            : `انخفضت الحرارة دون نقطة الغليان (${phaseInfo.effectiveTb.toFixed(1)} K). تقاربت الجزيئات لتشكل قطرات سائلة مائعة.`,
          type: isPressureTriggered ? 'pressure_liquefaction' : 'condensation'
        });
      } else if (
        (prevPhase === 'liquid' && (currentPhase === 'melting' || currentPhase === 'solid')) ||
        (prevPhase === 'melting' && currentPhase === 'solid')
      ) {
        setTransitionNotification({
          title: '❄️ حدوث التجمد والتصلب (Solidification)!',
          description: `انخفضت الحرارة دون نقطة الانصهار (${phaseInfo.effectiveTm.toFixed(1)} K). ترابطت الجسيمات في بنية بلورية منتظمة وثابتة.`,
          type: 'freezing'
        });
      }

      const timer = setTimeout(() => {
        setTransitionNotification(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [phaseInfo.phase, substance, pressureAtm, volumeLidPercent]);

  // Dynamic Scale bounds for the temperature bar
  const maxScaleK = Math.max(750, Math.ceil(substance.boilingPointK * 1.35 / 50) * 50);

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

  // Burner continuous heating/cooling interval
  const startBurner = (type: 'heat' | 'cool') => {
    setBurnerActive(type);
    if (burnerIntervalRef.current) clearInterval(burnerIntervalRef.current);

    burnerIntervalRef.current = window.setInterval(() => {
      setTargetTemp(prev => {
        if (type === 'heat') {
          return Math.min(1000, prev + 10);
        } else {
          return Math.max(2, prev - 10);
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
    // Remove some momentum and slightly expand volume or cool down
    setTargetTemp(t => Math.max(5, t - 15));
    // Spawn steam jet particles
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
      ctx.fillStyle = 'rgba(10, 15, 29, 0.96)';
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
      ctx.strokeStyle = pressureAtm > 4.5 ? '#f43f5e' : '#334155';
      ctx.lineWidth = pressureAtm > 4.5 ? 5 : 4;
      ctx.moveTo(leftWall, lidY);
      ctx.lineTo(leftWall, bottomWall);
      ctx.lineTo(rightWall, bottomWall);
      ctx.lineTo(rightWall, lidY);
      ctx.stroke();

      // Movable Piston / Lid
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(leftWall - 4, lidY - 14, rightWall - leftWall + 8, 14);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(leftWall - 4, lidY - 14, rightWall - leftWall + 8, 14);

      // Piston rod & handle
      ctx.fillStyle = '#475569';
      ctx.fillRect(w / 2 - 12, 8, 24, lidY - 22);

      // Handle grip
      ctx.fillStyle = '#334155';
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
          // Spring pull to anchor point in crystal lattice
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.vx += dx * 0.09;
          p.vy += dy * 0.09;

          // Thermal jitter
          const noise = Math.sqrt(actualTemp) * 0.08;
          p.vx += (Math.random() - 0.5) * noise;
          p.vy += (Math.random() - 0.5) * noise;

          p.vx *= 0.72;
          p.vy *= 0.72;
        } else if (currentP === 'melting') {
          // Destabilizing lattice
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.vx += dx * 0.025;
          p.vy += dy * 0.025;

          p.vy += gEffect;
          p.vx *= 0.88;
          p.vy *= 0.88;
        } else if (currentP === 'liquid') {
          // REAL GRAVITY EFFECT ON LIQUID:
          if (gravityValue > 0) {
            // Earth/Moon/Jupiter: Falls down and pools at bottom
            p.vy += gEffect;

            // Fluid cohesion: attracts neighboring particles to stay together
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
            // ZERO-G EFFECT: Surface tension pulls particles into a floating sphere at Center of Mass
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
          // Thermal buoyancy upwards + gravity downwards
          p.vy += gEffect * 0.35;
          p.vy -= 0.12; // boiling bubbles escape upwards
        } else {
          // GAS PHASE:
          // In gas, gravity creates an atmospheric density gradient (denser at bottom)
          if (gravityValue > 0) {
            p.vy += gEffect * 0.04;
          }
        }

        p.angle += p.vRot;
        p.x += p.vx;
        p.y += p.vy;

        // REAL PRESSURE: Wall collisions & Piston mechanical work
        const r = p.radius;
        const bounce = currentP === 'gas' ? 0.98 : 0.55;

        // Left Wall
        if (p.x < leftWall + r) {
          p.x = leftWall + r;
          momentumExchangeRef.current += Math.abs(p.vx * 2);
          p.vx = -p.vx * bounce;
        }
        // Right Wall
        if (p.x > rightWall - r) {
          p.x = rightWall - r;
          momentumExchangeRef.current += Math.abs(p.vx * 2);
          p.vx = -p.vx * bounce;
        }
        // Bottom Floor
        if (p.y > bottomWall - r) {
          p.y = bottomWall - r;
          momentumExchangeRef.current += Math.abs(p.vy * 2);
          p.vy = -p.vy * bounce;
        }
        // Moving Top Piston / Lid (Adiabatic heating work)
        if (p.y < lidY + r) {
          p.y = lidY + r;
          momentumExchangeRef.current += Math.abs((p.vy - pistonSpeed) * 2);
          // If piston is moving downward into gas, it transfers momentum (heating)
          p.vy = -p.vy * bounce + pistonSpeed * 0.8;
          if (Math.abs(pistonSpeed) > 0.5 && currentP === 'gas') {
            setTargetTemp(t => Math.min(900, Math.max(10, Math.round(t - pistonSpeed * 0.35))));
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

      // REAL PRESSURE GAUGE CALCULATION:
      // Ideal Gas & Real collision momentum P = (N * T / V) + Wall Collisions
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

        // Realistic gas law: P = n * R * T / V
        const volFraction = (vesselHeight / (bottomWall - 40));
        let baseP = (n * (actualTemp / 300)) / (volFraction * 45);

        if (currentP === 'solid') baseP *= 0.15;
        if (currentP === 'liquid') baseP *= 0.45;

        const calculatedAtm = Math.max(0.08, parseFloat((baseP * 0.7 + avgKinetic * 0.3).toFixed(2)));
        setPressureAtm(calculatedAtm);

        // Auto-relief valve trigger if pressure is critically high (> 8.0 Atm)
        if (calculatedAtm > 7.5 && !isVenting) {
          triggerVent();
        }
      }

      // RENDER MOLECULES & ATOMS (Supporting all added substances!)
      particles.forEach(p => {
        const rx = p.x;
        const ry = p.y;
        const theta = p.angle;

        if (substance.particleType === 'water') {
          // H2O: Central Oxygen (red) + 2 Hydrogens (white) at 104.5 degrees
          const hOffset = 6.5;
          const hRadius = 3.2;
          const hAngle1 = theta + ((104.5 * Math.PI) / 180) / 2;
          const hAngle2 = theta - ((104.5 * Math.PI) / 180) / 2;

          const hx1 = rx + Math.cos(hAngle1) * hOffset;
          const hy1 = ry + Math.sin(hAngle1) * hOffset;
          const hx2 = rx + Math.cos(hAngle2) * hOffset;
          const hy2 = ry + Math.sin(hAngle2) * hOffset;

          // Covalent bonds
          ctx.beginPath();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.6;
          ctx.moveTo(rx, ry); ctx.lineTo(hx1, hy1);
          ctx.moveTo(rx, ry); ctx.lineTo(hx2, hy2);
          ctx.stroke();

          // Hydrogen atoms
          [ {x: hx1, y: hy1}, {x: hx2, y: hy2} ].forEach(hPos => {
            ctx.beginPath();
            ctx.arc(hPos.x, hPos.y, hRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#f8fafc';
            ctx.fill();
          });

          // Oxygen atom
          const oGrad = ctx.createRadialGradient(rx - 2, ry - 2, 1, rx, ry, 6);
          oGrad.addColorStop(0, '#fca5a5');
          oGrad.addColorStop(0.4, '#ef4444');
          oGrad.addColorStop(1, '#991b1b');
          ctx.beginPath();
          ctx.arc(rx, ry, 6, 0, Math.PI * 2);
          ctx.fillStyle = oGrad;
          ctx.fill();
        } else if (substance.particleType === 'co2') {
          // CO2: Linear O=C=O (Central Carbon black/gray + 2 Oxygens red)
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

          // Central Carbon
          ctx.beginPath();
          ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#475569';
          ctx.fill();

          // Oxygen spheres
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
          // CH4: Central Carbon (teal) with 4 Hydrogen spokes
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

          // Central Carbon
          ctx.beginPath();
          ctx.arc(rx, ry, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#0d9488';
          ctx.fill();
        } else if (substance.particleType === 'diatomic') {
          // O2 or N2: Two bonded atoms
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
          // Mercury or Iron: Gleaming metallic sphere with high-specular reflection
          const grad = ctx.createRadialGradient(rx - 3, ry - 3, 1, rx, ry, p.radius);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, substance.color);
          grad.addColorStop(0.8, '#475569');
          grad.addColorStop(1, '#0f172a');

          ctx.beginPath();
          ctx.arc(rx, ry, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
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
  }, [substance, targetTemp, gravityValue, volumeLidPercent, phaseInfo.phase, burnerActive, isVenting]);

  // Jump to specific state presets
  const jumpToPhase = (phase: 'solid' | 'liquid' | 'gas') => {
    let t: number;
    const Tm = phaseInfo.effectiveTm;
    const Tb = phaseInfo.effectiveTb;

    if (phase === 'solid') {
      t = Math.max(5, Tm - 35);
    } else if (phase === 'liquid') {
      t = (Tm + Tb) / 2;
    } else {
      t = Math.min(maxScaleK - 20, Tb + 45);
    }
    setTargetTemp(Math.round(t));
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

    // Check if clicked near lid handle
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

    // Convert Y to Volume percent (40px is 100%, h-60 is 20%)
    const clampedY = Math.max(40, Math.min(h - 60, currentY));
    const newVol = Math.round(100 - ((clampedY - 40) / (h - 100)) * 100);
    setVolumeLidPercent(Math.max(25, Math.min(100, newVol)));
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingPiston(false);
  };

  const runExperiment = (exp: 'space_drop' | 'pressure_cooker' | 'co2_sublime' | 'mercury_liquid' | 'helium_cold') => {
    if (exp === 'space_drop') {
      setSubstanceId('water');
      setTargetTemp(295);
      setActualTemp(295);
      setVolumeLidPercent(75);
      handleSetGravityPreset('zero');
      setTransitionNotification({
        title: '🚀 تجربة قطرة الماء في الفضاء (Zero-G)',
        description: 'في غياب الجاذبية الأرضية، تتغلب قوى التوتر السطحي لتجعل الماء السائل يتجمع في كرة مائية طافية بمنتصف الوعاء تماماً كما في محطة الفضاء الدولية!',
        type: 'melting'
      });
    } else if (exp === 'pressure_cooker') {
      setSubstanceId('water');
      setTargetTemp(380);
      setActualTemp(380);
      setVolumeLidPercent(26);
      handleSetGravityPreset('earth');
      setTransitionNotification({
        title: '🍲 تجربة قدر الضغط وتسييل الغاز (Pressure Liquefaction)',
        description: 'أدى كبس المكبس ورفع الضغط لأكثر من 3 Atm إلى رفع درجة الغليان الفعالة وتكثيف البخار إلى سائل مائع دون الحاجة لتبريد!',
        type: 'pressure_liquefaction'
      });
    } else if (exp === 'co2_sublime') {
      setSubstanceId('co2');
      setTargetTemp(198);
      setActualTemp(198);
      setVolumeLidPercent(80);
      handleSetGravityPreset('earth');
      setTransitionNotification({
        title: '❄️ تجربة تسامي الجليد الجاف (CO₂ Sublimation)',
        description: 'شاهد كيف يتحول ثاني أكسيد الكربون مباشرة من بلورات صلبة إلى غاز طائر دون المرور بالحالة السائلة لأن الضغط أقل من 5.1 ض.ج!',
        type: 'sublimation'
      });
    } else if (exp === 'mercury_liquid') {
      setSubstanceId('mercury');
      setTargetTemp(298);
      setActualTemp(298);
      setVolumeLidPercent(75);
      handleSetGravityPreset('earth');
      setTransitionNotification({
        title: '🧪 تجربة الزئبق: المعدن السائل الوحيد',
        description: 'المعدن الوحيد السائل في حرارة الغرفة، يتميز بكثافة وتوتر سطحي ولمعان معدني هائل وتماسك جزيئي قوي.',
        type: 'melting'
      });
    } else if (exp === 'helium_cold') {
      setSubstanceId('helium');
      setTargetTemp(12);
      setActualTemp(12);
      setVolumeLidPercent(80);
      handleSetGravityPreset('earth');
      setTransitionNotification({
        title: '🎈 تجربة الهيليوم فائق البرودة (4.2 K)',
        description: 'أخف الغازات النبيلة وأقلها نقطة غليان في الكون. جزيئاته فائقة الخفة وسريعة الحركة حتى عند درجات الصقيع السحيقة!',
        type: 'boiling'
      });
    }
  };

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
            إغلاق
          </button>
        </div>
      )}

      {/* Interactive Guided Quick Experiments Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 shrink-0">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>تجارب فيزيائية جاهزة للتطبيق الفوري:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold no-scrollbar flex-1">
          <button
            onClick={() => runExperiment('space_drop')}
            className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-600/50 text-purple-200 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>🚀</span>
            <span>كرة الماء بالفضاء</span>
          </button>

          <button
            onClick={() => runExperiment('pressure_cooker')}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-600/50 text-cyan-200 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>🍲</span>
            <span>قدر الضغط والتسييل</span>
          </button>

          <button
            onClick={() => runExperiment('co2_sublime')}
            className="px-3 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/50 text-amber-200 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>❄️</span>
            <span>تسامي الجليد الجاف</span>
          </button>

          <button
            onClick={() => runExperiment('mercury_liquid')}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-slate-200 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>🧪</span>
            <span>المعدن السائل (الزئبق)</span>
          </button>

          <button
            onClick={() => runExperiment('helium_cold')}
            className="px-3 py-1.5 rounded-xl bg-yellow-950/70 hover:bg-yellow-900/80 border border-yellow-600/50 text-yellow-200 transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>🎈</span>
            <span>الهيليوم البارد</span>
          </button>
        </div>

        {onOpenGuide && (
          <button
            onClick={() => onOpenGuide('states')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-orange-400" />
            <span>شرح الحالات والتجارب</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Substance Selection & Physics Controls (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Substance Selector Card (Expanded with new elements!) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
            <h3 className="font-bold text-slate-200 text-base pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>المادة الكيميائية</span>
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
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold">{sub.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">({sub.formula})</span>
                  </button>
                );
              })}
            </div>

            {/* Substance Thermal & Physical Constants */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-400">
                <span>نقطة الانصهار القياسية (Tₘ):</span>
                <span className="font-mono font-bold text-blue-400">
                  {substance.meltingPointK.toFixed(1)} K ({(substance.meltingPointK - 273.15).toFixed(1)} °C)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>نقطة الغليان القياسية (T_b):</span>
                <span className="font-mono font-bold text-orange-400">
                  {substance.boilingPointK.toFixed(1)} K ({(substance.boilingPointK - 273.15).toFixed(1)} °C)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
                <span>الكتلة الجزيئية (Mass):</span>
                <span className="font-mono text-cyan-300">{substance.mass.toFixed(2)} u</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
              {substance.desc}
            </p>
          </div>

          {/* REAL GRAVITY CONTROLS CARD */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-slate-200 text-base pb-2 border-b border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>حقل الجاذبية الأرضية والكونية</span>
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
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-sm">🌍</span>
                <span className="text-[11px]">الأرض (1.0g)</span>
              </button>

              <button
                onClick={() => handleSetGravityPreset('moon')}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  gravityPreset === 'moon'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-sm">🌕</span>
                <span className="text-[11px]">القمر (0.16g)</span>
              </button>

              <button
                onClick={() => handleSetGravityPreset('jupiter')}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  gravityPreset === 'jupiter'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-sm">🪐</span>
                <span className="text-[11px]">المشتري (2.5g)</span>
              </button>

              <button
                onClick={() => handleSetGravityPreset('zero')}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  gravityPreset === 'zero'
                    ? 'bg-purple-950 border-purple-500 text-purple-300 font-bold shadow-sm ring-1 ring-purple-400'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-sm">🚀</span>
                <span className="text-[11px]">انعدام وزن</span>
              </button>
            </div>

            {/* Continuous Gravity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">تسارع الجاذبية المستمر (g):</span>
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
                <span>0.0 g (فضاء حر)</span>
                <span>1.0 g (أرضي)</span>
                <span>3.0 g (فائق)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
              💡 <strong>التأثير الفيزيائي:</strong> عند اختيار <em>انعدام الوزن (Zero-G)</em>، تتغلب قوى التوتر السطحي والتجاذب البيني لتجعل السائل يتجمع في كرة مائية طافية بمنتصف الوعاء!
            </p>
          </div>

          {/* Particle Pump & Injection Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
            <h3 className="font-bold text-slate-200 text-base pb-2 border-b border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>مضخة الذرات وكثافة المادة</span>
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">{particleCount} جزيء</span>
            </h3>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => changeParticleCount(-10)}
                disabled={particleCount <= 15}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>تفريغ جزيئات</span>
              </button>

              <button
                onClick={() => changeParticleCount(10)}
                disabled={particleCount >= 80}
                className="flex-1 py-2 px-3 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-cyan-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ضخ جزيئات إضافية</span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Physical Simulation Vessel & Correct Phase Gauge (Span 5) */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col items-center">
            {/* Top State Badge & Manometer */}
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">الحالة:</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${phaseInfo.badgeClass}`}>
                  {phaseInfo.phaseAr}
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
                  <span>تفريغ</span>
                </button>
              </div>
            </div>

            {/* Interactive Canvas Stage */}
            <div className="relative w-full aspect-[4/3] max-w-[460px] bg-slate-950/90 border-2 border-slate-700/60 rounded-xl overflow-hidden shadow-2xl">
              <canvas
                ref={canvasRef}
                width={460}
                height={345}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className="w-full h-full relative z-10 cursor-ns-resize"
              />
              <div className="absolute top-2 left-2 z-20 pointer-events-none text-[10px] text-slate-400 bg-slate-900/70 px-2 py-1 rounded border border-slate-800">
                ↕ اسحب المكبس بالماوس لتغيير الحجم والضغط
              </div>
            </div>

            {/* Quick State Presets */}
            <div className="w-full grid grid-cols-3 gap-2 mt-4">
              <button
                onClick={() => jumpToPhase('solid')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  phaseInfo.phase === 'solid'
                    ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-md ring-1 ring-blue-400'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🧊 صلب (بلوري)
              </button>
              <button
                onClick={() => jumpToPhase('liquid')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  phaseInfo.phase === 'liquid'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-400'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                💧 سائل (مائع)
              </button>
              <button
                onClick={() => jumpToPhase('gas')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  phaseInfo.phase === 'gas'
                    ? 'bg-orange-950/80 border-orange-500 text-orange-300 shadow-md ring-1 ring-orange-400'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                💨 غاز (حر التمدد)
              </button>
            </div>
          </div>

          {/* TEMPERATURE PHASE DIAGRAM RULER (FIXED & ALIGNED!) */}
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>مقياس أطوار المادة والانتقالات الحرارية (انقر لتحديد الحرارة):</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{actualTemp.toFixed(1)} K</span>
            </div>

            {/* Visual Ruler Bar: Set explicitly to dir="ltr" so 0 K (Solid) is on the Left, and high Temp (Gas) is on the Right! */}
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
                <span>صلب 🧊</span>
              </div>

              {/* Liquid Zone (Tm to Tb) */}
              <div
                style={{
                  width: `${Math.max(14, ((phaseInfo.effectiveTb - phaseInfo.effectiveTm) / maxScaleK) * 100)}%`
                }}
                className="h-full bg-cyan-950/70 text-cyan-200 flex items-center justify-center border-r border-cyan-500/50 truncate px-1 transition-all"
              >
                <span>سائل 💧</span>
              </div>

              {/* Gas Zone (Tb to MaxScale) */}
              <div className="flex-1 h-full bg-orange-950/70 text-orange-300 flex items-center justify-center truncate px-1 transition-all">
                <span>غاز 💨</span>
              </div>

              {/* Needle Indicator for current actualTemp (Correctly moves with temperature!) */}
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_10px_#ffffff] z-30 transition-all duration-100 pointer-events-none"
                style={{
                  left: `${Math.max(1, Math.min(99, (actualTemp / maxScaleK) * 100))}%`
                }}
              >
                {/* Needle Floating Pin */}
                <div className="absolute -top-1 -left-1.5 w-4 h-3 bg-white rounded-t-sm shadow-md" />
              </div>
            </div>

            {/* Scale Axis Labels aligned with LTR physical axis */}
            <div dir="ltr" className="flex justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
              <span className="text-blue-400">0 K (صلب)</span>
              <span className="text-cyan-300 font-bold">
                Tₘ: {phaseInfo.effectiveTm.toFixed(0)} K
              </span>
              <span className="text-orange-400 font-bold">
                T_b: {phaseInfo.effectiveTb.toFixed(0)} K
              </span>
              <span className="text-amber-400">{maxScaleK} K (غاز)</span>
            </div>

            {/* Direct Explanation of the Active Phase */}
            <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
              <span>الموقع الحالي على الشريط:</span>
              <span className="font-bold text-cyan-400 font-mono">
                {actualTemp < phaseInfo.effectiveTm ? 'نطاق الصلابة 🧊' : actualTemp > phaseInfo.effectiveTb ? 'نطاق الغاز 💨' : 'نطاق السيولة 💧'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Thermal & Pressure Controls + Gauges (Span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Thermal Slider & Continuous Burner Controls Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-slate-200 text-base pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>التحكم الحراري والموقد</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </h3>

            {/* Target Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">درجة الحرارة المطلوبة:</span>
                <span className="font-mono font-extrabold text-orange-400 text-sm">
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
                <span>300 K</span>
                <span>{maxScaleK} K</span>
              </div>
            </div>

            {/* Continuous Burner Controls (Fire & Ice) */}
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
                    : 'bg-orange-950/40 border-orange-900/50 text-orange-400 hover:bg-orange-900/40'
                }`}
              >
                <Flame className={`w-4 h-4 ${burnerActive === 'heat' ? 'animate-bounce' : 'animate-pulse'}`} />
                <span>تسخين بالموقد</span>
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
                    : 'bg-cyan-950/40 border-cyan-900/50 text-cyan-400 hover:bg-cyan-900/40'
                }`}
              >
                <Snowflake className={`w-4 h-4 ${burnerActive === 'cool' ? 'animate-spin' : ''}`} />
                <span>تبريد فائق</span>
              </button>
            </div>

            {/* Container Volume Lid Slider (Boyle's Law) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">حجم الوعاء (مستوى المكبس):</span>
                <span className="font-mono font-bold text-cyan-400">{volumeLidPercent}%</span>
              </div>
              <input
                type="range"
                min="25"
                max="100"
                value={volumeLidPercent}
                onChange={(e) => setVolumeLidPercent(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>ضغط مرتفع (25%)</span>
                <span>حجم كامل (100%)</span>
              </div>
            </div>
          </div>

          {/* Precision Gauges Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
            <h3 className="font-bold text-slate-200 text-base pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>لوحة القياسات الحركية</span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </h3>

            {/* Temperature Gauge */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">الحرارة الفعلية</span>
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

            {/* Pressure Gauge */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">الضغط الداخلي (Manometer)</span>
                <span className="text-2xl font-mono font-black text-cyan-400 block mt-0.5">
                  {pressureAtm.toFixed(2)} Atm
                </span>
                <span className="text-[10px] text-slate-500">
                  تصادمات الجزيئات بجدران الوعاء
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl">
                ⚡
              </div>
            </div>

            {/* Phase Explanation Note */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
              <h5 className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>التفسير الفيزيائي للحالة:</span>
              </h5>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {phaseInfo.detail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
