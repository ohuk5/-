import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, Sparkles, Layers } from 'lucide-react';
import { CompoundInfo, CompositionAnalysisResult, BUILDER_ELEMENTS_MAP } from '../data/compoundsData';
import { useApp } from '../context/AppContext';

interface MoleculeViewer3DProps {
  compound?: CompoundInfo;
  analysis: CompositionAnalysisResult;
  elementCounts: Record<string, number>;
}

export const MoleculeViewer3D: React.FC<MoleculeViewer3DProps> = ({
  compound,
  analysis,
  elementCounts
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { theme, t } = useApp();
  const isDark = theme === 'dark';

  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'ball_and_stick' | 'space_filling'>('ball_and_stick');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Mouse / Touch interaction state
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize Scene, Camera, Renderer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-5, -5, -3);
    scene.add(dirLight2);

    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);
    moleculeGroupRef.current = moleculeGroup;

    // Render loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (moleculeGroupRef.current && isRotating && !isDraggingRef.current) {
        moleculeGroupRef.current.rotation.y += 0.008;
        moleculeGroupRef.current.rotation.x += 0.003;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  // Update Molecule Geometry whenever Compound / Element Counts / View Mode changes
  useEffect(() => {
    const group = moleculeGroupRef.current;
    if (!group) return;

    // Clear previous children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as THREE.Mesh).geometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }
      if ((obj as THREE.Mesh).material) {
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat.dispose();
      }
    }

    // Reset rotation gently
    group.rotation.set(0.1, 0.2, 0);

    const activeEntries = Object.entries(elementCounts).filter(([_, count]) => count > 0);
    const totalAtoms = activeEntries.reduce((s, [_, c]) => s + c, 0);

    if (totalAtoms === 0) return;

    // Determine atoms and bonds
    let atomData: { element: string; position: [number, number, number]; color: string; radius: number }[] = [];
    let bondData: { from: number; to: number; order: 1 | 2 | 3 }[] = [];

    if (compound && compound.structure3D && compound.structure3D.atoms.length > 0) {
      // Use predefined 3D coordinates
      atomData = compound.structure3D.atoms.map(a => {
        const el = BUILDER_ELEMENTS_MAP.get(a.element);
        const color = a.color || el?.colorHex || '#94A3B8';
        const baseRadius = a.radius || el?.radius || 0.5;
        const radius = viewMode === 'space_filling' ? baseRadius * 1.5 : baseRadius;
        return {
          element: a.element,
          position: a.position,
          color,
          radius
        };
      });
      bondData = compound.structure3D.bonds;
    } else {
      // Procedurally generate coordinates for theoretical / custom compositions
      const flatList: string[] = [];
      for (const [sym, count] of activeEntries) {
        for (let i = 0; i < count; i++) {
          flatList.push(sym);
        }
      }

      // Sort with highest valence element at center
      flatList.sort((a, b) => {
        const va = BUILDER_ELEMENTS_MAP.get(a)?.primaryValence ?? 1;
        const vb = BUILDER_ELEMENTS_MAP.get(b)?.primaryValence ?? 1;
        return vb - va;
      });

      const n = flatList.length;
      if (n === 1) {
        const el = BUILDER_ELEMENTS_MAP.get(flatList[0]);
        atomData.push({
          element: flatList[0],
          position: [0, 0, 0],
          color: el?.colorHex || '#94A3B8',
          radius: (el?.radius || 0.5) * (viewMode === 'space_filling' ? 1.5 : 1)
        });
      } else if (n === 2) {
        const el0 = BUILDER_ELEMENTS_MAP.get(flatList[0]);
        const el1 = BUILDER_ELEMENTS_MAP.get(flatList[1]);
        const mult = viewMode === 'space_filling' ? 1.5 : 1;
        atomData.push({
          element: flatList[0],
          position: [-0.7, 0, 0],
          color: el0?.colorHex || '#94A3B8',
          radius: (el0?.radius || 0.5) * mult
        });
        atomData.push({
          element: flatList[1],
          position: [0.7, 0, 0],
          color: el1?.colorHex || '#94A3B8',
          radius: (el1?.radius || 0.5) * mult
        });
        bondData.push({ from: 0, to: 1, order: 1 });
      } else {
        // Star or spiral distribution around the primary core atom
        const centerEl = BUILDER_ELEMENTS_MAP.get(flatList[0]);
        const mult = viewMode === 'space_filling' ? 1.5 : 1;
        atomData.push({
          element: flatList[0],
          position: [0, 0, 0],
          color: centerEl?.colorHex || '#94A3B8',
          radius: (centerEl?.radius || 0.6) * mult
        });

        const orbitCount = n - 1;
        for (let i = 1; i < n; i++) {
          const el = BUILDER_ELEMENTS_MAP.get(flatList[i]);
          const angle = ((i - 1) / orbitCount) * Math.PI * 2;
          const zOffset = Math.sin(angle * 2) * 0.4;
          const dist = 1.15;
          const pos: [number, number, number] = [
            Math.cos(angle) * dist,
            Math.sin(angle) * dist,
            zOffset
          ];
          atomData.push({
            element: flatList[i],
            position: pos,
            color: el?.colorHex || '#94A3B8',
            radius: (el?.radius || 0.4) * mult
          });
          bondData.push({ from: 0, to: i, order: 1 });
        }
      }
    }

    // Build Three.js Meshes
    // 1. Atoms
    atomData.forEach((atom) => {
      const geometry = new THREE.SphereGeometry(atom.radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(atom.color),
        roughness: 0.25,
        metalness: 0.15,
        emissive: new THREE.Color(atom.color),
        emissiveIntensity: 0.1
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...atom.position);
      group.add(mesh);
    });

    // 2. Bonds (only in ball-and-stick mode)
    if (viewMode === 'ball_and_stick' && bondData.length > 0) {
      bondData.forEach((bond) => {
        const fromAtom = atomData[bond.from];
        const toAtom = atomData[bond.to];
        if (!fromAtom || !toAtom) return;

        const p1 = new THREE.Vector3(...fromAtom.position);
        const p2 = new THREE.Vector3(...toAtom.position);
        const distance = p1.distanceTo(p2);
        const direction = new THREE.Vector3().subVectors(p2, p1).normalize();

        const renderCylinder = (offset = new THREE.Vector3(0, 0, 0), radius = 0.08) => {
          const cylinderGeom = new THREE.CylinderGeometry(radius, radius, distance, 16);
          const cylinderMat = new THREE.MeshStandardMaterial({
            color: isDark ? 0x94a3b8 : 0x64748b,
            roughness: 0.4,
            metalness: 0.2
          });
          const cylinder = new THREE.Mesh(cylinderGeom, cylinderMat);

          const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5).add(offset);
          cylinder.position.copy(midPoint);

          const orientation = new THREE.Matrix4();
          orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
          orientation.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
          cylinder.applyMatrix4(orientation);

          group.add(cylinder);
        };

        if (bond.order === 1) {
          renderCylinder(new THREE.Vector3(0, 0, 0), 0.08);
        } else if (bond.order === 2) {
          const perp = new THREE.Vector3(-direction.y, direction.x, 0).normalize().multiplyScalar(0.09);
          renderCylinder(perp, 0.06);
          renderCylinder(perp.clone().negate(), 0.06);
        } else if (bond.order === 3) {
          const perp = new THREE.Vector3(-direction.y, direction.x, 0).normalize().multiplyScalar(0.12);
          renderCylinder(new THREE.Vector3(0, 0, 0), 0.05);
          renderCylinder(perp, 0.05);
          renderCylinder(perp.clone().negate(), 0.05);
        }
      });
    }

    // Center geometry group bounding sphere
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    if (cameraRef.current && sphere.radius > 0) {
      const targetZ = Math.max(5, sphere.radius * 2.8) / zoomLevel;
      cameraRef.current.position.z = targetZ;
    }
  }, [compound, elementCounts, viewMode, isDark, zoomLevel]);

  // Handle Drag to Rotate
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !moleculeGroupRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    moleculeGroupRef.current.rotation.y += deltaX * 0.01;
    moleculeGroupRef.current.rotation.x += deltaY * 0.01;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleResetCamera = () => {
    if (moleculeGroupRef.current) {
      moleculeGroupRef.current.rotation.set(0.1, 0.2, 0);
    }
    setZoomLevel(1);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 6.5);
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => {
      const next = Math.max(0.5, Math.min(2.5, prev + delta));
      if (cameraRef.current) {
        cameraRef.current.position.z = 6.5 / next;
      }
      return next;
    });
  };

  return (
    <div className={`relative w-full h-[380px] sm:h-[450px] rounded-3xl overflow-hidden border transition-all ${
      isDark
        ? 'bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/90 border-slate-800/90 shadow-lg'
        : 'bg-gradient-to-b from-slate-50 via-slate-100/90 to-slate-100 border-slate-200/90 shadow-sm'
    }`}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* Floating Status & Model Badge */}
      <div className="absolute top-4 start-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md bg-slate-900/90 border border-slate-700/70 text-xs sm:text-sm font-bold text-slate-100 shadow-md">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{compound?.nameAr || analysis.empiricalFormula || t('مجسم ثلاثي الأبعاد', '3D Molecule')}</span>
          </div>
          {compound && (
            <span className="px-2.5 py-1 rounded-xl text-xs sm:text-sm font-mono font-black bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm">
              {compound.formula}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-300 font-medium px-1">
          {viewMode === 'ball_and_stick' 
            ? t('نموذج الكرات والعصي (Ball-and-Stick)', 'Ball-and-Stick Model') 
            : t('نموذج التعبئة الفضائية (Space-Filling / Van der Waals)', 'Space-Filling Model')}
        </p>
      </div>

      {/* Interactive Toolbar Controls */}
      <div className="absolute top-4 end-4 flex items-center gap-1.5 backdrop-blur-md bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 shadow-lg">
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className={`p-2 rounded-xl transition-all ${
            isRotating
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title={isRotating ? t('إيقاف الدوران التلقائي', 'Pause Rotation') : t('تشغيل الدوران التلقائي', 'Resume Rotation')}
        >
          <RotateCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'ball_and_stick' ? 'space_filling' : 'ball_and_stick')}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-all"
          title={t('تبديل نمط التمثيل (كرات وعصي / تعبئة فراغية)', 'Toggle Model Representation')}
        >
          <Layers className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-700/80 mx-1" />

        <button
          type="button"
          onClick={() => handleZoom(0.2)}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-all"
          title={t('تكبير', 'Zoom In')}
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(-0.2)}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-all"
          title={t('تصغير', 'Zoom Out')}
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResetCamera}
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-all"
          title={t('إعادة ضبط الزاوية', 'Reset View')}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Touch Interaction Hint */}
      <div className="absolute bottom-3.5 inset-x-0 text-center pointer-events-none">
        <span className="text-xs text-slate-300 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-sm inline-block">
          {t('اسحب للتدوير في الفضاء 360° • استخدم أدوات التكبير للتقريب والمعاينة', 'Drag to rotate 360° • Use zoom controls to inspect bonds')}
        </span>
      </div>
    </div>
  );
};
