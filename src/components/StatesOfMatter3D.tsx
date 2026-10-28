import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Compass,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SubstanceInfo, MatterPhase } from '../data/substancesData';
import { useApp } from '../context/AppContext';
import { playLabSound } from '../utils/soundEffects';

export interface StatesOfMatter3DProps {
  substance: SubstanceInfo;
  actualTemp: number;
  pressureAtm: number;
  volumeLidPercent: number;
  gravityValue: number;
  phase: MatterPhase;
  phaseName: string;
  particleCount?: number;
  burnerActive?: 'heat' | 'cool' | null;
}

interface Particle3D {
  mesh: THREE.Object3D;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  targetLatticeX: number;
  targetLatticeY: number;
  targetLatticeZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
}

export const StatesOfMatter3D: React.FC<StatesOfMatter3DProps> = ({
  substance,
  actualTemp,
  pressureAtm,
  volumeLidPercent,
  gravityValue,
  phase,
  phaseName,
  particleCount = 45,
  burnerActive = null
}) => {
  const { t } = useApp();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const cameraSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 38,
    theta: Math.PI / 4,
    phi: Math.PI / 2.7
  });

  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live state reference to prevent stale closures in requestAnimationFrame loop
  const liveStateRef = useRef({
    volumeLidPercent,
    actualTemp,
    pressureAtm,
    phase,
    gravityValue,
    burnerActive
  });
  liveStateRef.current = {
    volumeLidPercent,
    actualTemp,
    pressureAtm,
    phase,
    gravityValue,
    burnerActive
  };

  // References for live 3D updates
  const pistonGroupRef = useRef<THREE.Group | null>(null);
  const prevPistonYRef = useRef<number>(10.0);
  const particles3DRef = useRef<Particle3D[]>([]);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  const gaugeNeedleRef = useRef<THREE.Mesh | null>(null);
  const burnerFlameMeshRef = useRef<THREE.Mesh | null>(null);
  const burnerFlameLightRef = useRef<THREE.PointLight | null>(null);
  const coolerFrostMeshRef = useRef<THREE.Mesh | null>(null);
  const coolerFrostLightRef = useRef<THREE.PointLight | null>(null);
  const latticeLinesRef = useRef<THREE.LineSegments | null>(null);

  const chamberRadius = 7.0;
  const chamberHeight = 16.0;

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 345;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060a14);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    cameraRef.current = camera;
    const { radius, theta, phi } = cameraSphericalRef.current;
    camera.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xf1f5f9, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.35);
    dirLight.position.set(16, 26, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    rimLight.position.set(-18, 12, -15);
    scene.add(rimLight);

    // Laboratory Table Base
    const tableGeo = new THREE.CylinderGeometry(20, 20, 1.2, 48);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.25 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -4.6;
    table.receiveShadow = true;
    scene.add(table);

    const grid = new THREE.GridHelper(32, 16, 0x06b6d4, 0x1e293b);
    grid.position.y = -3.95;
    scene.add(grid);

    // 3D Vacuum Chamber Group
    const chamberGroup = new THREE.Group();
    chamberGroup.position.set(0, -3.5, 0);

    // Heavy Metal Base Flange
    const baseFlangeGeo = new THREE.CylinderGeometry(chamberRadius + 0.8, chamberRadius + 1.2, 1.0, 36);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.25 });
    const baseFlange = new THREE.Mesh(baseFlangeGeo, metalMat);
    baseFlange.position.y = 0.5;
    chamberGroup.add(baseFlange);

    // Thick Glass Cylinder Body
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.18,
      roughness: 0.05,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: false,
      side: THREE.FrontSide
    });
    const glassGeo = new THREE.CylinderGeometry(chamberRadius, chamberRadius, chamberHeight, 48, 1, true);
    const glassCylinder = new THREE.Mesh(glassGeo, glassMat);
    glassCylinder.position.y = chamberHeight / 2 + 1.0;
    glassCylinder.renderOrder = 2;
    chamberGroup.add(glassCylinder);

    // Bottom Interior Floor
    const floorGeo = new THREE.CylinderGeometry(chamberRadius * 0.98, chamberRadius * 0.98, 0.4, 36);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.3 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = 1.0;
    chamberGroup.add(floorMesh);

    // Top Rim Flange
    const topFlangeGeo = new THREE.TorusGeometry(chamberRadius, 0.4, 12, 48);
    topFlangeGeo.rotateX(Math.PI / 2);
    const topFlange = new THREE.Mesh(topFlangeGeo, metalMat);
    topFlange.position.y = chamberHeight + 1.0;
    topFlange.renderOrder = 2;
    chamberGroup.add(topFlange);

    // Height Ticks on Chamber Wall
    const ticksGroup = new THREE.Group();
    for (let tIdx = 1; tIdx <= 4; tIdx++) {
      const tickY = 1.0 + (tIdx / 4) * (chamberHeight - 2.0);
      const tickGeo = new THREE.TorusGeometry(chamberRadius + 0.05, 0.04, 6, 24, Math.PI / 4);
      tickGeo.rotateX(Math.PI / 2);
      tickGeo.rotateY(Math.PI / 4);
      const tickMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
      const tickMesh = new THREE.Mesh(tickGeo, tickMat);
      tickMesh.position.y = tickY;
      ticksGroup.add(tickMesh);
    }
    chamberGroup.add(ticksGroup);

    // 3D Movable Piston Group
    const pistonGroup = new THREE.Group();
    const pistonLidY = 2.0 + (volumeLidPercent / 100) * (chamberHeight - 3.5);
    pistonGroup.position.set(0, pistonLidY, 0);
    prevPistonYRef.current = pistonLidY;

    // Piston Disc Plate
    const pDiscGeo = new THREE.CylinderGeometry(chamberRadius * 0.96, chamberRadius * 0.96, 0.7, 36);
    const pDiscMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
    const pDisc = new THREE.Mesh(pDiscGeo, pDiscMat);
    pistonGroup.add(pDisc);

    // Piston Rubber Gasket Ring
    const gasketGeo = new THREE.TorusGeometry(chamberRadius * 0.95, 0.18, 12, 36);
    gasketGeo.rotateX(Math.PI / 2);
    const gasketMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.4, metalness: 0.3 });
    const gasket = new THREE.Mesh(gasketGeo, gasketMat);
    pistonGroup.add(gasket);

    // Central Piston Shaft Rod
    const shaftGeo = new THREE.CylinderGeometry(0.55, 0.55, 12.0, 16);
    const shaft = new THREE.Mesh(shaftGeo, metalMat);
    shaft.position.y = 6.0;
    pistonGroup.add(shaft);

    // Piston Top Handle T-Bar
    const handleGeo = new THREE.BoxGeometry(4.5, 0.6, 0.8);
    const handleMesh = new THREE.Mesh(handleGeo, metalMat);
    handleMesh.position.y = 12.0;
    pistonGroup.add(handleMesh);

    chamberGroup.add(pistonGroup);
    pistonGroupRef.current = pistonGroup;

    // Analog Pressure Gauge on Chamber Wall
    const gaugeGroup = new THREE.Group();
    gaugeGroup.position.set(chamberRadius + 0.8, 8.5, 0);
    gaugeGroup.rotation.y = Math.PI / 2;

    const gMountGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 12);
    gMountGeo.rotateZ(Math.PI / 2);
    const gMount = new THREE.Mesh(gMountGeo, metalMat);
    gaugeGroup.add(gMount);

    const gBodyGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.5, 24);
    gBodyGeo.rotateX(Math.PI / 2);
    const gBody = new THREE.Mesh(gBodyGeo, metalMat);
    gBody.position.z = 0.8;
    gaugeGroup.add(gBody);

    const gFaceGeo = new THREE.CircleGeometry(1.65, 24);
    const gFaceMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const gFace = new THREE.Mesh(gFaceGeo, gFaceMat);
    gFace.position.z = 1.06;
    gaugeGroup.add(gFace);

    const needleGeo = new THREE.BoxGeometry(0.08, 1.2, 0.02);
    needleGeo.translate(0, 0.6, 0);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.z = 1.08;
    gaugeGroup.add(needle);
    gaugeNeedleRef.current = needle;

    chamberGroup.add(gaugeGroup);

    // 3D Burner / Cooler Base Elements
    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(0, -0.6, 0);

    const flameConeGeo = new THREE.ConeGeometry(2.5, 3.2, 16);
    flameConeGeo.translate(0, 1.6, 0);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const flameMesh = new THREE.Mesh(flameConeGeo, flameMat);
    flameMesh.visible = false;
    burnerGroup.add(flameMesh);
    burnerFlameMeshRef.current = flameMesh;

    const flameLight = new THREE.PointLight(0xf97316, 0, 14);
    flameLight.position.set(0, 1.5, 0);
    burnerGroup.add(flameLight);
    burnerFlameLightRef.current = flameLight;

    const frostGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.8, 18);
    const frostMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const frostMesh = new THREE.Mesh(frostGeo, frostMat);
    frostMesh.position.y = 0.4;
    frostMesh.visible = false;
    burnerGroup.add(frostMesh);
    coolerFrostMeshRef.current = frostMesh;

    const frostLight = new THREE.PointLight(0x38bdf8, 0, 12);
    frostLight.position.set(0, 1.0, 0);
    burnerGroup.add(frostLight);
    coolerFrostLightRef.current = frostLight;

    chamberGroup.add(burnerGroup);

    // Particles Group inside Chamber
    const particlesGroup = new THREE.Group();
    chamberGroup.add(particlesGroup);
    particlesGroupRef.current = particlesGroup;

    // 3D Intermolecular Bond Lines (Crystal Lattice / Liquid Cohesion Visualizer)
    const maxBondSegments = 300;
    const bondPositions = new Float32Array(maxBondSegments * 6);
    const bondGeo = new THREE.BufferGeometry();
    bondGeo.setAttribute('position', new THREE.BufferAttribute(bondPositions, 3));
    const bondMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const latticeLines = new THREE.LineSegments(bondGeo, bondMat);
    latticeLines.frustumCulled = false;
    chamberGroup.add(latticeLines);
    latticeLinesRef.current = latticeLines;

    scene.add(chamberGroup);

    // Helper to generate accurate 3D molecule / atom mesh for all 12 substances
    const createSubstanceMesh = (): { mesh: THREE.Object3D; radius: number } => {
      const subColor = new THREE.Color(substance.color || '#38bdf8');
      const bondCylMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.4 });

      if (substance.particleType === 'water') {
        // H2O Molecule: Oxygen sphere (red) + 2 Hydrogen spheres (white) at 104.5°
        const mol = new THREE.Group();
        const oxyGeo = new THREE.SphereGeometry(0.46, 16, 16);
        const oxyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.22, metalness: 0.1 });
        mol.add(new THREE.Mesh(oxyGeo, oxyMat));

        const hydGeo = new THREE.SphereGeometry(0.28, 12, 12);
        const hydMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
        const bondAngle = (104.5 * Math.PI) / 180;
        const bondDist = 0.58;

        [-1, 1].forEach(dir => {
          const hx = Math.sin((bondAngle / 2) * dir) * bondDist;
          const hy = -Math.cos(bondAngle / 2) * bondDist;
          const hyd = new THREE.Mesh(hydGeo, hydMat);
          hyd.position.set(hx, hy, 0);
          mol.add(hyd);

          const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, bondDist, 8);
          const cyl = new THREE.Mesh(cylGeo, bondCylMat);
          cyl.position.set(hx * 0.5, hy * 0.5, 0);
          cyl.rotation.z = (bondAngle / 2) * dir;
          mol.add(cyl);
        });

        return { mesh: mol, radius: 0.65 };
      } else if (substance.particleType === 'co2') {
        // CO2 Linear Molecule: O=C=O
        const mol = new THREE.Group();
        const cGeo = new THREE.SphereGeometry(0.38, 14, 14);
        const cMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.2 });
        mol.add(new THREE.Mesh(cGeo, cMat));

        const bGeo = new THREE.CylinderGeometry(0.11, 0.11, 1.28, 8);
        bGeo.rotateZ(Math.PI / 2);
        mol.add(new THREE.Mesh(bGeo, bondCylMat));

        const oGeo = new THREE.SphereGeometry(0.4, 14, 14);
        const oMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 });
        const o1 = new THREE.Mesh(oGeo, oMat);
        o1.position.x = 0.64;
        mol.add(o1);
        const o2 = new THREE.Mesh(oGeo, oMat);
        o2.position.x = -0.64;
        mol.add(o2);

        return { mesh: mol, radius: 0.72 };
      } else if (substance.particleType === 'methane') {
        // CH4 or Ethanol 3D Tetrahedral / Organic Molecule
        const mol = new THREE.Group();
        const cGeo = new THREE.SphereGeometry(0.42, 14, 14);
        const cMat = new THREE.MeshStandardMaterial({ color: subColor, roughness: 0.3, metalness: 0.15 });
        mol.add(new THREE.Mesh(cGeo, cMat));

        const hGeo = new THREE.SphereGeometry(0.24, 10, 10);
        const hMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
        const verts = [
          new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(0.56),
          new THREE.Vector3(-1, -1, 1).normalize().multiplyScalar(0.56),
          new THREE.Vector3(-1, 1, -1).normalize().multiplyScalar(0.56),
          new THREE.Vector3(1, -1, -1).normalize().multiplyScalar(0.56)
        ];
        verts.forEach((v, idx) => {
          const hMesh = new THREE.Mesh(
            hGeo,
            substance.id === 'ethanol' && idx === 0
              ? new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 })
              : hMat
          );
          hMesh.position.copy(v);
          mol.add(hMesh);
        });
        return { mesh: mol, radius: 0.66 };
      } else if (substance.particleType === 'ammonia') {
        // NH3 Molecule: Central Nitrogen + 3 Hydrogens in Trigonal Pyramid
        const mol = new THREE.Group();
        const nGeo = new THREE.SphereGeometry(0.44, 16, 16);
        const nMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.22, metalness: 0.15 });
        mol.add(new THREE.Mesh(nGeo, nMat));

        const hGeo = new THREE.SphereGeometry(0.24, 12, 12);
        const hMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
        const bondDist = 0.52;
        const bondAngle = (107.8 * Math.PI) / 180;

        for (let k = 0; k < 3; k++) {
          const phi = (k * 2 * Math.PI) / 3;
          const hx = Math.sin(bondAngle * 0.5) * Math.cos(phi) * bondDist;
          const hz = Math.sin(bondAngle * 0.5) * Math.sin(phi) * bondDist;
          const hy = -Math.cos(bondAngle * 0.5) * bondDist;

          const hyd = new THREE.Mesh(hGeo, hMat);
          hyd.position.set(hx, hy, hz);
          mol.add(hyd);

          const cylGeo = new THREE.CylinderGeometry(0.06, 0.06, bondDist, 8);
          const cyl = new THREE.Mesh(cylGeo, bondCylMat);
          cyl.position.set(hx * 0.5, hy * 0.5, hz * 0.5);
          cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(hx, hy, hz).normalize());
          mol.add(cyl);
        }

        return { mesh: mol, radius: 0.65 };
      } else if (substance.particleType === 'diatomic') {
        // O2, N2, Br2, Cl2, I2, H2 Diatomic Dumbbell with bond cylinder
        const mol = new THREE.Group();
        const aGeo = new THREE.SphereGeometry(0.38, 16, 16);
        const aMat = new THREE.MeshStandardMaterial({ color: subColor, roughness: 0.22, metalness: 0.15 });
        const a1 = new THREE.Mesh(aGeo, aMat);
        a1.position.x = 0.34;
        mol.add(a1);
        const a2 = new THREE.Mesh(aGeo, aMat);
        a2.position.x = -0.34;
        mol.add(a2);

        const bGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.68, 8);
        bGeo.rotateZ(Math.PI / 2);
        mol.add(new THREE.Mesh(bGeo, bondCylMat));
        return { mesh: mol, radius: 0.62 };
      } else if (substance.particleType === 'metallic') {
        // High-Fidelity PBR Metallic Sphere (Au, Ag, Cu, Fe, Pb, Al, Na, W, Ti, Ga, Hg)
        const isGold = substance.id === 'gold';
        const isSilver = substance.id === 'silver';
        const isLead = substance.id === 'lead';
        const isCopper = substance.id === 'copper';
        const isSodium = substance.id === 'sodium';

        const geo = new THREE.SphereGeometry(0.48, 22, 22);
        const mat = new THREE.MeshStandardMaterial({
          color: isGold ? 0xfacc15 : isSilver ? 0xf8fafc : isCopper ? 0xea580c : isLead ? 0x64748b : isSodium ? 0xfef08a : subColor,
          metalness: isLead ? 0.75 : 0.96,
          roughness: isSilver ? 0.08 : isGold ? 0.12 : isLead ? 0.40 : 0.15
        });
        return { mesh: new THREE.Mesh(geo, mat), radius: 0.52 };
      } else {
        // Monatomic Noble Gas (He, Ne, Ar, Xe) or Carbon
        const geo = new THREE.SphereGeometry(0.45, 18, 18);
        const mat = new THREE.MeshStandardMaterial({
          color: subColor,
          roughness: 0.20,
          metalness: 0.1,
          emissive: subColor,
          emissiveIntensity: 0.22
        });
        return { mesh: new THREE.Mesh(geo, mat), radius: 0.5 };
      }
    };

    // Instantiate 3D Particle System
    const newParticles: Particle3D[] = [];
    const count = particleCount;
    const floorY = 1.5;

    // Calculate regular 3D lattice points for solid state
    const latticeLayers = 3;
    const particlesPerLayer = Math.ceil(count / latticeLayers);
    const side = Math.ceil(Math.sqrt(particlesPerLayer));
    const spacing = 1.32;
    const initPhase = liveStateRef.current.phase;
    const maxInitY = Math.max(floorY + 2.5, pistonLidY - 0.9);

    for (let i = 0; i < count; i++) {
      const { mesh, radius: pRadius } = createSubstanceMesh();
      mesh.renderOrder = 1;
      particlesGroup.add(mesh);

      const layer = Math.floor(i / (side * side));
      const col = (i % (side * side)) % side;
      const row = Math.floor((i % (side * side)) / side);

      const targetLx = (col - (side - 1) / 2) * spacing;
      const targetLy = floorY + layer * (spacing * 0.92) + 0.5;
      const targetLz = (row - (side - 1) / 2) * spacing;

      let initX = targetLx + (Math.random() - 0.5) * 0.15;
      let initY = targetLy;
      let initZ = targetLz + (Math.random() - 0.5) * 0.15;

      // Isotropic 3D random unit vector for initial velocity
      const u = Math.random() * 2 - 1;
      const phiAng = Math.random() * Math.PI * 2;
      const sqrtOneMinusU2 = Math.sqrt(Math.max(0, 1 - u * u));
      const dirX = sqrtOneMinusU2 * Math.cos(phiAng);
      const dirY = u;
      const dirZ = sqrtOneMinusU2 * Math.sin(phiAng);
      const initSpeed = initPhase === 'gas' || initPhase === 'boiling' ? 0.18 + Math.random() * 0.06 : 0.08;

      if (initPhase === 'gas' || initPhase === 'boiling') {
        const r = Math.sqrt(Math.random()) * (chamberRadius * 0.76);
        const thetaAng = Math.random() * Math.PI * 2;
        initX = r * Math.cos(thetaAng);
        initZ = r * Math.sin(thetaAng);
        initY = floorY + 0.5 + Math.random() * Math.max(1.5, maxInitY - floorY - 0.8);
      } else if (initPhase === 'liquid') {
        const r = Math.sqrt(Math.random()) * (chamberRadius * 0.65);
        const thetaAng = Math.random() * Math.PI * 2;
        initX = r * Math.cos(thetaAng);
        initZ = r * Math.sin(thetaAng);
        initY = floorY + Math.random() * 2.4;
      }

      mesh.position.set(initX, initY, initZ);

      newParticles.push({
        mesh,
        x: initX,
        y: initY,
        z: initZ,
        vx: dirX * initSpeed,
        vy: dirY * initSpeed,
        vz: dirZ * initSpeed,
        radius: pRadius,
        targetLatticeX: targetLx,
        targetLatticeY: targetLy,
        targetLatticeZ: targetLz,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        vRotX: (Math.random() - 0.5) * 0.04,
        vRotY: (Math.random() - 0.5) * 0.04,
        vRotZ: (Math.random() - 0.5) * 0.04
      });
    }

    particles3DRef.current = newParticles;

    // Animation & 3D Physics Loop
    let time = 0;
    let lastSimPhase = liveStateRef.current.phase;
    const animate = () => {
      time += 0.02;

      // Auto-rotation
      if (autoRotate && !isDraggingRef.current) {
        cameraSphericalRef.current.theta += 0.005;
      }

      const { radius: cR, theta: cT, phi: cP } = cameraSphericalRef.current;
      camera.position.set(
        cR * Math.sin(cP) * Math.cos(cT),
        cR * Math.cos(cP),
        cR * Math.sin(cP) * Math.sin(cT)
      );
      camera.lookAt(0, 5, 0);

      // Current live state values
      const {
        volumeLidPercent: curVol,
        actualTemp: curTemp,
        pressureAtm: curP,
        phase: curPhase,
        gravityValue: curGrav,
        burnerActive: curBurner
      } = liveStateRef.current;

      // Piston Lid Height Bound & Smooth Velocity Transfer
      const targetPistonY = 2.0 + (curVol / 100) * (chamberHeight - 3.5);
      const currentPistonY = prevPistonYRef.current + (targetPistonY - prevPistonYRef.current) * 0.25;
      const pistonVelY = currentPistonY - prevPistonYRef.current;
      prevPistonYRef.current = currentPistonY;

      if (pistonGroupRef.current) {
        pistonGroupRef.current.position.y = currentPistonY;
      }

      // Pressure Gauge Needle Angle
      if (gaugeNeedleRef.current) {
        const needleAngle = -Math.min(Math.PI * 0.85, (curP / 6.0) * Math.PI * 0.85);
        gaugeNeedleRef.current.rotation.z = needleAngle;
      }

      // Flame / Frost Flicker
      if (burnerFlameMeshRef.current && curBurner === 'heat') {
        const flicker = 1.0 + Math.sin(time * 30) * 0.12;
        burnerFlameMeshRef.current.scale.set(flicker, flicker, flicker);
      }

      // 3D Particles Physics Update
      const particles = particles3DRef.current;
      const n = particles.length;
      const speedScale = Math.sqrt(Math.max(5, curTemp) / 300) * 0.065;
      const radiusBound = chamberRadius * 0.86;
      const bottomBound = 1.5;
      const topBound = Math.max(bottomBound + 1.4, currentPistonY - 0.65);

      // Relative thermal speed for Gas phase calibrated to substance's boiling point & molecular mass
      // so cryogenic gases (He, Ne, N2, O2) and hot vapors (H2O, Fe) both fly naturally in 3D!
      const tbRef = Math.max(4.0, substance.boilingPointK);
      const gasTempRatio = Math.max(1.0, curTemp / tbRef);
      const massSpeedFactor = Math.max(0.78, Math.min(1.35, Math.pow(28 / Math.max(4, substance.mass), 0.18)));
      const targetGasSpeed = Math.min(0.32, Math.max(0.15, 0.17 * Math.sqrt(Math.min(3.8, gasTempRatio)) * massSpeedFactor));

      // When transitioning into gas/boiling from a condensed phase, give particles an immediate 3D expansion kick
      if ((curPhase === 'gas' || curPhase === 'boiling') && lastSimPhase !== 'gas' && lastSimPhase !== 'boiling') {
        for (let i = 0; i < n; i++) {
          const p = particles[i];
          const u = Math.random() * 2 - 1;
          const phiAng = Math.random() * Math.PI * 2;
          const s = Math.sqrt(Math.max(0, 1 - u * u));
          p.vx = s * Math.cos(phiAng) * targetGasSpeed;
          p.vy = (Math.abs(u) * 0.75 + 0.25) * targetGasSpeed;
          p.vz = s * Math.sin(phiAng) * targetGasSpeed;
        }
      }
      lastSimPhase = curPhase;

      // Compute 3D Center of Mass for Zero-G Surface Tension Cohesion
      let comX = 0;
      let comY = 0;
      let comZ = 0;
      if (n > 0) {
        for (let i = 0; i < n; i++) {
          comX += particles[i].x;
          comY += particles[i].y;
          comZ += particles[i].z;
        }
        comX /= n;
        comY /= n;
        comZ /= n;
      }
      // In Zero-G, gently drift center of mass toward chamber center
      const zeroGTargetY = (bottomBound + topBound) * 0.5;

      // Blackbody incandescence for high-temperature metals (> 950 K)
      const isHotMetal = substance.particleType === 'metallic' && curTemp > 950;
      const glowFactor = isHotMetal ? Math.min(1, (curTemp - 950) / 2200) : 0;

      for (let pIdx = 0; pIdx < n; pIdx++) {
        const p = particles[pIdx];

        if (isHotMetal && p.mesh instanceof THREE.Mesh && p.mesh.material instanceof THREE.MeshStandardMaterial) {
          p.mesh.material.emissive.setRGB(glowFactor, glowFactor * 0.42, glowFactor * 0.08);
          p.mesh.material.emissiveIntensity = glowFactor * 1.4;
        } else if (substance.particleType === 'metallic' && p.mesh instanceof THREE.Mesh && p.mesh.material instanceof THREE.MeshStandardMaterial) {
          p.mesh.material.emissiveIntensity = 0;
        }

        if (curPhase === 'solid') {
          // Solid: Spring-restoring force to 3D crystal lattice + thermal harmonic vibration
          const jitter = speedScale * 0.22;
          const targetYOffset = curGrav === 0 ? (zeroGTargetY - 2.6) : 0;
          const tx = p.targetLatticeX + Math.sin(time * 22 + pIdx) * jitter;
          const ty = p.targetLatticeY + targetYOffset + Math.cos(time * 25 + pIdx) * jitter;
          const tz = p.targetLatticeZ + Math.sin(time * 28 + pIdx * 1.5) * jitter;

          p.vx = (tx - p.x) * 0.28;
          p.vy = (ty - p.y) * 0.28;
          p.vz = (tz - p.z) * 0.28;
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
        } else if (curPhase === 'melting') {
          // Melting: Lattice softens, gravity/cohesion takes over
          const jitter = speedScale * 0.35;
          p.vx += (p.targetLatticeX - p.x) * 0.03 + (Math.random() - 0.5) * jitter;
          p.vy += (Math.random() - 0.5) * jitter - curGrav * 0.032;
          p.vz += (p.targetLatticeZ - p.z) * 0.03 + (Math.random() - 0.5) * jitter;

          p.vx *= 0.88;
          p.vy *= 0.88;
          p.vz *= 0.88;

          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
        } else if (curPhase === 'liquid') {
          // Liquid: Cohesive fluid dynamics + Zero-G spherical droplet formation!
          if (curGrav > 0.01) {
            p.vy -= curGrav * 0.038;
            p.vx += (Math.random() - 0.5) * speedScale * 0.32;
            p.vz += (Math.random() - 0.5) * speedScale * 0.32;
          } else {
            // ZERO-G 3D SPHERICAL DROPLET SURFACE TENSION
            const dx = (comX * 0.5) - p.x;
            const dy = (comY * 0.5 + zeroGTargetY * 0.5) - p.y;
            const dz = (comZ * 0.5) - p.z;
            const distToCenter = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.01;
            if (distToCenter > 1.2) {
              p.vx += (dx / distToCenter) * 0.024;
              p.vy += (dy / distToCenter) * 0.024;
              p.vz += (dz / distToCenter) * 0.024;
            }
            p.vx += (Math.random() - 0.5) * speedScale * 0.18;
            p.vy += (Math.random() - 0.5) * speedScale * 0.18;
            p.vz += (Math.random() - 0.5) * speedScale * 0.18;
          }

          p.vx *= 0.94;
          p.vy *= 0.94;
          p.vz *= 0.94;

          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
        } else {
          // Gas / Boiling: Clean straight-line 3D ballistic flight (Kinetic Theory of Gases)
          // No mid-air random jitter and no excessive gravity pinning molecules to the floor!
          if (curPhase === 'boiling' && p.y < bottomBound + 2.0) {
            p.vy += 0.012;
          } else if (curGrav > 0.01) {
            p.vy -= curGrav * 0.0004;
          }

          // Ensure every gas molecule has a healthy 3D vertical velocity component so it traverses the full chamber height
          const effectiveGasSpeed = curPhase === 'plasma' ? targetGasSpeed * 1.75 : targetGasSpeed;
          if (Math.abs(p.vy) < effectiveGasSpeed * 0.22) {
            p.vy = (p.vy >= 0 ? 1 : -1) * effectiveGasSpeed * (0.35 + Math.random() * 0.25);
          }

          const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy + p.vz * p.vz) || 0.01;
          const newSpeed = currentSpeed + (effectiveGasSpeed - currentSpeed) * 0.12;
          p.vx = (p.vx / currentSpeed) * newSpeed;
          p.vy = (p.vy / currentSpeed) * newSpeed;
          p.vz = (p.vz / currentSpeed) * newSpeed;

          // In plasma, add slight electromagnetic jitter
          if (curPhase === 'plasma') {
            p.vx += (Math.random() - 0.5) * 0.04;
            p.vy += (Math.random() - 0.5) * 0.04;
            p.vz += (Math.random() - 0.5) * 0.04;
          }

          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
        }

        // Cylindrical Chamber Wall Collisions
        const distXZ = Math.sqrt(p.x * p.x + p.z * p.z);
        const maxR = radiusBound - p.radius * 0.5;
        if (distXZ > maxR && distXZ > 0.001) {
          const nx = p.x / distXZ;
          const nz = p.z / distXZ;
          p.x = nx * maxR;
          p.z = nz * maxR;
          // Reflect velocity vector off cylindrical normal
          const dot = p.vx * nx + p.vz * nz;
          if (dot > 0) {
            const isGasLike = curPhase === 'gas' || curPhase === 'boiling';
            const restitution = isGasLike ? 1.0 : 0.6;
            p.vx -= (1 + restitution) * dot * nx;
            p.vz -= (1 + restitution) * dot * nz;

            // Slight diffuse reflection in gas phase prevents molecules from orbiting the circular wall
            if (isGasLike) {
              const angleJitter = (Math.random() - 0.5) * 0.22;
              const cosA = Math.cos(angleJitter);
              const sinA = Math.sin(angleJitter);
              const rvx = p.vx * cosA - p.vz * sinA;
              const rvz = p.vx * sinA + p.vz * cosA;
              p.vx = rvx;
              p.vz = rvz;
            }
          }
        }

        // Floor Collision
        if (p.y < bottomBound) {
          p.y = bottomBound;
          if (curPhase === 'gas' || curPhase === 'boiling') {
            p.vy = Math.max(targetGasSpeed * 0.45, Math.abs(p.vy) * 0.99);
          } else {
            p.vy = Math.abs(p.vy) * 0.45;
          }
        }

        // Liquid meniscus ceiling when under gravity
        if (curPhase === 'liquid' && curGrav > 0.01) {
          const liquidMaxY = Math.min(topBound, bottomBound + 4.2);
          if (p.y > liquidMaxY) {
            p.y = liquidMaxY;
            p.vy = -Math.abs(p.vy) * 0.35;
          }
        }

        // Movable Piston Lid Collision (with momentum transfer from moving piston!)
        if (p.y > topBound) {
          p.y = topBound;
          if (curPhase === 'gas' || curPhase === 'boiling') {
            p.vy = -Math.max(targetGasSpeed * 0.45, Math.abs(p.vy) * 0.99) + Math.min(0, pistonVelY * 1.2);
          } else {
            p.vy = -Math.abs(p.vy) * 0.85 + Math.min(0, pistonVelY * 1.2);
          }
        }
      }

      // 3D Particle-to-Particle Elastic Collisions & Liquid Cohesion
      for (let i = 0; i < n; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < n; j++) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dz = p2.z - p1.z;
          const distSq = dx * dx + dy * dy + dz * dz;
          const minDist = (p1.radius + p2.radius) * (curPhase === 'solid' ? 0.85 : 0.95);

          if (distSq < minDist * minDist && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;

            if (curPhase !== 'solid') {
              p1.x -= nx * overlap;
              p1.y -= ny * overlap;
              p1.z -= nz * overlap;
              p2.x += nx * overlap;
              p2.y += ny * overlap;
              p2.z += nz * overlap;

              const dvx = p1.vx - p2.vx;
              const dvy = p1.vy - p2.vy;
              const dvz = p1.vz - p2.vz;
              const elasticity = curPhase === 'gas' || curPhase === 'boiling' ? 1.0 : 0.85;
              const impulse = (dvx * nx + dvy * ny + dvz * nz) * elasticity;
              if (impulse > 0) {
                p1.vx -= impulse * nx;
                p1.vy -= impulse * ny;
                p1.vz -= impulse * nz;
                p2.vx += impulse * nx;
                p2.vy += impulse * ny;
                p2.vz += impulse * nz;
              }
            }
          } else if (curPhase === 'liquid' && distSq < 4.8 && distSq > minDist * minDist) {
            // Short-range van der Waals / hydrogen-bond cohesion in liquid state
            const dist = Math.sqrt(distSq);
            const attract = 0.0022;
            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;
            p1.vx += nx * attract;
            p1.vy += ny * attract;
            p1.vz += nz * attract;
            p2.vx -= nx * attract;
            p2.vy -= ny * attract;
            p2.vz -= nz * attract;
          }
        }
      }

      // Update 3D Positions, Rotations & Crystal/Liquid Intermolecular Bond Lines
      const lineSegmentMesh = latticeLinesRef.current;
      let segCount = 0;
      const posArray = lineSegmentMesh
        ? (lineSegmentMesh.geometry.attributes.position.array as Float32Array)
        : null;

      const isPlasma = curPhase === 'plasma';
      const showBonds = curPhase === 'solid' || curPhase === 'melting' || curPhase === 'liquid' || isPlasma;
      const maxBondDistSq = curPhase === 'solid' ? 2.6 : curPhase === 'melting' ? 2.9 : isPlasma ? 7.5 : 2.3;

      for (let i = 0; i < n; i++) {
        const p = particles[i];
        const rotFactor = curPhase === 'solid' ? 0.15 : 1.0;
        p.rotX += p.vRotX * rotFactor;
        p.rotY += p.vRotY * rotFactor;
        p.rotZ += p.vRotZ * rotFactor;

        p.mesh.position.set(p.x, p.y, p.z);
        p.mesh.rotation.set(p.rotX, p.rotY, p.rotZ);

        // In plasma mode, pulse glowing purple/cyan ionization aura
        if (isPlasma) {
          p.mesh.traverse(child => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissive.setHex(0xa855f7);
              child.material.emissiveIntensity = 1.6;
            }
          });
        }

        if (showBonds && posArray && segCount < maxBondSegments) {
          const checkLimit = isPlasma ? Math.min(i + 4, n) : n;
          for (let j = i + 1; j < checkLimit; j++) {
            if (segCount >= maxBondSegments) break;
            const p2 = particles[j];
            const dx = p2.x - p.x;
            const dy = p2.y - p.y;
            const dz = p2.z - p.z;
            if (dx * dx + dy * dy + dz * dz <= maxBondDistSq) {
              const baseIdx = segCount * 6;
              posArray[baseIdx] = p.x;
              posArray[baseIdx + 1] = p.y;
              posArray[baseIdx + 2] = p.z;
              posArray[baseIdx + 3] = p2.x;
              posArray[baseIdx + 4] = p2.y;
              posArray[baseIdx + 5] = p2.z;
              segCount++;
            }
          }
        }
      }

      if (lineSegmentMesh) {
        lineSegmentMesh.visible = showBonds && segCount > 0;
        lineSegmentMesh.geometry.setDrawRange(0, segCount * 2);
        lineSegmentMesh.geometry.attributes.position.needsUpdate = true;
        if (lineSegmentMesh.material instanceof THREE.LineBasicMaterial) {
          if (isPlasma) {
            lineSegmentMesh.material.color.setHex(0xc084fc);
            lineSegmentMesh.material.opacity = 0.85;
          } else {
            lineSegmentMesh.material.color.setHex(0x38bdf8);
            lineSegmentMesh.material.opacity = curPhase === 'solid' ? 0.42 : curPhase === 'melting' ? 0.28 : 0.16;
          }
        }
      }

      if (container.clientWidth > 0 && container.clientHeight > 0) {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const pr = renderer.getPixelRatio();
        if (
          Math.abs(renderer.domElement.width - Math.floor(cw * pr)) > 2 ||
          Math.abs(renderer.domElement.height - Math.floor(ch * pr)) > 2
        ) {
          camera.aspect = cw / ch;
          camera.updateProjectionMatrix();
          renderer.setSize(cw, ch, false);
        }
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW <= 0 || newH <= 0) return;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH, false);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [substance.id, particleCount]);

  // Reactive updates for burner/cooler
  useEffect(() => {
    if (burnerFlameMeshRef.current && burnerFlameLightRef.current) {
      const isHeating = burnerActive === 'heat';
      burnerFlameMeshRef.current.visible = isHeating;
      burnerFlameLightRef.current.intensity = isHeating ? 2.5 : 0;
    }
    if (coolerFrostMeshRef.current && coolerFrostLightRef.current) {
      const isCooling = burnerActive === 'cool';
      coolerFrostMeshRef.current.visible = isCooling;
      coolerFrostLightRef.current.intensity = isCooling ? 2.0 : 0;
    }
  }, [burnerActive]);

  // Mouse & Touch Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    cameraSphericalRef.current.theta -= dx * 0.008;
    cameraSphericalRef.current.phi = Math.max(0.15, Math.min(Math.PI / 2.05, cameraSphericalRef.current.phi - dy * 0.008));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraSphericalRef.current.radius = Math.max(18, Math.min(65, cameraSphericalRef.current.radius + e.deltaY * 0.035));
  };

  const handleZoom = (delta: number) => {
    playLabSound('click');
    cameraSphericalRef.current.radius = Math.max(18, Math.min(65, cameraSphericalRef.current.radius + delta));
  };

  const handleResetCamera = () => {
    playLabSound('click');
    cameraSphericalRef.current = { radius: 38, theta: Math.PI / 4, phi: Math.PI / 2.7 };
  };

  return (
    <div
      className={`relative w-full aspect-[4/3] max-w-[460px] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center select-none group transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 max-w-none aspect-auto border-2 border-cyan-500/50 shadow-2xl' : ''
      }`}
    >
      {/* 3D Canvas Mount */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Floating State HUD */}
      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-20 pointer-events-none text-[10px] font-mono">
        <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-cyan-300 flex items-center gap-1.5 shadow-md">
          <span className="font-bold text-white">{t(substance.name, substance.nameEn)}</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-bold">{phaseName}</span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400 font-bold">{actualTemp.toFixed(0)} K</span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-400 font-bold">{pressureAtm.toFixed(2)} Atm</span>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 z-20 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
        <button
          onClick={() => handleZoom(-5)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={t('تقريب (Zoom In)', 'Zoom In')}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom(5)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={t('تبعيد (Zoom Out)', 'Zoom Out')}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            playLabSound('click');
            setAutoRotate(!autoRotate);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            autoRotate ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title={t('دوران تلقائي (Auto-rotate)', 'Auto-rotate')}
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={t('إعادة ضبط زاوية الرؤية', 'Reset Camera')}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            playLabSound('click');
            setIsFullscreen(!isFullscreen);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={isFullscreen ? t('تصغير', 'Exit Fullscreen') : t('تكبير الشاشة', 'Fullscreen')}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="absolute bottom-2.5 left-2.5 text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/80 pointer-events-none">
        <span>{t('اسحب للتدوير 360° · عجل الماوس للتقريب', 'Drag 360° · Scroll zoom')}</span>
      </div>
    </div>
  );
};
