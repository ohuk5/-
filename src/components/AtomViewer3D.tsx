import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Compass,
  Eye,
  Layers,
  Sparkles,
  Play,
  Pause
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface AtomViewer3DProps {
  protons: number;
  neutrons: number;
  electrons: number;
  elementSymbol: string;
  elementName: string;
  isStable: boolean;
  showSpinArrows: boolean;
  orbitSpeed: number;
  dimensionMode?: '3d' | '2d';
}

type ModelViewType = 'bohr_spatial' | 'quantum_cloud' | 'rutherford';

export const AtomViewer3D: React.FC<AtomViewer3DProps> = ({
  protons,
  neutrons,
  electrons,
  elementSymbol,
  elementName,
  isStable,
  showSpinArrows,
  orbitSpeed,
  dimensionMode = '3d'
}) => {
  const { theme, t } = useApp();
  const isDark = theme === 'dark';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D View Modes & Settings
  const [viewType, setViewType] = useState<ModelViewType>('bohr_spatial');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showRings, setShowRings] = useState<boolean>(true);
  const [showNucleusCluster, setShowNucleusCluster] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // References to keep Three.js animation and camera in sync
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Camera Orbit State (Spherical coords)
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 75,
    theta: Math.PI / 4,
    phi: Math.PI / 3
  });

  // Calculate electron shells (2, 8, 18, 32, 32, 18, 8)
  const shells = React.useMemo(() => {
    const capacities = [2, 8, 18, 32, 32, 18, 8];
    const distribution: number[] = [0, 0, 0, 0, 0, 0, 0];
    let remaining = electrons;
    for (let i = 0; i < capacities.length; i++) {
      if (remaining <= 0) break;
      const count = Math.min(remaining, capacities[i]);
      distribution[i] = count;
      remaining -= count;
    }
    return distribution;
  }, [electrons]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(40, 60, 50);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.8);
    dirLight2.position.set(-40, -30, -40);
    scene.add(dirLight2);

    const nucleusPointLight = new THREE.PointLight(0xff4444, 2.5, 60);
    nucleusPointLight.position.set(0, 0, 0);
    scene.add(nucleusPointLight);

    // Root Group for the Atom
    const atomGroup = new THREE.Group();
    scene.add(atomGroup);

    // Dynamic objects arrays to update per frame
    const electronMeshes: Array<{
      mesh: THREE.Group;
      shellIndex: number;
      orbitRadius: number;
      speed: number;
      angle: number;
      inclinationX: number;
      inclinationY: number;
      inclinationZ: number;
      isSpinUp: boolean;
      arrowGroup?: THREE.Group;
    }> = [];

    // --- A. BUILD 3D NUCLEUS CLUSTER ---
    const nucleusGroup = new THREE.Group();
    atomGroup.add(nucleusGroup);

    const cappedP = Math.min(50, protons);
    const cappedN = Math.min(60, neutrons);
    const totalNucleons = cappedP + cappedN;

    const sphereR = 1.35;
    const protonGeo = new THREE.SphereGeometry(sphereR, 20, 20);
    const neutronGeo = new THREE.SphereGeometry(sphereR, 20, 20);

    const protonMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.3
    });

    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.55
    });

    let clusterMaxRadius = 2.0;

    if (showNucleusCluster && totalNucleons > 0) {
      // 1. Interleave protons and neutrons evenly so they are intimately bonded together
      const nucleonTypes: Array<'proton' | 'neutron'> = [];
      let pLeft = cappedP;
      let nLeft = cappedN;
      while (pLeft > 0 || nLeft > 0) {
        if (pLeft > 0 && (nLeft === 0 || pLeft >= nLeft)) {
          nucleonTypes.push('proton');
          pLeft--;
        } else if (nLeft > 0) {
          nucleonTypes.push('neutron');
          nLeft--;
        }
      }

      // 2. Generate tight, physically touching sphere positions (Close-Packing with zero empty gaps)
      const touchDist = sphereR * 1.96; // slightly fused by 2% to represent strong nuclear force binding
      const positions: THREE.Vector3[] = [];

      if (totalNucleons === 1) {
        positions.push(new THREE.Vector3(0, 0, 0));
      } else if (totalNucleons === 2) {
        positions.push(new THREE.Vector3(-touchDist * 0.5, 0, 0));
        positions.push(new THREE.Vector3(touchDist * 0.5, 0, 0));
      } else if (totalNucleons === 3) {
        const r = touchDist / Math.sqrt(3);
        for (let k = 0; k < 3; k++) {
          const a = (k * 2 * Math.PI) / 3;
          positions.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
        }
      } else if (totalNucleons === 4) {
        // Regular tetrahedron (Helium-4 / alpha particle: densest 4-sphere cluster)
        const a = touchDist / Math.SQRT2;
        positions.push(new THREE.Vector3( a * 0.5,  a * 0.5,  a * 0.5));
        positions.push(new THREE.Vector3(-a * 0.5, -a * 0.5,  a * 0.5));
        positions.push(new THREE.Vector3(-a * 0.5,  a * 0.5, -a * 0.5));
        positions.push(new THREE.Vector3( a * 0.5, -a * 0.5, -a * 0.5));
      } else {
        // Face-Centered Cubic (FCC) close-packing (Kepler conjecture: maximum 74% density of touching spheres)
        const latticePoints: THREE.Vector3[] = [];
        const maxL = 5;
        const step = touchDist / Math.SQRT2;
        for (let x = -maxL; x <= maxL; x++) {
          for (let y = -maxL; y <= maxL; y++) {
            for (let z = -maxL; z <= maxL; z++) {
              if ((Math.abs(x) + Math.abs(y) + Math.abs(z)) % 2 === 0) {
                latticePoints.push(new THREE.Vector3(x * step, y * step, z * step));
              }
            }
          }
        }
        // Sort strictly by distance from origin (0,0,0) so the nucleus grows as a dense, solid cluster
        latticePoints.sort((a, b) => a.lengthSq() - b.lengthSq());
        for (let k = 0; k < totalNucleons; k++) {
          positions.push(latticePoints[k]);
        }
      }

      // Add spheres to nucleus group
      positions.forEach((pos, idx) => {
        const isProton = nucleonTypes[idx] === 'proton';
        const mat = isProton ? protonMat : neutronMat;
        const geo = isProton ? protonGeo : neutronGeo;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);

        mesh.userData = {
          origX: pos.x,
          origY: pos.y,
          origZ: pos.z,
          jitterOffset: idx * 0.618
        };

        nucleusGroup.add(mesh);
      });

      clusterMaxRadius = positions.length > 0 ? Math.max(...positions.map(p => p.length())) + sphereR : 2.0;

      // Add Glowing Nuclear Field Halo tightly around the dense cluster (smooth glowing shell, non-wireframe)
      const haloGeo = new THREE.SphereGeometry(clusterMaxRadius * 1.15, 32, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: isStable ? 0x38bdf8 : 0xf43f5e,
        transparent: true,
        opacity: 0.10,
        blending: THREE.AdditiveBlending,
        wireframe: false,
        side: THREE.BackSide
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      nucleusGroup.add(haloMesh);
    }

    // --- B. BUILD 3D ELECTRON SHELLS & ORBITALS ---
    const baseRadius = Math.max(9.0, clusterMaxRadius + 4.2);
    const radiusStep = 5.2;

    // Electron Geometries & Materials
    const electronGeo = new THREE.SphereGeometry(0.75, 16, 16);
    const spinUpMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const spinDownMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Orange
      emissive: 0xc2410c,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });

    if (viewType === 'bohr_spatial') {
      // Bohr 3D Spatial: Each principal quantum shell has its own tilted spatial plane.
      // ALL electrons belonging to that shell travel STRICTLY on that shell's ring.
      shells.forEach((count, shellIdx) => {
        if (count === 0) return;

        const shellRadius = baseRadius + shellIdx * radiusStep;
        
        // Coordinated 3D tilt angle per shell giving authentic spatial depth
        const tiltX = (shellIdx * 0.26) - 0.2;
        const tiltY = (shellIdx * 0.42);
        const tiltZ = (shellIdx * 0.18) - 0.1;

        // 1. Build and add the visible 3D Orbit Ring for this shell
        if (showRings) {
          const curve = new THREE.EllipseCurve(
            0, 0,
            shellRadius, shellRadius,
            0, 2 * Math.PI,
            false,
            0
          );
          const points = curve.getPoints(128);
          const ringGeo = new THREE.BufferGeometry().setFromPoints(
            points.map(p => new THREE.Vector3(p.x, 0, p.y))
          );
          const ringMat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.45
          });
          const ringLine = new THREE.LineLoop(ringGeo, ringMat);
          ringLine.rotation.set(tiltX, tiltY, tiltZ);
          atomGroup.add(ringLine);
        }

        // 2. Distribute all electrons in this shell strictly along this ring
        for (let e = 0; e < count; e++) {
          const isSpinUp = e % 2 === 0;

          // Single Electron 3D Group
          const eGroup = new THREE.Group();
          const eMesh = new THREE.Mesh(electronGeo, isSpinUp ? spinUpMat : spinDownMat);
          eGroup.add(eMesh);

          // 3D Directional Vector Arrow (Cone + Cylinder)
          let arrowGroup: THREE.Group | undefined;
          if (showSpinArrows) {
            arrowGroup = new THREE.Group();
            
            // Tangent Arrow head (Cone) & shaft
            const coneGeo = new THREE.ConeGeometry(0.7, 1.8, 12);
            coneGeo.rotateX(Math.PI / 2); // point forward
            const arrowMat = new THREE.MeshBasicMaterial({
              color: isSpinUp ? 0x38bdf8 : 0xf97316
            });
            const coneMesh = new THREE.Mesh(coneGeo, arrowMat);
            coneMesh.position.set(0, 0, 2.4);
            arrowGroup.add(coneMesh);

            // Small shaft line
            const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8);
            shaftGeo.rotateX(Math.PI / 2);
            const shaftMesh = new THREE.Mesh(shaftGeo, arrowMat);
            shaftMesh.position.set(0, 0, 1.2);
            arrowGroup.add(shaftMesh);

            eGroup.add(arrowGroup);
          }

          atomGroup.add(eGroup);

          // Base angular speed (alternating direction per Pauli principle)
          const direction = isSpinUp ? -1 : 1;
          const baseSpeed = (0.024 / (shellIdx + 1)) * direction;
          const initialAngle = (e / count) * Math.PI * 2;

          electronMeshes.push({
            mesh: eGroup,
            shellIndex: shellIdx,
            orbitRadius: shellRadius,
            speed: baseSpeed,
            angle: initialAngle,
            inclinationX: tiltX,
            inclinationY: tiltY,
            inclinationZ: tiltZ,
            isSpinUp,
            arrowGroup
          });
        }
      });
    } else if (viewType === 'rutherford') {
      // Classic Rutherford crossed orbital planes (iconic 3 crossed 3D orbits)
      const rutherfordPlanes = [
        { incX: 0.85, incY: 0.1, incZ: 0.35, color: 0x38bdf8 },
        { incX: -0.75, incY: 0.5, incZ: -0.4, color: 0x818cf8 },
        { incX: 0.15, incY: 0.95, incZ: 0.8, color: 0x34d399 }
      ];

      shells.forEach((count, shellIdx) => {
        if (count === 0) return;
        const shellRadius = baseRadius + shellIdx * radiusStep;

        // Draw rings for each crossed plane used in this shell
        const activePlanesCount = Math.min(3, Math.max(1, Math.ceil(count / 2)));
        for (let pIdx = 0; pIdx < activePlanesCount; pIdx++) {
          if (showRings) {
            const curve = new THREE.EllipseCurve(
              0, 0,
              shellRadius, shellRadius,
              0, 2 * Math.PI,
              false,
              0
            );
            const points = curve.getPoints(128);
            const ringGeo = new THREE.BufferGeometry().setFromPoints(
              points.map(p => new THREE.Vector3(p.x, 0, p.y))
            );
            const ringMat = new THREE.LineBasicMaterial({
              color: rutherfordPlanes[pIdx].color,
              transparent: true,
              opacity: 0.45
            });
            const ringLine = new THREE.LineLoop(ringGeo, ringMat);
            ringLine.rotation.set(
              rutherfordPlanes[pIdx].incX,
              rutherfordPlanes[pIdx].incY,
              rutherfordPlanes[pIdx].incZ
            );
            atomGroup.add(ringLine);
          }
        }

        // Distribute electrons strictly onto these crossed planes
        for (let e = 0; e < count; e++) {
          const isSpinUp = e % 2 === 0;
          const planeIdx = Math.floor(e / 2) % activePlanesCount;
          const plane = rutherfordPlanes[planeIdx];

          const eGroup = new THREE.Group();
          const eMesh = new THREE.Mesh(electronGeo, isSpinUp ? spinUpMat : spinDownMat);
          eGroup.add(eMesh);

          let arrowGroup: THREE.Group | undefined;
          if (showSpinArrows) {
            arrowGroup = new THREE.Group();
            const coneGeo = new THREE.ConeGeometry(0.7, 1.8, 12);
            coneGeo.rotateX(Math.PI / 2);
            const arrowMat = new THREE.MeshBasicMaterial({
              color: isSpinUp ? 0x38bdf8 : 0xf97316
            });
            const coneMesh = new THREE.Mesh(coneGeo, arrowMat);
            coneMesh.position.set(0, 0, 2.4);
            arrowGroup.add(coneMesh);

            const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8);
            shaftGeo.rotateX(Math.PI / 2);
            const shaftMesh = new THREE.Mesh(shaftGeo, arrowMat);
            shaftMesh.position.set(0, 0, 1.2);
            arrowGroup.add(shaftMesh);

            eGroup.add(arrowGroup);
          }

          atomGroup.add(eGroup);

          const direction = isSpinUp ? -1 : 1;
          const baseSpeed = (0.024 / (shellIdx + 1)) * direction;
          const initialAngle = (e / count) * Math.PI * 2;

          electronMeshes.push({
            mesh: eGroup,
            shellIndex: shellIdx,
            orbitRadius: shellRadius,
            speed: baseSpeed,
            angle: initialAngle,
            inclinationX: plane.incX,
            inclinationY: plane.incY,
            inclinationZ: plane.incZ,
            isSpinUp,
            arrowGroup
          });
        }
      });
    }

    // --- C. QUANTUM PROBABILITY CLOUD MODE (|ψ|²) ---
    let cloudPoints: THREE.Points | null = null;
    if (viewType === 'quantum_cloud') {
      const particleCount = Math.min(3000, 400 + electrons * 120);
      const cloudPositions = new Float32Array(particleCount * 3);
      const cloudColors = new Float32Array(particleCount * 3);

      const color1 = new THREE.Color(0x06b6d4); // Cyan
      const color2 = new THREE.Color(0x8b5cf6); // Purple
      const color3 = new THREE.Color(0xf43f5e); // Rose

      for (let i = 0; i < particleCount; i++) {
        // Quantum orbital distribution with exponential radial decay and angular lobes (s, p, d)
        const shellTarget = 1 + Math.floor(Math.random() * Math.min(5, shells.filter(s => s > 0).length || 1));
        const rMean = baseRadius * (0.6 + shellTarget * 0.45);
        // Exponential radial distribution simulating hydrogenic radial wavefunctions R_nl(r)
        const u1 = Math.random();
        const u2 = Math.random();
        const r = rMean * Math.sqrt(-2 * Math.log(Math.max(0.0001, u1))) * (0.7 + 0.3 * u2);

        // Spherical angles
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = 2 * Math.PI * Math.random();

        // Add spherical harmonic probability shaping: P-orbitals (dumbbell shapes)
        let probWeight = 1.0;
        if (shellTarget >= 2) {
          probWeight = Math.pow(Math.cos(theta), 2) + 0.2; // Dumbbell lobe bias
        }

        const effectiveR = r * (0.8 + 0.4 * probWeight);

        cloudPositions[i * 3] = effectiveR * Math.sin(theta) * Math.cos(phi);
        cloudPositions[i * 3 + 1] = effectiveR * Math.cos(theta);
        cloudPositions[i * 3 + 2] = effectiveR * Math.sin(theta) * Math.sin(phi);

        // Gradient color from inner cyan to outer violet
        const lerpVal = Math.min(1, effectiveR / (baseRadius * 3.5));
        const pColor = color1.clone().lerp(color2, lerpVal).lerp(color3, lerpVal * 0.4);
        cloudColors[i * 3] = pColor.r;
        cloudColors[i * 3 + 1] = pColor.g;
        cloudColors[i * 3 + 2] = pColor.b;
      }

      const cloudGeo = new THREE.BufferGeometry();
      cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3));
      cloudGeo.setAttribute('color', new THREE.BufferAttribute(cloudColors, 3));

      const cloudMat = new THREE.PointsMaterial({
        size: 1.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });

      cloudPoints = new THREE.Points(cloudGeo, cloudMat);
      atomGroup.add(cloudPoints);
    }

    // --- ANIMATION LOOP ---
    let time = 0;
    const animate = () => {
      time += 0.016 * orbitSpeed;

      // 1. Update Camera Position from Spherical Coordinates
      if (autoRotate && !isDraggingRef.current) {
        cameraSphericalRef.current.theta += 0.0035 * orbitSpeed;
      }

      const { radius, theta, phi } = cameraSphericalRef.current;
      camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(0, 0, 0);

      // 2. Jitter & Pulse 3D Nucleus
      if (showNucleusCluster) {
        nucleusGroup.children.forEach(child => {
          if (child.userData && child.userData.origX !== undefined) {
            const jitterSpeed = 3.5;
            const jitterScale = isStable ? 0.03 : 0.12; // tight nuclear binding vibration
            const offset = child.userData.jitterOffset;
            child.position.x = child.userData.origX + Math.sin(time * jitterSpeed + offset) * jitterScale;
            child.position.y = child.userData.origY + Math.cos(time * jitterSpeed + offset * 1.5) * jitterScale;
            child.position.z = child.userData.origZ + Math.sin(time * jitterSpeed + offset * 2) * jitterScale;
          }
        });
      }

      // 3. Move Orbiting 3D Electrons with Velocity Vectors
      electronMeshes.forEach(eData => {
        eData.angle += eData.speed * orbitSpeed;

        // Position on 2D orbital circle
        const localX = Math.cos(eData.angle) * eData.orbitRadius;
        const localZ = Math.sin(eData.angle) * eData.orbitRadius;
        const localPos = new THREE.Vector3(localX, 0, localZ);

        // Apply 3D plane inclination rotation
        const euler = new THREE.Euler(eData.inclinationX, eData.inclinationY, eData.inclinationZ, 'XYZ');
        localPos.applyEuler(euler);

        eData.mesh.position.copy(localPos);

        // Orient 3D Direction Arrow strictly along instantaneous tangent velocity vector
        if (eData.arrowGroup && showSpinArrows) {
          const tangentDir = eData.speed >= 0 ? 1 : -1;
          const tangentLocal = new THREE.Vector3(
            -Math.sin(eData.angle) * tangentDir,
            0,
            Math.cos(eData.angle) * tangentDir
          ).normalize().applyEuler(euler);

          // Direct local orientation from +Z forward to tangentLocal
          eData.arrowGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangentLocal);
        }
      });

      // 4. Subtle rotation for Quantum Cloud
      if (cloudPoints) {
        cloudPoints.rotation.y += 0.002 * orbitSpeed;
        cloudPoints.rotation.x += 0.001 * orbitSpeed;
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Resize Handler
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

    // Cleanup on unmount or dependency change
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [
    protons,
    neutrons,
    electrons,
    shells,
    viewType,
    showRings,
    showNucleusCluster,
    showSpinArrows,
    orbitSpeed,
    autoRotate,
    isStable,
    dimensionMode
  ]);

  // Mouse & Touch Orbit Controls Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    const rotateSpeed = 0.007;
    cameraSphericalRef.current.theta -= deltaX * rotateSpeed;
    cameraSphericalRef.current.phi = Math.max(
      0.15,
      Math.min(Math.PI - 0.15, cameraSphericalRef.current.phi - deltaY * rotateSpeed)
    );
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.06;
    cameraSphericalRef.current.radius = Math.max(
      25,
      Math.min(180, cameraSphericalRef.current.radius + e.deltaY * zoomSpeed)
    );
  };

  // Touch Handlers for Mobile Orbit Drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
    const deltaY = e.touches[0].clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    const rotateSpeed = 0.009;
    cameraSphericalRef.current.theta -= deltaX * rotateSpeed;
    cameraSphericalRef.current.phi = Math.max(
      0.15,
      Math.min(Math.PI - 0.15, cameraSphericalRef.current.phi - deltaY * rotateSpeed)
    );
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const zoomIn = () => {
    cameraSphericalRef.current.radius = Math.max(25, cameraSphericalRef.current.radius - 12);
  };

  const zoomOut = () => {
    cameraSphericalRef.current.radius = Math.min(180, cameraSphericalRef.current.radius + 12);
  };

  const resetCamera = () => {
    cameraSphericalRef.current = {
      radius: 75,
      theta: Math.PI / 4,
      phi: Math.PI / 3
    };
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-square max-w-[420px] rounded-2xl overflow-hidden border shadow-2xl flex flex-col items-center justify-center select-none transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 max-w-none aspect-auto bg-slate-950/95 backdrop-blur-xl border-cyan-500/50' : ''
      } ${
        isDark ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-800' : 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-slate-700'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Three.js Interactive Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none gap-2 z-10">
        {/* Model Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-1 rounded-xl pointer-events-auto shadow-lg">
          <button
            onClick={() => setViewType('bohr_spatial')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              viewType === 'bohr_spatial'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title={t('نموذج بور الفضائي ثلاثي الأبعاد المائل', '3D Tilted Bohr Spatial Orbits')}
          >
            {t('بور مجسم', '3D Bohr')}
          </button>
          <button
            onClick={() => setViewType('rutherford')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              viewType === 'rutherford'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title={t('نموذج رذرفورد الفضائي المتقاطع', 'Rutherford Crossed Orbits')}
          >
            {t('رذرفورد', 'Rutherford')}
          </button>
          <button
            onClick={() => setViewType('quantum_cloud')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
              viewType === 'quantum_cloud'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title={t('السحابة الإلكترونية الكمية الاحتمالية |ψ|²', 'Quantum Probability Cloud')}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>{t('السحابة الكمية', 'Cloud')}</span>
          </button>
        </div>

        {/* Viewport Action Tools */}
        <div className="flex items-center gap-1 pointer-events-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg border text-xs backdrop-blur-md transition-all ${
              autoRotate
                ? 'bg-cyan-950/80 border-cyan-700/60 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={autoRotate ? t('إيقاف الدوران التلقائي', 'Pause auto-rotation') : t('تشغيل الدوران التلقائي', 'Auto-rotate')}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowRings(!showRings)}
            className={`p-1.5 rounded-lg border text-xs backdrop-blur-md transition-all ${
              showRings
                ? 'bg-slate-800 border-slate-700 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-white'
            }`}
            title={t('إظهار/إخفاء حلقات المدارات ثلاثية الأبعاد', 'Toggle 3D Orbit Rings')}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white backdrop-blur-md transition-all"
            title={isFullscreen ? t('تصغير النافذة', 'Exit fullscreen') : t('تكبير ثلاثي الأبعاد', '3D Fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Floating Zoom & Reset Camera Controls */}
      <div className="absolute right-2 bottom-2 flex flex-col gap-1 z-10">
        <button
          onClick={zoomIn}
          className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all backdrop-blur-md"
          title={t('تقريب (+)', 'Zoom In')}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={zoomOut}
          className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all backdrop-blur-md"
          title={t('تبعيد (-)', 'Zoom Out')}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all backdrop-blur-md"
          title={t('إعادة ضبط زاوية الكاميرا', 'Reset Camera')}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Hint / Info Badge */}
      <div className="absolute left-2 bottom-2 pointer-events-none z-10">
        <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-slate-400 flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>{t('اسحب للف والدوران ثلاثي الأبعاد | مرر للتقريب', 'Drag to rotate 3D | Scroll to zoom')}</span>
        </div>
      </div>
    </div>
  );
};
