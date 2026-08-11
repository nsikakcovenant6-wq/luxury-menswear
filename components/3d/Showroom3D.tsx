"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float } from "@react-three/drei";

function SuitPlaceholder() {
  return (
    <Float speed={2} rotationIntensity={1}>
      <mesh castShadow>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial
          color="#111111"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function Showroom3D() {
  return (
    <div className="w-full h-[700px] rounded-3xl overflow-hidden">

      <Canvas shadows camera={{ position: [0, 2, 6], fov: 45 }}>

        <ambientLight intensity={1} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={4}
          castShadow
        />

        <SuitPlaceholder />

        <Environment preset="city" />

        <OrbitControls
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
        />

      </Canvas>

    </div>
  );
}