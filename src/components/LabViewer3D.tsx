import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Flame,
  Thermometer,
  Zap,
  Compass,
  Maximize2,
  Minimize2,
  Wind,
  Sparkles
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
  dispenseInfo?: {
    count: number;
    type: 'liquid' | 'indicator' | 'solid' | 'powder';
    color: string;
  };
  explosionEvent?: {
    id: number;
    type: 'sodium' | 'potassium' | 'magnesium' | 'hydrogen_pop' | 'spark' | 'catalytic_eruption' | 'ethanol_fire';
  } | null;
  iceCount?: number;
  hasActiveMetal?: 'none' | 'sodium' | 'potassium';
  hasMagnesiumRibbon?: boolean;
  precipitateType?:
    | 'none'
    | 'silver_chloride'
    | 'copper_hydroxide'
    | 'barium_sulfate'
    | 'iron'
    | 'permanganate'
    | 'white_salt'
    | 'copper_metal'
    | 'golden_lead_iodide'
    | 'carbon_black'
    | 'prussian_blue'
    | 'ferric_hydroxide'
    | 'cuprous_oxide'
    | 'sulfur_yellow'
    | 'dichromate_green'
    | 'molten_iron';
  lastActionMessage?: string;
  isBalloonAttached?: boolean;
  balloonInflation?: number; // 0 to 100
  balloonColor?: string;
  swellingType?: 'none' | 'carbon_snake' | 'elephant_foam' | 'dichromate_volcano';
  swellingLevel?: number; // 0 to 100
  crystalType?: 'none' | 'copper_blue' | 'hot_ice' | 'golden_rain' | 'silver_tree' | 'alum_clear' | 'chemical_garden' | 'gold_tree';
  crystalLevel?: number; // 0 to 100
  hasZincGranules?: boolean;
  hasCopperTurnings?: boolean;
  brownGasIntensity?: number; // 0 to 100 (NO2 gas from HNO3)
  chemiluminescenceLevel?: number; // 0 to 100 (Luminol cold light glow)
  silverMirrorLevel?: number; // 0 to 100 (Tollens silver mirror coating)
  thermiteGlow?: number; // 0 to 100 (2500C molten iron thermite)
  whiteSmokeIntensity?: number; // 0 to 100 (NH4Cl dense white smoke)
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
  dispenseInfo,
  explosionEvent = null,
  iceCount = 0,
  hasActiveMetal = 'none',
  hasMagnesiumRibbon = false,
  precipitateType = 'none',
  lastActionMessage,
  isBalloonAttached = false,
  balloonInflation = 0,
  balloonColor = '#ec4899',
  swellingType = 'none',
  swellingLevel = 0,
  crystalType = 'none',
  crystalLevel = 0,
  hasZincGranules = false,
  hasCopperTurnings = false,
  brownGasIntensity = 0,
  chemiluminescenceLevel = 0,
  silverMirrorLevel = 0,
  thermiteGlow = 0,
  whiteSmokeIntensity = 0
}) => {
  const { t } = useApp();
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
  const [flashOverlay, setFlashOverlay] = useState<{ color: string; opacity: number } | null>(null);

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
    precipitateType,
    isBalloonAttached,
    balloonInflation,
    balloonColor,
    swellingType,
    swellingLevel,
    crystalType,
    crystalLevel,
    hasZincGranules,
    hasCopperTurnings,
    brownGasIntensity,
    chemiluminescenceLevel,
    silverMirrorLevel,
    thermiteGlow,
    whiteSmokeIntensity
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
    precipitateType,
    isBalloonAttached,
    balloonInflation,
    balloonColor,
    swellingType,
    swellingLevel,
    crystalType,
    crystalLevel,
    hasZincGranules,
    hasCopperTurnings,
    brownGasIntensity,
    chemiluminescenceLevel,
    silverMirrorLevel,
    thermiteGlow,
    whiteSmokeIntensity
  };

  // Live 3D object references
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const liquidMeniscusRef = useRef<THREE.Mesh | null>(null);
  const liquidLightRef = useRef<THREE.PointLight | null>(null);
  const precipitateMeshRef = useRef<THREE.Mesh | null>(null);
  const stirRodGroupRef = useRef<THREE.Group | null>(null);
  const vortexGroupRef = useRef<THREE.Group | null>(null);
  const flameMeshRef = useRef<THREE.Mesh | null>(null);
  const flameLightRef = useRef<THREE.PointLight | null>(null);
  const innerFlameMeshRef = useRef<THREE.Mesh | null>(null);
  const ethanolSurfaceFlameGroupRef = useRef<THREE.Group | null>(null);
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
  const conductivityArcsGroupRef = useRef<THREE.Group | null>(null);
  const bulbLightRef = useRef<THREE.PointLight | null>(null);
  const bulbMeshRef = useRef<THREE.Mesh | null>(null);
  const flameTestWireGroupRef = useRef<THREE.Group | null>(null);
  const flameTestLoopMeshRef = useRef<THREE.Mesh | null>(null);
  const litmusStripGroupRef = useRef<THREE.Group | null>(null);
  const litmusImmersedMeshRef = useRef<THREE.Mesh | null>(null);
  const gasSyringeGroupRef = useRef<THREE.Group | null>(null);
  const gasPlungerMeshRef = useRef<THREE.Mesh | null>(null);
  const dropperGroupRef = useRef<THREE.Group | null>(null);
  const balloonGroupRef = useRef<THREE.Group | null>(null);
  const balloonBodyMeshRef = useRef<THREE.Mesh | null>(null);
  const carbonSnakeGroupRef = useRef<THREE.Group | null>(null);
  const elephantFoamGroupRef = useRef<THREE.Group | null>(null);
  const crystalsGroupRef = useRef<THREE.Group | null>(null);
  const zincGranulesGroupRef = useRef<THREE.Group | null>(null);
  const brownGasGroupRef = useRef<THREE.Group | null>(null);
  const silverMirrorMeshRef = useRef<THREE.Mesh | null>(null);
  const causticsDiscMeshRef = useRef<THREE.Mesh | null>(null);
  const chemiluminescenceGroupRef = useRef<THREE.Group | null>(null);
  const thermiteCoreGroupRef = useRef<THREE.Group | null>(null);
  const dichromateVolcanoGroupRef = useRef<THREE.Group | null>(null);
  const frostCylinderMeshRef = useRef<THREE.Mesh | null>(null);

  // Dispensing stream, falling powder & surface splash ripple refs
  const dispenseDropsGroupRef = useRef<THREE.Group | null>(null);
  const splashRippleMeshRef = useRef<THREE.Mesh | null>(null);
  const dispenseAnimStateRef = useRef<{
    active: boolean;
    progress: number;
    type: 'liquid' | 'indicator' | 'solid' | 'powder';
    color: string;
  }>({ active: false, progress: 0, type: 'liquid', color: '#38bdf8' });

  // 3D Explosion, Fireball, Shockwave, Flying Sparks, Electric Bolt & Volcano Foam refs
  const explosionGroupRef = useRef<THREE.Group | null>(null);
  const fireballMeshRef = useRef<THREE.Mesh | null>(null);
  const shockwaveRingRef = useRef<THREE.Mesh | null>(null);
  const explosionLightRef = useRef<THREE.PointLight | null>(null);
  const explosionSparksGroupRef = useRef<THREE.Group | null>(null);
  const sparkBoltGroupRef = useRef<THREE.Group | null>(null);
  const volcanoFoamGroupRef = useRef<THREE.Group | null>(null);
  const cameraShakeRef = useRef<number>(0);
  const activeExplosionStateRef = useRef<{
    active: boolean;
    age: number;
    maxAge: number;
    type: 'sodium' | 'potassium' | 'magnesium' | 'hydrogen_pop' | 'spark' | 'catalytic_eruption' | 'ethanol_fire';
  }>({ active: false, age: 0, maxAge: 60, type: 'sodium' });

  const balanceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const balanceTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Fade out viewport flash overlay smoothly
  useEffect(() => {
    if (!flashOverlay) return;
    const timer = setInterval(() => {
      setFlashOverlay(prev => {
        if (!prev || prev.opacity <= 0.08) return null;
        return { ...prev, opacity: prev.opacity - 0.09 };
      });
    }, 30);
    return () => clearInterval(timer);
  }, [flashOverlay]);

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

    // 3. WebGL Renderer with ACES Filmic Tone Mapping & Studio Environment Map
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Procedural Studio Environment Map for crisp glass, silver mirror, gold & liquid reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x090f1d);
    const panelGeo = new THREE.PlaneGeometry(20, 20);
    const topPanel = new THREE.Mesh(panelGeo, new THREE.MeshBasicMaterial({ color: 0xe0f2fe, side: THREE.DoubleSide }));
    topPanel.position.set(0, 18, 0);
    topPanel.rotation.x = Math.PI / 2;
    envScene.add(topPanel);
    const sidePanel1 = new THREE.Mesh(panelGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }));
    sidePanel1.position.set(18, 6, 12);
    sidePanel1.lookAt(0, 0, 0);
    envScene.add(sidePanel1);
    const sidePanel2 = new THREE.Mesh(panelGeo, new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide }));
    sidePanel2.position.set(-18, 8, -10);
    sidePanel2.lookAt(0, 0, 0);
    envScene.add(sidePanel2);
    scene.environment = pmremGenerator.fromScene(envScene, 0.04).texture;
    pmremGenerator.dispose();

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

    // Graduation Lines & High-DPI Pyrex Scale Label Texture on Beaker (50mL to 250mL)
    const marksGroup = new THREE.Group();
    for (let m = 1; m <= 5; m++) {
      const markY = (m / 5) * (beakerHeight - 2.5) + 0.8;
      const markLineGeo = new THREE.TorusGeometry(beakerRadius + 0.02, 0.035, 8, 32, Math.PI / 3.0);
      markLineGeo.rotateX(Math.PI / 2);
      markLineGeo.rotateY(Math.PI / 6);
      const markMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
      const markMesh = new THREE.Mesh(markLineGeo, markMat);
      markMesh.position.y = markY;
      markMesh.renderOrder = 11;
      marksGroup.add(markMesh);
    }

    // Crisp Graduated Label Overlay on Front Glass Wall
    const gradCanvas = document.createElement('canvas');
    gradCanvas.width = 256;
    gradCanvas.height = 512;
    const gCtx = gradCanvas.getContext('2d');
    if (gCtx) {
      gCtx.clearRect(0, 0, 256, 512);
      gCtx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      gCtx.font = 'bold 20px monospace';
      gCtx.textAlign = 'left';
      gCtx.fillText('PYREX 250mL', 40, 56);
      gCtx.font = 'bold 13px monospace';
      gCtx.fillStyle = 'rgba(186, 230, 253, 0.78)';
      gCtx.fillText('BOROSILICATE 3.3', 40, 76);
      gCtx.font = 'bold 18px monospace';
      gCtx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      [250, 200, 150, 100, 50].forEach((vol, i) => {
        const yPos = 110 + i * 76;
        gCtx.fillRect(14, yPos - 6, 24, 3);
        gCtx.fillText(`${vol}ml`, 46, yPos + 2);
      });
    }
    const gradTex = new THREE.CanvasTexture(gradCanvas);
    const gradPatchGeo = new THREE.CylinderGeometry(beakerRadius + 0.03, beakerRadius * 0.96 + 0.03, beakerHeight * 0.86, 24, 1, true, -0.35, 0.7);
    const gradPatchMat = new THREE.MeshBasicMaterial({
      map: gradTex,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const gradPatchMesh = new THREE.Mesh(gradPatchGeo, gradPatchMat);
    gradPatchMesh.position.y = beakerHeight * 0.5;
    gradPatchMesh.renderOrder = 12;
    marksGroup.add(gradPatchMesh);
    beakerGroup.add(marksGroup);

    // Liquid Caustics / Under-Beaker Refraction Glow Disc
    const causticsGeo = new THREE.CircleGeometry(beakerRadius * 0.95, 36);
    causticsGeo.rotateX(-Math.PI / 2);
    const causticsMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const causticsMesh = new THREE.Mesh(causticsGeo, causticsMat);
    causticsMesh.position.y = 0.05;
    causticsMesh.renderOrder = 2;
    beakerGroup.add(causticsMesh);
    causticsDiscMeshRef.current = causticsMesh;

    // Tollens' Silver Mirror Reflective Coating Cylinder inside Beaker
    const mirrorGeo = new THREE.CylinderGeometry(beakerRadius * 0.95, beakerRadius * 0.91, beakerHeight * 0.82, 48, 1, true);
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 1.0,
      roughness: 0.04,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const mirrorMesh = new THREE.Mesh(mirrorGeo, mirrorMat);
    mirrorMesh.position.y = beakerHeight * 0.43;
    mirrorMesh.renderOrder = 9;
    mirrorMesh.visible = false;
    beakerGroup.add(mirrorMesh);
    silverMirrorMeshRef.current = mirrorMesh;

    // Endothermic Cold Frost Layer on Beaker Outer Glass (< 10°C)
    const frostGeo = new THREE.CylinderGeometry(beakerRadius + 0.015, beakerRadius * 0.96 + 0.015, beakerHeight * 0.75, 48, 1, true);
    const frostMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const frostMesh = new THREE.Mesh(frostGeo, frostMat);
    frostMesh.position.y = beakerHeight * 0.4;
    frostMesh.renderOrder = 11;
    frostMesh.visible = false;
    beakerGroup.add(frostMesh);
    frostCylinderMeshRef.current = frostMesh;

    // Dynamic Liquid inside Beaker (Open Ended Cylinder so Meniscus Disc acts as natural top cap!)
    const liquidGeo = new THREE.CylinderGeometry(beakerRadius * 0.94, beakerRadius * 0.90, 1, 48, 1, true);
    liquidGeo.translate(0, 0.5, 0); // anchored at bottom
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      roughness: 0.08,
      metalness: 0.06,
      depthWrite: false,
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

    // 3D Swirling Vortex Rings on Liquid Surface (visible during glass rod stirring!)
    const vortexGroup = new THREE.Group();
    vortexGroup.renderOrder = 5;
    [1.1, 2.2, 3.3].forEach((r, idx) => {
      const vRingGeo = new THREE.TorusGeometry(r, 0.06, 8, 32, Math.PI * 1.45);
      vRingGeo.rotateX(Math.PI / 2);
      const vRingMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0xffffff : 0x7dd3fc,
        transparent: true,
        opacity: 0.75 - idx * 0.15,
        blending: THREE.AdditiveBlending
      });
      const vRingMesh = new THREE.Mesh(vRingGeo, vRingMat);
      vRingMesh.rotation.y = idx * 2.1;
      vortexGroup.add(vRingMesh);
    });
    vortexGroup.visible = false;
    beakerGroup.add(vortexGroup);
    vortexGroupRef.current = vortexGroup;

    // 3D Ethanol Surface Combustion Flame (burns directly on the liquid surface inside beaker!)
    const ethanolFlameGroup = new THREE.Group();
    ethanolFlameGroup.renderOrder = 6;
    const eOuterGeo = new THREE.ConeGeometry(3.4, 4.2, 24);
    eOuterGeo.translate(0, 2.1, 0);
    const eOuterMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const eOuterMesh = new THREE.Mesh(eOuterGeo, eOuterMat);
    ethanolFlameGroup.add(eOuterMesh);

    const eInnerGeo = new THREE.ConeGeometry(2.2, 3.0, 20);
    eInnerGeo.translate(0, 1.5, 0);
    const eInnerMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.80,
      blending: THREE.AdditiveBlending
    });
    const eInnerMesh = new THREE.Mesh(eInnerGeo, eInnerMat);
    ethanolFlameGroup.add(eInnerMesh);

    const eLight = new THREE.PointLight(0xf59e0b, 2.2, 16);
    eLight.position.set(0, 2.0, 0);
    ethanolFlameGroup.add(eLight);
    ethanolFlameGroup.visible = false;
    beakerGroup.add(ethanolFlameGroup);
    ethanolSurfaceFlameGroupRef.current = ethanolFlameGroup;

    // Precipitate / Undissolved Solid Layer at Bottom of Beaker
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

    const rodTipGeo = new THREE.SphereGeometry(0.26, 16, 16);
    const rodTipMesh = new THREE.Mesh(rodTipGeo, glassStirRodMat);
    rodTipMesh.position.y = -8.5;
    stirRodGroup.add(rodTipMesh);

    const rodTopGeo = new THREE.SphereGeometry(0.29, 16, 16);
    const rodTopMesh = new THREE.Mesh(rodTopGeo, glassStirRodMat);
    rodTopMesh.position.y = 8.5;
    stirRodGroup.add(rodTopMesh);

    stirRodGroup.position.set(1.4, 8.5, 0.8);
    stirRodGroup.rotation.set(0.18, 0, -0.32);

    // Bubbles Group inside Beaker
    const bubblesGroup = new THREE.Group();
    bubblesGroup.renderOrder = 4;
    beakerGroup.add(bubblesGroup);
    bubblesGroupRef.current = bubblesGroup;

    const bubbleGeo = new THREE.SphereGeometry(0.26, 12, 12);
    const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
    for (let b = 0; b < 45; b++) {
      const bMesh = new THREE.Mesh(bubbleGeo, bubbleMat);
      bMesh.position.set(
        (Math.random() - 0.5) * (beakerRadius * 1.4),
        0.5 + Math.random() * 8,
        (Math.random() - 0.5) * (beakerRadius * 1.4)
      );
      bMesh.userData = { speed: 0.09 + Math.random() * 0.16, wobble: Math.random() * Math.PI };
      bMesh.visible = false;
      bubblesGroup.add(bMesh);
    }

    // Surface Foam Ring (appears during violent reactions or boiling)
    const foamGroup = new THREE.Group();
    foamGroup.renderOrder = 5;
    const foamBubbleGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const foamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, transparent: true, opacity: 0.88 });
    for (let f = 0; f < 28; f++) {
      const angle = (f / 28) * Math.PI * 2;
      const r = (beakerRadius * 0.72) + (Math.random() - 0.5) * 1.1;
      const fMesh = new THREE.Mesh(foamBubbleGeo, foamMat);
      fMesh.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      foamGroup.add(fMesh);
    }
    foamGroup.visible = false;
    beakerGroup.add(foamGroup);
    foamGroupRef.current = foamGroup;

    // 3D Floating Ice Cubes
    const iceGroup = new THREE.Group();
    iceGroup.renderOrder = 4;
    const iceGeo = new THREE.BoxGeometry(1.25, 1.25, 1.25);
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.82,
      roughness: 0.12,
      metalness: 0.05
    });
    for (let i = 0; i < 6; i++) {
      const iceCube = new THREE.Mesh(iceGeo, iceMat);
      iceCube.position.set((Math.random() - 0.5) * 4.2, 0, (Math.random() - 0.5) * 4.2);
      iceCube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      iceCube.userData = { offset: i * 1.3 };
      iceGroup.add(iceCube);
    }
    iceGroup.visible = false;
    beakerGroup.add(iceGroup);
    iceCubesGroupRef.current = iceGroup;

    // 3D Active Alkali Metal (Sodium/Potassium) - Skitters on water OR rests on dry floor
    const metalGroup = new THREE.Group();
    metalGroup.renderOrder = 6;
    const pelletGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const pelletMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.15 });
    const pelletMesh = new THREE.Mesh(pelletGeo, pelletMat);
    metalGroup.add(pelletMesh);

    // Blazing fire cone on metal when reacting with water
    const flareGeo = new THREE.ConeGeometry(0.75, 2.2, 16);
    flareGeo.translate(0, 1.1, 0);
    const flareMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const flareMesh = new THREE.Mesh(flareGeo, flareMat);
    metalGroup.add(flareMesh);
    metalFlameMeshRef.current = flareMesh;

    const metalLight = new THREE.PointLight(0xf59e0b, 2.8, 12);
    metalLight.position.set(0, 1.0, 0);
    metalGroup.add(metalLight);
    metalFlameLightRef.current = metalLight;

    metalGroup.visible = false;
    beakerGroup.add(metalGroup);
    activeMetalGroupRef.current = metalGroup;

    // 3D Magnesium Ribbon
    const mgGeo = new THREE.TorusGeometry(1.6, 0.14, 10, 28, Math.PI * 1.6);
    const mgMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.15 });
    const mgMesh = new THREE.Mesh(mgGeo, mgMat);
    mgMesh.position.set(0, 0.9, 0);
    mgMesh.rotation.x = Math.PI / 2;
    mgMesh.visible = false;
    beakerGroup.add(mgMesh);
    magnesiumRibbonMeshRef.current = mgMesh;

    // Steam Group Emerging from Beaker Top
    const steamGroup = new THREE.Group();
    steamGroup.position.set(0, beakerHeight - 1.5, 0);
    beakerGroup.add(steamGroup);
    steamGroupRef.current = steamGroup;

    const steamGeo = new THREE.SphereGeometry(0.55, 10, 10);
    const steamMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.38 });
    for (let s = 0; s < 28; s++) {
      const sMesh = new THREE.Mesh(steamGeo, steamMat);
      sMesh.position.set(
        (Math.random() - 0.5) * 5.0,
        Math.random() * 9,
        (Math.random() - 0.5) * 5.0
      );
      sMesh.userData = { speed: 0.06 + Math.random() * 0.10 };
      sMesh.visible = false;
      steamGroup.add(sMesh);
    }

    // Digital Thermometer Probe
    const thermometerGroup = new THREE.Group();
    thermometerGroup.renderOrder = 4;
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

    // Electrical Conductivity Tester Electrodes, Wires, Light Bulb & Submerged Electric Arcs
    const conductivityGroup = new THREE.Group();
    conductivityGroup.renderOrder = 4;

    const rodGeo = new THREE.CylinderGeometry(0.22, 0.22, 11.5, 16);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.92, roughness: 0.18 });
    const rod1 = new THREE.Mesh(rodGeo, rodMat);
    rod1.position.set(-1.8, 6.2, 0);
    const rod2 = new THREE.Mesh(rodGeo, rodMat);
    rod2.position.set(-0.4, 6.2, 0);
    conductivityGroup.add(rod1);
    conductivityGroup.add(rod2);

    const termGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.6, 12);
    const redWireMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const blueWireMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 });
    const term1 = new THREE.Mesh(termGeo, redWireMat);
    term1.position.set(-1.8, 12.1, 0);
    const term2 = new THREE.Mesh(termGeo, blueWireMat);
    term2.position.set(-0.4, 12.1, 0);
    conductivityGroup.add(term1);
    conductivityGroup.add(term2);

    const wireLeadGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8);
    const redLead = new THREE.Mesh(wireLeadGeo, redWireMat);
    redLead.position.set(-1.45, 12.9, 0);
    redLead.rotation.z = -0.45;
    const blueLead = new THREE.Mesh(wireLeadGeo, blueWireMat);
    blueLead.position.set(-0.75, 12.9, 0);
    blueLead.rotation.z = 0.45;
    conductivityGroup.add(redLead);
    conductivityGroup.add(blueLead);

    const crossArmGeo = new THREE.BoxGeometry(2.8, 0.55, 0.75);
    const crossArmMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const crossArm = new THREE.Mesh(crossArmGeo, crossArmMat);
    crossArm.position.set(-1.1, 11.7, 0);
    conductivityGroup.add(crossArm);

    // Submerged Electric Current Arcs between the two Iron Electrodes
    const condArcsGroup = new THREE.Group();
    for (let a = 0; a < 3; a++) {
      const arcCylinderGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.35, 8);
      arcCylinderGeo.rotateZ(Math.PI / 2);
      const arcMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const arcMesh = new THREE.Mesh(arcCylinderGeo, arcMat);
      arcMesh.position.set(-1.1, 1.2 + a * 0.9, 0);
      condArcsGroup.add(arcMesh);
    }
    condArcsGroup.visible = false;
    conductivityGroup.add(condArcsGroup);
    conductivityArcsGroupRef.current = condArcsGroup;

    // Indicator Light Bulb
    const bulbGeo = new THREE.SphereGeometry(0.75, 16, 16);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.2,
      emissive: 0x000000,
      emissiveIntensity: 0
    });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.set(-1.1, 13.9, 0);
    conductivityGroup.add(bulbMesh);
    bulbMeshRef.current = bulbMesh;

    const bulbLight = new THREE.PointLight(0xfef08a, 0, 14);
    bulbLight.position.set(-1.1, 13.9, 0);
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

    // Litmus Paper Strip in Beaker (Unified single continuous strip)
    const litmusGroup = new THREE.Group();
    litmusGroup.renderOrder = 4;

    const litmusDryGeo = new THREE.BoxGeometry(0.95, 5.0, 0.08);
    const litmusDryMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.85 });
    const litmusDry = new THREE.Mesh(litmusDryGeo, litmusDryMat);
    litmusDry.position.set(0, 2.5, 0);
    litmusGroup.add(litmusDry);

    const litmusImmersedGeo = new THREE.BoxGeometry(0.95, 4.2, 0.08);
    const litmusImmersedMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.85 });
    const litmusImmersed = new THREE.Mesh(litmusImmersedGeo, litmusImmersedMat);
    litmusImmersed.position.set(0, -2.1, 0);
    litmusGroup.add(litmusImmersed);
    litmusImmersedMeshRef.current = litmusImmersed;

    const clipGeo = new THREE.BoxGeometry(1.2, 0.8, 0.25);
    const clipMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const clipMesh = new THREE.Mesh(clipGeo, clipMat);
    clipMesh.position.set(0, 5.1, 0);
    litmusGroup.add(clipMesh);

    litmusGroup.position.set(-2.6, 5.8, 1.6);
    litmusGroup.rotation.z = -0.15;
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

    // Multi-Droplet Pouring Stream & Falling Solid Crystals Group
    const dispenseDropsGroup = new THREE.Group();
    dispenseDropsGroup.renderOrder = 6;
    const dropSphereGeo = new THREE.SphereGeometry(0.28, 12, 12);
    for (let d = 0; d < 18; d++) {
      const dMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.15,
        metalness: 0.1
      });
      const dMesh = new THREE.Mesh(dropSphereGeo, dMat);
      dMesh.visible = false;
      dispenseDropsGroup.add(dMesh);
    }
    beakerGroup.add(dispenseDropsGroup);
    dispenseDropsGroupRef.current = dispenseDropsGroup;

    // Expanding Surface Splash Ripple Ring
    const splashRippleGeo = new THREE.TorusGeometry(0.8, 0.07, 8, 32);
    splashRippleGeo.rotateX(Math.PI / 2);
    const splashRippleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const splashRippleMesh = new THREE.Mesh(splashRippleGeo, splashRippleMat);
    splashRippleMesh.visible = false;
     splashRippleMesh.renderOrder = 6;
    beakerGroup.add(splashRippleMesh);
    splashRippleMeshRef.current = splashRippleMesh;

    // --- 3D EXPLOSION, FIREBALL, SHOCKWAVE, SPARKS, LIGHTNING BOLT & VOLCANO FOAM ---
    const explosionGroup = new THREE.Group();
    explosionGroup.renderOrder = 8;
    beakerGroup.add(explosionGroup);
    explosionGroupRef.current = explosionGroup;

    // 1. Volumetric Fireball Sphere
    const fbGeo = new THREE.SphereGeometry(1.0, 24, 24);
    const fbMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const fbMesh = new THREE.Mesh(fbGeo, fbMat);
    fbMesh.visible = false;
    explosionGroup.add(fbMesh);
    fireballMeshRef.current = fbMesh;

    // 2. Expanding Shockwave Torus Ring
    const swGeo = new THREE.TorusGeometry(1.2, 0.14, 12, 48);
    swGeo.rotateX(Math.PI / 2);
    const swMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const swMesh = new THREE.Mesh(swGeo, swMat);
    swMesh.visible = false;
    explosionGroup.add(swMesh);
    shockwaveRingRef.current = swMesh;

    // 3. High-Intensity Explosion PointLight
    const expLight = new THREE.PointLight(0xf97316, 0, 35);
    expLight.position.set(0, 5.0, 0);
    explosionGroup.add(expLight);
    explosionLightRef.current = expLight;

    // 4. 60 Flying Incandescent 3D Spark Particles
    const sparksGroup = new THREE.Group();
    const sparkGeo = new THREE.SphereGeometry(0.22, 8, 8);
    for (let sp = 0; sp < 60; sp++) {
      const spMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
      });
      const spMesh = new THREE.Mesh(sparkGeo, spMat);
      spMesh.visible = false;
      spMesh.userData = { vx: 0, vy: 0, vz: 0, life: 0, maxLife: 40 };
      sparksGroup.add(spMesh);
    }
    explosionGroup.add(sparksGroup);
    explosionSparksGroupRef.current = sparksGroup;

    // 5. 3D Electric Spark Lightning Bolt inside Beaker
    const sparkBoltGroup = new THREE.Group();
    const boltMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      blending: THREE.AdditiveBlending
    });
    for (let seg = 0; seg < 5; seg++) {
      const segGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.8, 8);
      const segMesh = new THREE.Mesh(segGeo, boltMat);
      segMesh.position.set((seg % 2 === 0 ? 0.35 : -0.35), 9.5 - seg * 1.4, 0);
      segMesh.rotation.z = seg % 2 === 0 ? 0.42 : -0.42;
      sparkBoltGroup.add(segMesh);
    }
    sparkBoltGroup.visible = false;
    explosionGroup.add(sparkBoltGroup);
    sparkBoltGroupRef.current = sparkBoltGroup;

    // 6. 3D Catalytic Volcano Foam Column (for KMnO4 + H2O2 purple volcano)
    const volcanoFoamGroup = new THREE.Group();
    const vFoamGeo = new THREE.SphereGeometry(1.3, 14, 14);
    for (let vf = 0; vf < 18; vf++) {
      const vfMat = new THREE.MeshStandardMaterial({
        color: vf % 2 === 0 ? 0xa855f7 : 0xd8b4fe,
        roughness: 0.35,
        emissive: 0x581c87,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.9
      });
      const vfMesh = new THREE.Mesh(vFoamGeo, vfMat);
      const angle = (vf / 18) * Math.PI * 4;
      const rad = (vf / 18) * 3.0;
      vfMesh.position.set(Math.cos(angle) * rad, (vf / 18) * 7.5, Math.sin(angle) * rad);
      vfMesh.scale.setScalar(0.6 + (vf / 18) * 0.8);
      volcanoFoamGroup.add(vfMesh);
    }
    volcanoFoamGroup.visible = false;
    explosionGroup.add(volcanoFoamGroup);
    volcanoFoamGroupRef.current = volcanoFoamGroup;

    // 7. 3D Inflatable Latex Gas Balloon Mounted Over Entire Beaker Rim
    const balloonGroup = new THREE.Group();
    balloonGroup.position.set(0, beakerHeight, 0);
    balloonGroup.renderOrder = 12;

    const balloonMat = new THREE.MeshPhysicalMaterial({
      color: 0xec4899,
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: 0.92
    });

    // Stretched rubber lip ring gripping around the entire outside rim of the beaker
    const neckRingGeo = new THREE.TorusGeometry(beakerRadius * 1.04, 0.24, 16, 48);
    neckRingGeo.rotateX(Math.PI / 2);
    const neckRingMesh = new THREE.Mesh(neckRingGeo, balloonMat);
    neckRingMesh.position.y = -0.45;
    balloonGroup.add(neckRingMesh);

    // Stretched latex sleeve covering the entire top rim of the beaker
    const sleeveGeo = new THREE.CylinderGeometry(beakerRadius * 1.03, beakerRadius * 1.05, 0.65, 48);
    const sleeveMesh = new THREE.Mesh(sleeveGeo, balloonMat);
    sleeveMesh.position.y = -0.18;
    balloonGroup.add(sleeveMesh);

    const balloonSphereGeo = new THREE.SphereGeometry(1.0, 36, 36);
    balloonSphereGeo.scale(1.0, 1.18, 1.0);
    balloonSphereGeo.translate(0, 0.85, 0);
    const balloonBodyMesh = new THREE.Mesh(balloonSphereGeo, balloonMat);
    balloonBodyMesh.scale.set(beakerRadius * 1.02, 0.22, beakerRadius * 1.02);
    balloonGroup.add(balloonBodyMesh);
    balloonBodyMeshRef.current = balloonBodyMesh;

    balloonGroup.visible = false;
    beakerGroup.add(balloonGroup);
    balloonGroupRef.current = balloonGroup;

    // 8. 3D Swelling Carbon Snake Column (Sucrose + Concentrated H2SO4 Dehydration)
    const carbonSnakeGroup = new THREE.Group();
    carbonSnakeGroup.renderOrder = 7;
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.92,
      metalness: 0.08,
      emissive: 0x27272a,
      emissiveIntensity: 0.25
    });
    for (let cs = 0; cs < 22; cs++) {
      const segR = 2.6 - (cs / 22) * 0.65 + (cs % 3) * 0.12;
      const segGeo = new THREE.CylinderGeometry(segR * 0.92, segR, 1.1, 18);
      const segMesh = new THREE.Mesh(segGeo, carbonMat);
      const bendX = Math.sin((cs / 22) * Math.PI * 1.3) * 1.4;
      const bendZ = Math.cos((cs / 22) * Math.PI * 1.1) * 0.6;
      segMesh.position.set(bendX, 0.6 + cs * 0.72, bendZ);
      segMesh.rotation.z = -Math.cos((cs / 22) * Math.PI) * 0.15;
      carbonSnakeGroup.add(segMesh);
    }
    carbonSnakeGroup.visible = false;
    beakerGroup.add(carbonSnakeGroup);
    carbonSnakeGroupRef.current = carbonSnakeGroup;

    // 9. 3D Giant Swelling Elephant Toothpaste Foam Tower (H2O2 + KI / Soap)
    const elephantFoamGroup = new THREE.Group();
    elephantFoamGroup.renderOrder = 7;
    const elFoamGeo = new THREE.SphereGeometry(1.65, 16, 16);
    for (let ef = 0; ef < 26; ef++) {
      const efMat = new THREE.MeshStandardMaterial({
        color: ef % 3 === 0 ? 0xfde047 : ef % 3 === 1 ? 0x38bdf8 : 0xf472b6,
        roughness: 0.28,
        metalness: 0.05,
        transparent: true,
        opacity: 0.94
      });
      const efMesh = new THREE.Mesh(elFoamGeo, efMat);
      const spiralA = ef * 0.85;
      const spiralR = Math.min(3.8, 0.7 + (ef / 26) * 3.1);
      efMesh.position.set(
        Math.cos(spiralA) * spiralR,
        0.8 + (ef / 26) * 12.5,
        Math.sin(spiralA) * spiralR
      );
      efMesh.scale.setScalar(0.8 + (ef / 26) * 0.9);
      elephantFoamGroup.add(efMesh);
    }
    elephantFoamGroup.visible = false;
    beakerGroup.add(elephantFoamGroup);
    elephantFoamGroupRef.current = elephantFoamGroup;

    // 10. 3D Geometric Crystallization Clusters (CuSO4, Hot Ice, Golden Rain, Silver Tree, Alum)
    const crystalsGroup = new THREE.Group();
    crystalsGroup.renderOrder = 6;
    const prismGeo = new THREE.ConeGeometry(0.42, 2.2, 6);
    prismGeo.translate(0, 1.1, 0);
    const octaGeo = new THREE.OctahedronGeometry(0.65, 0);
    for (let cr = 0; cr < 28; cr++) {
      const cMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        roughness: 0.08,
        metalness: 0.25,
        transmission: 0.45,
        transparent: true,
        opacity: 0.92,
        clearcoat: 1.0
      });
      const isPrism = cr % 2 === 0;
      const cMesh = new THREE.Mesh(isPrism ? prismGeo : octaGeo, cMat);
      const angle = (cr / 28) * Math.PI * 2 + (cr % 3) * 0.4;
      const rad = (cr % 5) * 0.85;
      cMesh.position.set(Math.cos(angle) * rad, 0.45 + (cr % 4) * 0.35, Math.sin(angle) * rad);
      cMesh.rotation.set(
        (Math.random() - 0.5) * 0.7,
        angle,
        (Math.random() - 0.5) * 0.7
      );
      cMesh.userData = { baseY: cMesh.position.y, floatPhase: cr * 0.7 };
      crystalsGroup.add(cMesh);
    }
    crystalsGroup.visible = false;
    beakerGroup.add(crystalsGroup);
    crystalsGroupRef.current = crystalsGroup;

    // 11. 3D Metallic Zinc Granules & Copper Turnings on Beaker Bottom
    const zincGroup = new THREE.Group();
    zincGroup.renderOrder = 5;
    const znGeo = new THREE.DodecahedronGeometry(0.42, 0);
    for (let z = 0; z < 14; z++) {
      const zMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.88,
        roughness: 0.22
      });
      const zMesh = new THREE.Mesh(znGeo, zMat);
      const angle = (z / 14) * Math.PI * 2;
      const rad = 0.8 + (z % 3) * 1.1;
      zMesh.position.set(Math.cos(angle) * rad, 0.55, Math.sin(angle) * rad);
      zMesh.rotation.set(z * 0.5, z * 0.8, 0);
      zincGroup.add(zMesh);
    }
    zincGroup.visible = false;
    beakerGroup.add(zincGroup);
    zincGranulesGroupRef.current = zincGroup;

    // 12. 3D Dense Reddish-Brown NO2 Gas Plume (Concentrated Nitric Acid + Metals)
    const brownGasGroup = new THREE.Group();
    brownGasGroup.renderOrder = 9;
    const no2Geo = new THREE.SphereGeometry(0.95, 12, 12);
    for (let bg = 0; bg < 24; bg++) {
      const no2Mat = new THREE.MeshBasicMaterial({
        color: bg % 2 === 0 ? 0xb45309 : 0x9a3412,
        transparent: true,
        opacity: 0.52
      });
      const bgMesh = new THREE.Mesh(no2Geo, no2Mat);
      bgMesh.position.set(
        (Math.random() - 0.5) * 5.2,
        2.0 + Math.random() * 11.0,
        (Math.random() - 0.5) * 5.2
      );
      bgMesh.userData = { speed: 0.05 + Math.random() * 0.08, phase: bg * 0.6 };
      brownGasGroup.add(bgMesh);
    }
    brownGasGroup.visible = false;
    beakerGroup.add(brownGasGroup);
    brownGasGroupRef.current = brownGasGroup;

    // 13. 3D Luminol Chemiluminescence Bioluminescent Particles & Cold Light Glow
    const chemiGroup = new THREE.Group();
    chemiGroup.renderOrder = 8;
    const chemiOrbGeo = new THREE.SphereGeometry(0.18, 10, 10);
    for (let cl = 0; cl < 36; cl++) {
      const chemiMat = new THREE.MeshBasicMaterial({
        color: cl % 2 === 0 ? 0x00f5d4 : 0x38bdf8,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });
      const clMesh = new THREE.Mesh(chemiOrbGeo, chemiMat);
      const angle = (cl / 36) * Math.PI * 6;
      const rad = 0.5 + (cl % 5) * 0.78;
      clMesh.position.set(Math.cos(angle) * rad, 0.8 + (cl / 36) * 6.5, Math.sin(angle) * rad);
      clMesh.userData = { baseY: clMesh.position.y, phase: cl * 0.4 };
      chemiGroup.add(clMesh);
    }
    const chemiLight = new THREE.PointLight(0x00f5d4, 4.5, 22);
    chemiLight.position.set(0, 3.8, 0);
    chemiGroup.add(chemiLight);
    chemiGroup.visible = false;
    beakerGroup.add(chemiGroup);
    chemiluminescenceGroupRef.current = chemiGroup;

    // 14. 3D Thermite 2500°C Incandescent Molten Iron Core
    const thermiteGroup = new THREE.Group();
    thermiteGroup.renderOrder = 8;
    const lavaGeo = new THREE.CylinderGeometry(beakerRadius * 0.86, beakerRadius * 0.88, 1.4, 32);
    const lavaMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending
    });
    const lavaMesh = new THREE.Mesh(lavaGeo, lavaMat);
    lavaMesh.position.y = 0.85;
    thermiteGroup.add(lavaMesh);
    const lavaLight = new THREE.PointLight(0xf97316, 6.0, 25);
    lavaLight.position.set(0, 2.5, 0);
    thermiteGroup.add(lavaLight);
    thermiteGroup.visible = false;
    beakerGroup.add(thermiteGroup);
    thermiteCoreGroupRef.current = thermiteGroup;

    // 15. 3D Ammonium Dichromate Volcanic Ash Cone & Glowing Crater
    const dichromateGroup = new THREE.Group();
    dichromateGroup.renderOrder = 7;
    const volcConeGeo = new THREE.ConeGeometry(beakerRadius * 0.88, 7.2, 28);
    volcConeGeo.translate(0, 3.6, 0);
    const volcConeMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.92,
      metalness: 0.08,
      emissive: 0xea580c,
      emissiveIntensity: 0.35
    });
    const volcConeMesh = new THREE.Mesh(volcConeGeo, volcConeMat);
    dichromateGroup.add(volcConeMesh);
    dichromateGroup.visible = false;
    beakerGroup.add(dichromateGroup);
    dichromateVolcanoGroupRef.current = dichromateGroup;

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

    const tubeColors = [0xef4444, 0x10b981, 0x8b5cf6];
    for (let tIdx = 0; tIdx < 3; tIdx++) {
      const posX = (tIdx - 1) * 3.2;
      const tubeGeo = new THREE.CylinderGeometry(0.65, 0.65, 6.8, 20, 1, true);
      const tubeMesh = new THREE.Mesh(tubeGeo, glassMat);
      tubeMesh.position.set(posX, 4.0, 0);
      rackGroup.add(tubeMesh);

      const tLiqGeo = new THREE.CylinderGeometry(0.58, 0.58, 3.8, 16);
      const tLiqMat = new THREE.MeshStandardMaterial({
        color: tubeColors[tIdx],
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
      time += 0.025;

      // Camera auto-rotation
      if (autoRotate && !isDraggingRef.current) {
        cameraSphericalRef.current.theta += 0.005;
      }

      const { radius: cR, theta: cT, phi: cP } = cameraSphericalRef.current;

      // Apply 3D Camera Shake during explosions!
      let shakeX = 0;
      let shakeY = 0;
      let shakeZ = 0;
      if (cameraShakeRef.current > 0.02) {
        shakeX = (Math.random() - 0.5) * cameraShakeRef.current;
        shakeY = (Math.random() - 0.5) * cameraShakeRef.current;
        shakeZ = (Math.random() - 0.5) * cameraShakeRef.current;
        cameraShakeRef.current *= 0.88;
      } else {
        cameraShakeRef.current = 0;
      }

      camera.position.set(
        cR * Math.sin(cP) * Math.cos(cT) + shakeX,
        cR * Math.cos(cP) + shakeY,
        cR * Math.sin(cP) * Math.sin(cT) + shakeZ
      );
      camera.lookAt(
        cameraTargetRef.current.x + shakeX * 0.4,
        cameraTargetRef.current.y + shakeY * 0.4,
        cameraTargetRef.current.z + shakeZ * 0.4
      );

      // Read current live state
      const {
        totalVolumeMl: curVol,
        currentTempC: curTemp,
        isStirring: curStir,
        effervescenceBubbles: curBubbles,
        iceCount: curIce,
        hasActiveMetal: curMetal,
        isEthanolBurning: curEthanolBurn,
        isConductivityActive: curCondActive,
        conductivityGlow: curCondGlow,
        isBalloonAttached: curBalloonAttached,
        balloonInflation: curBalloonInflation,
        swellingType: curSwellingType,
        swellingLevel: curSwellingLevel,
        crystalType: curCrystalType,
        crystalLevel: curCrystalLevel,
        brownGasIntensity: curBrownGas,
        chemiluminescenceLevel: curChemi,
        silverMirrorLevel: curMirror,
        thermiteGlow: curThermite,
        whiteSmokeIntensity: curWhiteSmoke
      } = liveStateRef.current;

      const currentLiqH = Math.max(0.05, Math.min(10.5, (curVol / 250) * 10.5));
      const hasWater = curVol > 0;

      // 1. Authentic Glass Stirring Rod mixing motion & Whirlpool Vortex
      if (stirRodGroupRef.current) {
        if (curStir && hasWater) {
          const stirSpeed = time * 8.0;
          const stirR = 2.3;
          const tipX = Math.cos(stirSpeed) * stirR;
          const tipZ = Math.sin(stirSpeed) * stirR;
          const topX = Math.cos(stirSpeed * 0.5) * 0.4 + 1.2;
          const topZ = Math.sin(stirSpeed * 0.5) * 0.4;
          stirRodGroupRef.current.position.set((tipX + topX) * 0.5, 8.5, (tipZ + topZ) * 0.5);
          stirRodGroupRef.current.rotation.z = -((topX - tipX) / 17.0);
          stirRodGroupRef.current.rotation.x = (topZ - tipZ) / 17.0;
          stirRodGroupRef.current.rotation.y = stirSpeed * 0.3;
        } else {
          stirRodGroupRef.current.position.set(1.4, 8.5, 0.8);
          stirRodGroupRef.current.rotation.set(0.18, 0, -0.32);
        }
      }

      if (vortexGroupRef.current) {
        vortexGroupRef.current.visible = curStir && hasWater;
        if (curStir && hasWater) {
          vortexGroupRef.current.position.y = 0.37 + currentLiqH;
          vortexGroupRef.current.rotation.y -= 0.24;
        }
      }

      // 2. Liquid Meniscus horizontal rotation
      if (liquidMeniscusRef.current) {
        liquidMeniscusRef.current.position.y = 0.35 + currentLiqH;
        liquidMeniscusRef.current.visible = hasWater;
        liquidMeniscusRef.current.rotation.x = 0;
        liquidMeniscusRef.current.rotation.z = 0;
        if (curStir && hasWater) {
          liquidMeniscusRef.current.rotation.y += 0.22;
        }
      }

      // 3. Bunsen Burner Flame & Ethanol Surface Flame flicker animation
      if (flameMeshRef.current && flameMeshRef.current.visible) {
        const flicker = 1.0 + Math.sin(time * 24) * 0.08 + Math.cos(time * 36) * 0.05;
        flameMeshRef.current.scale.set(flicker, flicker, flicker);
        if (innerFlameMeshRef.current) {
          innerFlameMeshRef.current.scale.set(flicker * 0.95, flicker * 0.95, flicker * 0.95);
        }
      }

      if (ethanolSurfaceFlameGroupRef.current) {
        ethanolSurfaceFlameGroupRef.current.visible = curEthanolBurn && hasWater;
        if (curEthanolBurn && hasWater) {
          ethanolSurfaceFlameGroupRef.current.position.y = 0.35 + currentLiqH;
          const eFlicker = 1.0 + Math.sin(time * 20) * 0.1 + Math.cos(time * 31) * 0.06;
          ethanolSurfaceFlameGroupRef.current.scale.set(1.0, eFlicker, 1.0);
          ethanolSurfaceFlameGroupRef.current.rotation.y += 0.04;
        }
      }

      // 4. Bubbles rise animation (also show bubbles during stirring or electrolysis)
      if (bubblesGroupRef.current) {
        const bubbleSpeedMultiplier = curTemp > 90 ? 1.7 : curStir ? 1.4 : 1.1;
        bubblesGroupRef.current.children.forEach((b: THREE.Object3D) => {
          if (b.visible) {
            b.position.y += (b.userData.speed || 0.09) * bubbleSpeedMultiplier;
            b.position.x += Math.sin(time * 8 + b.userData.wobble) * 0.03;
            if (curStir) {
              const ang = 0.08;
              const bx = b.position.x;
              const bz = b.position.z;
              b.position.x = bx * Math.cos(ang) - bz * Math.sin(ang);
              b.position.z = bx * Math.sin(ang) + bz * Math.cos(ang);
            }
            if (b.position.y > currentLiqH + 0.3) {
              b.position.y = 0.5;
            }
          }
        });
      }

      // 5. Conductivity submerged electric arcs flicker
      if (conductivityArcsGroupRef.current) {
        const showArcs = Boolean(curCondActive && (curCondGlow || 0) > 0.05 && curVol > 15);
        conductivityArcsGroupRef.current.visible = showArcs;
        if (showArcs) {
          conductivityArcsGroupRef.current.children.forEach((arc: THREE.Object3D, idx: number) => {
            arc.position.y = Math.min(currentLiqH * 0.75, 1.0 + idx * 0.85) + Math.sin(time * 18 + idx * 2) * 0.12;
            arc.position.z = Math.cos(time * 22 + idx) * 0.12;
          });
        }
      }

      // 6. Steam rise animation
      if (steamGroupRef.current) {
        steamGroupRef.current.children.forEach((s: THREE.Object3D) => {
          if (s.visible) {
            s.position.y += (s.userData.speed || 0.06);
            s.position.x += Math.sin(time * 2 + s.position.y) * 0.025;
            if (s.position.y > 10) {
              s.position.y = 0;
            }
          }
        });
      }

      // 7. Foam ring animation
      if (foamGroupRef.current) {
        foamGroupRef.current.position.y = 0.35 + currentLiqH;
        const showFoam = hasWater && (curTemp >= 95 || curBubbles > 15);
        foamGroupRef.current.visible = showFoam;
        if (showFoam) {
          foamGroupRef.current.rotation.y += 0.03;
        }
      }

      // 8. Floating Ice Cubes bobbing animation
      if (iceCubesGroupRef.current) {
        const showIce = (curIce || 0) > 0;
        iceCubesGroupRef.current.visible = showIce;
        if (showIce) {
          const baseIceY = hasWater ? 0.35 + currentLiqH - 0.25 : 0.85;
          iceCubesGroupRef.current.position.y = baseIceY;
          iceCubesGroupRef.current.children.forEach((c: THREE.Object3D, idx: number) => {
            c.visible = idx < Math.ceil(curIce || 0);
            c.position.y = hasWater ? Math.sin(time * 3 + (c.userData.offset || idx)) * 0.14 : 0;
            c.rotation.y += 0.01;
          });
        }
      }

      // 9. Active Alkali Metal (Skittering with fire on water OR resting on dry beaker floor!)
      if (activeMetalGroupRef.current) {
        const showMetal = curMetal === 'sodium' || curMetal === 'potassium';
        activeMetalGroupRef.current.visible = showMetal;
        if (showMetal) {
          if (hasWater) {
            // Violently skittering on water surface with blazing flame!
            const orbitR = 2.4;
            const metalX = Math.cos(time * 7.5) * orbitR + Math.sin(time * 16) * 0.55;
            const metalZ = Math.sin(time * 8.5) * orbitR + Math.cos(time * 13) * 0.55;
            activeMetalGroupRef.current.position.set(metalX, 0.35 + currentLiqH + 0.15, metalZ);
            if (metalFlameMeshRef.current) {
              metalFlameMeshRef.current.visible = true;
              const fScale = 1.0 + Math.sin(time * 30) * 0.25;
              metalFlameMeshRef.current.scale.set(fScale, fScale, fScale);
            }
            if (metalFlameLightRef.current) {
              metalFlameLightRef.current.intensity = 3.2;
            }
          } else {
            // Resting on dry beaker floor waiting for water
            activeMetalGroupRef.current.position.set(-1.2, 0.75, 0.6);
            if (metalFlameMeshRef.current) metalFlameMeshRef.current.visible = false;
            if (metalFlameLightRef.current) metalFlameLightRef.current.intensity = 0;
          }
        }
      }

      // 10. Multi-Droplet Pouring Stream / Falling Solid Crystals & Splash Ripple
      const dispState = dispenseAnimStateRef.current;
      if (dispState.active && dispenseDropsGroupRef.current) {
        dispState.progress += 0.045;
        const startY = beakerHeight + 4.0;
        const targetY = hasWater ? 0.35 + currentLiqH : 0.6;
        const children = dispenseDropsGroupRef.current.children as THREE.Mesh[];

        children.forEach((dMesh, idx) => {
          const isSolid = dispState.type === 'solid' || dispState.type === 'powder';
          const count = isSolid ? 16 : 6;
          if (idx >= count) {
            dMesh.visible = false;
            return;
          }
          const delay = idx * (isSolid ? 0.035 : 0.08);
          const localP = Math.max(0, dispState.progress - delay);
          if (localP <= 0 || localP >= 1.0) {
            dMesh.visible = false;
          } else {
            dMesh.visible = true;
            const spread = isSolid ? 1.4 : 0.25;
            const angle = idx * 2.399;
            const rad = (idx % 4) * 0.25 * spread;
            const curY = startY - localP * (startY - targetY);
            dMesh.position.set(Math.cos(angle) * rad, curY, Math.sin(angle) * rad);
            dMesh.scale.set(isSolid ? 0.85 : 0.9, isSolid ? 0.85 : 1.35, isSolid ? 0.85 : 0.9);
          }
        });

        // Expanding Splash Ripple on Liquid Surface
        if (splashRippleMeshRef.current) {
          if (dispState.progress > 0.35 && dispState.progress < 1.35) {
            splashRippleMeshRef.current.visible = true;
            splashRippleMeshRef.current.position.y = targetY + 0.05;
            const rScale = 0.4 + (dispState.progress - 0.35) * 4.2;
            splashRippleMeshRef.current.scale.set(rScale, rScale, 1);
            (splashRippleMeshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
              0,
              0.9 - (dispState.progress - 0.35) * 0.9
            );
          } else {
            splashRippleMeshRef.current.visible = false;
          }
        }

        if (dispState.progress >= 1.5) {
          dispState.active = false;
          children.forEach(c => (c.visible = false));
          if (splashRippleMeshRef.current) splashRippleMeshRef.current.visible = false;
        }
      }

      // 11. 3D EXPLOSION, FIREBALL, SHOCKWAVE, SPARKS, ELECTRIC BOLT & VOLCANO FOAM ANIMATION
      const expState = activeExplosionStateRef.current;
      if (expState.active) {
        expState.age += 1;
        const progress = expState.age / expState.maxAge;
        const expCenterY = hasWater ? 0.35 + currentLiqH + 0.5 : 1.5;

        // (a) Volumetric 3D Fireball
        if (fireballMeshRef.current) {
          if (progress < 0.75) {
            fireballMeshRef.current.visible = true;
            fireballMeshRef.current.position.set(0, expCenterY, 0);
            const maxFbScale =
              expState.type === 'potassium'
                ? 5.2
                : expState.type === 'sodium'
                ? 4.5
                : expState.type === 'magnesium'
                ? 4.0
                : expState.type === 'spark'
                ? 1.8
                : 3.8;
            const curScale = 0.6 + Math.sin(Math.min(1, progress * 1.6) * Math.PI) * maxFbScale;
            fireballMeshRef.current.scale.setScalar(curScale);
            (fireballMeshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
              0,
              0.95 * (1 - progress / 0.75)
            );
          } else {
            fireballMeshRef.current.visible = false;
          }
        }

        // (b) Expanding 3D Shockwave Ring
        if (shockwaveRingRef.current) {
          if (progress < 0.85) {
            shockwaveRingRef.current.visible = true;
            shockwaveRingRef.current.position.set(0, expCenterY, 0);
            const swScale = 0.5 + progress * (expState.type === 'spark' ? 3.5 : 8.5);
            shockwaveRingRef.current.scale.set(swScale, swScale, 1);
            (shockwaveRingRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
              0,
              1.0 - progress / 0.85
            );
          } else {
            shockwaveRingRef.current.visible = false;
          }
        }

        // (c) High-Intensity Explosion PointLight
        if (explosionLightRef.current) {
          explosionLightRef.current.position.set(0, expCenterY + 1.5, 0);
          explosionLightRef.current.intensity = Math.max(0, (1 - progress) * 8.0);
        }

        // (d) 60 Flying Incandescent 3D Sparks
        if (explosionSparksGroupRef.current) {
          explosionSparksGroupRef.current.children.forEach((spObj: THREE.Object3D) => {
            const sp = spObj as THREE.Mesh;
            if (!sp.visible) return;
            sp.userData.life += 1;
            sp.position.x += sp.userData.vx;
            sp.position.y += sp.userData.vy;
            sp.position.z += sp.userData.vz;
            sp.userData.vy -= 0.016; // gravity

            // Bounce off inner glass beaker cylinder wall
            const rDist = Math.hypot(sp.position.x, sp.position.z);
            if (rDist > beakerRadius * 0.88 && sp.position.y < beakerHeight) {
              sp.userData.vx *= -0.6;
              sp.userData.vz *= -0.6;
            }
            if (sp.position.y < 0.4) {
              sp.position.y = 0.4;
              sp.userData.vy = Math.abs(sp.userData.vy) * 0.5;
            }

            const spAlpha = Math.max(0, 1 - sp.userData.life / sp.userData.maxLife);
            (sp.material as THREE.MeshBasicMaterial).opacity = spAlpha;
            if (sp.userData.life >= sp.userData.maxLife) {
              sp.visible = false;
            }
          });
        }

        // (e) Electric Lightning Bolt inside Beaker (for Spark / Hydrogen Pop)
        if (sparkBoltGroupRef.current) {
          const showBolt =
            (expState.type === 'spark' || expState.type === 'hydrogen_pop' || expState.type === 'magnesium') &&
            expState.age < 18;
          sparkBoltGroupRef.current.visible = showBolt;
          if (showBolt) {
            sparkBoltGroupRef.current.rotation.y = Math.random() * Math.PI * 2;
          }
        }

        // (f) Catalytic Volcano Foam Surge (for KMnO4 + H2O2)
        if (volcanoFoamGroupRef.current) {
          const showVolcano = expState.type === 'catalytic_eruption';
          volcanoFoamGroupRef.current.visible = showVolcano;
          if (showVolcano) {
            volcanoFoamGroupRef.current.position.y = 0.35 + currentLiqH * 0.6;
            const vRise = Math.min(1.0, progress * 2.2);
            volcanoFoamGroupRef.current.scale.set(1.0, vRise, 1.0);
            volcanoFoamGroupRef.current.rotation.y += 0.04;
          }
        }

        if (expState.age >= expState.maxAge) {
          expState.active = false;
          if (fireballMeshRef.current) fireballMeshRef.current.visible = false;
          if (shockwaveRingRef.current) shockwaveRingRef.current.visible = false;
          if (explosionLightRef.current) explosionLightRef.current.intensity = 0;
          if (sparkBoltGroupRef.current) sparkBoltGroupRef.current.visible = false;
          if (volcanoFoamGroupRef.current) volcanoFoamGroupRef.current.visible = false;
        }
      }

      // 12. 3D Latex Gas Balloon Inflation Animation (Covers entire beaker mouth and grows gradually)
      if (balloonGroupRef.current && balloonBodyMeshRef.current) {
        const showBalloon = Boolean(curBalloonAttached || (curBalloonInflation || 0) > 0);
        balloonGroupRef.current.visible = showBalloon;
        if (showBalloon) {
          const infRatio = Math.max(0, Math.min(1, (curBalloonInflation || 0) / 100));
          const radScale = beakerRadius * 1.02 + infRatio * 2.15;
          const heightScale = 0.22 + infRatio * 4.35;
          const pulse = infRatio > 0.05 ? Math.sin(time * 6) * 0.05 * infRatio : 0;
          balloonBodyMeshRef.current.scale.set(
            radScale + pulse,
            heightScale + pulse * 1.2,
            radScale + pulse
          );
          balloonBodyMeshRef.current.rotation.z = Math.sin(time * 2.5) * 0.04 * infRatio;
        }
      }

      // 13. 3D Swelling Carbon Snake & Elephant Toothpaste Foam Expansion
      if (carbonSnakeGroupRef.current) {
        const isSnake = curSwellingType === 'carbon_snake' && (curSwellingLevel || 0) > 0;
        carbonSnakeGroupRef.current.visible = isSnake;
        if (isSnake) {
          const swellRatio = Math.max(0.05, Math.min(1, (curSwellingLevel || 0) / 100));
          const visibleSegs = Math.ceil(swellRatio * 22);
          carbonSnakeGroupRef.current.children.forEach((seg: THREE.Object3D, idx: number) => {
            seg.visible = idx < visibleSegs;
            const segProgress = Math.min(1, Math.max(0.1, swellRatio * 22 - idx));
            seg.scale.set(segProgress, segProgress, segProgress);
          });
        }
      }

      if (elephantFoamGroupRef.current) {
        const isFoam = curSwellingType === 'elephant_foam' && (curSwellingLevel || 0) > 0;
        elephantFoamGroupRef.current.visible = isFoam;
        if (isFoam) {
          const swellRatio = Math.max(0.05, Math.min(1, (curSwellingLevel || 0) / 100));
          const visibleBlobs = Math.ceil(swellRatio * 26);
          elephantFoamGroupRef.current.children.forEach((blob: THREE.Object3D, idx: number) => {
            blob.visible = idx < visibleBlobs;
            const wobble = 1.0 + Math.sin(time * 5 + idx) * 0.06;
            const baseS = (0.75 + (idx / 26) * 0.85) * Math.min(1, swellRatio * 1.5);
            blob.scale.setScalar(baseS * wobble);
          });
        }
      }

      // 14. 3D Crystallization Growth & Golden Rain Shimmer
      if (crystalsGroupRef.current) {
        const hasCrystals = curCrystalType !== 'none' && (curCrystalLevel || 0) > 0;
        crystalsGroupRef.current.visible = hasCrystals;
        if (hasCrystals) {
          const cRatio = Math.max(0.05, Math.min(1, (curCrystalLevel || 0) / 100));
          const visibleCrystals = Math.ceil(cRatio * 28);
          crystalsGroupRef.current.children.forEach((crObj: THREE.Object3D, idx: number) => {
            crObj.visible = idx < visibleCrystals;
            const growScale = Math.min(1.35, cRatio * 1.45);
            if (curCrystalType === 'golden_rain') {
              // Glittering golden PbI2 flakes slowly drifting and sparkling in liquid
              const maxH = Math.max(1.2, currentLiqH - 0.4);
              const driftY = ((crObj.userData.baseY + (100 - time * 0.8 + idx * 0.4) % maxH) % maxH) + 0.4;
              crObj.position.y = hasWater ? driftY : 0.45;
              crObj.rotation.y += 0.04;
              crObj.rotation.x += 0.02;
              crObj.scale.set(growScale * 0.65, growScale * 0.25, growScale * 0.65);
            } else if (curCrystalType === 'hot_ice') {
              // Tall needle towers of Sodium Acetate Hot Ice
              crObj.position.y = crObj.userData.baseY;
              crObj.scale.set(growScale * 0.85, growScale * 2.1, growScale * 0.85);
            } else {
              crObj.position.y = crObj.userData.baseY;
              crObj.scale.setScalar(growScale);
            }
          });
        }
      }

      // 15. 3D Reddish-Brown NO2 Gas OR Dense White NH4Cl Smoke Plume Animation
      if (brownGasGroupRef.current) {
        const hasNo2 = (curBrownGas || 0) > 0;
        const hasWhite = (curWhiteSmoke || 0) > 0;
        brownGasGroupRef.current.visible = hasNo2 || hasWhite;
        if (hasNo2 || hasWhite) {
          brownGasGroupRef.current.children.forEach((p: THREE.Object3D, idx: number) => {
            const pm = p as THREE.Mesh;
            (pm.material as THREE.MeshBasicMaterial).color.setHex(
              hasNo2 ? (idx % 2 === 0 ? 0xb45309 : 0x9a3412) : 0xf8fafc
            );
            p.position.y += p.userData.speed || 0.06;
            p.position.x += Math.sin(time * 2.5 + (p.userData.phase || 0)) * 0.03;
            if (p.position.y > 14.5) {
              p.position.y = Math.max(1.0, currentLiqH);
            }
          });
        }
      }

      // 16. 3D Luminol Chemiluminescence Cold Light Animation
      if (chemiluminescenceGroupRef.current) {
        const hasChemi = (curChemi || 0) > 0;
        chemiluminescenceGroupRef.current.visible = hasChemi;
        if (hasChemi) {
          chemiluminescenceGroupRef.current.rotation.y += 0.025;
          chemiluminescenceGroupRef.current.children.forEach((cObj: THREE.Object3D) => {
            if (cObj instanceof THREE.Mesh) {
              const maxH = Math.max(1.5, currentLiqH - 0.3);
              cObj.position.y = 0.5 + ((cObj.userData.baseY + time * 0.6) % maxH);
              const s = 0.8 + Math.sin(time * 6 + (cObj.userData.phase || 0)) * 0.3;
              cObj.scale.setScalar(s);
            }
          });
        }
      }

      // 17. 3D Dichromate Volcano Swelling Cone
      if (dichromateVolcanoGroupRef.current) {
        const isVolc = curSwellingType === 'dichromate_volcano' && (curSwellingLevel || 0) > 0;
        dichromateVolcanoGroupRef.current.visible = isVolc;
        if (isVolc) {
          const sRatio = Math.max(0.1, Math.min(1, (curSwellingLevel || 0) / 100));
          dichromateVolcanoGroupRef.current.scale.set(1, sRatio, 1);
        }
      }

      // 18. 3D Thermite Molten Iron Core Pulsing
      if (thermiteCoreGroupRef.current) {
        const hasThermite = (curThermite || 0) > 0;
        thermiteCoreGroupRef.current.visible = hasThermite;
        if (hasThermite) {
          const pulse = 1.0 + Math.sin(time * 18) * 0.08;
          thermiteCoreGroupRef.current.scale.set(1, pulse, 1);
        }
      }

      // 19. 3D Silver Mirror Coating & Cold Frost Layer
      if (silverMirrorMeshRef.current) {
        const hasMirror = (curMirror || 0) > 0;
        silverMirrorMeshRef.current.visible = hasMirror;
        if (hasMirror) {
          (silverMirrorMeshRef.current.material as THREE.MeshStandardMaterial).opacity = Math.min(
            0.94,
            ((curMirror || 0) / 100) * 0.94
          );
        }
      }

      if (frostCylinderMeshRef.current) {
        const isCold = curTemp < 10.0;
        frostCylinderMeshRef.current.visible = isCold;
        if (isCold) {
          (frostCylinderMeshRef.current.material as THREE.MeshStandardMaterial).opacity = Math.min(
            0.55,
            ((10.0 - curTemp) / 10.0) * 0.5
          );
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
  }, []);

  // --- TRIGGER 3D DISPENSE / POURING / FALLING SOLID ANIMATION ---
  useEffect(() => {
    if (dispenseTrigger > 0 && dispenseDropsGroupRef.current) {
      const dType = dispenseInfo?.type || 'liquid';
      const dColor = dispenseInfo?.color || '#38bdf8';
      dispenseAnimStateRef.current = {
        active: true,
        progress: 0,
        type: dType,
        color: dColor
      };

      dispenseDropsGroupRef.current.children.forEach((child: THREE.Object3D) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        try {
          mat.color.set(dColor);
        } catch {
          mat.color.set(0x38bdf8);
        }
      });

      if (splashRippleMeshRef.current) {
        try {
          (splashRippleMeshRef.current.material as THREE.MeshBasicMaterial).color.set(dColor);
        } catch {
          (splashRippleMeshRef.current.material as THREE.MeshBasicMaterial).color.set(0x38bdf8);
        }
      }
    }
  }, [dispenseTrigger, dispenseInfo]);

  // --- TRIGGER 3D EXPLOSION, FIREBALL, SHOCKWAVE, SPARKS & FLASH ---
  useEffect(() => {
    if (!explosionEvent || explosionEvent.id <= 0) return;
    const eType = explosionEvent.type;

    activeExplosionStateRef.current = {
      active: true,
      age: 0,
      maxAge: eType === 'catalytic_eruption' ? 95 : eType === 'spark' ? 28 : 65,
      type: eType
    };

    // Trigger 3D Camera Shake
    cameraShakeRef.current =
      eType === 'potassium'
        ? 1.4
        : eType === 'sodium'
        ? 1.1
        : eType === 'magnesium'
        ? 0.85
        : eType === 'hydrogen_pop'
        ? 1.0
        : eType === 'catalytic_eruption'
        ? 0.75
        : eType === 'spark'
        ? 0.25
        : 0.65;

    // Trigger Viewport Flash Overlay
    setFlashOverlay({
      color:
        eType === 'magnesium'
          ? 'rgba(255, 255, 255, 0.9)'
          : eType === 'potassium'
          ? 'rgba(216, 180, 254, 0.8)'
          : eType === 'catalytic_eruption'
          ? 'rgba(168, 85, 247, 0.65)'
          : eType === 'spark' || eType === 'hydrogen_pop'
          ? 'rgba(56, 189, 248, 0.65)'
          : 'rgba(251, 146, 60, 0.75)',
      opacity: 0.85
    });

    const mainHex =
      eType === 'magnesium'
        ? 0xffffff
        : eType === 'potassium'
        ? 0xc084fc
        : eType === 'catalytic_eruption'
        ? 0xa855f7
        : eType === 'spark' || eType === 'hydrogen_pop'
        ? 0x38bdf8
        : 0xf97316;

    if (fireballMeshRef.current) {
      (fireballMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(mainHex);
    }
    if (shockwaveRingRef.current) {
      (shockwaveRingRef.current.material as THREE.MeshBasicMaterial).color.setHex(mainHex);
    }
    if (explosionLightRef.current) {
      explosionLightRef.current.color.setHex(mainHex);
    }

    // Initialize 60 3D Flying Sparks
    if (explosionSparksGroupRef.current) {
      const palette =
        eType === 'magnesium'
          ? [0xffffff, 0xe0f2fe, 0xfef08a, 0x38bdf8]
          : eType === 'potassium'
          ? [0xc084fc, 0xa855f7, 0xe879f9, 0xffffff]
          : eType === 'catalytic_eruption'
          ? [0xa855f7, 0xd8b4fe, 0x7e22ce, 0xffffff]
          : eType === 'spark' || eType === 'hydrogen_pop'
          ? [0x38bdf8, 0x7dd3fc, 0xffffff, 0xfef08a]
          : [0xfef08a, 0xf59e0b, 0xef4444, 0xffffff];

      const currentLiqH = Math.max(0.5, Math.min(10.5, (liveStateRef.current.totalVolumeMl / 250) * 10.5));
      const startY = liveStateRef.current.totalVolumeMl > 0 ? 0.35 + currentLiqH : 1.2;

      explosionSparksGroupRef.current.children.forEach((spObj: THREE.Object3D, idx: number) => {
        const sp = spObj as THREE.Mesh;
        const maxCount = eType === 'spark' ? 24 : 60;
        if (idx >= maxCount) {
          sp.visible = false;
          return;
        }
        sp.visible = true;
        sp.position.set(
          (Math.random() - 0.5) * 1.5,
          startY + (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 1.5
        );
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.75;
        const speed = (eType === 'spark' ? 0.15 : 0.25) + Math.random() * 0.38;
        sp.userData = {
          vx: Math.sin(phi) * Math.cos(theta) * speed,
          vy: Math.cos(phi) * speed + 0.18,
          vz: Math.sin(phi) * Math.sin(theta) * speed,
          life: 0,
          maxLife: (eType === 'spark' ? 20 : 38) + Math.floor(Math.random() * 22)
        };
        const col = palette[idx % palette.length];
        (sp.material as THREE.MeshBasicMaterial).color.setHex(col);
        (sp.material as THREE.MeshBasicMaterial).opacity = 1.0;
      });
    }
  }, [explosionEvent]);

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
                liquidLightRef.current.intensity = totalVolumeMl > 0 ? (chemiluminescenceLevel > 0 ? 3.8 : 1.4) : 0;
              }
              if (causticsDiscMeshRef.current) {
                causticsDiscMeshRef.current.visible = totalVolumeMl > 0;
                (causticsDiscMeshRef.current.material as THREE.MeshBasicMaterial).color.setRGB(r, g, b);
              }
              if (chemiluminescenceLevel > 0) {
                mat.emissive.setHex(0x00f5d4);
                mat.emissiveIntensity = (chemiluminescenceLevel / 100) * 0.85;
              } else {
                mat.emissive.setHex(0x000000);
                mat.emissiveIntensity = 0;
              }
            }
          } else if (fluidColor === 'transparent') {
            liquidMeshRef.current.visible = false;
            if (liquidMeniscusRef.current) liquidMeniscusRef.current.visible = false;
            if (liquidLightRef.current) liquidLightRef.current.intensity = 0;
            if (causticsDiscMeshRef.current) causticsDiscMeshRef.current.visible = false;
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
            if (causticsDiscMeshRef.current) {
              causticsDiscMeshRef.current.visible = totalVolumeMl > 0;
              (causticsDiscMeshRef.current.material as THREE.MeshBasicMaterial).color.set(fluidColor);
            }
          }
        } catch {
          mat.color.set(0x38bdf8);
          mat.opacity = 0.85;
        }
      }
    }

    // 2. Precipitate & Undissolved Solids Mesh at Bottom of Beaker
    if (precipitateMeshRef.current) {
      precipitateMeshRef.current.visible = precipitateG > 0.05;
      const sedH = Math.min(2.5, (precipitateG / 35) * 2.2 + 0.25);
      precipitateMeshRef.current.scale.set(1, sedH, 1);

      const pMat = precipitateMeshRef.current.material as THREE.MeshStandardMaterial;
      if (precipitateType === 'silver_chloride' || precipitateType === 'barium_sulfate' || precipitateType === 'white_salt') {
        pMat.color.set(0xf8fafc); // Dense milky white / crystalline powder
      } else if (precipitateType === 'copper_hydroxide') {
        pMat.color.set(0x38bdf8); // Sky blue
      } else if (precipitateType === 'copper_metal') {
        pMat.color.set(0xd97706); // Reddish-copper displaced metal
      } else if (precipitateType === 'golden_lead_iodide') {
        pMat.color.set(0xfacc15); // Brilliant golden yellow PbI2
      } else if (precipitateType === 'carbon_black') {
        pMat.color.set(0x18181b); // Jet black dehydrated carbon
      } else if (precipitateType === 'prussian_blue') {
        pMat.color.set(0x1e3a8a); // Deep royal Prussian blue pigment
      } else if (precipitateType === 'ferric_hydroxide') {
        pMat.color.set(0x9a3412); // Rust reddish-brown Fe(OH)3
      } else if (precipitateType === 'cuprous_oxide') {
        pMat.color.set(0xdc2626); // Brick-red Fehling's Cu2O precipitate
      } else if (precipitateType === 'sulfur_yellow') {
        pMat.color.set(0xfef08a); // Pale yellow colloidal sulfur
      } else if (precipitateType === 'dichromate_green') {
        pMat.color.set(0x14532d); // Dark green Cr2O3 volcanic ash
      } else if (precipitateType === 'molten_iron') {
        pMat.color.set(0xf97316); // Glowing molten thermite slag
      } else if (precipitateType === 'iron') {
        pMat.color.set(0x475569); // Dark metallic iron filings
      } else if (precipitateType === 'permanganate') {
        pMat.color.set(0x7e22ce); // Deep royal purple crystals
      } else {
        pMat.color.set(0x38bdf8);
      }
    }

    // 3. Flame State & Flame Test Spectral Color
    if (flameMeshRef.current && innerFlameMeshRef.current && flameLightRef.current) {
      const isBurning = burnerPower !== 'off';
      flameMeshRef.current.visible = isBurning;
      innerFlameMeshRef.current.visible = isBurning;

      let flameHex = 0x06b6d4;
      let innerHex = 0x38bdf8;
      let lightHex = 0x38bdf8;
      const intensity = burnerPower === 'high' ? 3.5 : burnerPower === 'med' ? 2.5 : burnerPower === 'low' ? 1.4 : 0;

      if (flameTestMetal === 'copper') {
        flameHex = 0x10b981;
        innerHex = 0x34d399;
        lightHex = 0x10b981;
      } else if (flameTestMetal === 'sodium') {
        flameHex = 0xf59e0b;
        innerHex = 0xfbbf24;
        lightHex = 0xf59e0b;
      } else if (flameTestMetal === 'potassium') {
        flameHex = 0xa855f7;
        innerHex = 0xc084fc;
        lightHex = 0xa855f7;
      } else if (flameTestMetal === 'calcium') {
        flameHex = 0xea580c;
        innerHex = 0xfb923c;
        lightHex = 0xea580c;
      } else if (flameTestMetal === 'strontium') {
        flameHex = 0xe11d48;
        innerHex = 0xf43f5e;
        lightHex = 0xe11d48;
      } else if (flameTestMetal === 'barium') {
        flameHex = 0x84cc16;
        innerHex = 0xa3e635;
        lightHex = 0x84cc16;
      } else if (flameTestMetal === 'lithium') {
        flameHex = 0xf43f5e;
        innerHex = 0xfda4af;
        lightHex = 0xf43f5e;
      }

      (flameMeshRef.current.material as THREE.MeshBasicMaterial).color.set(flameHex);
      (innerFlameMeshRef.current.material as THREE.MeshBasicMaterial).color.set(innerHex);
      flameLightRef.current.color.set(lightHex);
      flameLightRef.current.intensity = isBurning ? intensity : 0;

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

    // 4. Bubbles (Effervescence, Boiling, Electrolysis, or Stirring)
    if (bubblesGroupRef.current) {
      const baseBubbles =
        effervescenceBubbles > 0
          ? Math.ceil(effervescenceBubbles / 1.4)
          : currentTempC >= 90
          ? 28
          : currentTempC >= 75
          ? 14
          : isStirring && totalVolumeMl > 0
          ? 10
          : isConductivityActive && conductivityGlow > 0.05 && totalVolumeMl > 0
          ? 8
          : 0;
      const activeBubbleCount = Math.min(45, baseBubbles);
      bubblesGroupRef.current.children.forEach((b: THREE.Object3D, idx: number) => {
        b.visible = totalVolumeMl > 0 && idx < activeBubbleCount;
      });
    }

    // 5. Steam
    if (steamGroupRef.current) {
      const showSteam = (totalVolumeMl > 0 && currentTempC >= 68) || effervescenceBubbles > 20 || isEthanolBurning;
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
      if (isConductivityActive && conductivityGlow > 0.05 && totalVolumeMl > 0) {
        bMat.emissive.set(0xfef08a);
        bMat.emissiveIntensity = conductivityGlow * 2.2;
        bulbLightRef.current.intensity = conductivityGlow * 3.5;
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
        let stripHex = 0x10b981;
        if (phValue < 3.5) stripHex = 0xef4444;
        else if (phValue < 6.5) stripHex = 0xf97316;
        else if (phValue > 11.0) stripHex = 0x7c3aed;
        else if (phValue > 7.5) stripHex = 0x2563eb;
        (litmusImmersedMeshRef.current.material as THREE.MeshStandardMaterial).color.set(stripHex);
      }
    }

    // 9. Active Metal Flare Color
    if (metalFlameMeshRef.current && metalFlameLightRef.current) {
      if (hasActiveMetal === 'potassium') {
        (metalFlameMeshRef.current.material as THREE.MeshBasicMaterial).color.set(0xc084fc);
        metalFlameLightRef.current.color.set(0xc084fc);
      } else {
        (metalFlameMeshRef.current.material as THREE.MeshBasicMaterial).color.set(0xf59e0b);
        metalFlameLightRef.current.color.set(0xf59e0b);
      }
    }

    // 10. Magnesium Ribbon
    if (magnesiumRibbonMeshRef.current) {
      magnesiumRibbonMeshRef.current.visible = hasMagnesiumRibbon;
    }

    // 10b. Zinc Granules & Copper Turnings
    if (zincGranulesGroupRef.current) {
      const showGranules = hasZincGranules || hasCopperTurnings;
      zincGranulesGroupRef.current.visible = showGranules;
      if (showGranules) {
        const gHex =
          precipitateType === 'copper_metal' || (hasCopperTurnings && !hasZincGranules)
            ? 0xd97706
            : 0x94a3b8;
        zincGranulesGroupRef.current.children.forEach((child: THREE.Object3D) => {
          const m = child as THREE.Mesh;
          (m.material as THREE.MeshStandardMaterial).color.setHex(gHex);
        });
      }
    }

    // 10c. Balloon Color Update
    if (balloonBodyMeshRef.current && balloonColor) {
      try {
        (balloonBodyMeshRef.current.material as THREE.MeshPhysicalMaterial).color.set(balloonColor);
      } catch {
        // ignore
      }
    }

    // 10d. Crystal Material Color Update (Supports Chemical Garden & 24K Gold Tree!)
    if (crystalsGroupRef.current && crystalType !== 'none') {
      const gardenPalette = [0x10b981, 0x3b82f6, 0xec4899, 0xf59e0b, 0xa855f7, 0x06b6d4];
      crystalsGroupRef.current.children.forEach((child: THREE.Object3D, idx: number) => {
        const m = child as THREE.Mesh;
        const mat = m.material as THREE.MeshPhysicalMaterial;
        if (crystalType === 'chemical_garden') {
          mat.color.setHex(gardenPalette[idx % gardenPalette.length]);
          mat.metalness = 0.25;
        } else if (crystalType === 'gold_tree') {
          mat.color.setHex(0xfacc15);
          mat.metalness = 0.96;
          mat.roughness = 0.08;
        } else {
          const cHex =
            crystalType === 'copper_blue'
              ? 0x0284c7
              : crystalType === 'golden_rain'
              ? 0xfacc15
              : crystalType === 'silver_tree'
              ? 0xe2e8f0
              : crystalType === 'hot_ice'
              ? 0xf0f9ff
              : 0xbae6fd;
          mat.color.setHex(cHex);
          mat.metalness = crystalType === 'silver_tree' || crystalType === 'golden_rain' ? 0.85 : 0.15;
        }
      });
    }

    // 11. Gas Syringe (only when balloon is not attached)
    if (gasSyringeGroupRef.current && gasPlungerMeshRef.current) {
      const showGas = hydrogenGasMl > 0 && !isBalloonAttached && balloonInflation <= 0;
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
    isStirring,
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
    precipitateType,
    isBalloonAttached,
    balloonInflation,
    balloonColor,
    swellingType,
    swellingLevel,
    crystalType,
    crystalLevel,
    hasZincGranules,
    hasCopperTurnings,
    brownGasIntensity,
    chemiluminescenceLevel,
    silverMirrorLevel,
    thermiteGlow,
    whiteSmokeIntensity
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

      {/* Explosion / Flare Viewport Flash Overlay */}
      {flashOverlay && (
        <div
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-75"
          style={{
            backgroundColor: flashOverlay.color,
            opacity: flashOverlay.opacity
          }}
        />
      )}

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
            conductivityGlow > 0.05 && totalVolumeMl > 0
              ? 'bg-yellow-950/90 border-yellow-500/60 text-yellow-300'
              : 'bg-slate-900/90 border-slate-700 text-slate-400'
          }`}>
            <Zap className={`w-3.5 h-3.5 ${conductivityGlow > 0.05 && totalVolumeMl > 0 ? 'text-yellow-400 animate-bounce' : 'text-slate-500'}`} />
            <span className="font-bold">
              {conductivityGlow > 0.05 && totalVolumeMl > 0
                ? `${t('توصيل كهربائي:', 'Conductivity:')} ${(conductivityGlow * 100).toFixed(0)}%`
                : t('محلول غير موصل (عازل)', 'Non-conductive solution')}
            </span>
          </div>
        )}

        {hydrogenGasMl > 0 && !isBalloonAttached && (
          <div className="px-2.5 py-1 rounded-lg bg-blue-950/90 backdrop-blur-md border border-blue-500/50 text-blue-300 flex items-center gap-1.5 shadow-md">
            <Wind className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">{t('محقنة تجميع الغاز:', 'Gas Syringe:')} {hydrogenGasMl.toFixed(0)} mL H₂</span>
          </div>
        )}

        {(isBalloonAttached || balloonInflation > 0) && (
          <div className="px-2.5 py-1 rounded-lg bg-pink-950/90 backdrop-blur-md border border-pink-500/60 text-pink-300 flex items-center gap-1.5 shadow-md">
            <span>🎈</span>
            <span className="font-bold">
              {t('انتفاخ بالون الغاز:', 'Balloon Inflation:')} {balloonInflation.toFixed(0)}%
            </span>
          </div>
        )}

        {swellingType !== 'none' && swellingLevel > 0 && (
          <div className="px-2.5 py-1 rounded-lg bg-purple-950/90 backdrop-blur-md border border-purple-500/60 text-purple-300 flex items-center gap-1.5 shadow-md animate-pulse">
            <span>{swellingType === 'carbon_snake' ? '🐍' : '🌋'}</span>
            <span className="font-bold">
              {swellingType === 'carbon_snake'
                ? `${t('انتفاخ ثعبان الكربون:', 'Carbon Snake Swelling:')} ${swellingLevel.toFixed(0)}%`
                : `${t('انتفاخ رغوة معجون الفيل:', 'Elephant Foam Swelling:')} ${swellingLevel.toFixed(0)}%`}
            </span>
          </div>
        )}

        {crystalType !== 'none' && crystalLevel > 0 && (
          <div className="px-2.5 py-1 rounded-lg bg-cyan-950/90 backdrop-blur-md border border-cyan-400/60 text-cyan-200 flex items-center gap-1.5 shadow-md">
            <span>💎</span>
            <span className="font-bold">
              {t('نمو البلورات (التبلور):', 'Crystal Growth:')} {crystalLevel.toFixed(0)}%
            </span>
          </div>
        )}

        {brownGasIntensity > 0 && (
          <div className="px-2.5 py-1 rounded-lg bg-amber-950/90 backdrop-blur-md border border-amber-600/60 text-amber-300 flex items-center gap-1.5 shadow-md">
            <span>☁️</span>
            <span className="font-bold">
              {t('غاز NO₂ البني المتصاعد:', 'Evolving Brown NO₂ Gas:')} {brownGasIntensity.toFixed(0)}%
            </span>
          </div>
        )}

        {chemiluminescenceLevel > 0 && (
          <div className="px-2.5 py-1 rounded-lg bg-teal-950/90 backdrop-blur-md border border-teal-400/60 text-teal-200 flex items-center gap-1.5 shadow-md animate-pulse">
            <span>✨</span>
            <span className="font-bold">
              {t('توهج اللومينول الكيميائي:', 'Luminol Chemiluminescence:')} {chemiluminescenceLevel.toFixed(0)}%
            </span>
          </div>
        )}

        {silverMirrorLevel > 0 && (
          <div className="px-2.5 py-1 rounded-lg bg-slate-800/95 backdrop-blur-md border border-slate-300/60 text-slate-100 flex items-center gap-1.5 shadow-md">
            <span>🪞</span>
            <span className="font-bold">
              {t('مرآة الفضة البراقة (تولن):', 'Tollens Silver Mirror:')} {silverMirrorLevel.toFixed(0)}%
            </span>
          </div>
        )}

        {thermiteGlow > 0 && (
          <div className="px-2.5 py-1 rounded-lg bg-orange-950/95 backdrop-blur-md border border-yellow-400/70 text-yellow-200 flex items-center gap-1.5 shadow-md animate-bounce">
            <span>🔥</span>
            <span className="font-bold">
              {t('تفاعل الثرميت المنصهر (2500°C):', 'Molten Thermite (2500°C):')} {thermiteGlow.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Camera View Angle Presets Toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-lg">
        <button
          onClick={() => handleSetCameraPreset('beaker')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
            activeCameraView === 'beaker' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title={t('لقطة مقربة للكأس والماء', 'Beaker Close-up')}
        >
          <span>🔬</span>
          <span>{t('الكأس', 'Beaker')}</span>
        </button>
        <button
          onClick={() => handleSetCameraPreset('top')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
            activeCameraView === 'top' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title={t('فحص المحلول والدوامة رأسياً من الأعلى', 'Top-Down Surface Vortex')}
        >
          <span>🌀</span>
          <span>{t('السطح', 'Top')}</span>
        </button>
        <button
          onClick={() => handleSetCameraPreset('flame')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
            activeCameraView === 'flame' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title={t('تركيز على موقد بنسن واللهب', 'Burner Flame Focus')}
        >
          <span>🔥</span>
          <span>{t('اللهب', 'Flame')}</span>
        </button>
        <button
          onClick={() => handleSetCameraPreset('overview')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
            activeCameraView === 'overview' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
          title={t('زاوية عامة شاملة لمنضدة المعمل', 'Full Workbench Overview')}
        >
          <span>🏛️</span>
          <span>{t('المعمل', 'Lab')}</span>
        </button>
      </div>

      {/* Camera Interactive Controls (Zoom, Auto-rotate, Reset, Fullscreen) */}
      <div className="absolute bottom-2.5 right-3 flex items-center gap-1 z-10 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-lg">
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
      <div className="absolute bottom-2.5 left-3 text-[10px] text-slate-400 font-mono bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 pointer-events-none">
        <span>🖱️ {t('اسحب للتدوير 360° | عجل الماوس للتقريب', 'Drag to rotate 360° | Scroll to zoom')}</span>
      </div>
    </div>
  );
};
