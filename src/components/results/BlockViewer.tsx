import { useMemo, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { SolverResult } from '../../types/solver';

interface BlockViewerProps {
  result: SolverResult;
  selectedPeriod: number | 'all';
}

interface VoxelBlock {
  id: number;
  x: number;
  y: number;
  z: number;
  color: string;
}

interface ScheduleItem {
  block_id: number;
  time_period: number;
  value?: number;
}

function getGradientColor(value: number, minVal: number, maxVal: number): string {
  if (maxVal === minVal) return '#64748b';

  if (value < 0) {
    const ratio = value / (minVal || -1); 
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const r = Math.round(0xef + (0x64 - 0xef) * (1 - clampedRatio));
    const g = Math.round(0x44 + (0x74 - 0x44) * (1 - clampedRatio));
    const b = Math.round(0x44 + (0x8b - 0x44) * (1 - clampedRatio));
    return `rgb(${r},${g},${b})`;
  } else {
    const ratio = value / (maxVal || 1); 
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const r = Math.round(0x38 + (0x1d - 0x38) * clampedRatio);
    const g = Math.round(0xbd + (0x4e - 0xbd) * clampedRatio);
    const b = Math.round(0xf8 + (0xd8 - 0xf8) * clampedRatio);
    return `rgb(${r},${g},${b})`;
  }
}

function VoxelMesh({ x, y, z, color }: { x: number; y: number; z: number; color: string }) {
  return (
    <mesh position={[x, z, y]}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  );
}

function AutoCameraCenter({ trigger, controlsRef }: { trigger: number; controlsRef: React.RefObject<any> }) {
  const { camera, scene } = useThree();

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    
    box.getCenter(center);
    box.getSize(size);

    if (size.length() > 0) {
      const maxDim = Math.max(size.x, size.y, size.z);
      camera.position.set(center.x + maxDim, center.y + maxDim, center.z + maxDim * 1.5);
      camera.lookAt(center);
      
      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }
    }
  }, [scene, camera, trigger, controlsRef]);

  return null;
}

export function BlockViewer({ result, selectedPeriod }: BlockViewerProps) {
  const leftControlsRef = useRef<any>(null);
  const rightControlsRef = useRef<any>(null);

  if (!result.coordinates || !result.output) return null;

  const data = useMemo(() => {
    const coordsMap = result.coordinates!;
    const scheduleItems = result.output as ScheduleItem[];

    // 1. Establish absolute uniform global value boundaries
    let minVal = 0;
    let maxVal = 0;
    scheduleItems.forEach((item) => {
      if (item.value !== undefined) {
        if (item.value < minVal) minVal = item.value;
        if (item.value > maxVal) maxVal = item.value;
      }
    });

    const targetPeriod = selectedPeriod === 'all' ? 0 : selectedPeriod;

    // 2. LEFT CANVAS: Blocks scheduled for FUTURE periods (Not mined in this phase)
    const leftBlocks = scheduleItems
      .filter((item) => selectedPeriod !== 'all' && item.time_period > targetPeriod)
      .map((item): VoxelBlock | null => {
        const blockSpatial = coordsMap[item.block_id];
        if (blockSpatial) {
          return {
            id: item.block_id,
            x: blockSpatial.x,
            y: blockSpatial.y,
            z: blockSpatial.z,
            color: getGradientColor(item.value !== undefined ? item.value : 0, minVal, maxVal),
          };
        }
        return null;
      })
      .filter((b): b is VoxelBlock => b !== null);

    // 3. RIGHT CANVAS: Blocks scheduled exactly inside CURRENT period (Mined in this phase)
    const rightBlocks = scheduleItems
      .filter((item) => selectedPeriod === 'all' || item.time_period === targetPeriod)
      .map((item): VoxelBlock | null => {
        const blockSpatial = coordsMap[item.block_id];
        if (blockSpatial) {
          return {
            id: item.block_id,
            x: blockSpatial.x,
            y: blockSpatial.y,
            z: blockSpatial.z,
            color: getGradientColor(item.value !== undefined ? item.value : 0, minVal, maxVal),
          };
        }
        return null;
      })
      .filter((b): b is VoxelBlock => b !== null);

    return { leftBlocks, rightBlocks, minVal, maxVal };
  }, [result, selectedPeriod]);

  return (
    <div className="space-y-4 w-full">
      <div className="w-full bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <p className="text-sm font-semibold text-slate-200">
            Timeline Period Filter: {selectedPeriod === 'all' ? 'Complete Schedule' : `Period Horizon ${selectedPeriod}`}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Remaining Mine Reserve (Left View): <span className="text-amber-400 font-medium">{data.leftBlocks.length.toLocaleString()}</span> blocks | Active Extraction Slice (Right View): <span className="text-sky-400 font-medium">{data.rightBlocks.length.toLocaleString()}</span> blocks
          </p>
        </div>
        <div className="space-y-1 w-full md:w-64 shrink-0">
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Value Heatmap Scale</p>
          <div className="h-2 w-full rounded bg-gradient-to-r from-red-500 via-slate-500 via-sky-400 to-blue-700 border border-slate-700" />
          <div className="flex justify-between text-[9px] font-mono text-slate-300 px-0.5">
            <span>Min: {Math.round(data.minVal)}</span>
            <span>Max: {Math.round(data.maxVal)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Left Side: Unmined Future Horizon */}
        <div className="relative h-[450px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
          <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur px-2.5 py-1.5 rounded border border-slate-700 shadow-md">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Not Mined (Future Reserves)</span>
          </div>
          <Canvas camera={{ position: [100, 100, 100], fov: 50 }}>
            <ambientLight intensity={0.7} />
            <pointLight position={[100000, 100000, 100000]} intensity={0.8} />
            <directionalLight position={[-50000, 50000, -50000]} intensity={0.5} />
            <group> 
              {data.leftBlocks.map((b) => (
                <VoxelMesh key={b.id} x={b.x} y={b.y} z={b.z} color={b.color} />
              ))}
            </group>
            <AutoCameraCenter trigger={data.leftBlocks.length} controlsRef={leftControlsRef} />
            <OrbitControls ref={leftControlsRef} enablePan={true} enableZoom={true} />
          </Canvas>
        </div>

        {/* Right Side: Active Period Extraction */}
        <div className="relative h-[450px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
          <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur px-2.5 py-1.5 rounded border border-slate-700 shadow-md">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Mined This Period</span>
          </div>
          <Canvas camera={{ position: [100, 100, 100], fov: 50 }}>
            <ambientLight intensity={0.7} />
            <pointLight position={[100000, 100000, 100000]} intensity={0.8} />
            <directionalLight position={[-50000, 50000, -50000]} intensity={0.5} />
            <group> 
              {data.rightBlocks.map((b) => (
                <VoxelMesh key={b.id} x={b.x} y={b.y} z={b.z} color={b.color} />
              ))}
            </group>
            <AutoCameraCenter trigger={data.rightBlocks.length} controlsRef={rightControlsRef} />
            <OrbitControls ref={rightControlsRef} enablePan={true} enableZoom={true} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}