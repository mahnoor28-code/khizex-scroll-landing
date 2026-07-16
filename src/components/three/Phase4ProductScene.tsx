import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/product.glb";

/**
 * Loads the real .glb and normalizes it — real-world models rarely
 * arrive pre-centered at the origin or sized to fit our camera framing,
 * so we measure the model's bounding box and rescale/reposition it to
 * fit consistently. Same pattern used in the KHIZEX shoe store project.
 */
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

/**
 * Shown INSIDE the Canvas while the real .glb is still downloading —
 * Suspense fallbacks inside a <Canvas> must themselves be 3D objects
 * (meshes), not plain HTML, since everything inside <Canvas> renders
 * through WebGL, not the regular DOM.
 */
function LoadingPlaceholder(): React.ReactElement {
  return (
    <mesh>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshBasicMaterial color="#3a3a3a" wireframe />
    </mesh>
  );
}

export default function Phase4ProductScene(): React.ReactElement {
  return (
    <Canvas camera={{ position: [2, 1.5, 3], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} />
      <Suspense fallback={<LoadingPlaceholder />}>
        <ProductModel />
        <Environment preset="city" />
      </Suspense>
      {/* Still testing with mouse-drag for now — comes OUT once scroll
          takes over the camera in Phase 5+. */}
      <OrbitControls />
    </Canvas>
  );
}

// Preload so the browser starts fetching the model as soon as this
// module is imported, rather than waiting for first render.
useGLTF.preload(MODEL_URL);
