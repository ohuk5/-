import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Flame,
  Snowflake,
  Compass,
  Maximize2,
  Minimize2,
  Wind
} from 'lucide-react';
import { SubstanceInfo, MatterPhase } from '../data/substancesData';
import { useApp } from '../context/AppContext';

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
  const particles3DRef = useRef<Particle3D[]>([]);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  const gaugeNeedleRef = useRef<THREE.Mesh | null>(null);
  const burnerFlameMeshRef = useRef<THREE.Mesh | null>(null);
  const burnerFlameLightRef = useRef<THREE.PointLight | null>(null);
  const coolerFrostMeshRef = useRef<THREE.Mesh | null>(null);
  const coolerFrostLightRef = useRef<THREE.PointLight | null>(null);

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
    scene.background = new THREE.Color(0x060913);

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
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xf1f5f9, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.3);
    dirLight.position.set(16, 26, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-18, 12, -15);
    scene.add(rimLight);

    // Laboratory Table Base
    const tableGeo = new THREE.CylinderGeometry(20, 20, 1.2, 48);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.2 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -4.6;
    table.receiveShadow = true;
    scene.add(table);

    const grid = new THREE.GridHelper(32, 16, 0x38bdf8, 0x1e293b);
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
      color: 0xffffff,
      transparent: true,
      opacity: 0.20,
      roughness: 0.06,
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
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
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
    for (let t = 1; t <= 4; t++) {
      const tickY = 1.0 + (t / 4) * (chamberHeight - 2.0);
      const tickGeo = new THREE.TorusGeometry(chamberRadius + 0.05, 0.04, 6, 24, Math.PI / 4);
      tickGeo.rotateX(Math.PI / 2);
      tickGeo.rotateY(Math.PI / 4);
      const tickMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
      const tickMesh = new THREE.Mesh(tickGeo, tickMat);
      tickMesh.position.y = tickY;
      ticksGroup.add(tickMesh);
    }
    chamberGroup.add(ticksGroup);

    // 3D Movable Piston Group
    const pistonGroup = new THREE.Group();
    const pistonLidY = 2.0 + (volumeLidPercent / 100) * (chamberHeight - 3.5);
    pistonGroup.position.set(0, pistonLidY, 0);

    // Piston Disc Plate
    const pDiscGeo = new THREE.CylinderGeometry(chamberRadius * 0.96, chamberRadius * 0.96, 0.7, 36);
    const pDiscMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
    const pDisc = new THREE.Mesh(pDiscGeo, pDiscMat);
    pistonGroup.add(pDisc);

    // Piston Rubber Gasket Ring
    const gasketGeo = new THREE.TorusGeometry(chamberRadius * 0.95, 0.18, 12, 36);
    gasketGeo.rotateX(Math.PI / 2);
    const gasketMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
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

    scene.add(chamberGroup);

    // Helper to generate a single 3D molecule / atom mesh
    const createSubstanceMesh = (): THREE.Object3D => {
      if (substance.id === 'water') {
        // H2O Molecule: Oxygen sphere (red) + 2 Hydrogen spheres (white)
        const mol = new THREE.Group();

        const oxyGeo = new THREE.SphereGeometry(0.48, 16, 16);
        const oxyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 });
        const oxygen = new THREE.Mesh(oxyGeo, oxyMat);
        mol.add(oxygen);

        const hydGeo = new THREE.SphereGeometry(0.28, 12, 12);
        const hydMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });

        const bondAngle = (104.5 * Math.PI) / 180;
        const bondDist = 0.58;

        const hyd1 = new THREE.Mesh(hydGeo, hydMat);
        hyd1.position.set(Math.sin(bondAngle / 2) * bondDist, -Math.cos(bondAngle / 2) * bondDist, 0);
        mol.add(hyd1);

        const hyd2 = new THREE.Mesh(hydGeo, hydMat);
        hyd2.position.set(-Math.sin(bondAngle / 2) * bondDist, -Math.cos(bondAngle / 2) * bondDist, 0);
        mol.add(hyd2);

        return mol;
      } else if (substance.id === 'iron') {
        const geo = new THREE.SphereGeometry(0.48, 16, 16);
        const mat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });
        return new THREE.Mesh(geo, mat);
      } else if (substance.id === 'gold') {
        const geo = new THREE.SphereGeometry(0.48, 16, 16);
        const mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
        return new THREE.Mesh(geo, mat);
      } else if (substance.id === 'oxygen') {
        // O2 Molecule: 2 connected red spheres
        const mol = new THREE.Group();
        const oGeo = new THREE.SphereGeometry(0.42, 14, 14);
        const oMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
        const o1 = new THREE.Mesh(oGeo, oMat);
        o1.position.x = 0.35;
        mol.add(o1);
        const o2 = new THREE.Mesh(oGeo, oMat);
        o2.position.x = -0.35;
        mol.add(o2);
        return mol;
      } else if (substance.id === 'co2') {
        // CO2 Molecule: Carbon (black) in center + 2 Oxygens (red)
        const mol = new THREE.Group();
        const cGeo = new THREE.SphereGeometry(0.38, 14, 14);
        const cMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const c = new THREE.Mesh(cGeo, cMat);
        mol.add(c);
        const oGeo = new THREE.SphereGeometry(0.42, 14, 14);
        const oMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
        const o1 = new THREE.Mesh(oGeo, oMat);
        o1.position.x = 0.65;
        mol.add(o1);
        const o2 = new THREE.Mesh(oGeo, oMat);
        o2.position.x = -0.65;
        mol.add(o2);
        return mol;
      } else {
        // Default elemental sphere
        const geo = new THREE.SphereGeometry(0.46, 16, 16);
        const mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
        return new THREE.Mesh(geo, mat);
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
    const spacing = 1.35;

    for (let i = 0; i < count; i++) {
      const mesh = createSubstanceMesh();
      mesh.renderOrder = 1;
      particlesGroup.add(mesh);

      const layer = Math.floor(i / (side * side));
      const col = (i % (side * side)) % side;
      const row = Math.floor((i % (side * side)) / side);

      const targetLx = (col - (side - 1) / 2) * spacing;
      const targetLy = floorY + layer * (spacing * 0.9) + 0.5;
      const targetLz = (row - (side - 1) / 2) * spacing;

      const initX = targetLx + (Math.random() - 0.5) * 0.2;
      const initY = targetLy;
      const initZ = targetLz + (Math.random() - 0.5) * 0.2;

      mesh.position.set(initX, initY, initZ);

      newParticles.push({
        mesh,
        x: initX,
        y: initY,
        z: initZ,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        vz: (Math.random() - 0.5) * 0.1,
        targetLatticeX: targetLx,
        targetLatticeY: targetLy,
        targetLatticeZ: targetLz,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        vRotX: (Math.random() - 0.5) * 0.05,
        vRotY: (Math.random() - 0.5) * 0.05,
        vRotZ: (Math.random() - 0.5) * 0.05
      });
    }

    particles3DRef.current = newParticles;

    // Animation Loop
    let time = 0;
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

      // Piston Lid Height Bound (inside chamber coordinates)
      const currentPistonY = 2.0 + (curVol / 100) * (chamberHeight - 3.5);
      if (pistonGroupRef.current) {
        pistonGroupRef.current.position.y = currentPistonY;
      }

      // Pressure Gauge Needle Angle
      if (gaugeNeedleRef.current) {
        const needleAngle = -Math.min(Math.PI * 0.8, (curP / 6.0) * Math.PI * 0.8);
        gaugeNeedleRef.current.rotation.z = needleAngle;
      }

      // Flame / Frost Flicker
      if (burnerFlameMeshRef.current && curBurner === 'heat') {
        const flicker = 1.0 + Math.sin(time * 30) * 0.1;
        burnerFlameMeshRef.current.scale.set(flicker, flicker, flicker);
      }

      // 3D Particles Motion Loop (Phase-dependent)
      const particles = particles3DRef.current;
      const speedScale = Math.sqrt(Math.max(5, curTemp) / 300) * 0.06;
      const radiusBound = chamberRadius * 0.88;
      const bottomBound = 1.5;
      const topBound = currentPistonY - 0.6;

      for (let pIdx = 0; pIdx < particles.length; pIdx++) {
        const p = particles[pIdx];

        if (curPhase === 'solid') {
          // Solid: Vibrates tightly around 3D crystal lattice positions
          const jitter = speedScale * 0.18;
          p.x = p.targetLatticeX + Math.sin(time * 20 + pIdx) * jitter;
          p.y = p.targetLatticeY + Math.cos(time * 24 + pIdx) * jitter;
          p.z = p.targetLatticeZ + Math.sin(time * 28 + pIdx * 1.5) * jitter;
        } else if (curPhase === 'melting') {
          // Melting: Lattice softens, starts sliding and flowing
          const jitter = speedScale * 0.35;
          p.vx += (Math.random() - 0.5) * jitter - p.vx * 0.08;
          p.vy -= curGrav * 0.04;
          p.vz += (Math.random() - 0.5) * jitter - p.vz * 0.08;

          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          // Clamping to chamber bottom
          const distXZ = Math.sqrt(p.x * p.x + p.z * p.z);
          if (distXZ > radiusBound) {
            const angle = Math.atan2(p.z, p.x);
            p.x = Math.cos(angle) * radiusBound;
            p.z = Math.sin(angle) * radiusBound;
            p.vx *= -0.5;
            p.vz *= -0.5;
          }
          if (p.y < bottomBound) {
            p.y = bottomBound;
            p.vy = Math.abs(p.vy) * 0.4;
          }
        } else if (curPhase === 'liquid') {
          // Liquid: Cohesive fluid flowing at bottom, surface meniscus
          p.vy -= curGrav * 0.05; // gravity pulls down
          p.vx += (Math.random() - 0.5) * speedScale * 0.25 - p.vx * 0.04;
          p.vz += (Math.random() - 0.5) * speedScale * 0.25 - p.vz * 0.04;

          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          // Cylindrical wall bounce
          const distXZ = Math.sqrt(p.x * p.x + p.z * p.z);
          if (distXZ > radiusBound) {
            const angle = Math.atan2(p.z, p.x);
            p.x = Math.cos(angle) * radiusBound;
            p.z = Math.sin(angle) * radiusBound;
            p.vx *= -0.6;
            p.vz *= -0.6;
          }

          // Floor bounce
          if (p.y < bottomBound) {
            p.y = bottomBound;
            p.vy = Math.abs(p.vy) * 0.3;
          }

          // Liquid surface level limit
          const liquidMaxY = bottomBound + 3.8;
          if (p.y > liquidMaxY) {
            p.y = liquidMaxY;
            p.vy *= -0.3;
          }
        } else {
          // Gas / Boiling: Free energetic 3D flight bouncing off all walls & piston!
          p.vx += (Math.random() - 0.5) * 0.04;
          p.vy += (Math.random() - 0.5) * 0.04 - curGrav * 0.015;
          p.vz += (Math.random() - 0.5) * 0.04;

          // Normalize velocity to thermal speed
          const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy + p.vz * p.vz) || 0.01;
          const targetSpeed = speedScale * 2.8;
          p.vx = (p.vx / currentSpeed) * targetSpeed;
          p.vy = (p.vy / currentSpeed) * targetSpeed;
          p.vz = (p.vz / currentSpeed) * targetSpeed;

          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          // Cylinder wall bounce
          const distXZ = Math.sqrt(p.x * p.x + p.z * p.z);
          if (distXZ > radiusBound) {
            const angle = Math.atan2(p.z, p.x);
            p.x = Math.cos(angle) * radiusBound;
            p.z = Math.sin(angle) * radiusBound;
            p.vx *= -1;
            p.vz *= -1;
          }

          // Floor bounce
          if (p.y < bottomBound) {
            p.y = bottomBound;
            p.vy = Math.abs(p.vy);
          }

          // Piston Lid bounce
          if (p.y > topBound) {
            p.y = topBound;
            p.vy = -Math.abs(p.vy);
          }
        }

        // Apply 3D Rotation to Molecule
        p.rotX += p.vRotX;
        p.rotY += p.vRotY;
        p.rotZ += p.vRotZ;

        p.mesh.position.set(p.x, p.y, p.z);
        p.mesh.rotation.set(p.rotX, p.rotY, p.rotZ);
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
      renderer.setSize(newW, newH);
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
    cameraSphericalRef.current.radius = Math.max(18, Math.min(65, cameraSphericalRef.current.radius + delta));
  };

  const handleResetCamera = () => {
    cameraSphericalRef.current = { radius: 38, theta: Math.PI / 4, phi: Math.PI / 2.7 };
  };

  return (
    <div className={`relative w-full aspect-[4/3] max-w-[460px] bg-slate-950 border-2 border-slate-700/60 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center select-none group transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 max-w-none aspect-auto shadow-2xl' : ''
    }`}>
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
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-20 pointer-events-none text-[10px] font-mono">
        <div className="px-2 py-0.5 rounded bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5 shadow-md">
          <span className="font-bold text-white">{substance.name}</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-bold">{phaseName}</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400 font-bold">P = {pressureAtm.toFixed(2)} Atm</span>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 z-20 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-md">
        <button
          onClick={() => handleZoom(-5)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={t('تقريب (Zoom In)', 'Zoom In')}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom(5)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={t('تبعيد (Zoom Out)', 'Zoom Out')}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1 rounded-lg transition-colors ${
            autoRotate ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title={t('دوران تلقائي (Auto-rotate)', 'Auto-rotate')}
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={t('إعادة ضبط زاوية الرؤية', 'Reset Camera')}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={isFullscreen ? t('تصغير', 'Exit Fullscreen') : t('تكبير الشاشة', 'Fullscreen')}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 font-mono bg-slate-950/70 px-2 py-0.5 rounded-md border border-slate-800 pointer-events-none">
        <span>🖱️ {t('اسحب للتدوير 360° | عجل الماوس للتقريب', 'Drag 360° | Scroll zoom')}</span>
      </div>
    </div>
  );
};
