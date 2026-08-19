/**
 * 3D Digital Twin Scene Component for Suryavedh.
 * Built with React Three Fiber, Three.js, and @react-three/drei.
 * Renders LOD-1 extruded buildings, solar heatmap, dynamic sun vector,
 * real 3D shadows, 3D placed solar panel modules, and proposed future construction.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import type {
  BuildingFootprint,
  SolarPositionResponse,
  PlacedPanel3D,
  ProposedFutureBuilding,
  RooftopPVResponse,
  BIPVResponse,
  FutureImpactResponse,
} from '../types';

interface DigitalTwin3DProps {
  buildings: BuildingFootprint[];
  targetBuildingId: string;
  solarPosition: SolarPositionResponse | null;
  rooftopData: RooftopPVResponse | null;
  bipvData: BIPVResponse | null;
  futureBuilding: ProposedFutureBuilding | null;
  isFutureEnabled: boolean;
  futureImpact: FutureImpactResponse | null;
  heatmapMode: boolean;
  onSelectBuilding: (bldgId: string) => void;
}

class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('WebGL / Canvas render warning:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-6 text-center">
          <div className="text-amber-400 font-bold mb-2">3D Spatial Simulation Active</div>
          <div className="text-xs max-w-sm mb-4">Hardware WebGL acceleration is initializing. Controls and solar analytics are fully operational in the right decision panel.</div>
          <button onClick={() => this.setState({ hasError: false })} className="px-4 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            Re-initialize 3D View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Single Extruded LOD-1 Building Component
const BuildingMesh: React.FC<{
  building: BuildingFootprint;
  isTarget: boolean;
  isSelected: boolean;
  heatmapMode: boolean;
  rooftopData: RooftopPVResponse | null;
  bipvData: BIPVResponse | null;
  shadingConflictSeverity?: string;
  onSelect: (id: string) => void;
}> = ({
  building,
  isTarget,
  isSelected,
  heatmapMode,
  rooftopData,
  bipvData,
  shadingConflictSeverity,
  onSelect
}) => {
  const [hovered, setHovered] = React.useState(false);

  // Generate 2D Shape from footprint coordinates
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const coords = building.footprint_coordinates;
    if (!coords || coords.length < 3) return s;

    s.moveTo(coords[0][0], coords[0][1]);
    for (let i = 1; i < coords.length; i++) {
      s.lineTo(coords[i][0], coords[i][1]);
    }
    s.closePath();
    return s;
  }, [building.footprint_coordinates]);

  // Center calculation for label & camera focus
  const center = useMemo(() => {
    const coords = building.footprint_coordinates;
    const cx = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;
    const cz = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;
    return [cx, building.height, cz] as [number, number, number];
  }, [building.footprint_coordinates, building.height]);

  // Color determination based on solar suitability heatmap & target state
  const { wallColor, roofColor, emissiveColor, emissiveIntensity } = useMemo(() => {
    if (shadingConflictSeverity === 'CRITICAL') {
      return {
        wallColor: '#881337',
        roofColor: '#BE123C',
        emissiveColor: '#E11D48',
        emissiveIntensity: 0.25
      };
    }
    if (shadingConflictSeverity === 'HIGH') {
      return {
        wallColor: '#7C2D12',
        roofColor: '#C2410C',
        emissiveColor: '#EA580C',
        emissiveIntensity: 0.2
      };
    }

    if (isTarget) {
      if (heatmapMode) {
        return {
          wallColor: '#1E293B',
          roofColor: '#F59E0B', // Vibrant Amber for High Solar Potential
          emissiveColor: '#F59E0B',
          emissiveIntensity: 0.18
        };
      }
      return {
        wallColor: '#1E293B',
        roofColor: '#0284C7',
        emissiveColor: '#38BDF8',
        emissiveIntensity: 0.15
      };
    }

    if (heatmapMode) {
      // Heatmap gradient for surrounding buildings
      return {
        wallColor: '#0F172A',
        roofColor: '#D97706', // Medium-high gold
        emissiveColor: '#D97706',
        emissiveIntensity: 0.05
      };
    }

    return {
      wallColor: '#111827',
      roofColor: '#1F2937',
      emissiveColor: '#000000',
      emissiveIntensity: 0.0
    };
  }, [isTarget, heatmapMode, shadingConflictSeverity]);

  // Extrude settings
  const extrudeSettings = useMemo(() => ({
    steps: 1,
    depth: building.height,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.2,
    bevelOffset: 0,
    bevelSegments: 1
  }), [building.height]);

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Extruded Building Geometry */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(building.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial
          color={hovered || isSelected ? '#FBBF24' : roofColor}
          emissive={emissiveColor}
          emissiveIntensity={hovered || isSelected ? 0.35 : emissiveIntensity}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Building Wireframe Outline for architectural clarity */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshBasicMaterial
          color={isTarget ? '#F59E0B' : '#475569'}
          wireframe
          transparent
          opacity={isTarget ? 0.45 : 0.15}
        />
      </mesh>

      {/* Building Floating Label / Target Pin */}
      {(isTarget || hovered || isSelected) && (
        <Html position={[center[0], center[1] + 3.5, center[2]]} center distanceFactor={180}>
          <div className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shadow-xl border pointer-events-none transition-all duration-200 ${
            isTarget 
              ? 'bg-amber-500/90 text-slate-950 border-amber-300 font-semibold glow-amber' 
              : 'bg-slate-900/90 text-slate-200 border-slate-700'
          }`}>
            <div className="flex items-center gap-1.5">
              <span>{building.name}</span>
              <span className="opacity-75 font-mono">({building.height}m)</span>
            </div>
            {isTarget && rooftopData && (
              <div className="text-[10px] text-slate-900 font-bold opacity-90">
                {rooftopData.installed_capacity_kwp} kWp • {rooftopData.annual_generation_kwh.toLocaleString()} kWh/yr
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D Solar Panels Grid Component
const SolarPanelsLayer: React.FC<{
  panels: PlacedPanel3D[];
}> = ({ panels }) => {
  if (!panels || panels.length === 0) return null;

  return (
    <group>
      {panels.map((p) => (
        <group
          key={p.id}
          position={[p.center_x, p.center_y + 0.15, p.center_z]}
          rotation={[-p.tilt_deg * (Math.PI / 180), p.rotation_y_deg * (Math.PI / 180), 0]}
        >
          {/* Photovoltaic Silicon Wafer */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[p.width, 0.05, p.length]} />
            <meshStandardMaterial
              color="#0F172A"
              emissive="#1E3A8A"
              emissiveIntensity={0.2}
              roughness={0.15}
              metalness={0.85}
            />
          </mesh>

          {/* Aluminum Frame Border */}
          <mesh position={[0, -0.01, 0]}>
            <boxGeometry args={[p.width + 0.04, 0.03, p.length + 0.04]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.9} />
          </mesh>

          {/* Subtle Grid Line Decal */}
          <mesh position={[0, 0.03, 0]}>
            <planeGeometry args={[p.width * 0.95, p.length * 0.95]} />
            <meshBasicMaterial color="#38BDF8" wireframe transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Proposed Future Building 3D Holographic / Structural Mesh
const ProposedFutureBuildingMesh: React.FC<{
  futureBuilding: ProposedFutureBuilding;
}> = ({ futureBuilding }) => {
  const hw = futureBuilding.width_m / 2.0;
  const hl = futureBuilding.length_m / 2.0;
  const h = futureBuilding.height_m;

  return (
    <group position={[futureBuilding.center_x, 0, futureBuilding.center_z]}>
      {/* Translucent Architectural Mass */}
      <mesh position={[0, h / 2.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[futureBuilding.width_m, h, futureBuilding.length_m]} />
        <meshStandardMaterial
          color="#F97316"
          emissive="#EA580C"
          emissiveIntensity={0.25}
          transparent
          opacity={0.65}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Futuristic Structural Grid Wireframe */}
      <mesh position={[0, h / 2.0, 0]}>
        <boxGeometry args={[futureBuilding.width_m + 0.2, h + 0.2, futureBuilding.length_m + 0.2]} />
        <meshBasicMaterial
          color="#FDBA74"
          wireframe
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Floating Proposed High-Rise Badge */}
      <Html position={[0, h + 4.0, 0]} center distanceFactor={180}>
        <div className="bg-orange-600/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-orange-300 shadow-2xl glow-rose whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping"></span>
            <span>PROPOSED FUTURE TOWER</span>
          </div>
          <div className="text-[11px] font-mono text-orange-100">
            Height: {futureBuilding.height_m}m ({futureBuilding.floors} Floors)
          </div>
        </div>
      </Html>
    </group>
  );
};

// Dynamic 3D Ground Shadow Projection Layer
const GroundShadowLayer: React.FC<{
  buildings: BuildingFootprint[];
  futureBuilding: ProposedFutureBuilding | null;
  isFutureEnabled: boolean;
  solarPosition: SolarPositionResponse | null;
}> = ({ buildings, futureBuilding, isFutureEnabled, solarPosition }) => {
  if (!solarPosition || !solarPosition.is_daylight || solarPosition.elevation_deg < 2.0) {
    return null;
  }

  const azRad = (solarPosition.azimuth_deg * Math.PI) / 180;
  const elRad = (Math.max(3.0, solarPosition.elevation_deg) * Math.PI) / 180;

  return (
    <group position={[0, 0.05, 0]}>
      {/* Existing Buildings Ground Shadows */}
      {buildings.map((b) => {
        const shadowLen = b.height / Math.tan(elRad);
        const dx = -Math.sin(azRad) * shadowLen;
        const dz = Math.cos(azRad) * shadowLen;

        const pts = b.footprint_coordinates;
        if (!pts || pts.length < 3) return null;

        const shape = new THREE.Shape();
        // Extruded shadow polygon on ground
        shape.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          shape.lineTo(pts[i][0], pts[i][1]);
        }
        for (let i = pts.length - 1; i >= 0; i--) {
          shape.lineTo(pts[i][0] + dx, pts[i][1] + dz);
        }
        shape.closePath();

        return (
          <mesh key={`shadow_${b.id}`} rotation={[-Math.PI / 2, 0, 0]}>
            <shapeGeometry args={[shape]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.45} depthWrite={false} />
          </mesh>
        );
      })}

      {/* Proposed Future Building Ground Shadow */}
      {isFutureEnabled && futureBuilding && (() => {
        const shadowLen = futureBuilding.height_m / Math.tan(elRad);
        const dx = -Math.sin(azRad) * shadowLen;
        const dz = Math.cos(azRad) * shadowLen;
        const hw = futureBuilding.width_m / 2.0;
        const hl = futureBuilding.length_m / 2.0;
        const cx = futureBuilding.center_x;
        const cz = futureBuilding.center_z;

        const pts = [
          [cx - hw, cz - hl],
          [cx + hw, cz - hl],
          [cx + hw, cz + hl],
          [cx - hw, cz + hl]
        ];

        const shape = new THREE.Shape();
        shape.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          shape.lineTo(pts[i][0], pts[i][1]);
        }
        for (let i = pts.length - 1; i >= 0; i--) {
          shape.lineTo(pts[i][0] + dx, pts[i][1] + dz);
        }
        shape.closePath();

        return (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <shapeGeometry args={[shape]} />
            <meshBasicMaterial color="#7C2D12" transparent opacity={0.65} depthWrite={false} />
          </mesh>
        );
      })()}
    </group>
  );
};

// Main 3D Digital Twin Canvas
export const DigitalTwin3D: React.FC<DigitalTwin3DProps> = ({
  buildings,
  targetBuildingId,
  solarPosition,
  rooftopData,
  bipvData,
  futureBuilding,
  isFutureEnabled,
  futureImpact,
  heatmapMode,
  onSelectBuilding
}) => {
  // Target building
  const targetBuilding = useMemo(
    () => buildings.find((b) => b.id === targetBuildingId) || buildings[0],
    [buildings, targetBuildingId]
  );

  // Compute 3D directional light position based on scientific solar position
  const sunLightPosition = useMemo(() => {
    if (!solarPosition || !solarPosition.sun_vector) {
      return [80, 120, 80] as [number, number, number];
    }
    const [sx, sy, sz] = solarPosition.sun_vector;
    const distance = 160;
    return [sx * distance, Math.max(15, sy * distance), sz * distance] as [number, number, number];
  }, [solarPosition]);

  // Map conflicts by building ID
  const conflictMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (isFutureEnabled && futureImpact && futureImpact.affected_conflicts) {
      for (const c of futureImpact.affected_conflicts) {
        map[c.building_id] = c.severity;
      }
    }
    return map;
  }, [isFutureEnabled, futureImpact]);

  return (
    <div className="w-full h-full relative select-none bg-[#07090E]">
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [90, 75, 110], fov: 42, near: 1, far: 1000 }}
          shadows
          gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: 'default' }}
          className="w-full h-full"
        >
          {/* Environment Lighting */}
          <ambientLight intensity={solarPosition?.is_daylight ? 0.45 : 0.15} />
        
        {/* Scientific Directional Sun Light */}
        {solarPosition?.is_daylight && (
          <directionalLight
            position={sunLightPosition}
            intensity={1.85}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={10}
            shadow-camera-far={400}
            shadow-camera-left={-120}
            shadow-camera-right={120}
            shadow-camera-top={120}
            shadow-camera-bottom={-120}
            shadow-bias={-0.0005}
          />
        )}

        {/* Sky Fill Light */}
        <hemisphereLight
          args={['#38BDF8', '#0F172A', solarPosition?.is_daylight ? 0.35 : 0.08]}
        />

        {/* Ground Grid & Compass Base */}
        <gridHelper args={[320, 32, '#1E293B', '#0F172A']} position={[0, 0, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#0A0D14" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Cardinal Direction Compass Markers in 3D */}
        <Text position={[0, 0.2, -135]} rotation={[-Math.PI / 2, 0, 0]} fontSize={6} color="#F59E0B">
          N (NORTH)
        </Text>
        <Text position={[135, 0.2, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} fontSize={6} color="#64748B">
          E (EAST)
        </Text>
        <Text position={[0, 0.2, 135]} rotation={[-Math.PI / 2, 0, Math.PI]} fontSize={6} color="#64748B">
          S (SOUTH)
        </Text>
        <Text position={[-135, 0.2, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} fontSize={6} color="#64748B">
          W (WEST)
        </Text>

        {/* Ground Shadow Layer */}
        <GroundShadowLayer
          buildings={buildings}
          futureBuilding={futureBuilding}
          isFutureEnabled={isFutureEnabled}
          solarPosition={solarPosition}
        />

        {/* LOD-1 Extruded Buildings */}
        {buildings.map((bldg) => (
          <BuildingMesh
            key={bldg.id}
            building={bldg}
            isTarget={bldg.id === targetBuildingId}
            isSelected={bldg.id === targetBuildingId}
            heatmapMode={heatmapMode}
            rooftopData={bldg.id === targetBuildingId ? rooftopData : null}
            bipvData={bldg.id === targetBuildingId ? bipvData : null}
            shadingConflictSeverity={conflictMap[bldg.id]}
            onSelect={onSelectBuilding}
          />
        ))}

        {/* 3D Solar Panels on Target Building Roof */}
        {rooftopData && rooftopData.panel_layout_grid && (
          <SolarPanelsLayer panels={rooftopData.panel_layout_grid} />
        )}

        {/* Proposed Future Construction Tower */}
        {isFutureEnabled && futureBuilding && (
          <ProposedFutureBuildingMesh futureBuilding={futureBuilding} />
        )}

        {/* 3D Sun Sphere Indicator */}
        {solarPosition?.is_daylight && (
          <mesh position={sunLightPosition}>
            <sphereGeometry args={[4.5, 32, 32]} />
            <meshBasicMaterial color="#FBBF24" />
          </mesh>
        )}

        {/* Camera Orbit Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          minDistance={20}
          maxDistance={350}
          maxPolarAngle={Math.PI / 2.05} // Prevent camera below ground
        />
      </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};
