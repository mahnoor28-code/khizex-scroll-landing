import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import { getAnimationStateAt } from "../../config/scrollTimeline";
import type { ScrollProgressStore } from "../../hooks/useScrollProgress";

const MODEL_URL = "/models/product.glb";

function ProductModel(): React.ReactElement {
  const { scene } = useGLTF(MODEL_URL);

  const normalized = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDimension = Math.max(size.x, size.y, size.z, 0.0001);
    const targetSize = 1.6;
    const scale = targetSize / maxDimension;

    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    clone.scale.setScalar(scale);
    return clone;
  }, [scene]);

  return <primitive object={normalized} />;
}

interface ScrollDrivenRigProps {
  progressRef: React.RefObject<ScrollProgressStore>;
}

/**
 * Reads the GSAP-driven progress value every frame (via useFrame, which
 * already runs on R3F's render loop) and applies the interpolated
 * rotation/camera state from the typed timeline config. This is the
 * bridge between "GSAP knows the scroll progress" and "Three.js knows
 * what that should look like."
 */
function ScrollDrivenRig({ progressRef }: ScrollDrivenRigProps): React.ReactElement {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    const progress = progressRef.current?.progress ?? 0;
    const { rotationY, positionY, cameraZ } = getAnimationStateAt(progress);

    if (groupRef.current) {
      groupRef.current.rotation.y = rotationY;
      groupRef.current.position.y = positionY;
    }
    camera.position.z = cameraZ;
  });

  return (
    <group ref={groupRef}>
      <ProductModel />
    </group>
  );
}

function LoadingPlaceholder(): React.ReactElement {
  return (
    <mesh>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshBasicMaterial color="#3a3a3a" wireframe />
    </mesh>
  );
}

interface Phase6ProductSceneProps {
  progressRef: React.RefObject<ScrollProgressStore>;
}

export default function Phase6ProductScene({ progressRef }: Phase6ProductSceneProps): React.ReactElement {
  return (
    <Canvas camera={{ position: [2, 1.5, 3.2], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} />
      <Suspense fallback={<LoadingPlaceholder />}>
        <ScrollDrivenRig progressRef={progressRef} />
        <Environment preset="city" />
      </Suspense>
      {/* No OrbitControls anymore — scroll now owns the camera/model. */}
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
