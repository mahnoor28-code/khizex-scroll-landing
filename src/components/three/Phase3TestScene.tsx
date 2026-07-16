import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Mesh } from "three";

/**
 * PHASE 3 TEST COMPONENT — not the final shoe model, just a plain box
 * to confirm the fundamentals work: Canvas mounts, lighting shows the
 * object, camera sees it, and OrbitControls lets you drag to look
 * around. This gets deleted/replaced once the real .glb loads (Phase 4)
 * and once scroll takes over camera/object control (Phase 5+, at which
 * point OrbitControls comes OUT — scroll and mouse-drag can't both own
 * the camera at once).
 */
function SpinningBox(): React.ReactElement {
  const meshRef = useRef<Mesh>(null);

  // useFrame runs on every render-loop tick (~60x/sec). `delta` is the
  // time in seconds since the last frame — multiplying by delta (instead
  // of just incrementing a fixed number) keeps rotation speed consistent
  // regardless of the device's actual frame rate.
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#e8622c" />
    </mesh>
  );
}

export default function Phase3TestScene(): React.ReactElement {
  return (
    <Canvas camera={{ position: [2, 2, 3], fov: 45 }}>
      {/* Ambient = fills in shadows everywhere so nothing goes pure black. */}
      <ambientLight intensity={0.5} />
      {/* Directional = acts like a sun, gives the box visible shading. */}
      <directionalLight position={[3, 4, 2]} intensity={1} />
      <SpinningBox />
      {/* Drag to orbit — this is a TEMPORARY testing aid, removed later. */}
      <OrbitControls />
    </Canvas>
  );
}
