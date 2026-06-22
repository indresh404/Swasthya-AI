// src/components/patient/PatientBodyModel.tsx
import React, { useRef, useState, useMemo, Component, ReactNode } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface HeatPoint {
  id: string;
  label: string;
  description: string;
  position: [number, number, number]; // original coordinates
  color: string;
  intensity: number; // 0-1
}

const SHADER_POINTS_COUNT = 10;

// ADJUST 3D MODEL POSITION HERE: [x, y, z]
// x: left(-)/right(+) | y: down(-)/up(+) | z: closer(-)/further(+)
export const DEFAULT_MODEL_OFFSET: [number, number, number] = [0, 0, 0];

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      color: '#38bdf8',
      fontFamily: 'system-ui, sans-serif',
      pointerEvents: 'none',
      width: '180px',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(56, 189, 248, 0.1)',
        borderTop: '3px solid #38bdf8',
        borderRadius: '50%',
        animation: 'cursorSpin 1s linear infinite'
      }} />
      <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', textShadow: '0 0 8px rgba(56, 189, 248, 0.5)' }}>
        Loading 3D Model...
      </span>
    </div>
  );
};

// Custom shader material with normal vectors for realistic 3D lighting, blending, and sci-fi fresnel rim glow
class HeatmapShaderMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color('#f8fafc') },
        uHeatPoints: { 
          value: Array(SHADER_POINTS_COUNT).fill(null).map(() => new THREE.Vector3()) 
        },
        uHeatIntensities: { 
          value: Array(SHADER_POINTS_COUNT).fill(0) 
        },
        uHeatColors: { 
          value: Array(SHADER_POINTS_COUNT).fill(null).map(() => new THREE.Color('#000000')) 
        },
        uSelectedZone: { value: -1 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uBaseColor;
        uniform vec3 uHeatPoints[${SHADER_POINTS_COUNT}];
        uniform float uHeatIntensities[${SHADER_POINTS_COUNT}];
        uniform vec3 uHeatColors[${SHADER_POINTS_COUNT}];
        uniform int uSelectedZone;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
          // Simple diffuse lighting calculation to give 3D depth
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(vec3(5.0, 8.0, 5.0));
          float diffuse = max(dot(normal, lightDir), 0.25);
          
          // Base color shaded (bright slate-white silhouette)
          vec3 baseShaded = uBaseColor * (0.8 + 0.2 * diffuse);
          
          float totalHeat = 0.0;
          vec3 heatColorSum = vec3(0.0);

          for (int i = 0; i < ${SHADER_POINTS_COUNT}; i++) {
            float dist = distance(vWorldPosition, uHeatPoints[i]);
            float radius = 0.22;
            
            // Exponential falloff
            float falloff = exp(-pow(dist / radius, 2.0));
            float influence = falloff * uHeatIntensities[i];
            
            // Selected zone pulsing highlight
            if (uSelectedZone == i) {
              influence *= 1.6;
              float pulse = (sin(uTime * 5.0) * 0.5 + 0.5) * 0.3;
              influence += falloff * pulse;
            } else {
              // Standard pulsing
              float pulse = 1.0 + 0.15 * sin(uTime * 3.5 + float(i) * 1.2);
              influence *= pulse;
            }

            totalHeat += influence;
            heatColorSum += uHeatColors[i] * influence;
          }

          // Blended base and heatmap colors
          vec3 finalColor = mix(baseShaded, heatColorSum, clamp(totalHeat, 0.0, 1.0));

          // Global ambient pulse on heated parts
          float ambientPulse = (sin(uTime * 3.0) * 0.5 + 0.5) * 0.1 * clamp(totalHeat * 1.5, 0.0, 1.0);
          finalColor += heatColorSum * ambientPulse;

          // Fresnel rim for high-end sci-fi look
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float rim = 1.0 - max(dot(viewDir, normal), 0.0);
          rim = pow(rim, 3.5) * 0.25;
          finalColor += vec3(0.1, 0.8, 0.5) * rim; // light emerald green rim glow

          gl_FragColor = vec4(finalColor, 0.95);
        }
      `,
      transparent: true,
      depthWrite: true,
      side: THREE.DoubleSide
    });
  }
}

extend({ HeatmapShaderMaterial });

// Error Boundary inside Canvas to catch GLTF load issues and render fallback mannequin
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
    console.warn("GLTF model failed to load, swapping with primitive Mannequin fallback.", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Fallback mannequin rendering using standard ThreeJS meshes
const MannequinFallback: React.FC<{
  heatPoints: HeatPoint[];
  onZoneClick: (hp: HeatPoint) => void;
  selectedZoneLabel?: string;
  setCursorState: (state: 'default' | 'grabbing' | 'pointer') => void;
  positionOffset: [number, number, number];
}> = ({ heatPoints, onZoneClick, selectedZoneLabel, setCursorState, positionOffset }) => {
  const materialRef = useRef<any>(null);
  const groupRef = useRef<THREE.Group>(null);

  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Model base color is ALWAYS white
  const baseColor = useMemo(() => new THREE.Color('#f8fafc'), []);

  const selectedIndex = useMemo(() => {
    if (!selectedZoneLabel) return -1;
    return heatPoints.findIndex(hp => hp.label === selectedZoneLabel);
  }, [selectedZoneLabel, heatPoints]);

  useFrame((state) => {
    // Slow Y-axis rotation (360 degrees)
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uBaseColor.value = baseColor;
      materialRef.current.uniforms.uSelectedZone.value = selectedIndex;
      
      // Update coordinates
      heatPoints.forEach((hp, index) => {
        if (index < SHADER_POINTS_COUNT) {
          const adjustedPos = [...hp.position] as [number, number, number];
          const point = new THREE.Vector3(...adjustedPos);
          materialRef.current.uniforms.uHeatPoints.value[index].copy(point);
          materialRef.current.uniforms.uHeatIntensities.value[index] = hp.intensity;
          materialRef.current.uniforms.uHeatColors.value[index].copy(new THREE.Color(hp.color));
        }
      });
    }
  });

  const material = useMemo(() => {
    const mat = new HeatmapShaderMaterial();
    materialRef.current = mat;
    return mat;
  }, []);

  const handlePointerDown = (e: any, hp: HeatPoint) => {
    e.stopPropagation();
    onZoneClick(hp);
  };

  // Local coordinates calculation for activeSelectedZone
  const activeSelectedPoint = useMemo(() => {
    if (!selectedZoneLabel) return null;
    const hp = heatPoints.find(p => p.label === selectedZoneLabel);
    if (!hp) return null;
    const point = new THREE.Vector3(...hp.position);
    // Lock x and z to 0 to keep the highlight fixed in the middle of the screen horizontally
    point.x = 0;
    point.z = 0;
    return { hp, localPos: point };
  }, [selectedZoneLabel, heatPoints]);

  return (
    <group position={[positionOffset[0], positionOffset[1] - 0.9, positionOffset[2]]}>
      {/* Rotating meshes group */}
      <group ref={groupRef}>
        {/* Head */}
        <mesh material={material} position={[0, -100, 0]}>
          <sphereGeometry args={[1, 160, 16]} />
        </mesh>
        {/* Neck */}
        <mesh material={material} position={[0, 1.56, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.14, 12]} />
        </mesh>
        {/* Torso */}
        <mesh material={material} position={[0, 1.17, 0]}>
          <cylinderGeometry args={[0.18, 0.15, 0.55, 16]} />
        </mesh>
        {/* Pelvis */}
        <mesh material={material} position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.15, 0.12, 0.18, 16]} />
        </mesh>
        {/* Left upper arm */}
        <mesh material={material} position={[-0.26, 1.22, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.04, 0.035, 0.3, 10]} />
        </mesh>
        {/* Right upper arm */}
        <mesh material={material} position={[0.26, 1.22, 0]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.04, 0.035, 0.3, 10]} />
        </mesh>
        {/* Left forearm */}
        <mesh material={material} position={[-0.28, 0.88, 0]}>
          <cylinderGeometry args={[0.03, 0.025, 0.28, 10]} />
        </mesh>
        {/* Right forearm */}
        <mesh material={material} position={[0.28, 0.88, 0]}>
          <cylinderGeometry args={[0.03, 0.025, 0.28, 10]} />
        </mesh>
        {/* Left thigh */}
        <mesh material={material} position={[-0.1, 0.6, 0]}>
          <cylinderGeometry args={[0.065, 0.055, 0.35, 12]} />
        </mesh>
        {/* Right thigh */}
        <mesh material={material} position={[0.1, 0.6, 0]}>
          <cylinderGeometry args={[0.065, 0.055, 0.35, 12]} />
        </mesh>
        {/* Left shin */}
        <mesh material={material} position={[-0.1, 0.24, 0]}>
          <cylinderGeometry args={[0.045, 0.035, 0.35, 12]} />
        </mesh>
        {/* Right shin */}
        <mesh material={material} position={[0.1, 0.24, 0]}>
          <cylinderGeometry args={[0.045, 0.035, 0.35, 12]} />
        </mesh>
        {/* Left foot */}
        <mesh material={material} position={[-0.1, 0.04, 0.05]}>
          <boxGeometry args={[0.08, 0.04, 0.15]} />
        </mesh>
        {/* Right foot */}
        <mesh material={material} position={[0.1, 0.04, 0.05]}>
          <boxGeometry args={[0.08, 0.04, 0.15]} />
        </mesh>

        {/* Interactive Raycast Colliders (invisible but large for easy click targets) */}
        {heatPoints.map((hp) => (
          <mesh 
            key={hp.id} 
            position={hp.position}
            onPointerDown={(e) => handlePointerDown(e, hp)}
            onPointerOver={(e) => {
              e.stopPropagation();
              setCursorState('pointer');
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setCursorState('default');
            }}
          >
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        ))}
      </group>

      {activeSelectedPoint && (
        <Html position={activeSelectedPoint.localPos} center distanceFactor={4}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            {/* Glowing pointer dot */}
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: activeSelectedPoint.hp.color,
              boxShadow: `0 0 10px ${activeSelectedPoint.hp.color}, 0 0 20px ${activeSelectedPoint.hp.color}`,
              zIndex: 2,
            }} />
            
            {/* Pulsing ring */}
            <div style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: `2px solid ${activeSelectedPoint.hp.color}`,
              boxShadow: `0 0 8px ${activeSelectedPoint.hp.color}`,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              zIndex: 1,
            }} />
            
            {/* Arrow line pointing to the dot */}
            {!isMobile && (
              <div style={{
                position: 'absolute',
                bottom: '6px',
                left: '6px',
                width: '45px',
                height: '30px',
                borderLeft: `2px solid ${activeSelectedPoint.hp.color}`,
                borderBottom: `2px solid ${activeSelectedPoint.hp.color}`,
                transform: 'rotate(-45deg)',
                transformOrigin: 'bottom left',
                zIndex: 0,
              }} />
            )}
            
            {/* Floating details tooltip box */}
            {!isMobile && (
              <div style={{
                position: 'absolute',
                left: '42px',
                bottom: '30px',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: `1.5px solid ${activeSelectedPoint.hp.color}`,
                borderRadius: '8px',
                padding: '8px 12px',
                width: '180px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                color: '#FFFFFF',
                fontFamily: 'system-ui, sans-serif',
                pointerEvents: 'auto',
                zIndex: 3,
              }}>
                <div style={{ fontWeight: 800, fontSize: '11px', color: activeSelectedPoint.hp.color, textTransform: 'uppercase', marginBottom: '3px' }}>
                  {activeSelectedPoint.hp.label} Zone
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.3 }}>
                  {activeSelectedPoint.hp.description}
                </div>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

const ModelWrapper: React.FC<{
  heatPoints: HeatPoint[];
  onZoneClick: (hp: HeatPoint) => void;
  centerOffsetRef: React.MutableRefObject<THREE.Vector3>;
  modelScaleRef: React.MutableRefObject<number>;
  selectedZoneLabel?: string;
  setCursorState: (state: 'default' | 'grabbing' | 'pointer') => void;
  positionOffset: [number, number, number];
}> = ({ heatPoints, onZoneClick, centerOffsetRef, modelScaleRef, selectedZoneLabel, setCursorState, positionOffset }) => {
  const { scene } = useGLTF("/model.glb");
  const shaderRef = useRef<any>(null);

  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clone the loaded scene to avoid shared mutation scaling corruption
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Scale model to a maximum height of 3.2 units
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const scale = 3.2 / maxDim;

    centerOffsetRef.current.copy(center);
    modelScaleRef.current = scale;
    
    clone.position.sub(center).multiplyScalar(scale);
    clone.scale.set(scale, scale, scale);
    return clone;
  }, [scene, centerOffsetRef, modelScaleRef]);

  // Model base color is ALWAYS white
  const baseColor = useMemo(() => new THREE.Color('#f8fafc'), []);

  const selectedIndex = useMemo(() => {
    if (!selectedZoneLabel) return -1;
    return heatPoints.findIndex(hp => hp.label === selectedZoneLabel);
  }, [selectedZoneLabel, heatPoints]);

  const groupRef = useRef<THREE.Group>(null);

  // Update time and coordinates in uniforms
  useFrame((state) => {
    // Slow Y-axis rotation (360 degrees) around the group pivot center
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;
    }
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      shaderRef.current.uniforms.uBaseColor.value = baseColor;
      shaderRef.current.uniforms.uSelectedZone.value = selectedIndex;
      
      // Update transformed coordinates in shader
      heatPoints.forEach((hp, index) => {
        if (index < SHADER_POINTS_COUNT) {
          const point = new THREE.Vector3(...hp.position);
          point.sub(centerOffsetRef.current).multiplyScalar(modelScaleRef.current);
          shaderRef.current.uniforms.uHeatPoints.value[index].copy(point);
          shaderRef.current.uniforms.uHeatIntensities.value[index] = hp.intensity;
          shaderRef.current.uniforms.uHeatColors.value[index].copy(new THREE.Color(hp.color));
        }
      });
    }
  });

  const material = useMemo(() => {
    const mat = new HeatmapShaderMaterial();
    shaderRef.current = mat;
    return mat;
  }, []);

  useMemo(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = material;
      }
    });
  }, [clonedScene, material]);

  // Handle clicks by matching against transformed heatpoints
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (!e.point) return;

    let minDistance = Infinity;
    let closestPoint: HeatPoint | null = null;

    heatPoints.forEach((hp) => {
      const hpPos = new THREE.Vector3(...hp.position);
      hpPos.sub(centerOffsetRef.current).multiplyScalar(modelScaleRef.current);
      const dist = e.point.distanceTo(hpPos);
      if (dist < minDistance) {
        minDistance = dist;
        closestPoint = hp;
      }
    });

    if (closestPoint && minDistance < 0.8) {
      onZoneClick(closestPoint);
    }
  };

  // Local coordinates calculation for activeSelectedZone
  const activeSelectedPoint = useMemo(() => {
    if (!selectedZoneLabel) return null;
    const hp = heatPoints.find(p => p.label === selectedZoneLabel);
    if (!hp) return null;
    const point = new THREE.Vector3(...hp.position);
    point.sub(centerOffsetRef.current).multiplyScalar(modelScaleRef.current);
    // Lock x and z to 0 to keep the highlight fixed in the middle of the screen horizontally
    point.x = 0;
    point.z = 0;
    return { hp, localPos: point };
  }, [selectedZoneLabel, heatPoints, centerOffsetRef, modelScaleRef]);

  return (
    /* 
      ADJUST MODEL POSITION HERE:
      - Change the position={[x, y, z]} values below to translate the model's location on the screen.
      - E.g. Increasing the middle 'y' value (e.g. to -0.5) moves the model upward; decreasing it (e.g. to -1.0) moves it downward.
    */
    <group position={positionOffset}>
      <group ref={groupRef}>
        <primitive 
          object={clonedScene} 
          onPointerDown={handlePointerDown}
        />
        {/* Interactive Raycast Colliders (invisible but large for easy click targets) */}
        {heatPoints.map((hp) => {
          const hpPos = new THREE.Vector3(...hp.position);
          hpPos.sub(centerOffsetRef.current).multiplyScalar(modelScaleRef.current);
          return (
            <mesh 
              key={hp.id} 
              position={hpPos}
              onPointerDown={(e) => {
                e.stopPropagation();
                onZoneClick(hp);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setCursorState('pointer');
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setCursorState('default');
              }}
            >
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshBasicMaterial visible={false} />
            </mesh>
          );
        })}
      </group>
      {activeSelectedPoint && (
        <Html position={activeSelectedPoint.localPos} center distanceFactor={4}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            {/* Glowing pointer dot */}
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: activeSelectedPoint.hp.color,
              boxShadow: `0 0 10px ${activeSelectedPoint.hp.color}, 0 0 20px ${activeSelectedPoint.hp.color}`,
              zIndex: 2,
            }} />
            
            {/* Pulsing ring */}
            <div style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: `2px solid ${activeSelectedPoint.hp.color}`,
              boxShadow: `0 0 8px ${activeSelectedPoint.hp.color}`,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              zIndex: 1,
            }} />
            
            {/* Arrow line pointing to the dot */}
            {!isMobile && (
              <div style={{
                position: 'absolute',
                bottom: '6px',
                left: '6px',
                width: '45px',
                height: '30px',
                borderLeft: `2px solid ${activeSelectedPoint.hp.color}`,
                borderBottom: `2px solid ${activeSelectedPoint.hp.color}`,
                transform: 'rotate(-45deg)',
                transformOrigin: 'bottom left',
                zIndex: 0,
              }} />
            )}
            
            {/* Floating details tooltip box */}
            {!isMobile && (
              <div style={{
                position: 'absolute',
                left: '42px',
                bottom: '30px',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: `1.5px solid ${activeSelectedPoint.hp.color}`,
                borderRadius: '8px',
                padding: '8px 12px',
                width: '180px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                color: '#FFFFFF',
                fontFamily: 'system-ui, sans-serif',
                pointerEvents: 'auto',
                zIndex: 3,
              }}>
                <div style={{ fontWeight: 800, fontSize: '11px', color: activeSelectedPoint.hp.color, textTransform: 'uppercase', marginBottom: '3px' }}>
                  {activeSelectedPoint.hp.label} Zone
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.3 }}>
                  {activeSelectedPoint.hp.description}
                </div>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

interface PatientBodyModelProps {
  heatPoints: HeatPoint[];
  height?: string;
  selectedZoneLabel?: string;
  onSelectZone?: (hp: HeatPoint | null) => void;
  positionOffset?: [number, number, number];
}

export const PatientBodyModel: React.FC<PatientBodyModelProps> = ({ 
  heatPoints, 
  height = '400px',
  selectedZoneLabel,
  onSelectZone,
  positionOffset = DEFAULT_MODEL_OFFSET
}) => {
  const [localSelectedZone, setLocalSelectedZone] = useState<HeatPoint | null>(null);

  const activeSelectedZone = selectedZoneLabel
    ? (heatPoints.find(hp => hp.label === selectedZoneLabel) || null)
    : localSelectedZone;

  const [cursorState, setCursorState] = useState<'default' | 'grabbing' | 'pointer'>('default');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (hp: HeatPoint | null) => {
    if (onSelectZone) {
      onSelectZone(hp);
    } else {
      setLocalSelectedZone(hp);
    }
  };

  const centerOffsetRef = useRef(new THREE.Vector3(0, 0, 0));
  const modelScaleRef = useRef(1.0);

  const activeHeatpoints = useMemo(() => {
    return heatPoints.slice(0, SHADER_POINTS_COUNT);
  }, [heatPoints]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovering(true);
        setCursorState('default');
      }}
      onMouseLeave={() => {
        setIsHovering(false);
      }}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: height, 
        backgroundColor: '#020617', // ALWAYS dark terminal background in all themes
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid rgba(255, 255, 255, 0.08)', // subtle dark border
        overflow: 'hidden',
        cursor: 'none' // Hide standard cursor
      }}
    >
      <Canvas camera={{ position: [0, 0.2, 5.0], fov: 42 }}>
        <ambientLight intensity={0.7} />
        
        {/* Shading spotlights */}
        <directionalLight position={[3, 5, 3]} intensity={1.0} />
        <directionalLight position={[-3, 2, -3]} intensity={0.5} />

        <GLTFErrorBoundary fallback={
          <MannequinFallback 
            heatPoints={activeHeatpoints} 
            onZoneClick={handleSelect} 
            selectedZoneLabel={activeSelectedZone?.label}
            setCursorState={setCursorState}
            positionOffset={positionOffset}
          />
        }>
          <React.Suspense fallback={<Html center><LoadingSpinner /></Html>}>
            <ModelWrapper 
              heatPoints={activeHeatpoints} 
              onZoneClick={handleSelect}
              centerOffsetRef={centerOffsetRef}
              modelScaleRef={modelScaleRef}
              selectedZoneLabel={activeSelectedZone?.label}
              setCursorState={setCursorState}
              positionOffset={positionOffset}
            />
          </React.Suspense>
        </GLTFErrorBoundary>
        
        <OrbitControls 
          enablePan={false}
          minDistance={6.0}
          maxDistance={5.0}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 2 - 0.2}
          target={positionOffset}
          onStart={() => {
            setCursorState('grabbing');
          }}
          onEnd={() => {
            setCursorState('default');
          }}
        />
      </Canvas>

      {/* Custom Follower Cursor */}
      {isHovering && (
        <div 
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {/* Custom Cursor Outer Ring Container */}
          <div 
            style={{
              position: 'absolute',
              left: mousePos.x,
              top: mousePos.y,
              transform: 'translate(-50%, -50%)',
              width: cursorState === 'grabbing' ? '18px' : cursorState === 'pointer' ? '44px' : '28px',
              height: cursorState === 'grabbing' ? '18px' : cursorState === 'pointer' ? '44px' : '28px',
              transition: 'width 0.25s cubic-bezier(0.25, 1, 0.5, 1), height 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
              pointerEvents: 'none',
            }}
          >
            <div 
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: cursorState === 'grabbing' 
                  ? '2px solid #2dd4bf' 
                  : cursorState === 'pointer' 
                  ? '1.5px dashed #f472b6' 
                  : '1.5px solid #38bdf8',
                boxShadow: cursorState === 'grabbing'
                  ? '0 0 12px rgba(45, 212, 191, 0.6)'
                  : cursorState === 'pointer'
                  ? '0 0 15px rgba(244, 114, 182, 0.8)'
                  : '0 0 8px rgba(56, 189, 248, 0.4)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                animation: cursorState === 'pointer' ? 'cursorSpin 6s linear infinite' : undefined,
              }}
            />
          </div>
          {/* Custom Cursor Inner Dot */}
          <div 
            style={{
              position: 'absolute',
              left: mousePos.x,
              top: mousePos.y,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              pointerEvents: 'none',
              transition: 'width 0.25s cubic-bezier(0.25, 1, 0.5, 1), height 0.25s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.2s ease',
              width: cursorState === 'grabbing' ? '4px' : cursorState === 'pointer' ? '8px' : '6px',
              height: cursorState === 'grabbing' ? '4px' : cursorState === 'pointer' ? '8px' : '6px',
              backgroundColor: cursorState === 'grabbing' 
                ? '#2dd4bf' 
                : cursorState === 'pointer' 
                ? '#f472b6' 
                : '#38bdf8',
            }}
          />
        </div>
      )}

      {/* Raycast Callout Overlay */}
      {activeSelectedZone ? (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.95)', // dark overlay
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: 'fadeIn 0.2s ease-out',
            cursor: 'auto' // Restore default cursor for text interactions
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
              🎯 {activeSelectedZone.label}
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {activeSelectedZone.description}
            </span>
          </div>
          <button
            onClick={() => handleSelect(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <div style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '11px', color: '#94a3b8', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.08)', pointerEvents: 'none', fontWeight: 600 }}>
          💡 Drag to rotate | Scroll to zoom | Click hotspots
        </div>
      )}
      <style>{`
        @keyframes ping {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes cursorSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PatientBodyModel;
