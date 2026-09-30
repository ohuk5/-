import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Grid, Line } from '@react-three/drei';
import * as THREE from 'three';
import type { SubstanceInfo } from '../data/substancesData';

export type ParticlePosition = { x: number; y: number; angle: number };
export type ScientificSceneProps = {
  resetKey: number;
  autoRotate: boolean;
  paused: boolean;
} & ({
  kind: 'matter';
  particles: RefObject<ParticlePosition[]>;
  substance: SubstanceInfo;
  count: number;
  volume: number;
  phase: string;
  burner: 'heat' | 'cool' | null;
} | {
  kind: 'atom';
  protons: number;
  neutrons: number;
  shells: number[];
  speed: number;
  showSpin: boolean;
});

function CameraControls({ resetKey, autoRotate, kind }: Pick<ScientificSceneProps, 'resetKey' | 'autoRotate' | 'kind'>) {
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...(kind === 'matter' ? [6.5, 4, 8.5] : [5, 3, 7]) as [number, number, number]);
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
  }, [resetKey, kind, camera]);
  return <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={5} maxDistance={17} maxPolarAngle={Math.PI * 0.78} autoRotate={autoRotate} autoRotateSpeed={0.45} enableDamping />;
}

function Ball({ position = [0, 0, 0], radius = 0.13, color, metal = false }: { position?: [number, number, number]; radius?: number; color: string; metal?: boolean }) {
  return <mesh position={position} castShadow><sphereGeometry args={[radius, 20, 14]} /><meshStandardMaterial color={color} metalness={metal ? 0.7 : 0.18} roughness={metal ? 0.24 : 0.25} /></mesh>;
}

function Bond({ end }: { end: [number, number, number] }) {
  const vector = useMemo(() => new THREE.Vector3(...end), [end[0], end[1], end[2]]);
  const rotation = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vector.clone().normalize()), [vector]);
  return <mesh position={vector.clone().multiplyScalar(0.5)} quaternion={rotation}><cylinderGeometry args={[0.032, 0.032, vector.length(), 8]} /><meshStandardMaterial color="#bacbd4" metalness={0.5} roughness={0.3} /></mesh>;
}

function Molecule({ substance }: { substance: SubstanceInfo }) {
  const water = substance.particleType === 'water';
  const methane = substance.particleType === 'methane';
  const co2 = substance.particleType === 'co2';
  const diatomic = substance.particleType === 'diatomic';
  const satellites: [number, number, number][] = water ? [[0.19, 0.147, 0], [-0.19, 0.147, 0]]
    : methane ? [[0.14, 0.14, 0.14], [-0.14, -0.14, 0.14], [-0.14, 0.14, -0.14], [0.14, -0.14, -0.14]]
    : co2 ? [[-0.23, 0, 0], [0.23, 0, 0]] : diatomic ? [[0.23, 0, 0]] : [];
  return <>
    <Ball color={water ? '#f15a64' : co2 || methane ? '#657684' : substance.color} metal={substance.particleType === 'metallic'} />
    {satellites.map((position, i) => <group key={i}><Bond end={position} /><Ball position={position} radius={water || methane ? 0.082 : 0.12} color={water || methane ? '#f1f5f9' : co2 ? '#f15a64' : substance.color} /></group>)}
  </>;
}

function MatterModel(props: Extract<ScientificSceneProps, { kind: 'matter' }>) {
  const molecules = useRef<(THREE.Group | null)[]>([]);
  const time = useRef(0);
  const bottom = -1.78;
  const lidY = (172.5 - (40 + ((100 - props.volume) * 245) / 100)) / 86;
  const height = lidY - bottom;
  const heatColor = props.burner === 'heat' ? '#ff914d' : '#57d8d0';
  useFrame((_, delta) => {
    if (props.paused) return;
    time.current += Math.min(delta, 0.05);
    props.particles.current.forEach((particle, i) => {
      const group = molecules.current[i];
      if (!group) return;
      const solid = props.phase === 'solid';
      const depth = Math.sin(i * 2.39996) * 1.13;
      const drift = solid ? 0.015 : 0.13;
      group.position.set((particle.x - 230) / 92, (172.5 - particle.y) / 86, depth + Math.sin(time.current * 0.7 + i) * drift);
      group.rotation.set(solid ? 0 : particle.angle * 0.4, solid ? i : particle.angle * 0.6, particle.angle);
    });
  });
  return <group>
    <RoundedBox args={[5.15, 0.36, 3.5]} radius={0.12} position={[0, -2.02, 0]} receiveShadow castShadow><meshStandardMaterial color="#263947" metalness={0.65} roughness={0.32} /></RoundedBox>
    <RoundedBox args={[4.85, 0.065, 3.2]} radius={0.025} position={[0, -1.805, 0]} receiveShadow><meshStandardMaterial color="#8da3b0" metalness={0.72} roughness={0.3} /></RoundedBox>
    <mesh position={[0, -2.04, 1.758]}><boxGeometry args={[2.6, 0.026, 0.01]} /><meshBasicMaterial color={heatColor} /></mesh>
    <pointLight position={[0, -1.5, 1.8]} color={heatColor} intensity={props.burner ? 7 : 1.3} distance={5} />
    <group position={[0, (lidY + bottom) / 2, 0]}>
      <mesh renderOrder={3}><boxGeometry args={[4.7, height, 2.95]} /><meshPhysicalMaterial color="#8ddfdc" transparent opacity={0.065} roughness={0.1} metalness={0.25} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      {[-2.35, 2.35].flatMap(x => [-1.475, 1.475].map(z => <mesh key={`${x}-${z}`} position={[x, 0, z]}><cylinderGeometry args={[0.025, 0.025, height, 8]} /><meshStandardMaterial color="#86babf" metalness={0.6} roughness={0.3} transparent opacity={0.65} /></mesh>))}
    </group>
    <group position={[0, lidY + 0.1, 0]}>
      <RoundedBox args={[4.9, 0.2, 3.15]} radius={0.07} castShadow><meshStandardMaterial color="#7b929f" metalness={0.75} roughness={0.29} /></RoundedBox>
      <mesh position={[0, -0.075, 1.58]}><boxGeometry args={[4.7, 0.028, 0.02]} /><meshBasicMaterial color="#5ed8d0" /></mesh>
      <mesh position={[0, 0.7, 0]} castShadow><cylinderGeometry args={[0.1, 0.1, 1.25, 24]} /><meshStandardMaterial color="#c3d0d8" metalness={0.85} roughness={0.19} /></mesh>
      <RoundedBox args={[1.35, 0.18, 0.35]} radius={0.08} position={[0, 1.35, 0]} castShadow><meshStandardMaterial color="#314854" metalness={0.6} roughness={0.35} /></RoundedBox>
      <mesh position={[-1.8, 0.17, 0.8]}><cylinderGeometry args={[0.09, 0.12, 0.19, 16]} /><meshStandardMaterial color="#49c4b5" metalness={0.4} roughness={0.3} /></mesh>
    </group>
    {Array.from({ length: 10 }, (_, i) => <mesh key={i} position={[2.39, -1.5 + i * 0.28, 1.48]}><boxGeometry args={[i % 2 === 0 ? 0.18 : 0.09, 0.012, 0.014]} /><meshBasicMaterial color="#8ca7b4" transparent opacity={0.7} /></mesh>)}
    {Array.from({ length: props.count }, (_, i) => <group key={`${props.substance.id}-${i}`} ref={el => { molecules.current[i] = el; }}><Molecule substance={props.substance} /></group>)}
  </group>;
}

