// src/components/about/Heart3DModel.tsx
import React, { useRef, useState, useMemo, useEffect, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { animate } from 'animejs';
import { Activity } from 'lucide-react';
import heartGlbUrl from '../../assets/heart.glb';
import { ANIMATION_DURATION, EASING } from '../../utils/animationConstants';
import useReducedMotion from '../../hooks/useReducedMotion';

export interface AnatomicalStructure {
  id: string;
  name: string;
  medicalName: string;
  category: 'Chambers' | 'Vessels' | 'Network';
  position: [number, number, number];
  offset: { x: number; y: number }; // 2D pixel offset from anchor to callout tag
  description: string;
  clinicalSignificance: string;
  hemodynamicFunction: string;
  associatedRiskFactor: string;
}

export const CARDIAC_STRUCTURES: AnatomicalStructure[] = [
  {
    id: 'aorta',
    name: 'Aorta & Arch',
    medicalName: 'Arcus Aortae',
    category: 'Vessels',
    position: [0.05, 0.70, 0.15],
    offset: { x: 50, y: -35 },
    description: 'The principal systemic arterial trunk conveying oxygenated blood from the left ventricle to the systemic circulation.',
    clinicalSignificance: 'Vascular compliance declines with age and hypertension, elevating pulse pressure and systemic afterload.',
    hemodynamicFunction: 'Maintains diastolic perfusion pressure via arterial elasticity (Windkessel effect).',
    associatedRiskFactor: 'Elevated Systolic Blood Pressure & Vascular Rigidity'
  },
  {
    id: 'left_ventricle',
    name: 'Left Ventricle',
    medicalName: 'Ventriculus Sinister',
    category: 'Chambers',
    position: [0.42, -0.32, 0.35],
    offset: { x: 55, y: 25 },
    description: 'Thick-walled muscular chamber responsible for generating systemic systolic blood pressure and cardiac output.',
    clinicalSignificance: 'Target of hypertensive remodeling (Left Ventricular Hypertrophy). Central focus of CVD risk estimation.',
    hemodynamicFunction: 'Ejects stroke volume (~70 mL per beat at rest) into the high-pressure aortic root.',
    associatedRiskFactor: 'Hypertension & Elevated Peripheral Resistance'
  },
  {
    id: 'right_ventricle',
    name: 'Right Ventricle',
    medicalName: 'Ventriculus Dexter',
    category: 'Chambers',
    position: [-0.38, -0.25, 0.40],
    offset: { x: -55, y: 25 },
    description: 'Low-pressure chamber propelling deoxygenated blood through the pulmonary valve into the pulmonary vasculature.',
    clinicalSignificance: 'Monitored in cases of secondary pulmonary congestion and chronic oxygen desaturation.',
    hemodynamicFunction: 'Sustains low-resistance pulmonary perfusion with minimal myocardial strain.',
    associatedRiskFactor: 'Secondary Cardiopulmonary Strain'
  },
  {
    id: 'left_atrium',
    name: 'Left Atrium',
    medicalName: 'Atrium Sinistrum',
    category: 'Chambers',
    position: [0.32, 0.26, -0.30],
    offset: { x: -50, y: -30 },
    description: 'Receives freshly oxygenated blood from the four pulmonary veins prior to mitral valve transit into the left ventricle.',
    clinicalSignificance: 'Susceptible to dilation during elevated left ventricular end-diastolic pressures.',
    hemodynamicFunction: 'Provides atrial kick filling approximately 20-30% of end-diastolic ventricular volume.',
    associatedRiskFactor: 'Atrial Remodeling & Elevated Diastolic Pressure'
  },
  {
    id: 'coronary_network',
    name: 'Coronary Vessels',
    medicalName: 'Arteriae Coronariae',
    category: 'Network',
    position: [0.02, -0.05, 0.58],
    offset: { x: 45, y: 35 },
    description: 'Branching arterial network supplying blood, oxygen, and metabolic substrates directly to the contracting myocardium.',
    clinicalSignificance: 'Primary site of atherosclerotic stenosis, lipid plaque accumulation, and ischemic heart disease.',
    hemodynamicFunction: 'Myocardial perfusion occurs predominantly during ventricular diastole.',
    associatedRiskFactor: 'Elevated Cholesterol, Smoking & Ischemic Vulnerability'
  }
];

const LoadingSpinner: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: '#EF4444',
    fontFamily: 'system-ui, sans-serif',
    pointerEvents: 'none',
    width: '220px',
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid rgba(239, 68, 68, 0.15)',
      borderTop: '3px solid #EF4444',
      borderRadius: '50%',
      animation: 'spinHeart 1s linear infinite'
    }} />
    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}>
      Loading 3D Heart Model...
    </span>
    <style>{`
      @keyframes spinHeart {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Error boundary inside Canvas
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class GLTFErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn("[Heart3DModel] GLTF fallback active:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Compact Anatomical Callout with Leader Line & Anchor
const AnatomicalCallout: React.FC<{
  structure: AnatomicalStructure;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}> = ({ structure, isSelected, isHovered, onSelect, onHover }) => {
  const calloutRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const anchorRef = useRef<SVGCircleElement>(null);
  const prefersReduced = useReducedMotion();

  const dx = structure.offset.x;
  const dy = structure.offset.y;

  // Compute SVG canvas dimensions relative to (0,0) anchor and (dx, dy) target
  const padding = 12;
  const minX = Math.min(0, dx) - padding;
  const minY = Math.min(0, dy) - padding;
  const width = Math.abs(dx) + padding * 2;
  const height = Math.abs(dy) + padding * 2;

  const originX = -minX;
  const originY = -minY;
  const targetX = originX + dx;
  const targetY = originY + dy;

  // Staggered Anime.js entrance: anchor -> leader line -> callout tag
  useEffect(() => {
    if (prefersReduced || !calloutRef.current || !lineRef.current || !anchorRef.current) return;

    // 1. Anchor dot pop
    animate(anchorRef.current, {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 160,
      ease: EASING.OUT_CUBIC
    });

    // 2. Leader line drawing
    const lineLength = Math.hypot(dx, dy);
    if (lineRef.current) {
      lineRef.current.style.strokeDasharray = `${lineLength}`;
      lineRef.current.style.strokeDashoffset = `${lineLength}`;
      animate(lineRef.current, {
        strokeDashoffset: [lineLength, 0],
        opacity: [0, 0.65],
        duration: 220,
        delay: 80,
        ease: EASING.OUT_CUBIC
      });
    }

    // 3. Callout tag fade & gentle translation
    animate(calloutRef.current, {
      opacity: [0, 1],
      scale: [0.96, 1],
      duration: 260,
      delay: 160,
      ease: EASING.OUT_CUBIC
    });
  }, [dx, dy, prefersReduced]);

  const activeColor = isSelected ? '#EF4444' : (isHovered ? '#38BDF8' : 'rgba(255, 255, 255, 0.35)');
  const tagBorder = isSelected 
    ? '1px solid rgba(239, 68, 68, 0.6)' 
    : (isHovered ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)');
  const tagBg = isSelected 
    ? 'rgba(15, 23, 42, 0.94)' 
    : (isHovered ? 'rgba(15, 23, 42, 0.88)' : 'rgba(15, 23, 42, 0.78)');
  const tagTextColor = isSelected ? '#EF4444' : (isHovered ? '#38BDF8' : '#F1F5F9');

  return (
    <group position={structure.position}>
      <Html center={false} style={{ pointerEvents: 'none', position: 'relative' }}>
        {/* SVG Leader Line + Anchor Container */}
        <svg
          style={{
            position: 'absolute',
            left: minX,
            top: minY,
            width: width,
            height: height,
            overflow: 'visible',
            pointerEvents: 'none'
          }}
        >
          {/* Anatomical Anchor Point on the Heart surface (5-6px) */}
          <circle
            ref={anchorRef}
            cx={originX}
            cy={originY}
            r={isSelected ? 3.5 : 2.5}
            fill={isSelected ? '#EF4444' : (isHovered ? '#38BDF8' : '#94A3B8')}
            stroke="rgba(15, 23, 42, 0.9)"
            strokeWidth="1"
          />
          {isSelected && (
            <circle
              cx={originX}
              cy={originY}
              r={6}
              fill="none"
              stroke="#EF4444"
              strokeWidth="1"
              opacity={0.5}
            />
          )}

          {/* Thin Leader Line (1px) */}
          <line
            ref={lineRef}
            x1={originX}
            y1={originY}
            x2={targetX}
            y2={targetY}
            stroke={activeColor}
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>

        {/* Compact Callout Tag positioned at (dx, dy) outside the heart */}
        <div
          ref={calloutRef}
          style={{
            position: 'absolute',
            left: `${dx}px`,
            top: `${dy}px`,
            transform: `translate(${dx > 0 ? '0%' : '-100%'}, ${dy > 0 ? '0%' : '-100%'})`,
            pointerEvents: 'auto',
            zIndex: isSelected ? 20 : (isHovered ? 15 : 10)
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(structure.id);
            }}
            onMouseEnter={() => onHover(structure.id)}
            onMouseLeave={() => onHover(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 7px',
              borderRadius: '6px',
              border: tagBorder,
              backgroundColor: tagBg,
              color: tagTextColor,
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              boxShadow: isSelected 
                ? '0 2px 10px rgba(239, 68, 68, 0.25)' 
                : '0 2px 6px rgba(0,0,0,0.35)',
              transform: isHovered || isSelected ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              whiteSpace: 'nowrap',
              maxWidth: '180px',
              userSelect: 'none',
              lineHeight: 1.2
            }}
            className="anatomical-callout-tag"
          >
            <span
              style={{
                width: '3.5px',
                height: '3.5px',
                borderRadius: '50%',
                backgroundColor: isSelected ? '#EF4444' : (isHovered ? '#38BDF8' : '#94A3B8'),
                flexShrink: 0
              }}
            />
            <span style={{ letterSpacing: '0.1px' }}>{structure.name}</span>
          </button>
        </div>
      </Html>
    </group>
  );
};

// Procedural Fallback Heart in case of WebGL device load lag
const ProceduralHeartFallback: React.FC<{
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}> = ({ selectedId, hoveredId, onSelect, onHover }) => {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReduced = useReducedMotion();

  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 0.25, y + 0.25);
    shape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    shape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    shape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
    shape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    shape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    shape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.4,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 2,
    bevelSize: 0.15,
    bevelThickness: 0.15
  }), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    if (!prefersReduced) {
      const t = state.clock.elapsedTime * 2.2;
      const pulse = Math.pow(Math.max(0, Math.sin(t)), 16) * 0.01;
      const s = 1.25 + pulse;
      groupRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      <mesh rotation={[Math.PI, 0, 0]}>
        <extrudeGeometry args={[heartShape, extrudeSettings]} />
        <meshStandardMaterial color="#dc2626" roughness={0.35} metalness={0.1} />
      </mesh>
      
      {/* Hotspots with Leader Lines */}
      {CARDIAC_STRUCTURES.map((structure) => (
        <AnatomicalCallout
          key={structure.id}
          structure={structure}
          isSelected={selectedId === structure.id}
          isHovered={hoveredId === structure.id}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </group>
  );
};

// GLTF Heart Model Wrapper
const ModelWrapper: React.FC<{
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  pulseRate?: number;
}> = ({ selectedId, hoveredId, onSelect, onHover, pulseRate = 1.0 }) => {
  const { scene } = useGLTF(heartGlbUrl || '/heart.glb');
  const groupRef = useRef<THREE.Group>(null);
  const prefersReduced = useReducedMotion();

  // Clone and calibrate bounding box auto-scaling
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Auto-scale to standard bounding size (~2.4 units)
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const scale = 2.4 / maxDim;

    clone.position.sub(center).multiplyScalar(scale);
    clone.scale.set(scale, scale, scale);

    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.metalness = 0.12; // Natural organic tissue
          mat.roughness = 0.38; // Clean organic specular highlights
          mat.side = THREE.DoubleSide;
          mat.needsUpdate = true;
        }
      }
    });

    return clone;
  }, [scene]);

  // Restrained physiological micro-pulse (1 -> 1.008 -> 1)
  useFrame((state) => {
    if (!groupRef.current) return;

    // Gentle orientation rotation
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;

    if (!prefersReduced) {
      const t = state.clock.elapsedTime * (pulseRate * 2.2);
      const pulse = Math.pow(Math.max(0, Math.sin(t)), 16) * 0.008;
      const baseScale = 1.0;
      const finalScale = baseScale + pulse;
      groupRef.current.scale.set(finalScale, finalScale, finalScale);
    } else {
      groupRef.current.scale.set(1.0, 1.0, 1.0);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />

      {/* 3D Anatomical Callouts with Leader Lines */}
      {CARDIAC_STRUCTURES.map((structure) => (
        <AnatomicalCallout
          key={structure.id}
          structure={structure}
          isSelected={selectedId === structure.id}
          isHovered={hoveredId === structure.id}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </group>
  );
};

// Preload GLB
useGLTF.preload(heartGlbUrl || '/heart.glb');

interface Heart3DModelProps {
  height?: string;
  pulseRate?: number;
  selectedStructureId: string | null;
  onSelectStructure: (id: string) => void;
}

export const Heart3DModel: React.FC<Heart3DModelProps> = ({ 
  height = '400px',
  pulseRate = 1.0,
  selectedStructureId,
  onSelectStructure
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Smooth entrance crossfade via Anime.js on initial mount
  useEffect(() => {
    if (!containerRef.current || prefersReduced) return;

    animate(containerRef.current, {
      opacity: [0, 1],
      scale: [0.98, 1],
      duration: ANIMATION_DURATION.SLOW,
      ease: EASING.OUT_CUBIC
    });
  }, [prefersReduced]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: height, 
        position: 'relative', 
        borderRadius: '24px', 
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 45%, #1e293b 0%, #0f172a 65%, #020617 100%)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6), inset 0 0 60px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Top Floating Clinical Badges */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '12px',
        right: '12px',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          padding: '2px 8px',
          borderRadius: '99px',
          backdropFilter: 'blur(8px)'
        }}>
          <Activity size={10} style={{ color: '#EF4444' }} />
          <span style={{ fontSize: '9px', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            3D Cardiac Model
          </span>
        </div>

        <div style={{
          fontSize: '9px',
          fontWeight: 700,
          color: '#94A3B8',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2px 8px',
          borderRadius: '99px',
          backdropFilter: 'blur(8px)'
        }}>
          5 Hotspots
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 0.1, 3.4], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        {/* Multi-point studio lighting */}
        <ambientLight intensity={1.8} />
        <hemisphereLight args={['#ffffff', '#2a0e0e', 1.8]} />
        <directionalLight position={[6, 8, 6]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-6, 4, -4]} intensity={1.4} color="#60a5fa" />
        <directionalLight position={[0, -5, 3]} intensity={1.2} color="#fca5a5" />
        <pointLight position={[0, 1, 3]} intensity={2.0} color="#ffffff" distance={10} />
        
        <GLTFErrorBoundary fallback={
          <ProceduralHeartFallback 
            selectedId={selectedStructureId}
            hoveredId={hoveredId}
            onSelect={onSelectStructure}
            onHover={setHoveredId}
          />
        }>
          <React.Suspense fallback={<Html center><LoadingSpinner /></Html>}>
            <ModelWrapper 
              selectedId={selectedStructureId}
              hoveredId={hoveredId}
              onSelect={onSelectStructure}
              onHover={setHoveredId}
              pulseRate={pulseRate}
            />
          </React.Suspense>
        </GLTFErrorBoundary>
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={2.0}
          maxDistance={5.2}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.4}
        />
      </Canvas>

      {/* Helper Footer Instruction */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '12px',
        right: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '9.5px',
        color: '#94A3B8',
        fontWeight: 600,
        pointerEvents: 'none'
      }}>
        <span>💡 Click pin to inspect</span>
        <span>Drag to rotate • Scroll to zoom</span>
      </div>
    </div>
  );
};

export default Heart3DModel;
