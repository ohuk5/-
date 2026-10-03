import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Flame,
  Thermometer,
  Zap,
  Sparkles,
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  Wind,
  Layers,
  FlaskConical,
  Droplet,
  Box
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface LabViewer3DProps {
  totalVolumeMl: number;
  fluidColor: string;
  currentTempC: number;
  phValue: number;
  burnerPower: 'off' | 'low' | 'med' | 'high';
  isStirring: boolean;
  isThermometerActive: boolean;
  precipitateG: number;
  effervescenceBubbles: number;
  isConductivityActive?: boolean;
  conductivityGlow?: number; // 0 to 1
  flameTestMetal?: string; // 'none' | 'copper' | 'sodium' | 'potassium' | 'calcium' | 'barium' | 'strontium'
  isEthanolBurning?: boolean;
  displayedWeightG?: number;
  litmusStripDipped?: boolean;
  hydrogenGasMl?: number;
  dispenseTrigger?: number;
  iceCount?: number;
  hasActiveMetal?: 'none' | 'sodium' | 'potassium';
  hasMagnesiumRibbon?: boolean;
  precipitateType?: 'none' | 'silver_chloride' | 'copper_hydroxide' | 'barium_sulfate' | 'iron';
}

export const LabViewer3D: React.FC<LabViewer3DProps> = ({
  totalVolumeMl,
  fluidColor,
  currentTempC,
  phValue,
  burnerPower,
  isStirring,
  isThermometerActive,
  precipitateG,
  effervescenceBubbles,
  isConductivityActive = false,
  conductivityGlow = 0,
  flameTestMetal = 'none',
  isEthanolBurning = false,
  displayedWeightG = 185.0,
  litmusStripDipped = false,
  hydrogenGasMl = 0,
  dispenseTrigger = 0,
  iceCount = 0,
  hasActiveMetal = 'none',
  hasMagnesiumRibbon = false,
  precipitateType = 'none'
}) => {
  const { lang, t } = useApp();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera spherical coordinates & target (Closer radius: 22 so beaker fills viewport prominently)
  const cameraSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 22,
    theta: Math.PI / 3.8,
    phi: Math.PI / 2.65
  });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 6.8, 0));

  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeCameraView, setActiveCameraView] = useState<'beaker' | 'top' | 'flame' | 'overview'>('beaker');

  // Live state reference to prevent any stale closures in animation loop
  const liveStateRef = useRef({
    totalVolumeMl,
    fluidColor,
    currentTempC,
    phValue,
    burnerPower,
    isStirring,
    isThermometerActive,
    precipitateG,
    effervescenceBubbles,
    isConductivityActive,
    conductivityGlow,
    flameTestMetal,
    isEthanolBurning,
    displayedWeightG,
    litmusStripDipped,
    hydrogenGasMl,
    iceCount,
    hasActiveMetal,
    hasMagnesiumRibbon,
    precipitateType
  });

  liveStateRef.current = {
    totalVolumeMl,
    fluidColor,
    currentTempC,
    phValue,
    burnerPower,
    isStirring,
    isThermometerActive,
    precipitateG,
    effervescenceBubbles,
    isConductivityActive,
    conductivityGlow,
    flameTestMetal,
    isEthanolBurning,
    displayedWeightG,
    litmusStripDipped,
    hydrogenGasMl,
    iceCount,
    hasActiveMetal,
    hasMagnesiumRibbon,
    precipitateType
  };

  // Live 3D object references
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const liquidMeniscusRef = useRef<THREE.Mesh | null>(null);
  const liquidLightRef = useRef<THREE.PointLight | null>(null);
  const precipitateMeshRef = useRef<THREE.Mesh | null>(null);
  const stirBarMeshRef = useRef<THREE.Mesh | null>(null);
  const stirRodGroupRef = useRef<THREE.Group | null>(null);
  const flameMeshRef = useRef<THREE.Mesh | null>(null);
  const flameLightRef = useRef<THREE.PointLight | null>(null);
  const innerFlameMeshRef = useRef<THREE.Mesh | null>(null);
  const bubblesGroupRef = useRef<THREE.Group | null>(null);
  const steamGroupRef = useRef<THREE.Group | null>(null);
  const foamGroupRef = useRef<THREE.Group | null>(null);
  const iceCubesGroupRef = useRef<THREE.Group | null>(null);
  const activeMetalGroupRef = useRef<THREE.Group | null>(null);
  const metalFlameMeshRef = useRef<THREE.Mesh | null>(null);
  const metalFlameLightRef = useRef<THREE.PointLight | null>(null);
  const magnesiumRibbonMeshRef = useRef<THREE.Mesh | null>(null);
  const thermometerGroupRef = useRef<THREE.Group | null>(null);
  const conductivityGroupRef = useRef<THREE.Group | null>(null);
  const bulbLightRef = useRef<THREE.PointLight | null>(null);
  const bulbMeshRef = useRef<THREE.Mesh | null>(null);
  const flameTestWireGroupRef = useRef<THREE.Group | null>(null);
  const flameTestLoopMeshRef = useRef<THREE.Mesh | null>(null);
  const litmusStripGroupRef = useRef<THREE.Group | null>(null);
  const litmusImmersedMeshRef = useRef<THREE.Mesh | null>(null);
  const gasSyringeGroupRef = useRef<THREE.Group | null>(null);
  const gasPlungerMeshRef = useRef<THREE.Mesh | null>(null);
  const gasFluidMeshRef = useRef<THREE.Mesh | null>(null);
  const dropperGroupRef = useRef<THREE.Group | null>(null);
  const fallingDropletRef = useRef<{ mesh: THREE.Mesh; progress: number; active: boolean } | null>(null);
  const balanceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const balanceTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // --- INITIALIZE THREE.JS SCENE WITH FULL 3D CHEMISTRY LABORATORY ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 520;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.008);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    cameraRef.current = camera;
    const { radius, theta, phi } = cameraSphericalRef.current;
    camera.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
    camera.lookAt(cameraTargetRef.current);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio & Lab Lighting
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.90);
    scene.add(ambientLight);

    // Primary Overhead Key Light
    const keyLight = new THREE.DirectionalLight(0xe0f2fe, 1.5);
    keyLight.position.set(14, 28, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Soft Rim Light from back-left
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    rimLight.position.set(-20, 16, -18);
    scene.add(rimLight);

    // Laboratory Table Bench Top
    const tableGeo = new THREE.CylinderGeometry(28, 28, 1.6, 64);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      roughness: 0.45,
      metalness: 0.25
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -7.2;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Metallic Table Trim Ring
    const tableTrimGeo = new THREE.TorusGeometry(28, 0.25, 12, 64);
    tableTrimGeo.rotateX(Math.PI / 2);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85, roughness: 0.2 });
    const tableTrim = new THREE.Mesh(tableTrimGeo, trimMat);
    tableTrim.position.y = -6.4;
    scene.add(tableTrim);

    // High-tech Workbench Grid
    const gridHelper = new THREE.GridHelper(38, 19, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -6.38;
    scene.add(gridHelper);

    // Analytical Scale / Balance Platform
    const balanceGroup = new THREE.Group();
    balanceGroup.position.set(0, -6.35, 0);

    const balBaseGeo = new THREE.BoxGeometry(14.5, 1.2, 14.5);
    const balBaseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.35
    });
    const balBase = new THREE.Mesh(balBaseGeo, balBaseMat);
    balBase.position.y = 0.6;
    balBase.receiveShadow = true;
    balanceGroup.add(balBase);

    // Stainless Steel Weighing Pan Disc
    const panGeo = new THREE.CylinderGeometry(6.6, 6.6, 0.2, 36);
    const panMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.12
    });
    const pan = new THREE.Mesh(panGeo, panMat);
    pan.position.y = 1.3;
    pan.receiveShadow = true;
    balanceGroup.add(pan);

    // Front Digital LED Display Screen Canvas Texture
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 256;
    bCanvas.height = 72;
    balanceCanvasRef.current = bCanvas;

    const bCtx = bCanvas.getContext('2d');
    if (bCtx) {
      bCtx.fillStyle = '#020617';
      bCtx.fillRect(0, 0, 256, 72);
      bCtx.strokeStyle = '#0284c7';
      bCtx.lineWidth = 4;
      bCtx.strokeRect(2, 2, 252, 68);
      bCtx.font = 'bold 36px monospace';
      bCtx.fillStyle = '#38bdf8';
      bCtx.textAlign = 'right';
      bCtx.fillText(`${displayedWeightG.toFixed(1)} g`, 240, 50);
    }

    const bTex = new THREE.CanvasTexture(bCanvas);
    balanceTextureRef.current = bTex;
    const bScreenMat = new THREE.MeshBasicMaterial({ map: bTex });
    const bScreenGeo = new THREE.PlaneGeometry(5.0, 1.3);
    const bScreenMesh = new THREE.Mesh(bScreenGeo, bScreenMat);
    bScreenMesh.position.set(0, 0.65, 7.3);
    balanceGroup.add(bScreenMesh);

    scene.add(balanceGroup);

    // Bunsen Burner & Metallic Heavy Tripod Stand
    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(0, -4.95, 0);

    const burnerMetalMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.35,
      metalness: 0.85
    });

    // Burner Heavy Base
    const burnerBaseGeo = new THREE.CylinderGeometry(2.8, 3.4, 0.7, 24);
    const burnerBase = new THREE.Mesh(burnerBaseGeo, burnerMetalMat);
    burnerGroup.add(burnerBase);

    // Burner Chimney Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.75, 0.75, 4.6, 18);
    const barrel = new THREE.Mesh(barrelGeo, burnerMetalMat);
    barrel.position.y = 2.7;
    burnerGroup.add(barrel);

    // Air collar ring
    const collarGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.85, 18);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.y = 1.5;
    burnerGroup.add(collar);

    // Tripod Legs (3 legs)
    const legGeo = new THREE.CylinderGeometry(0.22, 0.26, 9.6, 12);
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const leg = new THREE.Mesh(legGeo, burnerMetalMat);
      leg.position.set(Math.cos(angle) * 5.8, 4.2, Math.sin(angle) * 5.8);
      leg.rotation.z = Math.cos(angle) * -0.14;
      leg.rotation.x = Math.sin(angle) * 0.14;
      burnerGroup.add(leg);
    }

    // Tripod Top Ring
    const tripodRingGeo = new THREE.TorusGeometry(5.6, 0.30, 12, 32);
    tripodRingGeo.rotateX(Math.PI / 2);
    const tripodRing = new THREE.Mesh(tripodRingGeo, burnerMetalMat);
    tripodRing.position.y = 8.8;
    burnerGroup.add(tripodRing);

    // Ceramic Wire Gauze Plate
    const gauzeGeo = new THREE.CylinderGeometry(5.4, 5.4, 0.15, 24);
    const gauzeMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.85,
      metalness: 0.3,
      wireframe: true
    });
    const gauzeMesh = new THREE.Mesh(gauzeGeo, gauzeMat);
    gauzeMesh.position.y = 9.0;
    burnerGroup.add(gauzeMesh);

    scene.add(burnerGroup);

    // Bunsen Flame (Volumetric Cones + PointLight)
    const flameGeo = new THREE.ConeGeometry(1.2, 4.5, 18);
    flameGeo.translate(0, 2.25, 0);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.set(0, -0.2, 0);
    flameMesh.visible = false;
    scene.add(flameMesh);
    flameMeshRef.current = flameMesh;

    // Inner Flame Core
    const innerFlameGeo = new THREE.ConeGeometry(0.6, 2.8, 16);
    innerFlameGeo.translate(0, 1.4, 0);
    const innerFlameMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const innerFlameMesh = new THREE.Mesh(innerFlameGeo, innerFlameMat);
    innerFlameMesh.position.set(0, -0.2, 0);
    innerFlameMesh.visible = false;
    scene.add(innerFlameMesh);
    innerFlameMeshRef.current = innerFlameMesh;

    const flameLight = new THREE.PointLight(0x38bdf8, 0, 18);
    flameLight.position.set(0, 2.2, 0);
    scene.add(flameLight);
    flameLightRef.current = flameLight;

    // 3D Glass Beaker (Borosilicate Glass)
    const beakerGroup = new THREE.Group();
    beakerGroup.position.set(0, 4.15, 0); // Sits on top of tripod wire gauze

    const beakerRadius = 5.2;
    const beakerHeight = 12.0;

    // Authentic laboratory glass material with refraction
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.20,
      roughness: 0.04,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: false, // Ensures liquid inside is completely visible without occlusion!
      side: THREE.FrontSide
    });

    // Glass Wall Cylinder
    const glassGeo = new THREE.CylinderGeometry(beakerRadius, beakerRadius * 0.96, beakerHeight, 48, 1, true);
    const glassBody = new THREE.Mesh(glassGeo, glassMat);
    glassBody.position.y = beakerHeight / 2;
    glassBody.castShadow = true;
    glassBody.renderOrder = 10; // Glass renders after liquid
    beakerGroup.add(glassBody);

    // Beaker Bottom Glass Disc
    const bottomGeo = new THREE.CylinderGeometry(beakerRadius * 0.96, beakerRadius * 0.96, 0.35, 48);
    const bottomGlass = new THREE.Mesh(bottomGeo, glassMat);
    bottomGlass.position.y = 0.18;
    bottomGlass.renderOrder = 10;
    beakerGroup.add(bottomGlass);

    // Top Rim & Spout Ring
    const rimGeo = new THREE.TorusGeometry(beakerRadius, 0.16, 16, 48);
    rimGeo.rotateX(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, glassMat);
    rimMesh.position.y = beakerHeight;
    rimMesh.renderOrder = 10;
    beakerGroup.add(rimMesh);

    // Graduation Lines on Beaker (50mL to 250mL)
    const marksGroup = new THREE.Group();
    for (let m = 1; m <= 5; m++) {
      const markY = (m / 5) * (beakerHeight - 2.5) + 0.8;
      const markLineGeo = new THREE.TorusGeometry(beakerRadius + 0.02, 0.04, 8, 32, Math.PI / 3.2);
      markLineGeo.rotateX(Math.PI / 2);
      markLineGeo.rotateY(Math.PI / 6);
      const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
      const markMesh = new THREE.Mesh(markLineGeo, markMat);
      markMesh.position.y = markY;
      markMesh.renderOrder = 11;
      marksGroup.add(markMesh);
    }
    beakerGroup.add(marksGroup);

    // Dynamic Liquid inside Beaker (Open Ended Cylinder so Meniscus Disc acts as natural top cap!)
    const liquidGeo = new THREE.CylinderGeometry(beakerRadius * 0.94, beakerRadius * 0.90, 1, 48, 1, true);
    liquidGeo.translate(0, 0.5, 0); // anchored at bottom
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      roughness: 0.08,
      metalness: 0.06,
      depthWrite: false, // Prevents z-fighting and ensures internal objects are completely visible!
      side: THREE.DoubleSide
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = 0.35;
    liquidMesh.renderOrder = 3;
    beakerGroup.add(liquidMesh);
    liquidMeshRef.current = liquidMesh;

    // Liquid Top Surface Meniscus Disc
    const meniscusGeo = new THREE.CircleGeometry(beakerRadius * 0.93, 48);
    meniscusGeo.rotateX(-Math.PI / 2);
    const meniscusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.90,
      roughness: 0.06,
      metalness: 0.08,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const meniscusMesh = new THREE.Mesh(meniscusGeo, meniscusMat);
    meniscusMesh.position.y = 0.35;
    meniscusMesh.renderOrder = 3;
    beakerGroup.add(meniscusMesh);
    liquidMeniscusRef.current = meniscusMesh;

    // Internal Liquid Glow Point Light (gives rich volumetric lighting to fluid)
    const liquidLight = new THREE.PointLight(0x38bdf8, 1.2, 16);
    liquidLight.position.set(0, 3.5, 0);
    beakerGroup.add(liquidLight);
    liquidLightRef.current = liquidLight;

    // Precipitate Layer at Bottom of Beaker
    const precipGeo = new THREE.CylinderGeometry(beakerRadius * 0.90, beakerRadius * 0.90, 1, 36);
    precipGeo.translate(0, 0.5, 0); // Anchored at bottom to scale upwards
    const precipMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.85,
      metalness: 0.1
    });
    const precipMesh = new THREE.Mesh(precipGeo, precipMat);
    precipMesh.position.y = 0.35;
    precipMesh.renderOrder = 2;
    precipMesh.visible = false;
    beakerGroup.add(precipMesh);
    precipitateMeshRef.current = precipMesh;

    // Authentic Laboratory Glass Stirring Rod (عصا التحريك الزجاجية المخبرية)
    const stirRodGroup = new THREE.Group();
    stirRodGroup.renderOrder = 4;
    beakerGroup.add(stirRodGroup);
    stirRodGroupRef.current = stirRodGroup;

    // Glass Rod Cylinder Body
    const glassStirRodGeo = new THREE.CylinderGeometry(0.24, 0.24, 17.0, 16);
    const glassStirRodMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0f9ff,
      transmission: 0.92,
      opacity: 0.85,
      transparent: true,
      roughness: 0.08,
      metalness: 0.05,
      ior: 1.52,
      depthWrite: false
    });
    const rodMesh = new THREE.Mesh(glassStirRodGeo, glassStirRodMat);
    stirRodGroup.add(rodMesh);

    // Rounded Glass Bottom Tip (for gentle mixing without scratching beaker base)
    const rodTipGeo = new THREE.SphereGeometry(0.26, 16, 16);
    const rodTipMesh = new THREE.Mesh(rodTipGeo, glassStirRodMat);
    rodTipMesh.position.y = -8.5;
    stirRodGroup.add(rodTipMesh);

    // Rounded Glass Top Grip Handle
    const rodTopGeo = new THREE.SphereGeometry(0.29, 16, 16);
    const rodTopMesh = new THREE.Mesh(rodTopGeo, glassStirRodMat);
    rodTopMesh.position.y = 8.5;
    stirRodGroup.add(rodTopMesh);

    // Resting orientation in beaker
    stirRodGroup.position.set(1.4, 8.5, 0.8);
    stirRodGroup.rotation.set(0.18, 0, -0.32);

    // Bubbles Group inside Beaker
    const bubblesGroup = new THREE.Group();
    bubblesGroup.renderOrder = 2;
    beakerGroup.add(bubblesGroup);
    bubblesGroupRef.current = bubblesGroup;

    const bubbleGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    for (let b = 0; b < 36; b++) {
      const bMesh = new THREE.Mesh(bubbleGeo, bubbleMat);
      bMesh.position.set(
        (Math.random() - 0.5) * (beakerRadius * 1.4),
        0.5 + Math.random() * 8,
        (Math.random() - 0.5) * (beakerRadius * 1.4)
      );
      bMesh.userData = { speed: 0.08 + Math.random() * 0.15, wobble: Math.random() * Math.PI };
      bMesh.visible = false;
      bubblesGroup.add(bMesh);
    }

    // Surface Foam Ring (appears during violent reactions or boiling)
    const foamGroup = new THREE.Group();
    foamGroup.renderOrder = 4;
    const foamBubbleGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const foamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, transparent: true, opacity: 0.85 });
    for (let f = 0; f < 24; f++) {
      const angle = (f / 24) * Math.PI * 2;
      const r = (beakerRadius * 0.75) + (Math.random() - 0.5) * 0.8;
      const fMesh = new THREE.Mesh(foamBubbleGeo, foamMat);
      fMesh.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      foamGroup.add(fMesh);
    }
    foamGroup.visible = false;
    beakerGroup.add(foamGroup);
    foamGroupRef.current = foamGroup;

    // 3D Floating Ice Cubes
    const iceGroup = new THREE.Group();
    iceGroup.renderOrder = 2;
    const iceGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.78,
      roughness: 0.12,
      metalness: 0.05
    });
    for (let i = 0; i < 5; i++) {
      const iceCube = new THREE.Mesh(iceGeo, iceMat);
      iceCube.position.set((Math.random() - 0.5) * 4.0, 0, (Math.random() - 0.5) * 4.0);
      iceCube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      iceCube.userData = { offset: i * 1.3 };
      iceGroup.add(iceCube);
    }
    iceGroup.visible = false;
    beakerGroup.add(iceGroup);
    iceCubesGroupRef.current = iceGroup;

    // 3D Floating Skittering Alkali Metal (Sodium/Potassium)
    const metalGroup = new THREE.Group();
    metalGroup.renderOrder = 4;
    const pelletGeo = new THREE.SphereGeometry(0.48, 16, 16);
    const pelletMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 });
    const pelletMesh = new THREE.Mesh(pelletGeo, pelletMat);
    metalGroup.add(pelletMesh);

    // Mini flare/fire on metal
    const flareGeo = new THREE.ConeGeometry(0.5, 1.4, 12);
    flareGeo.translate(0, 0.7, 0);
    const flareMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, blending: THREE.AdditiveBlending });
    const flareMesh = new THREE.Mesh(flareGeo, flareMat);
    metalGroup.add(flareMesh);
    metalFlameMeshRef.current = flareMesh;

    const metalLight = new THREE.PointLight(0xf59e0b, 1.8, 8);
    metalLight.position.set(0, 0.8, 0);
    metalGroup.add(metalLight);
    metalFlameLightRef.current = metalLight;

    metalGroup.visible = false;
    beakerGroup.add(metalGroup);
    activeMetalGroupRef.current = metalGroup;

    // 3D Magnesium Ribbon
    const mgGeo = new THREE.TorusGeometry(1.6, 0.12, 8, 24, Math.PI * 1.5);
    const mgMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const mgMesh = new THREE.Mesh(mgGeo, mgMat);
    mgMesh.position.set(0, 1.2, 0);
    mgMesh.rotation.x = Math.PI / 2;
    mgMesh.visible = false;
    beakerGroup.add(mgMesh);
    magnesiumRibbonMeshRef.current = mgMesh;

    // Steam Group Emerging from Beaker Top
    const steamGroup = new THREE.Group();
    steamGroup.position.set(0, beakerHeight, 0);
    beakerGroup.add(steamGroup);
    steamGroupRef.current = steamGroup;

    const steamGeo = new THREE.SphereGeometry(0.48, 8, 8);
    const steamMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.35 });
    for (let s = 0; s < 24; s++) {
      const sMesh = new THREE.Mesh(steamGeo, steamMat);
      sMesh.position.set(
        (Math.random() - 0.5) * 4.5,
        Math.random() * 8,
        (Math.random() - 0.5) * 4.5
      );
      sMesh.userData = { speed: 0.05 + Math.random() * 0.09 };
      sMesh.visible = false;
      steamGroup.add(sMesh);
    }

    // Digital Thermometer Probe
    const thermometerGroup = new THREE.Group();
    thermometerGroup.renderOrder = 2;
    const probeGeo = new THREE.CylinderGeometry(0.2, 0.2, 14, 16);
    const probeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    const probeMesh = new THREE.Mesh(probeGeo, probeMat);
    probeMesh.position.set(2.8, 8, 1.2);
    probeMesh.rotation.z = -0.15;
    thermometerGroup.add(probeMesh);

    const gaugeGeo = new THREE.BoxGeometry(2.4, 1.8, 0.8);
    const gaugeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const gaugeMesh = new THREE.Mesh(gaugeGeo, gaugeMat);
    gaugeMesh.position.set(3.8, 14.8, 1.2);
    thermometerGroup.add(gaugeMesh);

    const screenGeo = new THREE.PlaneGeometry(1.8, 1.2);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(3.8, 14.8, 1.62);
    thermometerGroup.add(screen);

    thermometerGroup.visible = false;
    beakerGroup.add(thermometerGroup);
    thermometerGroupRef.current = thermometerGroup;

    // Electrical Conductivity Tester Electrodes & Light Bulb
    const conductivityGroup = new THREE.Group();
    conductivityGroup.renderOrder = 2;

    const rodGeo = new THREE.CylinderGeometry(0.18, 0.18, 12, 12);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const rod1 = new THREE.Mesh(rodGeo, rodMat);
    rod1.position.set(-1.8, 6.5, 0);
    const rod2 = new THREE.Mesh(rodGeo, rodMat);
    rod2.position.set(-0.6, 6.5, 0);
    conductivityGroup.add(rod1);
    conductivityGroup.add(rod2);

    const crossArmGeo = new THREE.BoxGeometry(3.2, 0.6, 0.8);
    const crossArm = new THREE.Mesh(crossArmGeo, rodMat);
    crossArm.position.set(-1.2, 12.5, 0);
    conductivityGroup.add(crossArm);

    // Indicator Light Bulb
    const bulbGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.2,
      emissive: 0x000000,
      emissiveIntensity: 0
    });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.set(-1.2, 14.0, 0);
    conductivityGroup.add(bulbMesh);
    bulbMeshRef.current = bulbMesh;

    const bulbLight = new THREE.PointLight(0xfef08a, 0, 12);
    bulbLight.position.set(-1.2, 14.0, 0);
    conductivityGroup.add(bulbLight);
    bulbLightRef.current = bulbLight;

    conductivityGroup.visible = false;
    beakerGroup.add(conductivityGroup);
    conductivityGroupRef.current = conductivityGroup;

    // Platinum Flame Test Wire Loop
    const flameWireGroup = new THREE.Group();
    flameWireGroup.position.set(0, 0, 0);

    const wireHandleGeo = new THREE.CylinderGeometry(0.3, 0.3, 8.5, 12);
    wireHandleGeo.rotateX(Math.PI / 2.8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const wireHandle = new THREE.Mesh(wireHandleGeo, handleMat);
    wireHandle.position.set(4.5, 0.5, 6.5);
    flameWireGroup.add(wireHandle);

    const ptWireGeo = new THREE.CylinderGeometry(0.08, 0.08, 6.0, 8);
    ptWireGeo.rotateX(Math.PI / 2.8);
    const ptMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const ptWire = new THREE.Mesh(ptWireGeo, ptMat);
    ptWire.position.set(1.8, 1.2, 2.5);
    flameWireGroup.add(ptWire);

    const loopGeo = new THREE.TorusGeometry(0.4, 0.07, 8, 20);
    const loopMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 1.5 });
    const loopMesh = new THREE.Mesh(loopGeo, loopMat);
    loopMesh.position.set(0.0, 2.0, 0);
    flameWireGroup.add(loopMesh);
    flameTestLoopMeshRef.current = loopMesh;

    flameWireGroup.visible = false;
    scene.add(flameWireGroup);
    flameTestWireGroupRef.current = flameWireGroup;

    // Litmus Paper Strip in Beaker
    const litmusGroup = new THREE.Group();
    litmusGroup.renderOrder = 2;

    const litmusDryGeo = new THREE.BoxGeometry(0.9, 5.0, 0.08);
    const litmusDryMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
    const litmusDry = new THREE.Mesh(litmusDryGeo, litmusDryMat);
    litmusDry.position.set(-2.5, 9.5, 1.8);
    litmusDry.rotation.z = 0.22;
    litmusGroup.add(litmusDry);

    const litmusImmersedGeo = new THREE.BoxGeometry(0.9, 4.0, 0.08);
    const litmusImmersedMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.9 });
    const litmusImmersed = new THREE.Mesh(litmusImmersedGeo, litmusImmersedMat);
    litmusImmersed.position.set(-3.3, 5.2, 1.8);
    litmusImmersed.rotation.z = 0.22;
    litmusGroup.add(litmusImmersed);
    litmusImmersedMeshRef.current = litmusImmersed;

    litmusGroup.visible = false;
    beakerGroup.add(litmusGroup);
    litmusStripGroupRef.current = litmusGroup;

    // Gas Collection Syringe
    const syringeGroup = new THREE.Group();
    syringeGroup.position.set(0, beakerHeight + 1.2, 0);

    const sBarrelGeo = new THREE.CylinderGeometry(1.6, 1.6, 7.5, 24, 1, true);
    const sBarrel = new THREE.Mesh(sBarrelGeo, glassMat);
    sBarrel.position.y = 3.75;
    syringeGroup.add(sBarrel);

    const plungerGeo = new THREE.CylinderGeometry(1.55, 1.55, 0.6, 24);
    const plungerMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const plungerMesh = new THREE.Mesh(plungerGeo, plungerMat);
    plungerMesh.position.y = 1.2;
    syringeGroup.add(plungerMesh);
    gasPlungerMeshRef.current = plungerMesh;

    syringeGroup.visible = false;
    beakerGroup.add(syringeGroup);
    gasSyringeGroupRef.current = syringeGroup;

    // Dropper Pipette Above Beaker
    const dropperGroup = new THREE.Group();
    dropperGroup.position.set(0, beakerHeight + 4.5, 0);

    const dropTubeGeo = new THREE.CylinderGeometry(0.4, 0.15, 4.2, 16);
    const dropTube = new THREE.Mesh(dropTubeGeo, glassMat);
    dropperGroup.add(dropTube);

    const dropBulbGeo = new THREE.SphereGeometry(0.65, 16, 16);
    dropBulbGeo.scale(1, 1.4, 1);
    const dropBulbMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
    const dropBulb = new THREE.Mesh(dropBulbGeo, dropBulbMat);
    dropBulb.position.y = 2.4;
    dropperGroup.add(dropBulb);

    beakerGroup.add(dropperGroup);
    dropperGroupRef.current = dropperGroup;

    // Falling Droplet for Dispensing Animations
    const dropletGeo = new THREE.SphereGeometry(0.32, 16, 16);
    dropletGeo.scale(1, 1.3, 1);
    const dropletMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 });
    const dropletMesh = new THREE.Mesh(dropletGeo, dropletMat);
    dropletMesh.visible = false;
    beakerGroup.add(dropletMesh);
    fallingDropletRef.current = { mesh: dropletMesh, progress: 0, active: false };

    scene.add(beakerGroup);

    // Erlenmeyer Flask on Workbench
    const flaskGroup = new THREE.Group();
    flaskGroup.position.set(-13.5, -6.35, 3.5);

    const fBodyGeo = new THREE.CylinderGeometry(1.2, 3.8, 6.5, 32);
    const fBody = new THREE.Mesh(fBodyGeo, glassMat);
    fBody.position.y = 3.25;
    fBody.castShadow = true;
    flaskGroup.add(fBody);

    const fNeckGeo = new THREE.CylinderGeometry(1.0, 1.0, 3.2, 24);
    const fNeck = new THREE.Mesh(fNeckGeo, glassMat);
    fNeck.position.y = 7.8;
    flaskGroup.add(fNeck);

    const fLiqGeo = new THREE.CylinderGeometry(1.8, 3.6, 3.5, 32);
    const fLiqMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.80,
      roughness: 0.2
    });
    const fLiq = new THREE.Mesh(fLiqGeo, fLiqMat);
    fLiq.position.y = 1.85;
    flaskGroup.add(fLiq);

    scene.add(flaskGroup);

    // Amber Reagent Dropper Bottle
    const bottleGroup = new THREE.Group();
    bottleGroup.position.set(-16.0, -6.35, -4.0);

    const amberGlassMat = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88
    });

    const botBodyGeo = new THREE.CylinderGeometry(1.65, 1.65, 5.2, 24);
    const botBody = new THREE.Mesh(botBodyGeo, amberGlassMat);
    botBody.position.y = 2.6;
    botBody.castShadow = true;
    bottleGroup.add(botBody);

    const botShoulderGeo = new THREE.CylinderGeometry(0.8, 1.65, 1.0, 24);
    const botShoulder = new THREE.Mesh(botShoulderGeo, amberGlassMat);
    botShoulder.position.y = 5.7;
    bottleGroup.add(botShoulder);

    const capGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.85, 20);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 6.6;
    bottleGroup.add(cap);

    const bulbGeo2 = new THREE.SphereGeometry(0.8, 16, 16);
    bulbGeo2.scale(1, 1.45, 1);
    const rBulbMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.6 });
    const rBulb = new THREE.Mesh(bulbGeo2, rBulbMat);
    rBulb.position.y = 7.7;
    bottleGroup.add(rBulb);

    scene.add(bottleGroup);

    // Wooden Test Tube Rack with 3 Colorful Tubes
    const rackGroup = new THREE.Group();
    rackGroup.position.set(13.5, -6.35, 3.0);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const baseBoardGeo = new THREE.BoxGeometry(11.0, 0.6, 3.6);
    const baseBoard = new THREE.Mesh(baseBoardGeo, woodMat);
    baseBoard.position.y = 0.3;
    rackGroup.add(baseBoard);

    const topBoardGeo = new THREE.BoxGeometry(11.0, 0.6, 3.6);
    const topBoard = new THREE.Mesh(topBoardGeo, woodMat);
    topBoard.position.y = 4.8;
    rackGroup.add(topBoard);

    // 3 Test Tubes with different colorful solutions
    const tubeColors = [0xef4444, 0x10b981, 0x8b5cf6];
    for (let t = 0; t < 3; t++) {
      const posX = (t - 1) * 3.2;
      const tubeGeo = new THREE.CylinderGeometry(0.65, 0.65, 6.8, 20, 1, true);
      const tubeMesh = new THREE.Mesh(tubeGeo, glassMat);
      tubeMesh.position.set(posX, 4.0, 0);
      rackGroup.add(tubeMesh);

      const tLiqGeo = new THREE.CylinderGeometry(0.58, 0.58, 3.8, 16);
      const tLiqMat = new THREE.MeshStandardMaterial({
        color: tubeColors[t],
        transparent: true,
        opacity: 0.85,
        roughness: 0.2
      });
      const tLiq = new THREE.Mesh(tLiqGeo, tLiqMat);
      tLiq.position.set(posX, 2.5, 0);
      rackGroup.add(tLiq);
    }

    scene.add(rackGroup);

    // --- ANIMATION LOOP ---
    let time = 0;
    const animate = () => {
      time += 0.02;

      // Camera auto-rotation
      if (autoRotate && !isDraggingRef.current) {
        cameraSphericalRef.current.theta += 0.005;
      }

      const { radius: cR, theta: cT, phi: cP } = cameraSphericalRef.current;
      camera.position.set(
        cR * Math.sin(cP) * Math.cos(cT),
        cR * Math.cos(cP),
        cR * Math.sin(cP) * Math.sin(cT)
      );
      camera.lookAt(cameraTargetRef.current);

      // Read current live state to prevent any stale closures
      const {
        totalVolumeMl: curVol,
        currentTempC: curTemp,
        isStirring: curStir,
        effervescenceBubbles: curBubbles,
        iceCount: curIce,
        hasActiveMetal: curMetal
      } = liveStateRef.current;

      const currentLiqH = Math.max(0.05, Math.min(10.5, (curVol / 250) * 10.5));
      const hasWater = curVol > 0;

      // 1. Authentic Glass Stirring Rod mixing motion
      if (stirRodGroupRef.current) {
        if (curStir && hasWater) {
          // Manual circular stirring motion through the liquid (تحريك العصا في مسار دائري داخل السائل)
          const stirSpeed = time * 7.5;
          const stirR = 2.2;
          const tipX = Math.cos(stirSpeed) * stirR;
          const tipZ = Math.sin(stirSpeed) * stirR;
          const topX = Math.cos(stirSpeed * 0.5) * 0.4 + 1.2;
          const topZ = Math.sin(stirSpeed * 0.5) * 0.4;
          stirRodGroupRef.current.position.set((tipX + topX) * 0.5, 8.5, (tipZ + topZ) * 0.5);
          stirRodGroupRef.current.rotation.z = -((topX - tipX) / 17.0);
          stirRodGroupRef.current.rotation.x = (topZ - tipZ) / 17.0;
          stirRodGroupRef.current.rotation.y = stirSpeed * 0.3;
        } else {
          // Natural resting slant inside beaker
          stirRodGroupRef.current.position.set(1.4, 8.5, 0.8);
          stirRodGroupRef.current.rotation.set(0.18, 0, -0.32);
        }
      }

      // 2. Liquid Meniscus rotation
      if (liquidMeniscusRef.current) {
        liquidMeniscusRef.current.position.y = 0.35 + currentLiqH;
        liquidMeniscusRef.current.visible = hasWater;
        if (curStir && hasWater) {
          liquidMeniscusRef.current.rotation.z += 0.22;
        }
      }

      // 3. Flame flicker animation
      if (flameMeshRef.current && flameMeshRef.current.visible) {
        const flicker = 1.0 + Math.sin(time * 24) * 0.08 + Math.cos(time * 36) * 0.05;
        flameMeshRef.current.scale.set(flicker, flicker, flicker);
        if (innerFlameMeshRef.current) {
          innerFlameMeshRef.current.scale.set(flicker * 0.95, flicker * 0.95, flicker * 0.95);
        }
      }

      // 4. Bubbles rise animation
      if (bubblesGroupRef.current) {
        const bubbleSpeedMultiplier = curTemp > 90 ? 1.6 : 1.0;
        bubblesGroupRef.current.children.forEach((b: THREE.Object3D) => {
          if (b.visible) {
            b.position.y += (b.userData.speed || 0.09) * bubbleSpeedMultiplier;
            b.position.x += Math.sin(time * 8 + b.userData.wobble) * 0.02;
            if (b.position.y > currentLiqH + 0.3) {
              b.position.y = 0.5;
            }
          }
        });
      }

      // 5. Steam rise animation
      if (steamGroupRef.current) {
        steamGroupRef.current.children.forEach((s: THREE.Object3D) => {
          if (s.visible) {
            s.position.y += (s.userData.speed || 0.05);
            s.position.x += Math.sin(time * 2 + s.position.y) * 0.02;
            if (s.position.y > 10) {
              s.position.y = 0;
            }
          }
        });
      }

      // 6. Foam ring animation
      if (foamGroupRef.current) {
        foamGroupRef.current.position.y = 0.35 + currentLiqH;
        const showFoam = hasWater && (curTemp >= 95 || curBubbles > 20);
        foamGroupRef.current.visible = showFoam;
        if (showFoam) {
          foamGroupRef.current.rotation.y += 0.02;
        }
      }

      // 7. Floating Ice Cubes bobbing animation
      if (iceCubesGroupRef.current) {
        const showIce = hasWater && (curIce || 0) > 0;
        iceCubesGroupRef.current.visible = showIce;
        if (showIce) {
          iceCubesGroupRef.current.position.y = 0.35 + currentLiqH - 0.2;
          iceCubesGroupRef.current.children.forEach((c: THREE.Object3D, idx: number) => {
            c.position.y = Math.sin(time * 3 + (c.userData.offset || idx)) * 0.12;
            c.rotation.y += 0.01;
          });
        }
      }

      // 8. Active Alkali Metal Skittering & Fire
      if (activeMetalGroupRef.current) {
        const showMetal = hasWater && (curMetal === 'sodium' || curMetal === 'potassium');
        activeMetalGroupRef.current.visible = showMetal;
        if (showMetal) {
          const orbitR = 2.2;
          const metalX = Math.cos(time * 6) * orbitR + Math.sin(time * 14) * 0.4;
          const metalZ = Math.sin(time * 7) * orbitR + Math.cos(time * 11) * 0.4;
          activeMetalGroupRef.current.position.set(metalX, 0.35 + currentLiqH + 0.1, metalZ);
        }
      }

      // 9. Animated Falling Droplet Action
      const dropObj = fallingDropletRef.current;
      if (dropObj && dropObj.active) {
        dropObj.progress += 0.04;
        const startY = beakerHeight + 4.5;
        const targetY = Math.max(0.6, currentLiqH);
        const curY = startY - dropObj.progress * (startY - targetY);

        if (curY <= targetY) {
          dropObj.active = false;
          dropObj.mesh.visible = false;
        } else {
          dropObj.mesh.position.set(0, curY, 0);
          dropObj.mesh.visible = true;
        }
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Resize Observer Handler
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
  }, []);

  // --- TRIGGER DISPENSE ANIMATION ---
  useEffect(() => {
    if (dispenseTrigger > 0 && fallingDropletRef.current) {
      fallingDropletRef.current.active = true;
      fallingDropletRef.current.progress = 0;
      if (liquidMeshRef.current) {
        const mat = liquidMeshRef.current.material as THREE.MeshStandardMaterial;
        fallingDropletRef.current.mesh.material = mat;
      }
    }
  }, [dispenseTrigger]);

  // --- REACTIVE STATE UPDATES (FLUID LEVEL, COLOR, BALANCE, FLAME, BUBBLES, EFFECTS) ---
  useEffect(() => {
    // 1. Fluid Height & Color
    if (liquidMeshRef.current) {
      const maxLiqH = 10.5;
      const currentH = Math.max(0.05, Math.min(maxLiqH, (totalVolumeMl / 250) * maxLiqH));
      liquidMeshRef.current.scale.set(1, currentH, 1);
      liquidMeshRef.current.visible = totalVolumeMl > 0;

      if (liquidMeniscusRef.current) {
        liquidMeniscusRef.current.position.y = 0.35 + currentH;
        liquidMeniscusRef.current.visible = totalVolumeMl > 0;
      }

      const mat = liquidMeshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        try {
          if (fluidColor.startsWith('rgba') || fluidColor.startsWith('rgb')) {
            const matches = fluidColor.match(/[\d.]+/g);
            if (matches && matches.length >= 3) {
              const r = parseFloat(matches[0]) / 255;
              const g = parseFloat(matches[1]) / 255;
              const b = parseFloat(matches[2]) / 255;
              let alpha = 0.85;
              if (matches.length >= 4) {
                alpha = Math.max(0.80, parseFloat(matches[3]));
              }
              mat.color.setRGB(r, g, b);
              mat.opacity = alpha;

              if (liquidMeniscusRef.current) {
                const mMat = liquidMeniscusRef.current.material as THREE.MeshStandardMaterial;
                mMat.color.setRGB(r, g, b);
                mMat.opacity = Math.min(0.96, alpha + 0.1);
              }

              if (liquidLightRef.current) {
                liquidLightRef.current.color.setRGB(r, g, b);
                liquidLightRef.current.intensity = totalVolumeMl > 0 ? 1.4 : 0;
              }
            }
          } else if (fluidColor === 'transparent') {
            liquidMeshRef.current.visible = false;
            if (liquidMeniscusRef.current) liquidMeniscusRef.current.visible = false;
            if (liquidLightRef.current) liquidLightRef.current.intensity = 0;
          } else {
            mat.color.set(fluidColor);
            mat.opacity = 0.85;
            if (liquidMeniscusRef.current) {
              (liquidMeniscusRef.current.material as THREE.MeshStandardMaterial).color.set(fluidColor);
              (liquidMeniscusRef.current.material as THREE.MeshStandardMaterial).opacity = 0.92;
            }
            if (liquidLightRef.current) {
              liquidLightRef.current.color.set(fluidColor);
              liquidLightRef.current.intensity = totalVolumeMl > 0 ? 1.4 : 0;
            }
          }
        } catch {
          mat.color.set(0x38bdf8);
          mat.opacity = 0.85;
        }
      }
    }

    // 2. Precipitate Mesh
    if (precipitateMeshRef.current) {
      precipitateMeshRef.current.visible = precipitateG > 0;
      const sedH = Math.min(2.5, (precipitateG / 35) * 2.2 + 0.3);
      precipitateMeshRef.current.scale.set(1, sedH, 1);

      // Precipitate color adaptation
      const pMat = precipitateMeshRef.current.material as THREE.MeshStandardMaterial;
      if (precipitateType === 'silver_chloride' || precipitateType === 'barium_sulfate') {
        pMat.color.set(0xf8fafc); // Dense milky white
      } else if (precipitateType === 'copper_hydroxide') {
        pMat.color.set(0x38bdf8); // Sky blue
      } else if (precipitateType === 'iron') {
        pMat.color.set(0xb45309); // Rust brown
      } else {
        pMat.color.set(0x0284c7);
      }
    }

    // 3. Flame State & Flame Test Spectral Color
    if (flameMeshRef.current && innerFlameMeshRef.current && flameLightRef.current) {
      const isBurning = burnerPower !== 'off' || isEthanolBurning;
      flameMeshRef.current.visible = isBurning;
      innerFlameMeshRef.current.visible = isBurning;

      let flameHex = 0x06b6d4; // Default cyan/blue flame
      let innerHex = 0x38bdf8;
      let lightHex = 0x38bdf8;
      let intensity = burnerPower === 'high' ? 3.5 : burnerPower === 'med' ? 2.5 : burnerPower === 'low' ? 1.4 : 1.2;

      if (flameTestMetal === 'copper') {
        flameHex = 0x10b981; // Emerald green
        innerHex = 0x34d399;
        lightHex = 0x10b981;
      } else if (flameTestMetal === 'sodium') {
        flameHex = 0xf59e0b; // Bright golden yellow
        innerHex = 0xfbbf24;
        lightHex = 0xf59e0b;
      } else if (flameTestMetal === 'potassium') {
        flameHex = 0xa855f7; // Royal lilac / violet
        innerHex = 0xc084fc;
        lightHex = 0xa855f7;
      } else if (flameTestMetal === 'calcium') {
        flameHex = 0xea580c; // Brick red/orange
        innerHex = 0xfb923c;
        lightHex = 0xea580c;
      } else if (flameTestMetal === 'strontium') {
        flameHex = 0xe11d48; // Crimson red
        innerHex = 0xf43f5e;
        lightHex = 0xe11d48;
      } else if (flameTestMetal === 'barium') {
        flameHex = 0x84cc16; // Apple green
        innerHex = 0xa3e635;
        lightHex = 0x84cc16;
      } else if (isEthanolBurning) {
        flameHex = 0x38bdf8;
        innerHex = 0xf59e0b;
        lightHex = 0x60a5fa;
      }

      (flameMeshRef.current.material as THREE.MeshBasicMaterial).color.set(flameHex);
      (innerFlameMeshRef.current.material as THREE.MeshBasicMaterial).color.set(innerHex);
      flameLightRef.current.color.set(lightHex);
      flameLightRef.current.intensity = isBurning ? intensity : 0;

      // Flame test wire loop in 3D
      if (flameTestWireGroupRef.current && flameTestLoopMeshRef.current) {
        const isFlameTestActive = flameTestMetal !== 'none';
        flameTestWireGroupRef.current.visible = isFlameTestActive;
        if (isFlameTestActive) {
          const lMat = flameTestLoopMeshRef.current.material as THREE.MeshStandardMaterial;
          lMat.color.set(flameHex);
          lMat.emissive.set(flameHex);
        }
      }
    }

    // 4. Bubbles
    if (bubblesGroupRef.current) {
      const activeBubbleCount = Math.min(36, effervescenceBubbles > 0 ? Math.ceil(effervescenceBubbles / 1.8) : currentTempC >= 90 ? 24 : currentTempC >= 75 ? 12 : 0);
      bubblesGroupRef.current.children.forEach((b: THREE.Object3D, idx: number) => {
        b.visible = idx < activeBubbleCount;
      });
    }

    // 5. Steam
    if (steamGroupRef.current) {
      const showSteam = currentTempC >= 70 || effervescenceBubbles > 25;
      steamGroupRef.current.children.forEach((s: THREE.Object3D) => {
        s.visible = showSteam;
      });
    }

    // 6. Thermometer Probe Visibility
    if (thermometerGroupRef.current) {
      thermometerGroupRef.current.visible = isThermometerActive;
    }

    // 7. Electrical Conductivity Tester
    if (conductivityGroupRef.current && bulbMeshRef.current && bulbLightRef.current) {
      conductivityGroupRef.current.visible = isConductivityActive;
      const bMat = bulbMeshRef.current.material as THREE.MeshStandardMaterial;
      if (isConductivityActive && conductivityGlow > 0.05) {
        bMat.emissive.set(0xfef08a);
        bMat.emissiveIntensity = conductivityGlow * 1.8;
        bulbLightRef.current.intensity = conductivityGlow * 3.0;
      } else {
        bMat.emissive.set(0x000000);
        bMat.emissiveIntensity = 0;
        bulbLightRef.current.intensity = 0;
      }
    }

    // 8. Litmus Strip
    if (litmusStripGroupRef.current && litmusImmersedMeshRef.current) {
      litmusStripGroupRef.current.visible = litmusStripDipped;
      if (litmusStripDipped) {
        let stripHex = 0x10b981; // Neutral green
        if (phValue < 3.5) stripHex = 0xef4444; // Strong acid red
        else if (phValue < 6.5) stripHex = 0xf97316; // Weak acid orange
        else if (phValue > 11.0) stripHex = 0x7c3aed; // Strong base violet
        else if (phValue > 7.5) stripHex = 0x2563eb; // Base blue
        (litmusImmersedMeshRef.current.material as THREE.MeshStandardMaterial).color.set(stripHex);
      }
    }

    // 9. Active Metal Flare Color
    if (metalFlameMeshRef.current && metalFlameLightRef.current) {
      if (hasActiveMetal === 'potassium') {
        (metalFlameMeshRef.current.material as THREE.MeshBasicMaterial).color.set(0xa855f7);
        metalFlameLightRef.current.color.set(0xa855f7);
      } else {
        (metalFlameMeshRef.current.material as THREE.MeshBasicMaterial).color.set(0xf59e0b);
        metalFlameLightRef.current.color.set(0xf59e0b);
      }
    }

    // 10. Magnesium Ribbon
    if (magnesiumRibbonMeshRef.current) {
      magnesiumRibbonMeshRef.current.visible = hasMagnesiumRibbon;
    }

    // 11. Gas Syringe
    if (gasSyringeGroupRef.current && gasPlungerMeshRef.current) {
      const showGas = hydrogenGasMl > 0;
      gasSyringeGroupRef.current.visible = showGas;
      if (showGas) {
        const plungerH = Math.min(6.5, (hydrogenGasMl / 80) * 5.0 + 1.2);
        gasPlungerMeshRef.current.position.y = plungerH;
      }
    }

    // 12. Update Digital Balance Display Texture
    if (balanceCanvasRef.current && balanceTextureRef.current) {
      const bCanvas = balanceCanvasRef.current;
      const bCtx = bCanvas.getContext('2d');
      if (bCtx) {
        bCtx.fillStyle = '#020617';
        bCtx.fillRect(0, 0, 256, 72);
        bCtx.strokeStyle = '#0284c7';
        bCtx.lineWidth = 4;
        bCtx.strokeRect(2, 2, 252, 68);
        bCtx.font = 'bold 36px monospace';
        bCtx.fillStyle = '#38bdf8';
        bCtx.textAlign = 'right';
        bCtx.fillText(`${displayedWeightG.toFixed(1)} g`, 240, 50);
        balanceTextureRef.current.needsUpdate = true;
      }
    }
  }, [
    totalVolumeMl,
    fluidColor,
    currentTempC,
    phValue,
    burnerPower,
    precipitateG,
    effervescenceBubbles,
    isThermometerActive,
    isConductivityActive,
    conductivityGlow,
    flameTestMetal,
    isEthanolBurning,
    displayedWeightG,
    litmusStripDipped,
    hydrogenGasMl,
    iceCount,
    hasActiveMetal,
    hasMagnesiumRibbon,
    precipitateType
  ]);

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
    cameraSphericalRef.current.phi = Math.max(0.12, Math.min(Math.PI / 2.05, cameraSphericalRef.current.phi - dy * 0.008));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraSphericalRef.current.radius = Math.max(14, Math.min(65, cameraSphericalRef.current.radius + e.deltaY * 0.03));
  };

  const handleZoom = (delta: number) => {
    cameraSphericalRef.current.radius = Math.max(14, Math.min(65, cameraSphericalRef.current.radius + delta));
  };

  const handleSetCameraPreset = (preset: 'beaker' | 'top' | 'flame' | 'overview') => {
    setActiveCameraView(preset);
    if (preset === 'beaker') {
      cameraSphericalRef.current = { radius: 21, theta: Math.PI / 3.8, phi: Math.PI / 2.65 };
      cameraTargetRef.current.set(0, 6.8, 0);
    } else if (preset === 'top') {
      cameraSphericalRef.current = { radius: 24, theta: Math.PI / 4, phi: 0.20 };
      cameraTargetRef.current.set(0, 7.0, 0);
    } else if (preset === 'flame') {
      cameraSphericalRef.current = { radius: 22, theta: Math.PI / 3.4, phi: Math.PI / 2.1 };
      cameraTargetRef.current.set(0, 3.2, 0);
    } else if (preset === 'overview') {
      cameraSphericalRef.current = { radius: 36, theta: Math.PI / 4, phi: Math.PI / 2.7 };
      cameraTargetRef.current.set(0, 5.0, 0);
    }
  };

  return (
    <div className={`relative w-full aspect-[4/3] max-w-[620px] bg-slate-950 border-2 border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center select-none group transition-all ${
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

      {/* Floating Laboratory HUD Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10 text-[10px] font-mono">
        <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 text-cyan-300 flex items-center gap-1.5 shadow-lg">
          <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">{currentTempC.toFixed(1)} °C</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-bold">pH {phValue.toFixed(2)}</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-300 font-bold">{displayedWeightG.toFixed(1)} g</span>
        </div>

        {flameTestMetal !== 'none' && (
          <div className="px-2.5 py-1 rounded-lg bg-amber-950/90 backdrop-blur-md border border-amber-500/60 text-amber-300 flex items-center gap-1.5 animate-pulse shadow-md">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">{t(`اختبار لهب نشط: ${flameTestMetal}`, `Active Flame Test: ${flameTestMetal}`)}</span>
          </div>
        )}

        {isConductivityActive && (
          <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md border flex items-center gap-1.5 shadow-md ${
            conductivityGlow > 0.05
              ? 'bg-yellow-950/90 border-yellow-500/60 text-yellow-300'
              : 'bg-slate-900/90 border-slate-700 text-slate-400'
          }`}>
            <Zap className={`w-3.5 h-3.5 ${conductivityGlow > 0.05 ? 'text-yellow-400 animate-bounce' : 'text-slate-500'}`} />
            <span className="font-bold">
              {conductivityGlow > 0.05 ? `${t('توصيل كهربائي:', 'Conductivity:')} ${(conductivityGlow * 100).toFixed(0)}%` : t('محلول غير موصل (عازل)', 'Non-conductive solution')}
            </span>
          </div>
        )}

        {hydrogenGasMl > 0 && (
          <div className="px-2.5 py-1 rounded-lg bg-blue-950/90 backdrop-blur-md border border-blue-500/50 text-blue-300 flex items-center gap-1.5 shadow-md">
            <Wind className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">{t('محقنة تجميع الغاز:', 'Gas Syringe:')} {hydrogenGasMl.toFixed(0)} mL H₂</span>
          </div>
        )}
      </div>

      {/* Camera View Angle Presets Toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-lg">
        <button
          onClick={() => handleSetCameraPreset('beaker')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
            activeCameraView === 'beaker' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title={t('لقطة مقربة للكأس والماء', 'Beaker Close-up')}
        >
          <span>🔬</span>
          <span>{t('الكأس والماء', 'Beaker')}</span>
        </button>
        <button
          onClick={() => handleSetCameraPreset('top')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
            activeCameraView === 'top' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title={t('فحص المحلول والدوامة رأسياً من الأعلى', 'Top-Down Surface Vortex')}
        >
          <span>🌀</span>
          <span>{t('السطح', 'Top')}</span>
        </button>
        <button
          onClick={() => handleSetCameraPreset('flame')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
            activeCameraView === 'flame' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title={t('تركيز على موقد بنسن واللهب', 'Burner Flame Focus')}
        >
          <span>🔥</span>
          <span>{t('اللهب', 'Flame')}</span>
        </button>
        <button
          onClick={() => handleSetCameraPreset('overview')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
            activeCameraView === 'overview' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title={t('زاوية عامة شاملة لمنضدة المعمل', 'Full Workbench Overview')}
        >
          <span>🏛️</span>
          <span>{t('المعمل', 'Lab')}</span>
        </button>
      </div>

      {/* Camera Interactive Controls (Zoom, Auto-rotate, Reset, Fullscreen) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 z-10 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-lg">
        <button
          onClick={() => handleZoom(-4)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={t('تقريب (Zoom In)', 'Zoom In')}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom(4)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={t('تبعيد (Zoom Out)', 'Zoom Out')}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-lg transition-colors ${
            autoRotate ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title={t('دوران تلقائي للمعمل (Auto-rotate)', 'Auto-rotate')}
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleSetCameraPreset('beaker')}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={t('إعادة ضبط الكاميرا', 'Reset Camera')}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title={isFullscreen ? t('تصغير', 'Exit Fullscreen') : t('تكبير الشاشة', 'Fullscreen')}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Interactive Helper Cue */}
      <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 pointer-events-none">
        <span>🖱️ {t('اسحب للتدوير 360° | عجل الماوس للتقريب', 'Drag to rotate 360° | Scroll to zoom')}</span>
      </div>
    </div>
  );
};