function ElectronShell({ radius, count, index, speed, paused, showSpin }: { radius: number; count: number; index: number; speed: number; paused: boolean; showSpin: boolean }) {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(() => Array.from({ length: 129 }, (_, i) => new THREE.Vector3(Math.cos(i / 128 * Math.PI * 2) * radius, 0, Math.sin(i / 128 * Math.PI * 2) * radius)), [radius]);
  useFrame((_, delta) => { if (group.current && !paused) group.current.rotation.y += Math.min(delta, 0.05) * speed * 0.6 / (index + 1); });
  return <group rotation={[index * 0.55 + 0.3, 0, index * 0.65]}>
    <Line points={points} color="#6dd9d5" lineWidth={0.8} transparent opacity={0.4} />
    <group ref={group}>{Array.from({ length: count }, (_, i) => <group key={i} position={[Math.cos(i / count * Math.PI * 2) * radius, 0, Math.sin(i / count * Math.PI * 2) * radius]}>
      <mesh><sphereGeometry args={[0.067, 16, 12]} /><meshStandardMaterial color="#a1f5ef" emissive="#39bdb3" emissiveIntensity={0.7} roughness={0.25} /></mesh>
      {showSpin && <mesh position={[0, 0.11, 0]}><coneGeometry args={[0.035, 0.11, 8]} /><meshBasicMaterial color="#90e6dc" /></mesh>}
    </group>)}</group>
  </group>;
}

function AtomModel(props: Extract<ScientificSceneProps, { kind: 'atom' }>) {
  const total = props.protons + props.neutrons;
  const nodes = useMemo(() => Array.from({ length: total }, (_, i) => {
    const radius = total <= 1 ? 0 : 0.12 * Math.cbrt(i);
    const theta = i * 2.399963;
    const z = 1 - 2 * ((i * 0.618034) % 1);
    const s = Math.sqrt(1 - z * z);
    return [Math.cos(theta) * radius * s, z * radius, Math.sin(theta) * radius * s] as [number, number, number];
  }), [total]);
  return <group>
    {nodes.map((p, i) => <Ball key={i} position={p} radius={total > 60 ? 0.1 : 0.15} color={i < props.protons ? '#ed6572' : '#bac8d7'} />)}
    {props.shells.map((count, i) => count > 0 && <ElectronShell key={i} count={count} index={i} radius={1.25 + i * 0.33} speed={props.speed} paused={props.paused} showSpin={props.showSpin} />)}
  </group>;
}

export default function ScientificScene(props: ScientificSceneProps) {
  return <Canvas shadows dpr={[1, 1.5]} camera={{ position: [6.5, 4, 8.5], fov: 38 }} gl={{ antialias: true, alpha: true }} aria-label={props.kind === 'matter' ? 'Interactive 3D molecular model' : 'Interactive 3D atomic model'}>
    <ambientLight intensity={1.2} />
    <hemisphereLight args={['#c5e9ff', '#1c2738', 1.6]} />
    <directionalLight position={[3, 7, 5]} intensity={3.5} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
    <directionalLight position={[-4, 3, -2]} color="#68ddd0" intensity={2.2} />
    <directionalLight position={[0, 1, -5]} color="#769aff" intensity={2} />
    {props.kind === 'matter' ? <MatterModel {...props} /> : <AtomModel {...props} />}
    <Grid position={[0, -2.24, 0]} args={[30, 30]} cellSize={0.65} sectionSize={3.25} cellThickness={0.5} sectionThickness={0.8} cellColor="#203946" sectionColor="#315160" fadeDistance={16} fadeStrength={2.5} infiniteGrid />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.23, 0]} receiveShadow><planeGeometry args={[30, 30]} /><shadowMaterial transparent opacity={0.28} /></mesh>
    <CameraControls resetKey={props.resetKey} autoRotate={props.autoRotate && !props.paused} kind={props.kind} />
  </Canvas>;
}
