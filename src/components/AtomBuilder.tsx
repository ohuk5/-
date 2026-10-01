import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Minus,
  RotateCcw,
  Table,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Info,
  ChevronDown,
  BookOpen,
  Compass,
  Box,
  Sparkles
} from 'lucide-react';
import { ALL_ELEMENTS, ELEMENT_MAP, ElementInfo, CATEGORY_COLORS } from '../data/elementsData';
import { getElementDescription } from '../data/elementDescriptionsEn';
import { PeriodicTableModal } from './PeriodicTableModal';
import { AtomViewer3D } from './AtomViewer3D';
import { useApp } from '../context/AppContext';

interface NucleusNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'proton' | 'neutron';
}

interface AtomBuilderProps {
  onOpenGuide?: () => void;
}

export const AtomBuilder: React.FC<AtomBuilderProps> = ({ onOpenGuide }) => {
  const { lang, theme, t } = useApp();
  const isDark = theme === 'dark';
  const [protons, setProtons] = useState<number>(1);
  const [neutrons, setNeutrons] = useState<number>(0);
  const [electrons, setElectrons] = useState<number>(1);
  const [isPeriodicTableOpen, setIsPeriodicTableOpen] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showSpinArrows, setShowSpinArrows] = useState<boolean>(true);
  const [orbitSpeed, setOrbitSpeed] = useState<number>(1.0); // 0 (pause), 0.3 (slow motion), 1.0 (normal), 1.6 (fast)
  const [dimensionMode, setDimensionMode] = useState<'3d' | '2d' | 'split'>('3d');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nucleusNodesRef = useRef<NucleusNode[]>([]);
  const shellAnglesRef = useRef<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const animationFrameIdRef = useRef<number | null>(null);

  // Active element matching current proton count (1-118)
  const currentElement: ElementInfo = ELEMENT_MAP[protons] || {
    atomicNumber: protons,
    symbol: protons > 118 ? `Uue` : `?`,
    name: protons > 118 ? `عنصر افتراضي ${protons}` : `عنصر مجهول`,
    englishName: `Element ${protons}`,
    atomicMass: protons * 2,
    group: 0,
    period: 8,
    category: 'superheavy',
    categoryAr: 'عنصر فائق الثقل',
    electronShells: [protons],
    electronConfig: 'افتراضي',
    stableNeutrons: [protons],
    isRadioactive: true,
    desc: 'هذا العنصر يقع خارج نطاق العناصر الـ 118 المكتشفة رسمياً، ويعتبر عنصراً نظرياً فائق الثقل يخضع لقوانين نسبية متطرفة.'
  };

  // Mass number and charge
  const massNumber = protons + neutrons;
  const netCharge = protons - electrons;

  // Nuclear stability evaluation
  const isStable = React.useMemo(() => {
    if (protons === 0) return false;
    if (protons >= 84) return false; // Elements from Polonium upwards have no stable isotopes
    if (protons === 43 || protons === 61) return false; // Technetium and Promethium have no stable isotopes
    
    // Check against known stable neutrons
    if (currentElement.stableNeutrons && currentElement.stableNeutrons.length > 0) {
      if (currentElement.stableNeutrons.includes(neutrons)) return true;
    }

    // Heuristic valley of stability for elements
    if (protons <= 20) {
      return Math.abs(neutrons - protons) <= 1;
    } else {
      const idealNeutrons = protons * (1 + 0.006 * protons);
      return Math.abs(neutrons - idealNeutrons) <= 2;
    }
  }, [protons, neutrons, currentElement]);

  // Nuclear Magic Numbers evaluation (2, 8, 20, 28, 50, 82, 126)
  const MAGIC_NUMBERS = [2, 8, 20, 28, 50, 82, 126];
  const isProtonMagic = MAGIC_NUMBERS.includes(protons);
  const isNeutronMagic = MAGIC_NUMBERS.includes(neutrons);
  const isDoublyMagic = isProtonMagic && isNeutronMagic;

  // Sync nucleus nodes when particle count changes
  useEffect(() => {
    const targetP = Math.min(60, protons); // visual cap for canvas physics performance
    const targetN = Math.min(70, neutrons);
    const targetTotal = targetP + targetN;

    const currentNodes = nucleusNodesRef.current;
    const canvas = canvasRef.current;
    const cx = canvas ? canvas.width / 2 : 210;
    const cy = canvas ? canvas.height / 2 : 210;

    // Reconstruct nodes cleanly with dense, touching packing
    const newNodes: NucleusNode[] = [];
    const nodeR = targetTotal > 40 ? 5.5 : (targetTotal > 15 ? 6.5 : 7.5);
    const touchDist = nodeR * 1.94; // tightly touching with slight nuclear fusion overlap

    // Interleave protons and neutrons: p, n, p, n...
    const particleTypes: Array<'proton' | 'neutron'> = [];
    let pRem = targetP;
    let nRem = targetN;
    while (pRem > 0 || nRem > 0) {
      if (pRem > 0 && (nRem === 0 || pRem >= nRem)) {
        particleTypes.push('proton');
        pRem--;
      } else if (nRem > 0) {
        particleTypes.push('neutron');
        nRem--;
      }
    }

    if (targetTotal === 1) {
      newNodes.push({
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        radius: nodeR,
        type: particleTypes[0]
      });
    } else if (targetTotal === 2) {
      newNodes.push({
        x: cx - touchDist * 0.5,
        y: cy,
        vx: 0,
        vy: 0,
        radius: nodeR,
        type: particleTypes[0]
      });
      newNodes.push({
        x: cx + touchDist * 0.5,
        y: cy,
        vx: 0,
        vy: 0,
        radius: nodeR,
        type: particleTypes[1]
      });
    } else {
      // Vogel's golden-angle dense circular packing for touching discs
      const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
      for (let i = 0; i < targetTotal; i++) {
        const r = i === 0 ? 0 : touchDist * 0.88 * Math.sqrt(i);
        const theta = i * goldenAngle;
        newNodes.push({
          x: cx + Math.cos(theta) * r,
          y: cy + Math.sin(theta) * r,
          vx: 0,
          vy: 0,
          radius: nodeR,
          type: particleTypes[i]
        });
      }
    }

    nucleusNodesRef.current = newNodes;
  }, [protons, neutrons]);

  // Continuous animation loop for Bohr orbits & Nucleus physics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Radar guide cross
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.lineWidth = 1;
      ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
      ctx.moveTo(0, cy); ctx.lineTo(w, cy);
      ctx.stroke();

      // Electron shells configuration
      // Standard Bohr quantum energy levels: K=2, L=8, M=18, N=32, O=32, P=18, Q=8
      // Or distribute actual `electrons` across shells
      const shellMax = [2, 8, 18, 32, 32, 18, 8];
      let remainingE = electrons;
      const shells: number[] = [0, 0, 0, 0, 0, 0, 0];

      // If matching element electron distribution is known and neutral, use element's real shells
      if (electrons === protons && currentElement.electronShells) {
        for (let i = 0; i < 7; i++) {
          shells[i] = currentElement.electronShells[i] || 0;
        }
      } else {
        // distribute sequentially
        for (let i = 0; i < 7; i++) {
          if (remainingE > 0) {
            const take = Math.min(remainingE, shellMax[i]);
            shells[i] = take;
            remainingE -= take;
          }
        }
      }

      // Shell orbital radiuses
      const activeShellCount = shells.filter(s => s > 0).length || 1;
      const baseRadius = 38;
      const radiusStep = Math.max(16, 175 / (activeShellCount + 0.5));
      const shellRadii: number[] = [];
      for (let i = 0; i < 7; i++) {
        shellRadii.push(baseRadius + (i + 1) * radiusStep);
      }

      const shellNames = ['K (n=1)', 'L (n=2)', 'M (n=3)', 'N (n=4)', 'O (n=5)', 'P (n=6)', 'Q (n=7)'];
      const shellDirs = [1, -1, 1, -1, 1, -1, 1];

      // Draw Orbit Rings
      for (let i = 0; i < 7; i++) {
        if (shells[i] > 0 || (i === 0 && electrons === 0)) {
          const r = shellRadii[i];
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Shell label
          ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.font = 'bold 9px Cairo, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(shellNames[i], cx + r - 8, cy - 4);
        }
      }

      // Update and draw Nucleus Physics Nodes
      const nodes = nucleusNodesRef.current;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];

        // Central pull (strong nuclear attraction)
        const dx = cx - n1.x;
        const dy = cy - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.5) {
          n1.vx += dx * 0.085;
          n1.vy += dy * 0.085;
        }

        // Particle-to-particle contact repulsion
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const ndx = n2.x - n1.x;
          const ndy = n2.y - n1.y;
          let ndist = Math.sqrt(ndx * ndx + ndy * ndy);
          const minDist = (n1.radius + n2.radius) * 0.96; // tight touching contact
          if (ndist < minDist) {
            if (ndist === 0) ndist = 0.1;
            const overlap = minDist - ndist;
            const nx = ndx / ndist;
            const ny = ndy / ndist;
            n1.vx -= nx * overlap * 0.32;
            n1.vy -= ny * overlap * 0.32;
            n2.vx += nx * overlap * 0.32;
            n2.vy += ny * overlap * 0.32;
          }
        }

        // Jitter if radioactive
        if (!isStable && protons > 0) {
          n1.vx += (Math.random() - 0.5) * 0.25;
          n1.vy += (Math.random() - 0.5) * 0.25;
        }

        // Velocity damping
        n1.vx *= 0.80;
        n1.vy *= 0.80;

        n1.x += n1.vx;
        n1.y += n1.vy;
      }

      // Draw Nucleus Nodes
      nodes.forEach(node => {
        const grad = ctx.createRadialGradient(
          node.x - 2, node.y - 2, 1,
          node.x, node.y, node.radius
        );

        if (node.type === 'proton') {
          grad.addColorStop(0, '#fca5a5');
          grad.addColorStop(0.35, '#ef4444');
          grad.addColorStop(1, '#991b1b');

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (node.radius >= 6) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', node.x, node.y - 0.5);
          }
        } else {
          grad.addColorStop(0, '#f1f5f9');
          grad.addColorStop(0.35, '#94a3b8');
          grad.addColorStop(1, '#475569');

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(148, 163, 184, 0.2)';
          ctx.shadowBlur = 3;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Update Orbital Angles & Draw Orbiting Electrons (Pauli Principle: Alternating Directions & Spins)
      for (let i = 0; i < 7; i++) {
        if (shells[i] > 0) {
          const speed = (0.035 / (i + 1)) * orbitSpeed;
          shellAnglesRef.current[i] += speed;

          const numE = shells[i];
          const r = shellRadii[i];

          for (let e = 0; e < numE; e++) {
            // Pauli Exclusion Principle: Paired electrons in an orbital have opposite spins and directions!
            // Even electrons (0, 2, 4...) are Spin-Up (↑, Cyan), orbiting Counter-Clockwise (عكس عقارب الساعة)
            // Odd electrons (1, 3, 5...) are Spin-Down (↓, Orange), orbiting Clockwise (مع عقارب الساعة)
            const isSpinUp = (e % 2 === 0);

            // Counter-rotating directional phase:
            // In Canvas (+y down):
            // - Decreasing theta = Counter-Clockwise (Spin Up ↑)
            // - Increasing theta = Clockwise (Spin Down ↓)
            const baseTheta = e * ((Math.PI * 2) / numE);
            const theta = isSpinUp
              ? baseTheta - shellAnglesRef.current[i]
              : baseTheta + shellAnglesRef.current[i];

            const ex = cx + Math.cos(theta) * r;
            const ey = cy + Math.sin(theta) * r;

            const electronGrad = ctx.createRadialGradient(ex - 1.5, ey - 1.5, 0.5, ex, ey, 4.5);
            if (isSpinUp) {
              electronGrad.addColorStop(0, '#bae6fd');
              electronGrad.addColorStop(0.4, '#38bdf8');
              electronGrad.addColorStop(1, '#0284c7');
            } else {
              electronGrad.addColorStop(0, '#fed7aa');
              electronGrad.addColorStop(0.4, '#fb923c');
              electronGrad.addColorStop(1, '#ea580c');
            }

            // Directional Orbital Motion Arrow & Spin Badge (↑ / ↓)
            if (showSpinArrows) {
              const arrowArcSpan = 0.28; // radian arc ahead of electron

              if (isSpinUp) {
                // Moving counter-clockwise: ahead of electron is theta - arrowArcSpan
                const startArc = theta - 0.07;
                const endArc = theta - arrowArcSpan;

                // Curved arc along orbit path (counterclockwise = true)
                ctx.beginPath();
                ctx.arc(cx, cy, r, startArc, endArc, true);
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)';
                ctx.lineWidth = 2.2;
                ctx.stroke();

                // Arrowhead pointing in orbital velocity direction (tangent at endArc pointing CCW)
                const tipX = cx + Math.cos(endArc) * r;
                const tipY = cy + Math.sin(endArc) * r;
                const tangentAngle = endArc - Math.PI / 2;
                const headLen = 6.5;

                ctx.beginPath();
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(
                  tipX - headLen * Math.cos(tangentAngle - Math.PI / 5.2),
                  tipY - headLen * Math.sin(tangentAngle - Math.PI / 5.2)
                );
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(
                  tipX - headLen * Math.cos(tangentAngle + Math.PI / 5.2),
                  tipY - headLen * Math.sin(tangentAngle + Math.PI / 5.2)
                );
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2.2;
                ctx.stroke();
              } else {
                // Moving clockwise: ahead of electron is theta + arrowArcSpan
                const startArc = theta + 0.07;
                const endArc = theta + arrowArcSpan;

                // Curved arc along orbit path (counterclockwise = false)
                ctx.beginPath();
                ctx.arc(cx, cy, r, startArc, endArc, false);
                ctx.strokeStyle = 'rgba(251, 146, 60, 0.95)';
                ctx.lineWidth = 2.2;
                ctx.stroke();

                // Arrowhead pointing in orbital velocity direction (tangent at endArc pointing CW)
                const tipX = cx + Math.cos(endArc) * r;
                const tipY = cy + Math.sin(endArc) * r;
                const tangentAngle = endArc + Math.PI / 2;
                const headLen = 6.5;

                ctx.beginPath();
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(
                  tipX - headLen * Math.cos(tangentAngle - Math.PI / 5.2),
                  tipY - headLen * Math.sin(tangentAngle - Math.PI / 5.2)
                );
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(
                  tipX - headLen * Math.cos(tangentAngle + Math.PI / 5.2),
                  tipY - headLen * Math.sin(tangentAngle + Math.PI / 5.2)
                );
                ctx.strokeStyle = '#fb923c';
                ctx.lineWidth = 2.2;
                ctx.stroke();
              }

              // Spin Orientation Badge (↑ Spin Up / ↓ Spin Down)
              const badgeRadius = r + 13.5;
              const badgeX = cx + Math.cos(theta) * badgeRadius;
              const badgeY = cy + Math.sin(theta) * badgeRadius;

              ctx.beginPath();
              ctx.arc(badgeX, badgeY, 7, 0, Math.PI * 2);
              ctx.fillStyle = isSpinUp ? 'rgba(8, 47, 73, 0.92)' : 'rgba(67, 20, 7, 0.92)';
              ctx.fill();
              ctx.strokeStyle = isSpinUp ? '#38bdf8' : '#fb923c';
              ctx.lineWidth = 1.2;
              ctx.stroke();

              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 9px Cairo, Arial, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(isSpinUp ? '↑' : '↓', badgeX, badgeY + 0.5);
            }

            // Aura
            ctx.beginPath();
            ctx.arc(ex, ey, 8, 0, Math.PI * 2);
            ctx.fillStyle = isSpinUp ? 'rgba(56, 189, 248, 0.25)' : 'rgba(251, 146, 60, 0.25)';
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = electronGrad;
            ctx.fill();

            // Minus glyph
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 7px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('-', ex, ey - 0.5);
          }
        }
      }

      // On-Canvas Spin Legend Box when arrows are shown
      if (showSpinArrows && electrons > 0) {
        ctx.save();
        const isArLang = lang === 'ar';
        const boxW = isArLang ? 186 : 196;
        const boxH = 46;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(10, 10, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9.5px Cairo, sans-serif';

        if (isArLang) {
          ctx.textAlign = 'right';
          // Up Spin
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('↑ غزل للأعلى (+½) عكس عقارب الساعة', boxW + 2, 26);

          // Down Spin
          ctx.fillStyle = '#fb923c';
          ctx.fillText('↓ غزل للأسفل (-½) مع عقارب الساعة', boxW + 2, 44);
        } else {
          ctx.textAlign = 'left';
          // Up Spin
          ctx.fillStyle = '#38bdf8';
          ctx.fillText('↑ Spin-Up (+½) Counter-Clockwise', 18, 26);

          // Down Spin
          ctx.fillStyle = '#fb923c';
          ctx.fillText('↓ Spin-Down (-½) Clockwise', 18, 44);
        }
        ctx.restore();
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [protons, neutrons, electrons, isStable, currentElement, showSpinArrows, orbitSpeed]);

  const loadElement = (el: ElementInfo) => {
    setProtons(el.atomicNumber);
    const stableN = el.stableNeutrons && el.stableNeutrons.length > 0
      ? el.stableNeutrons[el.stableNeutrons.length - 1]
      : Math.round(el.atomicMass) - el.atomicNumber;
    setNeutrons(Math.max(0, stableN));
    setElectrons(el.atomicNumber); // neutral atom
    setSelectedPreset(el.symbol);
  };

  const resetAtom = () => {
    setProtons(0);
    setNeutrons(0);
    setElectrons(0);
    setSelectedPreset('');
  };

  const colors = CATEGORY_COLORS[currentElement.category] || CATEGORY_COLORS['nonmetal'];

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      <div className="w-full flex flex-col md:flex-row gap-5 items-start">
        {/* Left: Particle Controls Deck */}
        <div className="w-full md:w-[320px] lg:w-[360px] shrink-0 flex flex-col gap-4 order-2 md:order-1">
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b gap-2 flex-wrap ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                <span>{t('التحكم بالجسيمات', 'Particle Controls')}</span>
              </h3>
              <div className="flex items-center gap-1.5">
                {onOpenGuide && (
                  <button
                    onClick={onOpenGuide}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                    title={t('شرح بناء الذرة والجسيمات', 'Atom & particle guide')}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t('دليل الذرة', 'Guide')}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsPeriodicTableOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-700/60 text-cyan-300 text-xs font-semibold transition-all shadow-sm"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>{t('الجدول الدوري (118)', 'Periodic Table (118)')}</span>
                </button>
              </div>
            </div>

            {/* Protons Control (p+) */}
            <div className={`p-3 rounded-xl border border-red-950/40 space-y-2 ${
              isDark ? 'bg-slate-950/60' : 'bg-red-50/50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400 font-bold text-xs">
                    p⁺
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-red-500">{t('البروتونات (Z)', 'Protons (Z)')}</h4>
                    <p className="text-[10px] text-slate-400">{t('تحدد هوية العنصر الكيميائي', 'Determines element chemical identity')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setProtons(p => Math.max(0, p - 1))}
                    className={`w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-lg font-mono font-extrabold text-red-500">
                    {protons}
                  </span>
                  <button
                    onClick={() => setProtons(p => Math.min(118, p + 1))}
                    className={`w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="118"
                value={protons}
                onChange={(e) => setProtons(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Neutrons Control (n0) */}
            <div className={`p-3 rounded-xl border space-y-2 ${
              isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-600/50 flex items-center justify-center text-slate-300 font-bold text-xs">
                    n⁰
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('النيوترونات (N)', 'Neutrons (N)')}</h4>
                    <p className="text-[10px] text-slate-400">{t('تحدد نظير العنصر واستقرار النواة', 'Determines isotope & stability')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setNeutrons(n => Math.max(0, n - 1))}
                    className={`w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    -
                  </button>
                  <span className={`w-9 text-center text-lg font-mono font-extrabold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {neutrons}
                  </span>
                  <button
                    onClick={() => setNeutrons(n => Math.min(180, n + 1))}
                    className={`w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={neutrons}
                onChange={(e) => setNeutrons(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Electrons Control (e-) */}
            <div className={`p-3 rounded-xl border border-blue-950/40 space-y-2 ${
              isDark ? 'bg-slate-950/60' : 'bg-blue-50/50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold text-xs">
                    e⁻
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-500">{t('الإلكترونات (e⁻)', 'Electrons (e⁻)')}</h4>
                    <p className="text-[10px] text-slate-400">{t('تدور في المدارات وتحدد الشحنة', 'Orbiting shells & net charge')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setElectrons(e => Math.max(0, e - 1))}
                    className={`w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-lg font-mono font-extrabold text-blue-500">
                    {electrons}
                  </span>
                  <button
                    onClick={() => setElectrons(e => Math.min(118, e + 1))}
                    className={`w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="118"
                value={electrons}
                onChange={(e) => setElectrons(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick Actions & Presets */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={resetAtom}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-950/30 hover:bg-red-900/40 border border-red-900/50 text-red-400 rounded-xl text-xs font-bold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('تصفير الذرة', 'Reset Atom')}</span>
              </button>

              <select
                value={selectedPreset}
                onChange={(e) => {
                  const found = ALL_ELEMENTS.find(el => el.symbol === e.target.value);
                  if (found) loadElement(found);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
              >
                <option value="" disabled>{t('اختر عنصراً سريعاً', 'Choose preset element')}</option>
                <option value="H">¹H {t('الهيدروجين', 'Hydrogen')}</option>
                <option value="He">⁴He {t('الهيليوم', 'Helium')}</option>
                <option value="C">¹²C {t('الكربون', 'Carbon')}</option>
                <option value="N">¹⁴N {t('النيتروجين', 'Nitrogen')}</option>
                <option value="O">¹⁶O {t('الأكسجين', 'Oxygen')}</option>
                <option value="Na">²³Na {t('الصوديوم', 'Sodium')}</option>
                <option value="Al">²⁷Al {t('الألومنيوم', 'Aluminum')}</option>
                <option value="Si">²⁸Si {t('السيليكون', 'Silicon')}</option>
                <option value="Cl">³⁵Cl {t('الكلور', 'Chlorine')}</option>
                <option value="Ti">⁴⁸Ti {t('التيتانيوم', 'Titanium')}</option>
                <option value="Fe">⁵⁶Fe {t('الحديد', 'Iron')}</option>
                <option value="Cu">⁶⁴Cu {t('النحاس', 'Copper')}</option>
                <option value="Ga">⁷⁰Ga {t('الغاليوم', 'Gallium')}</option>
                <option value="Ag">¹⁰⁸Ag {t('الفضة', 'Silver')}</option>
                <option value="Xe">¹³¹Xe {t('الزينون', 'Xenon')}</option>
                <option value="I">¹²⁷I {t('اليود', 'Iodine')}</option>
                <option value="Au">¹⁹⁷Au {t('الذهب', 'Gold')}</option>
                <option value="Pb">²⁰⁸Pb {t('الرصاص', 'Lead')}</option>
                <option value="Po">²¹⁰Po {t('البولونيوم', 'Polonium')}</option>
                <option value="Th">²³²Th {t('الثوريوم', 'Thorium')}</option>
                <option value="U">²³⁸U {t('اليورانيوم', 'Uranium')}</option>
                <option value="Pu">²³⁹Pu {t('البلوتونيوم', 'Plutonium')}</option>
                <option value="Og">²⁹⁴Og {t('الأوغانيسون (118)', 'Oganesson (118)')}</option>
              </select>
            </div>
          </div>

          {/* Quick Mini Table Highlighting Bar */}
          <div className={`border rounded-2xl p-4 shadow-lg ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('موقع العنصر في الجدول الدوري:', 'Element Periodic Table Location:')}
              </span>
              <button
                onClick={() => setIsPeriodicTableOpen(true)}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>{t('عرض الجدول كاملاً', 'View Full Table')}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <span className="text-slate-400">{t('الدورة:', 'Period:')} </span>
                <span className="font-mono font-bold text-cyan-400">{currentElement.period || '-'}</span>
              </div>
              <div className={`h-3 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} />
              <div>
                <span className="text-slate-400">{t('المجموعة:', 'Group:')} </span>
                <span className="font-mono font-bold text-cyan-400">{currentElement.group || '-'}</span>
              </div>
              <div className={`h-3 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} />
              <div>
                <span className="text-slate-400">{t('الفئة:', 'Category:')} </span>
                <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {t(currentElement.categoryAr, currentElement.category)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Main Simulator Stage */}
        <div className="w-full flex-1 min-w-0 flex flex-col lg:flex-row gap-5 order-1 md:order-2">
          {/* Middle: Interactive Canvas Viewport */}
          <div className="w-full lg:flex-1 flex flex-col items-center gap-3">
          <div className={`w-full border rounded-2xl p-4 shadow-lg flex flex-col items-center ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {/* Top View Mode Switcher: 3D vs 2D vs Split */}
            <div className="w-full flex items-center justify-between mb-3 px-1 gap-2 flex-wrap">
              <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl shadow-inner">
                <button
                  onClick={() => setDimensionMode('3d')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dimensionMode === '3d'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={t('عرض النموذج الفضائي ثلاثي الأبعاد 3D', 'Switch to full 3D spatial model')}
                >
                  <Box className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{t('مجسم 3D', '3D Model')}</span>
                </button>

                <button
                  onClick={() => setDimensionMode('2d')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dimensionMode === '2d'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={t('مخطط مستويات الطاقة ومستويات بور المستوية 2D', '2D Bohr energy shell diagram')}
                >
                  <span>{t('مخطط بور 2D', '2D Bohr')}</span>
                </button>

                <button
                  onClick={() => setDimensionMode('split')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dimensionMode === 'split'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={t('عرض متزامن للنموذجين 2D و 3D معاً', 'Split view: both 2D and 3D models')}
                >
                  <span>{t('عرض متزامن (2D + 3D)', 'Split View')}</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/30 px-2.5 py-1 rounded-lg">
                {electrons} {t('إلكترونات تدور', 'orbiting electrons')}
              </span>
            </div>

            {/* Viewports Rendering Area */}
            {dimensionMode === '3d' && (
              <div className="w-full flex flex-col items-center">
                <AtomViewer3D
                  protons={protons}
                  neutrons={neutrons}
                  electrons={electrons}
                  elementSymbol={currentElement.symbol}
                  elementName={t(currentElement.name, currentElement.englishName)}
                  isStable={isStable}
                  showSpinArrows={showSpinArrows}
                  orbitSpeed={orbitSpeed}
                />
              </div>
            )}

            {dimensionMode === '2d' && (
              <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[420px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={420}
                  className="w-full h-full"
                />
              </div>
            )}

            {dimensionMode === 'split' && (
              <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 items-center justify-center">
                {/* 3D Model Card */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 self-start px-1">
                    <Box className="w-3 h-3" />
                    <span>{t('النموذج الفضائي ثلاثي الأبعاد (اسحب للف والدوران)', '3D Spatial Model (Drag to rotate)')}</span>
                  </span>
                  <AtomViewer3D
                    protons={protons}
                    neutrons={neutrons}
                    electrons={electrons}
                    elementSymbol={currentElement.symbol}
                    elementName={t(currentElement.name, currentElement.englishName)}
                    isStable={isStable}
                    showSpinArrows={showSpinArrows}
                    orbitSpeed={orbitSpeed}
                  />
                </div>

                {/* 2D Bohr Diagram Card */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-300 self-start px-1">
                    {t('مخطط مستويات الطاقة لبور 2D (K, L, M, N...)', '2D Bohr Energy Shells Diagram')}
                  </span>
                  <div className="relative w-full aspect-square max-w-[420px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={420}
                      height={420}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="w-full flex items-center justify-between px-1 mt-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> {t('بروتون (p⁺)', 'Proton')}
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block mr-2" /> {t('نيوترون (n⁰)', 'Neutron')}
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block mr-2" /> {t('إلكترون (e⁻)', 'Electron')}
              </span>
              <span className="text-cyan-400 cursor-pointer hover:underline" onClick={() => setIsPeriodicTableOpen(true)}>
                {t('تصفح كافة العناصر (118)', 'Explore all 118 elements')}
              </span>
            </div>
          </div>

          {/* Teacher Guidance & Pauli Exclusion / Electron Spin Card */}
          <div className={`w-full p-3.5 sm:p-4 rounded-2xl border space-y-3 shadow-md ${
            isDark ? 'bg-slate-900/90 border-cyan-800/40' : 'bg-cyan-50/50 border-cyan-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h4 className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('توجيه المعلم: حركة واتجاه دوران الإلكترونات واللف المغزلي', 'Teacher Rule: Opposite Electron Motion & Spin Vectors')}
                </h4>
              </div>
              <button
                onClick={() => setShowSpinArrows(!showSpinArrows)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 self-start sm:self-auto ${
                  showSpinArrows
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                    : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <span>{showSpinArrows ? '✓ ' + t('الأسهم مفعلة', 'Arrows Active') : t('إظهار الأسهم', 'Show Arrows')}</span>
              </button>
            </div>

            {/* Pedagogical Explanation Text */}
            <p className="text-[11px] leading-relaxed text-slate-300">
              {t(
                '💡 وفقاً لملاحظة المعلم وقوانين ميكانيكا الكم (مبدأ باولي للاستبعاد): لا تدور الإلكترونات في نفس الاتجاه في المدار الواحد! كل زوج من الإلكترونات يدور في اتجاهين متعاكسين بلف مغزلي متعاكس (سماوي عكس عقارب الساعة ↑، وبرتقالي مع عقارب الساعة ↓) لتوليد مجالين مغناطيسيين متعاكسين يقللان التنافر ويحققان الاستقرار.',
                '💡 Per teacher’s rule and Pauli Exclusion Principle: Electrons do NOT rotate in the same direction in an orbit! Paired electrons orbit in opposite directions with opposite spins (Cyan counter-clockwise ↑, Orange clockwise ↓) generating opposing magnetic moments that minimize repulsion and stabilize the atom.'
              )}
            </p>

            {/* Orbital Motion Speed Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-semibold">{t('سرعة الدوران:', 'Orbit Speed:')}</span>
              <div className="flex items-center gap-1">
                {[
                  { label: t('⏸️ تجميد لدراسة الاتجاه', '⏸️ Pause'), speed: 0 },
                  { label: t('🐢 0.3x بطيء', '🐢 0.3x'), speed: 0.3 },
                  { label: t('▶️ 1.0x عادي', '▶️ 1.0x'), speed: 1.0 },
                  { label: t('⚡ 1.6x سريع', '⚡ 1.6x'), speed: 1.6 },
                ].map(btn => (
                  <button
                    key={btn.speed}
                    onClick={() => setOrbitSpeed(btn.speed)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                      orbitSpeed === btn.speed
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                        : isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Electron Spin Up & Down Distribution Badges */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                isDark ? 'bg-slate-950/70 border-sky-900/60' : 'bg-sky-50 border-sky-200'
              }`}>
                <span className="w-6 h-6 rounded-lg bg-sky-950/80 border border-sky-500/50 flex items-center justify-center text-sky-400 font-bold text-xs shrink-0">
                  ↑
                </span>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('لف مغزلي للأعلى (+½)', 'Spin-Up (+½)')}</span>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {Math.ceil(electrons / 2)} {t('إلكترون (سماوي)', 'electrons')}
                  </span>
                </div>
              </div>

              <div className={`p-2 rounded-xl border flex items-center gap-2 ${
                isDark ? 'bg-slate-950/70 border-orange-900/60' : 'bg-orange-50 border-orange-200'
              }`}>
                <span className="w-6 h-6 rounded-lg bg-orange-950/80 border border-orange-500/50 flex items-center justify-center text-orange-400 font-bold text-xs shrink-0">
                  ↓
                </span>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('لف مغزلي للأسفل (-½)', 'Spin-Down (-½)')}</span>
                  <span className="text-xs font-mono font-bold text-orange-400">
                    {Math.floor(electrons / 2)} {t('إلكترون (برتقالي)', 'electrons')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Chemical Identity & Live Specs */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
          <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`font-bold text-base pb-2 border-b flex items-center justify-between ${
              isDark ? 'text-slate-200 border-slate-800' : 'text-slate-900 border-slate-200'
            }`}>
              <span>{t('الهوية الكيميائية للذرة', 'Chemical Identity')}</span>
              <span className="text-xs font-mono text-slate-400">Z = {protons}</span>
            </h3>

            {/* Large Periodic Symbol Tile */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-20 h-20 rounded-xl bg-slate-900 border border-cyan-500/40 flex flex-col items-center justify-center relative shadow-md shrink-0">
                <span className="absolute top-1 left-2 text-[10px] font-mono font-bold text-slate-400">
                  {massNumber > 0 ? massNumber : ''}
                </span>
                <span className="absolute bottom-1 left-2 text-[10px] font-mono font-bold text-slate-400">
                  {protons > 0 ? protons : ''}
                </span>
                <span className="absolute top-1 right-2 text-[10px] font-mono font-extrabold text-blue-400">
                  {netCharge !== 0 ? (netCharge > 0 ? `+${netCharge}` : `${netCharge}`) : '0'}
                </span>
                <span className="text-3xl font-black text-white mt-1">
                  {currentElement.symbol}
                </span>
              </div>

              <div className="space-y-1 min-w-0">
                <h4 className={`text-lg font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t(currentElement.name, currentElement.englishName)}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  {currentElement.englishName}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${colors.border} ${colors.bg} ${colors.text}`}>
                  {t(currentElement.categoryAr, currentElement.category)}
                </span>
              </div>
            </div>

            {/* Atomic Counters */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-slate-400 font-semibold block text-[10px] mb-1">{t('العدد الذري (Z)', 'Atomic Number (Z)')}</span>
                <span className="text-xl font-mono font-black text-red-500">{protons}</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-slate-400 font-semibold block text-[10px] mb-1">{t('العدد الكتلي (A)', 'Mass Number (A)')}</span>
                <span className={`text-xl font-mono font-black ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{massNumber}</span>
              </div>
              <div className={`p-2.5 rounded-xl border col-span-2 flex items-center justify-between px-4 ${
                isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-slate-400 text-xs font-semibold">{t('الشحنة الصافية:', 'Net Charge:')}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {netCharge > 0 ? `+${netCharge}` : `${netCharge}`}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    netCharge === 0
                      ? isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                      : netCharge > 0
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                      : 'bg-blue-950/80 text-blue-300 border border-blue-800/50'
                  }`}>
                    {netCharge === 0 ? t('متعادلة كهربائياً', 'Neutral Atom') : netCharge > 0 ? t('كاتيون (أيون موجب)', 'Cation (+ Ion)') : t('أنيون (أيون سالب)', 'Anion (- Ion)')}
                  </span>
                </div>
              </div>
            </div>

            {/* Nuclear Stability Badge */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              protons === 0
                ? isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                : isStable
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400 shadow-sm shadow-emerald-500/10'
                : 'bg-amber-950/30 border-amber-800/40 text-amber-400 unstable-nucleus-pulse'
            }`}>
              <div className="flex items-center gap-2">
                {protons === 0 ? (
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                ) : isStable ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-xs font-bold">
                  {protons === 0 ? t('لا توجد نواة', 'No nucleus') : isStable ? t('نواة مستقرة', 'Stable Nucleus') : t('نواة غير مستقرة (مشعة)', 'Unstable (Radioactive)')}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                protons === 0 ? 'bg-slate-800 text-slate-400' : isStable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {protons === 0 ? '--' : isStable ? t('مستقر كيميائياً', 'Stable') : t('تخضع لاضمحلال', 'Decaying')}
              </span>
            </div>

            {/* Nuclear Magic Numbers Interactive Indicator */}
            {(isProtonMagic || isNeutronMagic) && protons > 0 && (
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                isDoublyMagic
                  ? 'bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-slate-900 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-purple-950/30 border-purple-800/40 text-purple-300'
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 shrink-0 ${isDoublyMagic ? 'text-amber-400 animate-pulse' : 'text-purple-400'}`} />
                  <div>
                    <span className="font-extrabold block text-[11px]">
                      {isDoublyMagic
                        ? t('🌟 نواة سحرية الازدواج (Doubly Magic)!', '🌟 Doubly Magic Nucleus!')
                        : t('✨ عدد نووي سحري (Magic Number)', '✨ Nuclear Magic Number')}
                    </span>
                    <span className="text-[10px] text-slate-300 leading-tight block">
                      {isDoublyMagic
                        ? t(`بروتونات (${protons}) + نيوترونات (${neutrons}) أغلفة نووية كمية مغلقة فائقة الاستقرار!`, `Z=${protons}, N=${neutrons} closed quantum nuclear shells with maximum stability!`)
                        : isProtonMagic
                        ? t(`غلاف بروتوني مغلق بالكامل (Z = ${protons})`, `Closed quantum proton shell (Z = ${protons})`)
                        : t(`غلاف نيوتروني مغلق بالكامل (N = ${neutrons})`, `Closed quantum neutron shell (N = ${neutrons})`)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Electron Configuration */}
            <div className={`p-3 rounded-xl border space-y-1.5 ${
              isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">{t('التوزيع الإلكتروني:', 'Electron Config:')}</span>
                <span className="font-mono text-cyan-400 text-xs font-semibold">
                  {currentElement.electronConfig}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 overflow-x-auto pt-1">
                {['K', 'L', 'M', 'N', 'O', 'P', 'Q'].map((name, i) => {
                  const count = currentElement.electronShells ? currentElement.electronShells[i] || 0 : 0;
                  if (count === 0 && i >= (currentElement.electronShells?.length || 0)) return null;
                  return (
                    <span key={name} className={`px-1.5 py-0.5 rounded border ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 text-slate-700'
                    }`}>
                      {name}:{count}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Element Fact Description */}
            <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
              isDark ? 'bg-slate-950/40 border-slate-800/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <p>{getElementDescription(currentElement, lang)}</p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Modal for full 118 Periodic Table */}
      <PeriodicTableModal
        isOpen={isPeriodicTableOpen}
        onClose={() => setIsPeriodicTableOpen(false)}
        onSelectElement={loadElement}
        currentAtomicNumber={protons}
      />
    </div>
  );
};
